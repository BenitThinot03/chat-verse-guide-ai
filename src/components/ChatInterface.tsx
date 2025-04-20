
import { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Message, MessageContent } from '@/types/chat';
import ChatMessage from './ChatMessage';
import LoadingIndicator from './LoadingIndicator';
import WelcomeScreen from './WelcomeScreen';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Image, Send } from 'lucide-react';
import { sendMessageToOpenAI } from '@/lib/api';

interface ChatInterfaceProps {
  apiKey?: string;
}

const ChatInterface = ({ apiKey }: ChatInterfaceProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [showWelcome, setShowWelcome] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedAudio, setRecordedAudio] = useState<Blob | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { register, handleSubmit, reset, watch } = useForm<{ message: string }>();
  const messageValue = watch('message', '');

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle form submission (text message)
  const onSubmit = async (data: { message: string }) => {
    if (!data.message.trim() && !selectedImage && !recordedAudio) return;
    
    const contentItems: MessageContent[] = [];
    
    // Add text content if available
    if (data.message.trim()) {
      contentItems.push({
        type: 'text',
        text: data.message.trim()
      });
    }
    
    // Add image content if available
    if (selectedImage) {
      const imageUrl = imagePreview as string;
      contentItems.push({
        type: 'image',
        image_url: imageUrl
      });
    }
    
    // Add audio content if available
    if (recordedAudio) {
      const audioUrl = URL.createObjectURL(recordedAudio);
      contentItems.push({
        type: 'audio',
        audio_url: audioUrl
      });
    }
    
    // Create user message
    const userMessage: Message = {
      role: 'user',
      content: contentItems
    };
    
    // Update messages state
    setMessages(prev => [...prev, userMessage]);
    
    // Reset form and attached media
    reset();
    setSelectedImage(null);
    setImagePreview(null);
    setRecordedAudio(null);
    
    // Send message to OpenAI API
    setIsLoading(true);
    try {
      const response = await sendMessageToOpenAI(messages.concat(userMessage));
      
      // Add assistant response to messages
      setMessages(prev => [...prev, response]);
    } catch (error) {
      console.error('Error sending message to OpenAI:', error);
      // You could add error handling here
    } finally {
      setIsLoading(false);
    }
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

  return (
    <div className="flex flex-col h-full max-w-3xl mx-auto">
      {showWelcome && messages.length === 0 ? (
        <div className="flex-1 flex items-center justify-center p-4">
          <WelcomeScreen onStart={() => setShowWelcome(false)} />
        </div>
      ) : (
        <>
          <div className="flex-1 p-4 overflow-y-auto">
            {messages.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center text-gray-500">
                  <p className="mb-4">Your conversation will appear here.</p>
                  <p>Start by typing a message, recording your voice, or sharing an image.</p>
                </div>
              </div>
            ) : (
              messages.map((message, index) => (
                <ChatMessage key={index} message={message} />
              ))
            )}
            <div ref={messagesEndRef} />
          </div>
          
          {/* Media preview section */}
          {(imagePreview || recordedAudio) && (
            <div className="px-4 py-2 border-t border-gray-200">
              {imagePreview && (
                <div className="relative inline-block mr-2">
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
          
          {/* Loading indicator */}
          {isLoading && (
            <div className="border-t border-gray-200 p-3 bg-gray-50">
              <LoadingIndicator message="AI assistant is thinking..." />
            </div>
          )}
          
          {/* Input section */}
          <div className="border-t border-gray-200 p-4">
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col space-y-2">
              <div className="flex items-center space-x-2">
                <Button 
                  type="button"
                  variant="outline"
                  className="rounded-full w-10 h-10 p-0 flex-shrink-0"
                  onClick={isRecording ? stopRecording : startRecording}
                  disabled={isLoading}
                >
                  {isRecording ? <MicOff size={18} /> : <Mic size={18} />}
                </Button>
                
                <label className={`cursor-pointer ${isLoading ? 'opacity-50' : ''}`}>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                    disabled={isLoading}
                  />
                  <Button 
                    type="button"
                    variant="outline"
                    className="rounded-full w-10 h-10 p-0 flex-shrink-0"
                    onClick={() => {}}
                    disabled={isLoading}
                  >
                    <Image size={18} />
                  </Button>
                </label>
                
                <input
                  {...register('message')}
                  placeholder={isRecording ? "Recording audio..." : "Type your message..."}
                  className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={isLoading}
                />
                
                <Button 
                  type="submit"
                  className="rounded-full w-10 h-10 p-0 flex-shrink-0"
                  disabled={isLoading || (!messageValue.trim() && !selectedImage && !recordedAudio)}
                >
                  <Send size={18} />
                </Button>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  );
};

export default ChatInterface;
