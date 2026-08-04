import { ExpenseRepository } from '../repositories/expenseRepository';
import { OperationsRepository } from '../repositories/operationsRepository';
import { FinanceReportFilters, FinanceAnalyticsSummary, Expense } from '../../src/types';

export class FinanceService {
  private opsRepo: OperationsRepository;

  constructor(private expenseRepo: ExpenseRepository) {
    this.opsRepo = new OperationsRepository();
  }

  public async getFinanceAnalytics(filters?: FinanceReportFilters): Promise<FinanceAnalyticsSummary> {
    const todayStr = new Date().toISOString().substring(0, 10);
    const period = filters?.period || 'this_month';
    const selectedBranch = filters?.branch || 'all';

    const isDateInPeriod = (dateStr: string): boolean => {
      if (period === 'today') {
        return dateStr === todayStr;
      }
      if (period === 'last_7_days') {
        const d = new Date(todayStr);
        d.setDate(d.getDate() - 7);
        const sevenDaysAgo = d.toISOString().substring(0, 10);
        return dateStr >= sevenDaysAgo && dateStr <= todayStr;
      }
      if (period === 'this_month') {
        return dateStr.startsWith(todayStr.substring(0, 7));
      }
      if (period === 'full_year') {
        return dateStr.startsWith(todayStr.substring(0, 4));
      }
      if (period === 'custom' && filters?.startDate && filters?.endDate) {
        return dateStr >= filters.startDate && dateStr <= filters.endDate;
      }
      return true;
    };

    const allBookings = await this.opsRepo.getAllBookings();
    let filteredBookings = allBookings.filter((b) => isDateInPeriod(b.date));

    if (selectedBranch !== 'all') {
      const bLower = selectedBranch.toLowerCase();
      filteredBookings = filteredBookings.filter((b) =>
        b.branch.toLowerCase().includes(bLower)
      );
    }

    const totalRevenue = filteredBookings.reduce((sum, b) => sum + b.amount, 0);
    const totalBookings = filteredBookings.length;
    const uniqueClientsSet = new Set(filteredBookings.map((b) => b.clientId || b.clientName));
    const uniqueClients = uniqueClientsSet.size;
    const averageBookingValue = totalBookings > 0 ? Math.round(totalRevenue / totalBookings) : 0;

    const allExpenses = await this.expenseRepo.getAllExpenses();
    let filteredExpenses = allExpenses.filter((e) => isDateInPeriod(e.date));

    const getEffectiveExpenseAmount = (e: Expense): number => {
      if (
        selectedBranch !== 'all' &&
        selectedBranch !== 'Both Branches' &&
        e.branch === 'Both Branches'
      ) {
        return e.amount / 2;
      }
      return e.amount;
    };

    if (selectedBranch !== 'all') {
      const bLower = selectedBranch.toLowerCase();
      filteredExpenses = filteredExpenses.filter((e) => {
        const eBranch = e.branch.toLowerCase();
        if (eBranch === bLower) return true;
        if (
          eBranch === 'both branches' &&
          (bLower === 'art & tech hub' || bLower === 'hive hub' || bLower === 'both branches')
        ) {
          return true;
        }
        return false;
      });
    }

    const totalExpenses = filteredExpenses.reduce(
      (sum, e) => sum + getEffectiveExpenseAmount(e),
      0
    );

    const netProfit = totalRevenue - totalExpenses;
    const netProfitMargin =
      totalRevenue > 0 ? Math.round(((totalRevenue - totalExpenses) / totalRevenue) * 100) : 0;

    const dateMap = new Map<string, { revenue: number; expenses: number }>();
    const datesList: string[] = [];

    if (period === 'last_7_days') {
      for (let i = 6; i >= 0; i--) {
        const d = new Date(todayStr);
        d.setDate(d.getDate() - i);
        datesList.push(d.toISOString().slice(0, 10));
      }
    } else if (period === 'this_month') {
      const ym = todayStr.substring(0, 7);
      for (let i = 1; i <= 31; i++) {
        const dayStr = i.toString().padStart(2, '0');
        datesList.push(`${ym}-${dayStr}`);
      }
    } else {
      const allDates = new Set([
        ...filteredBookings.map((b) => b.date),
        ...filteredExpenses.map((e) => e.date),
      ]);
      datesList.push(...Array.from(allDates).sort());
    }

    for (const d of datesList) {
      dateMap.set(d, { revenue: 0, expenses: 0 });
    }

    for (const b of filteredBookings) {
      if (dateMap.has(b.date)) {
        dateMap.get(b.date)!.revenue += b.amount;
      } else {
        dateMap.set(b.date, { revenue: b.amount, expenses: 0 });
      }
    }

    for (const e of filteredExpenses) {
      const amt = getEffectiveExpenseAmount(e);
      if (dateMap.has(e.date)) {
        dateMap.get(e.date)!.expenses += amt;
      } else {
        dateMap.set(e.date, { revenue: 0, expenses: amt });
      }
    }

    const revenueVsExpensesChart = Array.from(dateMap.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([d, val]) => ({
        period: d.slice(5),
        revenue: val.revenue,
        expenses: val.expenses,
        profit: val.revenue - val.expenses,
      }));

    const months = ['2026-01', '2026-02', '2026-03', '2026-04', '2026-05', '2026-06', '2026-07', '2026-08'];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'];

    const monthlyRevenueChart = months.map((m, idx) => {
      const mBookings = allBookings.filter((b) => {
        if (!b.date.startsWith(m)) return false;
        if (selectedBranch !== 'all') {
          return b.branch.toLowerCase().includes(selectedBranch.toLowerCase());
        }
        return true;
      });
      const mExpenses = allExpenses.filter((e) => {
        if (!e.date.startsWith(m)) return false;
        if (selectedBranch !== 'all') {
          const eBranch = e.branch.toLowerCase();
          const bLower = selectedBranch.toLowerCase();
          return eBranch === bLower || (eBranch === 'both branches' && (bLower === 'art & tech hub' || bLower === 'hive hub'));
        }
        return true;
      });

      const rev = mBookings.reduce((sum, b) => sum + b.amount, 0);
      const exp = mExpenses.reduce((sum, e) => sum + getEffectiveExpenseAmount(e), 0);

      return {
        month: monthNames[idx],
        revenue: rev,
        expenses: exp,
        profit: rev - exp,
      };
    });

    const facilityMap = new Map<string, number>();
    for (const b of filteredBookings) {
      facilityMap.set(b.facility, (facilityMap.get(b.facility) || 0) + b.amount);
    }

    const facilityRevenueBreakdown = Array.from(facilityMap.entries())
      .map(([facility, revenue]) => ({
        facility,
        revenue,
        percentage: totalRevenue > 0 ? Math.round((revenue / totalRevenue) * 100) : 0,
      }))
      .sort((a, b) => b.revenue - a.revenue);

    const categoryMap = new Map<string, number>();
    for (const e of filteredExpenses) {
      const amt = getEffectiveExpenseAmount(e);
      categoryMap.set(e.category, (categoryMap.get(e.category) || 0) + amt);
    }

    const expenseCategoryBreakdown = Array.from(categoryMap.entries())
      .map(([category, amount]) => ({
        category,
        amount,
        percentage: totalExpenses > 0 ? Math.round((amount / totalExpenses) * 100) : 0,
      }))
      .sort((a, b) => b.amount - a.amount);

    const topFacilityStats = new Map<string, { count: number; revenue: number }>();
    for (const b of filteredBookings) {
      const cur = topFacilityStats.get(b.facility) || { count: 0, revenue: 0 };
      topFacilityStats.set(b.facility, {
        count: cur.count + 1,
        revenue: cur.revenue + b.amount,
      });
    }

    const topFacilities = Array.from(topFacilityStats.entries())
      .map(([facility, data]) => ({
        facility,
        bookingsCount: data.count,
        revenue: data.revenue,
      }))
      .sort((a, b) => b.revenue - a.revenue);

    const topExpStats = new Map<string, { count: number; totalAmount: number }>();
    for (const e of filteredExpenses) {
      const amt = getEffectiveExpenseAmount(e);
      const cur = topExpStats.get(e.category) || { count: 0, totalAmount: 0 };
      topExpStats.set(e.category, {
        count: cur.count + 1,
        totalAmount: cur.totalAmount + amt,
      });
    }

    const topExpenseCategories = Array.from(topExpStats.entries())
      .map(([category, data]) => ({
        category,
        count: data.count,
        totalAmount: data.totalAmount,
      }))
      .sort((a, b) => b.totalAmount - a.totalAmount);

    const expenseItems = filteredExpenses
      .map((e) => ({
        id: e.id,
        name: e.name,
        category: e.category,
        amount: getEffectiveExpenseAmount(e),
        date: e.date,
        branch: e.branch,
      }))
      .sort((a, b) => b.amount - a.amount);

    return {
      totalRevenue,
      totalExpenses,
      netProfit,
      netProfitMargin,
      totalBookings,
      uniqueClients,
      averageBookingValue,
      revenueVsExpensesChart,
      monthlyRevenueChart,
      facilityRevenueBreakdown,
      expenseCategoryBreakdown,
      topFacilities,
      topExpenseCategories,
      expenseItems,
    };
  }
}
