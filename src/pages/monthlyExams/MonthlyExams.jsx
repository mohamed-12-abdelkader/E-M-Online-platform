import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import useGitMonthlyExamSetailds from "../../Hooks/admin/mangeExam/useGitMonthlyExamSetailds";
import {
  Box,
  Flex,
  Heading,
  Spinner,
  Text,
  Button,
  useDisclosure,
} from "@chakra-ui/react";
import { CoursesCard } from "../../ui/card/CoursesCard";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@chakra-ui/react";
import useDeleateExam from "../../Hooks/admin/mangeExam/useDeleateExam";
import useActiveExam from "../../Hooks/admin/mangeExam/useActiveExam";
import useGitSubjectExam from "../../Hooks/student/monthlyExams/useGitSubjectExam";
import UserType from "../../Hooks/auth/userType";

const MonthlyExams = () => {
  const [userData, isAdmin, isTeacher, student] = UserType();
  const { id } = useParams();
  const [loading, exams, refetchExam] = useGitMonthlyExamSetailds(id);
  const [studentExamsLoading, studentExams, refetchStudenExam] =
    useGitSubjectExam({ id });
  const [deleteLoading, deleteExam] = useDeleateExam({ status: "exams" });
  const [activExam, activloading] = useActiveExam({ api: "exams" });
  const displayedExams = isAdmin ? exams : student ? studentExams : [];

  // تحديث البيانات عند فتح الصفحة
  useEffect(() => {
    if (isAdmin || student) {
      refetchExam();
    }
  }, [isAdmin, student, refetchExam]);

  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedExamId, setSelectedExamId] = useState(null);
  const [modalType, setModalType] = useState(""); // "delete" or "activate"

  const handleDeleteClick = (examId) => {
    setSelectedExamId(examId);
    setModalType("delete");
    onOpen(); // Open the modal
  };

  const handleActiveClick = (examId) => {
    setSelectedExamId(examId);
    setModalType("activate");
    onOpen(); // Open the modal
  };

  const confirmAction = async () => {
    try {
      if (modalType === "delete") {
        await deleteExam(selectedExamId);
      } else if (modalType === "activate") {
        const selectedExam = exams.find((exam) => exam.id === selectedExamId);
        if (selectedExam) {
          const newStatus = !selectedExam.is_ready;
          await activExam(selectedExam.id, newStatus);
        }
      }
      refetchExam(); // تحديث البيانات بعد العملية
      onClose(); // إغلاق المودال
    } catch (error) {
      console.error(`Failed to ${modalType} exam:`, error);
    }
  };

  return (
    <div className='w-[%] m-auto mb-[80px] mt-[30px]'>
      <Box p={2}>
        <Flex justify='space-between' align='center' mb={5}>
          <Heading size='lg'>الامتحانات المتاحة</Heading>
          {isAdmin && (
            <Link to={`/monthly_exam/${id}/show_grades`}>
              <Button colorScheme='blue'>عرض درجات الطلاب</Button>
            </Link>
          )}
        </Flex>
        {isAdmin ? (
          loading ? (
            <Flex justify='center' align='center' height='200px'>
              <Spinner size='xl' />
            </Flex>
          ) : displayedExams?.length > 0 ? (
            <Flex wrap='wrap' gap={2}>
              {displayedExams.map((exam) => (
                <CoursesCard
                  key={exam.id}
                  lectre={exam}
                  type={"subject_exam"}
                  img={exam.cover?.path}
                  href={`/subject_exam/${exam.id}`}
                  handleactive={() => handleActiveClick(exam.id)}
                  handleDeleate={() => handleDeleteClick(exam.id)}
                />
              ))}
            </Flex>
          ) : (
            <Text textAlign='center' color='gray.500'>
              لا توجد امتحانات متاحة حاليا.
            </Text>
          )
        ) : student ? (
          studentExamsLoading ? (
            <Flex justify='center' align='center' height='200px'>
              <Spinner size='xl' />
            </Flex>
          ) : displayedExams?.length > 0 ? (
            <div className='flex flex-wrap'>
              {displayedExams.map((exam) => (
                <CoursesCard
                  key={exam.id}
                  lectre={exam}
                  type={"subject_exam"}
                  img={exam.cover?.path}
                  href={`/subject_exam/${exam.id}`}
                />
              ))}
            </div>
          ) : (
            <Text textAlign='center' color='gray.500'>
              لا توجد امتحانات متاحة حاليا.
            </Text>
          )
        ) : (
          <Text textAlign='center' color='gray.500'>
            لا توجد صلاحيات للوصول إلى هذه الصفحة.
          </Text>
        )}
      </Box>

      {/* Modal for confirmation */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {modalType === "delete" ? "تأكيد الحذف" : "تأكيد التفعيل"}
          </ModalHeader>
          <ModalBody>
            {modalType === "delete"
              ? "هل أنت متأكد من حذف هذا الامتحان؟ هذه العملية لا يمكن التراجع عنها."
              : "هل أنت متأكد من تفعيل هذا الامتحان؟"}
          </ModalBody>
          <ModalFooter>
            <Button colorScheme='gray' mr={3} onClick={onClose}>
              إلغاء
            </Button>
            <Button
              colorScheme={modalType === "delete" ? "red" : "green"}
              onClick={confirmAction}
              isLoading={modalType === "delete" ? deleteLoading : activloading}
            >
              تأكيد
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
};

export default MonthlyExams;
