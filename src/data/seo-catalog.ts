export type SEOCategory =
  | 'features'
  | 'models'
  | 'compare'
  | 'templates'
  | 'guides'
  | 'solutions'
  | 'tools'
  | 'download';

export interface SEOPageItem {
  slug: string;
  category: SEOCategory;
  subCategory?: string;
  path: string;
  name: string;
  title: string;
  description: string;
  keywords: string;
  badge: string;
  summary: string;
  highlights: { title: string; desc: string }[];
  steps?: { step: string; title: string; desc: string }[];
  faqs: { question: string; answer: string }[];
  schemaType?: 'SoftwareApplication' | 'Article' | 'HowTo';
}

export const SEO_PAGES: SEOPageItem[] = [
  // =========================================================================
  // 1. CORE FEATURES & CAPABILITIES (/features/*)
  // =========================================================================
  {
    slug: 'offline-meeting-transcription',
    category: 'features',
    path: '/features/offline-meeting-transcription',
    name: 'Offline Meeting Transcription',
    title: 'Offline Meeting Transcription & Local Speech-to-Text | DomoNote',
    description: 'Transcribe meetings, calls, and audio files 100% offline with zero cloud leaks. High-accuracy local speech-to-text powered by Faster-Whisper and Web Audio.',
    keywords: 'offline meeting transcription, local speech to text, private audio transcription, offline transcriber, Faster-Whisper desktop, meeting notes AI offline',
    badge: '100% Offline Audio',
    summary: 'DomoNote transcribes your meetings directly on your device CPU/GPU. No audio streams are sent to remote servers or third-party APIs. Enjoy real-time speech-to-text with zero latency and complete confidentiality.',
    highlights: [
      { title: 'Zero Cloud Uploads', desc: 'Audio is captured and processed strictly inside your machine hardware without external transmission.' },
      { title: 'Faster-Whisper & Web Speech', desc: 'Combines browser-native speech recognition with high-precision local Whisper neural models.' },
      { title: 'Instant Live Transcript', desc: 'Watch spoken dialogue turn into structured timestamps with live speaker tags and editable text.' },
      { title: 'Unlimited Duration', desc: 'No monthly minute caps, no subscription paywalls, and no audio length limits.' }
    ],
    steps: [
      { step: '01', title: 'Start Meeting Session', desc: 'Launch DomoNote and hit Start Recording or connect your browser tab.' },
      { step: '02', title: 'Real-Time Audio Ingestion', desc: 'Audio streams through the local audio analyzer pipeline without internet reliance.' },
      { step: '03', title: 'Export & Synthesize', desc: 'Export formatted meeting minutes to Markdown, PDF, or query the transcript with local AI.' }
    ],
    faqs: [
      { question: 'Does DomoNote require an internet connection to transcribe?', answer: 'No. DomoNote runs all audio recognition and local models entirely offline on your hardware.' },
      { question: 'Is my voice data saved on external servers?', answer: 'Never. DomoNote has zero external telemetry and stores audio and transcripts solely in your local IndexedDB.' },
      { question: 'Can I transcribe both microphone and system audio?', answer: 'Yes. Use DomoNote with our Chrome Extension or native desktop app to capture internal system audio and mic simultaneously.' }
    ],
    schemaType: 'SoftwareApplication'
  },
  {
    slug: 'local-ai-secretary',
    category: 'features',
    path: '/features/local-ai-secretary',
    name: 'Local AI Secretary',
    title: 'Personal AI Secretary — Privacy-First On-Device Executive Assistant | DomoNote',
    description: 'Your autonomous personal AI secretary for meetings, documents, action items, and knowledge capture. Runs locally with Ollama and zero cloud telemetry.',
    keywords: 'personal AI secretary, local AI assistant, on-device executive secretary, private meeting assistant, local LLM assistant, Ollama AI secretary',
    badge: 'Personal Assistant',
    summary: 'DomoNote acts as your executive assistant throughout your workday: listening to meetings, extracting next steps, cataloging notes, and summarizing documents with self-hosted AI models.',
    highlights: [
      { title: 'Autonomous Organization', desc: 'Automatically synthesizes chaotic meeting discussions into structured minutes, summaries, and action matrices.' },
      { title: 'Local LLM Orchestration', desc: 'Compatible with Ollama models like Qwen 2.5, Llama 3.2, Gemma 2, and DeepSeek R1.' },
      { title: 'Multi-Context Memory', desc: 'Connects notes, PDFs, recorded calls, and screen manuals into an integrated local knowledge base.' },
      { title: 'Total Data Sovereignty', desc: 'Never pay monthly SaaS fees or worry about data breaches, training on your data, or compliance risks.' }
    ],
    faqs: [
      { question: 'How is DomoNote different from general AI chatbots?', answer: 'Unlike general chat interfaces, DomoNote is an integrated workspace that connects audio capture, screen operations, document parsing, and notes.' },
      { question: 'Which local LLM does DomoNote use by default?', answer: 'DomoNote defaults to Qwen 2.5 3B via Ollama, offering blazing fast inference on consumer laptops with as little as 4 GB of RAM.' }
    ],
    schemaType: 'SoftwareApplication'
  },
  {
    slug: 'speaker-identification-diarization',
    category: 'features',
    path: '/features/speaker-identification-diarization',
    name: 'Speaker Diarization & Audio Detection',
    title: 'Local Speaker Diarization & Participant Detection | DomoNote',
    description: 'Automatically distinguish and identify speakers in meetings without cloud processing. Visual participant scanner and acoustic voice activity detection.',
    keywords: 'speaker diarization offline, local speaker identification, meeting participant detector, voice activity detection local, who spoke when AI',
    badge: 'Audio Intelligence',
    summary: 'Distinguish who said what in every conference call. DomoNote uses local acoustic frequency clustering and visual participant scanning to assign speaker tags to every transcript paragraph.',
    highlights: [
      { title: 'Local Voice Clustering', desc: 'Groups speech segments by acoustic resonance and pitch profiles without sending biometrics to the cloud.' },
      { title: 'Google Meet Participant Sync', desc: 'Pair with the Chrome extension to automatically match video participant names with active audio streams.' },
      { title: 'Editable Speaker Labels', desc: 'Quickly reassign or rename speaker names with one click across the entire session transcript.' },
      { title: 'Multi-Speaker Turn Taking', desc: 'Preserves the conversational dynamics and back-and-forth flow of collaborative brainstorming.' }
    ],
    faqs: [
      { question: 'Are voiceprints uploaded to the cloud?', answer: 'No. All acoustic feature extraction happens locally within your browser and desktop companion sandbox.' },
      { question: 'Can I rename speakers in the transcript?', answer: 'Yes. You can edit speaker tags in real time during the call or retroactively after the meeting ends.' }
    ],
    schemaType: 'SoftwareApplication'
  },
  {
    slug: 'meeting-minutes-generator',
    category: 'features',
    path: '/features/meeting-minutes-generator',
    name: 'Meeting Minutes Generator',
    title: 'Automated Meeting Minutes & Summary Generator | DomoNote',
    description: 'Transform raw meeting transcripts into executive minutes, key decisions, and formatted action item lists instantly using local AI models.',
    keywords: 'automated meeting minutes, AI meeting summary generator, executive minutes generator, MoM generator offline, meeting notes synthesis',
    badge: 'Automated MoM',
    summary: 'Say goodbye to tedious note taking. DomoNote extracts executive summaries, bullet points, discussion topics, and agreed decisions from any conversation in seconds.',
    highlights: [
      { title: 'Executive Summary Format', desc: 'Condenses 60-minute calls into concise, readable paragraphs highlighting core outcomes.' },
      { title: 'Decision Logging', desc: 'Isolates critical business decisions and resolutions so nothing gets lost between teams.' },
      { title: 'Custom Prompt Templates', desc: 'Generate summaries tailored for Engineering Standups, Board Meetings, 1-on-1s, or Client Sales Calls.' },
      { title: 'One-Click Markdown & PDF Export', desc: 'Distribute polished minutes to stakeholders immediately after the call wraps up.' }
    ],
    faqs: [
      { question: 'What summary formats are supported?', answer: 'DomoNote supports Executive Overviews, Detailed Minutes of Meeting (MoM), Action Matrices, and Topic-by-Topic breakdowns.' },
      { question: 'Can I customize the summary prompts?', answer: 'Yes. You can configure custom system prompts and select different local LLM models in Settings.' }
    ],
    schemaType: 'SoftwareApplication'
  },
  {
    slug: 'action-items-extractor',
    category: 'features',
    path: '/features/action-items-extractor',
    name: 'Action Items Extractor',
    title: 'AI Action Items & Task Extractor for Meetings | DomoNote',
    description: 'Automatically extract assignees, deadlines, deliverables, and follow-ups from meeting audio. Seamlessly export to task boards and calendars.',
    keywords: 'action items extractor, meeting task extractor AI, follow up tracker, automated todo list from audio, meeting deliverables generator',
    badge: 'Task Intelligence',
    summary: 'Never miss a post-meeting commitment. DomoNote scans meeting dialogue for linguistic commitment cues and compiles a structured checklist with owners and deadlines.',
    highlights: [
      { title: 'Owner & Assignee Detection', desc: 'Identifies which participant accepted the assignment based on conversational context.' },
      { title: 'Deadline & Date Recognition', desc: 'Parses relative terms like "next Tuesday", "by EOD", or "end of quarter" into calendar-ready dates.' },
      { title: 'ICS & Google Calendar Sync', desc: 'Export tasks directly to your personal calendar or sync with Google Calendar seamlessly.' },
      { title: 'Markdown Checklist Format', desc: 'Copies straight into Jira, Linear, Notion, or Obsidian as actionable checkboxes.' }
    ],
    faqs: [
      { question: 'How accurately does it detect assignments?', answer: 'Local models like Qwen 2.5 and Llama 3.2 are specifically prompted to recognize affirmative commitments and deliverables.' },
      { question: 'Can I export tasks to my calendar?', answer: 'Yes. DomoNote generates downloadable standard ICS files and integrates with Google Calendar.' }
    ],
    schemaType: 'SoftwareApplication'
  },
  {
    slug: 'google-meet-transcription',
    category: 'features',
    path: '/features/google-meet-transcription',
    name: 'Google Meet Transcription',
    title: 'Private Google Meet Transcriber — No Cloud Bots | DomoNote',
    description: 'Capture Google Meet audio directly with the DomoNote Chrome Extension. No awkward third-party recording bots joining your call.',
    keywords: 'google meet transcriber, transcribe google meet offline, google meet recording bot alternative, private google meet notes, chrome extension meeting recorder',
    badge: 'Chrome Extension',
    summary: 'Record and transcribe Google Meet calls without inviting an uninvited bot to your client meetings. The DomoNote Manifest V3 Chrome Extension streams tab audio straight to your local workspace.',
    highlights: [
      { title: 'No Invasive Bots', desc: 'Operates completely silently from your browser tab. Clients never see a "Bot" joining the meeting.' },
      { title: 'Bidirectional Audio Stream', desc: 'Captures both your microphone and incoming conference audio cleanly.' },
      { title: 'Always-On-Top Mini HUD', desc: 'Monitor transcription progress and mark timestamps without switching browser tabs.' },
      { title: 'One-Click Sync', desc: 'Seamlessly pipes audio into your DomoNote local database for instant AI processing.' }
    ],
    faqs: [
      { question: 'Do other meeting participants see that I am using DomoNote?', answer: 'No bot joins the call. Audio is captured locally via the standard Chrome tab audio stream.' },
      { question: 'How do I install the Chrome extension?', answer: 'Load the unpacked browser-extension folder into Chrome via Developer Mode in chrome://extensions.' }
    ],
    schemaType: 'SoftwareApplication'
  },
  {
    slug: 'zoom-teams-meeting-recorder',
    category: 'features',
    path: '/features/zoom-teams-meeting-recorder',
    name: 'Zoom & Teams Meeting Audio Capture',
    title: 'Zoom & Microsoft Teams Local Meeting Recorder | DomoNote',
    description: 'Record and transcribe Zoom, Microsoft Teams, Webex, and Discord audio locally. Completely private, offline speech-to-text without cloud subscriptions.',
    keywords: 'zoom meeting recorder offline, microsoft teams transcriber local, private zoom transcription, webex audio recorder, teams meeting notes AI',
    badge: 'Desktop Loopback',
    summary: 'Capture system audio from any desktop conference software. DomoNote captures native audio loopback on Windows, macOS, and Linux to transcribe Zoom and Microsoft Teams calls privately.',
    highlights: [
      { title: 'Universal Software Support', desc: 'Works seamlessly with Zoom, Microsoft Teams, Slack Huddles, Webex, and Discord.' },
      { title: 'Local Audio Driver Capture', desc: 'High-fidelity audio stream capture directly from OS output buffers.' },
      { title: 'Offline Minutes Generation', desc: 'Produce comprehensive meeting minutes as soon as the meeting disconnects.' },
      { title: 'Local Encryption & Storage', desc: 'Keep sensitive enterprise strategy and client calls safe on your encrypted drive.' }
    ],
    faqs: [
      { question: 'Does this work with Zoom breakout rooms?', answer: 'Yes. Since audio is captured from your computer system audio output, breakout rooms work transparently.' },
      { question: 'Is any software installed into Zoom or Teams?', answer: 'No. DomoNote operates externally on your desktop without requiring third-party app marketplace permissions.' }
    ],
    schemaType: 'SoftwareApplication'
  },
  {
    slug: 'document-pdf-intelligence',
    category: 'features',
    path: '/features/document-pdf-intelligence',
    name: 'Document & PDF Intelligence',
    title: 'Local Document AI & PDF Intelligence Parser | DomoNote',
    description: 'Analyze, search, and summarize PDFs, DOCX, and PPTX documents locally. In-browser viewer with visual annotations, key takeaways, and offline extraction.',
    keywords: 'local PDF AI, document intelligence offline, PDF summarizer local, private document parser, offline docx reader AI, annotate PDF offline',
    badge: 'Document Intelligence',
    summary: 'Read, annotate, and comprehend complex documents locally. DomoNote combines an in-browser PDF viewer with local AI analysis to synthesize technical papers, contracts, and presentations.',
    highlights: [
      { title: 'Universal File Parser', desc: 'Supports PDF, Word (.docx), PowerPoint (.pptx), Markdown, and TXT files up to 80 MB.' },
      { title: 'Interactive Annotations', desc: 'Highlight text, draw diagrams, and attach contextual notes directly onto document pages.' },
      { title: 'Local Document Summaries', desc: 'Generate bulleted executive summaries, keyword indices, and argument breakdowns in seconds.' },
      { title: 'Zero Document Uploads', desc: 'Confidential corporate documents and NDA-governed contracts never touch a third-party server.' }
    ],
    faqs: [
      { question: 'What is the maximum PDF file size?', answer: 'DomoNote comfortably parses documents up to 80 MB directly inside your local memory.' },
      { question: 'Can I ask questions about a specific PDF page?', answer: 'Yes. The integrated local AI chat can reference exact page contents and highlight corresponding sections.' }
    ],
    schemaType: 'SoftwareApplication'
  },
  {
    slug: 'local-rag-vector-search',
    category: 'features',
    path: '/features/local-rag-vector-search',
    name: 'Local RAG & Semantic Vector Search',
    title: 'Local RAG & Semantic Vector Search for Documents | DomoNote',
    description: 'Query your personal knowledge base using local Retrieval-Augmented Generation (RAG). Search across notes, transcripts, and documents with Ollama embeddings.',
    keywords: 'local RAG, semantic vector search offline, Ollama RAG, private document search, local embeddings AI, retrieval augmented generation desktop',
    badge: 'Local RAG Engine',
    summary: 'Search by meaning, not just keywords. DomoNote embeds your notes, meeting transcripts, and PDF files into local vector indexes for grounded question answering with zero data leakage.',
    highlights: [
      { title: 'Local Embeddings Calculation', desc: 'Runs embedding models like nomic-embed-text locally on your machine.' },
      { title: 'Grounded Citations', desc: 'AI answers cite specific documents, page numbers, and meeting timestamps.' },
      { title: 'Zero Hallucinations', desc: 'Restricts LLM responses strictly to facts retrieved from your verified local library.' },
      { title: 'Blazing Fast In-Memory Search', desc: 'Queries indexed databases in milliseconds without remote network requests.' }
    ],
    faqs: [
      { question: 'Do my documents get sent to OpenAI or cloud vector databases?', answer: 'No. Vector embeddings and semantic retrieval are executed 100% locally on your machine.' },
      { question: 'What embedding models are supported?', answer: 'DomoNote supports Ollama-compatible embedding models including nomic-embed-text and all-minilm.' }
    ],
    schemaType: 'SoftwareApplication'
  },
  {
    slug: 'screen-recording-sop-builder',
    category: 'features',
    path: '/features/screen-recording-sop-builder',
    name: 'Screen Recording & SOP Manual Builder',
    title: 'Screen Recording & SOP Manual Generator | DomoNote',
    description: 'Record screen workflows and automatically generate step-by-step Standard Operating Procedure (SOP) manuals with annotated screenshots and instructions.',
    keywords: 'SOP manual generator, screen recording to SOP, automated workflow documentation, create SOP from screen, scribe alternative offline, step by step guide creator',
    badge: 'Operations & SOP',
    summary: 'Turn screen clicks and workflows into professional training manuals. DomoNote captures your desktop steps, annotates key moments, and drafts complete training guides automatically.',
    highlights: [
      { title: 'Automatic Step Generation', desc: 'Converts recorded actions into chronological step-by-step instructions.' },
      { title: 'Integrated Screenshot Editor', desc: 'Add red arrows, boxes, blur sensitive credentials, and highlight target buttons.' },
      { title: 'Export to PDF & Markdown', desc: 'Publish training guides for new hires, QA reproduction steps, or IT helpdesk playbooks.' },
      { title: 'Picture-in-Picture (PiP) HUD', desc: 'Controls stay neatly tucked in a floating HUD while you navigate across desktop windows.' }
    ],
    faqs: [
      { question: 'How is this different from tools like Scribe or Loom?', answer: 'DomoNote runs 100% locally on your computer with zero monthly fees, no watermarks, and no cloud uploads.' },
      { question: 'Can I redact sensitive information before exporting?', answer: 'Yes. The built-in screenshot annotator includes blur, crop, and highlight tools.' }
    ],
    schemaType: 'SoftwareApplication'
  },
  {
    slug: 'multilingual-audio-translation',
    category: 'features',
    path: '/features/multilingual-audio-translation',
    name: 'Multilingual Audio Translation',
    title: 'Real-Time Multilingual Speech Translation | DomoNote',
    description: 'Transcribe and translate meetings across 10+ languages in real time. Powered by local multilingual LLMs and speech recognition engines.',
    keywords: 'multilingual speech translation offline, local meeting translation, real time audio translation AI, translate meetings offline, multilingual notes AI',
    badge: '10+ Languages',
    summary: 'Break language barriers in international meetings. DomoNote transcribes incoming audio and translates dialogue into your preferred language using local AI models.',
    highlights: [
      { title: '10+ Languages Supported', desc: 'Translates between English, Spanish, Japanese, Chinese, French, German, Tagalog, and more.' },
      { title: 'Dual-Column View', desc: 'View original audio transcripts alongside real-time translated sentences.' },
      { title: 'Idiom & Nuance Preservation', desc: 'Local models like Qwen 2.5 and Llama 3 translate colloquial business expressions accurately.' },
      { title: 'Offline Dictionary & Terminology', desc: 'Maintain company-specific acronyms and technical glossary definitions.' }
    ],
    faqs: [
      { question: 'Does translation require an internet connection?', answer: 'No. Translation is performed by your local LLM model running in Ollama on your device.' },
      { question: 'Which languages offer the highest accuracy?', answer: 'English, Chinese, Japanese, Spanish, French, and German offer near-native transcription and translation accuracy.' }
    ],
    schemaType: 'SoftwareApplication'
  },
  {
    slug: 'zen-focus-markdown-editor',
    category: 'features',
    path: '/features/zen-focus-markdown-editor',
    name: 'Zen Focus Markdown Editor',
    title: 'Zen Focus Markdown Editor & Note Workspace | DomoNote',
    description: 'Distraction-free markdown writing environment with local autosave, version history snapshots, bidirectional linking, and AI drafting assistance.',
    keywords: 'zen focus markdown editor, distraction free writing app, offline markdown notes, private note taking app, local markdown editor with AI',
    badge: 'Distraction-Free',
    summary: 'Write with clarity in a minimalist zen workspace. DomoNote provides a clean typography environment with markdown hotkeys, instant previews, and seamless AI copilot drafting.',
    highlights: [
      { title: 'Distraction-Free Zen Mode', desc: 'Hide all chrome, sidebars, and notifications to focus purely on drafting.' },
      { title: 'Granular Version History', desc: 'Restore previous revisions with automatic timestamped snapshots saved in IndexedDB.' },
      { title: 'Keyboard-First Workflow', desc: 'Format headings, task lists, code blocks, and math formulas with intuitive shortcuts.' },
      { title: 'Instant Local AI Polishing', desc: 'Select text to fix grammar, adjust tone, expand arguments, or summarize sections.' }
    ],
    faqs: [
      { question: 'Can I export notes to standard Markdown files?', answer: 'Yes. You can export any note to standard .md files or generate clean PDF documents.' },
      { question: 'Does it support code syntax highlighting?', answer: 'Yes. Code blocks feature syntax highlighting across TypeScript, Python, Rust, SQL, and 30+ languages.' }
    ],
    schemaType: 'SoftwareApplication'
  },
  {
    slug: 'calendar-event-sync',
    category: 'features',
    path: '/features/calendar-event-sync',
    name: 'Calendar Sync & Meeting Detection',
    title: 'Smart Meeting Detection & Google Calendar Sync | DomoNote',
    description: 'Detect upcoming calls, schedule meetings, and generate standard ICS calendar invitations directly from meeting notes and action items.',
    keywords: 'smart meeting detection, google calendar sync offline, meeting scheduler AI, ICS calendar generator, calendar event extractor',
    badge: 'Calendar Intelligence',
    summary: 'Bridge meeting discussions with your calendar. DomoNote extracts proposed meeting times from conversations, alerts you before calls, and syncs directly with Google Calendar.',
    highlights: [
      { title: 'Conversational Event Detection', desc: 'Recognizes scheduling agreements like "Let us sync next Thursday at 3 PM".' },
      { title: 'One-Click ICS Generation', desc: 'Download standard .ics files compatible with Apple Calendar, Outlook, and Thunderbird.' },
      { title: 'OAuth Google Calendar Integration', desc: 'Safely sync events to your Google Calendar with client-side OAuth tokens.' },
      { title: 'Pre-Meeting Briefings', desc: 'Review past notes and action items associated with recurring meeting attendees.' }
    ],
    faqs: [
      { question: 'Is my Google Calendar data stored on DomoNote servers?', answer: 'DomoNote has no backend servers. Calendar tokens and events are handled entirely on your local machine.' },
      { question: 'Can I use it with Outlook and Apple Calendar?', answer: 'Yes. Download the generated .ics file to open and save the event in any standard calendar app.' }
    ],
    schemaType: 'SoftwareApplication'
  },
  {
    slug: 'local-llm-workspace',
    category: 'features',
    path: '/features/local-llm-workspace',
    name: 'Multi-Context Local LLM Workspace',
    title: 'Multi-Context Local AI Workspace & Chat | DomoNote',
    description: 'Chat with your notes, meetings, and documents simultaneously using local Ollama models. Select multiple active context items for holistic AI synthesis.',
    keywords: 'multi context AI workspace, local LLM chat, Ollama chat desktop, private AI workspace, multi document synthesis AI, chat with notes and meetings',
    badge: 'Multi-Context Chat',
    summary: 'Collaborate with an AI that knows your entire project context. Select notes, transcripts, and PDF files to chat with multiple sources simultaneously.',
    highlights: [
      { title: 'Multi-Resource Context Picker', desc: 'Select several notes, recorded meetings, and PDF files into the active LLM context.' },
      { title: 'Dynamic Model Switching', desc: 'Switch between fast 3B models for quick answers and deep 8B/14B models for complex reasoning.' },
      { title: 'Chat History Persistence', desc: 'All conversations are saved locally in IndexedDB with full search capability.' },
      { title: 'Privacy Without Compromise', desc: 'Query sensitive business financials, trade secrets, and personal journals in complete confidence.' }
    ],
    faqs: [
      { question: 'How many items can I attach to a single chat?', answer: 'You can attach multiple notes, documents, and transcripts within your local model’s context window limit.' },
      { question: 'Which local LLMs are recommended for multi-context chat?', answer: 'Qwen 2.5 3B/7B and Llama 3.2 3B offer excellent context handling and coherent cross-document synthesis.' }
    ],
    schemaType: 'SoftwareApplication'
  },
  {
    slug: 'zero-cloud-privacy-guarantee',
    category: 'features',
    path: '/features/zero-cloud-privacy-guarantee',
    name: 'Zero-Cloud Privacy Guarantee',
    title: '100% Offline Privacy Guarantee — Zero Cloud Leaks | DomoNote',
    description: 'Learn how DomoNote safeguards your privacy: zero cloud storage, zero tracking pixels, no telemetry, and air-gapped local AI computation.',
    keywords: 'zero cloud privacy guarantee, offline AI privacy, air gapped meeting recorder, private AI software, GDPR compliant AI, HIPAA local AI notes',
    badge: '100% Sovereign Data',
    summary: 'Your privacy is mathematically guaranteed by running exclusively on your device hardware. DomoNote has no cloud database, no tracking telemetry, and no hidden AI training pipelines.',
    highlights: [
      { title: '100% Air-Gapped Capable', desc: 'Disconnect your Wi-Fi and DomoNote continues transcribing, summarizing, and editing without hiccup.' },
      { title: 'Client-Side IndexedDB Storage', desc: 'All notes, audio blobs, and transcripts reside exclusively in your local browser sandbox.' },
      { title: 'Open-Source Verification', desc: 'Inspect every line of code on GitHub to verify our absolute zero-telemetry architecture.' },
      { title: 'Legal & Medical Compliance', desc: 'Ideal for attorneys, doctors, and financial executives who cannot expose confidential data to cloud AI.' }
    ],
    faqs: [
      { question: 'Does DomoNote use analytics like Google Analytics or Mixpanel?', answer: 'No. DomoNote contains zero third-party tracking scripts, cookies, or telemetry analytics.' },
      { question: 'Does Ollama send my prompts back to Meta or Alibaba?', answer: 'No. Ollama executes model weights completely locally on your CPU/GPU with no external network calls.' }
    ],
    schemaType: 'SoftwareApplication'
  },

  // =========================================================================
  // 2. SUPPORTED LOCAL AI MODELS (/models/*)
  // =========================================================================
  {
    slug: 'qwen2.5-3b',
    category: 'models',
    path: '/models/qwen2.5-3b',
    name: 'Qwen 2.5 3B (Default Model)',
    title: 'Qwen 2.5 3B for Meeting Notes & Transcription AI | DomoNote',
    description: 'Discover how DomoNote uses Qwen 2.5 3B as its default ultra-fast local secretary model. High instruction-following speed on laptops with 4 GB RAM.',
    keywords: 'qwen 2.5 3b meeting notes, qwen 2.5 ollama, fast local llm for transcription, lightweight AI model, best 3b model for notes',
    badge: 'Default Model',
    summary: 'Qwen 2.5 3B is DomoNote’s default on-device powerhouse. It delivers exceptional multilingual comprehension, razor-sharp action item extraction, and lightning inference speeds on standard laptops.',
    highlights: [
      { title: 'Ultra-Fast Inference', desc: 'Generates 40+ tokens per second on modern Apple Silicon and Intel/AMD laptop CPUs.' },
      { title: 'Low Memory Footprint', desc: 'Requires only ~2.2 GB of disk space and under 4 GB of RAM to run smoothly.' },
      { title: 'Superb Multilingual Logic', desc: 'Fluent in English, Chinese, Japanese, Spanish, German, and French business dialogue.' },
      { title: 'Pre-configured Setup Flow', desc: 'DomoNote downloads and configures Qwen 2.5 3B automatically with one click on first launch.' }
    ],
    faqs: [
      { question: 'Why did DomoNote choose Qwen 2.5 3B as default?', answer: 'It represents the best balance of speed, low hardware requirements, and high-quality structured output for meeting notes.' },
      { question: 'How do I download Qwen 2.5 3B manually?', answer: 'Run `ollama pull qwen2.5:3b` in your terminal, and DomoNote will detect it instantly.' }
    ],
    schemaType: 'SoftwareApplication'
  },
  {
    slug: 'llama-3.2-3b',
    category: 'models',
    path: '/models/llama-3.2-3b',
    name: 'Meta Llama 3.2 3B',
    title: 'Meta Llama 3.2 3B for Local Meeting Summaries | DomoNote',
    description: 'Use Meta Llama 3.2 3B inside DomoNote for fast on-device summarization, note organization, and document parsing with Ollama.',
    keywords: 'llama 3.2 3b meeting notes, meta llama 3.2 ollama, edge ai llama 3.2, private llama 3 notes, lightweight local llm',
    badge: 'Meta Edge AI',
    summary: 'Meta Llama 3.2 3B is engineered specifically for edge and on-device computation. Inside DomoNote, it delivers crisp executive briefings and sharp structured lists.',
    highlights: [
      { title: 'Engineered for On-Device', desc: 'Tuned specifically for fast reasoning and structured outputs on consumer hardware.' },
      { title: 'High Context Retention', desc: 'Handles extended 60-minute meeting transcripts with coherent continuity.' },
      { title: 'Open Model Weights', desc: 'Freely available via Ollama under Meta’s open community license.' }
    ],
    faqs: [
      { question: 'How do I switch to Llama 3.2 in DomoNote?', answer: 'Open Settings → AI Engine → select llama3.2:3b from the Model Catalog.' }
    ],
    schemaType: 'SoftwareApplication'
  },
  {
    slug: 'llama-3.1-8b',
    category: 'models',
    path: '/models/llama-3.1-8b',
    name: 'Meta Llama 3.1 8B',
    title: 'Meta Llama 3.1 8B for In-Depth Executive Minutes | DomoNote',
    description: 'Power your personal AI secretary with Meta Llama 3.1 8B for deep analytical synthesis, complex contract reviews, and nuance-heavy meeting minutes.',
    keywords: 'llama 3.1 8b meeting secretary, meta llama 3.1 ollama, deep reasoning local llm, best 8b model for document synthesis',
    badge: 'High Reasoning',
    summary: 'When you need deep analytical rigor, Meta Llama 3.1 8B excels at capturing subtle technical decisions, nuances in stakeholder negotiations, and complex multi-page PDF documents.',
    highlights: [
      { title: '128K Context Window', desc: 'Ingest massive quarterly transcripts and complete books in a single prompt.' },
      { title: 'Sophisticated Synthesis', desc: 'Writes executive memos that read like a seasoned Chief of Staff drafted them.' },
      { title: 'Ideal for 16 GB+ Systems', desc: 'Runs smoothly on M-series Macs and PCs equipped with discrete graphics cards.' }
    ],
    faqs: [
      { question: 'How much RAM is needed for Llama 3.1 8B?', answer: 'We recommend at least 16 GB of unified memory or 8 GB of dedicated VRAM.' }
    ],
    schemaType: 'SoftwareApplication'
  },
  {
    slug: 'gemma-2-9b',
    category: 'models',
    path: '/models/gemma-2-9b',
    name: 'Google Gemma 2 9B',
    title: 'Google Gemma 2 9B for Advanced Document Synthesis | DomoNote',
    description: 'Harness Google’s flagship lightweight model Gemma 2 9B inside DomoNote for academic paper summaries, technical specs, and meeting intelligence.',
    keywords: 'google gemma 2 9b ollama, gemma 2 document summarizer, local gemma AI notes, google open model desktop',
    badge: 'Google Open Model',
    summary: 'Google Gemma 2 9B offers state-of-the-art benchmark performance among sub-10B parameter models. It excels at factual accuracy, scientific reasoning, and structured Markdown output.',
    highlights: [
      { title: 'Factual Grounding', desc: 'Significantly reduces hallucinations when querying technical PDF documentation.' },
      { title: 'Polished Prose Style', desc: 'Produces eloquent, boardroom-ready meeting minutes and reports.' }
    ],
    faqs: [
      { question: 'How do I run Gemma 2 9B with Ollama?', answer: 'Run `ollama run gemma2:9b` in your terminal and select it in DomoNote Settings.' }
    ],
    schemaType: 'SoftwareApplication'
  },
  {
    slug: 'codegemma-7b',
    category: 'models',
    path: '/models/codegemma-7b',
    name: 'Google CodeGemma 7B',
    title: 'Google CodeGemma 7B for Technical Architecture & Code Notes | DomoNote',
    description: 'Synthesize engineering standups, API design reviews, and technical RFC documents with Google CodeGemma 7B running locally in DomoNote.',
    keywords: 'codegemma 7b ollama, technical meeting notes AI, code notes summarizer, developer meeting assistant, engineering standup AI',
    badge: 'Developer Focus',
    summary: 'CodeGemma 7B is optimized for code understanding and technical documentation. Ideal for engineering managers, software architects, and DevOps leads.',
    highlights: [
      { title: 'Technical Terminology Mastery', desc: 'Understands Kubernetes, microservices, database schemas, and git workflows.' },
      { title: 'Code Snippet Extraction', desc: 'Preserves exact code syntax, function signatures, and diffs discussed during meetings.' }
    ],
    faqs: [
      { question: 'Is CodeGemma good for non-technical meetings?', answer: 'It works well, but general models like Qwen 2.5 or Llama 3.2 are preferred for general business discussions.' }
    ],
    schemaType: 'SoftwareApplication'
  },
  {
    slug: 'mistral-7b',
    category: 'models',
    path: '/models/mistral-7b',
    name: 'Mistral 7B Instruct',
    title: 'Mistral 7B Instruct for Structured Minutes & Action Items | DomoNote',
    description: 'Use Mistral 7B Instruct with DomoNote for concise bullet points, crisp meeting agendas, and high-efficiency task extraction.',
    keywords: 'mistral 7b ollama, mistral instruct meeting notes, fast 7b local llm, private mistral AI',
    badge: 'European Open Model',
    summary: 'Mistral 7B remains a classic favorite for instruction following and direct, no-nonsense synthesis. Fast, reliable, and highly capable on edge hardware.',
    highlights: [
      { title: 'Direct Bullet Summaries', desc: 'Cuts through conversational filler to extract only pertinent action points.' },
      { title: 'Broad Language Support', desc: 'Exceptional fluency across English, French, German, and Spanish.' }
    ],
    faqs: [
      { question: 'How does Mistral 7B compare to Qwen 2.5?', answer: 'Qwen 2.5 3B is faster on low-end hardware, while Mistral 7B provides deeper prose richness on 16 GB systems.' }
    ],
    schemaType: 'SoftwareApplication'
  },
  {
    slug: 'deepseek-r1-7b',
    category: 'models',
    path: '/models/deepseek-r1-7b',
    name: 'DeepSeek R1 7B',
    title: 'DeepSeek R1 7B for Deep Logical Reasoning & Synthesis | DomoNote',
    description: 'Bring reasoning model power to your personal notes. DeepSeek R1 7B utilizes chain-of-thought verification to analyze complex business decisions.',
    keywords: 'deepseek r1 7b ollama, reasoning model meeting notes, chain of thought local AI, deepseek notes desktop, deepseek r1 private',
    badge: 'Reasoning Engine',
    summary: 'DeepSeek R1 7B applies reinforcement learning and chain-of-thought reasoning to your meeting notes. It cross-examines conflicting statements and checks logical coherence.',
    highlights: [
      { title: 'Chain-of-Thought Verification', desc: 'Thinks step-by-step to detect unresolved contradictions in business discussions.' },
      { title: 'Complex Decision Analysis', desc: 'Maps out trade-offs, risks, and alternatives discussed during strategic workshops.' }
    ],
    faqs: [
      { question: 'Can DeepSeek R1 run fully offline?', answer: 'Yes. DeepSeek R1 7B runs 100% locally via Ollama without touching any external servers.' }
    ],
    schemaType: 'SoftwareApplication'
  },
  {
    slug: 'phi-3-mini',
    category: 'models',
    path: '/models/phi-3-mini',
    name: 'Microsoft Phi-3 Mini',
    title: 'Microsoft Phi-3 Mini for Low-Power On-Device AI | DomoNote',
    description: 'Microsoft Phi-3 Mini delivers surprising cognitive power with minimal battery drain. Perfect for laptops, ultrabooks, and on-the-go offline work.',
    keywords: 'phi 3 mini ollama, microsoft phi 3 local AI, low power local llm, ultrabook meeting AI, battery efficient local AI',
    badge: 'Ultra-Efficient',
    summary: 'Microsoft Phi-3 Mini punches well above its weight class. Trained on textbook-quality datasets, it generates clean, well-structured notes with negligible CPU load.',
    highlights: [
      { title: 'Minimal Battery Impact', desc: 'Work unplugged on airplanes and coffee shops without draining your laptop battery.' },
      { title: 'Small 3.8B Parameter Size', desc: 'Fits easily on systems with 8 GB of RAM.' }
    ],
    faqs: [
      { question: 'Is Phi-3 Mini fast on Intel Core i5?', answer: 'Yes, its lightweight architecture enables smooth 25+ tokens/second generation even on older processors.' }
    ],
    schemaType: 'SoftwareApplication'
  },
  {
    slug: 'faster-whisper',
    category: 'models',
    path: '/models/faster-whisper',
    name: 'Faster-Whisper Speech Engine',
    title: 'Faster-Whisper Local Speech Recognition Engine | DomoNote',
    description: 'Accelerated CTranslate2 implementation of OpenAI Whisper. Achieve human-level offline transcription accuracy on your desktop with DomoNote.',
    keywords: 'faster whisper local, ctranslate2 whisper offline, whisper desktop speech to text, private speech recognition engine, local whisper transcriber',
    badge: 'Speech-to-Text',
    summary: 'Faster-Whisper delivers up to 4x faster transcription than standard Whisper while maintaining state-of-the-art accuracy across accents, background noise, and technical jargon.',
    highlights: [
      { title: 'CTranslate2 Acceleration', desc: 'Highly optimized int8 quantization runs efficiently on consumer CPUs and Apple Silicon Neural Engine.' },
      { title: '99+ Language Acoustic Models', desc: 'Pre-trained on 680,000 hours of diverse audio for unmatched phonetic fidelity.' },
      { title: 'Punctuation & Capitalization', desc: 'Produces naturally formatted prose with commas, periods, question marks, and paragraphs.' }
    ],
    faqs: [
      { question: 'How is Faster-Whisper integrated into DomoNote?', answer: 'It is supported natively through our optional Local Companion service and Web Speech in the browser.' }
    ],
    schemaType: 'SoftwareApplication'
  },

  // =========================================================================
  // 3. COMPETITOR COMPARISONS (/compare/*)
  // =========================================================================
  {
    slug: 'domonote-vs-otter-ai',
    category: 'compare',
    path: '/compare/domonote-vs-otter-ai',
    name: 'DomoNote vs Otter.ai',
    title: 'DomoNote vs Otter.ai — Free Local Privacy vs Cloud Subscriptions',
    description: 'Compare DomoNote and Otter.ai. Discover why privacy-conscious professionals are switching from cloud meeting bots to 100% offline, on-device AI.',
    keywords: 'domonote vs otter ai, otter ai alternative, private otter ai alternative, offline meeting recorder vs otter, free meeting transcriber',
    badge: 'Comparison',
    summary: 'Otter.ai uploads your confidential conversations to remote cloud servers and charges recurring monthly subscriptions. DomoNote runs 100% on your device with zero cloud leaks, zero subscriptions, and complete ownership of your data.',
    highlights: [
      { title: '100% Local vs Cloud Servers', desc: 'DomoNote processes all voice data on your local hardware. Otter.ai uploads audio to cloud datacenters.' },
      { title: '$0 Free vs $20+/mo Subscription', desc: 'DomoNote is open-source and free forever. Otter.ai imposes strict monthly transcription limits.' },
      { title: 'No Invasive Meeting Bot', desc: 'DomoNote captures audio silently via extension or desktop loopback. No visible bot joins your client calls.' },
      { title: 'Multi-Model Freedom', desc: 'Choose your own local LLM (Qwen, Llama, Mistral) rather than being locked into proprietary black-box models.' }
    ],
    faqs: [
      { question: 'Can DomoNote transcribe as accurately as Otter.ai?', answer: 'Yes. With modern local models like Faster-Whisper and Qwen 2.5, transcription accuracy matches or exceeds cloud services.' },
      { question: 'Is DomoNote truly free?', answer: 'Yes, DomoNote is open source under the MIT license with zero paid tiers or paywalls.' }
    ],
    schemaType: 'Article'
  },
  {
    slug: 'domonote-vs-fireflies-ai',
    category: 'compare',
    path: '/compare/domonote-vs-fireflies-ai',
    name: 'DomoNote vs Fireflies.ai',
    title: 'DomoNote vs Fireflies.ai — Private Local Notes vs Cloud Meeting Bots',
    description: 'Comparing DomoNote and Fireflies.ai. Learn why enterprises, lawyers, and executives choose local meeting transcription over cloud bot recorders.',
    keywords: 'domonote vs fireflies ai, fireflies ai alternative, private meeting recorder, no bot meeting assistant, local fireflies replacement',
    badge: 'Comparison',
    summary: 'Fireflies.ai sends an AI bot into your calls and stores proprietary discussions in cloud databases. DomoNote operates invisibly on your local device without triggering privacy concerns or security audits.',
    highlights: [
      { title: 'Zero Third-Party Bot Alerts', desc: 'Never ask a client for permission to let a third-party recording bot enter the conference room.' },
      { title: 'Air-Gapped Confidentiality', desc: 'Completely compliant with strict NDAs, attorney-client privilege, and corporate intellectual property policies.' },
      { title: 'Unlimited Meeting Hours', desc: 'Transcribe 10 hours a day without hitting credit limits or billing thresholds.' }
    ],
    faqs: [
      { question: 'Why do clients object to meeting bots?', answer: 'Meeting bots often raise compliance, data residency, and GDPR concerns because audio is stored and analyzed on external servers.' }
    ],
    schemaType: 'Article'
  },
  {
    slug: 'domonote-vs-notion-ai',
    category: 'compare',
    path: '/compare/domonote-vs-notion-ai',
    name: 'DomoNote vs Notion AI',
    title: 'DomoNote vs Notion AI — Local AI Secretary vs Cloud SaaS Workspace',
    description: 'Compare DomoNote and Notion AI. See why local offline AI, native audio capture, and zero subscription fees beat cloud-tethered note tools.',
    keywords: 'domonote vs notion ai, notion ai alternative, offline notion alternative, private note taking ai, local ai notes workspace',
    badge: 'Comparison',
    summary: 'Notion AI charges $10/user/month and requires an active internet connection to contact OpenAI servers. DomoNote gives you native audio recording, document intelligence, and local LLMs that work completely offline.',
    highlights: [
      { title: 'Offline First', desc: 'Write, search, and run AI summaries in airplane mode with zero internet connectivity.' },
      { title: 'Native Audio Intelligence', desc: 'Includes real-time meeting transcription and speaker diarization, which Notion lacks.' },
      { title: 'Zero Monthly Fee', desc: 'Keep your monthly SaaS budget at zero while maintaining complete control over your notes.' }
    ],
    faqs: [
      { question: 'Can I export my DomoNote notes into Notion?', answer: 'Yes. All DomoNote documents export directly to standard Markdown, easily imported into any workspace.' }
    ],
    schemaType: 'Article'
  },
  {
    slug: 'domonote-vs-granola',
    category: 'compare',
    path: '/compare/domonote-vs-granola',
    name: 'DomoNote vs Granola',
    title: 'DomoNote vs Granola — Open Source Multi-OS vs Closed macOS App',
    description: 'Comparison between DomoNote and Granola. Open-source, multi-platform (Windows, Mac, Linux), and self-hosted local AI vs proprietary closed software.',
    keywords: 'domonote vs granola, granola ai alternative, granola for windows, granola for linux, open source granola alternative',
    badge: 'Comparison',
    summary: 'Granola is restricted to macOS and relies on cloud AI processing. DomoNote is open source, supports Windows, macOS, Linux, and Web, and runs 100% on your device hardware.',
    highlights: [
      { title: 'Cross-Platform Freedom', desc: 'Native installers for Windows (.NET 9 WebView2), macOS (Swift DMG), Linux (AppImage), and Chrome.' },
      { title: 'Open-Source Codebase', desc: 'Full transparency: verify how audio is handled, contribute features, and self-host freely.' },
      { title: 'True Local Inference', desc: 'Uses your local GPU/CPU with Ollama instead of streaming sensitive audio transcripts to third-party clouds.' }
    ],
    faqs: [
      { question: 'Is Granola available on Windows?', answer: 'Granola is primarily macOS focused, whereas DomoNote has first-class native Windows and Linux support.' }
    ],
    schemaType: 'Article'
  },
  {
    slug: 'domonote-vs-fathom',
    category: 'compare',
    path: '/compare/domonote-vs-fathom',
    name: 'DomoNote vs Fathom',
    title: 'DomoNote vs Fathom — Private Local Processing vs Cloud Zoom Integrations',
    description: 'Compare DomoNote and Fathom. Eliminate cloud storage vulnerabilities with DomoNote’s client-side meeting minutes and on-device speech processing.',
    keywords: 'domonote vs fathom, fathom video alternative, private zoom notes ai, local meeting intelligence vs fathom',
    badge: 'Comparison',
    summary: 'Fathom records video and audio to its cloud platform. DomoNote focuses on privacy-first audio and document intelligence that lives entirely on your personal machine.',
    highlights: [
      { title: 'No Video Cloud Ingestion', desc: 'Conserves bandwidth and eliminates storage of video files on remote third-party clouds.' },
      { title: 'Universal Conference Support', desc: 'Not tied to specific Zoom APIs — works with any browser or desktop call.' }
    ],
    faqs: [
      { question: 'Does DomoNote require Zoom admin approval?', answer: 'No. DomoNote captures audio locally without requiring tenant or admin OAuth authorization.' }
    ],
    schemaType: 'Article'
  },
  {
    slug: 'domonote-vs-scribe-how',
    category: 'compare',
    path: '/compare/domonote-vs-scribe-how',
    name: 'DomoNote vs Scribe',
    title: 'DomoNote vs Scribe — Free Local Screen SOP Manuals vs Cloud Screenshots',
    description: 'Compare DomoNote and Scribe (ScribeHow). Create step-by-step SOP guides and training manuals locally without cloud uploads or monthly fees.',
    keywords: 'domonote vs scribe, scribe alternative free, local sop generator, scribehow alternative offline, create training manuals locally',
    badge: 'Comparison',
    summary: 'Scribe charges up to $29/user/month to create cloud SOP guides. DomoNote records your screen operations locally, generates step-by-step manuals, and exports to PDF with zero cloud tracking.',
    highlights: [
      { title: 'Free Unlimited SOP Guides', desc: 'Create hundreds of process manuals without paying per-seat subscriptions.' },
      { title: 'Built-in Audio & Document Hub', desc: 'Combine screen procedures with meeting recordings and PDF documentation in one unified app.' }
    ],
    faqs: [
      { question: 'Can I blur private data in DomoNote SOPs?', answer: 'Yes, the integrated annotation canvas allows blurring passwords, tokens, and personal info before export.' }
    ],
    schemaType: 'Article'
  },
  {
    slug: 'domonote-vs-supernormal',
    category: 'compare',
    path: '/compare/domonote-vs-supernormal',
    name: 'DomoNote vs Supernormal',
    title: 'DomoNote vs Supernormal — Zero-Knowledge Meeting Intelligence',
    description: 'Compare DomoNote and Supernormal. Learn how DomoNote delivers executive meeting notes with zero knowledge architecture and complete hardware privacy.',
    keywords: 'domonote vs supernormal, supernormal alternative, private meeting ai, local meeting notes generator',
    badge: 'Comparison',
    summary: 'Supernormal relies on cloud AI servers to format notes. DomoNote keeps your entire meeting history in local IndexedDB with self-hosted Ollama models.',
    highlights: [
      { title: 'Zero Cloud Footprint', desc: 'No risk of company trade secrets leaking through cloud AI server breaches.' },
      { title: 'Unlimited Team Sharing via Markdown', desc: 'Distribute clean markdown or PDF files without forcing teammates to create paid accounts.' }
    ],
    faqs: [
      { question: 'Can I use DomoNote without registering an account?', answer: 'Yes. DomoNote requires no account, email, or sign-up whatsoever.' }
    ],
    schemaType: 'Article'
  },

  // =========================================================================
  // 4. TEMPLATES & WORKFLOWS (/templates/*)
  // =========================================================================
  {
    slug: 'executive-meeting-minutes',
    category: 'templates',
    path: '/templates/executive-meeting-minutes',
    name: 'Executive Meeting Minutes Template',
    title: 'Executive Meeting Minutes & Board Summary Template | DomoNote',
    description: 'Free executive meeting minutes template for DomoNote. Capture attendees, strategic decisions, financial votes, and key deliverables with AI.',
    keywords: 'executive meeting minutes template, board meeting template AI, minutes of meeting format, corporate meeting notes template, free MoM template',
    badge: 'Executive',
    summary: 'Designed for board meetings, executive leadership team syncs, and steering committees. Captures high-level strategic alignment and formally voted resolutions.',
    highlights: [
      { title: 'Structured Agenda Tracking', desc: 'Sections for Call to Order, Roll Call, Officer Reports, New Business, and Adjournment.' },
      { title: 'Vote & Resolution Ledger', desc: 'Clearly demarcate motions made, seconders, votes passed, and dissent recorded.' },
      { title: 'One-Click Executive Synthesis', desc: 'Local AI formats verbatim discussion into polished corporate governance language.' }
    ],
    faqs: [
      { question: 'How do I load this template in DomoNote?', answer: 'In the Notes or Meeting view, click Template Gallery and select Executive Meeting Minutes.' }
    ],
    schemaType: 'HowTo'
  },
  {
    slug: 'sprint-planning-retro',
    category: 'templates',
    path: '/templates/sprint-planning-retro',
    name: 'Sprint Planning & Retrospective Template',
    title: 'Agile Sprint Planning & Retrospective Template | DomoNote',
    description: 'Streamline Agile ceremonies with DomoNote. Capture sprint goals, velocity estimates, what went well, what can improve, and action commitments.',
    keywords: 'sprint planning template, sprint retro template ai, agile meeting notes template, scrum meeting minutes, engineering retro format',
    badge: 'Agile / Scrum',
    summary: 'Perfect for Scrum Masters, Product Owners, and engineering teams. Keep sprint ceremonies focused, efficient, and tightly documented.',
    highlights: [
      { title: 'Sprint Goal Alignment', desc: 'High-visibility section for committed story points and primary milestone objectives.' },
      { title: 'Start / Stop / Continue Framework', desc: 'Facilitates blameless post-mortems and constructive team feedback.' },
      { title: 'Immediate Ticket Sync', desc: 'Export task checklists directly into Jira or GitHub Issues.' }
    ],
    faqs: [
      { question: 'Does DomoNote integrate with Jira?', answer: 'Export your action items as Markdown checklists, which paste natively into Jira, Linear, and GitHub.' }
    ],
    schemaType: 'HowTo'
  },
  {
    slug: 'client-discovery-call',
    category: 'templates',
    path: '/templates/client-discovery-call',
    name: 'Client Discovery Call Template',
    title: 'Sales & Client Discovery Call Briefing Template | DomoNote',
    description: 'Capture prospect pain points, budget, authority, timeline, and next steps with DomoNote’s automated client discovery notes template.',
    keywords: 'client discovery call template, b2b sales call notes ai, bant discovery framework, customer interview template, sales meeting minutes',
    badge: 'Sales & B2B',
    summary: 'Designed for account executives, consultants, and agencies. Focus on building rapport while DomoNote records and maps prospect requirements.',
    highlights: [
      { title: 'BANT & MEDDPICC Alignment', desc: 'Organizes notes into Budget, Authority, Need, and Timeline automatically.' },
      { title: 'Verbatim Customer Quotes', desc: 'Highlights emotional pain points and budget objections directly from audio.' }
    ],
    faqs: [
      { question: 'Can I paste discovery notes into Salesforce or HubSpot?', answer: 'Yes. Copy the synthesized markdown or plain text straight into your CRM record.' }
    ],
    schemaType: 'HowTo'
  },
  {
    slug: 'one-on-one-manager-meeting',
    category: 'templates',
    path: '/templates/one-on-one-manager-meeting',
    name: '1-on-1 Manager & Direct Report Template',
    title: '1-on-1 Manager & Direct Report Sync Template | DomoNote',
    description: 'Foster career growth, track ongoing roadblocks, and maintain psychological safety with DomoNote’s private 1-on-1 meeting template.',
    keywords: '1 on 1 meeting template, manager direct report sync, 1:1 meeting notes ai, performance check-in template, private manager notes',
    badge: 'Management',
    summary: 'Keep track of employee progression, feedback, and blockers without cloud surveillance. Notes stay encrypted and private on your laptop.',
    highlights: [
      { title: 'Career Growth Checkpoints', desc: 'Dedicated space to discuss long-term aspirations, skillset expansion, and quarterly goals.' },
      { title: 'Mutual Accountability', desc: 'Track agreements and commitments made between both manager and report across sessions.' }
    ],
    faqs: [
      { question: 'Can my company HR or IT read these 1-on-1 notes?', answer: 'No. DomoNote stores all files locally in your computer’s storage, completely segregated from corporate cloud drives.' }
    ],
    schemaType: 'HowTo'
  },
  {
    slug: 'all-hands-company-brief',
    category: 'templates',
    path: '/templates/all-hands-company-brief',
    name: 'Company All-Hands Briefing Template',
    title: 'Company All-Hands & Town Hall Notes Template | DomoNote',
    description: 'Summarize quarterly town halls, executive vision updates, and AMA Q&A sessions into concise company-wide briefings with DomoNote.',
    keywords: 'company all hands template, town hall meeting summary, executive briefing notes, quarterly update template',
    badge: 'Company Culture',
    summary: 'Distill 90-minute company all-hands meetings into a two-page executive bulletin for employees who missed the live call.',
    highlights: [
      { title: 'Vision & Financial Highlights', desc: 'Summarizes key performance metrics, revenue milestones, and product roadmap teasers.' },
      { title: 'AMA / Q&A Digest', desc: 'Groups anonymous employee questions and executive answers by category.' }
    ],
    faqs: [
      { question: 'Can I export the brief to PDF for company distribution?', answer: 'Yes. One click generates a clean, branded PDF summary.' }
    ],
    schemaType: 'HowTo'
  },
  {
    slug: 'brainstorming-ideation-session',
    category: 'templates',
    path: '/templates/brainstorming-ideation-session',
    name: 'Brainstorming & Ideation Template',
    title: 'Creative Brainstorming & Whiteboard Synthesis Template | DomoNote',
    description: 'Transform free-flowing creative workshops and whiteboard sessions into structured action vectors, feasibility matrices, and innovation themes.',
    keywords: 'brainstorming template, ideation workshop notes ai, design sprint notes template, creative session summary',
    badge: 'Product & Design',
    summary: 'Capture spontaneous ideas without breaking the creative momentum. DomoNote turns tangential thoughts into prioritized project pitches.',
    highlights: [
      { title: 'Idea Clustering', desc: 'AI clusters similar suggestions into thematic pillars.' },
      { title: 'Effort vs Impact Matrix', desc: 'Ranks brainstormed concepts by feasibility and potential return.' }
    ],
    faqs: [
      { question: 'Does it capture ideas from multiple speakers?', answer: 'Yes, speaker diarization distinguishes who originated each concept.' }
    ],
    schemaType: 'HowTo'
  },
  {
    slug: 'software-qa-sop-manual',
    category: 'templates',
    path: '/templates/software-qa-sop-manual',
    name: 'Software QA & Bug Reproduction SOP',
    title: 'Software QA & Bug Reproduction SOP Manual Template | DomoNote',
    description: 'Standardize bug reproduction and QA test runs. Screen recordings auto-generate numbered steps, screenshots, expected vs actual behavior, and environment data.',
    keywords: 'software QA SOP template, bug reproduction steps template, QA manual builder, screen capture bug report, test case template',
    badge: 'Engineering QA',
    summary: 'Eliminate "cannot reproduce" bugs forever. Record your screen while reproducing a glitch to auto-generate a comprehensive technical report.',
    highlights: [
      { title: 'Chronological Step Log', desc: 'Records every click and page interaction with visual callouts.' },
      { title: 'System Environment Metadata', desc: 'Includes browser version, screen resolution, OS, and timestamp automatically.' }
    ],
    faqs: [
      { question: 'Can I share the generated QA SOP with developers?', answer: 'Yes. Export to Markdown or PDF and attach directly to GitHub Issues or Jira tickets.' }
    ],
    schemaType: 'HowTo'
  },
  {
    slug: 'employee-onboarding-workflow',
    category: 'templates',
    path: '/templates/employee-onboarding-workflow',
    name: 'New Employee Onboarding SOP',
    title: 'New Employee Onboarding & Systems SOP Template | DomoNote',
    description: 'Build step-by-step IT setup and systems onboarding guides for new team members using DomoNote’s screen operation capture.',
    keywords: 'employee onboarding SOP template, IT setup guide template, new hire systems manual, workplace onboarding playbook',
    badge: 'People Ops',
    summary: 'Create crystal-clear tutorials showing new hires how to set up VPNs, configure development environments, and request permissions.',
    highlights: [
      { title: 'Visual Click-by-Click Guides', desc: 'No more confusing written instructions — visual screenshots show exactly where to click.' },
      { title: 'Credential Redaction', desc: 'Easily blur proprietary keys or passwords before publishing guides.' }
    ],
    faqs: [
      { question: 'How long does it take to create an onboarding SOP?', answer: 'Simply perform the task once on your screen; DomoNote generates the manual in under 60 seconds.' }
    ],
    schemaType: 'HowTo'
  },
  {
    slug: 'customer-support-playbook',
    category: 'templates',
    path: '/templates/customer-support-playbook',
    name: 'Customer Support Escalation Playbook',
    title: 'Customer Support Escalation & Helpdesk SOP Template | DomoNote',
    description: 'Document standard operating procedures for resolving common customer tickets, processing refunds, and handling technical escalations.',
    keywords: 'customer support SOP template, helpdesk playbook, support escalation manual, customer service procedures',
    badge: 'Customer Success',
    summary: 'Help support agents resolve tickets with speed and consistency. Standardize common resolution pathways across your support tier team.',
    highlights: [
      { title: 'Standardized Response Protocols', desc: 'Preserves approved macro responses and policy guidelines.' },
      { title: 'Tier 1 to Tier 3 Escalation Matrix', desc: 'Specifies exactly when and how to loop in engineering or leadership.' }
    ],
    faqs: [
      { question: 'Can support teams use this locally?', answer: 'Yes, agents can keep the playbook running locally on their workstations for instant reference.' }
    ],
    schemaType: 'HowTo'
  },
  {
    slug: 'research-paper-literature-review',
    category: 'templates',
    path: '/templates/research-paper-literature-review',
    name: 'Academic Research & Literature Review',
    title: 'Academic Research & Literature Review Note Template | DomoNote',
    description: 'Synthesize academic papers, citations, hypotheses, methodologies, and findings with DomoNote’s document intelligence template.',
    keywords: 'academic literature review template, research paper summary template, thesis notes template, scholar paper analysis ai',
    badge: 'Academic',
    summary: 'Essential for PhD candidates, researchers, and students. Ingest PDF papers and extract core contributions, limitations, and future work.',
    highlights: [
      { title: 'Methodology & Findings Breakdown', desc: 'Extracts experimental datasets, sample sizes, and quantitative findings.' },
      { title: 'Citation & Reference Ledger', desc: 'Organizes bibliographic references for smooth copy-pasting into BibTeX.' }
    ],
    faqs: [
      { question: 'Can I compare two research papers side-by-side?', answer: 'Yes. Attach both papers to the Multi-Context AI Workspace to contrast methodologies.' }
    ],
    schemaType: 'HowTo'
  },
  {
    slug: 'legal-contract-analysis',
    category: 'templates',
    path: '/templates/legal-contract-analysis',
    name: 'Legal Contract Review & Clause Analysis',
    title: 'Legal Contract Review & Clause Analysis Template | DomoNote',
    description: 'Analyze NDAs, vendor agreements, and employment contracts locally with DomoNote. Zero confidential contract text leaves your machine.',
    keywords: 'legal contract analysis template, NDA review ai, contract summary template, legal clause analysis local ai, private legal document review',
    badge: 'Legal',
    summary: 'Tailored for legal counsel, paralegals, and contract administrators. Scans agreements for indemnity clauses, liability caps, and termination notice periods.',
    highlights: [
      { title: 'Risk & Exposure Summary', desc: 'Flags uncapped indemnification, non-standard warranties, and restrictive covenants.' },
      { title: 'Privilege Protection', desc: '100% on-device execution maintains attorney-client privilege without third-party exposure.' }
    ],
    faqs: [
      { question: 'Is DomoNote safe for privileged attorney-client work?', answer: 'Yes. Because no data is transmitted to cloud servers, it meets the highest evidentiary confidentiality standards.' }
    ],
    schemaType: 'HowTo'
  },
  {
    slug: 'product-requirements-document',
    category: 'templates',
    path: '/templates/product-requirements-document',
    name: 'Product Requirements Document (PRD)',
    title: 'Product Requirements Document (PRD) Note Template | DomoNote',
    description: 'Synthesize user interviews, stakeholder meetings, and technical constraints into comprehensive PRD specifications ready for engineering sprint kickoff.',
    keywords: 'PRD template, product requirements document template, product manager notes ai, user story template, technical spec format',
    badge: 'Product Management',
    summary: 'Turn messy product kickoff calls into rock-solid PRDs with user stories, acceptance criteria, wireframe links, and out-of-scope definitions.',
    highlights: [
      { title: 'User Persona & Story Format', desc: '"As a [user], I want [capability] so that [benefit]" structure baked in.' },
      { title: 'Technical Feasibility & Non-Goals', desc: 'Clearly delineates scope boundaries to prevent feature creep.' }
    ],
    faqs: [
      { question: 'Can I turn meeting audio directly into a PRD draft?', answer: 'Yes. Record the product kickoff call and run the PRD template prompt to draft the entire document.' }
    ],
    schemaType: 'HowTo'
  },

  // =========================================================================
  // 5. GUIDES & TUTORIALS (/guides/*)
  // =========================================================================
  {
    slug: 'getting-started-with-domonote',
    category: 'guides',
    path: '/guides/getting-started-with-domonote',
    name: 'Getting Started with DomoNote',
    title: 'Getting Started with DomoNote — Quickstart Guide | DomoNote Docs',
    description: 'Learn how to set up DomoNote, connect local Ollama models, record your first meeting, and summarize PDF documents in 5 minutes.',
    keywords: 'getting started with domonote, domonote tutorial, how to use domonote, domonote quickstart, local ai setup guide',
    badge: 'Tutorial',
    summary: 'A complete step-by-step introduction to mastering DomoNote. From installation and local AI pairing to advanced multi-context workspace orchestration.',
    highlights: [
      { title: 'Instant Installation', desc: 'Download standalone executables or run directly in your modern web browser.' },
      { title: 'Automated AI Onboarding', desc: 'Follow the built-in wizard to configure Ollama and Qwen 2.5 3B with one click.' },
      { title: 'First Meeting Recording', desc: 'Test speech recognition and generate your first executive summary in under 3 minutes.' }
    ],
    steps: [
      { step: '01', title: 'Download DomoNote', desc: 'Get the native installer for Windows, macOS, or Linux, or use the web app.' },
      { step: '02', title: 'Setup Local AI', desc: 'Install Ollama and let DomoNote pull your preferred lightweight model.' },
      { step: '03', title: 'Capture & Organize', desc: 'Record meetings, write notes, and explore the multi-context AI workspace.' }
    ],
    faqs: [
      { question: 'Do I need a GPU to run DomoNote?', answer: 'No. The default Qwen 2.5 3B model runs efficiently on standard modern laptop CPUs.' }
    ],
    schemaType: 'HowTo'
  },
  {
    slug: 'how-to-setup-ollama-for-domonote',
    category: 'guides',
    path: '/guides/how-to-setup-ollama-for-domonote',
    name: 'How to Setup Ollama for DomoNote',
    title: 'How to Setup Ollama for DomoNote on Windows, Mac & Linux',
    description: 'Comprehensive walkthrough on installing and configuring Ollama for DomoNote. Covers CORS origins, model pulling, and background service setup.',
    keywords: 'setup ollama for domonote, install ollama windows, install ollama mac, ollama cors configuration, run ollama locally',
    badge: 'Technical Guide',
    summary: 'Ollama is the local inference engine that powers DomoNote’s intelligence. This guide covers installation, running as a service, and configuring environment variables.',
    highlights: [
      { title: 'One-Click Installer Links', desc: 'Direct links to official Ollama downloads for macOS, Windows, and Linux.' },
      { title: 'CORS Configuration Tips', desc: 'Ensure your web browser can connect to http://localhost:11434 with OLLAMA_ORIGINS.' },
      { title: 'Model Pulling Commands', desc: 'Exact commands to download Qwen 2.5, Llama 3.2, and Gemma 2 in your terminal.' }
    ],
    steps: [
      { step: '01', title: 'Install Ollama', desc: 'Download from ollama.com or run `curl -fsSL https://ollama.com/install.sh | sh`.' },
      { step: '02', title: 'Pull Model', desc: 'Execute `ollama pull qwen2.5:3b` in your terminal or Command Prompt.' },
      { step: '03', title: 'Connect DomoNote', desc: 'Open DomoNote Settings → AI Engine to verify connection status.' }
    ],
    faqs: [
      { question: 'How do I resolve "Local AI Offline" in DomoNote?', answer: 'Ensure Ollama is running in your taskbar or terminal, and verify OLLAMA_ORIGINS="*" is set if accessing via browser.' }
    ],
    schemaType: 'HowTo'
  },
  {
    slug: 'transcribe-google-meet-without-cloud-bot',
    category: 'guides',
    path: '/guides/transcribe-google-meet-without-cloud-bot',
    name: 'Transcribe Google Meet Without Cloud Bots',
    title: 'How to Transcribe Google Meet Privately Without Cloud Bots | DomoNote',
    description: 'Learn how to capture Google Meet audio silently using the DomoNote Chrome Extension. No awkward recording bots in your conference calls.',
    keywords: 'transcribe google meet without bot, private google meet transcription, record google meet locally, no bot meeting recorder, google meet chrome extension transcriber',
    badge: 'Productivity Guide',
    summary: 'Step-by-step instructions on setting up the DomoNote Chrome extension to stream tab audio cleanly into your offline transcription dashboard.',
    highlights: [
      { title: 'Silent Background Capture', desc: 'No participants are disrupted by an unwanted AI bot entering the call.' },
      { title: 'Tab Audio Loopback', desc: 'Pipes high-clarity incoming digital audio directly into the transcription engine.' },
      { title: 'Dual Stream Merging', desc: 'Merges your local mic input with incoming conference audio seamlessly.' }
    ],
    steps: [
      { step: '01', title: 'Load Extension', desc: 'Load the DomoNote extension folder in chrome://extensions with Developer Mode enabled.' },
      { step: '02', title: 'Join Google Meet', desc: 'Open your Google Meet conference in Chrome.' },
      { step: '03', title: 'Click Extension Icon', desc: 'Click DomoNote in your toolbar to begin instant private transcription.' }
    ],
    faqs: [
      { question: 'Does the extension work on Brave and Edge?', answer: 'Yes. Any Chromium-based browser (Chrome, Edge, Brave, Arc, Opera) supports the DomoNote extension.' }
    ],
    schemaType: 'HowTo'
  },
  {
    slug: 'how-to-generate-sop-manuals-from-screen-recordings',
    category: 'guides',
    path: '/guides/how-to-generate-sop-manuals-from-screen-recordings',
    name: 'Generate SOP Manuals from Screen Recordings',
    title: 'How to Generate SOP Manuals from Screen Recordings | DomoNote',
    description: 'Discover how to turn recorded screen workflows into annotated, step-by-step Standard Operating Procedure (SOP) manuals with DomoNote.',
    keywords: 'how to generate SOP manual, screen recording to manual, create SOP from screen, automated step by step documentation, process manual builder',
    badge: 'Operations Guide',
    summary: 'Document complex digital workflows effortlessly. Record your screen while walking through a task, and let DomoNote format screenshots and steps into an exportable manual.',
    highlights: [
      { title: 'Automatic Timestamping', desc: 'Every major action is timestamped and converted into an instruction step.' },
      { title: 'Annotation Toolkit', desc: 'Add colored callout badges, arrows, and highlight rectangles to key interface elements.' },
      { title: 'Publish Ready PDF', desc: 'Export formatted manuals ready for team handoff or new employee training.' }
    ],
    faqs: [
      { question: 'Can I record specific application windows?', answer: 'Yes. You can choose to capture your entire screen, an application window, or a specific browser tab.' }
    ],
    schemaType: 'HowTo'
  },
  {
    slug: 'best-local-llm-models-for-meeting-notes',
    category: 'guides',
    path: '/guides/best-local-llm-models-for-meeting-notes',
    name: 'Best Local AI Models for Meeting Notes',
    title: 'Best Local AI Models for Meeting Notes & Audio Summaries (2026)',
    description: 'Benchmarking the best open-source models for meeting notes. Compare Qwen 2.5, Llama 3.2, Gemma 2, and DeepSeek R1 for speed, accuracy, and RAM usage.',
    keywords: 'best local llm for meeting notes, best ollama model for summaries, qwen vs llama for notes, local ai benchmark 2026, top open source models for transcription',
    badge: 'Benchmark',
    summary: 'A deep-dive benchmark evaluating the top open weights for summarizing audio transcripts, extracting action items, and maintaining conversational context.',
    highlights: [
      { title: 'Token Speed Comparison', desc: 'Benchmarks across Apple M-series chips and Intel/AMD PC hardware.' },
      { title: 'Memory vs Quality Trade-offs', desc: 'When to choose a 3B model vs when an 8B/14B model is worth the extra RAM.' },
      { title: 'Prompt Adherence Ratings', desc: 'Evaluates which models follow strict JSON/Markdown schema outputs without deviation.' }
    ],
    faqs: [
      { question: 'What is the best overall model for a standard laptop?', answer: 'Qwen 2.5 3B provides the highest quality-to-memory ratio, running smoothly on nearly any modern laptop.' }
    ],
    schemaType: 'Article'
  },
  {
    slug: 'offline-pdf-chat-with-local-rag',
    category: 'guides',
    path: '/guides/offline-pdf-chat-with-local-rag',
    name: 'Offline PDF Chat with Local RAG',
    title: 'How to Chat with PDF Documents 100% Offline using Local RAG | DomoNote',
    description: 'Learn how to chat with confidential PDFs and large documents completely offline. Ingest files with local vector search and query without internet access.',
    keywords: 'offline pdf chat, local rag pdf, chat with documents offline, private pdf ai, local vector search pdf, ask questions to pdf local',
    badge: 'RAG Guide',
    summary: 'Explore how DomoNote indexes PDFs into local vector embeddings to deliver instant, cited answers without exposing sensitive intellectual property to cloud services.',
    highlights: [
      { title: 'Local Semantic Indexing', desc: 'Chunk documents and calculate embeddings right in your computer’s memory.' },
      { title: 'Source Attribution', desc: 'Every answer references the exact page and section from which the facts were retrieved.' }
    ],
    faqs: [
      { question: 'What is the maximum number of pages supported?', answer: 'DomoNote can parse and index documents with hundreds of pages smoothly on modern devices.' }
    ],
    schemaType: 'HowTo'
  },
  {
    slug: 'install-domonote-windows-macos-linux',
    category: 'guides',
    path: '/guides/install-domonote-windows-macos-linux',
    name: 'Multi-Platform Installation Guide',
    title: 'How to Install DomoNote on Windows, macOS, and Linux | DomoNote Docs',
    description: 'Detailed installation steps for DomoNote on Windows 10/11, macOS Apple Silicon/Intel, and Linux distributions. Get up and running in minutes.',
    keywords: 'install domonote windows, install domonote mac, install domonote linux, domonote dmg, domonote appimage, domonote setup guide',
    badge: 'Installation',
    summary: 'Step-by-step instructions for downloading, installing, and bypassing OS security prompts on Windows, macOS, and Linux.',
    highlights: [
      { title: 'Windows Setup.exe & Portable', desc: 'One-click installer with automatic desktop and Start Menu shortcuts.' },
      { title: 'macOS Universal DMG', desc: 'Includes instructions for Apple Silicon and xattr bypass for gatekeeper validation.' },
      { title: 'Linux AppImage & Debian Package', desc: 'Universal executable that runs on Ubuntu, Fedora, Debian, and Arch.' }
    ],
    steps: [
      { step: '01', title: 'Download Package', desc: 'Download the appropriate installer from our official download page or GitHub.' },
      { step: '02', title: 'Launch Installer', desc: 'Run the setup wizard or drag the application into your Applications folder.' },
      { step: '03', title: 'Configure AI', desc: 'Follow the on-screen prompt to pair with your local Ollama installation.' }
    ],
    faqs: [
      { question: 'Why does macOS say "unidentified developer"?', answer: 'Run `xattr -cr /Applications/DomoNote.app` in Terminal to clear the gatekeeper quarantine flag.' }
    ],
    schemaType: 'HowTo'
  },
  {
    slug: 'exporting-meeting-minutes-to-markdown-pdf',
    category: 'guides',
    path: '/guides/exporting-meeting-minutes-to-markdown-pdf',
    name: 'Export Meeting Minutes to Markdown & PDF',
    title: 'How to Export Meeting Minutes to Markdown, PDF & JSON | DomoNote',
    description: 'Learn how to export your meeting minutes, transcripts, and action items to Markdown, formatted PDF, and structured JSON for team distribution.',
    keywords: 'export meeting minutes markdown, export meeting to pdf, download transcript json, format meeting notes export, domonote export guide',
    badge: 'Export Guide',
    summary: 'Make your meeting outcomes easily shareable. DomoNote exports notes in clean, universal formats compatible with Notion, Obsidian, GitHub, and corporate email.',
    highlights: [
      { title: 'Clean Markdown Export', desc: 'Exports standard GitHub-flavored markdown with headers, bullet points, and checkboxes.' },
      { title: 'Executive Branded PDF', desc: 'Generates professional vector PDFs with document titles, attendee lists, and summary cards.' },
      { title: 'Machine-Readable JSON', desc: 'Export full timestamped transcript arrays for custom data processing pipelines.' }
    ],
    faqs: [
      { question: 'Can I export just the summary without the raw transcript?', answer: 'Yes. You can customize the export dialog to include only summaries, action items, or the complete transcript.' }
    ],
    schemaType: 'HowTo'
  },
  {
    slug: 'troubleshooting-ollama-cors-and-connection',
    category: 'guides',
    path: '/guides/troubleshooting-ollama-cors-and-connection',
    name: 'Fix Ollama Connection & CORS Errors',
    title: 'How to Fix Ollama Connection and CORS Errors in DomoNote',
    description: 'Step-by-step troubleshooting guide for resolving "Local AI Offline" and CORS errors when connecting browser-based DomoNote to Ollama.',
    keywords: 'fix ollama connection, ollama cors error, local ai offline domonote, ollama origins environment variable, connect browser to ollama',
    badge: 'Troubleshooting',
    summary: 'Resolve the most common connection hurdles when pairing web apps with local Ollama daemons, including setting OLLAMA_ORIGINS across operating systems.',
    highlights: [
      { title: 'Cross-Origin Resource Sharing (CORS)', desc: 'Explain how browsers isolate localhost requests and how to grant permissions.' },
      { title: 'Platform Specific Fixes', desc: 'Exact commands for macOS launchctl, Windows PowerShell environment variables, and systemd.' }
    ],
    steps: [
      { step: '01', title: 'Verify Ollama is Running', desc: 'Open http://localhost:11434 in your browser — you should see "Ollama is running".' },
      { step: '02', title: 'Set OLLAMA_ORIGINS', desc: 'Set `OLLAMA_ORIGINS="*"` in your system environment and restart Ollama.' },
      { step: '03', title: 'Reload DomoNote', desc: 'Click "Check Connection" in DomoNote Settings to confirm green status.' }
    ],
    faqs: [
      { question: 'Does the native desktop app suffer from CORS issues?', answer: 'No. The native Windows, macOS, and Linux desktop builds communicate directly with Ollama without browser CORS restrictions.' }
    ],
    schemaType: 'HowTo'
  },
  {
    slug: 'data-privacy-security-architecture',
    category: 'guides',
    path: '/guides/data-privacy-security-architecture',
    name: 'Local-First Security Architecture',
    title: 'DomoNote Security Architecture — How 100% Local-First Software Works',
    description: 'Technical deep-dive into DomoNote’s security architecture: client-side IndexedDB persistence, local audio buffer management, and air-gapped LLM inference.',
    keywords: 'local first architecture, domonote security whitepaper, private ai architecture, air gapped software design, client side indexeddb security',
    badge: 'Security Whitepaper',
    summary: 'Understand the mathematical and architectural safeguards that keep your data sovereign. Learn how zero-cloud applications eliminate attack vectors.',
    highlights: [
      { title: 'Zero Cloud Footprint', desc: 'No remote databases, no user accounts to hack, and no cloud backups exposed to leaks.' },
      { title: 'Hardware Sandbox Isolation', desc: 'Leverages browser sandbox and OS-level memory isolation to protect in-flight audio buffers.' },
      { title: 'Full Code Transparency', desc: 'Open source under the MIT license with complete visibility into all network calls.' }
    ],
    faqs: [
      { question: 'Is DomoNote HIPAA and GDPR compliant?', answer: 'Because DomoNote never stores or processes data on external cloud infrastructure, it inherently satisfies data residency and non-disclosure standards.' }
    ],
    schemaType: 'Article'
  },

  // =========================================================================
  // 6. INDUSTRY & ROLE SOLUTIONS (/solutions/*)
  // =========================================================================
  {
    slug: 'legal-attorneys-confidential-meetings',
    category: 'solutions',
    path: '/solutions/legal-attorneys-confidential-meetings',
    name: 'Legal Firms & Attorneys',
    title: 'Private AI Meeting Secretary for Legal Firms & Attorneys | DomoNote',
    description: 'Maintain strict attorney-client privilege. Transcribe depositions, client discovery, and partner meetings 100% locally with zero cloud disclosure.',
    keywords: 'ai meeting secretary for lawyers, legal meeting transcription, confidential deposition transcription, attorney client privilege ai, private legal notes',
    badge: 'Legal Practice',
    summary: 'Law firms cannot risk uploading confidential client statements to cloud AI vendors. DomoNote gives legal professionals cutting-edge AI transcription without breaching privileged confidentiality.',
    highlights: [
      { title: 'Absolute Privilege Protection', desc: 'Audio recordings and transcripts never leave the attorney’s encrypted local laptop.' },
      { title: 'Deposition & Discovery Records', desc: 'Accurately documents witness testimony and interview timestamps for litigation prep.' },
      { title: 'No Third-Party Subpoena Risk', desc: 'Because you don’t store data with a cloud provider, third parties cannot subpoena a vendor for your records.' }
    ],
    faqs: [
      { question: 'Does DomoNote satisfy ethical duties of technology competence for lawyers?', answer: 'Yes. By eliminating cloud vendor storage risks, lawyers uphold ABA Model Rule 1.6 regarding confidential client data.' }
    ],
    schemaType: 'SoftwareApplication'
  },
  {
    slug: 'healthcare-hipaa-clinical-notes',
    category: 'solutions',
    path: '/solutions/healthcare-hipaa-clinical-notes',
    name: 'Healthcare & Clinical Documentation',
    title: 'Confidential Meeting & Clinical Documentation Assistant | DomoNote',
    description: 'Document patient case discussions, clinical trials, and medical administrative meetings on air-gapped hardware with zero cloud exposure.',
    keywords: 'clinical documentation ai offline, hipaa compliant local ai, private medical meeting notes, healthcare transcription local, on device clinical notes',
    badge: 'Healthcare & Clinical',
    summary: 'Healthcare practitioners and research institutions can transcribe administrative syncs and case consultations with zero risk of PHI (Protected Health Information) leaking to cloud datacenters.',
    highlights: [
      { title: 'Zero Cloud PHI Transmission', desc: 'Compliant with HIPAA data containment principles by processing all audio on-device.' },
      { title: 'Medical Terminology Capture', desc: 'High-capacity models like Faster-Whisper handle complex pharmaceutical and diagnostic terms.' }
    ],
    faqs: [
      { question: 'Do I need a Business Associate Agreement (BAA) to use DomoNote?', answer: 'No BAA is necessary because DomoNote does not act as a cloud data processor or store any data on external servers.' }
    ],
    schemaType: 'SoftwareApplication'
  },
  {
    slug: 'software-engineers-tech-leads',
    category: 'solutions',
    path: '/solutions/software-engineers-tech-leads',
    name: 'Software Engineers & Tech Leads',
    title: 'Engineering Design Notes & Architecture Meeting Synthesis | DomoNote',
    description: 'Keep your engineering syncs sharp. Capture architecture reviews, sprint planning, and post-mortems with AI that understands code and technical RFCs.',
    keywords: 'engineering meeting notes ai, tech lead meeting assistant, software architecture meeting notes, developer standup ai, sprint retro ai',
    badge: 'Engineering',
    summary: 'Engineers love DomoNote because it speaks their language: keyboard shortcuts, markdown outputs, local Ollama models, and total data sovereignty.',
    highlights: [
      { title: 'Code-Aware Summarization', desc: 'Preserves syntax, database schemas, and API design specifications accurately.' },
      { title: 'Markdown First', desc: 'Copy outputs directly into your repository documentation, Obsidian vault, or GitHub Discussions.' }
    ],
    faqs: [
      { question: 'Can I run DomoNote on my Linux development machine?', answer: 'Yes. We offer universal AppImages, native Debian packages, and portable tarballs for Linux.' }
    ],
    schemaType: 'SoftwareApplication'
  },
  {
    slug: 'finance-banking-board-meetings',
    category: 'solutions',
    path: '/solutions/finance-banking-board-meetings',
    name: 'Finance & Banking Institutions',
    title: 'Air-Gapped Financial Meeting Minutes & Board Intelligence | DomoNote',
    description: 'Protect material non-public information (MNPI) and financial strategies. Transcribe earnings discussions, M&A due diligence, and board votes locally.',
    keywords: 'financial meeting notes ai, banking board meeting transcriber, mnpi compliant ai, m&a due diligence notes, air gapped financial notes',
    badge: 'Finance & Banking',
    summary: 'Investment bankers, M&A advisors, and corporate treasurers handle highly sensitive material non-public information. DomoNote ensures financial deliberations stay strictly on local hardware.',
    highlights: [
      { title: 'Strict MNPI Compliance', desc: 'Eliminates cloud leak vectors that could compromise SEC or regulatory compliance.' },
      { title: 'Board Resolution Ledger', desc: 'Accurately documents formal votes, capital allocation decisions, and audit commentary.' }
    ],
    faqs: [
      { question: 'Can DomoNote be deployed on corporate-managed laptops?', answer: 'Yes. DomoNote requires no administrative server access and can run offline on locked-down enterprise machines.' }
    ],
    schemaType: 'SoftwareApplication'
  },
  {
    slug: 'academic-researchers-students',
    category: 'solutions',
    path: '/solutions/academic-researchers-students',
    name: 'Academic Researchers & Students',
    title: 'Lecture Transcription & Research Paper Knowledge Base | DomoNote',
    description: 'Transcribe university lectures, summarize dense journal articles, and build your personal academic knowledge base with DomoNote.',
    keywords: 'lecture transcription ai, academic paper summarizer, student study assistant ai, thesis research notes, offline lecture recorder',
    badge: 'Education & Research',
    summary: 'Never miss an exam concept or lecture detail again. Record lectures, convert slides and readings to notes, and query your study materials with local AI.',
    highlights: [
      { title: 'Full Semester Lecture Logs', desc: 'Capture multi-hour lectures with high-fidelity speech-to-text and timestamped review.' },
      { title: '100% Free Forever', desc: 'Save hundreds of dollars on commercial transcription and AI study subscriptions.' }
    ],
    faqs: [
      { question: 'Can I record lectures without internet in the classroom?', answer: 'Yes. DomoNote records and transcribes completely offline without requiring campus Wi-Fi.' }
    ],
    schemaType: 'SoftwareApplication'
  },
  {
    slug: 'startup-founders-executives',
    category: 'solutions',
    path: '/solutions/startup-founders-executives',
    name: 'Startup Founders & Executives',
    title: 'Executive AI Secretary for Fast-Moving Startup Founders | DomoNote',
    description: 'Maximize founder leverage. Offload meeting synthesis, investor call notes, and team action tracking to a personal AI that runs locally on your Mac or PC.',
    keywords: 'startup founder ai assistant, executive secretary ai, investor meeting notes, fast meeting minutes startup, founder productivity app',
    badge: 'Founders & Startups',
    summary: 'Founders spend 30+ hours a week in meetings. DomoNote works as your 24/7 executive chief of staff, turning investor pitches and customer interviews into structured execution plans.',
    highlights: [
      { title: 'Investor Pitch Feedback', desc: 'Capture investor objections and diligence follow-ups accurately during live pitch calls.' },
      { title: 'Zero Monthly Overhead', desc: 'Keep your startup burn rate low by using free on-device AI instead of expensive SaaS seats.' }
    ],
    faqs: [
      { question: 'Can I use DomoNote while traveling?', answer: 'Yes. DomoNote works flawlessly on airplanes, trains, and remote locations with zero connectivity.' }
    ],
    schemaType: 'SoftwareApplication'
  },

  // =========================================================================
  // 7. PLATFORM DOWNLOAD LANDING PAGES (/download/*)
  // =========================================================================
  {
    slug: 'windows',
    category: 'download',
    subCategory: 'platform',
    path: '/download/windows',
    name: 'DomoNote for Windows',
    title: 'Download DomoNote for Windows 10 & 11 (.EXE & Portable) | DomoNote',
    description: 'Download DomoNote for Windows 10 & 11. Native .NET 9 desktop application with Microsoft WebView2, dark mode, and local Ollama companion.',
    keywords: 'download domonote windows, domonote windows installer, domonote setup exe, private meeting recorder windows, offline transcription windows 11',
    badge: 'Windows 10 & 11',
    summary: 'The native Windows edition of DomoNote is built on .NET 9 and Microsoft.Web.WebView2, delivering silky-smooth performance, DWM dark mode integration, and hardware audio loopback.',
    highlights: [
      { title: 'Setup.exe & Portable ZIP', desc: 'Choose between a standard desktop installer or a zero-install portable folder package.' },
      { title: 'System Audio Loopback', desc: 'Capture audio directly from Zoom, Microsoft Teams, and Discord without third-party virtual cables.' },
      { title: 'Hardware Acceleration', desc: 'Leverages modern GPU compute for instant local AI responses.' }
    ],
    faqs: [
      { question: 'Does DomoNote require Windows 11?', answer: 'DomoNote runs on both Windows 10 (64-bit) and Windows 11.' },
      { question: 'Is the Windows installer code signed?', answer: 'DomoNote binaries are built transparently via open-source GitHub Actions CI/CD workflows.' }
    ],
    schemaType: 'SoftwareApplication'
  },
  {
    slug: 'macos',
    category: 'download',
    subCategory: 'platform',
    path: '/download/macos',
    name: 'DomoNote for macOS',
    title: 'Download DomoNote for macOS (Apple Silicon & Intel DMG) | DomoNote',
    description: 'Download DomoNote for macOS. Native Swift application with Apple Silicon M1/M2/M3 optimization, menu bar companion, and local Whisper.',
    keywords: 'download domonote mac, domonote macos dmg, apple silicon meeting notes ai, m1 m2 m3 transcriber, offline ai macos',
    badge: 'macOS Universal',
    summary: 'Experience blistering on-device inference speed. The macOS build of DomoNote is optimized for Apple Silicon Unified Memory and the Neural Engine.',
    highlights: [
      { title: 'Apple Silicon & Intel Universal', desc: 'Dedicated optimized binaries for M1/M2/M3/M4 chips as well as legacy Intel Macs.' },
      { title: 'Menu Bar Quick Access', desc: 'Trigger meeting recordings and screen captures directly from the macOS status bar.' },
      { title: 'Unified Memory Efficiency', desc: 'Runs 8B/14B Ollama models with zero swapping on Macs with 16 GB+ unified memory.' }
    ],
    faqs: [
      { question: 'How do I bypass macOS Gatekeeper?', answer: 'If macOS alerts you on first open, run `xattr -cr /Applications/DomoNote.app` in Terminal.' }
    ],
    schemaType: 'SoftwareApplication'
  },
  {
    slug: 'linux',
    category: 'download',
    subCategory: 'platform',
    path: '/download/linux',
    name: 'DomoNote for Linux',
    title: 'Download DomoNote for Linux (AppImage & Debian .deb) | DomoNote',
    description: 'Download DomoNote for Linux. Universal AppImage, native Debian/Ubuntu .deb package, and standalone portable tarball for privacy purists.',
    keywords: 'download domonote linux, domonote appimage, domonote deb package, linux meeting recorder offline, open source ai assistant linux',
    badge: 'Linux Desktop',
    summary: 'A first-class Linux experience for open-source enthusiasts. Standalone AppImage and Debian packages compatible with Ubuntu, Debian, Fedora, Arch, and Mint.',
    highlights: [
      { title: 'Universal AppImage', desc: 'Download, mark executable (`chmod +x`), and launch anywhere without dependency issues.' },
      { title: 'Debian / Ubuntu Package', desc: 'Installs cleanly via `sudo dpkg -i domonote_1.0.2_amd64.deb` with desktop integration.' },
      { title: 'One-Line Curl Installer', desc: 'Run `curl -fsSL https://domonote.vercel.app/downloads/DomoNote-Setup.sh | bash` for automated setup.' }
    ],
    faqs: [
      { question: 'Does DomoNote work on Wayland and X11?', answer: 'Yes, both Wayland and X11 desktop environments are fully supported.' }
    ],
    schemaType: 'SoftwareApplication'
  },
  {
    slug: 'chrome-extension',
    category: 'download',
    subCategory: 'platform',
    path: '/download/chrome-extension',
    name: 'DomoNote Chrome Extension',
    title: 'Download DomoNote Chrome Extension — Google Meet Audio Capture',
    description: 'Download the DomoNote Chrome Extension (Manifest V3). Capture Google Meet and browser tab audio directly into your local offline workspace.',
    keywords: 'download domonote chrome extension, google meet audio capture extension, tab audio loopback extension, private meeting chrome extension',
    badge: 'Chrome MV3',
    summary: 'Seamlessly capture meeting audio right from your browser tab without inviting cloud bots. Perfect for Google Meet, browser Zoom, and online webinars.',
    highlights: [
      { title: 'Manifest V3 Compliance', desc: 'Built to Google’s latest secure extension standards with zero background telemetry.' },
      { title: 'Always-On-Top Mini HUD', desc: 'Controls stay visible as a compact overlay while you navigate across presentation tabs.' },
      { title: 'One-Click Unpacked Install', desc: 'Clone or download the /browser-extension directory and load directly into Chrome.' }
    ],
    faqs: [
      { question: 'Does the extension work in Brave and Microsoft Edge?', answer: 'Yes. Any Chromium browser supporting Manifest V3 can run the DomoNote extension.' }
    ],
    schemaType: 'SoftwareApplication'
  }
];

