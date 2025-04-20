
/**
 * Utility functions for handling files in the chat application
 */

// Convert a File to base64 string
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        // Extract the base64 part (remove "data:image/jpeg;base64," prefix)
        const base64 = reader.result.split(',')[1];
        resolve(base64);
      } else {
        reject(new Error('Failed to convert file to base64'));
      }
    };
    reader.onerror = (error) => reject(error);
  });
};

// Convert a Blob to base64 string
export const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(blob);
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        // Extract the base64 part
        const base64 = reader.result.split(',')[1];
        resolve(base64);
      } else {
        reject(new Error('Failed to convert blob to base64'));
      }
    };
    reader.onerror = (error) => reject(error);
  });
};

// Get the MIME type of a file
export const getFileMimeType = (file: File): string => {
  return file.type;
};

// Create an object URL from a Blob or File
export const createObjectURL = (blob: Blob): string => {
  return URL.createObjectURL(blob);
};

// Revoke an object URL to free up memory
export const revokeObjectURL = (url: string): void => {
  URL.revokeObjectURL(url);
};

// Validate image file type and size
export const validateImageFile = (file: File, maxSizeMB = 10): boolean => {
  const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  
  return validTypes.includes(file.type) && file.size <= maxSizeBytes;
};

// Validate audio file type and size
export const validateAudioFile = (file: File, maxSizeMB = 25): boolean => {
  const validTypes = ['audio/mpeg', 'audio/wav', 'audio/webm', 'audio/ogg'];
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  
  return validTypes.includes(file.type) && file.size <= maxSizeBytes;
};
