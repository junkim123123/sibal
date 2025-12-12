/**
 * Consultation Log Component
 * 
 * Manager가 WhatsApp 대화 후 중요 합의사항을 기록하는 상담 일지
 */

'use client';

import { useState, useEffect, useRef } from 'react';
import { Plus, Clock, User, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';

interface ConsultationNote {
  id: string;
  project_id: string;
  manager_id: string;
  content: string;
  created_at: string;
  manager_name?: string;
}

interface ConsultationLogProps {
  projectId: string;
  managerId: string;
}

export function ConsultationLog({ projectId, managerId }: ConsultationLogProps) {
  const [notes, setNotes] = useState<ConsultationNote[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [newNote, setNewNote] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const notesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadNotes();
  }, [projectId]);

  // Auto-scroll to bottom when new notes are added
  useEffect(() => {
    if (notesEndRef.current) {
      notesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [notes.length]);

  const loadNotes = async () => {
    try {
      setIsLoading(true);
      
      const response = await fetch(`/api/manager/consultation-notes?project_id=${projectId}`, {
        method: 'GET',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await response.json();

      if (data.ok && data.notes) {
        setNotes(data.notes.map((note: any) => ({
          id: note.id,
          project_id: note.project_id,
          manager_id: note.manager_id,
          content: note.content,
          created_at: note.created_at,
          manager_name: note.profiles?.name || 'Manager',
        })));
      } else {
        console.error('[ConsultationLog] Failed to load notes:', data.error);
        setNotes([]);
      }
    } catch (error) {
      console.error('[ConsultationLog] Error loading notes:', error);
      setNotes([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveNote = async () => {
    if (!newNote.trim() || isSaving) return;

    const noteContent = newNote.trim();
    setIsSaving(true);

    try {
      const response = await fetch('/api/manager/consultation-notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project_id: projectId,
          manager_id: managerId,
          content: noteContent,
        }),
      });

      const data = await response.json();

      if (data.ok && data.note) {
        // Reload all notes to get proper ordering and formatting
        await loadNotes();
        setNewNote('');
        if (textareaRef.current) {
          textareaRef.current.value = '';
          textareaRef.current.style.height = 'auto';
        }
      } else {
        alert('Failed to save note. Please try again.');
        console.error('[ConsultationLog] Failed to save note:', data.error);
      }
    } catch (error) {
      console.error('[ConsultationLog] Error saving note:', error);
      alert('Failed to save note. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    });
  };

  // Auto-resize textarea
  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNewNote(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 200)}px`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-teal-600 mx-auto mb-2"></div>
          <p className="text-xs text-gray-500">Loading consultation log...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white border-t border-gray-200">
      {/* Header */}
      <div className="flex-shrink-0 p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-gray-600" />
          <h3 className="text-sm font-semibold text-gray-900">Consultation Log</h3>
          <span className="ml-auto text-xs text-gray-500">
            {notes.length} {notes.length === 1 ? 'note' : 'notes'}
          </span>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Record important agreements and key points from WhatsApp conversations
        </p>
      </div>

      {/* Notes List (Scrollable) */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
        {notes.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-8">
            <Clock className="w-12 h-12 text-gray-300 mb-3" />
            <p className="text-sm text-gray-500 mb-1">No consultation notes yet</p>
            <p className="text-xs text-gray-400">
              Add your first note to track important agreements
            </p>
          </div>
        ) : (
          <>
            {notes.map((note) => (
              <div
                key={note.id}
                className="bg-gray-50 rounded-lg p-3 border border-gray-200 hover:border-gray-300 transition-colors"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <User className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <span className="text-xs font-medium text-gray-700 truncate">
                      {note.manager_name}
                    </span>
                  </div>
                  <span className="text-xs text-gray-400 whitespace-nowrap flex-shrink-0">
                    {formatDate(note.created_at)}
                  </span>
                </div>
                <p className="text-sm text-gray-900 whitespace-pre-wrap break-words leading-relaxed">
                  {note.content}
                </p>
              </div>
            ))}
            <div ref={notesEndRef} />
          </>
        )}
      </div>

      {/* Input Area */}
      <div className="flex-shrink-0 p-4 border-t border-gray-200 bg-white">
        <div className="space-y-2">
          <textarea
            ref={textareaRef}
            value={newNote}
            onChange={handleTextareaChange}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && e.ctrlKey && !isSaving) {
                e.preventDefault();
                handleSaveNote();
              }
            }}
            placeholder="Add a note about the conversation... (e.g., 'Client agreed to $8.21 price. PI will be issued.')"
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 resize-none max-h-[200px]"
            rows={3}
            disabled={isSaving}
          />
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-400">
              Press Ctrl+Enter to save
            </p>
            <Button
              onClick={handleSaveNote}
              disabled={!newNote.trim() || isSaving}
              className="bg-teal-600 hover:bg-teal-700 text-white text-xs px-4 py-1.5 h-auto"
              size="sm"
            >
              {isSaving ? (
                <>
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-3 h-3 mr-1.5" />
                  Save Note
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

