import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  async getDailyOccupancy(date: Date) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const reservations = await this.prisma.reservation.findMany({
      where: {
        reservationDate: {
          gte: startOfDay,
          lte: endOfDay,
        },
        status: {
          in: ['SEATED', 'COMPLETED'],
        },
      },
      include: {
        table: true,
      },
    });

    const walkInGuests = await this.prisma.walkInGuest.findMany({
      where: {
        seatedAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
        status: {
          in: ['SEATED', 'LEFT'],
        },
      },
      include: {
        table: true,
      },
    });

    const totalGuestsFromReservations = reservations.reduce(
      (sum, res) => sum + res.guestCount,
      0,
    );
    const totalGuestsFromWalkIns = walkInGuests.reduce(
      (sum, guest) => sum + guest.guestCount,
      0,
    );
    const totalGuests = totalGuestsFromReservations + totalGuestsFromWalkIns;

    const uniqueTablesUsed = new Set([
      ...reservations.map((r) => r.tableId),
      ...walkInGuests.map((w) => w.tableId).filter(Boolean),
    ]).size;

    const totalTables = await this.prisma.table.count();

    const occupancyRate =
      totalTables > 0 ? (uniqueTablesUsed / totalTables) * 100 : 0;

    return {
      date: startOfDay,
      totalGuests,
      totalGuestsFromReservations,
      totalGuestsFromWalkIns,
      uniqueTablesUsed,
      totalTables,
      occupancyRate: Math.round(occupancyRate * 100) / 100,
      reservationsCount: reservations.length,
      walkInsCount: walkInGuests.length,
    };
  }

  async getPeakHours(date: Date) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const hourlyData = new Array(24).fill(0);

    const reservations = await this.prisma.reservation.findMany({
      where: {
        reservationDate: {
          gte: startOfDay,
          lte: endOfDay,
        },
        status: {
          in: ['SEATED', 'COMPLETED'],
        },
      },
    });

    const walkInGuests = await this.prisma.walkInGuest.findMany({
      where: {
        seatedAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
        status: {
          in: ['SEATED', 'LEFT'],
        },
      },
    });

    reservations.forEach((reservation) => {
      const hour = reservation.reservationDate.getHours();
      hourlyData[hour] += reservation.guestCount;
    });

    walkInGuests.forEach((guest) => {
      if (guest.seatedAt) {
        const hour = guest.seatedAt.getHours();
        hourlyData[hour] += guest.guestCount;
      }
    });

    const maxGuests = Math.max(...hourlyData);
    const peakHourStart = hourlyData.indexOf(maxGuests);

    let peakHourEnd = peakHourStart;
    const threshold = maxGuests * 0.8;

    for (let i = peakHourStart + 1; i < 24; i++) {
      if (hourlyData[i] >= threshold) {
        peakHourEnd = i;
      } else {
        break;
      }
    }

    return {
      date: startOfDay,
      hourlyData,
      peakHourStart,
      peakHourEnd,
      maxGuestsInHour: maxGuests,
      totalGuestsInPeakPeriod: hourlyData
        .slice(peakHourStart, peakHourEnd + 1)
        .reduce((sum, guests) => sum + guests, 0),
    };
  }

  async getAverageDiningTime(date: Date) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const completedReservations = await this.prisma.reservation.findMany({
      where: {
        reservationDate: {
          gte: startOfDay,
          lte: endOfDay,
        },
        status: 'COMPLETED',
      },
    });

    const completedWalkIns = await this.prisma.walkInGuest.findMany({
      where: {
        seatedAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
        status: 'LEFT',
        leftAt: {
          not: null,
        },
      },
    });

    const durations: number[] = [];

    completedReservations.forEach((reservation) => {
      durations.push(reservation.duration);
    });

    completedWalkIns.forEach((guest) => {
      if (guest.seatedAt && guest.leftAt) {
        const durationMs = guest.leftAt.getTime() - guest.seatedAt.getTime();
        const durationMinutes = Math.round(durationMs / (1000 * 60));
        if (durationMinutes > 0 && durationMinutes < 300) {
          // Исключаем аномальные значения
          durations.push(durationMinutes);
        }
      }
    });

    if (durations.length === 0) {
      return {
        date: startOfDay,
        averageDurationMinutes: 0,
        totalCompletedServices: 0,
        minDuration: 0,
        maxDuration: 0,
        completedReservations: 0,
        completedWalkIns: 0,
      };
    }

    const averageDuration =
      durations.reduce((sum, duration) => sum + duration, 0) / durations.length;

    return {
      date: startOfDay,
      averageDurationMinutes: Math.round(averageDuration),
      totalCompletedServices: durations.length,
      minDuration: Math.min(...durations),
      maxDuration: Math.max(...durations),
      completedReservations: completedReservations.length,
      completedWalkIns: completedWalkIns.length,
    };
  }

  async saveDailyAnalytics(date: Date) {
    const [occupancy, peakHours, avgDining] = await Promise.all([
      this.getDailyOccupancy(date),
      this.getPeakHours(date),
      this.getAverageDiningTime(date),
    ]);

    const analyticsData = {
      date: new Date(date.getFullYear(), date.getMonth(), date.getDate()),
      totalGuests: occupancy.totalGuests,
      peakHourStart: peakHours.peakHourStart,
      peakHourEnd: peakHours.peakHourEnd,
      avgDuration: avgDining.averageDurationMinutes,
    };

    return await this.prisma.analytics.upsert({
      where: {
        date_tableId: {
          date: analyticsData.date,
          tableId: null as any,
        },
      },
      update: analyticsData,
      create: analyticsData,
    });
  }

  async getSavedAnalytics(startDate: Date, endDate?: Date) {
    const where: any = {
      date: {
        gte: startDate,
      },
      tableId: null as any,
    };

    if (endDate) {
      where.date.lte = endDate;
    }

    return await this.prisma.analytics.findMany({
      where,
      orderBy: {
        date: 'desc',
      },
    });
  }

  async recordGuestVisit(
    tableId: string,
    guestCount: number,
    duration?: number,
  ) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    await this.prisma.analytics.upsert({
      where: {
        date_tableId: {
          date: today,
          tableId: tableId,
        },
      },
      update: {
        totalGuests: {
          increment: guestCount,
        },
        avgDuration: duration || undefined,
      },
      create: {
        date: today,
        tableId: tableId,
        totalGuests: guestCount,
        avgDuration: duration || undefined,
      },
    });
  }
}
