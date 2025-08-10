import {
	Body,
	Controller,
	Delete,
	Get,
	HttpCode,
	HttpStatus,
	Param,
	Patch,
	Post,
} from '@nestjs/common';
import {
	WaitingQueueCreateDto,
	WalkInCreateDto,
	WalkInIdDto,
	WalkInSeatDto,
	WalkInUpdateDto,
} from './walk-in.dto';
import { WalkInService } from './walk-in.service';

@Controller('walk-in')
export class WalkInController {
  constructor(private readonly walkInService: WalkInService) {}

  @Post()
  async createWalkInGuest(@Body() data: WalkInCreateDto) {
    return await this.walkInService.createWalkInGuest(data);
  }

  @Get()
  async getActiveWalkInGuests() {
    return await this.walkInService.getActiveWalkInGuests();
  }

  @Get(':id')
  async getWalkInGuestById(@Param() params: WalkInIdDto) {
    return await this.walkInService.getWalkInGuestById(params.id);
  }

  @Post(':id/seat')
  async seatWalkInGuest(
    @Param() params: WalkInIdDto,
    @Body() seatData: WalkInSeatDto,
  ) {
    return await this.walkInService.seatWalkInGuest(params.id, seatData);
  }

  @Patch(':id')
  async updateWalkInGuest(
    @Param() params: WalkInIdDto,
    @Body() data: WalkInUpdateDto,
  ) {
    return await this.walkInService.updateWalkInGuest(params.id, data);
  }

  @Post(':id/complete')
  @HttpCode(HttpStatus.OK)
  async completeWalkInGuest(@Param() params: WalkInIdDto) {
    return await this.walkInService.completeWalkInGuest(params.id);
  }

  @Post('waiting-queue')
  async addToWaitingQueue(@Body() data: WaitingQueueCreateDto) {
    return await this.walkInService.addToWaitingQueue(data);
  }

  @Get('waiting-queue/list')
  async getWaitingQueue() {
    return await this.walkInService.getWaitingQueue();
  }

  @Delete('waiting-queue/:walkInId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeFromWaitingQueue(@Param('walkInId') walkInId: string) {
    await this.walkInService.removeFromWaitingQueue(walkInId);
  }

  @Post('quick-seat')
  async quickSeat(@Body() data: WalkInCreateDto & { tableId: string }) {
    const { tableId, ...walkInData } = data;

    const walkInGuest = await this.walkInService.createWalkInGuest(walkInData);

    return await this.walkInService.seatWalkInGuest(walkInGuest.id, {
      tableId,
      notes: 'Быстрое размещение',
    });
  }
}
