import { Conf } from 'electron-conf/main';

interface StoreSchema {
  groq: {
    apiKey: string;
  };
}

const store = new Conf<StoreSchema>({
  name: 'echo-settings',
  defaults: {
    groq: {
      apiKey: ''
    }
  }
});

export function getGroqApiKey(): string {
  return store.get('groq.apiKey', '');
}

export function setGroqApiKey(apiKey: string): void {
  store.set('groq.apiKey', apiKey);
}

export function hasGroqApiKey(): boolean {
  const apiKey = getGroqApiKey();
  return apiKey.length > 0;
}
