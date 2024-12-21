import React, { useState } from "react";
import {
  Box,
  Flex,
  Heading,
  Spinner,
  Text,
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@chakra-ui/react";

import UserType from "../../Hooks/auth/userType";
import useGitAllExams from "../../Hooks/admin/mangeExam/useGitAllExams";
import GitMonthlyExams from "../../Hooks/student/monthlyExams/GitMonthlyExams";
import { CoursesCard } from "../../ui/card/CoursesCard";
import useActiveExam from "../../Hooks/admin/mangeExam/useActiveExam";
import useDeleateExam from "../../Hooks/admin/mangeExam/useDeleateExam";
import usePuyExam from "../../Hooks/student/monthlyExams/usePuyExam";

const ViewExams = () => {
  const [userData, isAdmin, isTeacher, student] = UserType();
  const [deleteLoading, deleteExam] = useDeleateExam({ status: "collections" });
  const [examsLoading, exams, refetchExams] = useGitAllExams();
  const [exams_S_Loading, exams_S] = GitMonthlyExams();
  const [activExam, activloading] = useActiveExam({ api: "collections" });

  const { isOpen, onOpen, onClose } = useDisclosure();
  const [buyExam, buyExamloading] = usePuyExam();
  const [modalConfig, setModalConfig] = useState({
    type: null, // "activate", "delete", or "purchase"
    exam: null,
  });

  const handleModalOpen = (exam, type) => {
    setModalConfig({ type, exam });
    onOpen();
  };

  const confirmAction = async () => {
    const { type, exam } = modalConfig;

    if (type === "activate") {
      const newStatus = !exam.is_ready;
      await activExam(exam.id, newStatus);
    } else if (type === "delete") {
      await deleteExam(exam.id);
    } else if (type === "purchase") {
      // يمكنك إضافة منطق الشراء هنا
      await buyExam(exam.id);
    }

    onClose();
  };

  const displayedExams = isAdmin ? exams : student ? exams_S : [];
  console.log(displayedExams);

  return (
    <div className='w-[90%] m-auto'>
      <Box p={5}>
        <Heading size='lg' mb={5}>
          {isAdmin ? "إدارة الامتحانات" : "الامتحانات المتاحة"}
        </Heading>
        {(isAdmin && examsLoading) || (student && exams_S_Loading) ? (
          <Flex justify='center' align='center' height='200px'>
            <Spinner size='xl' />
          </Flex>
        ) : displayedExams?.length > 0 ? (
          <Flex wrap='wrap' gap={5}>
            {displayedExams.map((exam) => (
              <CoursesCard
                key={exam.id}
                lectre={exam}
                type={"monthly_exam"}
                img={exam.cover?.path}
                handleactive={() => handleModalOpen(exam, "activate")}
                handleDeleate={() => handleModalOpen(exam, "delete")}
                onClick={() => handleModalOpen(exam, "purchase")}
                href={`/monthly_exam/${exam.id}`}
              />
            ))}
          </Flex>
        ) : (
          <Text textAlign='center' color='gray.500'>
            لا توجد امتحانات متاحة حاليا.
          </Text>
        )}
      </Box>

      {/* Dynamic Modal */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {modalConfig.type === "activate"
              ? "تأكيد التفعيل"
              : modalConfig.type === "delete"
              ? "تأكيد الحذف"
              : "تأكيد الشراء"}
          </ModalHeader>
          <ModalBody>
            {modalConfig.type === "activate" && (
              <Text>
                هل أنت متأكد من{" "}
                {modalConfig.exam?.is_ready ? "إلغاء تفعيل" : "تفعيل"} الامتحان
                "{modalConfig.exam?.name}"؟
              </Text>
            )}
            {modalConfig.type === "delete" && (
              <Text>
                هل أنت متأكد أنك تريد حذف الامتحان "{modalConfig.exam?.name}"؟
                هذه العملية لا يمكن التراجع عنها.
              </Text>
            )}
            {modalConfig.type === "purchase" && (
              <Text>
                هل تريد شراء الامتحان "{modalConfig.exam?.name}"؟ بمجرد التأكيد،
                سيتم خصم الرصيد اللازم.
              </Text>
            )}
          </ModalBody>
          <ModalFooter>
            <Button colorScheme='red' mr={3} onClick={onClose}>
              إلغاء
            </Button>
            <Button
              colorScheme='blue'
              onClick={confirmAction}
              isLoading={
                modalConfig.type === "activate"
                  ? activloading
                  : modalConfig.type === "delete"
                  ? deleteLoading
                  : modalConfig.type === "purchase"
                  ? buyExamloading
                  : false
              }
            >
              تأكيد
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
};

export default ViewExams;
