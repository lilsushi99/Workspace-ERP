import { useState, useEffect, useCallback } from 'react';
import { Booking, DailyLoggerSummary, FacilityRecordSummary, ClientSuggestion } from '../types';
import { OperationsApiService } from '../services/operationsService';

export function useOperations(branchFilter: string = 'all') {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [summary, setSummary] = useState<DailyLoggerSummary>({
    monthlyRevenue: 0,
    totalBookings: 0,
    activeBookings: 0,
    expiredBookings: 0,
    activeSubscriptions: 0,
    expiredSubscriptions: 0,
  });
  const [facilityRecords, setFacilityRecords] = useState<FacilityRecordSummary[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filters for Daily Logger
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [monthFilter, setMonthFilter] = useState<string>('this_month');
  const [branchSelect, setBranchSelect] = useState<string>(branchFilter);

  // Sync branchSelect if global filter changes
  useEffect(() => {
    setBranchSelect(branchFilter);
  }, [branchFilter]);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [bookingsRes, facilitiesRes] = await Promise.all([
        OperationsApiService.fetchBookings({
          branch: branchSelect,
          month: monthFilter === 'this_month' ? '2026-08' : undefined,
          search: searchTerm,
        }),
        OperationsApiService.fetchFacilityRecords(branchSelect),
      ]);

      setBookings(bookingsRes.bookings);
      setSummary(bookingsRes.summary);
      setFacilityRecords(facilitiesRes);
    } catch (err: any) {
      setError(err.message || 'Failed to load operations data');
    } finally {
      setLoading(false);
    }
  }, [branchSelect, monthFilter, searchTerm]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const addBooking = async (newBooking: Omit<Booking, 'id' | 'createdAt'>) => {
    try {
      const created = await OperationsApiService.createBooking(newBooking);
      await loadData();
      return created;
    } catch (err: any) {
      alert(`Error creating booking: ${err.message}`);
      throw err;
    }
  };

  const editBooking = async (id: string, updatedFields: Partial<Booking>) => {
    try {
      const updated = await OperationsApiService.updateBooking(id, updatedFields);
      await loadData();
      return updated;
    } catch (err: any) {
      alert(`Error updating booking: ${err.message}`);
      throw err;
    }
  };

  const exportData = (type: 'csv' | 'excel', target: 'bookings' | 'facilities') => {
    if (target === 'bookings') {
      const headers = [
        'Booking ID',
        'Date',
        'Client Name',
        'Client ID',
        'Branch',
        'Facility',
        'Amount ($)',
        'Payment Method',
        'Days Used',
        'Days Left',
        'Status',
      ];
      const rows = bookings.map((b) => [
        b.id,
        b.date,
        `"${b.clientName}"`,
        b.clientId,
        `"${b.branch}"`,
        `"${b.facility}"`,
        b.amount,
        b.paymentMethod,
        b.daysUsed,
        b.daysLeft,
        b.status,
      ]);

      const csvContent =
        'data:text/csv;charset=utf-8,' +
        [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute(
        'download',
        `Daily_Logger_Bookings_${new Date().toISOString().slice(0, 10)}.${
          type === 'excel' ? 'xls' : 'csv'
        }`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      const headers = [
        'Facility Name',
        'Bookings Count',
        'Total Revenue ($)',
        'Branch',
        'Average Spend ($)',
        'Occupancy Rate (%)',
        'Status',
      ];
      const rows = facilityRecords.map((f) => [
        `"${f.facility}"`,
        f.bookings,
        f.revenue,
        `"${f.branch}"`,
        f.averageRevenue,
        `${f.occupancy}%`,
        f.status,
      ]);

      const csvContent =
        'data:text/csv;charset=utf-8,' +
        [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute(
        'download',
        `Facility_Records_Report_${new Date().toISOString().slice(0, 10)}.${
          type === 'excel' ? 'xls' : 'csv'
        }`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return {
    bookings,
    summary,
    facilityRecords,
    loading,
    error,
    searchTerm,
    setSearchTerm,
    monthFilter,
    setMonthFilter,
    branchSelect,
    setBranchSelect,
    addBooking,
    editBooking,
    exportData,
    refetch: loadData,
  };
}
