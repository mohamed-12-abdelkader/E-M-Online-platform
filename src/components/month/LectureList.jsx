import React from "react";
import {
  Box,
  SimpleGrid,
  Text,
  Button,
  Icon,
  useColorModeValue,
  Skeleton,
  Stack,
  Flex,
} from "@chakra-ui/react";
import { GoArrowLeft } from "react-icons/go";
import { Link } from "react-router-dom";
import { Zoom } from "react-awesome-reveal";
import { CoursesCard } from "../../ui/card/CoursesCard";

const LectureList = ({
  lectures,
  isTeacher,
  onOpen,
  setSelectedLecture,
  monthLoading,
  noflecture,
}) => {
  const textColor = useColorModeValue("gray.700", "gray.200");
  const accentColor = useColorModeValue("blue.500", "blue.300");

  if (monthLoading) {
    return (
      <Stack spacing={4}>
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} height='200px' borderRadius='lg' />
        ))}
      </Stack>
    );
  }

  if (!lectures || lectures.length === 0) {
    return (
      <Box
        textAlign='center'
        py={10}
        px={6}
        borderRadius='lg'
        bg={useColorModeValue("gray.50", "gray.700")}
      >
        {isTeacher ? (
          <Box>
            <Text fontSize='xl' fontWeight='bold' mb={4} color={textColor}>
              لا يوجد محاضرات في هذا الكورس
            </Text>
            <Button
              as={Link}
              to='/admin/add_lecture_month'
              colorScheme='blue'
              leftIcon={<GoArrowLeft />}
              size='lg'
            >
              أضف محاضراتك الآن
            </Button>
          </Box>
        ) : (
          <Text fontSize='xl' fontWeight='bold' color={textColor}>
            سوف يتم إضافة المحتوى قريباً
          </Text>
        )}
      </Box>
    );
  }

  return (
    <div>
      <Text
        fontSize='xl'
        fontWeight='bold'
        mb={6}
        color={textColor}
        display='flex'
        alignItems='center'
      >
        عدد المحاضرات:{" "}
        <Text as='span' color={accentColor} mr={2}>
          ({noflecture})
        </Text>
      </Text>

      {/* تعديل تنسيق عرض المحاضرات */}
      <div className='flex flex-wrap justify-evenly px-auto my-3 w-[98%] m-auto'>
        {lectures.map((lecture) => (
          <Zoom key={lecture.id}>
            <CoursesCard
              type='lecture'
              handleDeleate={() => {
                setSelectedLecture(lecture);
                onOpen();
              }}
              lectre={lecture}
              href={`/lecture/${lecture.id}`}
            />
          </Zoom>
        ))}
      </div>
    </div>
  );
};

export default LectureList;