// =========================================================================
// 8. PROGRAMMATIC TOOL VARIATIONS (/tools/:category/:slug)
// =========================================================================

const MEETING_PLATFORMS = [
  { id: 'google-meet', name: 'Google Meet', label: 'Google Meet Calls', desc: 'Capture Google Meet discussions with tab audio loopback without recording bots.' },
  { id: 'zoom', name: 'Zoom', label: 'Zoom Conferences', desc: 'Transcribe desktop and browser Zoom meetings with local speaker diarization.' },
  { id: 'microsoft-teams', name: 'Microsoft Teams', label: 'Microsoft Teams Calls', desc: 'Generate executive minutes and task lists from Microsoft Teams syncs.' },
  { id: 'cisco-webex', name: 'Cisco Webex', label: 'Cisco Webex Meetings', desc: 'Secure offline recording for enterprise Webex conference rooms.' },
  { id: 'slack-huddles', name: 'Slack Huddles', label: 'Slack Huddles', desc: 'Turn informal engineering Slack Huddles into clean Markdown task lists.' },
  { id: 'discord-calls', name: 'Discord', label: 'Discord Voice Calls', desc: 'Transcribe developer group chats and community voice channels privately.' },
  { id: 'interviews', name: 'Interviews', label: 'Job & User Interviews', desc: 'Record candidate responses and candidate evaluation points automatically.' },
  { id: 'board-meetings', name: 'Board Meetings', label: 'Executive Board Meetings', desc: 'Air-gapped documentation of strategic decisions and financial resolutions.' },
  { id: 'investor-pitches', name: 'Investor Pitches', label: 'Investor & Fundraising Calls', desc: 'Catalog venture diligence questions and partner commitments.' },
  { id: 'doctor-consultations', name: 'Clinical Consultations', label: 'Medical & Clinical Consults', desc: 'Private clinical record synthesis with zero cloud PHI exposure.' },
  { id: 'podcasts-interviews', name: 'Podcasts', label: 'Podcast & Audio Shows', desc: 'Generate verbatim transcripts and show notes from recorded audio.' },
  { id: 'webinars-lectures', name: 'Webinars', label: 'Webinars & Online Keynotes', desc: 'Convert live presentation speech into study notes and key takeaways.' }
];

