# DOMONOTE: SOURCE OF TRUTH (SOT)

Document Version: 1.0.0
Product: DomoNote
Repository: https://github.com/darknecrocities/DomoNote
Status: Canonical Architecture and Technical Specification

---

## 1. Product Statement

DomoNote is an open-source, local-first AI note-taking and knowledge workspace.
Tagline: "Capture it. Understand it. Keep it."
Secondary description: "Your local-first AI workspace for meetings, documents, and notes."

DomoNote integrates four primary knowledge modalities into a unified workspace:
1. Markdown and Structured Notes
2. Meeting Recording, Timelines, and AI Syntheses
3. Document / PDF Intelligence and Coordinate-Anchored Annotations
4. Computer Operation Capture and Step-by-Step Manual Generation

---

## 2. Core Architectural Principles

1. Local-First Storage: All user notes, meetings, audio recordings, uploaded PDFs, annotations, and generated manuals are persisted client-side in IndexedDB via Dexie. No remote database or mandatory server is required for full functionality.
2. Vercel Compatibility: The web application is built strictly as a client-side React Single Page Application (SPA) using Vite. It builds without Node.js backend requirements and is directly deployable to static hosts such as Vercel.
3. Decoupled Local AI: Local intelligence communicates with Ollama at http://localhost:11434. If Ollama is offline or unavailable, the application provides clear visual status and diagnostic instructions rather than failing or substituting synthetic responses.
4. Privacy and Zero Telemetry: No user data, uploaded documents, or transcripts are transmitted to third-party cloud services. Operating system and browser permissions are requested explicitly.
5. Real Data Integrity: The application does not generate or display synthetic filler cards, fake statistics, or mock AI completions. Empty states are explicitly communicated.
6. Grayscale Visual Discipline: The visual system is strictly black, white, and grayscale. Saturated accent colors are restricted to semantic states (recording active, connection status, alerts). Emojis are prohibited across UI icons and documentation.

---

## 3. Technology Stack

- Frontend Framework: React 18, TypeScript 5 (Strict Mode)
- Build Tool: Vite 6
- Styling: Tailwind CSS 3 (configured with custom grayscale tokens)
- Iconography: Lucide React (no emojis permitted)
- Local Database: IndexedDB via Dexie 4
- Document Engine: PDF.js (pdfjs-dist)
- Markdown Engine: React Markdown, Remark GFM, DOMPurify for HTML sanitization
- Export Engines: jsPDF (for client-side PDF rendering), native Markdown/JSON serializers
- Local AI Service: Ollama REST API (streaming generate, chat, and tag endpoints)
- Optional Companion: Python FastAPI (Whisper audio transcription, desktop screen capture)
- Optional Extension: Chrome Manifest V3 (Google Meet capture integration)

---

## 4. Entity Data Models

All entities are defined with strict TypeScript typing and indexed in IndexedDB:

### 4.1 Note
- id: string (UUID)
- title: string
- content: string (Markdown)
- folderId?: string
- tags: string[]
- createdAt: number (timestamp)
- updatedAt: number (timestamp)
- versions: NoteVersion[] (id, timestamp, content, title)

### 4.2 Meeting
- id: string (UUID)
- title: string
- startTime: number
- endTime?: number
- durationSeconds: number
- audioBlobId?: string (reference to Blobs table)
- transcript: TranscriptSegment[] (id, timestampSeconds, speaker, text)
- manualNotes: string
- timeline: TimelineItem[] (timestampSeconds, label, type)
- summary?: MeetingSummary (overview, decisions, actionItems, topics, followUpTasks)

### 4.3 Document
- id: string (UUID)
- title: string
- fileName: string
- fileSize: number
- pageCount: number
- fileBlobId: string (reference to Blobs table)
- extractedPages: ExtractedPage[] (pageNumber, text)
- createdAt: number

### 4.4 Annotation
- id: string (UUID)
- documentId: string
- pageNumber: number
- type: 'highlight' | 'underline' | 'rectangle' | 'arrow' | 'marker' | 'note'
- coords: { x: number, y: number, width: number, height: number }
- color: string
- text?: string
- label?: string
- createdAt: number

### 4.5 OperationSession
- id: string (UUID)
- title: string
- recordedAt: number
- durationSeconds: number
- steps: OperationStep[] (id, stepNumber, timestamp, screenshotBlobId, actionDescription, clickCoords, annotations)

### 4.6 Manual
- id: string (UUID)
- title: string
- purpose: string
- requirements: string[]
- steps: ManualStep[] (stepNumber, title, description, screenshotBlobId, warnings)
- warnings: string[]
- expectedResult: string
- troubleshooting: string[]
- createdAt: number
- updatedAt: number

### 4.7 Template
- id: string
- title: string
- category: 'meeting' | 'document' | 'operation' | 'general'
- description: string
- defaultContent: string
- isBuiltin: boolean

### 4.8 Settings
- ollamaBaseUrl: string (default: "http://localhost:11434")
- selectedModel: string
- autoSaveIntervalSeconds: number
- companionUrl: string (default: "http://localhost:8765")
- speechRecognitionLanguage: string (default: "en-US")

---

## 5. Security and Privacy Boundaries

1. XSS Prevention: Raw markdown text is rendered through React Markdown with dangerous HTML execution disabled and sanitized with DOMPurify.
2. Path Traversal & File Uploads: PDF uploads are validated for valid PDF headers (%PDF-) and constrained by client-side size thresholds.
3. Network Boundaries: All network requests originating from the web application target localhost (Ollama or optional Companion) or are completely client-side.
4. Browser Permissions: Microphone and Screen Capture APIs are invoked only in response to direct user initiation. Visual indicators (such as pulse animations and timers) remain active while capturing.

---

## 6. Git Branching and Release Protocol

- Default Production Branch: main
- Feature Branch Naming: feature/<feature-name>
- Bugfix Branch Naming: fix/<issue-name>
- Contribution Flow: All modifications are committed to a feature branch, submitted via Pull Request to main, reviewed, and merged.
- Commit Message Convention: Clear imperative descriptions strictly avoiding emojis.
