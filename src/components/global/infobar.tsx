import { VideoIcon } from 'lucide-react'
import Link from 'next/link'
import React from 'react'
import { Button } from '../ui/button'
import { NewProjectDialog } from './new-project-dialog'
import { ModeToggle } from './mode-toggle'
import { toast } from 'sonner'
import { SignedIn, UserButton } from '@clerk/nextjs'

type Props = {
  userId : string | null
}

export default function Infobar({userId}: Props) {
  return (
    <header className="px-4 lg:px-6 h-14 flex items-center justify-between fixed top-0 left-0 w-full backdrop-blur-md">
        <Link href="/" className="flex items-center justify-center" prefetch={false}>
          <VideoIcon className="h-6 w-6" />
          <span className="pl-3 text-2xl font-bold">SmartVids</span>
        </Link>
        <div className='flex justify-center'>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Link href="#" className="text-sm font-medium underline-offset-4" prefetch={false}>
            Features
          </Link>
          <Link href="#" className="text-sm font-medium underline-offset-4" prefetch={false}>
            Pricing
          </Link>
          <Link href="#" className="text-sm font-medium underline-offset-4" prefetch={false}>
            About
          </Link>
          <Link href="#" className="text-sm font-medium underline-offset-4" prefetch={false}>
            Contact
          </Link>
        </nav>
        </div>
        <div className='flex gap-2'>
          <ModeToggle />
          <NewProjectDialog userId={userId} />
          <SignedIn>
              <UserButton />
          </SignedIn>
        </div>
      </header>
  )
}