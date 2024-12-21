import React, { useEffect, useState } from "react";
import {
  Box,
  Image,
  Heading,
  Text,
  Button,
  VStack,
  HStack,
  Stack,
  Center,
  IconButton,
  Skeleton,
} from "@chakra-ui/react";
import { FaVideo } from "react-icons/fa";
import useStartExam from "../../Hooks/student/monthlyExams/useStartExam";
import { Link, useParams } from "react-router-dom";

const SubjectExam = () => {
  const { id } = useParams();
  const [loading, responseData, error, handleStart] = useStartExam({ id: id });

  const [isDataLoaded, setIsDataLoaded] = useState(false);

  useEffect(() => {
    handleStart();
    // Set isDataLoaded to true once data is fetched
    if (responseData) {
      setIsDataLoaded(true);
    }
    console.log("Response Data:", responseData);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [responseData]);

  return (
    <Center w={"100%"} minH='100vh' bg='gray.50' p={5}>
      <Box
        w={{ base: "90%", md: "70%", lg: "80%" }}
        p={8}
        bg='white'
        boxShadow='2xl'
        borderRadius='xl'
        overflow='hidden'
      >
        <Stack spacing={8}>
          {/* Header Section */}
          <Box textAlign='center'>
            <Skeleton isLoaded={isDataLoaded}>
              <Image
                src={
                  responseData?.exam?.cover.path ||
                  "https://via.placeholder.com/800x400"
                }
                alt='Exam'
                borderRadius='md'
                mb={5}
                className='h-[300px] w-[90%] m-auto border'
              />
            </Skeleton>
            <Skeleton isLoaded={isDataLoaded}>
              <Heading as='h2' size='xl' mb={4} color='blue.500'>
                {responseData?.exam?.title || "Loading..."}
              </Heading>
            </Skeleton>
            <Skeleton isLoaded={isDataLoaded}>
              <Text fontSize='lg' color='gray.600'>
                {responseData?.exam?.description || "Loading..."}
              </Text>
            </Skeleton>
          </Box>

          {/* Exam Section */}
          <Box
            p={6}
            bg='blue.50'
            borderRadius='md'
            boxShadow='lg'
            textAlign='center'
          >
            <Skeleton isLoaded={isDataLoaded}>
              <Text fontSize='xl' fontWeight='bold' color='blue.900' mb={4}>
                اسم الامتحان: {responseData?.exam?.title || "Loading..."}
              </Text>
            </Skeleton>
            <Skeleton isLoaded={isDataLoaded}>
              <Link to={"questions"}>
                <Button
                  colorScheme='blue'
                  size='lg'
                  w='full'
                  borderRadius='full'
                >
                  ابدأ الامتحان
                </Button>
              </Link>
            </Skeleton>
          </Box>

          {/* Video Section */}

          <HStack
            spacing={5}
            justify='space-between'
            p={5}
            bg='gray.100'
            borderRadius='md'
            boxShadow='md'
          >
            {/* Check if reviews exist */}
            {responseData?.exam?.reviews &&
              responseData.exam.reviews.length > 0 && (
                <>
                  <Skeleton isLoaded={isDataLoaded}>
                    <Text fontSize='xl' fontWeight='bold' color='gray.700'>
                      {responseData.exam.reviews[0].title || "Loading..."}
                    </Text>
                  </Skeleton>
                  <Skeleton isLoaded={isDataLoaded}>
                    <IconButton
                      icon={<FaVideo />}
                      colorScheme='red'
                      size='lg'
                      variant='solid'
                      aria-label='تشغيل الفيديو'
                    />
                  </Skeleton>
                </>
              )}
          </HStack>
        </Stack>
      </Box>
    </Center>
  );
};

export default SubjectExam;
