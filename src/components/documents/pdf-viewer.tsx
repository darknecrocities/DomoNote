import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { DocumentEntity, Annotation, AnnotationType } from '../../types';
import { db } from '../../db';
import { pdfjsLib } from '../../services/pdf/extractor';
import { AnnotationLayer } from './annotation-layer';
import { AISuggestionsModal } from './ai-suggestions-modal';
import { StepsModeModal } from './steps-mode';
import { Button } from '../ui/button';
import { useAI } from '../../context/ai-context';
import { useWorkspace } from '../../context/workspace-context';
import { chunkDocumentPages, retrieveRelevantChunks, buildRAGPrompt } from '../../services/ai/rag';
import { ollama } from '../../services/ai/ollama';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import DOMPurify from 'dompurify';
import {
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Highlighter,
  Square,
  Hash,
  MessageSquare,
  Sparkles,
  ListOrdered,
  Send,
  Save,
  Trash2,
  CheckCircle,
  PanelLeftClose,
  PanelLeftOpen,
  PanelRightClose,
  PanelRightOpen,
} from 'lucide-react';

interface PDFViewerProps {
  document: DocumentEntity;
  onDeleted?: () => void;
  onToggleList?: () => void;
  isListOpen?: boolean;
}

export const PDFViewer: React.FC<PDFViewerProps> = ({
  document: docEntity,
  onDeleted,
  onToggleList,
  isListOpen,
}) => {
  const { selectedModel, isConnected } = useAI();
  const { addToast, setActiveView, setActiveNoteId } = useWorkspace();

  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.2);
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [activeTool, setActiveTool] = useState<AnnotationType | null>(null);
  const [isAssistantOpen, setIsAssistantOpen] = useState<boolean>(() => {
    return typeof window !== 'undefined' && window.innerWidth >= 1280;
  });

  // Text selection floating toolbar state
  const [selectedText, setSelectedText] = useState('');
  const [selectionToolbarPos, setSelectionToolbarPos] = useState<{ x: number; y: number } | null>(
    null
  );

  // Modals state
  const [isSuggestionsModalOpen, setIsSuggestionsModalOpen] = useState(false);
  const [isStepsModalOpen, setIsStepsModalOpen] = useState(false);

  // AI Document Assistant panel state
  const [aiQuestion, setAiQuestion] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiSources, setAiSources] = useState<Array<{ pageNumber: number; text: string }>>([]);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const renderTaskRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [canvasDimensions, setCanvasDimensions] = useState({ width: 600, height: 800 });

  const [isTextDocument, setIsTextDocument] = useState<boolean>(false);

  // Load document from blob in IndexedDB (PDF or Text/DOCX/PPTX)
  useEffect(() => {
    let isMounted = true;
    async function loadPdf() {
      try {
        const storedBlob = await db.blobs.get(docEntity.fileBlobId);
        if (!storedBlob) throw new Error('Document binary file not found.');

        const isPdf =
          storedBlob.mimeType === 'application/pdf' ||
          docEntity.fileName.toLowerCase().endsWith('.pdf');

        if (isPdf) {
          try {
            const arrayBuffer = await storedBlob.data.arrayBuffer();
            const loadedPdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
            if (isMounted) {
              setPdfDoc(loadedPdf);
              setIsTextDocument(false);
            }
            return;
          } catch (pdfErr) {
            console.warn('[DomoNote] PDF parse fallback to digital paper:', pdfErr);
          }
        }

        // It is a PPTX, DOCX, TXT, or MD document
        if (isMounted) {
          setPdfDoc(null);
          setIsTextDocument(true);
        }
      } catch (err: any) {
        console.warn('[DomoNote] Document load fallback:', err);
        if (isMounted) {
          setIsTextDocument(true);
        }
      }
    }

    loadPdf();
    return () => {
      isMounted = false;
    };
  }, [docEntity]);

  // Auto-generate AI overview if not already generated
  useEffect(() => {
    if (docEntity && !aiResponse && !isAiLoading && isConnected && selectedModel) {
      askDocumentAI(`Provide an executive summary and 3 key takeaways of this document: "${docEntity.title}"`);
    }
  }, [docEntity?.id, isConnected, selectedModel]);

  // Load saved annotations for document
  useEffect(() => {
    let isMounted = true;
    async function loadAnnotations() {
      const list = await db.annotations.where('documentId').equals(docEntity.id).toArray();
      if (isMounted) {
        setAnnotations(list);
      }
    }
    loadAnnotations();
    return () => {
      isMounted = false;
    };
  }, [docEntity.id]);

  // Render current PDF page on canvas
  const renderPage = useCallback(
    async (pageNum: number) => {
      if (!pdfDoc || !canvasRef.current) return;

      if (renderTaskRef.current) {
        renderTaskRef.current.cancel();
      }

      const page = await pdfDoc.getPage(pageNum);
      const viewport = page.getViewport({ scale });
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      if (!context) return;

      canvas.width = viewport.width;
      canvas.height = viewport.height;
      setCanvasDimensions({ width: viewport.width, height: viewport.height });

      const renderContext = {
        canvasContext: context,
        viewport,
      };

      renderTaskRef.current = page.render(renderContext);
      try {
        await renderTaskRef.current.promise;
      } catch (err: any) {
        if (err?.name !== 'RenderingCancelledException') {
          console.warn('[DomoNote] Page render error:', err);
        }
      }
    },
    [pdfDoc, scale]
  );

  useEffect(() => {
    renderPage(currentPage);
  }, [currentPage, renderPage]);

  // Text selection handler
  const handleMouseUp = () => {
    const selection = window.getSelection();
    if (selection && selection.toString().trim().length > 3) {
      const text = selection.toString().trim();
      setSelectedText(text);

      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      setSelectionToolbarPos({
        x: rect.left + rect.width / 2,
        y: rect.top - 45,
      });
    } else {
      setSelectionToolbarPos(null);
    }
  };

  // Add annotation helper
  const addAnnotationAtCoords = async (type: AnnotationType, label?: string) => {
    const newAnn: Annotation = {
      id: `ann-${Date.now()}-${Math.random()}`,
      documentId: docEntity.id,
      pageNumber: currentPage,
      type,
      coords: {
        x: 10,
        y: 20 + (annotations.filter((a) => a.pageNumber === currentPage).length % 4) * 15,
        width: type === 'marker' ? 4 : 80,
        height: type === 'marker' ? 4 : 8,
      },
      color: type === 'rectangle' ? '#ef4444' : '#eab308',
      text: selectedText || undefined,
      label: label || (type === 'marker' ? `Step` : undefined),
      stepNumber:
        type === 'marker'
          ? annotations.filter((a) => a.pageNumber === currentPage && a.type === 'marker').length + 1
          : undefined,
      createdAt: Date.now(),
    };

    await db.annotations.put(newAnn);
    setAnnotations((prev) => [...prev, newAnn]);
    addToast('Annotation added to page.', 'success');
  };

  const handleRemoveAnnotation = async (id: string) => {
    await db.annotations.delete(id);
    setAnnotations((prev) => prev.filter((a) => a.id !== id));
    addToast('Annotation removed.', 'info');
  };

  // Selection Action Trigger
  const handleSelectionAction = async (action: 'explain' | 'summarize' | 'simplify' | 'note') => {
    setSelectionToolbarPos(null);
    if (!selectedText) return;

    if (action === 'note') {
      const noteId = `note-${Date.now()}`;
      await db.notes.put({
        id: noteId,
        title: `Excerpt from ${docEntity.title} (p.${currentPage})`,
        content: `> "${selectedText}"\n\n*Source: ${docEntity.title}, Page ${currentPage}*\n\n## Notes\n- `,
        tags: ['document', 'excerpt'],
        createdAt: Date.now(),
        updatedAt: Date.now(),
        versions: [],
      });
      addToast('Created note from selected excerpt.', 'success');
      setActiveNoteId(noteId);
      setActiveView('notes');
      return;
    }

    // AI question from selection
    const prompts = {
      explain: `Explain the following excerpt from Page ${currentPage} in clear terms: "${selectedText}"`,
      summarize: `Provide a concise 2-sentence summary of this excerpt from Page ${currentPage}: "${selectedText}"`,
      simplify: `Explain this text like I am completely new to the topic: "${selectedText}"`,
    };

    askDocumentAI(prompts[action]);
  };

  // Document Q&A with local RAG
  const askDocumentAI = async (queryText: string) => {
    if (!queryText.trim()) return;
    setIsAiLoading(true);
    setAiResponse('');
    setAiSources([]);

    try {
      // Chunk extracted pages
      const chunks = chunkDocumentPages(docEntity.extractedPages);
      // Lexical retrieval of top 4 chunks
      const relevant = retrieveRelevantChunks(queryText, chunks, 4);

      setAiSources(
        relevant.map((r) => ({
          pageNumber: r.pageNumber,
          text: r.text.slice(0, 120) + '...',
        }))
      );

      const prompt = buildRAGPrompt(queryText, relevant);

      if (!isConnected || !selectedModel) {
        setAiResponse(
          'Local AI (Ollama) is not connected. Connect Ollama in Settings to query this document.'
        );
        setIsAiLoading(false);
        return;
      }

      await ollama.streamGenerate(
        prompt,
        (chunk) => {
          setAiResponse((prev) => prev + chunk);
        },
        { model: selectedModel }
      );
    } catch (err: any) {
      setAiResponse(`Error generating response: ${err?.message || 'Unknown error'}`);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleSaveAiAnswerAsNote = async () => {
    if (!aiResponse) return;
    try {
      const noteId = `note-${Date.now()}`;
      await db.notes.put({
        id: noteId,
        title: `AI Analysis: ${docEntity.title}`,
        content: `# Document Intelligence: ${docEntity.title}\n\n**Query:** ${aiQuestion || 'Document Analysis'}\n\n${aiResponse}\n\n## Source Citations\n${aiSources.map((s) => `- Page ${s.pageNumber}: "${s.text}"`).join('\n')}`,
        tags: ['document', 'ai-analysis'],
        createdAt: Date.now(),
        updatedAt: Date.now(),
        versions: [],
      });
      addToast('Saved AI analysis to Notes.', 'success');
      setActiveNoteId(noteId);
      setActiveView('notes');
    } catch {
      addToast('Failed to save as note.', 'error');
    }
  };

  const handleDeleteDocument = async () => {
    if (confirm(`Permanently delete "${docEntity.title}" and its annotations?`)) {
      await db.documents.delete(docEntity.id);
      await db.blobs.delete(docEntity.fileBlobId);
      await db.annotations.where('documentId').equals(docEntity.id).delete();
      addToast('Document deleted.', 'info');
      if (onDeleted) onDeleted();
    }
  };

  const currentPageText =
    docEntity.extractedPages.find((p) => p.pageNumber === currentPage)?.text || '';

  return (
    <div
      className="flex-1 flex h-full bg-black overflow-hidden relative select-text"
      onMouseUp={handleMouseUp}
    >
      {/* Center Main: Document Canvas & Controls */}
      <div className="flex-1 flex flex-col h-full min-w-0 border-r border-zinc-850">
        {/* Top Viewer Controls */}
        <div className="h-12 border-b border-zinc-850 px-3 sm:px-4 flex items-center justify-between shrink-0 bg-zinc-950/60 gap-2 overflow-x-auto">
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {onToggleList && (
              <button
                onClick={onToggleList}
                className="p-1.5 rounded-md text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors"
                title={isListOpen ? 'Hide document list' : 'Show document list'}
                aria-label={isListOpen ? 'Hide document list' : 'Show document list'}
              >
                {isListOpen ? (
                  <PanelLeftClose className="w-3.5 h-3.5" />
                ) : (
                  <PanelLeftOpen className="w-3.5 h-3.5" />
                )}
              </button>
            )}

            <span className="text-xs font-semibold text-zinc-200 truncate max-w-[120px] sm:max-w-[200px]">
              {docEntity.title}
            </span>

            <div className="flex items-center gap-1 bg-zinc-900 border border-zinc-850 rounded px-1.5 py-0.5 text-xs font-mono text-zinc-400">
              <button
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="p-1 hover:text-white disabled:opacity-30"
                title="Previous page"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <span className="text-[11px]">
                {currentPage} / {docEntity.pageCount}
              </span>
              <button
                disabled={currentPage >= docEntity.pageCount}
                onClick={() => setCurrentPage((p) => Math.min(docEntity.pageCount, p + 1))}
                className="p-1 hover:text-white disabled:opacity-30"
                title="Next page"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Zoom and Annotation Tools */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <div className="hidden sm:flex items-center bg-zinc-900 border border-zinc-800 rounded px-1">
              <button
                onClick={() => setScale((s) => Math.max(0.6, s - 0.2))}
                className="p-1 text-zinc-400 hover:text-white"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="text-[10px] font-mono text-zinc-400 px-1.5">
                {Math.round(scale * 100)}%
              </span>
              <button
                onClick={() => setScale((s) => Math.min(2.5, s + 0.2))}
                className="p-1 text-zinc-400 hover:text-white"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="hidden md:block w-px h-4 bg-zinc-800 mx-0.5" />

            {/* Quick manual annotation buttons */}
            <Button
              size="sm"
              variant="outline"
              onClick={() => addAnnotationAtCoords('highlight')}
              title="Add Highlight Box"
              className="px-2"
            >
              <Highlighter className="w-3.5 h-3.5" />
              <span className="hidden xl:inline">Highlight</span>
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={() => addAnnotationAtCoords('rectangle', 'Caution')}
              title="Add Warning Box"
              className="px-2"
            >
              <Square className="w-3.5 h-3.5" />
              <span className="hidden xl:inline">Box</span>
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={() => addAnnotationAtCoords('marker')}
              title="Add Numbered Step Badge"
              className="px-2"
            >
              <Hash className="w-3.5 h-3.5" />
              <span className="hidden xl:inline">Step Badge</span>
            </Button>

            <div className="w-px h-4 bg-zinc-800 mx-0.5" />

            {/* AI Action Modals */}
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setIsSuggestionsModalOpen(true)}
              title="Analyze Page for Suggestions"
              className="px-2"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span className="hidden lg:inline">Callouts</span>
            </Button>

            <Button
              size="sm"
              variant="secondary"
              onClick={() => setIsStepsModalOpen(true)}
              title="Transform Section into Numbered Steps"
              className="px-2"
            >
              <ListOrdered className="w-3.5 h-3.5" />
              <span className="hidden lg:inline">Steps</span>
            </Button>

            {/* AI Assistant Panel Toggle */}
            <Button
              size="sm"
              variant={isAssistantOpen ? 'primary' : 'outline'}
              onClick={() => setIsAssistantOpen((prev) => !prev)}
              title={isAssistantOpen ? 'Hide Assistant Panel' : 'Show Assistant Panel'}
              className="px-2.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-zinc-300" />
              <span className="hidden sm:inline">AI Assistant</span>
            </Button>

            <Button size="icon" variant="ghost" onClick={handleDeleteDocument} title="Delete PDF">
              <Trash2 className="w-3.5 h-3.5 text-zinc-400 hover:text-red-400" />
            </Button>
          </div>
        </div>

        {/* Document Display Area (Canvas for PDF or Digital Reading Sheet for DOCX/PPTX/TXT) */}
        <div
          ref={containerRef}
          className="flex-1 overflow-auto p-8 flex items-start justify-center bg-zinc-950/40 select-text"
        >
          {isTextDocument ? (
            <div className="relative paper-desk-shadow border border-zinc-750 bg-white rounded-sm w-full max-w-2xl min-h-[720px] p-10 flex flex-col justify-between text-zinc-900 shadow-2xl select-text">
              <div>
                {/* Header */}
                <div className="flex items-center justify-between border-b border-zinc-200 pb-3 mb-6 text-[10px] font-mono text-zinc-500 uppercase">
                  <span className="font-bold tracking-wider">
                    {docEntity.fileName.toLowerCase().endsWith('.pptx') || docEntity.fileName.toLowerCase().endsWith('.ppt')
                      ? `SLIDE ${currentPage} OF ${docEntity.pageCount}`
                      : `PAGE ${currentPage} OF ${docEntity.pageCount}`}
                  </span>
                  <span>{docEntity.fileName}</span>
                </div>

                {/* Page Content */}
                <div className="text-sm font-sans text-zinc-900 leading-relaxed space-y-4 whitespace-pre-wrap font-normal select-text">
                  {currentPageText || 'Empty page content.'}
                </div>
              </div>

              {/* Footer */}
              <div className="pt-6 border-t border-zinc-200 flex items-center justify-between text-[10px] font-mono text-zinc-400">
                <span>LOCAL INDEXEDDB PERSISTED</span>
                <span>DOMONOTE INTELLIGENCE</span>
              </div>

              <AnnotationLayer
                annotations={annotations}
                pageNumber={currentPage}
                width={600}
                height={720}
                onRemoveAnnotation={handleRemoveAnnotation}
              />
            </div>
          ) : (
            <div className="relative paper-desk-shadow border border-zinc-750 bg-white rounded-sm">
              <canvas ref={canvasRef} className="block rounded-sm" />
              <AnnotationLayer
                annotations={annotations}
                pageNumber={currentPage}
                width={canvasDimensions.width}
                height={canvasDimensions.height}
                onRemoveAnnotation={handleRemoveAnnotation}
              />
            </div>
          )}
        </div>
      </div>

      {/* Right Panel: AI Document Intelligence Assistant */}
      {isAssistantOpen && (
        <div className="w-80 lg:w-96 bg-zinc-950 flex flex-col h-full shrink-0 select-none border-l border-zinc-850 animate-fade-in">
          <div className="p-3.5 border-b border-zinc-850 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-zinc-300" />
              <span className="text-xs font-semibold text-zinc-200 uppercase tracking-wider">
                Document Assistant
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-zinc-500 font-mono">Page {currentPage}</span>
              <button
                onClick={() => setIsAssistantOpen(false)}
                className="p-1 text-zinc-500 hover:text-white rounded transition-colors"
                title="Close assistant panel"
                aria-label="Close assistant panel"
              >
                <PanelRightClose className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Quick Question Chips */}
          <div className="p-3 border-b border-zinc-850 flex flex-wrap gap-1.5 bg-zinc-950/60">
            <button
              onClick={() => askDocumentAI('Summarize this page in 3 concise bullet points.')}
              className="text-[11px] text-zinc-400 hover:text-white bg-zinc-900 border border-zinc-800 px-2 py-1 rounded transition-colors"
            >
              Summarize Page
            </button>
            <button
              onClick={() => askDocumentAI('What are the main procedural steps or actions required?')}
              className="text-[11px] text-zinc-400 hover:text-white bg-zinc-900 border border-zinc-800 px-2 py-1 rounded transition-colors"
            >
              Main Steps
            </button>
            <button
              onClick={() => askDocumentAI('What are the critical requirements, warnings, or prerequisites?')}
              className="text-[11px] text-zinc-400 hover:text-white bg-zinc-900 border border-zinc-800 px-2 py-1 rounded transition-colors"
            >
              Requirements
            </button>
          </div>

          {/* AI Conversation View */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {aiResponse ? (
              <div className="space-y-3">
                <div className="p-4 rounded-lg bg-zinc-900/70 border border-zinc-850 text-xs text-zinc-200 space-y-2 leading-relaxed">
                  <div className="font-semibold text-zinc-100 flex items-center justify-between">
                    <span>AI Response</span>
                    <span className="text-[10px] text-zinc-500 font-mono">
                      Sources: p.{currentPage}
                    </span>
                  </div>
                  <div className="markdown-content">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {DOMPurify.sanitize(aiResponse)}
                    </ReactMarkdown>
                  </div>
                </div>

                {/* Save as Note Action */}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleSaveAiAnswerAsNote}
                  className="w-full flex items-center justify-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Analysis as Note</span>
                </Button>
              </div>
            ) : isAiLoading ? (
              <div className="flex flex-col items-center justify-center py-12 text-zinc-500 space-y-3 text-xs">
                <Sparkles className="w-5 h-5 text-zinc-400 animate-spin" />
                <span>Reading document chunks and querying local Ollama...</span>
              </div>
            ) : (
              <div className="py-12 text-center text-zinc-500 space-y-2 text-xs">
                <MessageSquare className="w-6 h-6 mx-auto text-zinc-600" />
                <p>Ask any question about this document or click the chips above.</p>
                <p className="text-[10px] text-zinc-600">
                  Queries stay strictly local against client-side chunks.
                </p>
              </div>
            )}

            {/* Citations Card */}
            {aiSources.length > 0 && (
              <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-850 space-y-2 text-[11px]">
                <span className="font-semibold text-zinc-400 uppercase tracking-wider text-[10px]">
                  Citations
                </span>
                {aiSources.map((src, idx) => (
                  <div
                    key={idx}
                    onClick={() => setCurrentPage(src.pageNumber)}
                    className="p-2 rounded bg-zinc-900/60 border border-zinc-800/80 cursor-pointer hover:border-zinc-700 transition-colors"
                  >
                    <div className="flex items-center justify-between font-mono text-[10px] text-zinc-400 mb-1">
                      <span>Page {src.pageNumber}</span>
                      <span className="text-emerald-400">Click to navigate</span>
                    </div>
                    <p className="text-zinc-300 line-clamp-2 italic text-[11px]">"{src.text}"</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* AI Question Prompt Input */}
          <div className="p-3 border-t border-zinc-850 bg-zinc-950/80">
            <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 focus-within:border-zinc-700">
              <input
                type="text"
                placeholder="Ask document question..."
                value={aiQuestion}
                onChange={(e) => setAiQuestion(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !isAiLoading) {
                    askDocumentAI(aiQuestion);
                    setAiQuestion('');
                  }
                }}
                disabled={isAiLoading}
                className="flex-1 bg-transparent text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none"
              />
              <button
                onClick={() => {
                  askDocumentAI(aiQuestion);
                  setAiQuestion('');
                }}
                disabled={isAiLoading || !aiQuestion.trim()}
                className="p-1 rounded text-zinc-400 hover:text-white disabled:opacity-30 transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Selection Contextual Toolbar */}
      {selectionToolbarPos && (
        <div
          style={{
            position: 'fixed',
            left: selectionToolbarPos.x,
            top: selectionToolbarPos.y,
            transform: 'translateX(-50%)',
          }}
          className="z-50 flex items-center gap-1 bg-zinc-900 border border-zinc-700 rounded-lg p-1 shadow-2xl animate-fade-in text-xs select-none"
        >
          <button
            onClick={() => handleSelectionAction('explain')}
            className="px-2 py-1 rounded text-zinc-200 hover:bg-zinc-800 transition-colors"
          >
            Explain
          </button>
          <button
            onClick={() => handleSelectionAction('summarize')}
            className="px-2 py-1 rounded text-zinc-200 hover:bg-zinc-800 transition-colors"
          >
            Summarize
          </button>
          <button
            onClick={() => handleSelectionAction('simplify')}
            className="px-2 py-1 rounded text-zinc-200 hover:bg-zinc-800 transition-colors"
          >
            Simplify
          </button>
          <div className="w-px h-3 bg-zinc-700 mx-0.5" />
          <button
            onClick={() => handleSelectionAction('note')}
            className="px-2 py-1 rounded text-zinc-200 hover:bg-zinc-800 transition-colors"
          >
            Make Note
          </button>
          <button
            onClick={() => {
              addAnnotationAtCoords('highlight');
              setSelectionToolbarPos(null);
            }}
            className="px-2 py-1 rounded text-yellow-300 hover:bg-zinc-800 transition-colors"
          >
            Highlight
          </button>
        </div>
      )}

      {/* Suggestions Modal */}
      {isSuggestionsModalOpen && (
        <AISuggestionsModal
          isOpen={isSuggestionsModalOpen}
          onClose={() => setIsSuggestionsModalOpen(false)}
          documentId={docEntity.id}
          currentPage={currentPage}
          pageText={currentPageText}
          onAcceptAnnotations={async (newAnns) => {
            await db.annotations.bulkPut(newAnns);
            setAnnotations((prev) => [...prev, ...newAnns]);
            addToast(`Applied ${newAnns.length} proposed annotations.`, 'success');
          }}
        />
      )}

      {/* Steps Mode Modal */}
      {isStepsModalOpen && (
        <StepsModeModal
          isOpen={isStepsModalOpen}
          onClose={() => setIsStepsModalOpen(false)}
          documentTitle={docEntity.title}
          sourcePage={currentPage}
          sourceText={selectedText || currentPageText.slice(0, 800)}
        />
      )}
    </div>
  );
};
