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
        reservations: {
          select: {
            id: true,
            status: true,
          },
        },
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
}
