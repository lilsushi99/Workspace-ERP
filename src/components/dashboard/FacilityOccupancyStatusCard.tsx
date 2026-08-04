import React, { useState } from 'react';

interface FacilityOccupancyStatusCardProps {
  branchFilter?: string;
}

interface FacilityOccupancyItem {
  id: string;
  name: string;
  branchName: string;
  occupied: number;
  capacity: number;
  type: string;
  hourlyRate: number;
}

export const FacilityOccupancyStatusCard: React.FC<FacilityOccupancyStatusCardProps> = ({
  branchFilter = 'all',
}) => {
  const [activeBranchTab, setActiveBranchTab] = useState<string>('all');

  // Real-time facility occupancy data
  const facilities: FacilityOccupancyItem[] = [
    // Art & Tech Hub
    {
      id: 'FAC-001',
      name: 'Co-working Space',
      branchName: 'Art & Tech Hub',
      occupied: 18,
      capacity: 20,
      type: 'Open Desk Workspace',
      hourlyRate: 450,
    },
    {
      id: 'FAC-002',
      name: 'Private Offices',
      branchName: 'Art & Tech Hub',
      occupied: 5,
      capacity: 5,
      type: 'Enclosed Corporate Suites',
      hourlyRate: 1800,
    },
    {
      id: 'FAC-003',
      name: 'Dedicated Desk Hub',
      branchName: 'Art & Tech Hub',
      occupied: 6,
      capacity: 10,
      type: 'Reserved Individual Desks',
      hourlyRate: 350,
    },
    // Hive Hub
    {
      id: 'FAC-004',
      name: 'Meeting Room',
      branchName: 'Hive Hub',
      occupied: 2,
      capacity: 2,
      type: 'Conference & Presentation',
      hourlyRate: 850,
    },
    {
      id: 'FAC-005',
      name: 'Podcast Room',
      branchName: 'Hive Hub',
      occupied: 1,
      capacity: 1,
      type: 'Soundproof Recording Studio',
      hourlyRate: 650,
    },
    {
      id: 'FAC-006',
      name: 'Executive Office',
      branchName: 'Hive Hub',
      occupied: 1,
      capacity: 2,
      type: 'Private Management Suite',
      hourlyRate: 1200,
    },
    // London Main
    {
      id: 'FAC-007',
      name: 'Executive Boardroom',
      branchName: 'London Main',
      occupied: 2,
      capacity: 2,
      type: 'High-Level Boardroom',
      hourlyRate: 2500,
    },
    {
      id: 'FAC-008',
      name: 'Conference Hall',
      branchName: 'London Main',
      occupied: 8,
      capacity: 15,
      type: 'Auditorium & Event Hall',
      hourlyRate: 3500,
    },
  ];

  const selectedBranch = branchFilter !== 'all' ? branchFilter : activeBranchTab;

  const filteredFacilities = facilities.filter((f) => {
    if (selectedBranch === 'all') return true;
    if (selectedBranch === 'BR-001' || selectedBranch === 'Art & Tech Hub') {
      return f.branchName === 'Art & Tech Hub';
    }
    if (selectedBranch === 'BR-002' || selectedBranch === 'Hive Hub') {
      return f.branchName === 'Hive Hub';
    }
    if (selectedBranch === 'BR-003' || selectedBranch === 'London Main') {
      return f.branchName === 'London Main';
    }
    return f.branchName.toLowerCase().includes(selectedBranch.toLowerCase());
  });

  // Calculate branch totals
  const totalOccupied = filteredFacilities.reduce((sum, item) => sum + item.occupied, 0);
  const totalCapacity = filteredFacilities.reduce((sum, item) => sum + item.capacity, 0);
  const overallOccupancyPct = totalCapacity > 0 ? Math.round((totalOccupied / totalCapacity) * 100) : 0;

  const getStatusColor = (percent: number) => {
    if (percent >= 100) {
      return {
        bar: 'bg-red-500',
        badge: 'bg-red-50 text-red-700 border-red-200',
        label: 'FULL',
        dot: 'bg-red-500',
      };
    }
    if (percent >= 80) {
      return {
        bar: 'bg-amber-500',
        badge: 'bg-amber-50 text-amber-800 border-amber-200',
        label: 'NEARLY FULL',
        dot: 'bg-amber-500',
      };
    }
    return {
      bar: 'bg-emerald-500',
      badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      label: 'AVAILABLE',
      dot: 'bg-emerald-500',
    };
  };

  return (
    <div className="bg-white border border-gray-200/80 rounded-2xl p-6 shadow-2xs font-sans flex flex-col justify-between h-[480px] overflow-hidden">
      {/* Card Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-3 mb-3 shrink-0">
        <div>
          <h3 className="font-heading text-base font-bold text-gray-900 tracking-tight">
            Facility Occupancy Status
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Real-time space utilization • Ignores historical date filters
          </p>
        </div>

        {/* Branch Filter Selector if global filter is 'all' */}
        {branchFilter === 'all' && (
          <div className="flex items-center bg-gray-100 p-1 rounded-xl text-xs font-semibold self-start sm:self-auto">
            <button
              onClick={() => setActiveBranchTab('all')}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                activeBranchTab === 'all'
                  ? 'bg-white text-blue-700 shadow-2xs font-bold'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              All Hubs
            </button>
            <button
              onClick={() => setActiveBranchTab('Art & Tech Hub')}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                activeBranchTab === 'Art & Tech Hub'
                  ? 'bg-white text-blue-700 shadow-2xs font-bold'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Art & Tech
            </button>
            <button
              onClick={() => setActiveBranchTab('Hive Hub')}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                activeBranchTab === 'Hive Hub'
                  ? 'bg-white text-blue-700 shadow-2xs font-bold'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Hive Hub
            </button>
          </div>
        )}
      </div>

      {/* Live Overall Occupancy Summary */}
      <div className="mb-4 bg-gray-50/80 border border-gray-200/60 rounded-xl p-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center text-sm font-bold shadow-xs">
            <i className="fa-solid fa-chart-pie"></i>
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">
              Live Total Utilization
            </span>
            <div className="text-sm font-bold text-gray-900 font-heading">
              {totalOccupied} / {totalCapacity} Units Occupied
            </div>
          </div>
        </div>
        <div className="text-right">
          <span className="text-xl font-extrabold font-heading text-blue-600">
            {overallOccupancyPct}%
          </span>
          <span className="text-[10px] text-gray-400 font-medium block">Capacity Load</span>
        </div>
      </div>

      {/* List of Facilities with Horizontal Progress Bars */}
      <div className="space-y-4 flex-1 overflow-y-auto pr-1">
        {filteredFacilities.map((facility) => {
          const pct = Math.round((facility.occupied / facility.capacity) * 100);
          const style = getStatusColor(pct);

          return (
            <div
              key={facility.id}
              className="p-3.5 rounded-xl border border-gray-200/70 bg-white hover:border-blue-200 hover:shadow-2xs transition-all space-y-2"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-heading font-bold text-xs text-gray-900">
                      {facility.name}
                    </span>
                    <span className="text-[10px] text-gray-400 font-normal">
                      ({facility.branchName})
                    </span>
                  </div>
                  <span className="text-[10px] text-gray-500">{facility.type}</span>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold border ${style.badge}`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
                    {style.label}
                  </span>
                  <span className="text-xs font-bold font-mono text-gray-900">
                    {facility.occupied} / {facility.capacity}
                  </span>
                </div>
              </div>

              {/* Horizontal Capacity Bar */}
              <div className="relative w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${style.bar}`}
                  style={{ width: `${Math.min(pct, 100)}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[10px] text-gray-400 font-mono">
                <span>Rate: ${facility.hourlyRate}/day</span>
                <span>{pct}% Capacity Used</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend Footer */}
      <div className="border-t border-gray-100 pt-3 mt-4 flex flex-wrap items-center justify-between text-[11px] text-gray-500 font-medium">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            Green (&lt;80% Available)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            Amber (&ge;80% Nearly Full)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-red-500"></span>
            Red (100% Full)
          </span>
        </div>
      </div>
    </div>
  );
};
