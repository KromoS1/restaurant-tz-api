import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { GuestCreateDto, GuestUpdateDto } from './guest.dto';

@Injectable()
export class GuestService {
  constructor(private readonly prisma: PrismaService) {}

  async getGuests() {
    return await this.prisma.guest.findMany();
  }

  async getGuestById(id: string) {
    return await this.prisma.guest.findUnique({
      where: { id },
      include: {
        reservations: {
          include: {
            table: true,
          },
        },
      },
    });
  }

  async create(guest: GuestCreateDto) {
    try {
      return await this.prisma.guest.create({
        data: guest,
      });
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async update(id: string, guest: GuestUpdateDto) {
    try {
      return await this.prisma.guest.update({
        where: { id },
        data: guest,
      });
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