MEETING_PLATFORMS.forEach((p) => {
  SEO_PAGES.push({
    slug: p.id,
    category: 'tools',
    subCategory: 'meeting-transcription',
    path: `/tools/meeting-transcription/${p.id}`,
    name: `${p.name} Meeting Transcriber`,
    title: `Private ${p.name} Transcription & Meeting Notes AI | DomoNote`,
    description: `Transcribe and summarize ${p.label} 100% offline with DomoNote. Zero cloud uploads, no intrusive meeting bots, and instant local executive minutes.`,
    keywords: `${p.name.toLowerCase()} transcription, transcribe ${p.name.toLowerCase()} offline, private ${p.name.toLowerCase()} recorder, ${p.name.toLowerCase()} meeting notes ai, domonote`,
    badge: 'Meeting Tool',
    summary: `Record and transcribe ${p.label} directly on your device. DomoNote extracts key decisions, creates action matrices, and keeps confidential discussions completely private on your hardware.`,
    highlights: [
      { title: 'Zero Third-Party Cloud Bots', desc: `No bot joins your ${p.name} call — audio is captured cleanly via browser or desktop loopback.` },
      { title: 'Automatic Speaker Diarization', desc: 'Identifies different speakers and attributes discussion points to participants.' },
      { title: 'Instant Executive Minutes', desc: 'Generates structured minutes of meeting and exportable Markdown action items.' }
    ],
    faqs: [
      { question: `Does DomoNote require bot access to ${p.name}?`, answer: `No. DomoNote captures the audio output from ${p.name} directly on your operating system without any bot joining.` },
      { question: 'Is my meeting recording kept private?', answer: 'Yes. All audio recordings, transcripts, and summaries stay 100% offline in your local database.' }
    ],
    schemaType: 'SoftwareApplication'
  });
});

