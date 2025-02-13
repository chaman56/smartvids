import { VideoIcon } from 'lucide-react'
import Link from 'next/link'
import React from 'react'
import { Button } from '../ui/button'

type Props = {}

export default function Navbar({}: Props) {
  return (
    <header className="px-4 lg:px-6 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center justify-center">
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
        <Link href='/workspace'>
            <Button className="ml-4 hidden sm:inline-flex">Try for Free</Button>
        </Link>
      </header>
  )
}