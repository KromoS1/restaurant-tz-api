import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { WaitingQueue, WalkInGuest, WalkInStatus } from '@prisma/client';
import { AnalyticsService } from 'src/analytics/analytics.service';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  WaitingQueueCreateDto,
  WalkInCreateDto,
  WalkInSeatDto,
  WalkInUpdateDto,
} from './walk-in.dto';

@Injectable()
export class WalkInService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly analyticsService: AnalyticsService,
  ) {}

  async createWalkInGuest(data: WalkInCreateDto): Promise<WalkInGuest> {
    try {
      return await this.prisma.walkInGuest.create({
        data,
        include: {
          table: true,
        },
      });
    } catch (error) {
      throw new BadRequestException('Не удалось зарегистрировать гостя');
    }
  }

  async getActiveWalkInGuests(): Promise<WalkInGuest[]> {
    return await this.prisma.walkInGuest.findMany({
      where: {
        status: {
          in: [WalkInStatus.WAITING, WalkInStatus.SEATED],
        },
      },
      include: {
        table: true,
        waitingQueue: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
  }

  async getWalkInGuestById(id: string): Promise<WalkInGuest> {
    const walkInGuest = await this.prisma.walkInGuest.findUnique({
      where: { id },
      include: {
        table: true,
        waitingQueue: true,
      },
    });

    if (!walkInGuest) {
      throw new NotFoundException('Walk-in гость не найден');
    }

    return walkInGuest;
  }

  async seatWalkInGuest(
    walkInId: string,
    seatData: WalkInSeatDto,
  ): Promise<WalkInGuest> {
    try {
      const result = await this.prisma.$transaction(async (tx) => {
        const walkInGuest = await tx.walkInGuest.findUnique({
          where: { id: walkInId },
        });

        if (!walkInGuest) {
          throw new BadRequestException('Walk-in гость не найден');
        }

        if (walkInGuest.status !== WalkInStatus.WAITING) {
          throw new BadRequestException(
            'Гость уже размещен или покинул ресторан',
          );
        }

        const table = await tx.table.findUnique({
          where: { id: seatData.tableId },
        });

        if (!table) {
          throw new BadRequestException('Столик не найден');
        }

        if (table.status !== 'AVAILABLE') {
          throw new BadRequestException('Столик недоступен');
        }

        if (
          walkInGuest.guestCount < table.minSeats ||
          walkInGuest.guestCount > table.maxSeats
        ) {
          throw new BadRequestException(
            `Столик не подходит по размеру для ${walkInGuest.guestCount} гостей`,
          );
        }

        const updatedWalkInGuest = await tx.walkInGuest.update({
          where: { id: walkInId },
          data: {
            tableId: seatData.tableId,
            status: WalkInStatus.SEATED,
            seatedAt: new Date(),
            notes: seatData.notes || walkInGuest.notes,
          },
          include: {
            table: true,
          },
        });

        await tx.table.update({
          where: { id: seatData.tableId },
          data: { status: 'OCCUPIED' },
        });

        await tx.waitingQueue.deleteMany({
          where: { walkInId },
        });

        return updatedWalkInGuest;
      });

      await this.analyticsService.recordGuestVisit(
        seatData.tableId,
        result.guestCount,
      );

      return result;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async updateWalkInGuest(
    id: string,
    data: WalkInUpdateDto,
  ): Promise<WalkInGuest> {
    try {
      return await this.prisma.walkInGuest.update({
        where: { id },
        data,
        include: {
          table: true,
          waitingQueue: true,
        },
      });
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async completeWalkInGuest(id: string): Promise<WalkInGuest> {
    try {
      const result = await this.prisma.$transaction(async (tx) => {
        const walkInGuest = await tx.walkInGuest.findUnique({
          where: { id },
          include: { table: true },
        });

        if (!walkInGuest) {
          throw new BadRequestException('Walk-in гость не найден');
        }

        const updatedWalkInGuest = await tx.walkInGuest.update({
          where: { id },
          data: {
            status: WalkInStatus.LEFT,
            leftAt: new Date(),
            tableId: null,
          },
          include: {
            table: true,
          },
        });

        if (walkInGuest.tableId) {
          await tx.table.update({
            where: { id: walkInGuest.tableId },
            data: { status: 'AVAILABLE' },
          });
        }

        await tx.waitingQueue.deleteMany({
          where: { walkInId: id },
        });

        return { updatedWalkInGuest, originalWalkInGuest: walkInGuest };
      });

      if (
        result.originalWalkInGuest.tableId &&
        result.originalWalkInGuest.seatedAt
      ) {
        const durationMs =
          new Date().getTime() - result.originalWalkInGuest.seatedAt.getTime();
        const durationMinutes = Math.round(durationMs / (1000 * 60));

        await this.analyticsService.recordGuestVisit(
          result.originalWalkInGuest.tableId,
          result.originalWalkInGuest.guestCount,
          durationMinutes,
        );
      }

      return result.updatedWalkInGuest;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async addToWaitingQueue(data: WaitingQueueCreateDto): Promise<WaitingQueue> {
    try {
      const walkInGuest = await this.getWalkInGuestById(data.walkInId);

      if (walkInGuest.status !== WalkInStatus.WAITING) {
        throw new BadRequestException(
          'Только ожидающие гости могут быть добавлены в очередь',
        );
      }

      const queuePosition = await this.prisma.waitingQueue.count();
      const estimatedWait = data.estimatedWait || (queuePosition + 1) * 15;

      return await this.prisma.waitingQueue.create({
        data: {
          ...data,
          estimatedWait,
        },
        include: {
          walkInGuest: true,
        },
      });
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async getWaitingQueue(): Promise<WaitingQueue[]> {
    return await this.prisma.waitingQueue.findMany({
      include: {
        walkInGuest: true,
      },
      orderBy: [{ priority: 'desc' }, { createdAt: 'asc' }],
    });
  }

  async removeFromWaitingQueue(walkInId: string): Promise<void> {
    await this.prisma.waitingQueue.deleteMany({
      where: { walkInId },
    });
  }
}
