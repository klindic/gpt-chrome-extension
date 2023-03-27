chrome.action.onClicked.addListener((tab) => {
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    files: ["content.js"],
  });
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "saveApiKey") {
    chrome.storage.local.set({ apiKey: request.apiKey }, () => {
      sendResponse({ message: "API key saved" });
    });
  }
  return true;
});
