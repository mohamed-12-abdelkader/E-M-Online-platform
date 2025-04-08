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
  Input,
  InputGroup,
  InputLeftElement,
  Icon,
} from "@chakra-ui/react";
import { MdCancelPresentation } from "react-icons/md";
import { FaFileVideo, FaSearch } from "react-icons/fa";

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
  const [searchTerm, setSearchTerm] = useState("");

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
        className="bg-gradient-to-r from-cyan-300 to-blue-700"
      >
        <Box
          maxW='md'
          w='full'
          p={8}
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
            هذا المحاضر غير موجود على الموقع
          </Text>
        </Box>
      </Box>
    );
  }

  // Filter courses based on description
  const filteredCourses = searchTerm
    ? teacher.months?.filter((lecture) =>
        lecture.description?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : teacher.months;

  return (
    <Box bg={bgColor} minH='100vh' className="mb-[100px]">
      <TeacherInfo
        teacher={teacher.teacher}
        number={teacher.months && teacher.months.length}
      />
      <div className="border w-[90%] m-auto my-5 p-5 rounded-lg shadow-lg">
        <Box>
          <Heading
            size='lg'
            mb={4}
            display='flex'
            alignItems='center'
            gap={3}
            color={headingColor}
          >
            <FaFileVideo className='text-blue-500' />
            كل الكورسات المتاحة
          </Heading>

          <InputGroup maxW="400px" mb={6}>
            <InputLeftElement pointerEvents="none">
              <Icon as={FaSearch} color="gray.300" />
            </InputLeftElement>
            <Input
              placeholder="ابحث عن كورس بالوصف"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              bg={cardBg}
              borderRadius="md"
              _focus={{ borderColor: "blue.500" }}
            />
          </InputGroup>

          {filteredCourses && filteredCourses.length > 0 ? (
            <SimpleGrid
              columns={{ base: 1, md: 2, lg: 3 }}
              spacing={8}
              className='courses-grid'
            >
              {filteredCourses.map((lecture) => (
                <CoursesCard
                  key={lecture.id}
                  href={`/month/${lecture.id}`}
                  lectre={lecture}
                  onClick={() => {
                    setSelectedLecture(lecture);
                    onOpen();
                  }}
                  type='teacher_courses'
                  className='hover:shadow-xl transition-shadow duration-300'
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
              className='hover:shadow-md transition-shadow duration-300'
            >
              <Box
                as={MdCancelPresentation}
                size='48px'
                color='red.500'
                mx='auto'
                mb={4}
              />
              <Text fontSize='xl' fontWeight='medium' color={textColor}>
                {searchTerm
                  ? "لا يوجد كورسات مطابقة للبحث"
                  : "لا يوجد كورسات الان سوف يتم اضافتها فى اقرب وقت ممكن"}
              </Text>
            </Box>
          )}
        </Box>
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
    </Box>
  );
};

export default TeacherDetails;