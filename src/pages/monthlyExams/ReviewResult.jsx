import React from "react";
import {
  Box,
  Text,
  Stack,
  Radio,
  RadioGroup,
  Spinner,
  Card,
  CardBody,
  Heading,
  useColorModeValue,
  VStack,
  HStack,
  Badge,
  Icon,
} from "@chakra-ui/react";
import { FaCheckCircle, FaClipboardCheck } from "react-icons/fa";
import { useParams } from "react-router-dom";
import useReviewResult from "../../Hooks/student/monthlyExams/useReviewResult";
import { motion } from "framer-motion";

const MotionBox = motion(Box);
const MotionCard = motion(Card);

const ReviewResult = () => {
  const { id } = useParams();
  const [reviewLoading, review] = useReviewResult(id);

  const cardBg = useColorModeValue("white", "gray.800");
  const headingColor = useColorModeValue("blue.700", "blue.200");
  const textColor = useColorModeValue("gray.700", "gray.300");
  const correctBg = useColorModeValue("green.50", "green.900");
  const correctColor = useColorModeValue("green.600", "green.300");
  const borderColor = useColorModeValue("gray.200", "gray.600");

  if (reviewLoading) {
    return (
      <Box textAlign='center' py={10}>
        <Spinner size='xl' color='teal.500' />
      </Box>
    );
  }

  if (!review) {
    return (
      <Box textAlign='center' py={10} color='red.500'>
        <Text fontSize='lg'>لم يتم العثور على نتيجة لهذا الامتحان.</Text>
      </Box>
    );
  }

  return (
    <Box maxW='900px' mx='auto' py={10} px={4}>
      {/* هيدر النتيجة */}
      <MotionBox
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        mb={8}
        textAlign="center"
      >
        <HStack justify="center" spacing={4} mb={4}>
          <Box
            p={3}
            borderRadius="full"
            bgGradient="linear(to-r, blue.500, purple.500)"
            color="white"
            shadow="lg"
          >
            <Icon as={FaClipboardCheck} boxSize={7} />
          </Box>
          <Heading size="xl" color={headingColor} fontWeight="extrabold">
            مراجعة نتيجة الامتحان
          </Heading>
        </HStack>
        <Text fontSize="lg" color={textColor} fontWeight="medium">
          {review.submission.collection_name}
        </Text>
      </MotionBox>

      {/* كارت الدرجة */}
      <MotionBox
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        mb={10}
        mx="auto"
        maxW="350px"
      >
        <Card bgGradient="linear(to-br, green.100, blue.50)" borderRadius="2xl" boxShadow="2xl" p={6} textAlign="center">
          <VStack spacing={2}>
            <Text fontSize="2xl" fontWeight="bold" color={headingColor}>
              الدرجة النهائية
            </Text>
            <HStack justify="center" spacing={2}>
              <Badge colorScheme="green" fontSize="2xl" px={4} py={2} borderRadius="full">
                {review.submission.mark} / {review.submission.mark_max}
              </Badge>
            </HStack>
          </VStack>
        </Card>
      </MotionBox>

      {/* الأسئلة */}
      <Stack spacing={8}>
        {review.result.map((question, index) => (
          <MotionCard
            key={question.id}
            p={6}
            boxShadow='xl'
            borderRadius='2xl'
            bg={cardBg}
            border="1px solid"
            borderColor={borderColor}
            whileHover={{ scale: 1.01, boxShadow: "2xl" }}
            transition={{ duration: 0.2 }}
          >
            <CardBody>
              <VStack align="flex-start" spacing={4}>
                <HStack spacing={3} mb={2}>
                  <Badge colorScheme="blue" fontSize="lg" px={3} py={1} borderRadius="full">
                    {index + 1}
                  </Badge>
                  <Text fontWeight='bold' fontSize="lg" color={headingColor}>
                    {question.question_text}
                  </Text>
                </HStack>
                <RadioGroup>
                  <VStack align="flex-start" spacing={2}>
                    {question.options.map((option) => {
                      const isCorrect = option.id === question.correct_option_id;
                      return (
                        <Box
                          key={option.id}
                          display='flex'
                          alignItems='center'
                          gap={2}
                          bg={isCorrect ? correctBg : undefined}
                          color={isCorrect ? correctColor : textColor}
                          px={isCorrect ? 3 : 0}
                          py={isCorrect ? 2 : 0}
                          borderRadius={isCorrect ? "lg" : undefined}
                          fontWeight={isCorrect ? "bold" : "normal"}
                        >
                          <Radio
                            isChecked={isCorrect}
                            isDisabled
                            colorScheme={isCorrect ? "green" : "gray"}
                          >
                            {option.option_text}
                          </Radio>
                          {isCorrect && (
                            <FaCheckCircle color='green' />
                          )}
                        </Box>
                      );
                    })}
                  </VStack>
                </RadioGroup>
              </VStack>
            </CardBody>
          </MotionCard>
        ))}
      </Stack>
    </Box>
  );
};

export default ReviewResult;
