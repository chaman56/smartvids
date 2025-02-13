import Infobar from '@/components/global/infobar'
import Navbar from '@/components/global/navbar'
import React, { createContext, useEffect } from 'react'
import {auth} from '@clerk/nextjs/server'
import ProjectProvider from '@/providers/WorkspaceContext'

type Props = {
    children: React.ReactNode
}

const layout = ({children}: Props) => {
  const userId = auth();

  
  
  return (
    <ProjectProvider >
    <div>
        <Infobar userId={userId?.userId}  />
        {children}
    </div>
    </ProjectProvider>
  )
}

export default layout