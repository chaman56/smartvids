import { NextResponse } from 'next/server';
import axios from 'axios';
import { gemini } from '../_utils/config';

export async function POST(request: Request) {
  try {
    const { prompt } = await request.json();
    console.log(prompt)
    var newPrompt = " I will give a topic or a sentance on which you have to generate a short explanation script for the videos of length 1 minutes approximatly 1000 charecters. keep the words simple, natural, and story like. Output should be only simple text, no asterics, stars, headings etc.   The Topic is : \n" + prompt
    const result = await gemini.generateContent(newPrompt);
    const response = await result.response;
    const text = response.text();
    console.log(text);
    return NextResponse.json({"script":response.text()});
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}