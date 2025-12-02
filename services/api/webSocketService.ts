import { io, Socket } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

class WebSocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  connect(): void {
    const token = localStorage.getItem('accessToken');
    
    if (!token) {
      console.warn('No access token found. Cannot connect to WebSocket.');
      return;
    }

    this.socket = io(`${SOCKET_URL}/realtime`, {
      auth: {
        token,
      },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: this.maxReconnectAttempts,
    });

    this.socket.on('connect', () => {
      console.log('✅ WebSocket connected');
      this.reconnectAttempts = 0;
    });

    this.socket.on('disconnect', (reason) => {
      console.log('⚠️ WebSocket disconnected:', reason);
    });

    this.socket.on('connect_error', (error) => {
      console.error('❌ WebSocket connection error:', error);
      this.reconnectAttempts++;
      
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error('Max reconnection attempts reached');
        this.socket?.close();
      }
    });

    this.socket.on('error', (error) => {
      console.error('❌ WebSocket error:', error);
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // Ride events
  onRideCreated(callback: (data: any) => void): void {
    this.socket?.on('ride:created', callback);
  }

  onRideUpdated(callback: (data: any) => void): void {
    this.socket?.on('ride:updated', callback);
  }

  onRideStatusUpdated(callback: (data: any) => void): void {
    this.socket?.on('ride:status:updated', callback);
  }

  onRideAssigned(callback: (data: any) => void): void {
    this.socket?.on('ride:assigned', callback);
  }

  // Driver events
  onDriverLocationUpdated(callback: (data: any) => void): void {
    this.socket?.on('driver:location:updated', callback);
  }

  onDriverStatusUpdated(callback: (data: any) => void): void {
    this.socket?.on('driver:status:updated', callback);
  }

  // Emit events
  updateRideStatus(data: { rideId: string; status: string; message?: string }): void {
    this.socket?.emit('ride:status:update', data);
  }

  updateDriverLocation(data: { driverId: string; lat: number; lng: number; heading?: number; speed?: number }): void {
    this.socket?.emit('driver:location:update', data);
  }

  sendMessage(data: { recipientId: string; message: string }): void {
    this.socket?.emit('message:send', data);
  }

  // Clean up listeners
  removeAllListeners(): void {
    this.socket?.removeAllListeners();
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }
}

export const webSocketService = new WebSocketService();
export default webSocketService;
