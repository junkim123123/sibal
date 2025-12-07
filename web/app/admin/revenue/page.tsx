/**
 * Revenue Dashboard
 * 
 * Sales and refund overview
 */

'use client';

import { useState, useEffect } from 'react';
import { getAdminClient } from '@/lib/supabase/admin';
import { Loader2, DollarSign, TrendingUp, TrendingDown, ArrowUpRight } from 'lucide-react';

interface RevenueStats {
  totalRevenue: number;
  thisMonthRevenue: number;
  totalProjects: number;
  paidProjects: number;
  refundedProjects: number;
}

export default function RevenuePage() {
  const [stats, setStats] = useState<RevenueStats>({
    totalRevenue: 0,
    thisMonthRevenue: 0,
    totalProjects: 0,
    paidProjects: 0,
    refundedProjects: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadRevenueStats();
  }, []);

  const loadRevenueStats = async () => {
    try {
      setIsLoading(true);
      const adminClient = getAdminClient();

      // Total revenue from all paid projects
      // TODO: Integrate with Lemon Squeezy API for actual payment data
      const { data: paidProjects } = await adminClient
        .from('projects')
        .select('payment_date, payment_status')
        .eq('payment_status', 'paid');

      const { count: totalPaid } = await adminClient
        .from('projects')
        .select('*', { count: 'exact', head: true })
        .eq('payment_status', 'paid');

      const { count: totalRefunded } = await adminClient
        .from('projects')
        .select('*', { count: 'exact', head: true })
        .eq('payment_status', 'refunded');

      const { count: totalProjects } = await adminClient
        .from('projects')
        .select('*', { count: 'exact', head: true });

      // Calculate this month's revenue
      const now = new Date();
      const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const thisMonthProjects = paidProjects?.filter(
        (p: any) => p.payment_date && new Date(p.payment_date) >= thisMonthStart
      ).length || 0;

      // Placeholder: $199 per project
      const pricePerProject = 199;
      const totalRevenue = (totalPaid || 0) * pricePerProject;
      const thisMonthRevenue = thisMonthProjects * pricePerProject;

      setStats({
        totalRevenue,
        thisMonthRevenue,
        totalProjects: totalProjects || 0,
        paidProjects: totalPaid || 0,
        refundedProjects: totalRefunded || 0,
      });
    } catch (error) {
      console.error('[Revenue] Failed to load stats:', error);
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
        <h1 className="text-3xl font-bold text-gray-900">Revenue Dashboard</h1>
        <p className="text-gray-500 mt-2">Sales overview and financial metrics</p>
      </div>

      {/* Revenue Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Revenue */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <h3 className="text-sm font-medium text-gray-500 mb-1">Total Revenue</h3>
          <p className="text-3xl font-bold text-gray-900">
            ${stats.totalRevenue.toLocaleString()}
          </p>
          <p className="text-xs text-gray-500 mt-2">All time</p>
        </div>

        {/* This Month Revenue */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <h3 className="text-sm font-medium text-gray-500 mb-1">This Month</h3>
          <p className="text-3xl font-bold text-gray-900">
            ${stats.thisMonthRevenue.toLocaleString()}
          </p>
          <p className="text-xs text-gray-500 mt-2">Current month</p>
        </div>

        {/* Paid Projects */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <ArrowUpRight className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <h3 className="text-sm font-medium text-gray-500 mb-1">Paid Projects</h3>
          <p className="text-3xl font-bold text-gray-900">{stats.paidProjects}</p>
          <p className="text-xs text-gray-500 mt-2">Completed payments</p>
        </div>

        {/* Refunded Projects */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-red-100 rounded-lg">
              <TrendingDown className="w-6 h-6 text-red-600" />
            </div>
          </div>
          <h3 className="text-sm font-medium text-gray-500 mb-1">Refunded</h3>
          <p className="text-3xl font-bold text-gray-900">{stats.refundedProjects}</p>
          <p className="text-xs text-gray-500 mt-2">Total refunds</p>
        </div>
      </div>

      {/* Note */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-sm text-yellow-800">
          <strong>Note:</strong> Revenue calculation is based on project count × $199 per project.
          For accurate revenue data, integrate with Lemon Squeezy API or payment tracking system.
        </p>
      </div>
    </div>
  );
}