const DOC_FORMATS = [
  { id: 'pdf', ext: 'PDF', name: 'PDF Documents', desc: 'Summarize long-form PDF books, whitepapers, and legal filings.' },
  { id: 'docx', ext: 'DOCX', name: 'Microsoft Word Files', desc: 'Analyze and extract executive overviews from .docx documents.' },
  { id: 'pptx', ext: 'PPTX', name: 'PowerPoint Slide Decks', desc: 'Extract key speaker notes, bullets, and slide takeaways from .pptx presentations.' },
  { id: 'research-papers', ext: 'PDF', name: 'Academic Research Papers', desc: 'Extract hypotheses, methodologies, datasets, and citation structures.' },
  { id: 'financial-reports', ext: 'PDF/DOCX', name: '10-K & Financial Statements', desc: 'Isolate balance sheet trends, revenue margins, and risk disclosures.' },
  { id: 'legal-contracts', ext: 'PDF/DOCX', name: 'NDAs & Service Agreements', desc: 'Scan contracts for indemnification limits, termination clauses, and liabilities.' },
  { id: 'technical-specs', ext: 'Markdown/PDF', name: 'Technical Specs & RFCs', desc: 'Synthesize architecture proposals and system design specifications.' },
  { id: 'medical-records', ext: 'PDF', name: 'Clinical Case Records', desc: 'Synthesize clinical histories, lab reports, and treatment plans locally.' },
  { id: 'meeting-transcripts', ext: 'TXT/MD', name: 'Historical Transcripts', desc: 'Search and cross-reference hundreds of past meeting logs.' },
  { id: 'hardware-manuals', ext: 'PDF', name: 'Equipment & User Manuals', desc: 'Navigate maintenance steps and troubleshooting tables in massive manuals.' }
];

