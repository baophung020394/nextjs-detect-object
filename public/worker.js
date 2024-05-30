// objectDetectionWorker.js
importScripts("https://cdn.jsdelivr.net/npm/@tensorflow/tfjs");
importScripts("https://cdn.jsdelivr.net/npm/@tensorflow-models/coco-ssd");

let net;
cocoSSDLoad().then((model) => {
  net = model;
  postMessage({ type: "modelLoaded" });
});

onmessage = async function (e) {
  const imageData = e.data;
  const detectedObjects = await net.detect(imageData, undefined, 0.6);
  postMessage({ type: "detectedObjects", detectedObjects });
};
