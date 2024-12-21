import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Center,
  VStack,
  Text,
  Radio,
  RadioGroup,
  Stack,
  HStack,
  Progress,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  useDisclosure,
  Spinner,
  Flex,
  CircularProgress,
  CircularProgressLabel,
} from "@chakra-ui/react";
import { BiChevronLeft, BiChevronRight } from "react-icons/bi";
import { useParams } from "react-router-dom";
import useStartExam from "../../Hooks/student/monthlyExams/useStartExam";
import useSendQuestions from "../../Hooks/student/monthlyExams/useSendQuestions";
import useFinshExam from "../../Hooks/student/monthlyExams/useFinshExam";

const ExamQuestions = () => {
  const { id } = useParams();
  const [loading, responseData, error, handleStart] = useStartExam({ id });
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [sendExam, sendExamloading, setSelectedOptions, selectedOptions] =
    useSendQuestions({ id });
  const [finshExam, finshExamloading, response] = useFinshExam({ id });
  console.log(response);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [timeLeft, setTimeLeft] = useState(3600); // 2 hours in seconds

  useEffect(() => {
    handleStart();

    // منع التحديث عند محاولة مغادرة أو إعادة تحميل الصفحة
    const handleBeforeUnload = (event) => {
      const message = "هل أنت متأكد أنك تريد مغادرة هذه الصفحة؟";
      event.returnValue = message; // للمتصفحات الحديثة
      return message; // للمتصفحات القديمة
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    // إيقاف المؤقت عند الخروج من الصفحة
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => {
      clearInterval(timer);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs}:${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const handleOptionChange = (questionId, optionId) => {
    setSelectedOptions((prev) => ({ ...prev, [questionId]: optionId }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < responseData.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleFinishExam = async () => {
    try {
      await sendExam();
      await finshExam();
      onOpen(); // افتح موديل التأكيد بعد إنهاء الامتحان
    } catch (error) {
      console.error("Error finishing exam:", error);
    }
  };

  const handleReviewQuestions = () => {
    setCurrentQuestionIndex(0); // العودة إلى أول سؤال
  };

  if (loading || !responseData) {
    return <Center>Loading...</Center>;
  }

  const currentQuestion = responseData.questions[currentQuestionIndex];

  // حساب الأسئلة المنجزة بناءً على الإجابات المختارة
  const completedQuestions = Object.keys(selectedOptions).length;
  const totalQuestions = responseData.questions.length;
  const progressPercentage = (completedQuestions / totalQuestions) * 100;

  if (!responseData.questions || responseData.questions.length === 0) {
    return (
      <Center w='100%' minH='100vh' bg='gray.100' p={5}>
        <Box w={"90%"} p={8} bg='white' boxShadow='2xl' borderRadius='xl'>
          <Text fontSize='2xl' fontWeight='bold' color='red.500'>
            لا توجد أسئلة لعرضها.
          </Text>
        </Box>
      </Center>
    );
  }

  return (
    <Center w='100%' minH='100vh' bg='gray.100' p={5}>
      <Box w={"90%"} p={8} bg='white' boxShadow='2xl' borderRadius='xl'>
        <VStack align='start' spacing={8}>
          {/* الوقت المتبقي */}
          <Flex justify='center' align='center' mb={6} className='w-[100%]'>
            <CircularProgress
              value={(timeLeft / 3600) * 100}
              size='120px'
              color='pink.400'
            >
              <CircularProgressLabel fontSize='lg'>
                {formatTime(timeLeft)}
              </CircularProgressLabel>
            </CircularProgress>
          </Flex>

          {/* شريط التقدم الذي يوضح الأسئلة المنجزة */}
          <Box w='100%' mb={6}>
            <Text fontSize='lg' mb={2} fontWeight='bold' color='blue.500'>
              الأسئلة المنجزة: {completedQuestions}/{totalQuestions}
            </Text>
            <Progress
              value={progressPercentage}
              size='lg'
              colorScheme='blue'
              borderRadius='full'
              isAnimated
            />
          </Box>

          {/* عرض الأسئلة */}
          <Box p={5} bg='gray.50' borderRadius='md' w='full' boxShadow='md'>
            <Text fontSize='xl' fontWeight='bold' mb={4} color='blue.500'>
              {`السؤال ${currentQuestionIndex + 1}: ${
                currentQuestion.question_text
              }`}
            </Text>
            <RadioGroup
              value={selectedOptions[currentQuestion.question_id] || ""}
              onChange={(value) =>
                handleOptionChange(currentQuestion.question_id, value)
              }
            >
              <Stack spacing={4} direction='column'>
                {currentQuestion.options.map((option) => (
                  <Radio
                    key={option.option_id}
                    value={option.option_id.toString()}
                    size='lg'
                    colorScheme='blue'
                    borderRadius='full'
                    _focus={{ boxShadow: "outline" }}
                    _checked={{ bg: "blue.500", color: "white" }}
                    _hover={{ bg: "blue.300" }}
                    fontSize='lg'
                  >
                    {option.option_text}
                  </Radio>
                ))}
              </Stack>
            </RadioGroup>
          </Box>

          {/* شريط التنقل بين الأسئلة */}
          <HStack spacing={4} mt={8} align='center'>
            <Button
              leftIcon={<BiChevronLeft />}
              onClick={handlePrev}
              isDisabled={currentQuestionIndex === 0}
              colorScheme='teal'
              variant='outline'
            >
              السابق
            </Button>
            <Button
              rightIcon={<BiChevronRight />}
              onClick={handleNext}
              isDisabled={
                currentQuestionIndex === responseData.questions.length - 1
              }
              colorScheme='teal'
              variant='outline'
            >
              التالى
            </Button>
            {currentQuestionIndex === responseData.questions.length - 1 && (
              <>
                <Button
                  colorScheme='green'
                  onClick={onOpen} // عند الضغط على انهاء، سيتم فتح الموديل
                  size='lg'
                >
                  انهاء
                </Button>
                <Button
                  colorScheme='blue'
                  onClick={handleReviewQuestions}
                  size='lg'
                >
                  مراجعة الأسئلة
                </Button>
              </>
            )}
          </HStack>
        </VStack>

        {/* موديل التأكيد */}
        <Modal isOpen={isOpen} onClose={onClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>تأكيد إنهاء الامتحان</ModalHeader>
            <ModalBody>هل أنت متأكد أنك تريد إنهاء الامتحان؟</ModalBody>
            <ModalFooter>
              <Button colorScheme='red' onClick={onClose}>
                إلغاء
              </Button>
              <Button
                colorScheme='green'
                ml={3}
                onClick={handleFinishExam} // تنفيذ عملية إنهاء الامتحان
                isLoading={finshExamloading}
              >
                تأكيد
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </Box>
    </Center>
  );
};

export default ExamQuestions;
