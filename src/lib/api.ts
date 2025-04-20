import axios from 'axios';
import { Message } from '@/types/chat';

// Define weather tool for the OpenAI API
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

// Function to convert our internal message format to OpenAI's format
function formatMessagesForAPI(messages: Message[]) {
  // Prepare input array for the API
  const formattedInput = messages.map(message => {
    return {
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
          // Note: In a real implementation, you would convert the audio blob to a base64 string
          return {
            type: 'text',
            text: "[Audio message transcription would go here in a real implementation]"
          };
        }
        return null;
      }).filter(Boolean)
    };
  });

  // Create the request payload as per the OpenAI documentation
  return {
    model: 'gpt-4o-mini', 
    input: formattedInput,
    instructions: 'You are a very helpful and concise Guide assistant. And passionate about travel', 
    max_output_tokens: 300,
    temperature: 0.7,
    stream: false,
    parallel_tool_calls: true,
    previous_response_id: null,
    text: {
      response_format: 'text'
    },
    tools: [weatherTool]
  };
}

// Function to convert file to base64
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      // Remove the data URL prefix (e.g., "data:image/jpeg;base64,")
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = error => reject(error);
  });
};

// Function to convert Blob to base64
const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(blob);
    reader.onload = () => {
      const result = reader.result as string;
      // Remove the data URL prefix
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = error => reject(error);
  });
};

// Function to handle sending audio to the OpenAI API
const prepareAudioForAPI = async (audioBlob: Blob) => {
  try {
    // Convert audio blob to base64
    const base64Audio = await blobToBase64(audioBlob);
    
    // In a real implementation, you would use this base64 string
    // in your API call to OpenAI for speech-to-text
    console.log('Prepared audio for API:', base64Audio.substring(0, 50) + '...');
    
    // For now, just return a placeholder transcription
    return "[This would be a real transcription in a production app]";
  } catch (error) {
    console.error('Error preparing audio:', error);
    throw error;
  }
};

// Function to prepare image for the API
const prepareImageForAPI = async (imageFile: File) => {
  try {
    // In a real implementation, you would convert the image to base64
    // or get a valid URL that OpenAI can access
    const imageUrl = URL.createObjectURL(imageFile);
    
    console.log('Prepared image for API:', imageUrl);
    
    // Return the URL for display in the UI
    return imageUrl;
  } catch (error) {
    console.error('Error preparing image:', error);
    throw error;
  }
};

// Main function to send messages to OpenAI
export const sendMessageToOpenAI = async (messages: Message[]): Promise<Message> => {
  // API key is retrieved from localStorage at runtime
  
  try {
    // Format messages for the API
    const payload = formatMessagesForAPI(messages);
    console.log('Sending to OpenAI API:', payload);
    
    // In a production environment, we would make the actual API call
  // The API key should be retrieved from localStorage or a secure storage mechanism
  const storedApiKey = localStorage.getItem('openai_api_key');
  
  if (!storedApiKey) {
    throw new Error('OpenAI API key not found');
  }
  
  try {
    // Uncomment this in production
    /*
    const response = await axios.post(
      'https://api.openai.com/v1/responses',
      payload,
      {
        headers: {
          'Authorization': `Bearer ${storedApiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    // Process the API response
    const responseData = response.data;
    
    // Extract the assistant's message from the response
    return {
      role: 'assistant',
      content: [
        {
          type: 'text',
          text: responseData.text
        }
      ]
    };
    */
  } catch (apiError) {
    console.error('OpenAI API Error:', apiError);
    throw new Error('Failed to communicate with OpenAI. Please check your API key and try again.');
  }
    
    // For development, use a mock response
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Generate mock response based on the last user message
    const userMessage = messages[messages.length - 1];
    let responseText = '';
    
    if (userMessage.content.some(c => c.type === 'image')) {
      responseText = "I can see the image you sent! As your travel guide, I'd be happy to tell you more about this destination or answer any questions you have about places to visit, accommodations, or local attractions.";
    } else if (userMessage.content.some(c => c.type === 'audio')) {
      responseText = "I've received your voice message! As your travel guide, I'm ready to help with your travel plans. Just let me know where you're thinking of going or what kind of travel advice you need.";
    } else {
      // Check the text content for keywords to generate contextual responses
      const textContent = userMessage.content.find(c => c.type === 'text')?.text || '';
      
      if (textContent.toLowerCase().includes('paris')) {
        responseText = "Paris is beautiful this time of year! The Eiffel Tower, Louvre Museum, and Notre-Dame Cathedral are must-visit attractions. Would you like some restaurant recommendations or information about less touristy spots?";
      } else if (textContent.toLowerCase().includes('weather')) {
        responseText = "I don't have access to real-time weather data, but I can help you understand typical weather patterns for your destination or recommend the best seasons to visit particular places!";
      } else if (textContent.toLowerCase().includes('hotel') || textContent.toLowerCase().includes('accommodation')) {
        responseText = "When looking for accommodations, consider your budget, desired location, and amenities. Would you prefer a luxury hotel, boutique stay, or perhaps a local experience through an apartment rental?";
      } else {
        responseText = "Thanks for your message! As your travel guide assistant, I'm here to help with destination recommendations, itinerary planning, budgeting tips, and local insights. Where are you planning to travel next?";
      }
    }
    
    // Return the mocked response
    return {
      role: 'assistant',
      content: [
        {
          type: 'text',
          text: responseText
        }
      ]
    };
    
  } catch (error) {
    console.error('Error sending message to OpenAI:', error);
    throw error;
  }
};
