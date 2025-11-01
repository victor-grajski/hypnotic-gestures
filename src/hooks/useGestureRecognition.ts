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
  const lastTimestampRef = useRef<number>(-1);
  const hasLoggedDetectionRef = useRef<boolean>(false);

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
  const [isRecognizerReady, setIsRecognizerReady] = useState<boolean>(false);

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
        minHandDetectionConfidence: 0.3,
        minHandPresenceConfidence: 0.3,
        minTrackingConfidence: 0.3,
      });

      gestureRecognizerRef.current = recognizer;
      console.log('Gesture recognizer initialized successfully');
      setIsRecognizerReady(true);
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
      console.log('Requesting webcam access...');
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user',
        },
        audio: false,
      });

      console.log('Webcam stream obtained:', stream.getVideoTracks()[0].getSettings());

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        
        const handleLoadedData = async () => {
          try {
            if (videoRef.current) {
              console.log('Video loaded, dimensions:', {
                videoWidth: videoRef.current.videoWidth,
                videoHeight: videoRef.current.videoHeight,
                readyState: videoRef.current.readyState
              });
              
              await videoRef.current.play();
              console.log('Video playing successfully');
              setIsWebcamActive(true);
            }
          } catch (playError) {
            console.error('Failed to play video:', playError);
            setError('Failed to play video stream');
          }
        };

        videoRef.current.addEventListener('loadeddata', handleLoadedData, { once: true });
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

    if (!video || !canvas || !recognizer || !isWebcamActive || !isRecognizerReady) {
      animationFrameRef.current = requestAnimationFrame(processFrame);
      return;
    }

    // Check if video has valid dimensions before processing
    if (video.videoWidth === 0 || video.videoHeight === 0) {
      animationFrameRef.current = requestAnimationFrame(processFrame);
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size to match video
    if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      console.log('Canvas resized to:', canvas.width, 'x', canvas.height);
    }

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Detect gestures - ensure timestamp is strictly increasing
    // Use performance.now() which is guaranteed to be monotonically increasing
    let timestampMs = performance.now();
    
    // Ensure timestamp is strictly greater than the last one
    if (timestampMs <= lastTimestampRef.current) {
      timestampMs = lastTimestampRef.current + 1;
    }
    lastTimestampRef.current = timestampMs;
    
    try {
      const results = recognizer.recognizeForVideo(video, timestampMs);
      
      // Log first successful detection
      if (results.landmarks && results.landmarks.length > 0 && !hasLoggedDetectionRef.current) {
        console.log('First hand detected! Results:', results);
        hasLoggedDetectionRef.current = true;
      }

    // Draw landmarks and connections
    if (results.landmarks && results.landmarks.length > 0) {
      const drawingUtils = new DrawingUtils(ctx);
      
      for (const landmarks of results.landmarks) {
        drawingUtils.drawConnectors(
          landmarks,
          GestureRecognizer.HAND_CONNECTIONS,
          { color: '#219897', lineWidth: 2 }
        );
        drawingUtils.drawLandmarks(landmarks, {
          color: '#219897',
          lineWidth: 1,
          radius: 4,
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
    } catch (error) {
      console.error('Error processing frame:', error);
    }

    animationFrameRef.current = requestAnimationFrame(processFrame);
  }, [isWebcamActive, isRecognizerReady]);

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
    console.log('Frame processing effect triggered:', {
      isWebcamActive,
      isRecognizerReady,
      hasRecognizer: !!gestureRecognizerRef.current,
      hasVideo: !!videoRef.current,
      videoReady: videoRef.current?.readyState
    });
    
    if (isWebcamActive && isRecognizerReady && gestureRecognizerRef.current) {
      console.log('✅ Starting frame processing loop!');
      animationFrameRef.current = requestAnimationFrame(processFrame);
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isWebcamActive, isRecognizerReady, processFrame]);

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
