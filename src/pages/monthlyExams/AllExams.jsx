import React from "react";
import GitMonthlyExams from "../../Hooks/student/monthlyExams/GitMonthlyExams";
import ExamCard from "../../ui/card/ExamCard";
import UserType from "../../Hooks/auth/userType";
import { Box, Flex, Heading, Spinner, Text } from "@chakra-ui/react";
const AllExams = () => {
  const [userData, isAdmin, isTeacher, student] = UserType();
  const [examsLoading, exams] = GitMonthlyExams();
  {
    examsLoading ? console.log("loading.....") : console.log(exams);
  }
  return (
    <div className='w-[90%] m-auto mt-[50px]'>
      {examsLoading ? (
        <Flex justify='center' align='center' height='200px'>
          <Spinner size='xl' />
        </Flex>
      ) : exams?.length > 0 ? (
        <Flex wrap='wrap' gap={5}>
          {exams.map((exam) => (
            <ExamCard key={exam.id} exam={exam} />
          ))}
        </Flex>
      ) : (
        <Text textAlign='center' color='gray.500'>
          لا توجد امتحانات متاحة حاليا.
        </Text>
      )}
    </div>
  );
};

export default AllExams;
