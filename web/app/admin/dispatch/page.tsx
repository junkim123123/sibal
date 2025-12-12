/**
 * Dispatch Center - Manager Assignment
 * 
 * Split view: Unassigned Projects (Left) + Manager Pool (Right)
 */

'use client';

import { useState, useEffect } from 'react';
import { assignManagerToProject } from '../actions';
import { Loader2, UserCheck, AlertCircle, CheckCircle2 } from 'lucide-react';

interface UnassignedProject {
  id: string;
  name: string;
  user_id: string;
  user_name: string;
  user_email: string;
  status: string;  // 프로젝트 상태
  payment_status: string;  // 결제 상태
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
    
    // 30초마다 자동 새로고침 (새로운 Active Orders 감지)
    const interval = setInterval(() => {
      loadData();
    }, 30000); // 30초

    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);

      // API Route를 통해 서버 사이드에서 데이터 가져오기
      const response = await fetch('/api/admin/dispatch/projects', {
        method: 'GET',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await response.json();

      if (!data.ok) {
        console.error('[Dispatch Center] Failed to load data:', data.error);
        return;
      }

      console.log('[Dispatch Center] Loaded unassigned projects:', data.projects?.length || 0);

      setUnassignedProjects(data.projects || []);
      setManagers(data.managers || []);
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
      console.log('[Dispatch Center] Assigning manager:', {
        projectId: selectedProjectId,
        managerId: selectedManagerId,
      });

      const result = await assignManagerToProject(selectedProjectId, selectedManagerId);

      console.log('[Dispatch Center] Assign result:', result);

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
        const errorMessage = result.error || 'Failed to assign manager';
        console.error('[Dispatch Center] Assignment failed:', errorMessage);
        setAssignMessage({ type: 'error', text: errorMessage });
      }
    } catch (error) {
      console.error('[Dispatch Center] Unexpected error during assignment:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      setAssignMessage({ type: 'error', text: `Error: ${errorMessage}` });
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
        <div className="bg-white rounded-lg border border-gray-200 shadow-md">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Unassigned Projects</h2>
              {unassignedProjects.length > 0 && (
                <span className="px-3 py-1 bg-red-50 text-red-700 rounded-full text-sm font-semibold">
                  {unassignedProjects.length}
                </span>
              )}
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Select a project to assign a manager. Active orders appear here automatically.
            </p>
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
                    className={`w-full text-left p-4 rounded-lg border-2 transition-all shadow-sm hover:shadow-md ${
                      selectedProjectId === project.id
                        ? 'border-[#008080] bg-teal-50'
                        : 'border-gray-200 hover:border-[#008080]/30 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-gray-900">{project.name}</h3>
                      {selectedProjectId === project.id && (
                        <CheckCircle2 className="w-5 h-5 text-[#008080] flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-1">{project.user_name}</p>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                        project.payment_status === 'paid' 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {project.payment_status === 'paid' ? '✓ Paid' : project.payment_status}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                        project.status === 'saved' || project.status === 'completed'
                          ? 'bg-blue-100 text-blue-700'
                          : project.status === 'in_progress'
                          ? 'bg-orange-100 text-orange-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {project.status}
                      </span>
                    </div>
                    {project.payment_date && (
                      <p className="text-xs text-gray-500 mb-1">
                        Paid: {new Date(project.payment_date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </p>
                    )}
                    <p className="text-xs text-gray-500">
                      Created: {new Date(project.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: Manager Pool */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-md">
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
                    className={`w-full text-left p-4 rounded-lg border-2 transition-all shadow-sm hover:shadow-md ${
                      selectedManagerId === manager.id
                        ? 'border-[#008080] bg-teal-50'
                        : manager.availability_status === 'offline'
                        ? 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
                        : 'border-gray-200 hover:border-[#008080]/30 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold text-gray-900">{manager.name}</h3>
                        <p className="text-sm text-gray-600">{manager.email}</p>
                      </div>
                      {selectedManagerId === manager.id && (
                        <CheckCircle2 className="w-5 h-5 text-[#008080] flex-shrink-0" />
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
            className="px-8 py-3 bg-[#008080] text-white rounded-lg font-semibold hover:bg-[#006666] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-md hover:shadow-lg"
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

