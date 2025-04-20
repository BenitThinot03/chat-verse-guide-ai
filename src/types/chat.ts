
export interface Message {
  role: 'user' | 'assistant';
  content: MessageContent[];
}

export interface MessageContent {
  type: 'text' | 'image' | 'audio';
  text?: string;
  image_url?: string;
  audio_url?: string;
}

export interface ChatState {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
}

export interface ToolDefinition {
  type: 'function';
  function: {
    name: string;
    description: string;
    parameters: {
      type: string;
      properties: Record<string, any>;
      required: string[];
    };
  }
}
