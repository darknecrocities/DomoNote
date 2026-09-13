// DomoNote Extension Background Service Worker

chrome.runtime.onInstalled.addListener(() => {
  console.log('[DomoNote] Browser extension installed');
});

chrome.action.onClicked.addListener((tab) => {
  chrome.tabs.create({ url: 'http://localhost:5173' });
});
