// DomoNote Content Script Bridge & Meeting Capture

(function () {
  if (window.__domonote_injected) return;
  window.__domonote_injected = true;

  // Mark page as extension connected
  const marker = document.createElement('div');
  marker.id = 'domonote-extension-marker';
  marker.style.display = 'none';
  document.documentElement.appendChild(marker);

  // Listen to ping messages from DomoNote Web App
  window.addEventListener('message', (event) => {
    if (event.data?.type === 'DOMONOTE_PING') {
      window.postMessage({ type: 'DOMONOTE_PONG', source: 'domonote-extension', version: '1.0.0' }, '*');
    }
  });

  // Google Meet integration button
  if (window.location.hostname === 'meet.google.com') {
    function injectDomoNoteButton() {
      if (document.getElementById('domonote-meet-btn')) return;

      const bar = document.createElement('div');
      bar.id = 'domonote-meet-btn';
      bar.style.position = 'fixed';
      bar.style.bottom = '80px';
      bar.style.left = '24px';
      bar.style.zIndex = '99999';
      bar.style.backgroundColor = '#0a0a0a';
      bar.style.color = '#ffffff';
      bar.style.border = '1px solid #27272a';
      bar.style.borderRadius = '8px';
      bar.style.padding = '8px 14px';
      bar.style.fontSize = '12px';
      bar.style.fontWeight = '600';
      bar.style.fontFamily = 'Inter, system-ui, sans-serif';
      bar.style.cursor = 'pointer';
      bar.style.display = 'flex';
      bar.style.alignItems = 'center';
      bar.style.gap = '8px';
      bar.style.boxShadow = '0 4px 12px rgba(0,0,0,0.5)';
      bar.style.transition = 'all 0.15s ease';

      const dot = document.createElement('span');
      dot.style.width = '8px';
      dot.style.height = '8px';
      dot.style.borderRadius = '50%';
      dot.style.backgroundColor = '#10b981';

      const text = document.createElement('span');
      text.textContent = 'DomoNote: Capture Meeting';

      bar.appendChild(dot);
      bar.appendChild(text);

      bar.addEventListener('mouseenter', () => {
        bar.style.backgroundColor = '#18181b';
        bar.style.borderColor = '#3f3f46';
      });

      bar.addEventListener('mouseleave', () => {
        bar.style.backgroundColor = '#0a0a0a';
        bar.style.borderColor = '#27272a';
      });

      bar.addEventListener('click', () => {
        window.open('http://localhost:5173/?view=meetings&mode=record', '_blank');
      });

      document.body.appendChild(bar);
    }

    if (document.readyState === 'complete' || document.readyState === 'interactive') {
      setTimeout(injectDomoNoteButton, 2000);
    } else {
      window.addEventListener('DOMContentLoaded', () => {
        setTimeout(injectDomoNoteButton, 2000);
      });
    }
  }
})();
