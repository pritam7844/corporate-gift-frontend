'use client';

import { useCompanies } from '../../../hooks/useCompanies';
import { useDashboardStats } from '../../../hooks/useDashboardStats';
import {
  Building2,
  Package,
  Users,
  TrendingUp,
  ArrowUpRight,
} from 'lucide-react';
import FormattedDate from '../../../components/common/FormattedDate';

export default function AdminDashboard() {
  const { companies } = useCompanies();
  const { stats, loading: statsLoading } = useDashboardStats();

  const statsList = [
    {
      label: 'Total Companies',
      value: stats.totalCompanies,
      icon: Building2,
    },
    {
      label: 'Total Products',
      value: stats.totalProducts,
      icon: Package,
    },
    {
      label: 'Total Employees',
      value: stats.totalEmployees.toLocaleString(),
      icon: Users,
    },
    {
      label: 'Active Events',
      value: stats.activeEvents,
      icon: TrendingUp,
      change: 'Active'
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black" style={{ color: 'var(--color-text)' }}>System Overview</h1>
        <p className="text-sm mt-1 font-medium" style={{ color: 'var(--color-text-muted)' }}>Welcome back! Here is what's happening today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsList.map((stat) => (
          <div
            key={stat.label}
            className="p-6 rounded-2xl border transition-all hover:shadow-sm"
            style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
          >
            <div className="flex justify-between items-start">
              <div
                className="p-3 rounded-xl"
                style={{ backgroundColor: 'var(--color-text)' }}
              >
                <stat.icon size={22} color="#ffffff" />
              </div>
              {stat.change && (
                <span
                  className="flex items-center text-xs font-bold px-2.5 py-1 rounded-lg"
                  style={{ backgroundColor: 'var(--color-accent)', color: 'var(--color-text)' }}
                >
                  {stat.change} <ArrowUpRight size={12} className="ml-1" />
                </span>
              )}
            </div>
            <div className="mt-4">
              <h3 className="text-sm font-bold" style={{ color: 'var(--color-text-muted)' }}>{stat.label}</h3>
              <p className="text-2xl font-black mt-1" style={{ color: 'var(--color-text)' }}>{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Companies Section */}
        <div
          className="rounded-2xl border p-6"
          style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-black" style={{ color: 'var(--color-text)' }}>Recently Onboarded</h2>
            <button className="text-sm font-bold hover:underline" style={{ color: 'var(--color-text)' }}>View All</button>
          </div>
          <div className="space-y-3">
            {companies.slice(0, 5).map((company) => (
              <div
                key={company._id}
                className="flex items-center justify-between p-3 rounded-xl transition-all"
                style={{ color: 'var(--color-text)' }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--color-bg)'}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = ''}
              >
                <div className="flex items-center space-x-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black border overflow-hidden"
                    style={{ backgroundColor: 'var(--color-accent)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
                  >
                    {company.logo ? (
                      <img src={company.logo} alt={company.name} className="w-full h-full object-cover" />
                    ) : company.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-black" style={{ color: 'var(--color-text)' }}>{company.name}</p>
                    <p className="text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>{company.subdomain}.{process.env.NEXT_PUBLIC_PORTAL_DOMAIN}</p>
                  </div>
                </div>
                <span className="text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>
                  <FormattedDate date={company.createdAt} />
                </span>
              </div>
            ))}
            {companies.length === 0 && (
              <p className="text-center py-4 text-sm font-medium" style={{ color: 'var(--color-text-muted)' }}>No companies registered yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}