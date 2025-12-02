import { Module, Global } from '@nestjs/common';
import { GoogleMapsService } from './services/google-maps.service';
import { SquareService } from './services/square.service';

@Global()
@Module({
  providers: [GoogleMapsService, SquareService],
  exports: [GoogleMapsService, SquareService],
})
export class IntegrationsModule {}