DOC_FORMATS.forEach((d) => {
  SEO_PAGES.push({
    slug: d.id,
    category: 'tools',
    subCategory: 'document-summarizer',
    path: `/tools/document-summarizer/${d.id}`,
    name: `${d.name} AI Summarizer`,
    title: `Local ${d.name} AI Summarizer & Semantic Parser | DomoNote`,
    description: `Read, annotate, and summarize ${d.name} 100% offline with DomoNote. Private local RAG vector search with zero document uploads.`,
    keywords: `${d.id} summarizer, local ${d.id} ai, summarize ${d.name.toLowerCase()} offline, private ${d.ext.toLowerCase()} reader, offline document intelligence`,
    badge: 'Document Tool',
    summary: `${d.desc} DomoNote parses documents locally and lets you chat with the contents using on-device Ollama models with zero risk of intellectual property leakage.`,
    highlights: [
      { title: 'Zero Cloud Uploads', desc: 'Confidential documents stay securely stored on your device drive without external transmission.' },
      { title: 'Interactive Annotations', desc: 'Highlight clauses, draw margin notes, and extract tabular data directly.' },
      { title: 'Grounded Semantic Citations', desc: 'AI answers cite specific pages and paragraph numbers with zero hallucination.' }
    ],
    faqs: [
      { question: `Can I summarize large ${d.name} offline?`, answer: 'Yes. DomoNote handles large files up to 80 MB directly inside your local memory.' },
      { question: 'Do my files train public AI models?', answer: 'Never. DomoNote has no cloud servers and uses local models that do not transmit prompts externally.' }
    ],
    schemaType: 'SoftwareApplication'
  });
});

