import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { DashboardFilters } from '../../types';

interface ExpenseOverviewCardProps {
  branchFilter?: string;
  filters?: DashboardFilters;
}

interface ExpenseCategoryData {
  name: string;
  value: number;
  color: string;
  icon: string;
}

export const ExpenseOverviewCard: React.FC<ExpenseOverviewCardProps> = ({
  branchFilter = 'all',
  filters,
}) => {
  // Base raw expense category metrics (up to 10 items)
  const baseExpenses: ExpenseCategoryData[] = [
    { name: 'Internet', value: 24500, color: '#2563EB', icon: 'fa-wifi' },
    { name: 'Starlink', value: 18200, color: '#0284C7', icon: 'fa-satellite-dish' },
    { name: 'Utilities', value: 16800, color: '#7C3AED', icon: 'fa-bolt' },
    { name: 'Fuel & Generator', value: 14200, color: '#D97706', icon: 'fa-gas-pump' },
    { name: 'Maintenance', value: 12400, color: '#10B981', icon: 'fa-wrench' },
    { name: 'Cleaning & Janitorial', value: 8600, color: '#06B6D4', icon: 'fa-broom' },
    { name: 'Software & Cloud Services', value: 7200, color: '#059669', icon: 'fa-cloud' },
    { name: 'Security & Access Control', value: 6100, color: '#DC2626', icon: 'fa-shield-halved' },
    { name: 'Printing & Stationery', value: 5400, color: '#8B5CF6', icon: 'fa-print' },
    { name: 'Transport & Freight', value: 4800, color: '#EC4899', icon: 'fa-truck-ramp-box' },
  ];

  // Apply branch multiplier
  let branchMultiplier = 1.0;
  if (branchFilter === 'BR-001' || branchFilter === 'Art & Tech Hub') {
    branchMultiplier = 0.58;
  } else if (branchFilter === 'BR-002' || branchFilter === 'Hive Hub') {
    branchMultiplier = 0.42;
  } else if (branchFilter === 'BR-003' || branchFilter === 'London Main') {
    branchMultiplier = 0.35;
  }

  // Apply date range multiplier
  let rangeMultiplier = 1.0;
  if (filters?.dateRange === 'today') rangeMultiplier = 0.05;
  else if (filters?.dateRange === 'this_week') rangeMultiplier = 0.25;
  else if (filters?.dateRange === 'this_quarter') rangeMultiplier = 3.0;
  else if (filters?.dateRange === 'this_year') rangeMultiplier = 12.0;

  const data = baseExpenses.map((item) => ({
    ...item,
    value: Math.round(item.value * branchMultiplier * rangeMultiplier),
  }));

  const totalExpense = data.reduce((acc, curr) => acc + curr.value, 0);

  return (
    <div className="bg-white border border-gray-200/80 rounded-2xl p-6 shadow-2xs font-sans flex flex-col justify-between h-full min-h-[380px]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-3">
        <div>
          <h3 className="font-heading text-sm font-bold text-gray-900 leading-none flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-600"></span>
            Expense Overview
          </h3>
          <p className="text-[11px] font-medium text-gray-500 mt-1">
            Categorized operational expenditure breakdown
          </p>
        </div>
        <div className="text-right">
          <span className="text-[10px] uppercase tracking-wider font-bold text-gray-400 block">
            Total Operating Expenses
          </span>
          <span className="text-sm font-bold text-gray-900 font-mono">
            ₦{totalExpense.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Pie Chart & Center Metric */}
      <div className="relative flex-1 flex items-center justify-center min-h-[190px]">
        <ResponsiveContainer width="100%" height={190}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={52}
              outerRadius={78}
              paddingAngle={3}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number) => [`₦${value.toLocaleString()}`, 'Expense']}
              contentStyle={{
                backgroundColor: '#1E293B',
                border: 'none',
                borderRadius: '12px',
                color: '#FFF',
                fontSize: '11px',
                padding: '8px 12px',
              }}
              itemStyle={{ color: '#F8FAFC' }}
            />
          </PieChart>
        </ResponsiveContainer>

        {/* Center Donut Label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
          <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
            Categories
          </span>
          <span className="text-xs font-bold text-gray-900 font-heading">
            {data.length} Items
          </span>
        </div>
      </div>

      {/* Custom Category Grid Legend */}
      <div className="grid grid-cols-2 gap-2 pt-3 border-t border-gray-100 max-h-[140px] overflow-y-auto pr-1 custom-scrollbar">
        {data.map((item, idx) => {
          const percent = totalExpense > 0 ? ((item.value / totalExpense) * 100).toFixed(1) : '0';
          return (
            <div
              key={idx}
              className="flex items-center justify-between p-2 rounded-xl bg-gray-50/80 border border-gray-100 hover:bg-gray-100/80 transition-colors"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-[11px] font-medium text-gray-700 truncate">
                  {item.name}
                </span>
              </div>
              <div className="text-right shrink-0 pl-1">
                <span className="text-[11px] font-bold text-gray-900 font-mono block leading-none">
                  ₦{item.value.toLocaleString()}
                </span>
                <span className="text-[9px] text-gray-400 font-medium">
                  {percent}%
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
