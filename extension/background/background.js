chrome.runtime.onInstalled.addListener(function (details) {
    chrome.tabs.create({
        url: chrome.extension.getURL("welcome_page/welcome.html"),
        active: true
    });
});
