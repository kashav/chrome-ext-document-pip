import packageData from '../../package.json'

console.log('background is running')

const CONTEXT_MENU_ID = `picture-in-picture@${packageData.version}`

chrome.runtime.onInstalled.addListener(async () => {
  chrome.contextMenus.create({
    id: CONTEXT_MENU_ID,
    title: 'Show in picture-in-picture',
    type: 'normal',
    contexts: ['all'],
  })
})

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (tab?.id) {
    chrome.tabs.sendMessage(tab.id, "CONTEXT_MENU_CLICKED", {frameId: info.frameId}, response => {
      console.log(response);
    });
  }
})
