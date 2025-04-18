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
  Flex,
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
      <div
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
      </div>
    );
  }

  // Filter courses based on description
  const filteredCourses = searchTerm
    ? teacher.months?.filter((lecture) =>
        lecture.description?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : teacher.months;

  return (
    <div bg={bgColor} minH='100vh' className="mb-[100px]">
      <TeacherInfo
        teacher={teacher.teacher}
        number={teacher.months && teacher.months.length}
      />
      <div className="border w-[90%] m-auto my-8 p-5 rounded-lg -lg">
      <div>
  {/* العنوان */}
  <Flex align="center" gap={3} mb={4}>
    <Icon as={FaFileVideo} w={6} h={6} color="blue.500" />
    <Heading size="lg" color={headingColor}>
      كل الكورسات المتاحة
    </Heading>
  </Flex>

  {/* مربع البحث */}
  <InputGroup maxW="400px" mb={6}>
    <InputLeftElement pointerEvents="none">
      <Icon as={FaSearch} color="gray.400" />
    </InputLeftElement>
    <Input
      placeholder="ابحث عن كورس بالوصف"
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      bg={cardBg}
      borderRadius="md"
      _focus={{
        borderColor: "blue.500",
        boxShadow: "0 0 0 1px #3182ce",
      }}
    />
  </InputGroup>

  {/* عرض الكورسات أو رسالة لا يوجد */}
  {filteredCourses && filteredCourses.length > 0 ? (
    <div className='w-full m-auto flex justify-center md:justify-start flex-wrap' style={{ borderRadius: "20px" }}>
      {filteredCourses.map((lecture) => (
        <CoursesCard
          key={lecture.id}
          href={`/month/${lecture.id}`}
          lectre={lecture}
          onClick={() => {
            setSelectedLecture(lecture);
            onOpen();
          }}
          type="teacher_courses"
          className="hover:shadow-xl transition-shadow duration-300"
        />
      ))}
    </div>
  ) : (
    <Box
      p={10}
      bg={cardBg}
      borderRadius="2xl"
      textAlign="center"
      boxShadow="md"
    >
      <Icon as={MdCancelPresentation} w={12} h={12} color="red.500" mb={4} />
      <Text fontSize="lg" fontWeight="medium" color={textColor}>
        {searchTerm
          ? "لا يوجد كورسات مطابقة للبحث"
          : "لا يوجد كورسات الآن، سوف يتم إضافتها في أقرب وقت ممكن"}
      </Text>
    </Box>
  )}
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