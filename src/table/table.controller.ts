import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { TableCreateDto, TableIdDto, TableUpdateDto } from './table.dto';
import { TableService } from './table.service';

@Controller('table')
export class TableController {
  constructor(private readonly tableService: TableService) {}

  @Get()
  async getTables() {
    return await this.tableService.getTables();
  }

  @Get(':id')
  async getTableById(@Param() param: TableIdDto) {
    return await this.tableService.getTableById(param.id);
  }

  @Post()
  async createTable(@Body() table: TableCreateDto) {
    return await this.tableService.create(table);
  }

  @Patch(':id')
  async updateTable(@Param() param: TableIdDto, @Body() table: TableUpdateDto) {
    return await this.tableService.update(param.id, table);
  }

  @Delete(':id')
  async removeTable(@Param() param: TableIdDto) {
    await this.tableService.removeTable(param.id);
    return HttpStatus.NO_CONTENT;
  }
}
