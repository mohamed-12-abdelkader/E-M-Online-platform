import { useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { Button, Spinner, useDisclosure } from "@chakra-ui/react";
import GitGroupStudent from "../../Hooks/groups/GitGroupStudent";
import DeleateGroup from "../../Hooks/teacher/DeleateGroup";
import DeleateStudentGroup from "../../Hooks/teacher/DeleateStudentGroup";
import GitClasses from "../../Hooks/teacher/GitClasses";
import OpenLectureToGroup from "../../Hooks/groups/OpenLecture";
import GitTeacherMonth from "../../Hooks/teacher/GitTeacherMonth";
import ScrollToTop from "../../components/scollToTop/ScrollToTop";
import Loading from "../../components/loading/Loading";
import DeleteGroupDialog from "../../components/group/DeleteGroupDialog";
import LectureSelector from "../../components/group/LectureSelector";
import StudentList from "../../components/group/StudentList";
import DeleteStudentDialog from "../../components/group/DeleteStudentDialog";

const GroupDetails = () => {
  const { id } = useParams();
  const [classesLoading, classes] = GitClasses();
  const [studentLoading, students] = GitGroupStudent({ id });
  const [deleteLoading, deleteGroup] = DeleateGroup();
  const [deleteStudentLoading, deleteStudent] = DeleateStudentGroup({
    group_id: id,
  });
  const {
    isOpen: isGroupDeleteOpen,
    onOpen: onGroupDeleteOpen,
    onClose: onGroupDeleteClose,
  } = useDisclosure();
  const {
    isOpen: isStudentDeleteOpen,
    onOpen: onStudentDeleteOpen,
    onClose: onStudentDeleteClose,
  } = useDisclosure();
  const [selectedStudent, setSelectedStudent] = useState(null);
  const cancelRef = useRef();
  const [handleOpenLecture, m_id, setm_id, g_id, setGrad, loadingOpen] =
    OpenLectureToGroup({ id });
  const [
    monthes,
    monthesLoading,
    lectureCenterLoading,
    mergedLectures,
    monthesCenter,
  ] = GitTeacherMonth({ id: g_id });

  if (studentLoading) {
    return <Loading />;
  }
  console.log(students);
  return (
    <div className="mt-[150px] mb-[50px]" style={{ minHeight: "60vh" }}>
      <div className="w-[90%] m-auto border shadow p-5">
        <div className="w-[95%] m-auto   my-9 md:flex justify-between">
          <div className="ribbon2">
            <h1 className="font-bold m-2 text-white">{students.group_name}</h1>
          </div>
          <Button colorScheme="red" onClick={onGroupDeleteOpen}>
            {deleteLoading ? <Spinner /> : "حذف المجموعة"}
          </Button>
        </div>
        <DeleteGroupDialog
          isOpen={isGroupDeleteOpen}
          onClose={onGroupDeleteClose}
          cancelRef={cancelRef}
          onDelete={() => deleteGroup(id)}
          deleteLoading={deleteLoading}
        />
        <LectureSelector
          classesLoading={classesLoading}
          classes={classes}
          setGrad={setGrad}
          lectureCenterLoading={lectureCenterLoading}
          monthesCenter={monthesCenter}
          setm_id={setm_id}
          handleOpenLecture={handleOpenLecture}
          loadingOpen={loadingOpen}
          g_id={g_id}
          m_id={m_id}
        />
        <StudentList
          students={students.data}
          onDeleteStudentClick={(student) => {
            setSelectedStudent(student);
            onStudentDeleteOpen();
          }}
        />
        <DeleteStudentDialog
          isOpen={isStudentDeleteOpen}
          onClose={onStudentDeleteClose}
          cancelRef={cancelRef}
          onDelete={() => deleteStudent(selectedStudent.id)}
          deleteLoading={deleteStudentLoading}
          selectedStudent={selectedStudent}
        />
      </div>
      <ScrollToTop />
    </div>
  );
};

export default GroupDetails;
