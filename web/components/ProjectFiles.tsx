/**
 * Project Files Component
 * 
 * 프로젝트에서 주고받은 파일 모아보기
 */

'use client';

import { useState, useEffect, useRef } from 'react';
import { FileText, Download, Image as ImageIcon, File, Loader2, Upload, X } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

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
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

      // API Route를 통해 서버 사이드에서 파일 목록 가져오기
      const response = await fetch(`/api/manager/files?session_id=${sessionId}`, {
        method: 'GET',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await response.json();

      if (!data.ok) {
        console.error('[ProjectFiles] Failed to load files:', data.error);
        return;
      }

      setFiles(data.files || []);
    } catch (error) {
      console.error('[ProjectFiles] Failed to load files:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !sessionId || !projectId) return;

    try {
      setIsUploading(true);
      setUploadProgress(`Uploading ${file.name}...`);

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

      if (!data.ok) {
        throw new Error(data.error || 'Failed to upload file');
      }

      setUploadProgress(null);
      
      // 파일 목록 다시 로드
      await loadFiles();

      // 파일 입력 초기화
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('[ProjectFiles] Failed to upload file:', error);
      alert('파일 업로드에 실패했습니다. 다시 시도해주세요.');
      setUploadProgress(null);
    } finally {
      setIsUploading(false);
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
    <div className="bg-white rounded-lg border border-gray-200 p-4 h-full flex flex-col">
      <div className="mb-4 flex-shrink-0">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-sm font-semibold text-gray-900">Shared Files</h3>
          {sessionId && (
            <Button
              size="sm"
              variant="outline"
              onClick={handleFileSelect}
              disabled={isUploading}
              className="h-7 text-xs"
            >
              {isUploading ? (
                <Loader2 className="w-3 h-3 animate-spin mr-1" />
              ) : (
                <Upload className="w-3 h-3 mr-1" />
              )}
              Upload
            </Button>
          )}
        </div>
        <p className="text-xs text-gray-500">{files.length} files</p>
        {uploadProgress && (
          <p className="text-xs text-blue-600 mt-1">{uploadProgress}</p>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        onChange={handleFileUpload}
        className="hidden"
        disabled={isUploading}
      />

      <div className="flex-1 overflow-y-auto">
        {files.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-center py-8 text-gray-500">
            <div>
              <FileText className="w-8 h-8 mx-auto mb-2 text-gray-400" />
              <p className="text-sm">No shared files yet</p>
              {sessionId && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleFileSelect}
                  disabled={isUploading}
                  className="mt-3"
                >
                  {isUploading ? (
                    <Loader2 className="w-3 h-3 animate-spin mr-1" />
                  ) : (
                    <Upload className="w-3 h-3 mr-1" />
                  )}
                  Upload File
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-2">
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
                      {new Date(file.created_at).toLocaleDateString('en-US', {
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
    </div>
  );
}

