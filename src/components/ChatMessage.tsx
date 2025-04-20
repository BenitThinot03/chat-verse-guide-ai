
import { Message } from '@/types/chat';
import { cn } from '@/lib/utils';

interface ChatMessageProps {
  message: Message;
}

const ChatMessage = ({ message }: ChatMessageProps) => {
  const isUser = message.role === 'user';

  return (
    <div className={cn(
      "flex w-full mb-4",
      isUser ? "justify-end" : "justify-start"
    )}>
      <div className={cn(
        "max-w-[80%] rounded-lg p-4",
        isUser ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-800"
      )}>
        {message.content.map((content, index) => {
          if (content.type === 'text' && content.text) {
            return <p key={`text-${index}`} className="whitespace-pre-line">{content.text}</p>;
          } else if (content.type === 'image' && content.image_url) {
            return (
              <div key={`image-${index}`} className="my-2">
                <img 
                  src={content.image_url} 
                  alt="Shared image" 
                  className="max-w-full rounded-md"
                />
              </div>
            );
          } else if (content.type === 'audio' && content.audio_url) {
            return (
              <div key={`audio-${index}`} className="my-2">
                <audio 
                  controls 
                  src={content.audio_url} 
                  className="w-full"
                />
              </div>
            );
          }
          return null;
        })}
      </div>
    </div>
  );
};

export default ChatMessage;
