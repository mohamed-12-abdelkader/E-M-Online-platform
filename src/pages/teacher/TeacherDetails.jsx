import React, { useState } from "react";
import { useParams } from "react-router-dom";
import {
  useDisclosure,
  Container,
  Box,
  Heading,
  Text,
  SimpleGrid,
  useColorModeValue,
} from "@chakra-ui/react";
import { MdCancelPresentation } from "react-icons/md";
import { FaFileVideo } from "react-icons/fa6";

import PurchaseAlert from "../../ui/modal/PurchaseAlert";
import GitTeacherDetails from "../../Hooks/teacher/GitTeacherDetails";
import GitLecture from "../../Hooks/student/GitLecture";
import BuyLecture from "../../Hooks/student/BuyLecture";
import ScrollToTop from "../../components/scollToTop/ScrollToTop";
import GitMonthes from "../../Hooks/student/GitMonths";
import TeacherInfo from "../../components/teacher/TeacherInfo";
import Loading from "../../components/loading/Loading";
import { CoursesCard } from "../../ui/card/CoursesCard";

const TeacherDetails = () => {
  const { id } = useParams();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = React.useRef();
  const [teacherLoading, teacher] = GitTeacherDetails({ id });
  const [lectureLoading, lectures] = GitLecture({ id });
  const [monthes, monthesLoading] = GitMonthes({ id });
  const [buyLoading, buyLecture, buyMonth] = BuyLecture();
  const [selectedLecture, setSelectedLecture] = useState(null);

  const bgColor = useColorModeValue("gray.50", "gray.900");
  const cardBg = useColorModeValue("white", "gray.800");
  const textColor = useColorModeValue("gray.600", "gray.300");
  const headingColor = useColorModeValue("blue.700", "blue.200");

  if (teacherLoading || lectureLoading || monthesLoading) {
    return <Loading />;
  }

  if (!teacher || teacher.teacher.length === 0) {
    return (
      <Box
        minH='100vh'
        display='flex'
        alignItems='center'
        justifyContent='center'
        bg={bgColor}
      >
        <Box
          maxW='md'
          w='full'
          p={8}
          bg={cardBg}
          borderRadius='2xl'
          boxShadow='xl'
          textAlign='center'
        >
          <Box
            as={MdCancelPresentation}
            size='64px'
            color='red.500'
            mx='auto'
            mb={4}
          />
          <Text fontSize='xl' fontWeight='bold' color={textColor}>
            هذا المدرس غير موجود على الموقع
          </Text>
        </Box>
      </Box>
    );
  }

  return (
    <Box bg={bgColor} minH='100vh'>
      <TeacherInfo
        teacher={teacher.teacher}
        number={teacher.months && teacher.months.length}
      />

      <Container maxW='7xl' py={16}>
        <Box>
          <Heading
            size='lg'
            mb={8}
            display='flex'
            alignItems='center'
            gap={3}
            color={headingColor}
          >
            <FaFileVideo className='text-blue-500' />
            كل الكورسات المتاحة
          </Heading>

          {teacher.months && teacher.months.length > 0 ? (
            <SimpleGrid
              columns={{ base: 1, md: 2, lg: 3 }}
              spacing={8}
              className='courses-grid'
            >
              {teacher.months.map((lecture) => (
                <CoursesCard
                  key={lecture.id}
                  href={`/month/${lecture.id}`}
                  lectre={lecture}
                  onClick={() => {
                    setSelectedLecture(lecture);
                    onOpen();
                  }}
                  type='teacher_courses'
                />
              ))}
            </SimpleGrid>
          ) : (
            <Box
              p={12}
              bg={cardBg}
              borderRadius='2xl'
              textAlign='center'
              boxShadow='sm'
            >
              <Box
                as={MdCancelPresentation}
                size='48px'
                color='red.500'
                mx='auto'
                mb={4}
              />
              <Text fontSize='xl' fontWeight='medium' color={textColor}>
                لا يوجد كورسات الان سوف يتم اضافتها فى اقرب وقت ممكن
              </Text>
            </Box>
          )}
        </Box>
      </Container>

      <PurchaseAlert
        isOpen={isOpen}
        onClose={onClose}
        cancelRef={cancelRef}
        selectedLecture={selectedLecture}
        buyLoading={buyLoading}
        buyMonth={buyMonth}
      />
      <ScrollToTop />
    </Box>
  );
};

export default TeacherDetails;
