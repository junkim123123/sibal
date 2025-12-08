/**
 * Asset Library Component
 * 
 * File storage and organization for projects
 * Categorizes files by type: Quotes, Invoices, QC Reports, Images, etc.
 */

'use client';

import { useState, useEffect, useRef } from 'react';
import { getAdminClient } from '@/lib/supabase/admin';
import { FileText, Download, Image as ImageIcon, File, Loader2, Filter, Search, Folder, Upload } from 'lucide-react';
import Link from 'next/link';

interface ProjectFile {
  id: string;
  file_url: string;
  file_name: string;
  file_type: string;
  created_at: string;
  sender_name: string;
  project_id: string;
  project_name: string;
}

type FileCategory = 'all' | 'quotes' | 'invoices' | 'qc_reports' | 'images' | 'documents' | 'other';

interface AssetLibraryProps {
  userId?: string;
  projectId?: string;
}

export function AssetLibrary({ userId, projectId }: AssetLibraryProps) {
  const [files, setFiles] = useState<ProjectFile[]>([]);
  const [filteredFiles, setFilteredFiles] = useState<ProjectFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<FileCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadFiles();
  }, [userId, projectId]);

  useEffect(() => {
    filterFiles();
  }, [files, selectedCategory, searchQuery]);

  const loadFiles = async () => {
    if (!userId && !projectId) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const adminClient = getAdminClient();

      // First, get all chat sessions for this user/project
      let sessionsQuery = adminClient
        .from('chat_sessions')
        .select(`
          id,
          project_id,
          projects!inner(
            id,
            name,
            user_id
          )
        `);

      if (projectId) {
        sessionsQuery = sessionsQuery.eq('project_id', projectId);
      } else if (userId) {
        sessionsQuery = sessionsQuery.eq('projects.user_id', userId);
      }

      const { data: sessions, error: sessionsError } = await sessionsQuery;

      if (sessionsError) throw sessionsError;

      if (!sessions || sessions.length === 0) {
        setFiles([]);
        setIsLoading(false);
        return;
      }

      const sessionIds = sessions.map((s: any) => s.id);

      // Then, get all messages with files from these sessions
      const { data: messages, error: messagesError } = await adminClient
        .from('chat_messages')
        .select(`
          id,
          file_url,
          file_name,
          file_type,
          created_at,
          sender_id,
          session_id,
          profiles!chat_messages_sender_id_fkey(
            name,
            email
          )
        `)
        .in('session_id', sessionIds)
        .not('file_url', 'is', null)
        .order('created_at', { ascending: false });

      if (messagesError) throw messagesError;

      // Map sessions to projects for lookup
      const sessionToProject: Record<string, { id: string; name: string }> = {};
      sessions.forEach((s: any) => {
        sessionToProject[s.id] = {
          id: s.project_id,
          name: s.projects?.name || 'Unknown Project',
        };
      });

      if (messages) {
        const fileList: ProjectFile[] = messages.map((msg: any) => ({
          id: msg.id,
          file_url: msg.file_url,
          file_name: msg.file_name || 'Untitled',
          file_type: msg.file_type || '',
          created_at: msg.created_at,
          sender_name: msg.profiles?.name || msg.profiles?.email || 'Unknown',
          project_id: sessionToProject[msg.session_id]?.id || '',
          project_name: sessionToProject[msg.session_id]?.name || 'Unknown Project',
        }));

        setFiles(fileList);
      }
    } catch (error) {
      console.error('[AssetLibrary] Failed to load files:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const categorizeFile = (fileName: string, fileType: string): FileCategory => {
    const lowerName = fileName.toLowerCase();
    
    // Quotes
    if (lowerName.includes('quote') || lowerName.includes('quotation') || lowerName.includes('견적')) {
      return 'quotes';
    }
    
    // Invoices
    if (lowerName.includes('invoice') || lowerName.includes('inv-') || lowerName.includes('송장')) {
      return 'invoices';
    }
    
    // QC Reports
    if (lowerName.includes('qc') || lowerName.includes('quality') || lowerName.includes('inspection') || lowerName.includes('검수')) {
      return 'qc_reports';
    }
    
    // Images
    if (fileType.startsWith('image/')) {
      return 'images';
    }
    
    // Documents (PDFs, Word, Excel)
    if (fileType.includes('pdf') || fileType.includes('word') || fileType.includes('excel') || fileType.includes('spreadsheet')) {
      return 'documents';
    }
    
    return 'other';
  };

  const filterFiles = () => {
    let filtered = files;

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(file => categorizeFile(file.file_name, file.file_type) === selectedCategory);
    }

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(file => 
        file.file_name.toLowerCase().includes(query) ||
        file.project_name.toLowerCase().includes(query) ||
        file.sender_name.toLowerCase().includes(query)
      );
    }

    setFilteredFiles(filtered);
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) {
      return <ImageIcon className="w-5 h-5 text-purple-600" />;
    }
    if (fileType.includes('pdf')) {
      return <FileText className="w-5 h-5 text-red-600" />;
    }
    return <File className="w-5 h-5 text-gray-600" />;
  };

  const getFileTypeLabel = (fileType: string) => {
    if (fileType.includes('pdf')) return 'PDF';
    if (fileType.includes('word')) return 'Word';
    if (fileType.includes('excel') || fileType.includes('spreadsheet')) return 'Excel';
    if (fileType.startsWith('image/')) return 'Image';
    return 'File';
  };

  const getCategoryLabel = (category: FileCategory): string => {
    const labels: Record<FileCategory, string> = {
      all: 'All Files',
      quotes: 'Quotes',
      invoices: 'Invoices',
      qc_reports: 'QC Reports',
      images: 'Images',
      documents: 'Documents',
      other: 'Other',
    };
    return labels[category];
  };

  const getCategoryCount = (category: FileCategory): number => {
    if (category === 'all') return files.length;
    return files.filter(file => categorizeFile(file.file_name, file.file_type) === category).length;
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !projectId) return;

    try {
      setIsUploading(true);

      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`/api/projects/${projectId}/files/upload`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      const data = await response.json();

      if (!data.ok) {
        throw new Error(data.error || 'Failed to upload file');
      }

      // 파일 목록 다시 로드
      await loadFiles();

      // 파일 입력 초기화
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('[AssetLibrary] Failed to upload file:', error);
      alert(`Failed to upload file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsUploading(false);
    }
  };

  const categories: FileCategory[] = ['all', 'quotes', 'invoices', 'qc_reports', 'images', 'documents', 'other'];

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-8 flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              {projectId ? 'Project Documents' : 'Asset Library'}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {filteredFiles.length} {filteredFiles.length === 1 ? 'file' : 'files'}
              {selectedCategory !== 'all' && ` in ${getCategoryLabel(selectedCategory)}`}
            </p>
          </div>
          {/* Upload Button (only for project-specific view) */}
          {projectId && (
            <div>
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={handleFileUpload}
                accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="inline-flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Uploading...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    <span>Upload File</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Search Bar */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search files by name, project, or sender..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => {
            const count = getCategoryCount(category);
            if (count === 0 && category !== 'all') return null;
            
            return (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedCategory === category
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {getCategoryLabel(category)}
                <span className="ml-2 text-xs opacity-75">({count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* File List */}
      <div className="p-6">
        {filteredFiles.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-500">
            <Folder className="w-12 h-12 mb-4 text-gray-400" />
            <p className="text-lg font-medium">No files found</p>
            <p className="text-sm mt-1">
              {selectedCategory !== 'all'
                ? `No files in ${getCategoryLabel(selectedCategory)} category`
                : searchQuery
                ? 'Try adjusting your search or filters'
                : projectId
                ? 'Upload files (Quotes, Invoices, POs) to get started'
                : 'Files shared in chat will appear here'}
            </p>
            {projectId && filteredFiles.length === 0 && !searchQuery && selectedCategory === 'all' && (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
              >
                <Upload className="w-4 h-4" />
                <span>Upload Your First File</span>
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredFiles.map((file) => {
              const category = categorizeFile(file.file_name, file.file_type);
              
              return (
                <Link
                  key={file.id}
                  href={file.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex flex-col p-4 rounded-lg border border-gray-200 hover:border-blue-500 hover:shadow-md transition-all"
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div className="flex-shrink-0 mt-1">
                      {getFileIcon(file.file_type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate group-hover:text-blue-600">
                        {file.file_name}
                      </p>
                      <p className="text-xs text-gray-500 mt-1 truncate">
                        {file.project_name}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-100">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">
                        {getCategoryLabel(category)}
                      </span>
                      <span className="text-xs text-gray-500">
                        {getFileTypeLabel(file.file_type)}
                      </span>
                    </div>
                    <Download className="w-4 h-4 text-gray-400 group-hover:text-blue-600 flex-shrink-0" />
                  </div>

                  <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
                    <span>{file.sender_name}</span>
                    <span>•</span>
                    <span>
                      {new Date(file.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

