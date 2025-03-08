import React from "react";

const TeacherHeader = ({ subject, name }) => (
  <div className='header  h-[200px] w-[100%] mb-5 bg-gradient-to-r from-cyan-300 to-blue-700'>
    <div className='flex justify-center items-center h-[150px]'>
      <div className='text-center'>
        <h1 className='fonts font-bold text-xl text-white'>
          منهج ال {subject} مع {name}
        </h1>
      </div>
    </div>
    <svg
      className='waves'
      xmlns='http://www.w3.org/2000/svg'
      viewBox='0 24 150 28'
      preserveAspectRatio='none'
      shape-rendering='auto'
    >
      <defs>
        <path
          id='gentle-wave'
          d='M-160 44c30 0 58-18 88-18s 58 18 88 18 58-18 88-18 58 18 88 18 v44h-352z'
        />
      </defs>
      <g className='parallax'>
        <use
          xlinkHref='#gentle-wave'
          x='48'
          y='0'
          fill='rgba(255,255,255,0.7'
        />
        <use
          xlinkHref='#gentle-wave'
          x='48'
          y='3'
          fill='rgba(255,255,255,0.5)'
        />
        <use
          xlinkHref='#gentle-wave'
          x='48'
          y='5'
          fill='rgba(255,255,255,0.3)'
        />
        <use xlinkHref='#gentle-wave' x='48' y='7' fill='#fff' />
      </g>
    </svg>
  </div>
);

export default TeacherHeader;
