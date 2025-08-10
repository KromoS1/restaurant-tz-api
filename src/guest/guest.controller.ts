import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { IdDto } from 'src/common/dto/id.dto';
import { GuestCreateDto, GuestUpdateDto } from './guest.dto';
import { GuestService } from './guest.service';

@Controller('guest')
export class GuestController {
  constructor(private readonly guestService: GuestService) {}

  @Get()
  async getGuests() {
    return await this.guestService.getGuests();
  }

  @Get(':id')
  async getGuestById(@Param() param: IdDto) {
    return await this.guestService.getGuestById(param.id);
  }

  @Post()
  async createGuest(@Body() guest: GuestCreateDto) {
    return await this.guestService.create(guest);
  }

  @Patch(':id')
  async updateGuest(@Param() param: IdDto, @Body() guest: GuestUpdateDto) {
    return await this.guestService.update(param.id, guest);
  }
}
