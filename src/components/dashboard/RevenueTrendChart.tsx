import React, { useState, useEffect } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { DashboardFilters } from '../../types';

interface RevenueTrendChartProps {
  branchFilter?: string;
  filters?: DashboardFilters;
}

export type BranchCompareMode = 'art_tech' | 'hive' | 'compare';

export const RevenueTrendChart: React.FC<RevenueTrendChartProps> = ({ branchFilter, filters }) => {
  const [timeframe, setTimeframe] = useState<'7D' | '30D' | '12M'>('30D');
  const [compareMode, setCompareMode] = useState<BranchCompareMode>('compare');

  useEffect(() => {
    if (branchFilter === 'hive' || branchFilter === 'BR-002') {
      setCompareMode('hive');
    } else if (branchFilter === 'art_tech' || branchFilter === 'BR-001') {
      setCompareMode('art_tech');
    } else if (branchFilter === 'all') {
      setCompareMode('compare');
    }
  }, [branchFilter]);

  useEffect(() => {
    if (filters?.dateRange === 'last_7' || filters?.dateRange === '7D') {
      setTimeframe('7D');
    } else if (filters?.dateRange === 'last_12_months' || filters?.dateRange === '12M') {
      setTimeframe('12M');
    } else if (filters?.dateRange === 'last_30' || filters?.dateRange === 'this_month') {
      setTimeframe('30D');
    }
  }, [filters?.dateRange]);

  const chartData30D = [
    { date: 'Aug 01', artTechRevenue: 22800, hiveRevenue: 15600, expenses: 14200 },
    { date: 'Aug 05', artTechRevenue: 25100, hiveRevenue: 17000, expenses: 13800 },
    { date: 'Aug 10', artTechRevenue: 23500, hiveRevenue: 16300, expenses: 15100 },
    { date: 'Aug 15', artTechRevenue: 28900, hiveRevenue: 20000, expenses: 14500 },
    { date: 'Aug 20', artTechRevenue: 31200, hiveRevenue: 21200, expenses: 16200 },
    { date: 'Aug 25', artTechRevenue: 34500, hiveRevenue: 23600, expenses: 15900 },
    { date: 'Aug 30', artTechRevenue: 38200, hiveRevenue: 26000, expenses: 17400 },
  ];

  const chartData7D = [
    { date: 'Mon', artTechRevenue: 7400, hiveRevenue: 5000, expenses: 4200 },
    { date: 'Tue', artTechRevenue: 8800, hiveRevenue: 6000, expenses: 4800 },
    { date: 'Wed', artTechRevenue: 8200, hiveRevenue: 5700, expenses: 4100 },
    { date: 'Thu', artTechRevenue: 9800, hiveRevenue: 6700, expenses: 5100 },
    { date: 'Fri', artTechRevenue: 10800, hiveRevenue: 7400, expenses: 5400 },
    { date: 'Sat', artTechRevenue: 9000, hiveRevenue: 6100, expenses: 4900 },
    { date: 'Sun', artTechRevenue: 10200, hiveRevenue: 7200, expenses: 4600 },
  ];

  const chartData12M = [
    { date: 'Jan', artTechRevenue: 510000, hiveRevenue: 330000, expenses: 310000 },
    { date: 'Feb', artTechRevenue: 540000, hiveRevenue: 350000, expenses: 325000 },
    { date: 'Mar', artTechRevenue: 580000, hiveRevenue: 370000, expenses: 340000 },
    { date: 'Apr', artTechRevenue: 620000, hiveRevenue: 400000, expenses: 355000 },
    { date: 'May', artTechRevenue: 660000, hiveRevenue: 420000, expenses: 370000 },
    { date: 'Jun', artTechRevenue: 700000, hiveRevenue: 450000, expenses: 390000 },
    { date: 'Jul', artTechRevenue: 740000, hiveRevenue: 480000, expenses: 405000 },
    { date: 'Aug', artTechRevenue: 780000, hiveRevenue: 504500, expenses: 412800 },
  ];

  const rawData =
    timeframe === '7D'
      ? chartData7D
      : timeframe === '12M'
      ? chartData12M
      : chartData30D;

  const activeData = rawData.map((d) => {
    const artTechRev = d.artTechRevenue;
    const hiveRev = d.hiveRevenue;
    const totalRev = artTechRev + hiveRev;

    // Allocate expense proportionally per branch
    const artTechExp = Math.round(d.expenses * (artTechRev / (totalRev || 1)));
    const hiveExp = Math.round(d.expenses * (hiveRev / (totalRev || 1)));

    const artTechProfit = artTechRev - artTechExp;
    const hiveProfit = hiveRev - hiveExp;

    const revenue =
      compareMode === 'art_tech'
        ? artTechRev
        : compareMode === 'hive'
        ? hiveRev
        : totalRev;

    const expenses =
      compareMode === 'art_tech'
        ? artTechExp
        : compareMode === 'hive'
        ? hiveExp
        : d.expenses;

    const profit = revenue - expenses;

    return {
      ...d,
      artTechProfit,
      hiveProfit,
      revenue,
      expenses,
      profit,
    };
  });

  // Calculated Business Summaries
  const totalRevSum = activeData.reduce((acc, curr) => acc + curr.revenue, 0);
  const totalExpSum = activeData.reduce((acc, curr) => acc + curr.expenses, 0);
  const netProfit = totalRevSum - totalExpSum;
  const profitMargin = totalRevSum > 0 ? (netProfit / totalRevSum) * 100 : 0;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const dataPoint = payload[0]?.payload;

      if (compareMode === 'compare') {
        const artTechProf = dataPoint?.artTechProfit || 0;
        const hiveProf = dataPoint?.hiveProfit || 0;

        return (
          <div className="bg-white border border-gray-200 p-3.5 rounded-xl shadow-xl text-xs font-sans min-w-[190px]">
            <p className="font-bold text-gray-900 pb-2 mb-2 border-b border-gray-100 flex items-center justify-between">
              <span>{label}</span>
              <span className="text-[10px] text-gray-400 font-normal">Branch Profit</span>
            </p>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between gap-4">
                <span className="flex items-center gap-1.5 text-emerald-600 font-semibold">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-2xs"></span>
                  Art & Tech Hub:
                </span>
                <span className="font-bold text-emerald-700">₦{artTechProf.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="flex items-center gap-1.5 text-amber-600 font-semibold">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-2xs"></span>
                  Hive Hub:
                </span>
                <span className="font-bold text-amber-700">₦{hiveProf.toLocaleString()}</span>
              </div>
            </div>
          </div>
        );
      }

      const rev = dataPoint?.revenue || 0;
      const exp = dataPoint?.expenses || 0;

      return (
        <div className="bg-white border border-gray-200 p-3.5 rounded-xl shadow-xl text-xs font-sans min-w-[180px]">
          <p className="font-bold text-gray-900 pb-2 mb-2 border-b border-gray-100 flex items-center justify-between">
            <span>{label}</span>
            <span className="text-[10px] text-gray-400 font-normal">
              {compareMode === 'art_tech' ? 'Art & Tech Hub' : compareMode === 'hive' ? 'Hive Hub' : 'All Branches'}
            </span>
          </p>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-1.5 text-blue-600 font-semibold">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-2xs"></span>
                Revenue:
              </span>
              <span className="font-bold text-gray-900">₦{rev.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-1.5 text-red-600 font-semibold">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-2xs"></span>
                Expenses:
              </span>
              <span className="font-bold text-gray-900">₦{exp.toLocaleString()}</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white border border-gray-200/80 rounded-2xl p-6 shadow-2xs font-sans flex flex-col justify-between h-full">
      {/* Header without Realtime badge */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="font-heading text-lg font-bold text-gray-900 tracking-tight">
            Revenue & Operational Trend
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Gross revenue stream vs operational expense ledgers
          </p>
        </div>

        {/* Branch Compare Mode & Timeframe Selector */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Compare Branches Mode Switcher */}
          <div className="flex items-center bg-gray-100 p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setCompareMode('art_tech')}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                compareMode === 'art_tech'
                  ? 'bg-white text-blue-700 shadow-2xs font-bold'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Art & Tech Hub
            </button>
            <button
              onClick={() => setCompareMode('hive')}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                compareMode === 'hive'
                  ? 'bg-white text-blue-700 shadow-2xs font-bold'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Hive Hub
            </button>
            <button
              onClick={() => setCompareMode('compare')}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                compareMode === 'compare'
                  ? 'bg-blue-600 text-white shadow-2xs font-bold'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <i className="fa-solid fa-code-compare text-[10px]"></i>
              <span>Compare Branches</span>
            </button>
          </div>

          {/* Timeframe selector */}
          <div className="flex bg-gray-100 p-1 rounded-xl text-xs font-semibold">
            {(['7D', '30D', '12M'] as const).map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  timeframe === tf
                    ? 'bg-white text-gray-900 shadow-2xs font-bold'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Legend Row */}
      <div className="flex items-center gap-5 mb-3 text-xs font-medium">
        {compareMode === 'compare' ? (
          <>
            <span className="flex items-center gap-1.5 text-gray-800 font-semibold">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              Art & Tech Hub Profit (Green)
            </span>
            <span className="flex items-center gap-1.5 text-gray-800 font-semibold">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
              Hive Hub Profit (Yellow)
            </span>
          </>
        ) : (
          <>
            <span className="flex items-center gap-1.5 text-gray-800 font-semibold">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
              Revenue (Blue)
            </span>
            <span className="flex items-center gap-1.5 text-gray-800 font-semibold">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
              Expenses (Red)
            </span>
          </>
        )}
      </div>

      {/* Chart Canvas */}
      <div className="w-full h-64 sm:h-72">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={activeData}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.01} />
              </linearGradient>
              <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#EF4444" stopOpacity={0.22} />
                <stop offset="95%" stopColor="#EF4444" stopOpacity={0.01} />
              </linearGradient>
              <linearGradient id="colorArtTechProfit" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#10B981" stopOpacity={0.01} />
              </linearGradient>
              <linearGradient id="colorHiveProfit" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#F59E0B" stopOpacity={0.01} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#F1F5F9"
            />
            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#64748B', fontSize: 11 }}
              dy={5}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#64748B', fontSize: 11 }}
              tickFormatter={(val) =>
                val >= 1000000
                  ? `₦${(val / 1000000).toFixed(1)}M`
                  : val >= 1000
                  ? `₦${(val / 1000).toFixed(0)}k`
                  : `₦${val}`
              }
            />
            <Tooltip content={<CustomTooltip />} />
            {compareMode === 'compare' ? (
              <>
                <Area
                  type="monotone"
                  dataKey="artTechProfit"
                  name="Art & Tech Hub Profit"
                  stroke="#10B981"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorArtTechProfit)"
                />
                <Area
                  type="monotone"
                  dataKey="hiveProfit"
                  name="Hive Hub Profit"
                  stroke="#F59E0B"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorHiveProfit)"
                />
              </>
            ) : (
              <>
                <Area
                  type="monotone"
                  dataKey="revenue"
                  name="Revenue"
                  stroke="#2563EB"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorRevenue)"
                />
                <Area
                  type="monotone"
                  dataKey="expenses"
                  name="Expenses"
                  stroke="#DC2626"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorExpenses)"
                />
              </>
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Footer Business Summaries (Four Metrics) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 border-t border-gray-100 pt-4 mt-4 text-left">
        <div>
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
            Total Revenue
          </span>
          <span className="text-sm font-extrabold text-blue-600 mt-0.5 block font-heading">
            ₦{totalRevSum.toLocaleString()}
          </span>
        </div>
        <div>
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
            Total Expenses
          </span>
          <span className="text-sm font-extrabold text-rose-600 mt-0.5 block font-heading">
            ₦{totalExpSum.toLocaleString()}
          </span>
        </div>
        <div>
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
            Net Profit
          </span>
          <span className="text-sm font-extrabold text-emerald-600 mt-0.5 block font-heading">
            ₦{netProfit.toLocaleString()}
          </span>
        </div>
        <div>
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
            Profit Margin
          </span>
          <span className="text-sm font-extrabold text-purple-600 mt-0.5 block font-heading">
            {profitMargin.toFixed(1)}%
          </span>
        </div>
      </div>
    </div>
  );
};
