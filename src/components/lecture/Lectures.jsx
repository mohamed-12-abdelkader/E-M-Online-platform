import { Button, Card, CardBody, Skeleton, Stack } from "@chakra-ui/react";
import { MdOutlineVideoLibrary, MdCancelPresentation } from "react-icons/md";
import { Link } from "react-router-dom";
import GitMyMonthes from "../../Hooks/student/GitMyMonthes";
import { CoursesCard } from "../../ui/card/CoursesCard";

const Lectures = () => {
  const [myMonth, myMonthLoading] = GitMyMonthes();

  return (
    <div className=' '>
      <div className=''>
        <h1
          className='fonts font-bold text-3xl flex text-[#03a9f5] my-3'
          style={{ fontWeight: "bold", fontSize: "30px" }}
        >
          <MdOutlineVideoLibrary className='m-1 mx-2 text-red-500' />
          كورساتي
        </h1>
      </div>
      <div>
        {myMonthLoading ? (
          <Stack className='w-[90%] m-auto my-5'>
            <Skeleton height='20px' className='mt-5' />
            <Skeleton height='20px' />
            <Skeleton height='20px' />
            <Skeleton height='20px' />
            <Skeleton height='20px' />
            <Skeleton height='20px' />
            <Skeleton height='20px' />
          </Stack>
        ) : myMonth && myMonth.length > 0 ? (
          <div
            className='w-[%] m-auto card-content  bg flex justify-center md:justify-start flex-wrap'
            style={{ borderRadius: "20px" }}
          >
            {myMonth.map((lectre, index) => (
              <CoursesCard
                key={lectre.id || index}
                lectre={lectre}
                href={`/month/${lectre.id}`}
                type={"my_courses"}
              />
            ))}
          </div>
        ) : (
          <div
            className='text-center py-5 bg-white h-[200px] flex justify-center items-center'
            style={{ borderRadius: "20px" }}
          >
            <h1 className='font-bold flex justify-center text-black'>
              <MdCancelPresentation className='m-1 text-red-500' />
              انت لست مشترك فى كورسات الان
            </h1>
          </div>
        )}
      </div>
    </div>
  );
};

export default Lectures;
