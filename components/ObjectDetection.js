"use client";

import React, { useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";
import { load as cocoSSDLoad } from "@tensorflow-models/coco-ssd";
import * as tf from "@tensorflow/tfjs";
import { renderPredictions } from "@/utils/renderPredictions";
import { throttle } from "lodash";

let detectInterval;

const ObjectDetection = () => {
  const [isLoading, setIsLoading] = useState(true);
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);

  async function runCoco() {
    setIsLoading(true); // Set loading state to true when model loading starts
    const net = await cocoSSDLoad();
    setIsLoading(false); // Set loading state to false when model loading completes
    detectFrame(net);
  }

  const detectFrame = (net) => {
    runObjectDetection(net);
    requestAnimationFrame(() => detectFrame(net));
  };

  async function runObjectDetection(net) {
    if (
      canvasRef.current &&
      webcamRef.current !== null &&
      webcamRef.current.video?.readyState === 4
    ) {
      canvasRef.current.width = webcamRef.current.video.videoWidth;
      canvasRef.current.height = webcamRef.current.video.videoHeight;

      // Find detected objects
      const detectedObjects = await net.detect(webcamRef.current.video);
      const context = canvasRef.current.getContext("2d");

      // Filter the detected objects if needed
      const filteredObjects = detectedObjects.filter(
        (obj) => obj.class === "person",
      );
      renderPredictions(filteredObjects, context);
    }
  }

  const showmyVideo = () => {
    if (
      webcamRef.current !== null &&
      webcamRef.current.video?.readyState === 4
    ) {
      const myVideoWidth = webcamRef.current.video.videoWidth;
      const myVideoHeight = webcamRef.current.video.videoHeight;

      webcamRef.current.video.width = myVideoWidth;
      webcamRef.current.video.height = myVideoHeight;
    }
  };

  useEffect(() => {
    runCoco();
    showmyVideo();
    return () => {
      clearInterval(detectInterval); // Clear interval when component unmounts
    };
  }, []);

  return (
    <div className="mt-8">
      {isLoading ? (
        <div className="gradient-text">Loading AI Model...</div>
      ) : (
        <div className="relative flex justify-center items-center gradient p-1.5 rounded-md">
          {/* Webcam */}
          <Webcam
            ref={webcamRef}
            className="rounded-md w-full lg:h-[520px]"
            videoConstraints={{ width: 640, height: 480 }}
            muted
          />
          {/* Canvas */}
          <canvas
            ref={canvasRef}
            className="absolute top-0 left-0 z-99999 w-full lg:h-[520px]"
          />
        </div>
      )}
    </div>
  );
};

export default ObjectDetection;
