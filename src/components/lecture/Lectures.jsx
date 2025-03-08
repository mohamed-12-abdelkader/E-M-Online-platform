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
            <div className='relative mt-10 md:mt-0 flex items-center justify-center'>
              <motion.div animate={{ y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }} className='w-[300px] h-[300px] sm:w-[350px] sm:h-[350px] md:w-[420px] md:h-[420px] bg-blue-500 rounded-full flex items-center justify-center shadow-2xl'>
                <img src={img} alt='Hero Section' className='w-[260px] h-[260px] sm:w-[310px] sm:h-[310px] md:w-[360px] md:h-[360px] rounded-full border-4 border-gray-300 shadow-xl' />
              </motion.div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default Lectures;
