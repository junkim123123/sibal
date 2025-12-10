/**
 * Super Admin Dashboard Overview
 * 
 * KPI Cards and System Overview
 */

'use client';

import { useState, useEffect } from 'react';
import { AlertCircle, TrendingUp, Users, UserCheck, Loader2, DollarSign } from 'lucide-react';

interface DashboardStats {
  unassignedProjects: number;
  activeProjects: number;
  totalRevenue: number;
  managerUtilization: {
    available: number;
    total: number;
  };
}

export default function SuperAdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    unassignedProjects: 0,
    activeProjects: 0,
    totalRevenue: 0,
    managerUtilization: {
      available: 0,
      total: 0,
    },
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardStats();
    
    // 30초마다 자동 새로고침 (새로운 Active Orders 감지)
    const interval = setInterval(() => {
      loadDashboardStats();
    }, 30000); // 30초

    return () => clearInterval(interval);
  }, []);

  const loadDashboardStats = async () => {
    try {
      setIsLoading(true);

      // API Route를 통해 서버 사이드에서 데이터 가져오기
      const response = await fetch('/api/admin/stats', {
        method: 'GET',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await response.json();

      if (!data.ok) {
        console.error('[Super Admin Dashboard] Failed to load stats:', data.error);
        return;
      }

      console.log('[Super Admin Dashboard] Stats loaded:', data.stats);
      if (data.debug?.unassignedProjectsSample) {
        console.log('[Super Admin Dashboard] Unassigned projects sample:', data.debug.unassignedProjectsSample);
      }

      setStats(data.stats);
    } catch (error) {
      console.error('[Super Admin Dashboard] Failed to load stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Super Admin Dashboard</h1>
        <p className="text-gray-500 mt-2">System overview and key metrics</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Unassigned Pro Projects */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-md hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-red-50 rounded-lg">
              <AlertCircle className="w-6 h-6 text-red-500" />
            </div>
            {stats.unassignedProjects > 0 && (
              <span className="px-3 py-1 bg-red-50 text-red-700 rounded-full text-sm font-semibold">
                {stats.unassignedProjects}
              </span>
            )}
          </div>
          <h3 className="text-sm font-medium text-gray-500 mb-1">Unassigned Projects</h3>
          <p className="text-4xl font-bold text-gray-900">{stats.unassignedProjects}</p>
          <p className="text-xs text-gray-500 mt-2">Projects waiting for manager assignment</p>
        </div>

        {/* Active Projects */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-md hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-50 rounded-lg">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <h3 className="text-sm font-medium text-gray-500 mb-1">Active Projects</h3>
          <p className="text-4xl font-bold text-gray-900">{stats.activeProjects}</p>
          <p className="text-xs text-gray-500 mt-2">Currently in progress</p>
        </div>

        {/* Total Revenue */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-md hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-50 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <h3 className="text-sm font-medium text-gray-500 mb-1">Total Revenue</h3>
          <p className="text-4xl font-bold text-gray-900">${stats.totalRevenue.toLocaleString()}</p>
          <p className="text-xs text-gray-500 mt-2">This month</p>
        </div>

        {/* Manager Utilization */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-md hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-50 rounded-lg">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <h3 className="text-sm font-medium text-gray-500 mb-1">Manager Utilization</h3>
          <p className="text-4xl font-bold text-gray-900">
            {stats.managerUtilization.available}/{stats.managerUtilization.total}
          </p>
          <p className="text-xs text-gray-500 mt-2">Available managers</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-md">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a
            href="/admin/dispatch"
            className="p-4 border border-gray-200 rounded-lg hover:border-[#008080] hover:bg-teal-50 hover:shadow-lg hover:-translate-y-1 transition-all duration-200"
          >
            <UserCheck className="w-5 h-5 text-[#008080] mb-2" />
            <h3 className="font-semibold text-gray-900 mb-1">Dispatch Projects</h3>
            <p className="text-sm text-gray-500">
              Assign {stats.unassignedProjects > 0 ? `${stats.unassignedProjects} ` : ''}unassigned project{stats.unassignedProjects !== 1 ? 's' : ''}
            </p>
          </a>
          <a
            href="/admin/users"
            className="p-4 border border-gray-200 rounded-lg hover:border-[#008080] hover:bg-teal-50 hover:shadow-lg hover:-translate-y-1 transition-all duration-200"
          >
            <Users className="w-5 h-5 text-[#008080] mb-2" />
            <h3 className="font-semibold text-gray-900 mb-1">Manage Users</h3>
            <p className="text-sm text-gray-500">View, ban, or refund users</p>
          </a>
          <a
            href="/admin/revenue"
            className="p-4 border border-gray-200 rounded-lg hover:border-[#008080] hover:bg-teal-50 hover:shadow-lg hover:-translate-y-1 transition-all duration-200"
          >
            <TrendingUp className="w-5 h-5 text-[#008080] mb-2" />
            <h3 className="font-semibold text-gray-900 mb-1">Revenue Dashboard</h3>
            <p className="text-sm text-gray-500">View sales and refunds</p>
          </a>
        </div>
      </div>
    </div>
  );
}

