document.getElementById('open-app-btn').addEventListener('click', () => {
  chrome.tabs.create({ url: 'http://localhost:5173' });
});
