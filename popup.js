document.addEventListener("DOMContentLoaded", function () {
  let mediaRecorder;
  let recordedChunks = [];
  
  const startButton = document.getElementById("startButton");
  const stopButton = document.getElementById("stopButton");
  const status = document.getElementById("status");
  
  startButton.addEventListener("click", async () => {
    try {
      status.textContent = "Waiting for screen selection...";
      status.className = "mt-4 text-sm text-center text-blue-600";

      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          cursor: "always"
        },
        audio: true
      });

      mediaRecorder = new MediaRecorder(stream);
      
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
        const a = document.createElement("a");
        a.href = url;
        a.download = `screen-recording-${new Date().toISOString()}.webm`;
        a.click();
        
        recordedChunks = [];
        stream.getTracks().forEach(track => track.stop());
        
        status.textContent = "Recording saved!";
        status.className = "mt-4 text-sm text-center text-green-600";
        
        setTimeout(() => {
          status.textContent = "";
        }, 2000);
      };
      
      mediaRecorder.onstart = () => {
        status.textContent = "Recording...";
        status.className = "mt-4 text-sm text-center text-red-600";
      };
      
      mediaRecorder.start();
      startButton.disabled = true;
      stopButton.disabled = false;
    } catch (err) {
      console.error("Error: " + err);
      status.textContent = "Error: " + err.message;
      status.className = "mt-4 text-sm text-center text-red-600";
    }
  });
  
  stopButton.addEventListener("click", () => {
    mediaRecorder.stop();
    startButton.disabled = false;
    stopButton.disabled = true;
  });
});