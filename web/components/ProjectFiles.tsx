/**
 * Project Files Component
 * 
 * 프로젝트에서 주고받은 파일 모아보기
 */

'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { getAdminClient } from '@/lib/supabase/admin';
import { FileText, Download, Image as ImageIcon, File, Loader2 } from 'lucide-react';
import Link from 'next/link';

interface ProjectFile {
  id: string;
  file_url: string;
  file_name: string;
  file_type: string;
  created_at: string;
  sender_name: string;
}

interface ProjectFilesProps {
  projectId: string;
  sessionId: string | null;
}

export function ProjectFiles({ projectId, sessionId }: ProjectFilesProps) {
  const [files, setFiles] = useState<ProjectFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!sessionId) {
      setIsLoading(false);
      return;
    }

    loadFiles();
  }, [sessionId]);

  const loadFiles = async () => {
    try {
      setIsLoading(true);
      const adminClient = getAdminClient();

      // 채팅 세션의 파일이 포함된 메시지 조회
      const { data: messages, error } = await adminClient
        .from('chat_messages')
        .select(`
          id,
          file_url,
          file_name,
          file_type,
          created_at,
          sender_id,
          profiles!chat_messages_sender_id_fkey(
            name,
            email
          )
        `)
        .eq('session_id', sessionId)
        .not('file_url', 'is', null)
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (messages) {
        const fileList: ProjectFile[] = messages.map((msg: any) => ({
          id: msg.id,
          file_url: msg.file_url,
          file_name: msg.file_name || 'Untitled',
          file_type: msg.file_type || '',
          created_at: msg.created_at,
          sender_name: msg.profiles?.name || msg.profiles?.email || 'Unknown',
        }));

        setFiles(fileList);
      }
    } catch (error) {
      console.error('[ProjectFiles] Failed to load files:', error);
    } finally {
      setIsLoading(false);
    }
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

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-4 flex items-center justify-center">
        <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 h-full overflow-y-auto">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-1">Shared Files</h3>
        <p className="text-xs text-gray-500">{files.length} files</p>
      </div>

      {files.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-center py-8 text-gray-500">
          <div>
            <FileText className="w-8 h-8 mx-auto mb-2 text-gray-400" />
            <p className="text-sm">공유된 파일이 없습니다</p>
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto space-y-2">
          {files.map((file) => (
            <Link
              key={file.id}
              href={file.file_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <div className="flex-shrink-0">
                {getFileIcon(file.file_type)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {file.file_name}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-gray-500">
                    {getFileTypeLabel(file.file_type)}
                  </span>
                  <span className="text-xs text-gray-400">•</span>
                  <span className="text-xs text-gray-500">
                    {file.sender_name}
                  </span>
                  <span className="text-xs text-gray-400">•</span>
                  <span className="text-xs text-gray-500">
                    {new Date(file.created_at).toLocaleDateString('ko-KR', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                </div>
              </div>
              <Download className="w-4 h-4 text-gray-400 flex-shrink-0" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

