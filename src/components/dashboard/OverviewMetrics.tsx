import React from 'react';
import { MetricCardData, DashboardFilters } from '../../types';

interface OverviewMetricsProps {
  branchFilter?: string;
  filters?: DashboardFilters;
}

export const OverviewMetrics: React.FC<OverviewMetricsProps> = ({
  branchFilter = 'all',
  filters,
}) => {
  const selectedBranch = filters?.branch || branchFilter;
  const selectedRange = filters?.dateRange || 'this_month';

  // Dynamic multiplier based on branch and date range filters
  let branchMultiplier = 1;
  if (selectedBranch === 'art_tech' || selectedBranch === 'ath') branchMultiplier = 0.58;
  if (selectedBranch === 'hive') branchMultiplier = 0.42;

  let rangeMultiplier = 1;
  if (selectedRange === 'last_7') rangeMultiplier = 0.24;
  if (selectedRange === 'last_30') rangeMultiplier = 0.92;
  if (selectedRange === 'this_month') rangeMultiplier = 1.0;
  if (selectedRange === 'last_12_months') rangeMultiplier = 11.5;
  if (selectedRange === 'custom') rangeMultiplier = 1.25;

  const baseRevenue = 1284500 * branchMultiplier * rangeMultiplier;
  const baseExpenses = 412800 * branchMultiplier * rangeMultiplier;
  const netProfit = baseRevenue - baseExpenses;
  const totalBookings = Math.round(1895 * branchMultiplier * rangeMultiplier);
  const occupancyRate = (88.4 * (selectedBranch === 'hive' ? 0.96 : 1.01)).toFixed(1);

  const formatCurrency = (val: number) =>
    `₦${Math.round(val).toLocaleString()}`;

  const metrics: MetricCardData[] = [
    {
      id: 'revenue',
      title: 'Total Revenue',
      value: formatCurrency(baseRevenue),
      change: '+12.4%',
      isPositive: true,
      timeframe: 'vs last period',
      iconClass: 'fa-solid fa-dollar-sign',
      iconBg: 'bg-blue-50 border border-blue-100',
      iconColor: 'text-blue-600',
    },
    {
      id: 'expenses',
      title: 'Operating Expenses',
      value: formatCurrency(baseExpenses),
      change: '-3.1%',
      isPositive: true, // Reduced expenses is positive
      timeframe: 'vs last period',
      iconClass: 'fa-solid fa-credit-card',
      iconBg: 'bg-slate-50 border border-slate-200/80',
      iconColor: 'text-slate-600',
    },
    {
      id: 'net_profit',
      title: 'Net Profit',
      value: formatCurrency(netProfit),
      change: '+18.2%',
      isPositive: true,
      timeframe: 'vs last period',
      iconClass: 'fa-solid fa-chart-pie',
      iconBg: 'bg-emerald-50 border border-emerald-100',
      iconColor: 'text-emerald-600',
    },
    {
      id: 'total_bookings',
      title: 'Total Bookings',
      value: `${totalBookings.toLocaleString()}`,
      change: '+8.6%',
      isPositive: true,
      timeframe: 'vs last period',
      iconClass: 'fa-solid fa-calendar-check',
      iconBg: 'bg-indigo-50 border border-indigo-100',
      iconColor: 'text-indigo-600',
    },
    {
      id: 'occupancy',
      title: 'Overall Occupancy Rate',
      value: `${occupancyRate}%`,
      change: '+2.1%',
      isPositive: true,
      timeframe: 'vs target',
      iconClass: 'fa-solid fa-building',
      iconBg: 'bg-amber-50 border border-amber-100',
      iconColor: 'text-amber-600',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-6 font-sans">
      {metrics.map((card) => (
        <div
          key={card.id}
          className="h-full bg-white border border-gray-200/80 rounded-2xl p-5 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between group overflow-hidden min-w-0"
        >
          {/* Top row: Title (wrapping allowed) and Icon */}
          <div className="flex items-start justify-between gap-2 mb-3">
            <span className="text-xs font-semibold text-gray-500 whitespace-normal break-words leading-snug flex-1">
              {card.title}
            </span>
            <div
              className={`w-8 h-8 rounded-xl ${card.iconBg} ${card.iconColor} flex items-center justify-center text-xs shrink-0 group-hover:scale-105 transition-transform`}
            >
              <i className={card.iconClass}></i>
            </div>
          </div>

          {/* Middle: Value (contained without overflow) */}
          <div className="mb-2 min-w-0">
            <span className="font-heading text-lg sm:text-xl md:text-2xl font-bold text-gray-900 tracking-tight block truncate break-words">
              {card.value}
            </span>
          </div>

          {/* Bottom row: Trend indicator */}
          <div className="flex items-center gap-1.5 text-xs font-medium min-w-0">
            <span
              className={`inline-flex items-center gap-1 font-bold shrink-0 ${
                card.isPositive ? 'text-emerald-600' : 'text-rose-600'
              }`}
            >
              <i
                className={`fa-solid ${
                  card.isPositive ? 'fa-arrow-up-right' : 'fa-arrow-down-right'
                } text-[10px]`}
              ></i>
              {card.change}
            </span>
            <span className="text-gray-400 text-[11px] truncate">
              {card.timeframe}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};
