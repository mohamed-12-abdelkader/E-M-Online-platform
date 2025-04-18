import { useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { Box, Image, useDisclosure, Flex, Text } from "@chakra-ui/react";
import { Zoom } from "react-awesome-reveal";
import ScrollToTop from "../../components/scollToTop/ScrollToTop";

import GitLecturTdetails from "../../Hooks/teacher/GitLecturTdetails";
import UserType from "../../Hooks/auth/userType";
import DeleateCenterVedio from "../../Hooks/teacher/DeleateCenterVedio";
import DeleateExamG from "../../Hooks/teacher/DeleateExamG";
import DeleatPdf from "../../Hooks/teacher/DeleatPdf";
import GitLectureCenterDetails from "../../Hooks/student/GitLectureCenterDetails";
import LectureContent from "../../components/lecture/LectureContent";
import AlertDialogComponent from "../../components/lecture/AlertDialogComponent";
import Loading from "../../components/loading/Loading";

const LectureDetails = () => {
  const { id } = useParams();
  const [lectureLoading, lectures] = GitLectureCenterDetails({ id });
  const [lectureTLoading, lecturesT] = GitLecturTdetails({ id });
  const [userData, isAdmin, isTeacher] = UserType();
  const [deleteVedioCenterLoading, deletVedioCenter] = DeleateCenterVedio();
  const [deleteGLoading, deleteExamsG] = DeleateExamG();
  const [deletePdfLoading, deletPdf] = DeleatPdf();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = useRef();
  const [selectedItem, setSelectedItem] = useState(null);

  const videosToMap = lectures?.videos || lecturesT?.videos || [];
  const pdfsToMap = lectures?.pdfs || lecturesT?.pdfs || [];
  const examName = lecturesT?.exam_name || lectures?.exam_name;
  const examId = lecturesT?.exam_id || lectures?.exam_id;
  const lastResult = lectures?.last_result;

  const handleDeleteVideo = (video) => {
    setSelectedItem(video);
    onOpen();
  };

  const handleDeletePdf = (pdf) => {
    setSelectedItem(pdf);
    onOpen();
  };

  const handleDeleteExam = (exam) => {
    setSelectedItem(exam);
    onOpen();
  };

  const handleConfirmDelete = () => {
    if (selectedItem?.v_name) {
      deletVedioCenter(selectedItem.id);
    } else if (selectedItem?.pdf_name) {
      deletPdf(selectedItem.id);
    } else if (selectedItem?.exam_name) {
      deleteExamsG(selectedItem.id);
    }
  };

  if (lectureLoading || lectureTLoading) {
    return <Loading />;
  }

  return (
    <Box my="120px" w="90%" mx="auto">
      <Box mt="120px" minH="80vh">
        {/* Improved Header with Full-Width Image */}
        {(lecturesT?.image || lectures?.image) && (
          <Box position="relative" w="100%" className="h-[200px] md:h-[500px]" overflow="hidden" borderRadius="xl" shadow="lg">
            <Image
              src={lecturesT?.image || lectures?.image}
              alt="صورة المحاضرة"
              objectFit="cover"
              w="100%"
              h="100%"
            />
            <Box
              position="absolute"
              top={0}
              left={0}
              w="100%"
              h="100%"
              bgGradient="linear(to-b, blackAlpha.600, blackAlpha.200)"
            />
            <Flex
              position="absolute"
              top={0}
              left={0}
              w="100%"
              h="100%"
              align="center"
              justify="center"
              direction="column"
              px={{ base: 4, md: 8 }}
              gap={4}
            >
              
             
             
            </Flex>
          </Box>
        )}

        <LectureContent
          Loading={deleteGLoading}
          videos={videosToMap}
          pdfs={pdfsToMap}
          isTeacher={isTeacher}
          onDeleteVideo={handleDeleteVideo}
          onDeletePdf={handleDeletePdf}
          examName={examName}
          examId={examId}
          lastResult={lastResult}
          onDeleteExam={() =>
            handleDeleteExam({ id: examId, exam_name: examName })
          }
        />

        <ScrollToTop />
      </Box>

      <AlertDialogComponent
        Loading={deleteGLoading || deleteVedioCenterLoading || deletePdfLoading}
        isOpen={isOpen}
        onClose={onClose}
        onConfirm={handleConfirmDelete}
        selectedItem={selectedItem}
        cancelRef={cancelRef}
      />
    </Box>
  );
};

export default LectureDetails;