import { CircleCheckBig, Loader2, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { Button } from './ui/button';
import { Checkbox } from './ui/checkbox';
import { Heading } from './ui/heading';
import { Input } from './ui/input';

type ValidationState = 'idle' | 'validating' | 'success' | 'error';

interface ValidateButtonProps {
  apiKey: string;
  validationState: ValidationState;
  onValidate: () => void;
}

function ValidateButton({ apiKey, validationState, onValidate }: ValidateButtonProps) {
  const getButtonContent = () => {
    return validationState;
  };

  const buttonVariants = {
    idle: {
      backgroundColor: 'rgb(255, 255, 255)',
      borderColor: 'rgb(209, 213, 219)'
    },
    validating: {
      backgroundColor: 'rgb(239, 246, 255)',
      borderColor: 'rgb(147, 197, 253)'
    },
    success: {
      backgroundColor: 'rgb(240, 253, 244)',
      borderColor: 'rgb(134, 239, 172)'
    },
    error: {
      backgroundColor: 'rgb(254, 242, 242)',
      borderColor: 'rgb(252, 165, 165)'
    }
  };

  const contentKey = getButtonContent();

  return (
    <Button
      variant="outline"
      onClick={onValidate}
      disabled={validationState === 'validating' || !apiKey.trim()}
      className="w-30"
      variants={buttonVariants}
      animate={validationState}
      transition={{ duration: 0.15 }}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={contentKey}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="flex items-center justify-center"
        >
          {validationState === 'validating' && (
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
              <Loader2 className="h-4 w-4 text-blue-600" />
            </motion.div>
          )}
          {validationState === 'success' && <CircleCheckBig className="h-4 w-4 text-green-600" />}
          {validationState === 'error' && <X className="h-4 w-4 text-red-600" />}
          {validationState === 'idle' && 'Validate'}
        </motion.div>
      </AnimatePresence>
    </Button>
  );
}

export function Settings() {
  const [apiKey, setApiKey] = useState('');
  const [, setSavedApiKey] = useState('');
  const [, setIsSaving] = useState(false);
  const [validationState, setValidationState] = useState<ValidationState>('idle');
  const [showKey, setShowKey] = useState(false);

  useEffect(() => {
    const loadApiKey = async () => {
      try {
        const storedKey = await window.api.getGroqApiKey();
        setApiKey(storedKey || '');
        setSavedApiKey(storedKey || '');
      } catch (error) {
        console.error('Failed to load API key:', error);
      }
    };

    loadApiKey();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await window.api.setGroqApiKey(apiKey);
      setSavedApiKey(apiKey);
      await window.api.closeSettings();
    } catch (error) {
      console.error('Failed to save API key:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleValidate = async () => {
    if (!apiKey.trim()) {
      setValidationState('error');
      setTimeout(() => setValidationState('idle'), 5000);
      return;
    }

    setValidationState('validating');

    try {
      const result = await window.api.validateGroqApiKey(apiKey.trim());
      setValidationState(result.valid ? 'success' : 'error');
      setTimeout(() => setValidationState('idle'), 5000);
    } catch (error) {
      console.error('Validation error:', error);
      setValidationState('error');
      setTimeout(() => setValidationState('idle'), 5000);
    }
  };

  return (
    <div className="fixed inset-0 flex flex-col p-6 pt-10">
      <div className="flex-1">
        <Heading level="h2" className="mb-1">
          Settings
        </Heading>

        <p className="mb-6 text-gray-700 text-sm">
          Echo transcribes voice using Groq's speech-to-text service. Your device connects directly to their servers. We
          never see or store your data. Get your API key from{' '}
          <Button size="link" variant="link" onClick={() => window.api.openExternal('https://console.groq.com/keys')}>
            Groq Console
          </Button>
          .
        </p>

        <div className="space-y-4">
          <div>
            <label htmlFor="groq-api-key" className="mb-2 block font-medium text-sm">
              Groq API Key
            </label>
            <div className="flex gap-2">
              <Input
                id="groq-api-key"
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => {
                  setApiKey(e.target.value);
                  setValidationState('idle'); // Clear validation when user types
                }}
                placeholder="Enter your Groq API key"
              />
              <ValidateButton apiKey={apiKey} validationState={validationState} onValidate={handleValidate} />
            </div>

            <div className="mt-2 flex items-center space-x-2">
              <Checkbox id="show-key" checked={showKey} onCheckedChange={(checked) => setShowKey(checked === true)} />
              <label htmlFor="show-key" className="cursor-pointer text-sm">
                Show key
              </label>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSave}>Close</Button>
      </div>
    </div>
  );
}
