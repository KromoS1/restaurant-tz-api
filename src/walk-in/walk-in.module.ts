import { Module } from '@nestjs/common';
import { AnalyticsModule } from 'src/analytics/analytics.module';
import { PrismaModule } from 'src/prisma/prisma.module';
import { TableModule } from 'src/table/table.module';
import { WalkInController } from './walk-in.controller';
import { WalkInService } from './walk-in.service';

@Module({
  imports: [PrismaModule, TableModule, AnalyticsModule],
  controllers: [WalkInController],
  providers: [WalkInService],
  exports: [WalkInService],
})
export class WalkInModule {}
