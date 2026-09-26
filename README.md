<div align="center">

<img src="src/assets/official_domonote.png" alt="DomoNote Logo" width="96" />

# DomoNote

**Your Local AI Personal Secretary**

> Capture it. Understand it. Keep it — entirely on your device.

[![Version](https://img.shields.io/badge/version-1.0.0-black?style=flat-square)](https://github.com/darknecrocities/DomoNote/releases)
[![License](https://img.shields.io/badge/license-MIT-black?style=flat-square)](LICENSE)
[![Built with React](https://img.shields.io/badge/React-18-black?style=flat-square&logo=react)](https://react.dev)
[![Powered by Ollama](https://img.shields.io/badge/AI-Ollama-black?style=flat-square)](https://ollama.com)
[![Privacy First](https://img.shields.io/badge/privacy-100%25%20local-black?style=flat-square)](#privacy)

[**Download App**](#-download-the-app) · [**Clone & Run**](#-clone--run-locally) · [**Deploy Online**](#-deploy-to-vercel) · [**Chrome Extension**](#-chrome-extension)

</div>

---

## What is DomoNote?

DomoNote is a **privacy-first, local AI workspace** for knowledge workers. It captures what happens across meetings, documents, screen operations, and notes — then organizes and synthesizes them using local AI models that run entirely on your device.

**No cloud. No subscriptions. No tracking. Just you and your work.**

---

## ✨ Features at a Glance

| Feature | Description |
|---------|-------------|
| 📝 **Notes** | Markdown editor with autosave, version history, tags |
| 🎙️ **Meeting Secretary** | Live audio recording, transcription, AI synthesis |
| 📄 **Document Intelligence** | PDF viewer, annotations, AI analysis |
| 🖥️ **Operation Capture** | Screen recording → auto-generated SOP manuals |
| 🤖 **AI Workspace** | Multi-context chat with local Ollama models |
| 🔒 **100% Local** | All data stored in your browser's IndexedDB |
| 🌐 **Works Offline** | No internet required after first load |

---

## 📦 Download the App

The easiest way to use DomoNote — no Git or Node required.

### Windows

| Installer | Description |
|-----------|-------------|
| [**DomoNote-Setup-x64.exe**](https://github.com/darknecrocities/DomoNote/releases/latest) | ✅ Recommended — One-click installer with Start Menu & Desktop shortcuts |
| [**DomoNote-Windows-Portable.zip**](https://github.com/darknecrocities/DomoNote/releases/latest) | Portable ZIP — extract and run, no installation |
| [**DomoNote-Setup.bat**](https://github.com/darknecrocities/DomoNote/releases/latest) | Developer setup script (auto-installs Node + Ollama) |

**Steps:**
1. Download `DomoNote-Setup-x64.exe` from the [latest release](https://github.com/darknecrocities/DomoNote/releases/latest)
2. Run the installer — it will create Desktop and Start Menu shortcuts
3. Launch **DomoNote** — it will guide you through the AI setup automatically

### macOS

| Download | Description |
|----------|-------------|
| [**DomoNote-macOS-Universal.dmg**](https://github.com/darknecrocities/DomoNote/releases/latest) | Universal binary (Intel + Apple Silicon) |
| [**DomoNote-macOS-arm64.dmg**](https://github.com/darknecrocities/DomoNote/releases/latest) | Apple Silicon (M1/M2/M3) only |
| [**DomoNote-macOS-x64.dmg**](https://github.com/darknecrocities/DomoNote/releases/latest) | Intel Mac only |

**Steps:**
1. Download the `.dmg` for your Mac
2. Open the `.dmg` and drag **DomoNote** to your Applications folder
3. Launch **DomoNote** — if macOS blocks it, run:
   ```bash
   xattr -cr /Applications/DomoNote.app
   ```
4. DomoNote will automatically detect and set up Ollama on first launch

### Linux

Linux users run DomoNote from source (see [Clone & Run](#-clone--run-locally) below) or use the web version at your Vercel deployment.

---

## 🤖 Local AI Setup (Ollama)

DomoNote's AI features run entirely on your device using **Ollama**. On first launch, DomoNote will automatically:

1. Check if Ollama is installed and running
2. If not found — guide you through downloading and installing it
3. Download the default AI model (`qwen2.5:3b`, ~2 GB)
4. Mark setup complete — you'll never see the setup screen again

> **No API key. No subscription. No internet required for AI after setup.**

### Manual Ollama Setup (if needed)

If the automatic flow doesn't work, install Ollama manually:

**macOS / Linux:**
```bash
curl -fsSL https://ollama.com/install.sh | sh
ollama pull qwen2.5:3b
```

**Windows (PowerShell):**
```powershell
# Download from https://ollama.com/download/OllamaSetup.exe
# Then open a new terminal and run:
ollama pull qwen2.5:3b
```

After installing Ollama, open DomoNote → Settings → **Setup / Repair AI** to re-run the setup flow.

### Supported AI Models

DomoNote works with any Ollama model. Recommended models by hardware:

| Hardware | Recommended Model | VRAM / RAM |
|----------|------------------|------------|
| Any (default) | `qwen2.5:3b` | ~4 GB |
| 8 GB RAM | `llama3.2:3b` | ~4 GB |
| 16 GB RAM | `gemma2:9b` | ~8 GB |
| 24+ GB VRAM | `llama3.1:70b` | ~48 GB |

Change the model in **Settings → AI Engine → Models Catalog**.

---

## 🔁 Clone & Run Locally

For developers or anyone who wants to run from source.

### Prerequisites

| Tool | Version | Install |
|------|---------|---------|
| **Node.js** | 18 or later | [nodejs.org](https://nodejs.org) |
| **npm** | 9 or later | Included with Node |
| **Git** | Any | [git-scm.com](https://git-scm.com) |
| **Ollama** | Latest | [ollama.com](https://ollama.com) |

---

### Option A — Automated Start Script (Recommended)

The start script handles everything: dependency check, Ollama verification, and launching the app.

**macOS / Linux:**
```bash
git clone https://github.com/darknecrocities/DomoNote.git
cd DomoNote
chmod +x start.sh
./start.sh
```

**Windows (Command Prompt):**
```cmd
git clone https://github.com/darknecrocities/DomoNote.git
cd DomoNote
scripts\setup-windows.bat
```

**Cross-platform (npm):**
```bash
git clone https://github.com/darknecrocities/DomoNote.git
cd DomoNote
npm start
```

The script will:
- Verify Node.js and npm versions
- Install dependencies if not present
- Check if Ollama is running and start it if needed
- Open DomoNote at `http://localhost:5176`

---

### Option B — Manual Step-by-Step

```bash
# 1. Clone the repository
git clone https://github.com/darknecrocities/DomoNote.git
cd DomoNote

# 2. Install dependencies
npm install

# 3. Start the development server
npm run dev
```

Open your browser at **[http://localhost:5176](http://localhost:5176)**

> On first launch, DomoNote will detect Ollama and walk you through the AI model setup automatically.

---

### All Available Scripts

```bash
npm run dev           # Start development server (hot reload)
npm run build         # Build for production (outputs to /dist)
npm run preview       # Preview the production build locally
npm run test          # Run unit and integration tests (Vitest)
npm run setup:ollama  # Run the Ollama setup shell script directly
npm start             # Cross-platform: install deps + start dev server
npm run build:windows # Build Windows native installer (.EXE)
```

---

## 🌐 Deploy to Vercel

DomoNote is a fully static Single Page Application — no backend required.

```bash
# 1. Fork or clone the repository to your GitHub account

# 2. Go to vercel.com → New Project → Import your repo

# 3. Vercel settings:
#    Framework Preset: Vite
#    Build Command:    npm run build
#    Output Directory: dist

# 4. Click Deploy
```

When accessed from a local machine, DomoNote seamlessly connects to Ollama running at `http://localhost:11434`. All note-taking, PDF viewing, meetings, and recording features work in the browser regardless of where it's deployed.

> A `vercel.json` is included in the repository for correct SPA routing rewrites.

---

## 🧩 Chrome Extension

Capture Google Meet audio and browser tab audio directly into DomoNote.

**Install from source:**
1. Open Chrome → navigate to `chrome://extensions`
2. Enable **Developer mode** (toggle in top-right)
3. Click **Load unpacked**
4. Select the `/browser-extension` folder from this repository
5. The DomoNote puzzle-piece icon will appear in your Chrome toolbar

**Usage:**
- Join a Google Meet call
- Click the DomoNote extension icon in the toolbar
- Audio streams directly into your active Meeting Secretary session

> The extension requires DomoNote to be open in another tab.

---

## 🐍 Optional: Local Companion (Advanced)

The Local Companion is a Python FastAPI service that unlocks advanced desktop features:
- 🎙️ **Faster-Whisper** — higher accuracy transcription
- 🖥️ **Desktop screen capture** — captures real desktop windows (not just browser tabs)
- ⚡ **Ollama lifecycle proxy** — auto-starts Ollama service

```bash
# Navigate to the companion directory
cd local-companion

# Create and activate a virtual environment
python3 -m venv venv
source venv/bin/activate        # macOS / Linux
# venv\Scripts\activate.bat     # Windows

# Install Python dependencies
pip install -r requirements.txt

# Start the companion service
uvicorn main:app --host 127.0.0.1 --port 8765 --reload
```

The companion runs at `http://localhost:8765` and is automatically detected by DomoNote.

---

## 🗂️ Project Structure

```
DomoNote/
├── src/
│   ├── components/         # Reusable UI components
│   │   ├── ai-workspace/   # AI chat + context selector
│   │   ├── documents/      # PDF viewer + annotation layer
│   │   ├── layout/         # Sidebar, topbar, app layout
│   │   ├── meetings/       # Audio recorder, transcript
│   │   ├── ollama/         # Ollama setup flow wizard
│   │   ├── operations/     # Screen capture + manual builder
│   │   ├── ui/             # Buttons, modals, empty states
│   │   └── updates/        # Update banner
│   ├── context/            # React context providers (AI, workspace)
│   ├── services/
│   │   ├── ai/             # Ollama API, RAG, model detection, setup
│   │   ├── audio/          # Speech transcriber
│   │   ├── documents/      # PDF/DOCX/PPTX parser
│   │   ├── export/         # JSON, PDF, Markdown export
│   │   └── updates/        # GitHub Releases update checker
│   ├── views/              # Top-level page views
│   ├── db.ts               # Dexie IndexedDB schema
│   ├── types.ts            # TypeScript type definitions
│   └── App.tsx             # Root app component
├── browser-extension/      # Chrome extension source
├── local-companion/        # Python FastAPI companion service
├── scripts/                # Build + setup automation scripts
├── public/                 # Static assets
├── index.html
├── vite.config.ts
├── tailwind.config.js
└── package.json
```

---

## 🔒 Privacy

| Data | Where it lives |
|------|---------------|
| Notes, meetings, documents | Browser IndexedDB — your device only |
| AI prompts & responses | Sent to local Ollama (`localhost:11434`) only |
| Audio recordings | Processed in-browser, stored in IndexedDB |
| Analytics / telemetry | ❌ None — zero third-party tracking |

DomoNote contains **no external analytics, no tracking pixels, no CDN-loaded scripts**. Everything runs from your local files or your self-hosted deployment.

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| UI Framework | React 18 + TypeScript 5 |
| Build Tool | Vite 6 |
| Styling | Tailwind CSS 3 |
| Local Storage | Dexie (IndexedDB) |
| AI Runtime | Ollama REST API |
| PDF Rendering | PDF.js |
| Audio | Web Audio API + MediaRecorder |
| Document Parsing | Mammoth (.docx), JSZip (.pptx), PDF.js |
| Markdown | react-markdown + remark-gfm |
| Security | DOMPurify (XSS sanitization) |
| Testing | Vitest |
| Deployment | Vercel (static SPA) |

---

## 🐛 Troubleshooting

### "Local AI Offline" on startup

1. Open **Settings → Local AI → Setup / Repair AI**
2. Follow the guided setup wizard
3. Or run manually:
   ```bash
   ollama serve          # Start the Ollama service
   ollama pull qwen2.5:3b  # Download the default model
   ```

### Ollama CORS error (browser can't reach localhost:11434)

```bash
# Set OLLAMA_ORIGINS to allow browser access
OLLAMA_ORIGINS="*" ollama serve

# Or on Windows (PowerShell):
$env:OLLAMA_ORIGINS="*"; ollama serve
```

### macOS: "DomoNote can't be opened because it's from an unidentified developer"

```bash
xattr -cr /Applications/DomoNote.app
```

### Port conflict (5176 already in use)

```bash
# Find what's using the port
lsof -i :5176

# Start dev server on a different port
npm run dev -- --port 3000
```

### PDF not rendering

- Make sure the file is a valid PDF (not password-protected)
- Maximum file size: **80 MB**
- Supported formats: PDF, DOCX, PPTX, TXT, Markdown

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feat/your-feature`
3. Commit your changes: `git commit -m 'feat: add your feature'`
4. Push to your fork: `git push origin feat/your-feature`
5. Open a Pull Request

Please follow the existing code style (TypeScript strict, Tailwind dark/light mode variants on all UI elements).

---

## 📋 Changelog

See [GitHub Releases](https://github.com/darknecrocities/DomoNote/releases) for the full version history.

---

## 📄 License

**MIT License** — see [LICENSE](LICENSE) for details.

Free to use, modify, and distribute. Attribution appreciated but not required.

---

<div align="center">

Made with ❤️ by [darknecrocities](https://github.com/darknecrocities)

**[⭐ Star on GitHub](https://github.com/darknecrocities/DomoNote)** · **[📦 Download Latest](https://github.com/darknecrocities/DomoNote/releases/latest)** · **[🐛 Report a Bug](https://github.com/darknecrocities/DomoNote/issues)**

</div>
