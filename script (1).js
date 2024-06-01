// script.js
const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const startButton = document.getElementById('startButton');
const stopButton = document.getElementById('stopButton');

let detectionInterval;
let stream;

async function setupCamera() {
    video.width = 640;
    video.height = 480;

    stream = await navigator.mediaDevices.getUserMedia({
        video: true,
    });
    video.srcObject = stream;

    return new Promise((resolve) => {
        video.onloadedmetadata = () => {
            resolve(video);
        };
    });
}

async function detectHands(model) {
    const predictions = await model.estimateHands(video);

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (predictions.length > 0) {
        predictions.forEach(prediction => {
            const landmarks = prediction.landmarks;

            for (let i = 0; i < landmarks.length; i++) {
                const [x, y] = landmarks[i];
                ctx.beginPath();
                ctx.arc(x, y, 5, 0, 2 * Math.PI);
                ctx.fillStyle = 'red';
                ctx.fill();
            }
        });
    }
}

async function startDetection() {
    await setupCamera();
    video.style.display = 'block';
    canvas.style.display = 'block';
    video.play();

    const model = await handpose.load();
    console.log('Handpose model loaded');

    detectionInterval = setInterval(() => {
        detectHands(model);
    }, 100);

    startButton.style.display = 'none';
    stopButton.style.display = 'block';
}

function stopDetection() {
    clearInterval(detectionInterval);
    video.pause();
    video.srcObject.getTracks().forEach(track => track.stop());
    video.style.display = 'none';
    canvas.style.display = 'none';
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    stopButton.style.display = 'none';
    startButton.style.display = 'block';
}

startButton.addEventListener('click', startDetection);
stopButton.addEventListener('click', stopDetection);
