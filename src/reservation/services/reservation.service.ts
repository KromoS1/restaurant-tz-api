import { BadRequestException, Injectable } from '@nestjs/common';
import { TableStatus } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { ReservationCreateDto, ReservationUpdateDto } from '../reservation.dto';

@Injectable()
export class ReservationService {
  constructor(private readonly prisma: PrismaService) {}

  async getReservationById(id: string) {
    return await this.prisma.reservation.findUnique({
      where: { id },
      include: { table: true, guest: true },
    });
  }

  async createReservation(reservation: ReservationCreateDto) {
    try {
      return await this.prisma.$transaction(async (tx) => {
        const table = await tx.table.findUnique({
          where: { id: reservation.tableId },
        });

        if (!table) {
          throw new BadRequestException('Столик не найден');
        }

        if (table.status !== TableStatus.AVAILABLE) {
          throw new BadRequestException(
            `Столик не доступен для бронирования. Статус - ${table.status}`,
          );
        }

        if (reservation.guestCount < table.minSeats) {
          throw new BadRequestException(
            `Количество гостей (${reservation.guestCount}) меньше минимального количества мест за столиком (${table.minSeats})`,
          );
        }

        if (reservation.guestCount > table.maxSeats) {
          throw new BadRequestException(
            `Количество гостей (${reservation.guestCount}) превышает максимальное количество мест за столиком (${table.maxSeats})`,
          );
        }

        const reservationInstance = await tx.reservation.create({
          data: reservation,
        });
        await tx.table.update({
          where: { id: reservation.tableId },
          data: { status: TableStatus.RESERVED },
        });
        return reservationInstance;
      });
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async updateReservation(id: string, reservation: ReservationUpdateDto) {
    try {
      return await this.prisma.$transaction(async (tx) => {
        if (reservation.guestCount !== undefined) {
          const currentReservation = await tx.reservation.findUnique({
            where: { id },
            include: { table: true },
          });

          if (!currentReservation) {
            throw new BadRequestException('Бронирование не найдено');
          }

          const table = currentReservation.table;

          if (reservation.guestCount < table.minSeats) {
            throw new BadRequestException(
              `Количество гостей (${reservation.guestCount}) меньше минимального количества мест за столиком (${table.minSeats})`,
            );
          }

          if (reservation.guestCount > table.maxSeats) {
            throw new BadRequestException(
              `Количество гостей (${reservation.guestCount}) превышает максимальное количество мест за столиком (${table.maxSeats})`,
            );
          }
        }

        return await tx.reservation.update({
          where: { id },
          data: reservation,
        });
      });
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
