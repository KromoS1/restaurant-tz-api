import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { IdDto } from 'src/common/dto/id.dto';
import { ReservationCreateDto, ReservationUpdateDto } from '../reservation.dto';
import { ReservationService } from '../services/reservation.service';

@Controller('reservation')
export class ReservationController {
  constructor(private readonly reservationsService: ReservationService) {}

  @Get(':id')
  async getReservationById(@Param() param: IdDto) {
    return await this.reservationsService.getReservationById(param.id);
  }

  @Post()
  async createReservation(@Body() reservation: ReservationCreateDto) {
    return await this.reservationsService.createReservation(reservation);
  }

  @Patch(':id')
  async updateReservation(
    @Param() param: IdDto,
    @Body() reservation: ReservationUpdateDto,
  ) {
    return await this.reservationsService.updateReservation(
      param.id,
      reservation,
    );
  }
}
