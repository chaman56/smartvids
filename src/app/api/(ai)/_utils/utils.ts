import { uploadAudioToCloudinary } from "@/lib/audio_upload";
import axios from "axios";
import { emoji_parts, gemini, generationConfig, image_prompt_parts } from "./config";
import { Sentance } from "@/lib/types";
import { generateImage } from "@/lib/image_generator";


interface Stamp {
  characters: string[];
  character_start_times_seconds: number[];
  character_end_times_seconds: number[];
}
interface RenderedTimestamps {
  words: string[];
  start: number[];
  end: number[];
}

export function renderTimestamps(stamp: Stamp, limit: number = 2): RenderedTimestamps {
  const { characters, character_start_times_seconds, character_end_times_seconds } = stamp;
  let buffer = '';
  const words: string[] = [];
  const start: number[] = [];
  const end: number[] = [];

  for (let i = 0; i < characters.length; i++) {
    if (characters[i] === ' ' || characters[i] === '\n') {
      if (buffer === '') continue;
      words.push(buffer);
      buffer = '';
      end.push(character_end_times_seconds[i]);
    } else {            
      if (buffer.length === 0) {
        start.push(character_start_times_seconds[i]);
      }
      buffer += characters[i];
    }
  }

  if (buffer.length !== 0) {
    words.push(buffer);
    end.push(character_end_times_seconds[character_end_times_seconds.length - 1]);
  }

  return { words, start, end };
}

export async function generateAudioWithTimestamp(voices_id:string, script:string): Promise<{audio: string, duration:number, words: string[], start: number[], end: number[]} > {
  const XI_API_KEY = process.env.XI_API_KEY;

  const data = {
    text: script,
    model_id: 'eleven_multilingual_v2',
    voice_settings: {
      stability: 0.5,
      similarity_boost: 0.75
    }
  };
  const req_url = `https://api.elevenlabs.io/v1/text-to-speech/${voices_id}/with-timestamps`;
  const headers = {
    'Content-Type': 'application/json',
    'xi-api-key': XI_API_KEY
  };

  try {
    console.log('🔃 Generating Audio ...');
    const response = await axios.post(req_url, data, { headers });

    if (response.status !== 200) {
      console.error(`Error encountered, status: ${response.status}, content: ${response.data}`);
      return {audio:"",duration:0,words:[],start:[],end:[]}
    }
    const responseDict = response.data;
    const audioBytes = Buffer.from(responseDict.audio_base64, 'base64');
    const {url, duration } = await uploadAudioToCloudinary(audioBytes, 'audio.mp3')
    const stamps = responseDict['alignment']
    const { words, start, end } = renderTimestamps(stamps);

    return { audio:url, duration , words, start, end }
  } catch (error) {
    console.error('Error creating text-to-speech:', error);
    return {audio:"",duration:0,words:[],start:[],end:[]}
  }
}

export async function generateEmojis(words: string[]) {
    const parts = emoji_parts
    parts.push({text: "input: " + words.join(" ")});
    parts.push({text: "output: "});
    const res = await gemini.generateContent({
        contents: [{ role: "user", parts }],
        generationConfig,
    });
    return res.response.text();
}


export async function groupWords(words: string[], start: number[], end: number[], limit: number = 2) : Promise<Sentance[]> {
  var sentances : Sentance[] = [], j =0;
  
  while(j < words.length){
      var begin = start[j]
      var sentance = ""
      while(j<words.length && end[j]-begin<limit){
          sentance+=words[j]+" "; j++
      }
      if(j<words.length){
        sentance+=words[j]
        sentances.push({
          text: sentance,
          start: begin,
          end: end[j]
        })
      }else{
        sentances.push({
          text: sentance,
          start: begin,
          end: end[j-1]
        })
      }
      j++;
  }
  return sentances
}

export async function generateImagePrompts(sentences:string[]) : Promise<string[]> {
  let parts = image_prompt_parts
  parts.push({text: "input: "+ JSON.stringify(sentences)})
  parts.push({text: "output: "})
  
  const result = await gemini.generateContent({
      contents: [{ role: "user", parts }],
      generationConfig,
  });
  const text = await JSON.parse(result.response.text())
  const imagePrompts = await text.map((item:{text:string,prompt:string})=>item.prompt)
  return imagePrompts
}

export async function generateAllImages(imagePrompts:string[], aspect_ratio:string) : Promise<string[]> {
  let images = []
  for (let i = 0; i < imagePrompts.length; i++) {
    const image = await generateImage(imagePrompts[i], aspect_ratio)
    if (image.status === 'success' ) console.log("imeage "+(i+1)+"Generated")
    images.push(image.url)
  }
  return images
}
