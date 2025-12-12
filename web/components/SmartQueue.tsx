/**
 * Smart Queue Component
 * 
 * Professional inbox with search, filters, and status badges
 */

'use client';

import { useState, useEffect } from 'react';
import { Search, Filter, Loader2, User, MessageSquare } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface ClientProject {
  id: string;
  name: string;
  client_name: string;
  client_email: string;
  status: string;
  unread_count: number;
  last_message_at: string | null;
  last_message: string | null;
  created_at?: string;
}

interface SmartQueueProps {
  onProjectSelect: (projectId: string) => void;
  selectedProjectId: string | null;
}

type FilterType = 'all' | 'unread' | 'urgent';

export function SmartQueue({ onProjectSelect, selectedProjectId }: SmartQueueProps) {
  const [clients, setClients] = useState<ClientProject[]>([]);
  const [filteredClients, setFilteredClients] = useState<ClientProject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<FilterType>('all');

  useEffect(() => {
    loadClients();
    
    // 30초마다 자동 새로고침
    const interval = setInterval(() => {
      loadClients();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Apply search and filter
    let filtered = [...clients];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (client) =>
          client.client_name.toLowerCase().includes(query) ||
          client.name.toLowerCase().includes(query) ||
          client.client_email.toLowerCase().includes(query)
      );
    }

    // Status filter
    if (filter === 'unread') {
      filtered = filtered.filter((client) => client.unread_count > 0);
    } else if (filter === 'urgent') {
      // Urgent = unread + recent message (within 2 hours)
      const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
      filtered = filtered.filter(
        (client) =>
          client.unread_count > 0 &&
          client.last_message_at &&
          new Date(client.last_message_at) > twoHoursAgo
      );
    }

    setFilteredClients(filtered);
  }, [clients, searchQuery, filter]);

  const loadClients = async () => {
    try {
      setIsLoading(true);

      const response = await fetch('/api/manager/projects', {
        method: 'GET',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await response.json();

      if (!data.ok) {
        console.error('[SmartQueue] Failed to load projects:', data.error);
        return;
      }

      // Load last message for each project
      const clientsWithMessages: ClientProject[] = await Promise.all(
        (data.projects || []).map(async (project: any) => {
          // Get last message
          let lastMessage = null;
          try {
            const chatResponse = await fetch(
              `/api/manager/chat-sessions?project_id=${project.id}`,
              {
                method: 'GET',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
              }
            );
            const chatData = await chatResponse.json();
            if (chatData.ok && chatData.session) {
              const supabase = createClient();
              const { data: messages } = await supabase
                .from('chat_messages')
                .select('content, created_at')
                .eq('session_id', chatData.session.id)
                .order('created_at', { ascending: false })
                .limit(1)
                .maybeSingle();
              
              if (messages) {
                lastMessage = messages.content;
              }
            }
          } catch (e) {
            // Ignore errors for last message
          }

          return {
            id: project.id,
            name: project.name,
            client_name: project.client_name,
            client_email: project.client_email,
            status: project.status,
            unread_count: project.unread_count || 0,
            last_message_at: project.last_message_at,
            last_message: lastMessage,
            created_at: project.created_at,
          };
        })
      );

      setClients(clientsWithMessages);
    } catch (error) {
      console.error('[SmartQueue] Failed to load clients:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string, unreadCount: number, lastMessageAt: string | null, createdAt?: string) => {
    // Priority badges (New, Action Required)
    // Check if project is new (created within 24 hours and no messages yet)
    if (createdAt) {
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const isNew = new Date(createdAt) > oneDayAgo && (!lastMessageAt || !unreadCount);
      
      if (isNew) {
        return (
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded border bg-orange-100 text-orange-700 border-orange-300">
            New
          </span>
        );
      }
    }
    
    // Action Required for recent unread messages
    if (unreadCount > 0) {
      const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
      const isRecent = lastMessageAt && new Date(lastMessageAt) > twoHoursAgo;
      
      if (isRecent) {
        return (
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded border bg-red-100 text-red-700 border-red-300">
            Action Required
          </span>
        );
      }
    }
    
    // Check if project is very new (created within 24 hours)
    const statusConfig: Record<string, { label: string; color: string }> = {
      'Negotiating': { label: 'Negotiating', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
      'Deposit Paid': { label: 'Deposit Paid', color: 'bg-green-100 text-green-700 border-green-200' },
      'In Progress': { label: 'In Progress', color: 'bg-blue-100 text-blue-700 border-blue-200' },
      'Sourcing': { label: 'Sourcing', color: 'bg-purple-100 text-purple-700 border-purple-200' },
      'Production': { label: 'Production', color: 'bg-indigo-100 text-indigo-700 border-indigo-200' },
      'Shipping': { label: 'Shipping', color: 'bg-teal-100 text-teal-700 border-teal-200' },
    };

    const config = statusConfig[status] || { label: status, color: 'bg-gray-100 text-gray-700 border-gray-200' };
    return (
      <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const getTimeAgo = (dateString: string | null) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'now';
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header with Search and Filter */}
      <div className="p-3 border-b border-gray-200 bg-white flex-shrink-0 space-y-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search clients..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div className="flex gap-1">
          {(['all', 'unread', 'urgent'] as FilterType[]).map((filterType) => (
            <button
              key={filterType}
              onClick={() => setFilter(filterType)}
              className={`px-2 py-1 text-xs font-medium rounded transition-colors ${
                filter === filterType
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {filterType === 'all' ? 'All' : filterType === 'unread' ? 'Unread' : 'Urgent'}
            </button>
          ))}
        </div>
      </div>

      {/* Client List */}
      <div className="flex-1 overflow-y-auto">
        {filteredClients.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            <User className="w-8 h-8 mx-auto mb-2 text-gray-400" />
            <p className="text-sm">
              {clients.length === 0 ? 'No assigned projects' : 'No projects match your filters'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredClients.map((client) => (
              <button
                key={client.id}
                onClick={() => onProjectSelect(client.id)}
                className={`w-full text-left p-3 transition-colors ${
                  selectedProjectId === client.id
                    ? 'bg-blue-50 border-l-4 border-l-blue-500'
                    : client.unread_count > 0
                    ? 'bg-white border-l-4 border-l-orange-400 hover:bg-gray-50'
                    : 'hover:bg-gray-50'
                }`}
              >
                {/* Top Row: Client Name + Time + Status Badge */}
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-sm truncate ${
                        client.unread_count > 0 ? 'font-bold text-gray-900' : 'font-medium text-gray-900'
                      }`}
                    >
                      {client.client_name}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    {client.unread_count > 0 && (
                      <span className="min-w-[18px] h-[18px] px-1.5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                        {client.unread_count}
                      </span>
                    )}
                    <span className="text-[10px] text-gray-400 whitespace-nowrap">
                      {getTimeAgo(client.last_message_at)}
                    </span>
                  </div>
                </div>

                {/* Status Badge */}
                <div className="mb-1.5">{getStatusBadge(client.status, client.unread_count, client.last_message_at, client.created_at)}</div>

                {/* Bottom Row: Project Name + Last Message */}
                <p className="text-xs text-gray-600 truncate mb-1">{client.name}</p>
                {client.last_message ? (
                  <p className="text-xs text-gray-500 truncate line-clamp-1">
                    {client.last_message}
                  </p>
                ) : (
                  <p className="text-xs text-gray-400 italic">No messages yet</p>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}


