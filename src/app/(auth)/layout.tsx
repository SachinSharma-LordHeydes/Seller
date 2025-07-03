import React from 'react'

const layout = ({children}:{children:React.ReactNode}) => {
  return (
    <div className='flex justify-center items-center min-w-screen min-h-screen'>
      {children}
    </div>
  )
}

export default layout
