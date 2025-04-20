
// This service handles communication with the OpenAI API
import { Message } from '@/types/chat';

const weatherTool = {
  type: 'function',
  function: {
    name: 'getWeather',
    description: 'Get the current weather in a given city.',
    parameters: {
      type: 'object',
      properties: {
        city: {
          type: 'string',
          description: 'The name of the city'
        }
      },
      required: ['city']
    }
  }
};

// Utility to format messages for the OpenAI API
function formatMessagesForAPI(messages: Message[]) {
  return {
    model: 'gpt-4o-mini',
    input: messages.map(message => ({
      role: message.role,
      content: message.content.map(content => {
        if (content.type === 'text') {
          return {
            type: 'text',
            text: content.text
          };
        } else if (content.type === 'image' && content.image_url) {
          return {
            type: 'image',
            image_url: { url: content.image_url }
          };
        } else if (content.type === 'audio' && content.audio_url) {
          return {
            type: 'text',
            text: "[Audio message transcription would go here]"
          };
        }
        return null;
      }).filter(Boolean)
    })),
    instructions: 'You are a very helpful and concise Guide assistant. And passionate about travel',
    max_output_tokens: 300,
    temperature: 0.7,
    stream: false,
    parallel_tool_calls: true,
    previous_response_id: null,
    text: { response_format: 'text' },
    tools: [weatherTool]
  };
}

// Main function to send messages to OpenAI API
export const sendMessageToOpenAI = async (messages: Message[]): Promise<Message> => {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OpenAI API key is not set in the environment variable.');
  }

  const payload = formatMessagesForAPI(messages);

  try {
    const response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();

    // Assume the response has a text property. Adjust if structure is different.
    return {
      role: 'assistant',
      content: [{
        type: 'text',
        text: data.text || "Sorry, I didn't understand."
      }]
    };
  } catch (error) {
    console.error('Error calling OpenAI:', error);
    throw error;
  }
};
