import { Controller, Get, Query } from '@nestjs/common';
import { GetAnalyticsDto, GetAnalyticsRangeDto } from './analytics.dto';
import { AnalyticsService } from './analytics.service';

@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('daily-occupancy')
  async getDailyOccupancy(@Query() query: GetAnalyticsDto) {
    const date = new Date(query.date);
    return await this.analyticsService.getDailyOccupancy(date);
  }

  @Get('peak-hours')
  async getPeakHours(@Query() query: GetAnalyticsDto) {
    const date = new Date(query.date);
    return await this.analyticsService.getPeakHours(date);
  }

  @Get('average-dining-time')
  async getAverageDiningTime(@Query() query: GetAnalyticsDto) {
    const date = new Date(query.date);
    return await this.analyticsService.getAverageDiningTime(date);
  }

  @Get('daily-summary')
  async getDailySummary(@Query() query: GetAnalyticsDto) {
    const date = new Date(query.date);
    const [occupancy, peakHours, avgDining] = await Promise.all([
      this.analyticsService.getDailyOccupancy(date),
      this.analyticsService.getPeakHours(date),
      this.analyticsService.getAverageDiningTime(date),
    ]);

    return {
      date: date,
      occupancy,
      peakHours,
      avgDining,
      summary: {
        totalGuests: occupancy.totalGuests,
        occupancyRate: occupancy.occupancyRate,
        peakPeriod: `${peakHours.peakHourStart}:00 - ${peakHours.peakHourEnd}:59`,
        avgDiningTimeMinutes: avgDining.averageDurationMinutes,
        tablesUsed: occupancy.uniqueTablesUsed,
        totalServices: occupancy.reservationsCount + occupancy.walkInsCount,
      },
    };
  }

  @Get('saved')
  async getSavedAnalytics(@Query() query: GetAnalyticsRangeDto) {
    const startDate = new Date(query.startDate);
    const endDate = query.endDate ? new Date(query.endDate) : undefined;
    return await this.analyticsService.getSavedAnalytics(startDate, endDate);
  }

  @Get('current-week')
  async getCurrentWeekAnalytics() {
    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());

    const weekAnalytics: any[] = [];

    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStart);
      date.setDate(weekStart.getDate() + i);

      if (date <= today) {
        const dailySummary = await this.getDailySummary({
          date: date.toISOString(),
        });
        weekAnalytics.push(dailySummary);
      }
    }

    if (weekAnalytics.length === 0) {
      return {
        weekStart,
        weekEnd: today,
        dailyData: [],
        weekSummary: {
          totalGuests: 0,
          avgOccupancyRate: 0,
          avgDiningTime: 0,
          totalServices: 0,
        },
      };
    }

    return {
      weekStart,
      weekEnd: today,
      dailyData: weekAnalytics,
      weekSummary: {
        totalGuests: weekAnalytics.reduce(
          (sum, day) => sum + day.occupancy.totalGuests,
          0,
        ),
        avgOccupancyRate:
          weekAnalytics.reduce(
            (sum, day) => sum + day.occupancy.occupancyRate,
            0,
          ) / weekAnalytics.length,
        avgDiningTime:
          weekAnalytics.reduce(
            (sum, day) => sum + day.avgDining.averageDurationMinutes,
            0,
          ) / weekAnalytics.length,
        totalServices: weekAnalytics.reduce(
          (sum, day) => sum + day.summary.totalServices,
          0,
        ),
      },
    };
  }
}
