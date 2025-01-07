// Access the camera
const video = document.getElementById('video');
navigator.mediaDevices.getUserMedia({ video: true })
    .then(stream => video.srcObject = stream)
    .catch(err => console.error('Error accessing the camera: ' + err));

// Capture the image on button click
const captureButton = document.getElementById('capture');
captureButton.addEventListener('click', async () => {
    const canvas = document.getElementById('canvas');
    const context = canvas.getContext('2d');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert canvas image to base64
    const dataURL = canvas.toDataURL('image/jpeg');

    try {
        let responseReceived = false;
        const el = document.getElementById('result')
        el.textContent = 'Veryfying';

        const interval = setInterval(() => {
            if (responseReceived) {
                clearInterval(interval);
                return;
            }

            if (el.textContent.length < 12)
                el.textContent += '.';
            else
                el.textContent = 'Veryfying';
        }, 500);

        // Send the image to the server
        const response = await fetch('/process_image/', {
            method: 'POST',
            headers: {'Content-Type': 'text/plain'},
            body: dataURL
        });

        const data = await response.json();
        responseReceived = true;

        if (data.verified) {
            el.textContent = 'Verified! Redirecting...';
            setTimeout(() => {
                window.location.href = '/secrets/';
            }, 1000);
        } else {
            el.textContent = 'Verification failed. Please try again.';
        }
    } catch (err) {
        console.error('Error sending the image: ' + err);
    }
});