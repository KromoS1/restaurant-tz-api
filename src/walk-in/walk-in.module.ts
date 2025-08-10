import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { TableModule } from 'src/table/table.module';
import { WalkInController } from './walk-in.controller';
import { WalkInService } from './walk-in.service';

@Module({
  imports: [PrismaModule, TableModule],
  controllers: [WalkInController],
  providers: [WalkInService],
  exports: [WalkInService],
})
export class WalkInModule {}