const TRANSLATION_PAIRS = [
  { from: 'English', to: 'Spanish', fromCode: 'en', toCode: 'es' },
  { from: 'Spanish', to: 'English', fromCode: 'es', toCode: 'en' },
  { from: 'English', to: 'Japanese', fromCode: 'en', toCode: 'ja' },
  { from: 'Japanese', to: 'English', fromCode: 'ja', toCode: 'en' },
  { from: 'English', to: 'Chinese', fromCode: 'en', toCode: 'zh' },
  { from: 'Chinese', to: 'English', fromCode: 'zh', toCode: 'en' },
  { from: 'English', to: 'French', fromCode: 'en', toCode: 'fr' },
  { from: 'French', to: 'English', fromCode: 'fr', toCode: 'en' },
  { from: 'English', to: 'German', fromCode: 'en', toCode: 'de' },
  { from: 'German', to: 'English', fromCode: 'de', toCode: 'en' },
  { from: 'English', to: 'Tagalog', fromCode: 'en', toCode: 'tl' },
  { from: 'Tagalog', to: 'English', fromCode: 'tl', toCode: 'en' },
  { from: 'English', to: 'Portuguese', fromCode: 'en', toCode: 'pt' },
  { from: 'English', to: 'Italian', fromCode: 'en', toCode: 'it' },
  { from: 'English', to: 'Korean', fromCode: 'en', toCode: 'ko' }
];

