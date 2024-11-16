import React, { useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  Stack,
  Skeleton,
  Button,
  Spinner,
  useDisclosure,
} from "@chakra-ui/react";
import { MdCancelPresentation } from "react-icons/md";
import { FaFileVideo } from "react-icons/fa6";
import { Zoom } from "react-awesome-reveal";
import PurchaseAlert from "../../ui/modal/PurchaseAlert";
import GitTeacherDetails from "../../Hooks/teacher/GitTeacherDetails";
import GitLecture from "../../Hooks/student/GitLecture";
import BuyLecture from "../../Hooks/student/BuyLecture";
import ScrollToTop from "../../components/scollToTop/ScrollToTop";
import GitMonthes from "../../Hooks/student/GitMonths";
import TeacherHeader from "../../components/teacher/TeacherHeader";
import TeacherInfo from "../../components/teacher/TeacherInfo";
import LectureCard from "../../components/teacher/LectureCard";

import Loading from "../../components/loading/Loading";

const TeacherDetails = () => {
  const { id } = useParams();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = React.useRef();
  const [teacherLoading, teacher] = GitTeacherDetails({ id });
  const [lectureLoading, lectures] = GitLecture({ id });
  const [monthes, monthesLoading] = GitMonthes({ id });
  const [buyLoading, buyLecture, buyMonth] = BuyLecture();
  const [selectedLecture, setSelectedLecture] = useState(null);

  if (teacherLoading || lectureLoading || monthesLoading) {
    return <Loading />;
  }

  if (!teacher || teacher.teacher.length === 0) {
    return (
      <div className='mt-[150px] text-center' style={{ minHeight: "70vh" }}>
        <div className='h-[200px] w-[90%] m-auto border shadow flex justify-center items-center'>
          <p className='font-bold'>هذا المدرس غير موجود على الموقع</p>
        </div>
      </div>
    );
  }

  return (
    <div className='mt-[80px] mb-[120px]'>
      <div className='m-auto mx-auto mb-[50px]'>
        <TeacherInfo
          teacher={teacher.teacher}
          number={teacher.months && teacher.months.length}
        />
        <div className='m-auto border shadow w-[95%] mt-[200px]'>
          <div className='my-5'>
            <h1 className='font-bold flex text-xl '>
              <FaFileVideo className='m-1 text-red-500' />
              كل الكورسات
            </h1>
          </div>
          <div>
            {teacher.months && teacher.months.length > 0 ? (
              <div
                className='flex flex-wrap justify-center my-3 bg-white w-[95%] m-auto p-3 md:justify-start flex-wrap'
                style={{ borderRadius: "20px" }}
              >
                {teacher.months.map((lecture) => (
                  <LectureCard
                    key={lecture.id}
                    lecture={lecture}
                    onOpen={onOpen}
                    setSelectedLecture={setSelectedLecture}
                  />
                ))}
              </div>
            ) : (
              <div
                className='h-[200px] flex justify-center items-center bg-white'
                style={{ borderRadius: "20px" }}
              >
                <h1 className='font-bold flex text-xl text-black'>
                  <MdCancelPresentation className='text-red-500 m-2' />
                  لا يوجد كورسات الان سوف يتم اضافتها فى اقرب وقت ممكن
                </h1>
              </div>
            )}
          </div>
        </div>
      </div>
      <PurchaseAlert
        isOpen={isOpen}
        onClose={onClose}
        cancelRef={cancelRef}
        selectedLecture={selectedLecture}
        buyLoading={buyLoading}
        buyMonth={buyMonth}
      />
      <ScrollToTop />
    </div>
  );
};

export default TeacherDetails;
