
import { Button } from '@/components/ui/button';

const WelcomeScreen = ({ onStart }: { onStart: () => void }) => {
  return (
    <div className="text-center p-6">
      <h2 className="text-2xl font-bold mb-4">Welcome to ChatVerse Guide AI</h2>
      
      <div className="mb-6 space-y-4 text-left">
        <p className="text-gray-700">
          This AI assistant is your personal travel guide, ready to help you with:
        </p>
        
        <ul className="list-disc pl-5 space-y-2 text-gray-600">
          <li>Travel destination recommendations</li>
          <li>Itinerary planning and suggestions</li>
          <li>Local attractions and hidden gems</li>
          <li>Cultural tips and insights</li>
          <li>Travel budgeting advice</li>
        </ul>
      </div>
      
      <div className="mb-6 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-medium text-blue-700 mb-2">How to use:</h3>
        <ul className="text-left space-y-2 text-gray-600">
          <li>💬 Type your travel questions or requests</li>
          <li>🎤 Record voice messages for on-the-go convenience</li>
          <li>📷 Share images of places you're interested in</li>
        </ul>
      </div>
      
      <Button 
        onClick={onStart}
        className="w-full bg-blue-600 hover:bg-blue-700"
      >
        Start Chatting
      </Button>
    </div>
  );
};

export default WelcomeScreen;
