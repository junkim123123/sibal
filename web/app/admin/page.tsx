/**
 * Super Admin Dashboard Overview
 * 
 * KPI Cards and System Overview
 */

'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { getAdminClient } from '@/lib/supabase/admin';
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
  }, []);

  const loadDashboardStats = async () => {
    try {
      setIsLoading(true);
      const adminClient = getAdminClient();

      // Unassigned Pro Projects (payment_status = 'paid' AND manager_id IS NULL)
      const { count: unassignedCount } = await adminClient
        .from('projects')
        .select('*', { count: 'exact', head: true })
        .eq('payment_status', 'paid')
        .is('manager_id', null);

      // Active Projects
      const { count: activeCount } = await adminClient
        .from('projects')
        .select('*', { count: 'exact', head: true })
        .in('status', ['active', 'in_progress']);

      // Total Revenue (this month) - 계산 로직 필요
      // TODO: Lemon Squeezy API 연동 또는 payment 기록에서 계산
      const totalRevenue = 0; // Placeholder

      // Manager Utilization
      const { data: managers } = await adminClient
        .from('profiles')
        .select('id, availability_status, workload_score')
        .eq('is_manager', true);

      const totalManagers = managers?.length || 0;
      const availableManagers = managers?.filter(m => m.availability_status === 'available').length || 0;

      setStats({
        unassignedProjects: unassignedCount || 0,
        activeProjects: activeCount || 0,
        totalRevenue,
        managerUtilization: {
          available: availableManagers,
          total: totalManagers,
        },
      });
    } catch (error) {
      console.error('[Super Admin Dashboard] Failed to load stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
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
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-red-100 rounded-lg">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
            {stats.unassignedProjects > 0 && (
              <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-semibold">
                {stats.unassignedProjects}
              </span>
            )}
          </div>
          <h3 className="text-sm font-medium text-gray-500 mb-1">Unassigned Projects</h3>
          <p className="text-3xl font-bold text-gray-900">{stats.unassignedProjects}</p>
          <p className="text-xs text-gray-500 mt-2">Projects waiting for manager assignment</p>
        </div>

        {/* Active Projects */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <h3 className="text-sm font-medium text-gray-500 mb-1">Active Projects</h3>
          <p className="text-3xl font-bold text-gray-900">{stats.activeProjects}</p>
          <p className="text-xs text-gray-500 mt-2">Currently in progress</p>
        </div>

        {/* Total Revenue */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <h3 className="text-sm font-medium text-gray-500 mb-1">Total Revenue</h3>
          <p className="text-3xl font-bold text-gray-900">${stats.totalRevenue.toLocaleString()}</p>
          <p className="text-xs text-gray-500 mt-2">This month</p>
        </div>

        {/* Manager Utilization */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <h3 className="text-sm font-medium text-gray-500 mb-1">Manager Utilization</h3>
          <p className="text-3xl font-bold text-gray-900">
            {stats.managerUtilization.available}/{stats.managerUtilization.total}
          </p>
          <p className="text-xs text-gray-500 mt-2">Available managers</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a
            href="/admin/dispatch"
            className="p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
          >
            <UserCheck className="w-5 h-5 text-blue-600 mb-2" />
            <h3 className="font-semibold text-gray-900 mb-1">Dispatch Projects</h3>
            <p className="text-sm text-gray-500">
              Assign {stats.unassignedProjects > 0 ? `${stats.unassignedProjects} ` : ''}unassigned project{stats.unassignedProjects !== 1 ? 's' : ''}
            </p>
          </a>
          <a
            href="/admin/users"
            className="p-4 border border-gray-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors"
          >
            <Users className="w-5 h-5 text-purple-600 mb-2" />
            <h3 className="font-semibold text-gray-900 mb-1">Manage Users</h3>
            <p className="text-sm text-gray-500">View, ban, or refund users</p>
          </a>
          <a
            href="/admin/revenue"
            className="p-4 border border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors"
          >
            <TrendingUp className="w-5 h-5 text-green-600 mb-2" />
            <h3 className="font-semibold text-gray-900 mb-1">Revenue Dashboard</h3>
            <p className="text-sm text-gray-500">View sales and refunds</p>
          </a>
        </div>
      </div>
    </div>
  );
}

