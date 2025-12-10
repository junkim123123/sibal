/**
 * User Management Page
 * 
 * View users, ban/unban, view total spend
 */

'use client';

import { useState, useEffect } from 'react';
import { getAdminClient } from '@/lib/supabase/admin';
import { banUser } from '../actions';
import { Loader2, Ban, CheckCircle2, DollarSign, AlertCircle } from 'lucide-react';

interface User {
  id: string;
  email: string;
  name: string | null;
  company: string | null;
  role: string;
  total_spend: number;
  is_banned: boolean;
  created_at: string;
}

export default function UserManagementPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [banningUserId, setBanningUserId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setIsLoading(true);
      const adminClient = getAdminClient();

      const { data, error } = await adminClient
        .from('profiles')
        .select('id, email, name, company, role, total_spend, is_banned, created_at')
        .order('created_at', { ascending: false })
        .limit(100); // Limit to prevent performance issues

      if (error) throw error;

      const formattedUsers: User[] = (data || []).map((u: any) => ({
        id: u.id,
        email: u.email,
        name: u.name,
        company: u.company,
        role: u.role || 'free',
        total_spend: Number(u.total_spend || 0),
        is_banned: u.is_banned || false,
        created_at: u.created_at,
      }));

      setUsers(formattedUsers);
    } catch (error) {
      console.error('[User Management] Failed to load users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBanToggle = async (userId: string, currentBanStatus: boolean) => {
    setBanningUserId(userId);
    setMessage(null);

    try {
      const result = await banUser(userId, !currentBanStatus);

      if (result.success) {
        setMessage({
          type: 'success',
          text: currentBanStatus ? 'User unbanned successfully' : 'User banned successfully',
        });
        
        // Reload users
        setTimeout(() => {
          loadUsers();
          setMessage(null);
        }, 1500);
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to update user' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An unexpected error occurred' });
    } finally {
      setBanningUserId(null);
    }
  };

  const filteredUsers = users.filter((user) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      user.email.toLowerCase().includes(query) ||
      user.name?.toLowerCase().includes(query) ||
      user.company?.toLowerCase().includes(query)
    );
  });

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
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
        <p className="text-gray-500 mt-2">Manage users, ban accounts, view spending</p>
      </div>

      {/* Message */}
      {message && (
        <div
          className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
            message.type === 'success'
              ? 'bg-green-50 border border-green-200 text-green-800'
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5" />
          ) : (
            <AlertCircle className="w-5 h-5" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Search Bar */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search by email, name, or company..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Spend
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                        <Users className="w-12 h-12 text-gray-400" />
                      </div>
                      <p className="text-lg font-medium text-gray-900 mb-2">No users found</p>
                      <p className="text-sm text-gray-500">
                        {searchQuery ? 'Try a different search term' : 'No users have signed up yet'}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {user.name || 'No name'}
                        </div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                        {user.company && (
                          <div className="text-xs text-gray-400">{user.company}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded ${
                          user.role === 'super_admin'
                            ? 'bg-red-100 text-red-700'
                            : user.role === 'pro'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1 text-sm text-gray-900">
                        <DollarSign className="w-4 h-4" />
                        {user.total_spend.toFixed(2)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {user.is_banned ? (
                        <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-700 rounded">
                          Banned
                        </span>
                      ) : (
                        <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded">
                          Active
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => handleBanToggle(user.id, user.is_banned)}
                        disabled={banningUserId === user.id || user.role === 'super_admin'}
                        className={`px-3 py-1 rounded font-medium transition-colors ${
                          user.is_banned
                            ? 'bg-green-100 text-green-700 hover:bg-green-200'
                            : 'bg-red-100 text-red-700 hover:bg-red-200'
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        {banningUserId === user.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : user.is_banned ? (
                          'Unban'
                        ) : (
                          'Ban'
                        )}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-md">
          <p className="text-sm text-gray-500">Total Users</p>
          <p className="text-3xl font-bold text-gray-900">{users.length}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-md">
          <p className="text-sm text-gray-500">Banned Users</p>
          <p className="text-3xl font-bold text-red-600">
            {users.filter((u) => u.is_banned).length}
          </p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-md">
          <p className="text-sm text-gray-500">Total Revenue</p>
          <p className="text-3xl font-bold text-green-600">
            ${users.reduce((sum, u) => sum + u.total_spend, 0).toFixed(2)}
          </p>
        </div>
      </div>
    </div>
  );
}

