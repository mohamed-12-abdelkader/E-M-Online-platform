import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { useDisclosure } from "@chakra-ui/react";
import GitLecturMonth from "../../Hooks/teacher/GitLecturMonth";
import DeleateLecture from "../../Hooks/teacher/DeleateLecture";
import ScrollToTop from "../../components/scollToTop/ScrollToTop";
import UserType from "../../Hooks/auth/userType";
import MonthHeader from "../../components/month/MonthHeader";
import LectureList from "../../components/month/LectureList";
import LectureDialog from "../../components/month/LectureDialog";
import Loading from "../../components/loading/Loading";

const Month = () => {
  const { id } = useParams();
  const [months, monthLoading] = GitLecturMonth({ id });
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = React.useRef();
  const [selectedLecture, setSelectedLecture] = useState(null);
  const [deleteOnlineLoading, deleteLecture] = DeleateLecture({ m_id: id });
  const [userData, isAdmin, isTeacher, student] = UserType();

  const handleDelete = () => {
    if (selectedLecture) {
      deleteLecture({ l_id: selectedLecture.id });
      onClose();
    }
  };

  if (monthLoading) {
    return <Loading />;
  }

  if (!months || !months.monthData) {
    return <div>Error loading data</div>;
  }

  return (
    <div className='my-[120px]' style={{ minHeight: "80vh" }}>
      {months.monthData.image && (
        <MonthHeader
          image={months.monthData.image}
          description={months.monthData.description}
          noflecture={months.monthData.noflecture}
        />
      )}

      <div className='w-[90%] m-auto border shadow my-[50px] p-3'>
        <div className='flex text-xl'>
          <h1 className='font-bold'>
            عدد المحاضرات: ({months.monthData.noflecture})
          </h1>
        </div>

        <LectureList
          lectures={months.monthcontent}
          isTeacher={isTeacher}
          onOpen={onOpen}
          setSelectedLecture={setSelectedLecture}
          monthLoading={monthLoading}
        />
      </div>

      <LectureDialog
        isOpen={isOpen}
        onClose={onClose}
        cancelRef={cancelRef}
        selectedLecture={selectedLecture}
        onDelete={handleDelete}
        deleteLoading={deleteOnlineLoading}
      />

      <ScrollToTop />
    </div>
  );
};

export default Month;
