/**
 * Dispatch Center - Manager Assignment
 * 
 * Split view: Unassigned Projects (Left) + Manager Pool (Right)
 */

'use client';

import { useState, useEffect } from 'react';
import { getAdminClient } from '@/lib/supabase/admin';
import { assignManagerToProject } from '../actions';
import { Loader2, UserCheck, AlertCircle, CheckCircle2 } from 'lucide-react';

interface UnassignedProject {
  id: string;
  name: string;
  user_id: string;
  user_name: string;
  user_email: string;
  payment_date: string | null;
  created_at: string;
}

interface Manager {
  id: string;
  name: string;
  email: string;
  workload_score: number;
  availability_status: string;
  expertise: string[] | null;
}

export default function DispatchCenterPage() {
  const [unassignedProjects, setUnassignedProjects] = useState<UnassignedProject[]>([]);
  const [managers, setManagers] = useState<Manager[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [selectedManagerId, setSelectedManagerId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAssigning, setIsAssigning] = useState(false);
  const [assignMessage, setAssignMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const adminClient = getAdminClient();

      // Unassigned Projects (payment_status = 'paid' AND manager_id IS NULL)
      const { data: projects, error: projectsError } = await adminClient
        .from('projects')
        .select(`
          id,
          name,
          user_id,
          payment_date,
          created_at,
          profiles!projects_user_id_fkey(
            name,
            email
          )
        `)
        .eq('payment_status', 'paid')
        .is('manager_id', null)
        .order('created_at', { ascending: false });

      if (projectsError) throw projectsError;

      const formattedProjects: UnassignedProject[] = (projects || []).map((p: any) => ({
        id: p.id,
        name: p.name,
        user_id: p.user_id,
        user_name: p.profiles?.name || p.profiles?.email?.split('@')[0] || 'Unknown',
        user_email: p.profiles?.email || '',
        payment_date: p.payment_date,
        created_at: p.created_at,
      }));

      setUnassignedProjects(formattedProjects);

      // Manager Pool
      const { data: managerData, error: managersError } = await adminClient
        .from('profiles')
        .select('id, name, email, workload_score, availability_status, expertise')
        .eq('is_manager', true)
        .order('workload_score', { ascending: true });

      if (managersError) throw managersError;

      const formattedManagers: Manager[] = (managerData || []).map((m: any) => ({
        id: m.id,
        name: m.name || m.email?.split('@')[0] || 'Unknown',
        email: m.email,
        workload_score: m.workload_score || 0,
        availability_status: m.availability_status || 'available',
        expertise: m.expertise || null,
      }));

      setManagers(formattedManagers);
    } catch (error) {
      console.error('[Dispatch Center] Failed to load data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAssign = async () => {
    if (!selectedProjectId || !selectedManagerId) {
      setAssignMessage({ type: 'error', text: 'Please select both a project and a manager' });
      return;
    }

    setIsAssigning(true);
    setAssignMessage(null);

    try {
      const result = await assignManagerToProject(selectedProjectId, selectedManagerId);

      if (result.success) {
        setAssignMessage({ type: 'success', text: 'Manager assigned successfully!' });
        setSelectedProjectId(null);
        setSelectedManagerId(null);
        
        // Reload data
        setTimeout(() => {
          loadData();
          setAssignMessage(null);
        }, 1500);
      } else {
        setAssignMessage({ type: 'error', text: result.error || 'Failed to assign manager' });
      }
    } catch (error) {
      setAssignMessage({ type: 'error', text: 'An unexpected error occurred' });
    } finally {
      setIsAssigning(false);
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
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Dispatch Center</h1>
        <p className="text-gray-500 mt-2">Assign managers to paid projects</p>
      </div>

      {/* Assign Message */}
      {assignMessage && (
        <div
          className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
            assignMessage.type === 'success'
              ? 'bg-green-50 border border-green-200 text-green-800'
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}
        >
          {assignMessage.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5" />
          ) : (
            <AlertCircle className="w-5 h-5" />
          )}
          <span>{assignMessage.text}</span>
        </div>
      )}

      {/* Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Unassigned Projects */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Unassigned Projects</h2>
              {unassignedProjects.length > 0 && (
                <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-semibold">
                  {unassignedProjects.length}
                </span>
              )}
            </div>
            <p className="text-sm text-gray-500 mt-1">Select a project to assign a manager</p>
          </div>

          <div className="p-6 max-h-[calc(100vh-20rem)] overflow-y-auto">
            {unassignedProjects.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <UserCheck className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p className="font-medium">No unassigned projects</p>
                <p className="text-sm mt-1">All paid projects have been assigned</p>
              </div>
            ) : (
              <div className="space-y-3">
                {unassignedProjects.map((project) => (
                  <button
                    key={project.id}
                    onClick={() => setSelectedProjectId(project.id)}
                    className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                      selectedProjectId === project.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-gray-900">{project.name}</h3>
                      {selectedProjectId === project.id && (
                        <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-1">{project.user_name}</p>
                    <p className="text-xs text-gray-500">
                      {project.payment_date
                        ? `Paid: ${new Date(project.payment_date).toLocaleDateString()}`
                        : `Created: ${new Date(project.created_at).toLocaleDateString()}`}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: Manager Pool */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Manager Pool</h2>
            <p className="text-sm text-gray-500 mt-1">Select a manager to assign</p>
          </div>

          <div className="p-6 max-h-[calc(100vh-20rem)] overflow-y-auto">
            {managers.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <AlertCircle className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p className="font-medium">No managers available</p>
                <p className="text-sm mt-1">Add managers in the system</p>
              </div>
            ) : (
              <div className="space-y-3">
                {managers.map((manager) => (
                  <button
                    key={manager.id}
                    onClick={() => setSelectedManagerId(manager.id)}
                    disabled={manager.availability_status === 'offline'}
                    className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                      selectedManagerId === manager.id
                        ? 'border-blue-500 bg-blue-50'
                        : manager.availability_status === 'offline'
                        ? 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold text-gray-900">{manager.name}</h3>
                        <p className="text-sm text-gray-600">{manager.email}</p>
                      </div>
                      {selectedManagerId === manager.id && (
                        <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0" />
                      )}
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-xs">
                      <span
                        className={`px-2 py-1 rounded ${
                          manager.availability_status === 'available'
                            ? 'bg-green-100 text-green-700'
                            : manager.availability_status === 'busy'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {manager.availability_status}
                      </span>
                      <span className="text-gray-500">
                        {manager.workload_score} active project{manager.workload_score !== 1 ? 's' : ''}
                      </span>
                    </div>
                    {manager.expertise && manager.expertise.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {manager.expertise.slice(0, 3).map((exp, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs"
                          >
                            {exp}
                          </span>
                        ))}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Assign Button */}
      {selectedProjectId && selectedManagerId && (
        <div className="mt-6 flex justify-center">
          <button
            onClick={handleAssign}
            disabled={isAssigning}
            className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isAssigning ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Assigning...
              </>
            ) : (
              <>
                <UserCheck className="w-5 h-5" />
                Assign Manager
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}

