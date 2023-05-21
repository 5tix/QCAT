function openCamera() {
    navigator.mediaDevices.getUserMedia({ video: true })
      .then(stream => {
        const video = document.createElement('video');
        video.srcObject = stream;
        video.play();
        document.body.appendChild(video);
      })
      .catch(error => {
        console.error(error);
      });
  }