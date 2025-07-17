import type { RecordingState } from '@renderer/types';
// import { clipboard } from 'electron';
import { useEffect, useRef, useState } from 'react';

interface TranscriptionResult {
  text: string;
  timestamp?: string;
}

interface UseVoiceRecordingReturn {
  status: RecordingState;
  transcription: TranscriptionResult | null;
  duration: number;
  error: string | null;
  startRecording: () => Promise<void>;
  stopRecording: () => void;
}

interface UseVoiceRecordParams {
  onCopy?: (transcription: TranscriptionResult) => void;
}

export function useVoiceRecord(params: UseVoiceRecordParams = {}): UseVoiceRecordingReturn {
  const { onCopy } = params;
  const [status, setStatus] = useState<RecordingState>('idle');

  // Update statusRef whenever status changes
  useEffect(() => {
    statusRef.current = status;
  }, [status]);
  const [transcription, setTranscription] = useState<TranscriptionResult | null>(null);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const statusRef = useRef<RecordingState>('idle');
  const startRecording = async () => {
    console.log('Starting recording');
    try {
      setError(null);
      setTranscription(null);

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        }
      });

      console.log('Stream acquired');

      streamRef.current = stream;
      audioChunksRef.current = [];

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });

      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        console.log('Recording onStop');
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        console.log('Audio blob created');
        await processAudio(audioBlob);

        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop());
          streamRef.current = null;
        }
      };

      mediaRecorder.start(1000);
      setStatus('recording');
      startDurationTimer();
    } catch (err) {
      console.error('Error starting recording:', err);
      setError('Failed to access microphone. Please check permissions.');
      setStatus('idle');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      stopDurationTimer();
      setStatus('processing');
    }
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: todo
  useEffect(() => {
    const handleToggleRecording = () => {
      const currentStatus = statusRef.current;
      console.log('Toggle recording triggered, current state:', currentStatus);
      if (currentStatus === 'recording') {
        console.log('Stopping recording...');
        stopRecording();
      } else if (currentStatus === 'idle') {
        console.log('Starting recording...');
        startRecording();
      }
    };

    const handleStartRecording = () => {
      const currentStatus = statusRef.current;
      console.log('Start recording triggered, current state:', currentStatus);
      if (currentStatus === 'idle') {
        console.log('Starting recording...');
        startRecording();
      }
    };

    const handleStopRecording = () => {
      const currentStatus = statusRef.current;
      console.log('Stop recording triggered, current state:', currentStatus);
      if (currentStatus === 'recording') {
        console.log('Stopping recording...');
        stopRecording();
      }
    };

    console.log('Setting up IPC listeners for recording controls');
    window.electron.ipcRenderer.on('toggle-recording', handleToggleRecording);
    window.electron.ipcRenderer.on('start-recording', handleStartRecording);
    window.electron.ipcRenderer.on('stop-recording', handleStopRecording);

    return () => {
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      window.electron.ipcRenderer.removeAllListeners('toggle-recording');
      window.electron.ipcRenderer.removeAllListeners('start-recording');
      window.electron.ipcRenderer.removeAllListeners('stop-recording');
    };
  }, []);

  const startDurationTimer = () => {
    setDuration(0);
    durationIntervalRef.current = setInterval(() => {
      setDuration((prev) => prev + 1);
    }, 1000);
  };

  const stopDurationTimer = () => {
    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current);
      durationIntervalRef.current = null;
    }
  };

  const processAudio = async (audioBlob: Blob) => {
    try {
      console.log('Processing audio blob:', audioBlob.size, 'bytes');

      const arrayBuffer = await audioBlob.arrayBuffer();
      const result = await window.api.transcribeAudio(arrayBuffer);

      const transcriptionResult = {
        text: result.text,
        timestamp: result.timestamp
      };

      setTranscription(transcriptionResult);

      // Call onCopy callback if provided
      if (onCopy) {
        onCopy(transcriptionResult);
      }

      setStatus('idle');
    } catch (err) {
      console.error('Error processing audio:', err);
      setError(err instanceof Error ? err.message : 'Failed to process audio recording.');
      setStatus('idle');
    }
  };

  return {
    status,
    transcription,
    duration,
    error,
    startRecording,
    stopRecording
  };
}
