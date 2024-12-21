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
} from "@chakra-ui/react";

const ShowGrades = () => {
  // بيانات الطلاب
  const students = [
    {
      name: "أحمد محمد",
      subjects: { math: 90, science: 85, english: 88, hes: 50, fh: 70 },
      percentage: 87.67,
      rank: 1,
    },
    {
      name: "سارة علي",
      subjects: { math: 90, science: 85, english: 88, hes: 50, fh: 70 },
      percentage: 80.0,
      rank: 2,
    },
    {
      name: "محمد حسن",
      subjects: { math: 90, science: 85, english: 88, hes: 50, fh: 70 },
      percentage: 82.67,
      rank: 3,
    },
  ];

  return (
    <div className='w-[90%] m-auto'>
      <Box p={5}>
        <Heading size='lg' mb={5}>
          جدول نتائج الطلاب
        </Heading>
        <TableContainer>
          <Table variant='striped' colorScheme='teal'>
            <Thead>
              <Tr>
                <Th>اسم الطالب</Th>
                <Th>الرياضيات</Th>
                <Th>العلوم</Th>
                <Th>الإنجليزية</Th>
                <Th>احصاء </Th>
                <Th>عربى </Th>
                <Th>النسبة المئوية</Th>
                <Th>الترتيب</Th>
              </Tr>
            </Thead>
            <Tbody>
              {students.map((student, index) => (
                <Tr key={index}>
                  <Td>{student.name}</Td>
                  <Td>{student.subjects.math}</Td>
                  <Td>{student.subjects.science}</Td>
                  <Td>{student.subjects.english}</Td>
                  <Td>{student.subjects.english}</Td>
                  <Td>{student.subjects.english}</Td>
                  <Td>{student.percentage}%</Td>
                  <Td>{student.rank}</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </TableContainer>
      </Box>
    </div>
  );
};

export default ShowGrades;
