import React, { useState } from 'react';
import { TopCustomer } from '../../types';

interface TopCustomersCardProps {
  branchFilter?: string;
}

export const TopCustomersCard: React.FC<TopCustomersCardProps> = () => {
  const [sortBy, setSortBy] = useState<'revenue' | 'frequency'>('revenue');

  const customers: TopCustomer[] = [
    {
      id: 'cust-1',
      name: 'Acme Enterprise Corp',
      company: 'Logistics & Supply',
      avatarText: 'AC',
      avatarBg: 'bg-blue-600 text-white',
      revenue: '₦148,500',
      revenueRaw: 148500,
      frequency: 184,
      growth: '+24%',
      status: 'VIP',
    },
    {
      id: 'cust-2',
      name: 'GlobalTech Solutions',
      company: 'Software Systems',
      avatarText: 'GT',
      avatarBg: 'bg-indigo-600 text-white',
      revenue: '₦132,400',
      revenueRaw: 132400,
      frequency: 212, // Higher frequency than Acme!
      growth: '+18%',
      status: 'Enterprise',
    },
    {
      id: 'cust-3',
      name: 'Vertex Holdings Group',
      company: 'Financial Services',
      avatarText: 'VH',
      avatarBg: 'bg-emerald-600 text-white',
      revenue: '₦115,800',
      revenueRaw: 115800,
      frequency: 142,
      growth: '+12%',
      status: 'VIP',
    },
    {
      id: 'cust-4',
      name: 'Horizon Media Partners',
      company: 'Communications',
      avatarText: 'HM',
      avatarBg: 'bg-amber-600 text-white',
      revenue: '₦94,200',
      revenueRaw: 94200,
      frequency: 195,
      growth: '+15%',
      status: 'Active',
    },
    {
      id: 'cust-5',
      name: 'Apex Financial Services',
      company: 'Investment Banking',
      avatarText: 'AF',
      avatarBg: 'bg-violet-600 text-white',
      revenue: '₦88,600',
      revenueRaw: 88600,
      frequency: 118,
      growth: '+9%',
      status: 'Active',
    },
  ];

  const sortedCustomers = [...customers].sort((a, b) =>
    sortBy === 'revenue' ? b.revenueRaw - a.revenueRaw : b.frequency - a.frequency
  );

  return (
    <div className="bg-white border border-gray-200/80 rounded-2xl p-6 shadow-2xs font-sans flex flex-col justify-between h-[480px] overflow-hidden">
      {/* Header with Switch / Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <h3 className="font-heading text-lg font-bold text-gray-900 tracking-tight">
            Top Enterprise Customers
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Key client rankings by transaction activity
          </p>
        </div>

        {/* Sort Switch: Revenue vs Frequency */}
        <div className="flex items-center bg-gray-100 p-1 rounded-xl text-xs font-semibold self-start sm:self-auto">
          <button
            onClick={() => setSortBy('revenue')}
            className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
              sortBy === 'revenue'
                ? 'bg-white text-blue-700 shadow-2xs font-bold'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Revenue
          </button>
          <button
            onClick={() => setSortBy('frequency')}
            className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
              sortBy === 'frequency'
                ? 'bg-white text-blue-700 shadow-2xs font-bold'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Frequency
          </button>
        </div>
      </div>

      {/* Ranked Customer List */}
      <div className="space-y-3 flex-1 overflow-y-auto pr-1">
        {sortedCustomers.slice(0, 5).map((cust, idx) => (
          <div
            key={cust.id}
            className="flex items-center justify-between p-3.5 rounded-xl border border-gray-100 bg-[#F8F9FB] hover:bg-blue-50/50 hover:border-blue-100 transition-all cursor-pointer group"
          >
            {/* Rank Number + Avatar + Info */}
            <div className="flex items-center gap-3 min-w-0">
              <span className="w-5 font-heading text-xs font-bold text-gray-400 text-center shrink-0">
                #{idx + 1}
              </span>
              <div
                className={`w-9 h-9 rounded-xl ${cust.avatarBg} font-heading font-bold flex items-center justify-center text-xs shadow-xs shrink-0`}
              >
                {cust.avatarText}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-heading font-bold text-xs text-gray-900 truncate group-hover:text-blue-700 transition-colors">
                    {cust.name}
                  </span>
                  {cust.status === 'VIP' && (
                    <span className="px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 text-[9px] font-bold uppercase tracking-wider">
                      VIP
                    </span>
                  )}
                </div>
                <span className="text-[11px] text-gray-500 truncate block">
                  {cust.company}
                </span>
              </div>
            </div>

            {/* Metric Output based on Sort Switch */}
            <div className="text-right shrink-0 pl-3">
              <div className="font-heading font-bold text-xs text-gray-900">
                {sortBy === 'revenue' ? (
                  cust.revenue
                ) : (
                  <span>{cust.frequency} orders</span>
                )}
              </div>
              <div className="text-[10px] font-semibold text-emerald-600 flex items-center justify-end gap-1 mt-0.5">
                <i className="fa-solid fa-arrow-up-right text-[9px]"></i>
                {cust.growth}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer Link */}
      <div className="border-t border-gray-100 pt-3.5 mt-4 text-center">
        <button
          onClick={() => alert('Opening Full Client Directory CRM...')}
          className="text-xs font-semibold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1.5 cursor-pointer transition-colors"
        >
          <span>View All Enterprise Accounts</span>
          <i className="fa-solid fa-arrow-right text-[10px]"></i>
        </button>
      </div>
    </div>
  );
};
