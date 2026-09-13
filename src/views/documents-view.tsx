import React, { useState, useEffect, useRef } from 'react';
import { useWorkspace } from '../context/workspace-context';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { PDFViewer } from '../components/documents/pdf-viewer';
import { parseDocumentFile } from '../services/documents/universal-parser';
import { EmptyState } from '../components/ui/empty-state';
import { Button } from '../components/ui/button';
import { FileUp, File, Plus, UploadCloud, AlertCircle, FileText, Presentation } from 'lucide-react';

export const DocumentsView: React.FC = () => {
  const { activeDocumentId, setActiveDocumentId, addToast } = useWorkspace();
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const documents = useLiveQuery(() => db.documents.orderBy('createdAt').reverse().toArray(), []) || [];

  // Auto-select first document if available and none selected
  useEffect(() => {
    if (!activeDocumentId && documents.length > 0) {
      setActiveDocumentId(documents[0].id);
    }
  }, [documents, activeDocumentId, setActiveDocumentId]);

  // Handle universal file upload (PDF, PPT, DOCX, TXT, MD)
  const processUploadedFile = async (file: File) => {
    const name = file.name.toLowerCase();
    const isSupported =
      name.endsWith('.pdf') ||
      name.endsWith('.docx') ||
      name.endsWith('.doc') ||
      name.endsWith('.pptx') ||
      name.endsWith('.ppt') ||
      name.endsWith('.txt') ||
      name.endsWith('.text') ||
      name.endsWith('.md') ||
      name.endsWith('.markdown') ||
      file.type.startsWith('text/');

    if (!isSupported) {
      addToast('Supported formats: PDF, DOCX, PPTX, TXT, and Markdown.', 'error');
      return;
    }

    if (file.size > 80 * 1024 * 1024) {
      addToast('File exceeds 80MB limit for local in-browser processing.', 'error');
      return;
    }

    setIsUploading(true);
    addToast(`Extracting text and pages from "${file.name}"...`, 'info');

    try {
      const result = await parseDocumentFile(file);

      const mimeType = name.endsWith('.pdf')
        ? 'application/pdf'
        : name.endsWith('.docx')
        ? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        : name.endsWith('.pptx')
        ? 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
        : 'text/plain';

      const blobId = `blob-${result.fileType}-${Date.now()}`;
      await db.blobs.put({
        id: blobId,
        data: file,
        mimeType,
        fileName: file.name,
        createdAt: Date.now(),
      });

      const docId = `doc-${Date.now()}`;
      await db.documents.put({
        id: docId,
        title: file.name.replace(/\.[^/.]+$/, ''),
        fileName: file.name,
        fileSize: file.size,
        pageCount: result.pageCount,
        fileBlobId: blobId,
        extractedPages: result.extractedPages,
        createdAt: Date.now(),
      });

      setActiveDocumentId(docId);
      const unit = result.fileType === 'pptx' || result.fileType === 'ppt' ? 'slides' : 'pages';
      addToast(`Parsed "${file.name}" (${result.pageCount} ${unit}). AI summary ready!`, 'success');
    } catch (err: any) {
      console.error('[DomoNote] Document upload failed:', err);
      addToast(`Failed to parse file: ${err?.message || 'Invalid format'}`, 'error');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Listen to Topbar trigger
  useEffect(() => {
    const handleUploadTrigger = () => fileInputRef.current?.click();
    window.addEventListener('domonote:upload-pdf', handleUploadTrigger);
    return () => window.removeEventListener('domonote:upload-pdf', handleUploadTrigger);
  }, []);

  const selectedDocument = documents.find((d) => d.id === activeDocumentId);

  const getDocIcon = (fileName: string) => {
    const lower = fileName.toLowerCase();
    if (lower.endsWith('.pptx') || lower.endsWith('.ppt')) {
      return <Presentation className="w-4 h-4 text-zinc-300 shrink-0" />;
    }
    if (lower.endsWith('.docx') || lower.endsWith('.doc') || lower.endsWith('.txt') || lower.endsWith('.md')) {
      return <FileText className="w-4 h-4 text-zinc-300 shrink-0" />;
    }
    return <File className="w-4 h-4 text-zinc-400 shrink-0" />;
  };

  return (
    <div className="flex h-full w-full overflow-hidden bg-black font-sans">
      <input
        type="file"
        ref={fileInputRef}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) processUploadedFile(file);
        }}
        accept=".pdf,.docx,.doc,.pptx,.ppt,.txt,.md,text/plain,application/pdf"
        className="hidden"
      />

      {/* Left Sidebar: Document List */}
      <div className="w-80 border-r border-zinc-850 flex flex-col h-full bg-zinc-950 shrink-0 select-none">
        <div className="p-4 border-b border-zinc-850 flex items-center justify-between">
          <span className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
            Documents ({documents.length})
          </span>
          <Button
            size="sm"
            variant="primary"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Upload</span>
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-zinc-850">
          {documents.length === 0 ? (
            <div className="p-8 text-center text-xs text-zinc-500">
              No documents uploaded yet. Upload a PDF, Word (DOCX), PowerPoint (PPTX), or text file to analyze with local AI.
            </div>
          ) : (
            documents.map((d) => {
              const isSelected = activeDocumentId === d.id;
              const isPresentation = d.fileName.toLowerCase().endsWith('.pptx') || d.fileName.toLowerCase().endsWith('.ppt');
              return (
                <div
                  key={d.id}
                  onClick={() => setActiveDocumentId(d.id)}
                  className={`p-4 cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-zinc-900/90 text-white border-l-2 border-white'
                      : 'hover:bg-zinc-900/40 text-zinc-300'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    {getDocIcon(d.fileName)}
                    <h4 className="text-xs font-semibold text-zinc-100 truncate">{d.title}</h4>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] font-mono text-zinc-500 pl-6">
                    <span>
                      {d.pageCount} {isPresentation ? 'slides' : 'pages'}
                    </span>
                    <span>•</span>
                    <span>{(d.fileSize / 1024 / 1024).toFixed(2)} MB</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Right Area: Document Viewer or Upload Dropzone */}
      <div className="flex-1 h-full min-w-0 flex flex-col">
        {selectedDocument ? (
          <PDFViewer
            document={selectedDocument}
            onDeleted={() => {
              const remaining = documents.filter((d) => d.id !== selectedDocument.id);
              setActiveDocumentId(remaining.length > 0 ? remaining[0].id : null);
            }}
          />
        ) : (
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const file = e.dataTransfer.files?.[0];
              if (file) processUploadedFile(file);
            }}
            className="flex-1 flex items-center justify-center p-8"
          >
            <div className="max-w-md w-full border-2 border-dashed border-zinc-850 rounded-2xl p-12 text-center bg-zinc-950/40 flex flex-col items-center shadow-2xl">
              <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 mb-4">
                <UploadCloud className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-semibold text-zinc-100 mb-1">Upload Any Document</h3>
              <p className="text-xs text-zinc-400 leading-relaxed mb-6">
                Drag and drop your PDF, Word (.docx), PowerPoint (.pptx), Markdown (.md), or plain text (.txt) file here.
                Parsed 100% locally with instant AI analysis.
              </p>
              <Button
                variant="primary"
                size="md"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
              >
                <FileUp className="w-4 h-4" />
                <span>{isUploading ? 'Extracting Text...' : 'Select Document'}</span>
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
