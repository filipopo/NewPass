const el = document.getElementById('result');

// Access the camera
const video = document.getElementById('video');
navigator.mediaDevices.getUserMedia({ video: true })
    .then(stream => video.srcObject = stream)
    .catch(err => el.textContent = 'Error accessing the camera: ' + err);

// helper: EAR calculation using mediapipe landmark array
function eyeAspectRatio(landmarks, indices) {
    // landmarks is an array of {x,y,z} (MediaPipe format)
    const p = i => landmarks[indices[i]];
    function dist(a, b) {
        const dx = a.x - b.x
        const dy = a.y - b.y;
        return Math.hypot(dx, dy);
    }

    const A = dist(p(1), p(5));
    const B = dist(p(2), p(4));
    const C = dist(p(0), p(3));

    return (A + B) / (2.0 * (C + 1e-6));
}

const LEFT_EYE = [33, 160, 158, 133, 153, 144];
const RIGHT_EYE = [263, 387, 385, 362, 380, 373];

// Capture the image on button click
const captureButton = document.getElementById('capture');
captureButton.addEventListener('click', async () => {
    const canvas = document.getElementById('canvas');
    const context = canvas.getContext('2d');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    el.textContent = 'Checking liveness...';
    let blinkCount = 0;

    // keep small sliding window to detect short EAR drop
    let earHistory = [], framesCaptured = [];
    let mediapipeAvailable = true;

    const faceMesh = new FaceMesh({locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh@0.4/${file}`});
    faceMesh.setOptions({
        maxNumFaces: 1,
        refineLandmarks: true,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5
    });

    faceMesh.onResults(results => {
        if (!results.multiFaceLandmarks || results.multiFaceLandmarks.length === 0)
            return;

        const lm = results.multiFaceLandmarks[0];
        const leftEAR = eyeAspectRatio(lm, LEFT_EYE);
        const rightEAR = eyeAspectRatio(lm, RIGHT_EYE);
        const ear = (leftEAR + rightEAR) / 2.0;

        earHistory.push(ear);
        if (earHistory.length > 8)
            earHistory.shift();

        // blink detection: EAR drops below threshold for ~3 consecutive frames
        const BLINK_THRESH = 0.21;
        const last3 = earHistory.slice(-3);
        if (last3.length === 3 && last3.every(e => e < BLINK_THRESH)) {
            // reset after counting a blink
            blinkCount++;
            earHistory = [];
        }
    });

    // a tiny helper that sends a video frame into mediapipe
    async function sendFrameToMP() {
        // draw current video frame to the canvas and also store for later
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        framesCaptured.push(canvas.toDataURL('image/jpeg', 0.85));

        // send the canvas element as image input
        await faceMesh.send({image: canvas});
    }

    // run the small liveness routine for ~1600ms
    const DURATION_MS = 1600;
    const INTERVAL_MS = 100; // ~10 fps
    const iterations = Math.ceil(DURATION_MS / INTERVAL_MS);

    try {
        // run iterations sequentially so mediapipe keeps up
        for (let i = 0; i < iterations; i++) {
            await sendFrameToMP();
            await new Promise(r => setTimeout(r, INTERVAL_MS));
        }
    } catch (err) {
        // if MediaPipe errors for any reason, we'll fallback
        console.warn('MediaPipe error, will attempt fallback motion check', err);
        mediapipeAvailable = false;
    } finally {
        faceMesh.close();
    }

    // compute mean pixel difference between first / last frame
    function meanPixelDiff() {
        return new Promise(resolve => {
            const imgA = new Image(), imgB = new Image();
            let loaded = 0;
            imgA.onload = () => { if (++loaded === 2) compute(); };
            imgB.onload = () => { if (++loaded === 2) compute(); };
            imgA.src = framesCaptured[0]
            imgB.src = framesCaptured[framesCaptured.length - 1];

            function compute() {
                const c = document.createElement('canvas');
                c.width = imgA.width
                c.height = imgA.height;

                const ctx2 = c.getContext('2d');
                ctx2.drawImage(imgA, 0, 0);
                const a = ctx2.getImageData(0, 0, c.width, c.height).data;
                ctx2.drawImage(imgB, 0, 0);
                const b = ctx2.getImageData(0, 0, c.width, c.height).data;

                let sum = 0;
                for (let i = 0; i < a.length; i += 4) {
                    // grayscale difference
                    const ga = 0.299 * a[i] + 0.587 * a[i + 1] + 0.114 * a[i + 2];
                    const gb = 0.299 * b[i] + 0.587 * b[i + 1] + 0.114 * b[i + 2];
                    sum += Math.abs(ga - gb);
                }

                resolve(sum / (a.length / 4));
            }
        });
    }

    // Decide liveness:
    let livenessPassed = false;
    if (mediapipeAvailable && blinkCount >= 1) {
        livenessPassed = true;
    } else {
        // Attempt motion-only check similarly
        const minFrames = mediapipeAvailable ? 3 : 2;
        if (framesCaptured.length >= minFrames) {
            console.log('mediapipe', mediapipeAvailable);
            console.log('blinkCount', blinkCount);
            const diff = await meanPixelDiff();
            if (diff > 6.0) livenessPassed = true;
        }
    }

    if (!livenessPassed) {
        el.textContent = 'Liveness failed — please blink or move slightly and try again.';
        return;
    }

    // choose final image to send (last captured frame) and convert it to base64
    const dataURL = framesCaptured.length ? framesCaptured[framesCaptured.length - 1] : (() => {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        return canvas.toDataURL('image/jpeg');
    })();

    try {
        let responseReceived = false;
        el.textContent = 'Verifying';

        const interval = setInterval(() => {
            if (responseReceived) {
                clearInterval(interval);
                return;
            }

            if (el.textContent.length < 12)
                el.textContent += '.';
            else
                el.textContent = 'Verifying';
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
        el.textContent = 'Error sending the image: ' + err;
    }
});