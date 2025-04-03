// preload.js
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  takeScreenshot: () => ipcRenderer.send('take-screenshot'),
  sendScreenshotData: (imageData) => ipcRenderer.send('screenshot-taken', imageData),
  onScreenshotSaved: (callback) => {
    // We need to wrap the callback to ensure the event argument is handled properly
    ipcRenderer.on('screenshot-saved', (event, ...args) => callback(...args));
  }
});