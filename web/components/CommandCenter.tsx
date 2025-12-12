/**
 * Command Center Component
 * 
 * CRM Snapshot + Workflow Tracker (Vertical Stepper) + Files & Docs + Internal Notes
 */

'use client';

import { useState, useEffect, useRef } from 'react';
import { Copy, CheckCircle2, Circle, Clock, Loader2, Upload, FileText, Download, Image as ImageIcon, File, Mail, Building2, User, Save, StickyNote } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';

interface CommandCenterProps {
  project: any;
  projectId: string;
  sessionId: string | null;
  managerId: string;
}

interface Milestone {
  title: string;
  status: 'completed' | 'pending' | 'in_progress';
  date: string | null;
  index: number;
}

interface ProjectFile {
  id: string;
  file_url: string;
  file_name: string;
  file_type: string;
  created_at: string;
  sender_name: string;
  is_chat_log?: boolean; // 채팅 아카이빙 파일 여부
}

const DEFAULT_MILESTONES: Milestone[] = [
  { title: 'Agent Review', status: 'completed', date: null, index: 0 },
  { title: 'Sourcing', status: 'pending', date: null, index: 1 },
  { title: 'Samples', status: 'pending', date: null, index: 2 },
  { title: 'Final Quote', status: 'pending', date: null, index: 3 },
  { title: 'Deposit Payment', status: 'pending', date: null, index: 4 },
  { title: 'Production', status: 'pending', date: null, index: 5 },
  { title: 'Shipping', status: 'pending', date: null, index: 6 },
];

type TabType = 'info' | 'notes';

