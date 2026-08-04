import { OperationsRepository } from '../repositories/operationsRepository';
import { Booking, DailyLoggerSummary, FacilityRecordSummary, SystemSettings } from '../../src/types';

export class OperationsService {
  constructor(private repository: OperationsRepository) {}

  public async getBookings(branch?: string, month?: string, search?: string): Promise<Booking[]> {
    let bookings = await this.repository.getAllBookings();

    if (branch && branch !== 'all') {
      const bLower = branch.toLowerCase();
      bookings = bookings.filter((b) => b.branch.toLowerCase().includes(bLower));
    }

    if (month && month !== 'all') {
      bookings = bookings.filter((b) => b.date.startsWith(month));
    }

    if (search) {
      const sLower = search.toLowerCase();
      bookings = bookings.filter(
        (b) =>
          b.clientName.toLowerCase().includes(sLower) ||
          b.id.toLowerCase().includes(sLower) ||
          b.facility.toLowerCase().includes(sLower) ||
          b.clientId.toLowerCase().includes(sLower) ||
          b.phone.toLowerCase().includes(sLower) ||
          (b.email && b.email.toLowerCase().includes(sLower))
      );
    }

    return bookings;
  }

  public async getSummaryMetrics(branch?: string, month?: string): Promise<DailyLoggerSummary> {
    const bookings = await this.getBookings(branch, month);

    const monthlyRevenue = bookings.reduce((sum, b) => sum + b.amount, 0);
    const totalBookings = bookings.length;
    const activeBookings = bookings.filter((b) => b.status === 'Active').length;
    const expiredBookings = bookings.filter((b) => b.status === 'Expired').length;

    return {
      monthlyRevenue,
      totalBookings,
      activeBookings,
      expiredBookings,
      activeSubscriptions: activeBookings,
      expiredSubscriptions: expiredBookings,
    };
  }

  public async getFacilityRecords(branch?: string): Promise<FacilityRecordSummary[]> {
    const allBookings = await this.getBookings(branch);
    const totalEnterpriseRevenue = allBookings.reduce((sum, b) => sum + b.amount, 0) || 1;

    const facilityNames = [
      'Co-working Space',
      'Private Office Suites',
      'Dedicated Desk Hub',
      'Conference Hall',
      'Executive Boardroom',
      'Event Pavilion',
    ];

    const expectedMaxRevenue: Record<string, number> = {
      'Co-working Space': 250000,
      'Private Office Suites': 350000,
      'Dedicated Desk Hub': 200000,
      'Conference Hall': 150000,
      'Executive Boardroom': 180000,
      'Event Pavilion': 300000,
    };

    return facilityNames.map((facName) => {
      const facBookings = allBookings.filter((b) => b.facility === facName);
      const bookingsCount = facBookings.length;
      const revenue = facBookings.reduce((sum, b) => sum + b.amount, 0);
      const averageRevenue = bookingsCount > 0 ? Math.round(revenue / bookingsCount) : 0;
      const percentageOfTotal = Number(((revenue / totalEnterpriseRevenue) * 100).toFixed(1));

      const expectedCap = expectedMaxRevenue[facName];
      let occupancy: number | string = 'N/A';
      if (expectedCap && expectedCap > 0) {
        occupancy = Number(Math.min(100, (revenue / expectedCap) * 100).toFixed(1));
      }

      return {
        facility: facName,
        bookings: bookingsCount,
        revenue,
        averageRevenue,
        percentageOfTotal,
        branch: branch && branch !== 'all' ? branch : 'All Branches',
        occupancy,
      };
    });
  }

  public async createBooking(bookingData: Omit<Booking, 'id' | 'createdAt'>): Promise<Booking> {
    const daysUsed = bookingData.daysUsed ?? 1;
    const daysLeft = Math.max(0, (bookingData.daysCount || 1) - daysUsed);
    const status = daysLeft > 0 ? 'Active' : 'Expired';

    const processedData = {
      ...bookingData,
      daysUsed,
      daysLeft,
      status: bookingData.status || status,
    };

    return await this.repository.addBooking(processedData);
  }

  public async updateBooking(id: string, bookingData: Partial<Booking>): Promise<Booking> {
    return await this.repository.updateBooking(id, bookingData);
  }

  public async getNextBookingId(): Promise<string> {
    return await this.repository.getNextBookingId();
  }

  public async getSettings(): Promise<SystemSettings> {
    return await this.repository.getSettings();
  }

  public async updateSettings(settings: Partial<SystemSettings>): Promise<SystemSettings> {
    return await this.repository.updateSettings(settings);
  }

  public async searchClients(query?: string) {
    return await this.repository.getClients(query);
  }
}
