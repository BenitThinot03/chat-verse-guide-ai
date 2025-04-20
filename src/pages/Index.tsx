
import { useState, useEffect } from 'react';
import ChatInterface from '@/components/ChatInterface';
import ApiKeyInput from '@/components/ApiKeyInput';

const Index = () => {
  const [apiKey, setApiKey] = useState<string | null>(null);
  
  // Load API key from localStorage on component mount
  useEffect(() => {
    const storedApiKey = localStorage.getItem('openai_api_key');
    if (storedApiKey) {
      setApiKey(storedApiKey);
    }
  }, []);
  
  // Handle API key submission
  const handleApiKeySubmit = (key: string) => {
    localStorage.setItem('openai_api_key', key);
    setApiKey(key);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="bg-blue-600 text-white p-4 shadow-md">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-2xl font-bold">ChatVerse Guide AI</h1>
          <p className="text-sm opacity-80">Your AI Travel Guide Assistant</p>
        </div>
      </header>
      
      <main className="flex-1 p-4 flex flex-col">
        <div className="flex-1 max-w-3xl mx-auto w-full bg-white rounded-lg shadow-md overflow-hidden flex flex-col">
          {apiKey ? (
            <ChatInterface apiKey={apiKey} />
          ) : (
            <div className="flex-1 flex items-center justify-center p-4">
              <ApiKeyInput onApiKeySubmit={handleApiKeySubmit} />
            </div>
          )}
        </div>
      </main>
      
      <footer className="bg-gray-100 p-4 text-center text-gray-600 text-sm">
        <div className="max-w-3xl mx-auto">
          <p>Powered by OpenAI GPT-4o mini</p>
          {apiKey && (
            <button 
              className="text-blue-500 text-xs mt-1 hover:underline"
              onClick={() => {
                localStorage.removeItem('openai_api_key');
                setApiKey(null);
              }}
            >
              Reset API Key
            </button>
          )}
        </div>
      </footer>
    </div>
  );
};

export default Index;
