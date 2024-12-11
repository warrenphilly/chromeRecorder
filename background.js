let mediaRecorder = null;
let recordedChunks = [];

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.action) {
    case 'START_RECORDING':
      startRecording();
      break;
    case 'STOP_RECORDING':
      stopRecording();
      break;
    case 'GET_RECORDING_STATUS':
      sendResponse({ isRecording: !!mediaRecorder });
      break;
  }
  return true;
});

async function startRecording() {
  try {
    const stream = await navigator.mediaDevices.getDisplayMedia({
      video: { cursor: "always" },
      audio: true
    });

    mediaRecorder = new MediaRecorder(stream);
    recordedChunks = [];

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        recordedChunks.push(event.data);
      }
    };

    mediaRecorder.onstop = () => {
      const blob = new Blob(recordedChunks, {
        type: "video/webm"
      });
      const url = URL.createObjectURL(blob);
      chrome.downloads.download({
        url: url,
        filename: `screen-recording-${new Date().toISOString()}.webm`
      });
      
      recordedChunks = [];
      stream.getTracks().forEach(track => track.stop());
      mediaRecorder = null;

      // Notify popup about recording status
      chrome.runtime.sendMessage({ action: 'RECORDING_COMPLETE' });
    };

    mediaRecorder.start();
    chrome.runtime.sendMessage({ action: 'RECORDING_STARTED' });
  } catch (err) {
    console.error("Error: " + err);
    chrome.runtime.sendMessage({ action: 'RECORDING_ERROR', error: err.message });
  }
}

function stopRecording() {
  if (mediaRecorder) {
    mediaRecorder.stop();
  }
}
