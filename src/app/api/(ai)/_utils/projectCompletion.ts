import { db } from "@/lib/db"
import { generateAllImages, generateAudioWithTimestamp, generateEmojis, generateImagePrompts, groupWords } from "./utils"

export async function completeTheProject(project: any) {
    const {audio, duration , words, start, end} = await generateAudioWithTimestamp(project.voice_id, project.script)

    await db.project.update({
        where: { id: project.id },
        data: { audio, duration, words, start, end, }
    })
    console.log("🔉 audio updated :  " ,audio)

    const emojis = await generateEmojis(words);
    await db.project.update({
      where: { id: project.id },
      data:{
        emoji: emojis
      }
    })
    console.log("😂 emoji generated :  " ,emojis)

    const sentences = await groupWords(words, start, end);
    await db.project.update({
      where: { id: project.id },
      data:{
        sentences
      }
    })
    console.log("✅ sentences generated :  " ,sentences)

    const sentenceArray = sentences.map(sentence => sentence.text)
    const imagePrompts = await generateImagePrompts(sentenceArray);
    console.log("✅ image prompts generated :  " ,imagePrompts)
    
    const imageUrls = await generateAllImages(imagePrompts, project.aspect_ratio);
    const images = []
    for (let i = 0; i < imagePrompts.length; i++) {
        const image = {
            prompt: imagePrompts[i],
            url: imageUrls[i],
            start:sentences[i].start,
            end: sentences[i].end
        }
        images.push(image)
    }

    await db.project.update({
      where: { id: project.id },
      data:{
        images,
        processing : false
      }
    })
    console.log("✅ images generated :  " ,images)

    const newProject = await db.project.findUnique({
        where : {id: project.id}
    })
    console.log(newProject)
    return newProject
}