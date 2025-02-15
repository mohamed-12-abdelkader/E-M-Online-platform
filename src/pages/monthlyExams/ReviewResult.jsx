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
} from "@chakra-ui/react";
import { FaCheckCircle } from "react-icons/fa";
import { useParams } from "react-router-dom";
import useReviewResult from "../../Hooks/student/monthlyExams/useReviewResult";

const ReviewResult = () => {
  const { id } = useParams();
  const [reviewLoading, review] = useReviewResult(id);

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
    <Box maxW='800px' mx='auto' py={6}>
      <Heading mb={4} textAlign='center'>
        مراجعة نتيجة الامتحان: {review.submission.collection_name}
      </Heading>
      <Text textAlign='center' fontSize='lg' mb={6}>
        الدرجة: {review.submission.mark} / {review.submission.mark_max}
      </Text>

      <Stack spacing={6}>
        {review.result.map((question, index) => (
          <Card key={question.id} p={4} boxShadow='md' borderRadius='lg'>
            <CardBody>
              <Text fontWeight='bold' mb={3}>
                {index + 1}. {question.question_text}
              </Text>
              <RadioGroup>
                <Stack>
                  {question.options.map((option) => (
                    <Box
                      key={option.id}
                      display='flex'
                      alignItems='center'
                      gap={2}
                      color={
                        option.id === question.correct_option_id
                          ? "green.500"
                          : "black"
                      }
                    >
                      <Radio
                        isChecked={option.id === question.correct_option_id}
                        isDisabled
                      >
                        {option.option_text}
                      </Radio>
                      {option.id === question.correct_option_id && (
                        <FaCheckCircle color='green' />
                      )}
                    </Box>
                  ))}
                </Stack>
              </RadioGroup>
            </CardBody>
          </Card>
        ))}
      </Stack>
    </Box>
  );
};

export default ReviewResult;
