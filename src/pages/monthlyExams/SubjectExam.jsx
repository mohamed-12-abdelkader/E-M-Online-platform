import React, { useEffect, useState } from "react";
import {
  Box,
  Image,
  Heading,
  Text,
  Button,
  HStack,
  Stack,
  Center,
  IconButton,
  Skeleton,
  useColorModeValue,
} from "@chakra-ui/react";
import { FaVideo } from "react-icons/fa";
import useStartExam from "../../Hooks/student/monthlyExams/useStartExam"; // تأكد من المسار الصحيح
import { Link, useParams } from "react-router-dom";
import useGitSupExamDetails from "../../Hooks/student/monthlyExams/useGitSupExamDetails"; // تأكد من المسار الصحيح

const SubjectExam = () => {
  const { id } = useParams();

  const [studentExamsLoading, studentExam, refetchStudenExam] =
    useGitSupExamDetails({ id });
  const [examStarted, setExamStarted] = useState(false); // حالة لبدء الاختبار

  const handleStartExamClick = () => {
    setExamStarted(true);
  };

  // ألوان الوضع الليلي/النهاري
  const bg = useColorModeValue("gray.50", "gray.800");
  const boxBg = useColorModeValue("white", "gray.700");
  const headingColor = useColorModeValue("blue.500", "blue.300");
  const textColor = useColorModeValue("blue.900", "blue.100");
  const buttonColorScheme = useColorModeValue("blue", "teal");

  if (!studentExam && studentExamsLoading) {
    return (
      <Center minH='100vh'>
        <Skeleton height='20px' width='80%' />
      </Center>
    ); // شاشة تحميل بسيطة
  }

  if (!studentExam) {
    return (
      <Center minH='100vh'>
        <Text>لم يتم العثور على الاختبار</Text>
      </Center>
    ); // في حالة عدم وجود الاختبار
  }
  console.log(studentExam);
  return (
    <Center w='100%' minH='100vh' bg={bg} p={5}>
      <Box
        w={{ base: "90%", md: "80%", lg: "80%" }} // تعديل عرض الصندوق
        p={8}
        bg={boxBg}
        boxShadow='2xl'
        borderRadius='xl'
        overflow='hidden'
      >
        <Stack spacing={8}>
          {/* قسم الرأس */}
          <Box textAlign='center'>
            <Image
              src={
                studentExam.cover?.path || "https://via.placeholder.com/800x400"
              }
              alt='Exam Cover'
              borderRadius='md'
              mb={5}
              maxH='300px' // حد أقصى لارتفاع الصورة
              mx='auto' // توسيط الصورة أفقياً
              objectFit='cover'
            />
            <Heading as='h2' size='xl' mb={4} color={headingColor}>
              {studentExam.title}
            </Heading>
          </Box>

          {/* قسم الاختبار */}
          <Box
            p={6}
            bg={useColorModeValue("blue.50", "blue.900")}
            borderRadius='md'
            boxShadow='lg'
            textAlign='center'
          >
            <Text fontSize='xl' fontWeight='bold' color={textColor} mb={4}>
              اسم الامتحان: {studentExam.title}
            </Text>
            <Link to={`/subject_exam/${studentExam.id}/questions`}>
              {" "}
              {/* إضافة id للرابط */}
              <Button
                colorScheme={buttonColorScheme}
                size='lg'
                w='full'
                borderRadius='full'
                onClick={handleStartExamClick} // إضافة معالج النقر
                isDisabled={examStarted} // تعطيل الزر بعد الضغط عليه
              >
                {examStarted ? "جاري التحميل..." : "ابدأ الامتحان"}{" "}
                {/* تغيير نص الزر */}
              </Button>
            </Link>
          </Box>

          {/* قسم الفيديو */}
          {studentExam.reviews && studentExam.reviews.length > 0 && (
            <Box>
              {studentExam.reviews.map((video, index) => (
                <HStack
                  key={index} // إضافة مفتاح فريد لكل عنصر في الخريطة
                  spacing={5}
                  justify='space-between'
                  p={5}
                  bg={useColorModeValue("gray.100", "gray.600")}
                  borderRadius='md'
                  boxShadow='md'
                  alignItems='center' // محاذاة العناصر عمودياً
                  className='my-2'
                >
                  <Text fontSize='lg' fontWeight='medium' color='gray.700'>
                    {video.title}
                  </Text>
                  <IconButton
                    icon={<FaVideo />}
                    colorScheme='red'
                    size='lg'
                    variant='solid'
                    aria-label={`تشغيل الفيديو ${index + 1}`}
                    onClick={() => {
                      window.open(video.path, "_blank");
                    }}
                  />
                </HStack>
              ))}
            </Box>
          )}
        </Stack>
      </Box>
    </Center>
  );
};

export default SubjectExam;
