// DomoNote Extension Standalone Workspace Controller
// Enables full DomoNote features (Notes, Meetings, Ollama AI, Screen Capture, Docs) without opening the main app.

document.addEventListener('DOMContentLoaded', () => {
  // Safe Storage wrapper (chrome.storage.local with localStorage fallback)
  const storage = {
    get: (keys, cb) => {
      if (typeof chrome !== 'undefined' && chrome.storage?.local) {
        chrome.storage.local.get(keys, cb);
      } else {
        const res = {};
        const keyList = Array.isArray(keys) ? keys : [keys];
        keyList.forEach(k => {
          const val = localStorage.getItem('domonote_' + k);
          if (val) {
            try { res[k] = JSON.parse(val); } catch { res[k] = val; }
          }
        });
        cb(res);
      }
    },
    set: (items, cb) => {
      if (typeof chrome !== 'undefined' && chrome.storage?.local) {
        chrome.storage.local.set(items, cb);
      } else {
        Object.entries(items).forEach(([k, v]) => {
          localStorage.setItem('domonote_' + k, JSON.stringify(v));
        });
        if (cb) cb();
      }
    },
    clear: (cb) => {
      if (typeof chrome !== 'undefined' && chrome.storage?.local) {
        chrome.storage.local.clear(cb);
      } else {
        localStorage.clear();
        if (cb) cb();
      }
    }
  };

  // Toast Notification
  const showToast = (msg, duration = 2500) => {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.textContent = msg;
    toast.style.display = 'block';
    setTimeout(() => {
      toast.style.display = 'none';
    }, duration);
  };

  // --- TAB NAVIGATION ---
  const tabButtons = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');

  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const tabId = btn.getAttribute('data-tab');
      tabButtons.forEach(b => b.classList.remove('active'));
      tabContents.forEach(c => c.classList.remove('active'));

      btn.classList.add('active');
      const targetContent = document.getElementById(`tab-${tabId}`);
      if (targetContent) targetContent.classList.add('active');
    });
  });

  // Launch Full Desktop / Web Workspace
  document.getElementById('open-full-app-btn')?.addEventListener('click', () => {
    const url = 'http://localhost:5173';
    if (typeof chrome !== 'undefined' && chrome.tabs?.create) {
      chrome.tabs.create({ url });
    } else {
      window.open(url, '_blank');
    }
  });

  // --- 1. NOTES MODULE ---
  let notes = [];
  let currentNoteId = null;

  const notesListEl = document.getElementById('notes-list');
  const noteTitleEl = document.getElementById('note-title');
  const noteContentEl = document.getElementById('note-content');
  const noteWordCountEl = document.getElementById('note-word-count');
  const noteSearchEl = document.getElementById('note-search');

  const updateWordCount = (text) => {
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    if (noteWordCountEl) noteWordCountEl.textContent = `${words} words`;
  };

  const renderNotesList = (filter = '') => {
    if (!notesListEl) return;
    notesListEl.innerHTML = '';

    const filtered = notes.filter(n =>
      (n.title || '').toLowerCase().includes(filter.toLowerCase()) ||
      (n.content || '').toLowerCase().includes(filter.toLowerCase())
    );

    if (filtered.length === 0) {
      notesListEl.innerHTML = '<div style="font-size: 10px; color: #71717a; padding: 8px;">No notes found</div>';
      return;
    }

    filtered.forEach(note => {
      const item = document.createElement('div');
      item.className = `note-item ${note.id === currentNoteId ? 'active' : ''}`;
      item.innerHTML = `
        <div class="note-title">${note.title || 'Untitled Note'}</div>
        <div class="note-meta">${new Date(note.updatedAt || Date.now()).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>
      `;
      item.addEventListener('click', () => selectNote(note.id));
      notesListEl.appendChild(item);
    });

    const statEl = document.getElementById('stat-notes-count');
    if (statEl) statEl.textContent = notes.length.toString();
  };

  const selectNote = (id) => {
    currentNoteId = id;
    const note = notes.find(n => n.id === id);
    if (!note) return;

    if (noteTitleEl) noteTitleEl.value = note.title || '';
    if (noteContentEl) noteContentEl.value = note.content || '';
    updateWordCount(note.content || '');
    renderNotesList(noteSearchEl?.value || '');
  };

  const saveCurrentNote = () => {
    if (!currentNoteId) return;
    const note = notes.find(n => n.id === currentNoteId);
    if (!note) return;

    note.title = noteTitleEl?.value || 'Untitled Note';
    note.content = noteContentEl?.value || '';
    note.updatedAt = Date.now();

    storage.set({ notes }, () => {
      renderNotesList(noteSearchEl?.value || '');
    });
  };

  const createNewNote = (initialTitle = 'New Note', initialContent = '') => {
    const newNote = {
      id: 'note_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      title: initialTitle,
      content: initialContent,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    notes.unshift(newNote);
    currentNoteId = newNote.id;
    storage.set({ notes }, () => {
      selectNote(newNote.id);
      showToast('New note created');
    });
  };

  document.getElementById('btn-new-note')?.addEventListener('click', () => createNewNote());

  noteTitleEl?.addEventListener('input', () => {
    saveCurrentNote();
  });

  noteContentEl?.addEventListener('input', () => {
    updateWordCount(noteContentEl.value);
    saveCurrentNote();
  });

  noteSearchEl?.addEventListener('input', (e) => {
    renderNotesList(e.target.value);
  });

  document.getElementById('btn-copy-note')?.addEventListener('click', () => {
    if (!noteContentEl) return;
    navigator.clipboard.writeText(noteContentEl.value);
    showToast('Markdown copied to clipboard!');
  });

  document.getElementById('btn-delete-note')?.addEventListener('click', () => {
    if (!currentNoteId) return;
    notes = notes.filter(n => n.id !== currentNoteId);
    currentNoteId = notes.length > 0 ? notes[0].id : null;
    storage.set({ notes }, () => {
      if (currentNoteId) {
        selectNote(currentNoteId);
      } else {
        if (noteTitleEl) noteTitleEl.value = '';
        if (noteContentEl) noteContentEl.value = '';
        updateWordCount('');
        renderNotesList();
      }
      showToast('Note deleted');
    });
  });

  // Load notes initially
  storage.get(['notes'], (res) => {
    notes = res.notes || [];
    if (notes.length === 0) {
      createNewNote('Welcome to DomoNote', '# DomoNote AI Secretary\n\nYour notes, voice transcripts, and summaries are saved completely offline in local storage.\n\n- Powered by local Ollama AI\n- Real-time dictation\n- Tab screen capture');
    } else {
      selectNote(notes[0].id);
    }
  });

  // --- 2. OLLAMA HEALTH & MODEL SYNC ---
  const aiStatusDot = document.getElementById('ai-status-dot');
  const aiStatusText = document.getElementById('ai-status-text');
  const modelSelectEl = document.getElementById('model-select');

  const checkOllamaHealth = async () => {
    try {
      const res = await fetch('http://localhost:11434/api/tags', { method: 'GET' });
      if (res.ok) {
        const data = await res.json();
        if (aiStatusDot) aiStatusDot.className = 'status-dot online';
        if (aiStatusText) aiStatusText.textContent = 'AI: Online';

        if (modelSelectEl && Array.isArray(data.models) && data.models.length > 0) {
          const currentVal = modelSelectEl.value;
          modelSelectEl.innerHTML = '';
          data.models.forEach(m => {
            const opt = document.createElement('option');
            opt.value = m.name;
            opt.textContent = m.name;
            modelSelectEl.appendChild(opt);
          });
          if (data.models.some(m => m.name === currentVal)) {
            modelSelectEl.value = currentVal;
          }
        }
        return true;
      }
    } catch {
      // Offline fallback
    }
    if (aiStatusDot) aiStatusDot.className = 'status-dot';
    if (aiStatusText) aiStatusText.textContent = 'AI: Offline';
    return false;
  };

  checkOllamaHealth();
  setInterval(checkOllamaHealth, 10000);

  // --- 3. MEETINGS & VOICE DICTATION MODULE ---
  let isRecording = false;
  let recordStartTime = 0;
  let recordTimerInterval = null;
  let mediaStream = null;
  let audioCtx = null;
  let analyser = null;
  let animId = null;
  let recognition = null;

  const recordBtn = document.getElementById('btn-record-toggle');
  const recordTimerEl = document.getElementById('record-timer');
  const transcriptEl = document.getElementById('meeting-transcript');
  const audioCanvas = document.getElementById('audio-canvas');
  const canvasCtx = audioCanvas?.getContext('2d');

  const drawWaveform = () => {
    if (!analyser || !canvasCtx || !audioCanvas) return;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyser.getByteTimeDomainData(dataArray);

    canvasCtx.fillStyle = '#09090b';
    canvasCtx.fillRect(0, 0, audioCanvas.width, audioCanvas.height);

    canvasCtx.lineWidth = 2;
    canvasCtx.strokeStyle = '#10b981';
    canvasCtx.beginPath();

    const sliceWidth = audioCanvas.width / bufferLength;
    let x = 0;

    for (let i = 0; i < bufferLength; i++) {
      const v = dataArray[i] / 128.0;
      const y = (v * audioCanvas.height) / 2;

      if (i === 0) canvasCtx.moveTo(x, y);
      else canvasCtx.lineTo(x, y);

      x += sliceWidth;
    }

    canvasCtx.lineTo(audioCanvas.width, audioCanvas.height / 2);
    canvasCtx.stroke();

    animId = requestAnimationFrame(drawWaveform);
  };

  const startRecording = async () => {
    try {
      mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const source = audioCtx.createMediaStreamSource(mediaStream);
      analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);

      if (audioCanvas) {
        audioCanvas.width = audioCanvas.clientWidth || 300;
        audioCanvas.height = audioCanvas.clientHeight || 48;
      }
      drawWaveform();

      // Speech Recognition
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onresult = (event) => {
          let currentTranscript = '';
          for (let i = 0; i < event.results.length; i++) {
            currentTranscript += event.results[i][0].transcript + ' ';
          }
          if (transcriptEl) transcriptEl.value = currentTranscript.trim();
        };

        recognition.start();
      }

      isRecording = true;
      recordStartTime = Date.now();
      if (recordBtn) {
        recordBtn.textContent = '■ Stop Recording';
        recordBtn.className = 'btn btn-secondary';
      }

      recordTimerInterval = setInterval(() => {
        const elapsedSec = Math.floor((Date.now() - recordStartTime) / 1000);
        const mins = String(Math.floor(elapsedSec / 60)).padStart(2, '0');
        const secs = String(elapsedSec % 60).padStart(2, '0');
        if (recordTimerEl) recordTimerEl.textContent = `${mins}:${secs}`;
      }, 1000);

      showToast('Recording started with live transcript');
    } catch (err) {
      console.warn('Microphone error', err);
      showToast('Microphone access denied or unavailable');
    }
  };

  const stopRecording = () => {
    isRecording = false;
    clearInterval(recordTimerInterval);
    if (recordBtn) {
      recordBtn.textContent = '● Start Recording';
      recordBtn.className = 'btn btn-danger';
    }

    if (mediaStream) {
      mediaStream.getTracks().forEach(t => t.stop());
      mediaStream = null;
    }
    if (audioCtx) {
      audioCtx.close();
      audioCtx = null;
    }
    if (animId) cancelAnimationFrame(animId);
    if (recognition) {
      recognition.stop();
      recognition = null;
    }

    showToast('Recording stopped. Ready to synthesize.');
  };

  recordBtn?.addEventListener('click', () => {
    if (!isRecording) startRecording();
    else stopRecording();
  });

  // AI Meeting Summary Generator
  document.getElementById('btn-summarize-meeting')?.addEventListener('click', async () => {
    const text = transcriptEl?.value || '';
    if (!text.trim()) {
      showToast('No transcript text available to summarize.');
      return;
    }

    const summaryBox = document.getElementById('meeting-summary-box');
    const summaryText = document.getElementById('meeting-summary-text');
    if (summaryBox) summaryBox.style.display = 'block';
    if (summaryText) summaryText.textContent = 'Synthesizing meeting summary with local Ollama AI...';

    const selectedModel = modelSelectEl?.value || 'llama3.2';

    try {
      const res = await fetch('http://localhost:11434/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: selectedModel,
          prompt: `You are an expert executive AI secretary. Summarize the following meeting transcript into:
1. Executive Overview
2. Key Decisions Made
3. Action Items (with assignees if mentioned)

Transcript:
${text}`,
          stream: false,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (summaryText) summaryText.textContent = data.response || 'Summary generated successfully.';
        showToast('AI meeting summary complete!');
      } else {
        if (summaryText) summaryText.textContent = 'Local Ollama returned an error. Ensure Ollama is running at localhost:11434.';
      }
    } catch {
      if (summaryText) summaryText.textContent = 'Could not reach Ollama at http://localhost:11434. Check that Ollama daemon is active.';
    }
  });

  // Save Transcript as Note
  document.getElementById('btn-save-as-note')?.addEventListener('click', () => {
    const transcript = transcriptEl?.value || '';
    const summary = document.getElementById('meeting-summary-text')?.textContent || '';
    if (!transcript.trim()) {
      showToast('Nothing to save.');
      return;
    }

    const content = `# Meeting Note - ${new Date().toLocaleDateString()}\n\n## Transcript\n${transcript}\n\n${summary ? '## AI Summary\n' + summary : ''}`;
    createNewNote(`Meeting - ${new Date().toLocaleDateString()}`, content);
    // Switch to notes tab
    document.querySelector('.tab-btn[data-tab="notes"]')?.click();
  });

  // --- 4. LOCAL OLLAMA AI SECRETARY CHAT ---
  const chatWindow = document.getElementById('chat-window');
  const chatInput = document.getElementById('chat-input');
  const chatSendBtn = document.getElementById('btn-chat-send');

  const appendChatMessage = (role, text) => {
    if (!chatWindow) return;
    const msg = document.createElement('div');
    msg.className = `chat-msg ${role}`;
    msg.textContent = text;
    chatWindow.appendChild(msg);
    chatWindow.scrollTop = chatWindow.scrollHeight;
    return msg;
  };

  const sendChatMessage = async (promptText) => {
    const text = promptText || chatInput?.value?.trim();
    if (!text) return;

    if (chatInput) chatInput.value = '';
    appendChatMessage('user', text);

    const assistantMsg = appendChatMessage('assistant', 'Thinking...');
    const selectedModel = modelSelectEl?.value || 'llama3.2';

    try {
      const res = await fetch('http://localhost:11434/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: selectedModel,
          prompt: text,
          stream: false,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (assistantMsg) assistantMsg.textContent = data.response || 'Completed.';
      } else {
        if (assistantMsg) assistantMsg.textContent = 'Ollama error. Please check your model name and localhost:11434.';
      }
    } catch {
      if (assistantMsg) assistantMsg.textContent = 'Local Ollama is unreachable. Run `ollama serve` in terminal.';
    }
  };

  chatSendBtn?.addEventListener('click', () => sendChatMessage());
  chatInput?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') sendChatMessage();
  });

  // Prompt Chips
  document.getElementById('chip-summarize-page')?.addEventListener('click', () => {
    if (typeof chrome !== 'undefined' && chrome.tabs?.query) {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]?.id) {
          chrome.scripting.executeScript({
            target: { tabId: tabs[0].id },
            func: () => document.body.innerText.substring(0, 4000),
          }, (results) => {
            const pageText = results?.[0]?.result || '';
            if (pageText) {
              sendChatMessage(`Summarize this webpage content into 3 key bullet points and core takeaway:\n\n${pageText}`);
            } else {
              sendChatMessage('Summarize this page.');
            }
          });
        }
      });
    } else {
      sendChatMessage('Summarize this page.');
    }
  });

  document.getElementById('chip-action-items')?.addEventListener('click', () => {
    sendChatMessage('Extract any action items, deadlines, or deliverables from my recent notes.');
  });

  document.getElementById('chip-polish-text')?.addEventListener('click', () => {
    sendChatMessage('Please polish my writing, correct grammar, and improve conciseness for: ' + (noteContentEl?.value.substring(0, 300) || 'DomoNote private local secretary'));
  });

  document.getElementById('chip-clear-chat')?.addEventListener('click', () => {
    if (chatWindow) {
      chatWindow.innerHTML = '<div class="chat-msg assistant">Chat cleared. Ask me anything!</div>';
    }
  });

  // --- 5. SCREEN STUDIO & CAPTURE MODULE ---
  const captureBtn = document.getElementById('btn-capture-tab');
  const screenshotCanvas = document.getElementById('screenshot-canvas');
  const capturePlaceholder = document.getElementById('capture-placeholder');
  const coordDisplay = document.getElementById('coord-display');
  let currentScreenshot = null;
  let clickedCoords = null;

  captureBtn?.addEventListener('click', () => {
    if (typeof chrome !== 'undefined' && chrome.tabs?.captureVisibleTab) {
      chrome.tabs.captureVisibleTab(null, { format: 'png' }, (dataUrl) => {
        if (chrome.runtime.lastError || !dataUrl) {
          showToast('Capture error: ' + (chrome.runtime.lastError?.message || 'Check tab permission'));
          return;
        }
        loadScreenshotImage(dataUrl);
      });
    } else {
      // Mock / fallback screenshot for testing
      const mockCanvas = document.createElement('canvas');
      mockCanvas.width = 640;
      mockCanvas.height = 360;
      const mctx = mockCanvas.getContext('2d');
      mctx.fillStyle = '#1e293b';
      mctx.fillRect(0, 0, 640, 360);
      mctx.fillStyle = '#ffffff';
      mctx.font = '20px monospace';
      mctx.fillText('DomoNote Studio Preview', 40, 180);
      loadScreenshotImage(mockCanvas.toDataURL());
    }
  });

  const loadScreenshotImage = (dataUrl) => {
    const img = new Image();
    img.onload = () => {
      currentScreenshot = img;
      if (capturePlaceholder) capturePlaceholder.style.display = 'none';
      if (screenshotCanvas) {
        screenshotCanvas.width = img.width;
        screenshotCanvas.height = img.height;
        const sctx = screenshotCanvas.getContext('2d');
        sctx.drawImage(img, 0, 0);
      }
      showToast('Tab captured! Click on an element to outline coordinates.');
    };
    img.src = dataUrl;
  };

  screenshotCanvas?.addEventListener('click', (e) => {
    if (!currentScreenshot || !screenshotCanvas) return;
    const rect = screenshotCanvas.getBoundingClientRect();
    const scaleX = screenshotCanvas.width / rect.width;
    const scaleY = screenshotCanvas.height / rect.height;

    const x = Math.round((e.clientX - rect.left) * scaleX);
    const y = Math.round((e.clientY - rect.top) * scaleY);
    clickedCoords = { x, y };

    if (coordDisplay) {
      coordDisplay.textContent = `Framed Coordinate: [x: ${x}, y: ${y}]`;
      coordDisplay.style.color = '#10b981';
    }

    // Redraw image and target frame
    const sctx = screenshotCanvas.getContext('2d');
    sctx.drawImage(currentScreenshot, 0, 0);

    // Coordinate Box Target Frame
    const boxW = 80;
    const boxH = 40;
    sctx.strokeStyle = '#ef4444';
    sctx.lineWidth = 3;
    sctx.strokeRect(x - boxW / 2, y - boxH / 2, boxW, boxH);

    // Small center crosshair
    sctx.fillStyle = '#ef4444';
    sctx.fillRect(x - 2, y - 2, 4, 4);

    showToast(`Coordinate captured: [x:${x}, y:${y}]`);
  });

  document.getElementById('btn-export-manual')?.addEventListener('click', () => {
    if (!clickedCoords) {
      showToast('Please click a coordinate on the screenshot first.');
      return;
    }
    const manualContent = `## Standard Operating Procedure Step\n\n- **Target Element Box**: [x: ${clickedCoords.x}, y: ${clickedCoords.y}]\n- **Action**: Click target element to perform workflow step.\n- **Timestamp**: ${new Date().toLocaleTimeString()}\n`;
    createNewNote(`SOP Manual Step - [x:${clickedCoords.x}, y:${clickedCoords.y}]`, manualContent);
    document.querySelector('.tab-btn[data-tab="notes"]')?.click();
  });

  // --- 6. DOCUMENT INTELLIGENCE MODULE ---
  const docInput = document.getElementById('doc-input');
  const docQuestion = document.getElementById('doc-question');
  const askDocBtn = document.getElementById('btn-ask-doc');
  const docAnswerBox = document.getElementById('doc-answer-box');
  const docAnswerText = document.getElementById('doc-answer-text');

  askDocBtn?.addEventListener('click', async () => {
    const docText = docInput?.value?.trim() || '';
    const qText = docQuestion?.value?.trim() || '';

    if (!docText) {
      showToast('Please paste document content first.');
      return;
    }

    if (docAnswerBox) docAnswerBox.style.display = 'block';
    if (docAnswerText) docAnswerText.textContent = 'Analyzing document with local Ollama...';

    const selectedModel = modelSelectEl?.value || 'llama3.2';

    try {
      const res = await fetch('http://localhost:11434/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: selectedModel,
          prompt: `Context Document:\n${docText}\n\nQuestion: ${qText || 'Summarize key points'}\n\nAnswer accurately based only on the document.`,
          stream: false,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (docAnswerText) docAnswerText.textContent = data.response || 'Analysis complete.';
      } else {
        if (docAnswerText) docAnswerText.textContent = 'Ollama error during document analysis.';
      }
    } catch {
      if (docAnswerText) docAnswerText.textContent = 'Ollama is offline. Start Ollama to run document analysis.';
    }
  });

  // --- 7. SYNC & BACKUP MODULE ---
  document.getElementById('btn-export-backup')?.addEventListener('click', () => {
    storage.get(null, (allData) => {
      const blob = new Blob([JSON.stringify(allData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `domonote-extension-backup-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast('Backup JSON exported successfully!');
    });
  });

  document.getElementById('btn-clear-all')?.addEventListener('click', () => {
    if (confirm('Clear all extension notes and recordings? This cannot be undone.')) {
      storage.clear(() => {
        notes = [];
        currentNoteId = null;
        renderNotesList();
        if (noteTitleEl) noteTitleEl.value = '';
        if (noteContentEl) noteContentEl.value = '';
        showToast('Extension storage cleared.');
      });
    }
  });
});
