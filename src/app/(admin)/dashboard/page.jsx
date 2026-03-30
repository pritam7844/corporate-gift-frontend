'use client';

import { useCompanies } from '../../../hooks/useCompanies';
import { useDashboardStats } from '../../../hooks/useDashboardStats';
import {
  Building2,
  Package,
  Users,
  TrendingUp,
  ArrowUpRight,
  Clock
} from 'lucide-react';

export default function AdminDashboard() {
  const { companies } = useCompanies();
  const { stats, loading: statsLoading } = useDashboardStats();

  const statsList = [
    {
      label: 'Total Companies',
      value: stats.totalCompanies,
      icon: Building2,
      color: 'bg-blue-500',
      // change: '+12%'
    },
    {
      label: 'Total Products',
      value: stats.totalProducts,
      icon: Package,
      color: 'bg-purple-500',
      // change: '+5'
    },
    {
      label: 'Total Employees',
      value: stats.totalEmployees.toLocaleString(),
      icon: Users,
      color: 'bg-orange-500',
      // change: '+18%'
    },
    {
      label: 'Active Events',
      value: stats.activeEvents,
      icon: TrendingUp,
      color: 'bg-green-500',
      change: 'Active'
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">System Overview</h1>
        <p className="text-gray-500 text-sm">Welcome back! Here is what's happening today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsList.map((stat) => (
          <div key={stat.label} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start">
              <div className={`p-3 rounded-lg ${stat.color} text-white`}>
                <stat.icon size={24} />
              </div>
              <span className="flex items-center text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded">
                {stat.change} <ArrowUpRight size={12} className="ml-1" />
              </span>
            </div>
            <div className="mt-4">
              <h3 className="text-gray-500 text-sm font-medium">{stat.label}</h3>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Companies Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-gray-800">Recently Onboarded</h2>
            <button className="text-blue-600 text-sm font-medium hover:underline">View All</button>
          </div>
          <div className="space-y-4">
            {companies.slice(0, 5).map((company) => (
              <div key={company._id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 font-bold">
                    {company.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{company.name}</p>
                    <p className="text-xs text-gray-500">{company.subdomain}.{process.env.NEXT_PUBLIC_PORTAL_DOMAIN}</p>
                  </div>
                </div>
                <span className="text-xs text-gray-400">
                  {new Date(company.createdAt).toLocaleDateString()}
                </span>
              </div>
            ))}
            {companies.length === 0 && (
              <p className="text-center text-gray-400 py-4">No companies registered yet.</p>
            )}
          </div>
        </div>

        {/* System Activity Section */}
        {/* <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center">
            <Clock size={20} className="mr-2 text-blue-500" /> System Activity
          </h2>
          <div className="relative border-l-2 border-gray-100 ml-3 pl-6 space-y-6">
            <div className="relative">
              <span className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-blue-500 border-4 border-white shadow-sm"></span>
              <p className="text-sm font-medium text-gray-800">Admin Login</p>
              <p className="text-xs text-gray-500">System admin logged in from IP 127.0.0.1</p>
            </div>
            <div className="relative">
              <span className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-green-500 border-4 border-white shadow-sm"></span>
              <p className="text-sm font-medium text-gray-800">New Company Created</p>
              <p className="text-xs text-gray-500">"Tesla" was successfully added to the platform.</p>
            </div>
          </div>
        </div> */}
      </div>
    </div>
  );
}