export function CommandCenter({ project, projectId, sessionId, managerId }: CommandCenterProps) {
  const [milestones, setMilestones] = useState<Milestone[]>(DEFAULT_MILESTONES);
  const [files, setFiles] = useState<ProjectFile[]>([]);
  const [internalNotes, setInternalNotes] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isSavingNotes, setIsSavingNotes] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('info');
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const chatLogInputRef = useRef<HTMLInputElement | null>(null);
  const notesTextareaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    loadData();
  }, [projectId, sessionId]);

  useEffect(() => {
    // Load internal notes when switching to notes tab
    if (activeTab === 'notes') {
      loadInternalNotes();
    }
  }, [activeTab, projectId]);

  const loadData = async () => {
    setIsLoading(true);
    await Promise.all([loadMilestones(), sessionId ? loadFiles() : Promise.resolve()]);
    setIsLoading(false);
  };

  const loadInternalNotes = async () => {
    try {
      const response = await fetch(`/api/manager/projects/${projectId}/notes`, {
        method: 'GET',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await response.json();
      if (data.ok && data.notes) {
        setInternalNotes(data.notes.internal_notes || '');
      }
    } catch (error) {
      console.error('[CommandCenter] Failed to load internal notes:', error);
    }
  };

  const saveInternalNotes = async () => {
    if (isSavingNotes) return;

    try {
      setIsSavingNotes(true);
      const response = await fetch(`/api/manager/projects/${projectId}/notes`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          internal_notes: internalNotes,
        }),
      });

      const data = await response.json();
      if (!data.ok) {
        throw new Error(data.error || 'Failed to save notes');
      }
    } catch (error) {
      console.error('[CommandCenter] Failed to save internal notes:', error);
      alert('Failed to save notes. Please try again.');
    } finally {
      setIsSavingNotes(false);
    }
  };

  const loadMilestones = async () => {
    try {
      const response = await fetch(`/api/manager/milestones?project_id=${projectId}`, {
        method: 'GET',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await response.json();
      if (data.ok && data.milestones && Array.isArray(data.milestones)) {
        setMilestones(data.milestones);
      }
    } catch (error) {
      console.error('[CommandCenter] Failed to load milestones:', error);
    }
  };

  const loadFiles = async () => {
    if (!sessionId) return;
    try {
      const response = await fetch(`/api/manager/files?session_id=${sessionId}`, {
        method: 'GET',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await response.json();
      if (data.ok && data.files) {
        setFiles(data.files);
      }
    } catch (error) {
      console.error('[CommandCenter] Failed to load files:', error);
    }
  };

  const requestPayment = async (milestoneIndex: number) => {
    if (isUpdating) return;
    
    setIsUpdating(true);
    try {
      const response = await fetch('/api/manager/request-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project_id: projectId,
          milestone_index: milestoneIndex,
        }),
      });

      const data = await response.json();

      if (data.ok) {
        // Refresh milestones and project data
        await loadMilestones();
        // Show success message
        alert('Payment request sent! The client will be notified.');
      } else {
        console.error('[Request Payment] Failed:', data.error);
        alert('Failed to send payment request. Please try again.');
      }
    } catch (error) {
      console.error('[Request Payment] Error:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  const markMilestoneComplete = async (index: number) => {
    if (isUpdating) return;

    try {
      setIsUpdating(true);
      const response = await fetch('/api/manager/update-milestone', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          project_id: projectId,
          milestone_index: index,
        }),
      });

      const data = await response.json();
      if (data.ok && data.milestones) {
        setMilestones(data.milestones);
        // Reload milestones to get updated data
        await loadMilestones();
        alert(`Milestone "${milestones[index]?.title}" marked as complete!`);
      } else {
        console.error('[CommandCenter] Failed to update milestone:', data.error);
        alert(`Failed to update milestone: ${data.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('[CommandCenter] Failed to update milestone:', error);
      alert('An error occurred while updating the milestone. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  const copyEmail = async () => {
    if (project.client_email) {
      await navigator.clipboard.writeText(project.client_email);
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2000);
    }
  };

  const handleChatLogUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !sessionId) return;

    // Only allow .txt and .zip files
    const allowedExtensions = ['.txt', '.zip'];
    const fileName = file.name.toLowerCase();
    const hasValidExtension = allowedExtensions.some(ext => fileName.endsWith(ext));

    if (!hasValidExtension) {
      alert('Please upload a .txt or .zip file exported from WhatsApp.');
      return;
    }

    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append('file', file);
      formData.append('project_id', projectId);
      formData.append('session_id', sessionId);
      formData.append('is_chat_log', 'true'); // Mark as chat log

      const response = await fetch('/api/manager/files/upload', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      const data = await response.json();

      if (data.ok && data.file) {
        // Reload files
        await loadFiles();
        alert('Chat log uploaded successfully! This is a permanent legal record.');
      } else {
        console.error('[Chat Log Upload] Failed:', data.error);
        alert('Failed to upload chat log. Please try again.');
      }
    } catch (error) {
      console.error('[Chat Log Upload] Error:', error);
      alert('An error occurred while uploading the chat log.');
    } finally {
      setIsUploading(false);
      // Reset input
      if (chatLogInputRef.current) {
        chatLogInputRef.current.value = '';
      }
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !sessionId) return;

    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append('file', file);
      formData.append('project_id', projectId);
      formData.append('session_id', sessionId);

      const response = await fetch('/api/manager/files/upload', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      const data = await response.json();
      if (data.ok) {
        await loadFiles();
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    } catch (error) {
      console.error('[CommandCenter] Failed to upload file:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return <ImageIcon className="w-4 h-4 text-purple-600" />;
    if (fileType.includes('pdf')) return <FileText className="w-4 h-4 text-red-600" />;
    return <File className="w-4 h-4 text-gray-600" />;
  };

  // Extract project specs from analysis_data
  const analysisData = project.analysis_data 
    ? (typeof project.analysis_data === 'string' 
        ? JSON.parse(project.analysis_data) 
        : project.analysis_data)
    : null;
  const answers = analysisData?.answers || analysisData?.userContext || {};
  const targetPrice = answers.target_price || answers.price;
  const quantity = answers.volume || answers.quantity;
  const port = answers.source_country || answers.origin;
  const companyName = answers.company_name || project.client_name;
  const phone = answers.phone || answers.phone_number;

  // Find current milestone
  const currentIndex = milestones.findIndex((m) => m.status === 'in_progress');
  const lastCompletedIndex = milestones
    .map((m, idx) => ({ status: m.status, idx }))
    .filter(({ status }) => status === 'completed')
    .map(({ idx }) => idx)
    .sort((a, b) => b - a)[0] ?? -1;
  const nextUpdatableIndex = currentIndex >= 0 ? currentIndex : lastCompletedIndex + 1;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Tabs */}
      <div className="flex border-b border-gray-200 bg-gray-50 flex-shrink-0">
        <button
          onClick={() => setActiveTab('info')}
          className={`flex-1 px-4 py-2 text-xs font-medium transition-colors ${
            activeTab === 'info'
              ? 'bg-white text-gray-900 border-b-2 border-teal-500'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
          }`}
        >
          Project Info
        </button>
        <button
          onClick={() => setActiveTab('notes')}
          className={`flex-1 px-4 py-2 text-xs font-medium transition-colors flex items-center justify-center gap-1.5 ${
            activeTab === 'notes'
              ? 'bg-white text-gray-900 border-b-2 border-teal-500'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
          }`}
        >
          <StickyNote className="w-3 h-3" />
          Internal Notes
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {activeTab === 'info' ? (
          <>
            {/* CRM Snapshot */}
            <div className="p-4 bg-white border-b border-gray-200 space-y-3">
              <h3 className="text-xs font-semibold text-gray-900 uppercase tracking-wide">Client Profile</h3>
              
              {/* Client Avatar & Name */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center flex-shrink-0">
                  <User className="w-5 h-5 text-teal-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{project.client_name}</p>
                  {companyName && companyName !== project.client_name && (
                    <p className="text-xs text-gray-600 truncate">{companyName}</p>
                  )}
                </div>
              </div>

              {/* Contact Info */}
              <div className="space-y-2 pt-2 border-t border-gray-100">
                <div className="flex items-center gap-2 text-xs">
                  <Mail className="w-3 h-3 text-gray-400 flex-shrink-0" />
                  <span className="text-gray-700 truncate flex-1">{project.client_email}</span>
                  <button
                    onClick={copyEmail}
                    className="flex-shrink-0 p-1 hover:bg-gray-100 rounded"
                    title="Copy email"
                  >
                    {copiedEmail ? (
                      <CheckCircle2 className="w-3 h-3 text-green-600" />
                    ) : (
                      <Copy className="w-3 h-3 text-gray-400" />
                    )}
                  </button>
                </div>
                {phone && (
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-gray-400 w-3">📞</span>
                    <span className="text-gray-700">{phone}</span>
                  </div>
                )}
              </div>

              {/* Key Specs Grid */}
              {(targetPrice || quantity || port) && (
                <div className="grid grid-cols-2 gap-2 pt-3 border-t border-gray-200">
                  {targetPrice && (
                    <div>
                      <p className="text-[10px] text-gray-500 uppercase mb-0.5">Target Price</p>
                      <p className="text-sm font-bold text-gray-900">${targetPrice}</p>
                    </div>
                  )}
                  {quantity && (
                    <div>
                      <p className="text-[10px] text-gray-500 uppercase mb-0.5">Qty</p>
                      <p className="text-sm font-bold text-gray-900">
                        {typeof quantity === 'number' ? quantity.toLocaleString() : quantity}
                      </p>
                    </div>
                  )}
                  {port && (
                    <div className="col-span-2">
                      <p className="text-[10px] text-gray-500 uppercase mb-0.5">Port</p>
                      <p className="text-sm font-semibold text-gray-900">{port}</p>
                    </div>
                  )}
                  {project.total_landed_cost && (
                    <div className="col-span-2 pt-2 border-t border-gray-100">
                      <p className="text-[10px] text-gray-500 uppercase mb-0.5">Current Quote</p>
                      <p className="text-lg font-bold text-teal-600">${project.total_landed_cost.toFixed(2)}</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Workflow Tracker (Vertical Stepper) */}
            <div className="p-4 bg-white border-b border-gray-200">
              <div className="mb-3">
                <h3 className="text-xs font-semibold text-gray-900 uppercase tracking-wide">Workflow Tracker</h3>
              </div>

              <div className="relative">
                {/* Timeline Line */}
                <div className="absolute left-4 top-0 bottom-0 w-0.5">
                  {(() => {
                    const completedCount = milestones.filter((m) => m.status === 'completed').length;
                    const total = milestones.length;
                    const completedHeight = total > 0 ? `${(completedCount / total) * 100}%` : '0%';
                    
                    return (
                      <>
                        <div
                          className="absolute top-0 w-full bg-teal-500 transition-all duration-300"
                          style={{ height: completedHeight }}
                        />
                        <div
                          className="absolute w-full bg-gray-200 transition-all duration-300"
                          style={{ top: completedHeight, bottom: 0 }}
                        />
                      </>
                    );
                  })()}
                </div>

                <div className="space-y-4">
                  {milestones.map((milestone, idx) => {
                    const isCompleted = milestone.status === 'completed';
                    const isInProgress = milestone.status === 'in_progress';
                    const isCurrent = idx === nextUpdatableIndex && !isCompleted;

                    return (
                      <div key={idx} className="relative flex items-start gap-3">
                        {/* Step Icon */}
                        <div className={`relative z-10 flex-shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center ${
                          isCompleted
                            ? 'bg-teal-500 border-teal-500'
                            : isInProgress || isCurrent
                            ? 'bg-white border-teal-500'
                            : 'bg-white border-gray-300'
                        }`}>
                          {isCompleted ? (
                            <CheckCircle2 className="w-4 h-4 text-white" />
                          ) : (
                            <Circle className={`w-4 h-4 ${
                              isInProgress || isCurrent ? 'text-teal-500' : 'text-gray-300'
                            }`} />
                          )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0 pt-1">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <p className={`text-xs font-medium ${
                                isCompleted
                                  ? 'text-gray-500 line-through'
                                  : isInProgress || isCurrent
                                  ? 'text-teal-700'
                                  : 'text-gray-400'
                              }`}>
                                {milestone.title}
                              </p>
                              {milestone.date && (
                                <p className="text-[10px] text-gray-400 mt-0.5">
                                  Completed on {new Date(milestone.date).toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                  })}
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Mark as Complete Button / Request Payment Button */}
                          {isCurrent && (
                            <div className="mt-2 flex flex-col gap-2">
                              {milestone.title === 'Final Quote' && milestone.status === 'in_progress' ? (
                                <button
                                  onClick={() => requestPayment(idx)}
                                  disabled={isUpdating}
                                  className="px-3 py-1 text-xs font-medium bg-orange-600 hover:bg-orange-700 text-white rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  {isUpdating ? 'Sending...' : 'Request Payment'}
                                </button>
                              ) : (
                                <button
                                  onClick={() => markMilestoneComplete(idx)}
                                  disabled={isUpdating}
                                  className="px-3 py-1 text-xs font-medium bg-teal-600 hover:bg-teal-700 text-white rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  {isUpdating ? 'Updating...' : 'Mark as Complete'}
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Files & Docs */}
            <div className="p-4 bg-white flex-1 flex flex-col">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-semibold text-gray-900 uppercase tracking-wide">Files & Docs</h3>
                {sessionId && (
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                      className="h-6 text-[10px] px-2"
                    >
                      {isUploading ? (
                        <Loader2 className="w-3 h-3 animate-spin mr-1" />
                      ) : (
                        <Upload className="w-3 h-3 mr-1" />
                      )}
                      Upload
                    </Button>
                  </div>
                )}
              </div>

              {/* Chat Log Upload Button */}
              {sessionId && (
                <div className="mb-3">
                  <button
                    onClick={() => chatLogInputRef.current?.click()}
                    disabled={isUploading}
                    className="w-full px-2 py-1.5 text-[10px] font-medium text-orange-700 bg-orange-50 border border-orange-200 rounded hover:bg-orange-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
                  >
                    <FileText className="w-3 h-3" />
                    Upload Chat Log (Raw)
                  </button>
                  <p className="text-[9px] text-gray-500 mt-1 text-center">
                    Export from WhatsApp and upload .txt/.zip
                  </p>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileUpload}
                className="hidden"
                disabled={isUploading || !sessionId}
              />

              <input
                ref={chatLogInputRef}
                type="file"
                accept=".txt,.zip"
                onChange={handleChatLogUpload}
                className="hidden"
                disabled={isUploading || !sessionId}
              />

              <div className="flex-1 overflow-y-auto">
                {files.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-xs">No files yet</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {files.map((file) => (
                      <a
                        key={file.id}
                        href={file.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 p-2 rounded border border-gray-200 hover:bg-gray-50 transition-colors"
                      >
                        {getFileIcon(file.file_type)}
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-gray-900 truncate">{file.file_name}</p>
                          <p className="text-[10px] text-gray-500">
                            {new Date(file.created_at).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                            })}
                          </p>
                        </div>
                        <Download className="w-3 h-3 text-gray-400 flex-shrink-0" />
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          /* Internal Notes Tab */
          <div className="h-full flex flex-col p-4">
            <div className="mb-3">
              <h3 className="text-xs font-semibold text-gray-900 uppercase tracking-wide mb-1">Internal Notes</h3>
              <p className="text-[10px] text-gray-500">Private notes visible only to managers</p>
            </div>
            <textarea
              ref={notesTextareaRef}
              value={internalNotes}
              onChange={(e) => setInternalNotes(e.target.value)}
              placeholder="Add notes about this client... (e.g., 'Price sensitive, prefers fast shipping', 'Call scheduled for 2 PM')"
              className="flex-1 w-full p-3 text-xs border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
            />
            <button
              onClick={saveInternalNotes}
              disabled={isSavingNotes}
              className="mt-3 px-4 py-2 text-xs font-medium bg-teal-600 hover:bg-teal-700 text-white rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
            >
              {isSavingNotes ? (
                <>
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-3 h-3" />
                  Save Notes
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
