// DomoNote Extension Background Service Worker (Manifest V3)
// Handles: context menus, side-panel, tab capture relay, message routing

chrome.runtime.onInstalled.addListener(() => {
  console.log('[DomoNote] Extension v2.0 installed and ready.');
  enableSidePanelOnAction();

  if (chrome.contextMenus) {
    chrome.contextMenus.create({
      id: 'domonote-summarize-selection',
      title: 'Summarize with DomoNote AI (local)',
      contexts: ['selection'],
    });
    chrome.contextMenus.create({
      id: 'domonote-add-note',
      title: 'Save to DomoNote Quick Notes',
      contexts: ['selection'],
    });
    chrome.contextMenus.create({
      id: 'domonote-start-meeting',
      title: 'Start DomoNote Meeting Recording',
      contexts: ['page'],
    });
  }
});

// Context menu actions
if (chrome.contextMenus) {
  chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === 'domonote-add-note' && info.selectionText) {
      chrome.storage.local.get(['notes'], (res) => {
        const notes = res.notes || [];
        notes.unshift({
          id: 'note_' + Date.now(),
          title: info.selectionText.slice(0, 40) + '...',
          content: info.selectionText,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });
        chrome.storage.local.set({ notes });
      });
    }

    if (info.menuItemId === 'domonote-start-meeting' && tab?.id) {
      // Inject meeting HUD into the active tab
      chrome.tabs.sendMessage(tab.id, { type: 'DOMO_OPEN_MEETING_HUD' });
    }
  });
}

// Side panel behavior: Open side panel docked on the right when the extension action icon is clicked
function enableSidePanelOnAction() {
  if (chrome.sidePanel?.setPanelBehavior) {
    chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true }).catch(() => {});
  }
}
enableSidePanelOnAction();

if (chrome.action?.onClicked) {
  chrome.action.onClicked.addListener(async (tab) => {
    try {
      if (chrome.sidePanel?.open && tab?.windowId) {
        await chrome.sidePanel.open({ windowId: tab.windowId });
      }
    } catch (e) {
      console.warn('[DomoNote] Side panel open triggered:', e);
    }
  });
}

// Message routing
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  // Status check
  if (request.type === 'DOMONOTE_CHECK_STATUS') {
    sendResponse({ status: 'active', version: '2.0.0' });
    return true;
  }

  // Relay: open meeting HUD on specified tab (or current tab)
  if (request.type === 'DOMO_OPEN_MEETING_HUD') {
    const targetTabId = request.tabId;
    if (targetTabId) {
      chrome.tabs.sendMessage(targetTabId, { type: 'DOMO_OPEN_MEETING_HUD' });
    } else {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]?.id) {
          chrome.tabs.sendMessage(tabs[0].id, { type: 'DOMO_OPEN_MEETING_HUD' });
        }
      });
    }
    sendResponse({ ok: true });
    return true;
  }

  // Retrieve saved meetings
  if (request.type === 'DOMO_GET_MEETINGS') {
    chrome.storage.local.get(['domo_meetings'], (res) => {
      sendResponse({ meetings: res.domo_meetings || [] });
    });
    return true; // async
  }

  // Save meeting from content script (backup path)
  if (request.type === 'DOMO_SAVE_MEETING') {
    chrome.storage.local.get(['domo_meetings'], (res) => {
      const meetings = res.domo_meetings || [];
      meetings.unshift(request.data);
      chrome.storage.local.set({ domo_meetings: meetings.slice(0, 50) });
      sendResponse({ ok: true });
    });
    return true;
  }

  // Relay live meeting roster / active speaker across tabs
  if (request.type === 'DOMO_MEETING_SYNC') {
    chrome.storage.local.set({ domo_live_meeting_roster: request.data });
    // Broadcast to all tabs so DomoNote web app receives it
    chrome.tabs.query({}, (tabs) => {
      tabs.forEach((tab) => {
        if (tab.id && tab.id !== sender?.tab?.id) {
          chrome.tabs.sendMessage(tab.id, {
            type: 'DOMONOTE_MEETING_PARTICIPANTS',
            ...request.data,
          }).catch(() => {});
        }
      });
    });
    sendResponse({ ok: true });
    return true;
  }

  // Get current live meeting roster
  if (request.type === 'DOMO_GET_LIVE_MEETING') {
    chrome.storage.local.get(['domo_live_meeting_roster'], (res) => {
      sendResponse({ roster: res.domo_live_meeting_roster || null });
    });
    return true;
  }
});
