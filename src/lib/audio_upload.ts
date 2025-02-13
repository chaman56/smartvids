import axios from 'axios';

export async function uploadAudioToCloudinary(audioBytes: Buffer, fileName:string) {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
    const apiKey = process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY;
    if (!cloudName || !uploadPreset || !apiKey) {
        throw new Error('Missing Cloudinary configuration');
    }
    const url = `https://api.cloudinary.com/v1_1/${cloudName}/upload`;
    // Convert audioBytes (Buffer) to a Blob
    const audioBlob = new Blob([audioBytes], { type: 'audio/mp3' });
    // Create a FormData object
    const formData = new FormData();
    formData.append('file', audioBlob, fileName);
    formData.append('upload_preset', uploadPreset);
    formData.append('api_key', apiKey);
  
    try {
      console.log("🔃Uploading Audio")
      const response = await axios.post(url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error uploading to Cloudinary:', error);
      throw error;
    }
  }