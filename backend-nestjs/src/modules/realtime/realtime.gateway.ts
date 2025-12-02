import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, UseGuards } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../common/prisma/prisma.service';

@WebSocketGateway({
  cors: {
    origin: '*',
    credentials: true,
  },
  namespace: '/realtime',
})
export class RealtimeGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(RealtimeGateway.name);
  private connectedClients = new Map<string, { companyId: string; userId: string; role: string }>();

  constructor(
    private jwtService: JwtService,
    private prisma: PrismaService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth.token || client.handshake.headers.authorization?.split(' ')[1];

      if (!token) {
        this.logger.warn(`Client ${client.id} disconnected: No token provided`);
        client.disconnect();
        return;
      }

      const payload = this.jwtService.verify(token);
      const { sub: userId, companyId, role } = payload;

      // Store client info
      this.connectedClients.set(client.id, { companyId, userId, role });

      // Join company room
      client.join(`company:${companyId}`);

      // Join role-specific room
      client.join(`company:${companyId}:${role.toLowerCase()}`);

      // Join user room
      client.join(`user:${userId}`);

      this.logger.log(`Client ${client.id} connected (User: ${userId}, Company: ${companyId}, Role: ${role})`);

      // Notify user connected
      client.emit('connected', {
        userId,
        companyId,
        role,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      this.logger.error(`Connection error for client ${client.id}: ${error.message}`);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    const clientInfo = this.connectedClients.get(client.id);
    if (clientInfo) {
      this.logger.log(`Client ${client.id} disconnected (User: ${clientInfo.userId})`);
      this.connectedClients.delete(client.id);
    }
  }

  // Location Updates
  @SubscribeMessage('driver:location:update')
  async handleLocationUpdate(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { driverId: string; latitude: number; longitude: number },
  ) {
    const clientInfo = this.connectedClients.get(client.id);
    if (!clientInfo) return;

    try {
      // Update driver location in database
      await this.prisma.driver.update({
        where: { id: data.driverId },
        data: {
          currentLat: data.latitude,
          currentLng: data.longitude,
          lastLocationUpdate: new Date(),
        },
      });

      // Broadcast to company dispatchers and admins
      this.server
        .to(`company:${clientInfo.companyId}:dispatcher`)
        .to(`company:${clientInfo.companyId}:company_admin`)
        .emit('driver:location:updated', {
          driverId: data.driverId,
          latitude: data.latitude,
          longitude: data.longitude,
          timestamp: new Date().toISOString(),
        });
    } catch (error) {
      this.logger.error(`Failed to update driver location: ${error.message}`);
    }
  }

  // Ride Status Updates
  @SubscribeMessage('ride:status:update')
  async handleRideStatusUpdate(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { rideId: string; status: string; message?: string },
  ) {
    const clientInfo = this.connectedClients.get(client.id);
    if (!clientInfo) return;

    try {
      const ride = await this.prisma.ride.findUnique({
        where: { id: data.rideId },
        include: { driver: true },
      });

      if (!ride) {
        client.emit('error', { message: 'Ride not found' });
        return;
      }

      // Create ride event
      await this.prisma.rideEvent.create({
        data: {
          rideId: data.rideId,
          type: 'STATUS_CHANGED',
          description: data.message || `Status changed to ${data.status}`,
        },
      });

      // Broadcast to all relevant parties
      this.server.to(`company:${clientInfo.companyId}`).emit('ride:status:updated', {
        rideId: data.rideId,
        status: data.status,
        message: data.message,
        timestamp: new Date().toISOString(),
      });

      // Notify driver if assigned
      if (ride.driverId && ride.driver) {
        this.server.to(`user:${ride.driver.userId}`).emit('ride:status:updated', {
          rideId: data.rideId,
          status: data.status,
          message: data.message,
          timestamp: new Date().toISOString(),
        });
      }
    } catch (error) {
      this.logger.error(`Failed to update ride status: ${error.message}`);
      client.emit('error', { message: 'Failed to update ride status' });
    }
  }

  // Chat Messages
  @SubscribeMessage('chat:message:send')
  async handleChatMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { rideId: string; message: string; recipientId?: string },
  ) {
    const clientInfo = this.connectedClients.get(client.id);
    if (!clientInfo) return;

    const messageData = {
      rideId: data.rideId,
      senderId: clientInfo.userId,
      message: data.message,
      timestamp: new Date().toISOString(),
    };

    if (data.recipientId) {
      // Send to specific user
      this.server.to(`user:${data.recipientId}`).emit('chat:message:received', messageData);
    } else {
      // Broadcast to company
      this.server.to(`company:${clientInfo.companyId}`).emit('chat:message:received', messageData);
    }

    // Acknowledge sender
    client.emit('chat:message:sent', messageData);
  }

  // Driver Status Updates
  @SubscribeMessage('driver:status:update')
  async handleDriverStatusUpdate(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { driverId: string; status: string },
  ) {
    const clientInfo = this.connectedClients.get(client.id);
    if (!clientInfo) return;

    try {
      await this.prisma.driver.update({
        where: { id: data.driverId },
        data: { status: data.status as any },
      });

      // Broadcast to dispatchers
      this.server
        .to(`company:${clientInfo.companyId}:dispatcher`)
        .to(`company:${clientInfo.companyId}:company_admin`)
        .emit('driver:status:updated', {
          driverId: data.driverId,
          status: data.status,
          timestamp: new Date().toISOString(),
        });
    } catch (error) {
      this.logger.error(`Failed to update driver status: ${error.message}`);
    }
  }

  // Public method to emit events from other services
  emitToCompany(companyId: string, event: string, data: any) {
    this.server.to(`company:${companyId}`).emit(event, data);
  }

  emitToUser(userId: string, event: string, data: any) {
    this.server.to(`user:${userId}`).emit(event, data);
  }

  emitToRole(companyId: string, role: string, event: string, data: any) {
    this.server.to(`company:${companyId}:${role.toLowerCase()}`).emit(event, data);
  }
}
