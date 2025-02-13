import { Button } from '@/components/ui/button'
import { db } from '@/lib/db'
import React from 'react'
import {auth} from '@clerk/nextjs/server'
import Link from 'next/link'

type Props = {}

async function Workspace({}: Props) {
  const { userId } = auth();
  if(!userId)return;

  // Maybe Make it under UseEffect
  const data = await db.user.findUnique({ 
    where :{ id : userId },
    include: { projects: true }
  })
  const projects = data?.projects
  
  function textShortner(text:string, length:number){
    if(text.length>length){
      return text.substring(0,length) + "..."
    }
    return text
  }

  return (
    <div className=''>
      <h1 className=' px-6  font-bold text-gray-500 pt-14 pb-3'>
        Your Projects will be displayed below.
      </h1>
      <div className='p-4 m-4 border max-w-[500px]'>
        {projects ? projects.map((project:any)=>(
          <div className='flex gap-2'>
            <img src={project.thumbnail} alt="Project Thumbnail" width={100}/>
            <div className='p-2 relative'>
              <h1 className='text-xl font-bold'>{project.title}</h1>
              <p>{textShortner(project.script, 100)}</p>
              <div className='absolute bottom-0 right-0'>
              {project.processing ? 
                <div>Processing</div>
                :
                <Link href={'/workspace/project/'+project.id} className='border border-gray-400 px-5 py-1 rounded-3xl hover:font-bold' >Visit</Link>
              }
              </div>
            </div>
          </div>
        )):
          <div>No Projects Created Yet</div>
        }
      </div>
    </div>
  )
}

export default Workspace