
import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Image, Send } from 'lucide-react';

interface ChatInputProps {
  onSendMessage: (text: string, image?: File, audio?: Blob) => void;
  isLoading: boolean;
}

const ChatInput = ({ onSendMessage, isLoading }: ChatInputProps) => {
  const [message, setMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recordedAudio, setRecordedAudio] = useState<Blob | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Handle sending message
  const handleSendMessage = () => {
    if (!message.trim() && !selectedImage && !recordedAudio) return;
    
    onSendMessage(message, selectedImage || undefined, recordedAudio || undefined);
    
    // Reset state
    setMessage('');
    setSelectedImage(null);
    setImagePreview(null);
    setRecordedAudio(null);
  };

  // Handle image upload
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    setSelectedImage(file);
    setImagePreview(URL.createObjectURL(file));
  };

  // Clear selected image
  const clearImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
  };

  // Start voice recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];
      
      mediaRecorderRef.current.addEventListener('dataavailable', (event) => {
        audioChunksRef.current.push(event.data);
      });
      
      mediaRecorderRef.current.addEventListener('stop', () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setRecordedAudio(audioBlob);
        
        // Stop all audio tracks
        stream.getTracks().forEach(track => track.stop());
      });
      
      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
    }
  };

  // Stop voice recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  // Clear recorded audio
  const clearAudio = () => {
    setRecordedAudio(null);
  };

  // Handle key press (Enter to send)
  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="border-t border-gray-200 p-4">
      {/* Media preview section */}
      {(imagePreview || recordedAudio) && (
        <div className="mb-2 flex flex-wrap gap-2">
          {imagePreview && (
            <div className="relative inline-block">
              <img 
                src={imagePreview} 
                alt="Upload preview" 
                className="h-16 w-16 object-cover rounded-md" 
              />
              <button 
                onClick={clearImage}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center"
              >
                ×
              </button>
            </div>
          )}
          
          {recordedAudio && (
            <div className="relative inline-block">
              <audio controls src={URL.createObjectURL(recordedAudio)} className="h-10" />
              <button 
                onClick={clearAudio}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center"
              >
                ×
              </button>
            </div>
          )}
        </div>
      )}
      
      {/* Input section */}
      <div className="flex items-center space-x-2">
        <Button 
          type="button"
          variant="outline"
          className="rounded-full w-10 h-10 p-0 flex-shrink-0"
          onClick={isRecording ? stopRecording : startRecording}
        >
          {isRecording ? <MicOff size={18} /> : <Mic size={18} />}
        </Button>
        
        <input
          type="file"
          ref={fileInputRef}
          accept="image/*"
          className="hidden"
          onChange={handleImageUpload}
        />
        
        <Button 
          type="button"
          variant="outline"
          className="rounded-full w-10 h-10 p-0 flex-shrink-0"
          onClick={() => fileInputRef.current?.click()}
        >
          <Image size={18} />
        </Button>
        
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="Type your message..."
          className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          rows={1}
        />
        
        <Button 
          onClick={handleSendMessage}
          className="rounded-full w-10 h-10 p-0 flex-shrink-0"
          disabled={isLoading || (!message.trim() && !selectedImage && !recordedAudio)}
        >
          <Send size={18} />
        </Button>
      </div>
    </div>
  );
};

export default ChatInput;
