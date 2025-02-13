import { NextResponse } from 'next/server';
import { gemini } from '../_utils/config';
import { generateImage } from '@/lib/image_generator';
import { generationConfig, title_thumbnail_parts } from '../_utils/config';
import { db } from '@/lib/db';
import { generateAudioWithTimestamp, generateEmojis } from '../_utils/utils';
import { completeTheProject } from '../_utils/projectCompletion';

export async function POST(request: Request) {
  try {
    const data =  await request.json();
    const { userId, promt_type, prompt, script, audio_url, voices_id, time_limit, has_transition, has_sound_effects, remove_silence, has_animated_footage, aspect_ratio }  = data.data
    if(promt_type === 'prompt'){
        let parts = title_thumbnail_parts
        parts.push({text: "input: "+script})
        parts.push({text: "output: "})
        
        const result = await gemini.generateContent({
            contents: [{ role: "user", parts }],
            generationConfig,
        });
        const text = JSON.parse(result.response.text()); console.log(result.response.text())
        const imageResponse = await generateImage(text.prompt, aspect_ratio)
        
        if(imageResponse.status === "error"){
            console.log("⚠️",imageResponse.error)
            return NextResponse.json({ error: imageResponse.error}, { status: 500 });
        }

        const project = await db.project.create({
            data : {
                title: text.title,
                thumbnail: imageResponse.url,
                thumbnailprompt : text.prompt,
                script,
                voice_id: voices_id,
                time_limit,
                has_transition,
                has_sound_effects,
                remove_silence,
                has_animated_footage,
                aspect_ratio,
                audio: "", 
                duration: 0, 
                emoji: "",
                createdAt: new Date(),
                user : {
                  connect : {id: userId}
                }
            }
        })
        completeTheProject(project)
        console.log(project.id , project)
        return NextResponse.json(project, { status: 200 })
    }
    return NextResponse.json({"script":script});
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}