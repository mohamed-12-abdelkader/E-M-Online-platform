import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Box,
  Button,
  Progress,
  Text,
  VStack,
  HStack,
  useToast,
  RadioGroup,
  Radio,
  Stack,
} from "@chakra-ui/react";
import { FaArrowRight, FaArrowLeft } from "react-icons/fa";
import { BiTime } from "react-icons/bi";
import useStartExam from "../../Hooks/student/monthlyExams/useStartExam";

const ExamQuestions = () => {
  const { id } = useParams();
  const [loading, responseData, error, handleStart] = useStartExam({ id: id });
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(null); // Time left in seconds
  const [answers, setAnswers] = useState({}); // Stores user answers
  const toast = useToast();

  useEffect(() => {
    handleStart();
  }, []); // Run handleStart only once when the component mounts

  useEffect(() => {
    if (responseData?.exam?.time_minutes) {
      setTimeLeft(responseData.exam.time_minutes * 60); // Convert minutes to seconds
    }
  }, [responseData]);

  // Countdown Timer
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    } else if (timeLeft === 0) {
      toast({
        title: "انتهى وقت الامتحان",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  }, [timeLeft, toast]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const handleNext = () => {
    if (currentQuestionIndex < responseData?.questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  const handleAnswerChange = (questionId, optionId) => {
    setAnswers((prev) => ({ ...prev, [questionId]: optionId }));
  };

  const progress =
    responseData && responseData.questions
      ? (Object.keys(answers).length / responseData.questions.length) * 100
      : 0;

  if (loading) return <Text>جاري التحميل...</Text>;
  if (error) return <Text>حدث خطأ: {error.message}</Text>;

  const currentQuestion = responseData?.questions[currentQuestionIndex];
  console.log(currentQuestion);
  return (
    <Box maxW='600px' mx='auto' p={5}>
      {/* Exam Title and Timer */}
      <VStack align='start' spacing={4}>
        <Text fontSize='2xl' fontWeight='bold'>
          {responseData?.exam?.title}
        </Text>
        <HStack>
          <BiTime size={24} />
          <Text fontSize='lg'>الوقت المتبقي: {formatTime(timeLeft)}</Text>
        </HStack>
      </VStack>

      {/* Progress Bar */}
      <Progress value={progress} colorScheme='blue' size='sm' my={5} />

      {/* Current Question Display */}
      {currentQuestion && (
        <Box
          borderWidth='1px'
          borderRadius='lg'
          p={5}
          boxShadow='sm'
          bg='white'
        >
          <Text fontSize='lg' mb={4}>
            {currentQuestion.question_text}
          </Text>
          <RadioGroup
            onChange={(value) =>
              handleAnswerChange(currentQuestion.question_id, value)
            }
            value={answers[currentQuestion.question_id] || ""}
          >
            <Stack spacing={3}>
              {currentQuestion.options?.length > 0 ? (
                <RadioGroup
                  onChange={(value) =>
                    handleAnswerChange(currentQuestion.question_id, value)
                  }
                  value={answers[currentQuestion.question_id] || ""}
                >
                  <Stack spacing={3}>
                    {currentQuestion.options.map((option) => (
                      <Radio
                        key={option.option_id}
                        value={option.option_id.toString()}
                      >
                        {option.option_text}
                      </Radio>
                    ))}
                  </Stack>
                </RadioGroup>
              ) : (
                <Text fontSize='lg' color='red.500'>
                  هذا السؤال لا يحتوي على خيارات.
                </Text>
              )}
            </Stack>
          </RadioGroup>
        </Box>
      )}

      {/* Navigation Buttons */}
      <HStack justifyContent='space-between' mt={5}>
        <Button
          leftIcon={<FaArrowLeft />}
          onClick={handlePrev}
          isDisabled={currentQuestionIndex === 0}
        >
          السابق
        </Button>
        <Button
          rightIcon={<FaArrowRight />}
          onClick={handleNext}
          isDisabled={
            currentQuestionIndex === responseData?.questions.length - 1
          }
        >
          التالي
        </Button>
      </HStack>
    </Box>
  );
};

export default ExamQuestions;
