import AudioPlayer from '@/components/global/audio-player'
import VideoDownload from '@/components/global/VideoDownload'
import { db } from '@/lib/db'
import React from 'react'
import { json } from 'stream/consumers'

type Props = {
  params:{
    id: string
  }
}
export type SceneType = { text:string, prompt:string, url:string, start:number, end:number} 

export default async function page({params}: Props) {
  const id = params.id

  const data = await db.project.findUnique({
    where: {
      id: id
    }
  })
  if(!data)return;
  const emojis = Object.create(JSON.parse(data?.emoji))

  function findEmoji(word:string){
    return emojis[word]
  }
  function getFileNameFromUrl(url:string) {
    const regex = /\/([^\/?#]+)[^\/]*$/;
    const match = url.match(regex);
    return match ? match[1] : null;
  }

  const script : SceneType[] = []
  if(data)
  for(let i = 0; i<data.sentences.length; i++){
    script.push({
      text: data.sentences[i].text,
      ...data.images[i]
    })
  }

  return (
    <div>
      <div className='flex justify-between px-5 h-screen pt-14'>
        <div className='w-1/2'>
          <VideoDownload data={data} />
          <h1 className=' text-3xl font-bold text-blue-500'>{data?.title}</h1>
          <div className=' h-[calc(100vh-100px)] overflow-y-scroll scroll-smooth border m-1'>
          {script?.map((scene:SceneType)=>{
            return (
              <div key={getFileNameFromUrl(scene.url)} className='flex gap-3 px-2 my-1 border '>
                <img src={scene.url} alt="" width={100} />
                <div>
                  {[...scene.text.split(/\s+/)]?.map((word:string)=>(
                    <span key={word} className=''> {"["}{word} { emojis[word.replace(/[\s,\.]+$/, '')]} {"]"} </span>
                  ))}
                  <p className='text-red-500'>{scene.start} - {scene.end}</p>
                </div>
                
              </div>
            )
          })}
          </div>
        </div>
        <div className='flex items-center justify-center w-1/2'>
          <div className='flex gap-2 flex-col items-center'>
            <AudioPlayer data={data} scenes={script} />
          </div>
        </div>
      </div>
    </div>
  )
}