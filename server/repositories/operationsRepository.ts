import { Booking, ClientSuggestion, SystemSettings } from '../../src/types';
import config from '../config/config';
import { executeQuery, executeTransaction } from '../database/db';
import { auditRepository } from './auditRepository';

export class OperationsRepository {
  public async getAllBookings(): Promise<Booking[]> {
    try {
      const rows = await executeQuery<any>(
        `SELECT id, date, client_id as clientId, client_name as clientName, phone, email, branch, facility, days_count as daysCount, time_duration as timeDuration, amount, payment_method as paymentMethod, days_used as daysUsed, days_left as daysLeft, status, created_at as createdAt FROM bookings ORDER BY date DESC`
      );
      return rows.map((r) => {
        let statusVal: 'Active' | 'Expired' | 'Upcoming' = 'Active';
        if (r.status === 'Expired') statusVal = 'Expired';
        else if (r.status === 'Upcoming') statusVal = 'Upcoming';
        else statusVal = 'Active';

        return {
          id: r.id,
          date: r.date ? String(r.date).substring(0, 10) : new Date().toISOString().substring(0, 10),
          clientId: r.clientId,
          clientName: r.clientName,
          phone: r.phone || '',
          email: r.email || '',
          branch: r.branch || 'Art & Tech Hub',
          facility: r.facility || 'Desk Space',
          daysCount: Number(r.daysCount || 1),
          timeDuration: r.timeDuration || '09:00 AM - 05:00 PM',
          amount: Number(r.amount || 0),
          paymentMethod: r.paymentMethod || 'Cash',
          daysUsed: Number(r.daysUsed || 0),
          daysLeft: Number(r.daysLeft || 0),
          status: statusVal,
          createdAt: r.createdAt ? String(r.createdAt) : new Date().toISOString(),
        };
      });
    } catch (err) {
      console.error('Error fetching bookings:', err);
      return [];
    }
  }

  public async getSettings(): Promise<SystemSettings> {
    try {
      const rows = await executeQuery<any>(`SELECT * FROM business_settings WHERE id = 1`);
      if (rows.length > 0) {
        const r = rows[0];
        return {
          businessName: r.business_name || 'Nexus ERP Enterprise',
          directorName: r.director_name || 'Dominion',
          businessLogo: r.business_logo || '',
          profilePhoto: r.profile_photo || '',
          currency: r.currency || 'Nigerian Naira (₦)',
          timeZone: r.timezone || 'UTC+01:00 (West Africa)',
          theme: r.theme || 'light',
          address: r.address || '102 Executive Plaza, Suite 400, Lagos',
          phone: r.phone || '+234 801 902 1823',
          email: r.email || 'director@nexuserp.com',
          website: r.website || 'https://nexuserp.com',
          language: r.language || 'English (Default)',
          taxRate: r.tax_rate !== undefined && r.tax_rate !== null ? Number(r.tax_rate) : 7.5,
          taxId: r.tax_id || '',
          invoicePrefix: r.invoice_prefix || 'INV',
          bookingPrefix: r.booking_prefix || 'BK',
          clientPrefix: r.client_prefix || 'CL',
          expensePrefix: r.expense_prefix || 'EXP',
          categoryPrefix: r.category_prefix || 'EC',
          branchCode: r.branch_code || 'IPHIN',
        };
      }
    } catch (err) {
      console.error('Error fetching business settings:', err);
    }
    return {
      businessName: 'Nexus ERP Enterprise',
      directorName: 'Dominion',
      currency: 'Nigerian Naira (₦)',
      timeZone: 'UTC+01:00 (West Africa)',
      theme: 'light',
      address: '102 Executive Plaza, Suite 400, Lagos',
      phone: '+234 801 902 1823',
      email: 'director@nexuserp.com',
      website: 'https://nexuserp.com',
      language: 'English (Default)',
      taxRate: 7.5,
      invoicePrefix: 'INV',
      bookingPrefix: 'BK',
      clientPrefix: 'CL',
      expensePrefix: 'EXP',
      categoryPrefix: 'EC',
      branchCode: 'IPHIN',
    };
  }

