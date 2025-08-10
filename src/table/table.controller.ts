import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { IdDto } from 'src/common/dto/id.dto';
import {
  FindAvailableTablesDto,
  TableCreateDto,
  TableUpdateDto,
  TableUpdateStatusDto,
} from './table.dto';
import { TableService } from './table.service';

@Controller('table')
export class TableController {
  constructor(private readonly tableService: TableService) {}

  @Get()
  async getTables() {
    return await this.tableService.getTables();
  }

  @Get(':id')
  async getTableById(@Param() param: IdDto) {
    return await this.tableService.getTableById(param.id);
  }

  @Post()
  async createTable(@Body() table: TableCreateDto) {
    return await this.tableService.create(table);
  }

  @Patch(':id')
  async updateTable(@Param() param: IdDto, @Body() table: TableUpdateDto) {
    return await this.tableService.update(param.id, table);
  }

  @Patch(':id/maintenance')
  async maintenanceTable(
    @Param() param: IdDto,
    @Body() table: TableUpdateStatusDto,
  ) {
    return await this.tableService.maintenanceTable(param.id, table);
  }

  @Delete(':id')
  async removeTable(@Param() param: IdDto) {
    await this.tableService.removeTable(param.id);
    return HttpStatus.NO_CONTENT;
  }

  @Get('available-with-info')
  async getAvailableTablesWithInfo(@Query() query: FindAvailableTablesDto) {
    const tables = await this.tableService.getAvailableTables(
      query.guestCount,
      query.tableType,
    );

    return tables.map((table) => ({
      ...table,
      suitableFor: `${table.minSeats}-${table.maxSeats} человек`,
      isOptimal: (guestCount: number) =>
        guestCount >= table.minSeats && guestCount <= table.maxSeats,
    }));
  }
}
