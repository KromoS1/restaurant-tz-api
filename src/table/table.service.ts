import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Table, TableStatus } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  TableCreateDto,
  TableUpdateDto,
  TableUpdateStatusDto,
} from './table.dto';

@Injectable()
export class TableService {
  constructor(private readonly prisma: PrismaService) {}

  async getTables(): Promise<Table[]> {
    return await this.prisma.table.findMany({
      include: {
        reservations: true
      },
    });
  }

  async getTableById(id: string): Promise<Table> {
    const table = await this.prisma.table.findUnique({
      where: {
        id,
      },
      include: {
        reservations: true,
      },
    });

    if (!table) {
      throw new NotFoundException('Table not found');
    }

    return table;
  }

  async create(table: TableCreateDto): Promise<Table> {
    try {
      return await this.prisma.table.create({
        data: {
          ...table,
          status: TableStatus.AVAILABLE,
        },
      });
    } catch (error) {
      throw new BadRequestException('Table not created');
    }
  }

  async update(id: string, table: TableUpdateDto): Promise<Table> {
    try {
      return await this.prisma.table.update({
        where: {
          id,
        },
        data: {
          ...table,
        },
      });
    } catch (error) {
      throw new BadRequestException('Table not updated');
    }
  }

  async removeTable(id: string): Promise<void> {
    try {
      await this.prisma.table.delete({
        where: {
          id,
        },
      });
    } catch (error) {
      throw new BadRequestException('Table not deleted');
    }
  }

  async maintenanceTable(
    id: string,
    status: TableUpdateStatusDto,
  ): Promise<Table> {
    return await this.prisma.table.update({
      where: { id },
      data: { status: status.status },
    });
  }

  async getAvailableTables(
    guestCount: number,
    tableType?: string,
  ): Promise<Table[]> {
    const whereCondition: any = {
      status: TableStatus.AVAILABLE,
      minSeats: { lte: guestCount },
      maxSeats: { gte: guestCount },
    };

    if (tableType) {
      whereCondition.type = tableType;
    }

    return await this.prisma.table.findMany({
      where: whereCondition,
      orderBy: [{ type: 'asc' }, { minSeats: 'desc' }, { maxSeats: 'asc' }],
    });
  }

  async getTablesWithUpcomingReservations(): Promise<Table[]> {
    const now = new Date();
    const twoHoursFromNow = new Date(now.getTime() + 2 * 60 * 60 * 1000);

    return await this.prisma.table.findMany({
      include: {
        reservations: {
          where: {
            reservationDate: {
              gte: now,
              lte: twoHoursFromNow,
            },
            status: {
              in: ['CONFIRMED', 'PENDING'],
            },
          },
        },
      },
    });
  }
}