TRANSLATION_PAIRS.forEach((t) => {
  const slug = `${t.from.toLowerCase()}-to-${t.to.toLowerCase()}`;
  SEO_PAGES.push({
    slug,
    category: 'tools',
    subCategory: 'speech-translation',
    path: `/tools/speech-translation/${slug}`,
    name: `${t.from} to ${t.to} Speech Translator`,
    title: `${t.from} to ${t.to} Meeting Speech Translator (Offline) | DomoNote`,
    description: `Real-time offline speech translation from ${t.from} to ${t.to}. Transcribe live conference calls and translate subtitles simultaneously with local AI.`,
    keywords: `${t.from.toLowerCase()} to ${t.to.toLowerCase()} speech translation, translate ${t.from.toLowerCase()} audio to ${t.to.toLowerCase()}, offline audio translator, meeting speech translation`,
    badge: 'Translation Tool',
    summary: `Bridge language gaps during live meetings. DomoNote transcribes ${t.from} audio in real time and renders corresponding ${t.to} subtitles using local LLM models on your computer.`,
    highlights: [
      { title: 'Real-Time Dual Subtitles', desc: `Follow spoken ${t.from} alongside synchronized ${t.to} translated text.` },
      { title: 'Offline Neural Translation', desc: 'Runs entirely on local model weights without latency or internet connection drops.' },
      { title: 'Bilingual Meeting Minutes', desc: `Export comprehensive meeting notes containing both ${t.from} and ${t.to} transcripts.` }
    ],
    faqs: [
      { question: `Does ${t.from} to ${t.to} translation require cloud servers?`, answer: 'No. The translation pipeline executes via Ollama on your local CPU or GPU.' }
    ],
    schemaType: 'SoftwareApplication'
  });
});

