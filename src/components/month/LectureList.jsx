import { Stack, Skeleton } from "@chakra-ui/react";
import { GoArrowLeft } from "react-icons/go";
import { Link } from "react-router-dom";

import { Zoom } from "react-awesome-reveal";
import { CoursesCard } from "../../ui/card/CoursesCard";
const LectureList = ({
  lectures,
  isTeacher,
  onOpen,
  setSelectedLecture,
  monthLoading,
}) => {
  if (monthLoading) {
    return (
      <Stack
        className='w-[90%] m-auto my-5 mt-[150px]'
        style={{ minHeight: "80vh" }}
      >
        <Skeleton height='20px' className='mt-5' />
        <Skeleton height='20px' />
        <Skeleton height='20px' />
        <Skeleton height='20px' />
        <Skeleton height='20px' />
        <Skeleton height='20px' />
        <Skeleton height='20px' />
      </Stack>
    );
  }

  if (!lectures || lectures.length === 0) {
    return (
      <div className='flex items-center justify-center h-[200px]'>
        {isTeacher ? (
          <h1 className='font-bold flex'>
            لا يوجد محاضرات فى هذا الكورس
            <GoArrowLeft className='text-red-500 m-2' />
            <Link to={`/admin/add_lecture_month`}>
              <span className='text-red-500'>اضف محاضراتك الان </span>
            </Link>
          </h1>
        ) : (
          <h1 className='font-bold'>سوف يتم إضافة المحتوى قريبًا</h1>
        )}
      </div>
    );
  }

  return (
    <div className='flex flex-wrap justify-center px-auto my-3 w-[98%] m-auto md:justify-start'>
      {lectures.map((lecture) => (
        <Zoom key={lecture.id}>
          <CoursesCard
            type={"lecture"}
            handleDeleate={() => {
              setSelectedLecture(lecture);
              onOpen();
            }}
            lectre={lecture}
            href={`/lecture/${lecture.id}`}
          />
        </Zoom>
      ))}
    </div>
  );
};

export default LectureList;
