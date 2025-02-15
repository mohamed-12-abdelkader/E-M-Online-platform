import React from "react";
import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Box,
  Heading,
  Spinner,
  Flex,
} from "@chakra-ui/react";
import { useParams } from "react-router-dom";
import useGitStudentMarks from "../../Hooks/admin/mangeExam/useGitStudentMarks";

const ShowGrades = () => {
  const { id } = useParams();
  const [marksLoading, marks] = useGitStudentMarks(id);

  return (
    <Box
      w='95%'
      m='auto'
      p={5}
      boxShadow='lg'
      bg='white'
      borderRadius='md'
      mt={10}
    >
      <div className='my-5 text-center'>
        <h1 className='font-bold text-xl'>جدول نتائج الطلاب 📊</h1>
      </div>

      {marksLoading ? (
        <Flex justify='center' align='center' height='200px'>
          <Spinner size='xl' color='teal.500' />
        </Flex>
      ) : marks?.length > 0 ? (
        <TableContainer>
          <Table variant='simple' size='lg' bg='gray.50' borderRadius='md'>
            <Thead bg='teal.500'>
              <Tr>
                <Th color='white' textAlign='center'>
                  #
                </Th>
                <Th color='white' textAlign='center'>
                  اسم الطالب
                </Th>
                <Th color='white' textAlign='center'>
                  إجمالي الدرجات
                </Th>
                <Th color='white' textAlign='center'>
                  عدد الامتحانات
                </Th>
                <Th color='white' textAlign='center'>
                  النسبة المئوية
                </Th>
              </Tr>
            </Thead>
            <Tbody>
              {marks.map((student, index) => (
                <Tr
                  key={student.student_id}
                  _hover={{ bg: "gray.100", transition: "0.3s" }}
                >
                  <Td textAlign='center'>{index + 1}</Td>
                  <Td textAlign='center' fontWeight='bold'>
                    {student.full_name}
                  </Td>
                  <Td textAlign='center'>{student.total_mark}</Td>
                  <Td textAlign='center'>{student.completed_exams}</Td>
                  <Td textAlign='center' color='teal.600' fontWeight='bold'>
                    {student.total_mark_percentage}%
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </TableContainer>
      ) : (
        <Flex justify='center' align='center' height='200px'>
          <Heading size='md' color='gray.500'>
            لا توجد نتائج متاحة حاليًا.
          </Heading>
        </Flex>
      )}
    </Box>
  );
};

export default ShowGrades;