const SOP_WORKFLOWS = [
  { id: 'software-qa-testing', name: 'Software QA Testing', role: 'Engineering QA', desc: 'Screen recording to bug reproduction steps and test verification logs.' },
  { id: 'employee-it-onboarding', name: 'Employee IT Onboarding', role: 'IT Support', desc: 'Step-by-step workstation setup, VPN access, and credentials provisioning.' },
  { id: 'customer-support-escalation', name: 'Customer Support Escalations', role: 'Customer Success', desc: 'Standard operating playbook for ticket triage, refunds, and tier-3 escalations.' },
  { id: 'devops-ci-cd-deployment', name: 'DevOps & CI/CD Deployment', role: 'DevOps & Cloud', desc: 'Production release procedures, rollback protocols, and environment configuration.' },
  { id: 'finance-payroll-processing', name: 'Payroll & Expense Processing', role: 'Finance & HR', desc: 'End-of-month expense approvals, bank wire verification, and tax record logging.' },
  { id: 'crm-sales-data-entry', name: 'Salesforce & CRM Opportunity Entry', role: 'Sales Operations', desc: 'Pipeline stage progressions, lead qualification criteria, and deal tracking.' },
  { id: 'inventory-management', name: 'Warehouse & Inventory Intake', role: 'Supply Chain', desc: 'Barcode scanning, stock verification, and ERP reconciliation procedures.' },
  { id: 'marketing-campaign-launch', name: 'Marketing Campaign Launch', role: 'Growth & Marketing', desc: 'Asset approval workflows, UTM link creation, and multi-channel go-live steps.' }
];

SOP_WORKFLOWS.forEach((w) => {
  SEO_PAGES.push({
    slug: w.id,
    category: 'tools',
    subCategory: 'sop-generator',
    path: `/tools/sop-generator/${w.id}`,
    name: `${w.name} SOP Generator`,
    title: `Automated ${w.name} SOP Manual Generator | DomoNote`,
    description: `Create visual, step-by-step SOP manuals for ${w.name.toLowerCase()} from screen recordings. Annotate screenshots and export to PDF/Markdown.`,
    keywords: `${w.id.replace(/-/g, ' ')} sop, ${w.name.toLowerCase()} manual builder, create ${w.name.toLowerCase()} sop from screen, scribe alternative ${w.id}`,
    badge: 'SOP Tool',
    summary: `${w.desc} DomoNote captures your desktop clicks, annotates key buttons, and drafts a comprehensive standard operating procedure ready for team distribution.`,
    highlights: [
      { title: 'Automatic Step-by-Step Drafts', desc: 'Transforms live screen clicks into numbered, clear operating instructions.' },
      { title: 'Visual Screen Annotations', desc: 'Draw highlight boxes, add step badges, and blur sensitive data on screen.' },
      { title: 'Export to PDF & Markdown', desc: 'Share beautiful formatted documentation with zero cloud dependencies.' }
    ],
    faqs: [
      { question: `How fast can I create a ${w.name} SOP?`, answer: 'Simply perform the workflow once on your screen; DomoNote generates the complete manual in under a minute.' }
    ],
    schemaType: 'HowTo'
  });
});

// Helper to look up an SEO page by its exact slug or clean path
export function getSEOPageByPath(path: string): SEOPageItem | undefined {
  const clean = path.replace(/^\/+|\/+$/g, '');
  return SEO_PAGES.find((p) => p.path.replace(/^\/+|\/+$/g, '') === clean);
}

// Groupings for Directory and Sitemap Navigation
export const SEO_GROUPS = [
  { id: 'features', label: 'Core Features & Audio', items: SEO_PAGES.filter((p) => p.category === 'features') },
  { id: 'models', label: 'Supported Local Models', items: SEO_PAGES.filter((p) => p.category === 'models') },
  { id: 'compare', label: 'Comparisons & Alternatives', items: SEO_PAGES.filter((p) => p.category === 'compare') },
  { id: 'templates', label: 'Meeting & SOP Templates', items: SEO_PAGES.filter((p) => p.category === 'templates') },
  { id: 'guides', label: 'Guides & Documentation', items: SEO_PAGES.filter((p) => p.category === 'guides') },
  { id: 'solutions', label: 'Industry & Role Solutions', items: SEO_PAGES.filter((p) => p.category === 'solutions') },
  { id: 'tools', label: 'Specialized Offline Tools', items: SEO_PAGES.filter((p) => p.category === 'tools') },
  { id: 'download', label: 'Platform Downloads', items: SEO_PAGES.filter((p) => p.category === 'download') }
];

