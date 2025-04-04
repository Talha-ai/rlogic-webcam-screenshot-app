const { ipcRenderer } = require('electron');

let video;
let statusMessage;

// Initialize webcam when the page loads
document.addEventListener('DOMContentLoaded', () => {
  video = document.getElementById('webcam');
  statusMessage = document.getElementById('status-message');

  // Initialize webcam
  initializeWebcam();

  // Set up screenshot button
  document.getElementById('screenshot-btn').addEventListener('click', () => {
    takeScreenshot();
  });

  // Listen for screenshot command from main process
  ipcRenderer.on('take-screenshot', () => {
    takeScreenshot();
  });

  // Listen for screenshot save confirmation
  ipcRenderer.on('screenshot-saved', (event, filePath) => {
    showStatus(`Screenshot saved to: ${filePath}`, 'success');
  });
});

// Initialize the webcam stream
function initializeWebcam() {
  const constraints = {
    video: {
      width: { ideal: 1920 },
      height: { ideal: 1080 }
    }
  };
  navigator.mediaDevices.getUserMedia(constraints)
    .then((stream) => {
      video.srcObject = stream;
    })
    .catch((error) => {
      console.error('Error accessing webcam:', error);
      showStatus('Error accessing webcam. Please check permissions.', 'error');
    });
}

// Take a screenshot from the webcam
function takeScreenshot() {
  if (!video || !video.srcObject) {
    showStatus('Webcam not available', 'error');
    return;
  }

  // Create a canvas to capture the video frame
  const canvas = document.createElement('canvas');
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  // Draw the current video frame to the canvas
  const context = canvas.getContext('2d');
  context.drawImage(video, 0, 0, canvas.width, canvas.height);

  // Convert the canvas to a data URL (PNG image)
  const imageData = canvas.toDataURL('image/png');

  // Send the image data to the main process to save
  ipcRenderer.send('screenshot-taken', imageData);

  showStatus('Taking screenshot...', 'info');
}

// Display status messages
function showStatus(message, type) {
  statusMessage.textContent = message;
  statusMessage.className = `status ${type}`;

  // Clear the status message after 5 seconds
  setTimeout(() => {
    statusMessage.textContent = '';
    statusMessage.className = 'status';
  }, 5000);
}