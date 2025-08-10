import { Controller, Param, Patch } from '@nestjs/common';
import { IdDto } from 'src/common/dto/id.dto';
import { ReservationStatusesService } from '../services/reservation-statuses.service';

@Controller('reservation/status')
export class ReservationStatusController {
  constructor(
    private readonly reservationStatusesService: ReservationStatusesService,
  ) {}

  @Patch(':id/confirm')
  async confirmReservation(@Param() param: IdDto) {
    return await this.reservationStatusesService.confirmedReservation(param.id);
  }

  @Patch(':id/seat')
  async seatGuests(@Param() param: IdDto) {
    return await this.reservationStatusesService.seatedReservation(param.id);
  }

  @Patch(':id/complete')
  async completeReservation(@Param() param: IdDto) {
    return await this.reservationStatusesService.completeReservation(param.id);
  }

  @Patch(':id/cancel')
  async cancelReservation(@Param() param: IdDto) {
    return await this.reservationStatusesService.cancelReservation(param.id);
  }

  @Patch(':id/no-show')
  async markNoShow(@Param() param: IdDto) {
    return await this.reservationStatusesService.markNoShow(param.id);
  }
}
