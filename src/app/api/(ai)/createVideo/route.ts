import { NextResponse } from 'next/server';
import axios from 'axios';
import { uploadAudioToCloudinary } from '@/lib/audio_upload';
import { generateAudioWithTimestamp } from '../_utils/utils';

type data = {
    promt_type: string,
    script : string,
    audio_url : string,
    voices_id: string,
    time_limit: number,
    has_transition: boolean,
    has_sound_effects: boolean,
    remove_silence: boolean,
    has_animated_footage: boolean,
    aspect_ratio: string
}

export async function POST(request: Request){
    try {
        //const { promt_type, script, audio_url, voices_id, time_limit, has_transition, has_sound_effects, remove_silence, has_animated_footage, aspect_ratio } =;
        const data =  await request.json();
        const { promt_type, script, audio_url, voices_id, time_limit, has_transition, has_sound_effects, remove_silence, has_animated_footage, aspect_ratio }  = data.data
        console.log( ":", script)

        if(promt_type === 'prompt'){
            const res = generateAudioWithTimestamp(voices_id, script)
            return NextResponse.json({"audio":res}, {status:200})
        }
        return NextResponse.json({"script":script}, {status:200})
    } catch (error) {
        return NextResponse.json({ error: 'Failed to create video.' }, { status: 500 });
    }
}