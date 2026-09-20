// DomoNote Extension Background Service Worker (Manifest V3)

chrome.runtime.onInstalled.addListener(() => {
  console.log('[DomoNote] Extension installed and ready.');

  // Context Menus
  if (chrome.contextMenus) {
    chrome.contextMenus.create({
      id: 'domonote-summarize-selection',
      title: 'Summarize with DomoNote AI',
      contexts: ['selection'],
    });

    chrome.contextMenus.create({
      id: 'domonote-add-note',
      title: 'Save to DomoNote Quick Notes',
      contexts: ['selection'],
    });
  }
});

// Handle Context Menu clicks
if (chrome.contextMenus) {
  chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === 'domonote-add-note' && info.selectionText) {
      chrome.storage.local.get(['notes'], (res) => {
        const notes = res.notes || [];
        notes.unshift({
          id: 'note_' + Date.now(),
          title: (info.selectionText.slice(0, 30) + '...'),
          content: info.selectionText,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });
        chrome.storage.local.set({ notes });
      });
    }
  });
}

// Side Panel behavior configuration (if supported)
if (chrome.sidePanel && chrome.sidePanel.setPanelBehavior) {
  chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: false }).catch(() => {});
}

// Listen for messages from web pages or popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'DOMONOTE_CHECK_STATUS') {
    sendResponse({ status: 'active', version: '1.0.0' });
    return true;
  }
});
