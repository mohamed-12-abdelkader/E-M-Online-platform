import React from "react";
import img from "../../img/Red and Blue Badminton Team Sport Logo (7).png";
import { Button, Card, CardBody } from "@chakra-ui/react";
import { Link } from "react-router-dom";

const Exams = () => {
  return (
    <div className='w-[90%] m-auto my-5'>
      {/* Section التعريفي */}
      <div className='text-center bg-blue-50 p-5 rounded-lg shadow-lg mb-8'>
        <img
          src={img}
          alt='Exams Intro'
          className='m-auto w-[150px] h-[150px] object-cover'
        />
        <h1 className='text-2xl font-bold mt-4'>
          مرحبًا بكم في منصة الامتحانات
        </h1>
        <p className='text-gray-600 mt-2'>
          هنا يمكنك الوصول إلى جميع الامتحانات المتاحة بطريقة سهلة وبسيطة.
        </p>
      </div>

      {/* Cards Section */}
      <div className='flex flex-wrap justify-center gap-5'>
        {/* Card 1 */}
        <Card
          className='w-[300px] shadow-md hover:shadow-lg transition-shadow duration-300'
          style={{ border: "1px solid #ccc" }}
        >
          <CardBody>
            <img
              src={img}
              className='h-[200px] w-[100%] object-cover rounded-md'
              alt='Course'
            />
            <div className='mt-4 text-center'>
              <h1 className='font-bold text-lg'>امتحان اللغة الانجليزية</h1>
            </div>
          </CardBody>
          <hr />
          <div className='my-3 text-center'>
            <Link to={`/exams/1`}>
              <Button
                colorScheme='blue'
                variant='solid'
                className='w-[90%] m-auto'
              >
                دخول الامتحان
              </Button>
            </Link>
          </div>
        </Card>

        {/* Card 2 */}
        <Card
          className='w-[300px] shadow-md hover:shadow-lg transition-shadow duration-300'
          style={{ border: "1px solid #ccc" }}
        >
          <CardBody>
            <img
              src={img}
              className='h-[200px] w-[100%] object-cover rounded-md'
              alt='Course'
            />
            <div className='mt-4 text-center'>
              <h1 className='font-bold text-lg'>امتحان اللغة العربية</h1>
            </div>
          </CardBody>
          <hr />
          <div className='my-3 text-center'>
            <Link to={`/month/1`}>
              <Button
                colorScheme='blue'
                variant='solid'
                className='w-[90%] m-auto'
              >
                دخول الامتحان
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Exams;
