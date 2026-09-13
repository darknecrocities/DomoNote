import React, { useState, useEffect, useRef } from 'react';
import { useWorkspace } from '../context/workspace-context';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { PDFViewer } from '../components/documents/pdf-viewer';
import { extractTextFromPDF } from '../services/pdf/extractor';
import { EmptyState } from '../components/ui/empty-state';
import { Button } from '../components/ui/button';
import { FileUp, File, Plus, UploadCloud, AlertCircle } from 'lucide-react';

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

  // Handle PDF file upload
  const processUploadedFile = async (file: File) => {
    if (!file.name.toLowerCase().endsWith('.pdf') && file.type !== 'application/pdf') {
      addToast('Only PDF documents are currently supported.', 'error');
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      addToast('File exceeds 50MB limit for local in-browser processing.', 'error');
      return;
    }

    setIsUploading(true);
    addToast('Parsing PDF and extracting text pages...', 'info');

    try {
      const arrayBuffer = await file.arrayBuffer();
      // Security check: Validate PDF magic bytes %PDF-
      const header = new Uint8Array(arrayBuffer.slice(0, 5));
      const headerString = String.fromCharCode(...header);
      if (!headerString.startsWith('%PDF-')) {
        throw new Error('Invalid PDF file signature.');
      }

      const { pageCount, extractedPages } = await extractTextFromPDF(arrayBuffer);

      const blobId = `blob-pdf-${Date.now()}`;
      await db.blobs.put({
        id: blobId,
        data: file,
        mimeType: 'application/pdf',
        fileName: file.name,
        createdAt: Date.now(),
      });

      const docId = `doc-${Date.now()}`;
      await db.documents.put({
        id: docId,
        title: file.name.replace(/\.[^/.]+$/, ''),
        fileName: file.name,
        fileSize: file.size,
        pageCount,
        fileBlobId: blobId,
        extractedPages,
        createdAt: Date.now(),
      });

      setActiveDocumentId(docId);
      addToast(`Successfully parsed "${file.name}" (${pageCount} pages).`, 'success');
    } catch (err: any) {
      console.error('[DomoNote] PDF upload failed:', err);
      addToast(`Failed to parse PDF: ${err?.message || 'Invalid file'}`, 'error');
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

  return (
    <div className="flex h-full w-full overflow-hidden bg-black">
      <input
        type="file"
        ref={fileInputRef}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) processUploadedFile(file);
        }}
        accept="application/pdf"
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
            <span>Upload PDF</span>
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-zinc-850">
          {documents.length === 0 ? (
            <div className="p-8 text-center text-xs text-zinc-500">
              No documents uploaded yet. Upload a PDF to read, annotate, and analyze with local AI.
            </div>
          ) : (
            documents.map((d) => {
              const isSelected = activeDocumentId === d.id;
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
                    <File className="w-4 h-4 text-zinc-400 shrink-0" />
                    <h4 className="text-xs font-semibold text-zinc-100 truncate">{d.title}</h4>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-zinc-500 pl-6">
                    <span>{d.pageCount} pages</span>
                    <span>•</span>
                    <span>{(d.fileSize / 1024 / 1024).toFixed(2)} MB</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Right Area: PDF Viewer or Upload Dropzone */}
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
            <div className="max-w-md w-full border-2 border-dashed border-zinc-850 rounded-2xl p-12 text-center bg-zinc-950/40 flex flex-col items-center">
              <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 mb-4">
                <UploadCloud className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-semibold text-zinc-100 mb-1">Upload Document</h3>
              <p className="text-xs text-zinc-400 leading-relaxed mb-6">
                Drag and drop your PDF here, or browse from your computer. Stored 100% locally in your
                browser with instant text extraction and AI Q&A.
              </p>
              <Button
                variant="primary"
                size="md"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
              >
                <FileUp className="w-4 h-4" />
                <span>{isUploading ? 'Extracting Text...' : 'Select PDF File'}</span>
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
