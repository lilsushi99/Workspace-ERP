import React, { useState } from 'react';
import { useOperations } from '../../hooks/useOperations';
import { FacilityAnalyticsTable } from './FacilityAnalyticsTable';

interface FacilityRecordsProps {
  branchFilter?: string;
}

export const FacilityRecords: React.FC<FacilityRecordsProps> = ({ branchFilter = 'all' }) => {
  const {
    facilityRecords,
    loading,
    error,
    branchSelect,
    setBranchSelect,
    exportData,
  } = useOperations(branchFilter);

  const [monthFilter, setMonthFilter] = useState('Aug 2026');
  const [yearFilter, setYearFilter] = useState('2026');
  const [dateRange, setDateRange] = useState('Full Month');
  const [compareBranches, setCompareBranches] = useState(false);

  const branches = [
    { id: 'all', label: 'All Branches (Global)' },
    { id: 'London Main', label: 'London Main Branch' },
    { id: 'New York HQ', label: 'New York HQ' },
    { id: 'Tokyo Hub', label: 'Tokyo Distribution Hub' },
    { id: 'Singapore Hub', label: 'Singapore Bay Facility' },
    { id: 'Paris Depot', label: 'Paris Depot' },
  ];

  return (
    <div className="space-y-6 font-sans">
      {/* Top Banner & Title */}
      <div className="bg-white border border-gray-200/80 rounded-2xl p-6 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="font-heading text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
            Facility Records & Yield Sheets
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Auto-generated from Daily Logger check-ins. No manual entry required.
          </p>
        </div>

        {/* Informational Pill */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gray-50 border border-gray-200 text-xs font-medium text-gray-600 self-start md:self-auto">
          <i className="fa-solid fa-sync text-emerald-600 text-xs animate-spin"></i>
          <span>Synced with Daily Logger</span>
        </div>
      </div>

      {/* Unified Filters Bar */}
      <div className="bg-white border border-gray-200/80 rounded-2xl p-4 shadow-2xs flex flex-wrap items-center justify-between gap-4">
        {/* Left Filter Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-wider pr-2 border-r border-gray-200">
            <i className="fa-solid fa-filter text-blue-600 text-xs"></i>
            <span>Sheet Filters</span>
          </div>

          {/* Branch Filter */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <i className="fa-solid fa-building-user text-xs"></i>
            </div>
            <select
              value={branchSelect}
              onChange={(e) => setBranchSelect(e.target.value)}
              className="pl-8 pr-8 py-2 bg-gray-50 hover:bg-gray-100/80 border border-gray-200 rounded-xl text-xs font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all cursor-pointer appearance-none"
            >
              {branches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.label}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 pr-2.5 flex items-center pointer-events-none text-gray-400">
              <i className="fa-solid fa-chevron-down text-[10px]"></i>
            </div>
          </div>

          {/* Month Filter */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <i className="fa-regular fa-calendar-days text-xs"></i>
            </div>
            <select
              value={monthFilter}
              onChange={(e) => setMonthFilter(e.target.value)}
              className="pl-8 pr-8 py-2 bg-gray-50 hover:bg-gray-100/80 border border-gray-200 rounded-xl text-xs font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all cursor-pointer appearance-none"
            >
              <option value="Aug 2026">August 2026</option>
              <option value="Jul 2026">July 2026</option>
              <option value="Jun 2026">June 2026</option>
            </select>
            <div className="absolute inset-y-0 right-0 pr-2.5 flex items-center pointer-events-none text-gray-400">
              <i className="fa-solid fa-chevron-down text-[10px]"></i>
            </div>
          </div>

          {/* Date Range Filter */}
          <div className="relative">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-3 py-2 bg-gray-50 hover:bg-gray-100/80 border border-gray-200 rounded-xl text-xs font-semibold text-gray-800 focus:outline-none cursor-pointer"
            >
              <option value="Full Month">Full Month</option>
              <option value="First 15 Days">1st - 15th</option>
              <option value="Second 15 Days">16th - End</option>
            </select>
          </div>

          {/* Year Filter */}
          <div className="relative">
            <select
              value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value)}
              className="px-3 py-2 bg-gray-50 hover:bg-gray-100/80 border border-gray-200 rounded-xl text-xs font-semibold text-gray-800 focus:outline-none cursor-pointer"
            >
              <option value="2026">FY 2026</option>
              <option value="2025">FY 2025</option>
            </select>
          </div>

          {/* Compare Branches Toggle */}
          <button
            onClick={() => setCompareBranches(!compareBranches)}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 border transition-all cursor-pointer ${
              compareBranches
                ? 'bg-blue-50 border-blue-200 text-blue-700 shadow-2xs'
                : 'bg-gray-50 hover:bg-gray-100/80 border-gray-200 text-gray-700'
            }`}
          >
            <i className="fa-solid fa-code-compare text-xs"></i>
            <span>Compare Branches</span>
            {compareBranches && <span className="w-2 h-2 rounded-full bg-blue-600"></span>}
          </button>
        </div>

        {/* Right Export Actions */}
        <div className="flex items-center gap-2 ml-auto">
          <button
            onClick={() => exportData('excel', 'facilities')}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-2xs cursor-pointer"
          >
            <i className="fa-solid fa-file-excel text-sm"></i>
            <span>Export Facility Sheet</span>
          </button>
        </div>
      </div>

      {/* Analytics Table */}
      {loading ? (
        <div className="py-12 flex flex-col items-center justify-center text-gray-400 text-xs">
          <i className="fa-solid fa-circle-notch fa-spin text-blue-600 text-xl mb-2"></i>
          <span>Computing facility analytics from Daily Logger...</span>
        </div>
      ) : error ? (
        <div className="p-4 bg-red-50 text-red-700 rounded-xl text-xs font-semibold">
          {error}
        </div>
      ) : (
        <FacilityAnalyticsTable records={facilityRecords} />
      )}
    </div>
  );
};