  public async updateSettings(newSettings: Partial<SystemSettings>): Promise<SystemSettings> {
    await executeQuery(
      `UPDATE business_settings SET
       business_name = COALESCE(?, business_name),
       director_name = COALESCE(?, director_name),
       business_logo = COALESCE(?, business_logo),
       profile_photo = COALESCE(?, profile_photo),
       currency = COALESCE(?, currency),
       timezone = COALESCE(?, timezone),
       theme = COALESCE(?, theme),
       address = COALESCE(?, address),
       phone = COALESCE(?, phone),
       email = COALESCE(?, email),
       website = COALESCE(?, website),
       language = COALESCE(?, language),
       tax_rate = COALESCE(?, tax_rate),
       tax_id = COALESCE(?, tax_id),
       invoice_prefix = COALESCE(?, invoice_prefix),
       booking_prefix = COALESCE(?, booking_prefix),
       client_prefix = COALESCE(?, client_prefix),
       expense_prefix = COALESCE(?, expense_prefix),
       category_prefix = COALESCE(?, category_prefix),
       branch_code = COALESCE(?, branch_code)
       WHERE id = 1`,
      [
        newSettings.businessName || null,
        newSettings.directorName || null,
        newSettings.businessLogo || null,
        newSettings.profilePhoto || null,
        newSettings.currency || null,
        newSettings.timeZone || null,
        newSettings.theme || null,
        newSettings.address || null,
        newSettings.phone || null,
        newSettings.email || null,
        newSettings.website || null,
        newSettings.language || null,
        newSettings.taxRate !== undefined ? newSettings.taxRate : null,
        newSettings.taxId || null,
        newSettings.invoicePrefix || null,
        newSettings.bookingPrefix || null,
        newSettings.clientPrefix || null,
        newSettings.expensePrefix || null,
        newSettings.categoryPrefix || null,
        newSettings.branchCode || null,
      ]
    );

    auditRepository.logAction({
      user: 'System Admin',
      action: 'UPDATE_SETTINGS',
      entity: 'business_settings',
      entityId: '1',
      newValue: newSettings,
    });

    return await this.getSettings();
  }

  public async getNextBookingId(): Promise<string> {
    const bookings = await this.getAllBookings();
    const settings = await this.getSettings();
    const nextSeq = bookings.length + 1;
    const year = new Date().getFullYear();
    const prefix = settings.bookingPrefix || 'BK';
    const branchCode = settings.branchCode || 'IPHIN';
    return `${prefix}-${branchCode}-${year}-${nextSeq}`;
  }

  public async getNextClientId(): Promise<string> {
    const clients = await this.getClients();
    const settings = await this.getSettings();
    const nextSeq = clients.length + 1;
    const prefix = settings.clientPrefix || 'CL';
    const branchCode = settings.branchCode || 'IPHIN';
    return `${prefix}-${branchCode}-${nextSeq}`;
  }

