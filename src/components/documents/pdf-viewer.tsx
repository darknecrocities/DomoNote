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
} from 'lucide-react';

interface PDFViewerProps {
  document: DocumentEntity;
  onDeleted?: () => void;
}

export const PDFViewer: React.FC<PDFViewerProps> = ({ document: docEntity, onDeleted }) => {
  const { selectedModel, isConnected } = useAI();
  const { addToast, setActiveView, setActiveNoteId } = useWorkspace();

  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.2);
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [activeTool, setActiveTool] = useState<AnnotationType | null>(null);

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

  // Load PDF document from blob in IndexedDB
  useEffect(() => {
    let isMounted = true;
    async function loadPdf() {
      try {
        const storedBlob = await db.blobs.get(docEntity.fileBlobId);
        if (!storedBlob) throw new Error('Document binary file not found.');

        const arrayBuffer = await storedBlob.data.arrayBuffer();
        const loadedPdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        if (isMounted) {
          setPdfDoc(loadedPdf);
        }
      } catch (err: any) {
        console.error('[DomoNote] Failed to load PDF:', err);
        addToast('Failed to load PDF file from local storage.', 'error');
      }
    }

    loadPdf();
    return () => {
      isMounted = false;
    };
  }, [docEntity, addToast]);

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
        <div className="h-12 border-b border-zinc-850 px-4 flex items-center justify-between shrink-0 bg-zinc-950/60">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-zinc-200 truncate max-w-[200px]">
              {docEntity.title}
            </span>
            <div className="flex items-center gap-1 bg-zinc-900 border border-zinc-800 rounded px-1.5 py-0.5 text-xs font-mono text-zinc-400">
              <button
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="p-1 hover:text-white disabled:opacity-30"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <span>
                {currentPage} / {docEntity.pageCount}
              </span>
              <button
                disabled={currentPage >= docEntity.pageCount}
                onClick={() => setCurrentPage((p) => Math.min(docEntity.pageCount, p + 1))}
                className="p-1 hover:text-white disabled:opacity-30"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Zoom and Annotation Tools */}
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded px-1">
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

            <div className="w-px h-4 bg-zinc-800 mx-1" />

            {/* Quick manual annotation buttons */}
            <Button
              size="sm"
              variant="outline"
              onClick={() => addAnnotationAtCoords('highlight')}
              title="Add Highlight Box"
            >
              <Highlighter className="w-3.5 h-3.5" />
              <span className="hidden lg:inline">Highlight</span>
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={() => addAnnotationAtCoords('rectangle', 'Caution')}
              title="Add Warning Box"
            >
              <Square className="w-3.5 h-3.5" />
              <span className="hidden lg:inline">Box</span>
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={() => addAnnotationAtCoords('marker')}
              title="Add Numbered Step Badge"
            >
              <Hash className="w-3.5 h-3.5" />
              <span className="hidden lg:inline">Step Badge</span>
            </Button>

            <div className="w-px h-4 bg-zinc-800 mx-1" />

            {/* AI Action Modals */}
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setIsSuggestionsModalOpen(true)}
              title="Analyze Page for Suggestions"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Suggest Callouts</span>
            </Button>

            <Button
              size="sm"
              variant="secondary"
              onClick={() => setIsStepsModalOpen(true)}
              title="Transform Section into Numbered Steps"
            >
              <ListOrdered className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Turn into Steps</span>
            </Button>

            <Button size="icon" variant="ghost" onClick={handleDeleteDocument} title="Delete PDF">
              <Trash2 className="w-3.5 h-3.5 text-zinc-400 hover:text-red-400" />
            </Button>
          </div>
        </div>

        {/* Canvas Display Area */}
        <div
          ref={containerRef}
          className="flex-1 overflow-auto p-8 flex items-start justify-center bg-zinc-950/40"
        >
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
        </div>
      </div>

      {/* Right Panel: AI Document Intelligence Assistant */}
      <div className="w-96 bg-zinc-950 flex flex-col h-full shrink-0 select-none">
        <div className="p-4 border-b border-zinc-850 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-zinc-300" />
            <span className="text-xs font-semibold text-zinc-200 uppercase tracking-wider">
              Document Assistant
            </span>
          </div>
          <span className="text-[10px] text-zinc-500 font-mono">Page {currentPage} Focus</span>
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
                  {aiSources.length > 0 && (
                    <span className="text-[10px] text-zinc-400 font-mono">
                      Sources: {aiSources.map((s) => `p.${s.pageNumber}`).join(', ')}
                    </span>
                  )}
                </div>
                <div className="prose prose-invert max-w-none text-xs">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {DOMPurify.sanitize(aiResponse)}
                  </ReactMarkdown>
                </div>
              </div>

              {/* Source Page Badges */}
              {aiSources.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">
                    Citations
                  </span>
                  {aiSources.map((source, idx) => (
                    <div
                      key={idx}
                      onClick={() => setCurrentPage(source.pageNumber)}
                      className="p-2 rounded bg-zinc-900/40 border border-zinc-850 text-[11px] cursor-pointer hover:border-zinc-700 transition-colors"
                    >
                      <div className="flex items-center justify-between text-zinc-400 font-mono text-[10px] mb-0.5">
                        <span>Page {source.pageNumber}</span>
                        <span>Click to navigate</span>
                      </div>
                      <p className="text-zinc-300 line-clamp-2 italic">"{source.text}"</p>
                    </div>
                  ))}
                </div>
              )}

              <Button
                size="sm"
                variant="outline"
                onClick={handleSaveAiAnswerAsNote}
                className="w-full"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Response to Notes</span>
              </Button>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-zinc-500 text-xs">
              <MessageSquare className="w-6 h-6 mb-2 text-zinc-600" />
              <span>Ask questions about this PDF or highlight any text to explain or annotate.</span>
            </div>
          )}
        </div>

        {/* Ask Input */}
        <div className="p-3 border-t border-zinc-850 bg-zinc-950">
          <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5">
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
