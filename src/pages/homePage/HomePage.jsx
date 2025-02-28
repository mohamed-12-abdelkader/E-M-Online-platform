import React from 'react'
import MyLecture from '../leacter/MyLecture'
import MyTeacher from '../myTeacher/MyTeacher'

const HomePage = () => {
  return (
    <div className='mb-[150px]'>

        <MyTeacher/>
        <MyLecture/>
    </div>
  )
}

export default HomePage