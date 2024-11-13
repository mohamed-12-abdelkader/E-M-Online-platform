import Marquee from "react-fast-marquee";
import GitAllTeacher from "../../Hooks/teacher/GitAllTeacher";

import { Skeleton, Stack } from "@chakra-ui/react";

const AllTeacher = () => {
  const [loading, teachers] = GitAllTeacher();

  if (loading) {
    return (
      <Stack className="w-[90%] m-auto">
        <div className="flex justify-center">
          <div className="">
            <h1 className="big-font m-4 text-xl text-center">
              E-M online Teachers
            </h1>
          </div>
        </div>
        <Skeleton height="20px" className="mt-5" />
        <Skeleton height="20px" />
        <Skeleton height="20px" />
        <Skeleton height="20px" />
        <Skeleton height="20px" />
      </Stack>
    );
  }

  return (
    <div className=" py-5 mb-5 w-full">
      <div className="flex justify-center">
        <div className="">
          <h1 className="big-font m-2 text-xl text-center text-[#03a9f5] ">
            E-M online Teachers
          </h1>
        </div>
      </div>
      {teachers.length === 0 ? (
        <div>
          <div className="w-90 border shadow h-250 m-auto my-8 flex justify-center items-center">
            <div className="ribbon">
              <h1 className="font-bold text-xl m-2">لا يوجد مدرسين الان !!!</h1>
            </div>
          </div>
        </div>
      ) : (
        <div dir="ltr" className="w-[100%] my-5">
          <Marquee>
            <div className="flex justify-center flex-wrap">
              {teachers.map((teacher) => (
                <div key={teacher.id} className="m-2 w-[200px] text-center">
                  <img
                    src={teacher.image}
                    className="w-[180px] h-[180px]"
                    style={{ borderRadius: "50%" }}
                  />
                  <h1 className="my-2  font-bold">{teacher.name}</h1>
                  <h1 className="my-2  font-bold">مدرس</h1>
                </div>
              ))}
              {teachers.map((teacher) => (
                <div key={teacher.id} className="m-2 w-[200px] text-center">
                  <img
                    src={teacher.image}
                    className="w-[180px] h-[180px]"
                    style={{ borderRadius: "50%" }}
                  />
                  <h1 className="my-2  font-bold">{teacher.name}</h1>
                  <h1 className="my-2  font-bold">مدرس</h1>
                </div>
              ))}
            </div>
          </Marquee>
        </div>
      )}
    </div>
  );
};

export default AllTeacher;
