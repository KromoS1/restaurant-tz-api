import { BadRequestException, Injectable } from '@nestjs/common';
import { ReservationStatus, TableStatus } from '@prisma/client';
import { AnalyticsService } from 'src/analytics/analytics.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ReservationStatusesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly analyticsService: AnalyticsService,
  ) {}

  async confirmedReservation(id: string) {
    try {
      const reservation = await this.prisma.reservation.findUnique({
        where: { id },
      });

      if (!reservation) {
        throw new BadRequestException('Бронирование не найдено');
      }

      if (reservation.status === ReservationStatus.CONFIRMED) {
        throw new BadRequestException('Бронирование уже подтверждено');
      }

      return await this.prisma.reservation.update({
        where: { id },
        data: { status: ReservationStatus.CONFIRMED },
      });
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async seatedReservation(id: string) {
    try {
      const reservation = await this.prisma.reservation.findUnique({
        where: { id },
      });

      if (!reservation) {
        throw new BadRequestException('Бронирование не найдено');
      }

      if (reservation.status === ReservationStatus.SEATED) {
        throw new BadRequestException('Бронирование уже размещено');
      }

      const result = await this.prisma.$transaction(async (tx) => {
        const updatedReservation = await tx.reservation.update({
          where: { id },
          data: { status: ReservationStatus.SEATED },
        });
        await tx.table.update({
          where: { id: reservation.tableId },
          data: { status: TableStatus.OCCUPIED },
        });
        return updatedReservation;
      });

      await this.analyticsService.recordGuestVisit(
        reservation.tableId,
        reservation.guestCount,
      );

      return result;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async cancelReservation(id: string) {
    try {
      const reservation = await this.prisma.reservation.findUnique({
        where: { id },
      });

      if (!reservation) {
        throw new BadRequestException('Бронирование не найдено');
      }

      if (reservation.status === ReservationStatus.CANCELLED) {
        throw new BadRequestException('Бронирование уже отменено');
      }

      if (reservation.status === ReservationStatus.COMPLETED) {
        throw new BadRequestException(
          'Нельзя отменить завершенное бронирование',
        );
      }

      return await this.prisma.$transaction(async (tx) => {
        await tx.reservation.update({
          where: { id },
          data: { status: ReservationStatus.CANCELLED },
        });
        await tx.table.update({
          where: { id: reservation.tableId },
          data: { status: TableStatus.AVAILABLE },
        });
      });
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  //NOTES можно добавить cron для автоматической отметки неявки
  async markNoShow(id: string) {
    try {
      const reservation = await this.prisma.reservation.findUnique({
        where: { id },
        include: { guest: true },
      });

      if (!reservation) {
        throw new BadRequestException('Бронирование не найдено');
      }

      if (reservation.status === ReservationStatus.NO_SHOW) {
        throw new BadRequestException('Бронирование уже помечено как неявка');
      }

      if (reservation.status === ReservationStatus.SEATED) {
        throw new BadRequestException('Гости уже размещены за столиком');
      }

      if (reservation.status === ReservationStatus.COMPLETED) {
        throw new BadRequestException('Бронирование уже завершено');
      }

      if (reservation.status === ReservationStatus.CANCELLED) {
        throw new BadRequestException('Бронирование уже отменено');
      }

      const now = new Date();
      const gracePeriod = 30;
      const expectedArrival = new Date(
        reservation.reservationDate.getTime() + gracePeriod * 60000,
      );

      if (now < expectedArrival) {
        throw new BadRequestException(
          `Слишком рано для отметки неявки. Подождите до ${expectedArrival.toLocaleTimeString()}`,
        );
      }

      return await this.prisma.$transaction(async (tx) => {
        await tx.reservation.update({
          where: { id },
          data: {
            status: ReservationStatus.NO_SHOW,
            notes: `No-show отмечен ${now.toLocaleString()}${reservation.notes ? '. ' + reservation.notes : ''}`,
          },
        });

        await tx.table.update({
          where: { id: reservation.tableId },
          data: { status: TableStatus.AVAILABLE },
        });

        return reservation;
      });
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async completeReservation(id: string) {
    try {
      const reservation = await this.prisma.reservation.findUnique({
        where: { id },
      });

      if (!reservation) {
        throw new BadRequestException('Бронирование не найдено');
      }

      if (reservation.status !== ReservationStatus.SEATED) {
        throw new BadRequestException(
          'Можно завершить только размещенное бронирование',
        );
      }

      const result = await this.prisma.$transaction(async (tx) => {
        const updatedReservation = await tx.reservation.update({
          where: { id },
          data: { status: ReservationStatus.COMPLETED },
        });
        await tx.table.update({
          where: { id: reservation.tableId },
          data: { status: TableStatus.MAINTENANCE },
        });
        return updatedReservation;
      });

      await this.analyticsService.recordGuestVisit(
        reservation.tableId,
        reservation.guestCount,
        reservation.duration,
      );

      return result;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
