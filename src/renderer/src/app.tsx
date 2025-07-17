import { useEffect, useState } from 'react';
import { Overlay } from './components/overlay';
import { Settings } from './components/settings';
import { useVoiceRecord } from './hooks/use-voice-record';
import type { TranscriptionMessage } from './types';

function App(): React.JSX.Element {
  const [currentPage, setCurrentPage] = useState<'overlay' | 'settings'>('overlay');

  const handleTranscriptionCopy = (transcription: { text: string; timestamp?: string }) => {
    const message: TranscriptionMessage = {
      text: transcription.text,
      timestamp: transcription.timestamp
    };

    window.electron.ipcRenderer.invoke('copy-transcription', message);
  };

  const { status } = useVoiceRecord({ onCopy: handleTranscriptionCopy });

  useEffect(() => {
    // Check if we're on the settings route
    const hash = window.location.hash;
    if (hash === '#/settings') {
      setCurrentPage('settings');
    } else {
      setCurrentPage('overlay');
    }
  }, []);

  if (currentPage === 'settings') {
    return <Settings />;
  }

  return <Overlay status={status} />;
}

export default App;
