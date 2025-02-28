import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  Box,
  Text,
  VStack,
  HStack,
  Button,
  Flex,
  Heading,
  useColorModeValue,
  SlideFade,
  ScaleFade,
  CircularProgress,
  CircularProgressLabel,
  Icon,
} from "@chakra-ui/react";

import { BiChevronLeft, BiChevronRight } from "react-icons/bi";
const CompetitionDetails = () => {
  const { id } = useParams();

  const questions = [
    {
      question: "ما هى عاصمة مصر؟",
      answers: ["القاهرة", "الجيزة", "الإسكندرية", "أسوان"],
    },
    {
      question: "ما هى أكبر قارة في العالم؟",
      answers: ["آسيا", "أفريقيا", "أوروبا", "أمريكا الجنوبية"],
    },
    {
      question: "ما هو الكوكب الرابع في النظام الشمسي؟",
      answers: ["عطارد", "الأرض", "المريخ", "الزهرة"],
    },
  ];

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(3600); // 60 دقيقة (بالثواني)

  // تحديث المؤقت
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft]);

  const handleAnswerClick = (answer) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [currentQuestionIndex]: answer,
    });
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const currentQuestion = questions[currentQuestionIndex];

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs < 10 ? "0" : ""}${secs}`;
  };

  return (
    <Box    
      minH='100vh'
      p={5}
      textAlign='center'
    >
      <h1 className="text-3xl font-bold my-3">مسابقة اللغة العربية</h1>
      <h1 >
      {formatTime(timeLeft)}
      </h1>

      <Flex justify='center' align='center' mb={6}>
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

      {timeLeft === 0 ? (
        <Text fontSize='2xl' fontWeight='bold' color='red.400'>
          انتهى الوقت!
        </Text>
      ) : (
        <>
          <SlideFade in>
            <Box
              bg='white'
              color='gray.800'
              p={5}
              rounded='md'
              shadow='md'
              mb={4}
              className='w-[90%] m-auto'
            >
              <Heading fontSize='xl' mb={3}>
                السؤال {currentQuestionIndex + 1}
              </Heading>
              <Text fontSize='lg' mb={4} className='text-xl font-bold'>
                {currentQuestion.question}
              </Text>
              <VStack spacing={3}>
                {currentQuestion.answers.map((answer, index) => (
                  <Box
                    key={index}
                    w='full'
                    p={4}
                    bg={
                      selectedAnswers[currentQuestionIndex] === answer
                        ? "teal.500"
                        : "gray.200"
                    }
                    color={
                      selectedAnswers[currentQuestionIndex] === answer
                        ? "white"
                        : "black"
                    }
                    cursor='pointer'
                    rounded='md'
                    _hover={{
                      bg: "teal.400",
                      color: "white",
                      transform: "scale(1.02)",
                    }}
                    transition='all 0.3s'
                    onClick={() => handleAnswerClick(answer)}
                  >
                    {answer}
                  </Box>
                ))}
              </VStack>
            </Box>
          </SlideFade>

          <HStack justify='space-between' className='w-[90%] m-auto' mt={6}>
            <Button
              leftIcon={<BiChevronRight />}
              onClick={handlePrevious}
              isDisabled={currentQuestionIndex === 0}
              colorScheme='black'
              variant='outline'
            >
              السابق
            </Button>
            <Button
              rightIcon={<BiChevronLeft />}
              onClick={handleNext}
              isDisabled={currentQuestionIndex === questions.length - 1}
              colorScheme='blue'
            >
              التالي
            </Button>
          </HStack>
          
        </>
      )}
    </Box>
  );
};

export default CompetitionDetails;
