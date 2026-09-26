# DomoNote Security Policy & Defense-in-Depth Specification

## 1. Security Architecture Principles

DomoNote enforces a multi-tiered **Defense-in-Depth** model to guarantee user data sovereignty, eliminate attack surfaces, and defend against network and client-side exploits:

- **Zero Remote Storage by Default**: Notes, transcripts, audio recordings, uploaded PDFs, and screenshots remain strictly in the user's browser IndexedDB (`DomoNoteDB`). No cloud account or server database is required.
- **Safe Content Rendering**: All Markdown rendering enforces DOMPurify sanitization. External URLs and links are validated against safe schemes (`http`, `https`, `mailto`).
- **First-Party Asset Isolation**: All core dependencies—including the PDF.js web worker—are bundled locally as first-party assets rather than loaded from third-party CDNs, eliminating supply-chain tampering and CDN outages.
- **Strict Network Isolation**: Outbound network requests from the web client target strictly localhost (`127.0.0.1:11434` for Ollama, `127.0.0.1:8765` for companion, `127.0.0.1:5892` for desktop assets) and pre-configured Firebase metric endpoints.
- **Principle of Least Privilege**:
  - The Chrome browser extension scopes permissions strictly to verified meeting domains (`meet.google.com`, `teams.microsoft.com`, `zoom.us`, `meet.jit.si`) and local development ports.
  - Native desktop shells restrict microphone and camera permissions strictly to `localhost` and `127.0.0.1`.

---

## 2. Layered Defense Specifications

### Layer 1: Edge & Network Security (Anti-DDoS & Cloud Protection)
- **Static Hosting & WAF**: Deployed as an immutable static Single Page Application (SPA) behind edge networks (Vercel / Cloudflare) to absorb L3/L4 volumetric DDoS.
- **Firestore Schema & Anti-DoS Rules (`firestore.rules`)**: Public metrics updates (`stats/global`) are strictly constrained: only non-negative delta increments are permitted, deletions are denied, and field modifications are restricted to avoid Denial-of-Wallet billing attacks.

### Layer 2: Web Client & Browser Sandbox
- **Content Security Policy (CSP)**: Enforces `default-src 'self'`, `frame-ancestors 'none'`, and blocks unauthorized remote scripts, media sources, and connections.
- **Clickjacking Protection**: `X-Frame-Options: DENY` is sent on all web responses.
- **PostMessage Origin Validation**: Audio and extension event listeners verify `event.origin` against `window.location.origin` and authorized extension IDs before processing payloads.

### Layer 3: Local Services & IPC Hardening
- **Path Traversal Prevention**: Local static servers (`desktop/windows/StaticServer.cs`) canonicalize requested paths using `Path.GetFullPath` and enforce strict root directory boundary checks.
- **Origin-Gated Local Server CORS**: Local HTTP servers drop wildcard `*` CORS headers and reject non-loopback cross-origin requests.
- **Safe File Sinks**: Local companion transcription services process audio files through isolated system temporary handles (`tempfile.NamedTemporaryFile`) rather than raw user-supplied filenames.

### Layer 4: Native Desktop Shells (macOS & Windows)
- **External Navigation Trapping**: Any clicks on external URLs inside notes or chat sessions are intercepted and launched in the user's default operating system browser (`NSWorkspace.shared.open` / `Process.Start`), preventing untrusted code from running inside the desktop application context.
- **Origin-Gated Media Grants**: macOS `WKWebView` and Windows `CoreWebView2` permission handlers verify that `origin.host` is `127.0.0.1` or `localhost` before granting microphone or clipboard permissions.

---

## 3. Reporting Vulnerabilities

If you discover a security vulnerability or exploit in DomoNote:
1. Please report it privately via email or private GitHub Security Advisories rather than opening a public issue.
2. Maintainers will review, verify, and remediate all reported issues in accordance with our disclosure policy.

