import { Module } from '@nestjs/common';
import { ReservationStatusController } from './controllers/reservation-status.controller';
import { ReservationController } from './controllers/reservation.controller';
import { ReservationStatusesService } from './services/reservation-statuses.service';
import { ReservationService } from './services/reservation.service';

@Module({
  controllers: [ReservationController, ReservationStatusController],
  providers: [ReservationService, ReservationStatusesService],
  exports: [ReservationService],
})
export class ReservationModule {}
