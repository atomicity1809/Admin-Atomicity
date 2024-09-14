import { Button } from '@/components/ui/button'
import Link from 'next/link'
import React from 'react'

const page = () => {
  return (
    <div className='flex items-center justify-center mt-[20%]'>
      welcome to 

      <Link href="/dashboard">
        <Button className=' ml-3'>
          Admin @ Atomicity
        </Button>
      </Link>
    </div>
  )
}

export default page
