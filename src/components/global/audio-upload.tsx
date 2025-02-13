import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import { toast } from 'sonner';
import {  Loader, Trash2, Upload } from 'lucide-react';

type Props = {
    audioUrl: string | null;
    setAudioUrl: (url: string | null) => void;
    isUploading: boolean;
    setIsUploading: (value: boolean) => void;
}

const AudioUpload = ({audioUrl, setAudioUrl, setIsUploading, isUploading}:Props) => {


  const handleUpload = async (file: File) => {
    if (!file) return;
    
    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET as string);

    try {
      const response = await axios.post(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/upload`,
        formData
      );
      setAudioUrl(response.data.secure_url);
      toast.success('Successfully Uploaded!',{
        style:{color:'rgb(70, 255, 70)'},
      });
    } catch (error) {
      toast.error('Failed to Upload. ' + error,{
        style:{color:'rgb(255, 100, 100)'}, 
      });
    } finally {
      setIsUploading(false);
    }
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles && acceptedFiles[0]) {
      handleUpload(acceptedFiles[0]);
    }
  }, []);

  const { getRootProps, getInputProps } = useDropzone({
    accept: {'audio/*': []},
    maxFiles: 1,
    onDrop, 
  });

  return (
    <div className="audio-upload mt-3">
      <h2>Upload Audio</h2>
      <div {...getRootProps()} className="w-full h-[200px] flex items-center justify-center border-4 border-dashed p-4 rounded-2xl cursor-pointer " >
        <input {...getInputProps()} />
        {isUploading ? (
          <div className='flex flex-col items-center'>
            <Loader className="animate-spin" />
            <div>Uploading</div>
          </div>
        ) : (
            <div className='flex flex-col items-center'>
                <Upload />
                <p className=' font-extrabold text-xl'>Drag and drop your audio file here </p>
                <p className=''>or click to upload</p>
            </div>
        )}
      </div>
      {audioUrl && (
        <div className=" audio-preview mt-4">
            <h3>Uploaded Audio</h3>
            
          <div className='flex items-center gap-3'>
            <audio controls src={audioUrl}></audio>
            <div className='text-red-500'><Trash2 onClick={() => setAudioUrl(null)}  className='cursor-pointer hover' /></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AudioUpload;
