import { Button, Card, CardBody, Skeleton, Stack } from "@chakra-ui/react";
import { MdOutlineVideoLibrary } from "react-icons/md";
import { FaSearch } from "react-icons/fa";
import { Link } from "react-router-dom";
import GitMyMonthes from "../../Hooks/student/GitMyMonthes";
import { CoursesCard } from "../../ui/card/CoursesCard";
import img from "../../img/Screenshot_2025-03-07_203419-removebg-preview.png";
import { motion } from "framer-motion";

const Lectures = () => {
  const [myMonth, myMonthLoading] = GitMyMonthes();

  return (
    <div>
      <div>
        <h1 className='font-bold text-3xl flex text-[#03a9f5] my-3'>
          <MdOutlineVideoLibrary className='m-1 mx-2 text-red-500' />
          كورساتي
        </h1>
      </div>
      <div>
        {myMonthLoading ? (
          <Stack className='w-[90%] m-auto my-5'>
            {[...Array(7)].map((_, i) => (
              <Skeleton key={i} height='20px' className='mt-5' />
            ))}
          </Stack>
        ) : myMonth?.length > 0 ? (
          <div className='w-full m-auto flex justify-center md:justify-start flex-wrap' style={{ borderRadius: "20px" }}>
            {myMonth.map((lecture, index) => (
              <CoursesCard
                key={lecture.id || index}
                lectre={lecture}
                href={`/month/${lecture.id}`}
                type='my_courses'
              />
            ))}
          </div>
        ) : (
          <section dir='rtl' className='flex mb-8 flex-col md:flex-row items-center justify-between px-6 md:px-12 py-12'>
            <div dir='rtl' className='max-w-lg text-right space-y-5'>
              <h1 className='text-2xl font-bold '>🚀 لم تقم بالاشتراك فى أي كورسات  بعد!</h1>
              <p className='text-lg font-medium '>
               بمجرد الاشتراك فى اى كورسات سوف تظهر فى هذا القسم 
              </p>
             
            </div>
       
          </section>
        )}
      </div>
    </div>
  );
};

export default Lectures;
