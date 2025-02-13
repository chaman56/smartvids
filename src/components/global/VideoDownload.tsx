'use client'

import React, { useEffect, useRef, useState } from 'react';
import etro from 'etro';
import { Download, LoaderCircle } from 'lucide-react';

import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import axios from 'axios';
import { toast } from 'react-toastify';

const downloadImagesAsZip = async (images: { url: string; start: number; end: number }[], audioUrl:string, folderName:string) => {
  const zip = new JSZip();

  try {
    const imagePromises = images.map(async (image, index) => {
      const response = await axios.get(image.url, { responseType: 'blob' });
      const fileName = `img${index}-${image.start}-${image.end}.png`;
      zip.file(fileName, response.data, { binary: true });
    });

    const audioPromise = axios.get(audioUrl, { responseType: 'blob' }).then((response) => {
      const audioFileName = `audio.mp3`;
      zip.file(audioFileName, response.data, { binary: true });
    });

    await Promise.all([...imagePromises, audioPromise]);
    const content = await zip.generateAsync({ type: 'blob' });
    saveAs(content, folderName+'.zip');
    toast.success('Images and audio downloaded as a ZIP file!');
  } catch (error) {
    toast.error('Error downloading files!');
    console.error('Error:', error);
  }
};


export default  function VideoDownload({ data }: any) {
    const [isRendering, setIsRendering] = useState(false);
    
    async function handleClick() {
        setIsRendering(true);

        console.log(data);
        await downloadImagesAsZip(data.images, data.audio, data.title+" "+data.id)

        setIsRendering(false);
    }

    return (
        <div>
            <button id="recordButton" onClick={handleClick} className='border rounded-2xl px-2 py-1' disabled={isRendering}>
                {isRendering ? 
                    <LoaderCircle className='animate-spin' /> 
                    :
                    <Download />
                }
            </button>
        </div>
    );
}