  public async addBooking(bookingData: Omit<Booking, 'id' | 'createdAt'>): Promise<Booking> {
    const newId = await this.getNextBookingId();
    const settings = await this.getSettings();

    let finalClientId = bookingData.clientId;
    const clients = await this.getClients();
    const existingClient = clients.find(
      (c) =>
        (finalClientId && c.id.toLowerCase() === finalClientId.toLowerCase()) ||
        c.name.toLowerCase() === bookingData.clientName.toLowerCase()
    );

    if (existingClient) {
      finalClientId = existingClient.id;
    } else {
      finalClientId = await this.getNextClientId();
    }

    const newBooking: Booking = {
      ...bookingData,
      id: newId,
      clientId: finalClientId,
      createdAt: new Date().toISOString(),
    };

    await executeTransaction(async (conn) => {
      await conn.execute(
        `INSERT INTO clients (id, name, phone, email, company)
         VALUES (?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE name=VALUES(name), phone=VALUES(phone), email=VALUES(email)`,
        [
          finalClientId,
          bookingData.clientName,
          bookingData.phone,
          bookingData.email || '',
          bookingData.clientName,
        ]
      );

      await conn.execute(
        `INSERT INTO bookings (id, date, client_id, client_name, phone, email, branch, facility, days_count, time_duration, amount, payment_method, days_used, days_left, status, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          newBooking.id,
          newBooking.date,
          newBooking.clientId,
          newBooking.clientName,
          newBooking.phone,
          newBooking.email || null,
          newBooking.branch,
          newBooking.facility,
          newBooking.daysCount,
          newBooking.timeDuration,
          newBooking.amount,
          newBooking.paymentMethod,
          newBooking.daysUsed,
          newBooking.daysLeft,
          newBooking.status,
          newBooking.createdAt.replace('T', ' ').replace('Z', ''),
        ]
      );

      const payRef = `REF-${Date.now().toString().slice(-8)}`;
      await conn.execute(
        `INSERT INTO payments (id, reference, booking_id, client_id, amount, payment_method, payment_date, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, 'Completed')`,
        [
          `PAY-${Date.now().toString().slice(-6)}`,
          payRef,
          newBooking.id,
          newBooking.clientId,
          newBooking.amount,
          newBooking.paymentMethod,
          newBooking.date,
        ]
      );
    });

    auditRepository.logAction({
      user: 'System Admin',
      action: 'CREATE_BOOKING',
      entity: 'bookings',
      entityId: newBooking.id,
      newValue: newBooking,
    });

    return newBooking;
  }

  public async updateBooking(id: string, updatedFields: Partial<Booking>): Promise<Booking> {
    const bookings = await this.getAllBookings();
    const existing = bookings.find((b) => b.id === id);
    if (!existing) {
      throw new Error(`Booking with ID ${id} not found.`);
    }

    const daysCount = updatedFields.daysCount !== undefined ? Number(updatedFields.daysCount) : existing.daysCount;
    const daysUsed = updatedFields.daysUsed !== undefined ? Number(updatedFields.daysUsed) : existing.daysUsed;
    const daysLeft = Math.max(0, daysCount - daysUsed);

    await executeQuery(
      `UPDATE bookings SET client_name = COALESCE(?, client_name), phone = COALESCE(?, phone), email = COALESCE(?, email),
       branch = COALESCE(?, branch), facility = COALESCE(?, facility), days_count = ?, days_used = ?, days_left = ?,
       time_duration = COALESCE(?, time_duration), amount = COALESCE(?, amount), payment_method = COALESCE(?, payment_method),
       status = COALESCE(?, status) WHERE id = ?`,
      [
        updatedFields.clientName || null,
        updatedFields.phone || null,
        updatedFields.email || null,
        updatedFields.branch || null,
        updatedFields.facility || null,
        daysCount,
        daysUsed,
        daysLeft,
        updatedFields.timeDuration || null,
        updatedFields.amount !== undefined ? updatedFields.amount : null,
        updatedFields.paymentMethod || null,
        updatedFields.status || null,
        id,
      ]
    );

    const updatedBooking: Booking = {
      ...existing,
      ...updatedFields,
      id: existing.id,
      daysCount,
      daysUsed,
      daysLeft,
    };

    auditRepository.logAction({
      user: 'System Admin',
      action: 'UPDATE_BOOKING',
      entity: 'bookings',
      entityId: id,
      newValue: updatedBooking,
    });

    return updatedBooking;
  }

  public async getClients(query?: string): Promise<ClientSuggestion[]> {
    try {
      const rows = await executeQuery<any>(`SELECT id, name, phone, email FROM clients`);
      let list: ClientSuggestion[] = rows.map((r) => ({
        id: r.id,
        name: r.name,
        phone: r.phone || '',
        email: r.email || '',
      }));

      if (query) {
        const q = query.toLowerCase();
        list = list.filter(
          (c) =>
            c.name.toLowerCase().includes(q) ||
            c.phone.includes(q) ||
            (c.email && c.email.toLowerCase().includes(q)) ||
            c.id.toLowerCase().includes(q)
        );
      }

      return list;
    } catch (err) {
      console.error('Error fetching clients:', err);
      return [];
    }
  }
}
