import { useState, useEffect, useRef, useCallback } from 'react';
import { GestureRecognizer, FilesetResolver, DrawingUtils } from '@mediapipe/tasks-vision';
import type { GestureType, PositionInfo } from '../types';
import { getPositionInfo } from '../utils/gestureUtils';

interface UseGestureRecognitionReturn {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  currentGesture: GestureType;
  gestureScore: number;
  position: PositionInfo;
  isLoading: boolean;
  error: string | null;
  isWebcamActive: boolean;
}

export function useGestureRecognition(): UseGestureRecognitionReturn {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gestureRecognizerRef = useRef<GestureRecognizer | null>(null);
  const animationFrameRef = useRef<number>(0);
  const streamRef = useRef<MediaStream | null>(null);

  const [currentGesture, setCurrentGesture] = useState<GestureType>(null);
  const [gestureScore, setGestureScore] = useState<number>(0);
  const [position, setPosition] = useState<PositionInfo>({
    third: 'center',
    quadrant: 'up',
    x: 0.5,
    y: 0.5,
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isWebcamActive, setIsWebcamActive] = useState<boolean>(false);

  // Initialize MediaPipe Gesture Recognizer
  const initializeGestureRecognizer = useCallback(async () => {
    try {
      setIsLoading(true);
      const vision = await FilesetResolver.forVisionTasks(
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
      );

      const recognizer = await GestureRecognizer.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath:
            'https://storage.googleapis.com/mediapipe-models/gesture_recognizer/gesture_recognizer/float16/1/gesture_recognizer.task',
          delegate: 'GPU',
        },
        runningMode: 'VIDEO',
        numHands: 1,
        minHandDetectionConfidence: 0.5,
        minHandPresenceConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });

      gestureRecognizerRef.current = recognizer;
      setIsLoading(false);
    } catch (err) {
      console.error('Failed to initialize gesture recognizer:', err);
      setError('Failed to load gesture recognition model');
      setIsLoading(false);
    }
  }, []);

  // Start webcam
  const startWebcam = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user',
        },
        audio: false,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.addEventListener('loadeddata', () => {
          setIsWebcamActive(true);
        });
      }

      streamRef.current = stream;
    } catch (err) {
      console.error('Failed to access webcam:', err);
      setError('Failed to access webcam. Please grant camera permissions.');
    }
  }, []);

  // Process video frame for gesture detection
  const processFrame = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const recognizer = gestureRecognizerRef.current;

    if (!video || !canvas || !recognizer || !isWebcamActive) {
      animationFrameRef.current = requestAnimationFrame(processFrame);
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size to match video
    if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
    }

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Detect gestures
    const startTimeMs = performance.now();
    const results = recognizer.recognizeForVideo(video, startTimeMs);

    // Draw landmarks and connections
    if (results.landmarks && results.landmarks.length > 0) {
      const drawingUtils = new DrawingUtils(ctx);
      
      for (const landmarks of results.landmarks) {
        drawingUtils.drawConnectors(
          landmarks,
          GestureRecognizer.HAND_CONNECTIONS,
          { color: '#00FF00', lineWidth: 2 }
        );
        drawingUtils.drawLandmarks(landmarks, {
          color: '#FF0000',
          lineWidth: 1,
          radius: 3,
        });
      }

      // Update gesture state
      if (results.gestures && results.gestures.length > 0) {
        const gesture = results.gestures[0][0];
        const gestureName = gesture.categoryName as GestureType;
        const score = gesture.score;

        setCurrentGesture(gestureName);
        setGestureScore(score);

        // Update position info
        const landmarks = results.landmarks[0];
        const posInfo = getPositionInfo(landmarks);
        setPosition(posInfo);
      } else {
        setCurrentGesture(null);
        setGestureScore(0);
      }
    } else {
      setCurrentGesture(null);
      setGestureScore(0);
    }

    animationFrameRef.current = requestAnimationFrame(processFrame);
  }, [isWebcamActive]);

  // Initialize on mount
  useEffect(() => {
    initializeGestureRecognizer();
    startWebcam();

    return () => {
      // Cleanup
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, [initializeGestureRecognizer, startWebcam]);

  // Start processing frames when ready
  useEffect(() => {
    if (isWebcamActive && gestureRecognizerRef.current) {
      animationFrameRef.current = requestAnimationFrame(processFrame);
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isWebcamActive, processFrame]);

  return {
    videoRef,
    canvasRef,
    currentGesture,
    gestureScore,
    position,
    isLoading,
    error,
    isWebcamActive,
  };
}
