import React from "react";
import {
  Box,
  Flex,
  Image,
  Heading,
  Text,
  VStack,
  HStack,
  Button,
} from "@chakra-ui/react";
import { AiOutlineVideoCamera, AiOutlineFileText } from "react-icons/ai";
import { Link } from "react-router-dom";
import useDeleateExam from "../../Hooks/admin/mangeExam/useDeleateExam";

const ExamDetails = () => {
  const [deleteLoading, deleteExam] = useDeleateExam({ status: "exams" });
  // بيانات الامتحان
  const exam = {
    name: "امتحان   اللغة العربية ",
    description: "اختبر معلوماتك في جميع المواد الدراسية مع أفضل نظام تقييم.",
    image: "https://via.placeholder.com/600x300",
    content: [
      { type: "video", name: "مراجعة اللغة العربية ", link: "/video/1" },

      { type: "exam", name: "امتحان اللغة العربية ", link: "/exam/2" },
    ],
  };

  return (
    <Box p={5} maxWidth='900px' mx='auto'>
      {/* القسم الأول: تفاصيل الامتحان */}
      <Box mb={8}>
        <div className='flex justify-center'>
          <Image
            src={exam.image}
            alt={exam.name}
            borderRadius='md'
            mb={4}
            objectFit='cover'
          />
        </div>
        <div className='text-center'>
          <Heading size='lg' mb={2}>
            {exam.name}
          </Heading>
          <Text fontSize='md' color='gray.600'>
            {exam.description}
          </Text>
        </div>
      </Box>

      {/* القسم الثاني: محتوى الامتحان */}
      <Box>
        <div>
          <h1 className='font-bold text-xl'>محتوى الامتحان</h1>
          <hr className='my-2' />
        </div>
        <VStack align='start' spacing={4}>
          {exam.content.map((item, index) => (
            <HStack
              key={index}
              w='100%'
              p={4}
              border='1px solid #e2e8f0'
              borderRadius='md'
              boxShadow='sm'
              justify='space-between'
            >
              <HStack>
                {item.type === "video" ? (
                  <AiOutlineVideoCamera size={24} className='text-blue-500' />
                ) : (
                  <AiOutlineFileText size={24} className='text-blue-500' />
                )}
                <Text fontSize='lg' className='font-bold'>
                  {item.name}
                </Text>
              </HStack>
              <Link to={item.link}>
                <Button colorScheme='blue' size='sm'>
                  {item.type === "video" ? "شاهد الفيديو" : "ابدأ الامتحان"}
                </Button>
              </Link>
            </HStack>
          ))}
        </VStack>
      </Box>
    </Box>
  );
};

export default ExamDetails;
