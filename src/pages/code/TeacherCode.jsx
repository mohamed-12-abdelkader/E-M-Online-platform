import React from "react";

const TeacherCode = () => {
  const codes = JSON.parse(localStorage.getItem("code"));
  console.log(codes);
  return (
    <div className='my-[120px] w-[95%] m-auto'>
      <div className='flex flex-wrap '>
        {codes.codes.map((code, index) => (
          <div key={index} className='h-[150px] w-[390px] m-1 border code'>
            <div className='text-center my-2'>
              <h1 className='text-xl font-bold'> {codes.name} </h1>
            </div>
            <div className='text-center flex justify-between px-2'>
              <h1 className='text-xl font-bold my-3 '> كود التفعيل : </h1>
              <h3 className='text-xl font-bold my-3 text-red-800'>{code}</h3>
            </div>
            <div className='px-2'>
              <h1 className='text- font-bold'>ارقام الدعم الفنى </h1>
              <div className='flex justify-between'>
                <h1 className='font-bold'>01286525940</h1>
                <h1 className='font-bold'>01111272393</h1>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TeacherCode;
