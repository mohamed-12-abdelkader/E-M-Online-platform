import React, { useEffect, useState } from 'react';
import {
  Box, Spinner, Center, Text, Badge, Button, HStack, VStack, Icon, Tooltip, CircularProgress, CircularProgressLabel, Flex
} from '@chakra-ui/react';
import { AiOutlineCheckCircle, AiOutlineCloseCircle, AiOutlineFileSearch } from 'react-icons/ai';
import { FaBookOpen, FaGraduationCap } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import baseUrl from '../../api/baseUrl';

const ExamGrades = () => {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchGrades = async () => {
      try {
        setLoading(true);
        setError(null);
        const token = localStorage.getItem('token');
        const res = await baseUrl.get('/api/course/my-exam-grades', token ? { headers: { Authorization: `Bearer ${token}` } } : {});
        setExams(res.data.exams || []);
      } catch (err) {
        setError('حدث خطأ أثناء تحميل الدرجات');
      } finally {
        setLoading(false);
      }
    };
    fetchGrades();
  }, []);

  if (loading) {
    return (
      <Center minH="60vh">
        <Spinner size="xl" color="blue.500" />
        <Text mt={4}>جاري تحميل الدرجات...</Text>
      </Center>
    );
  }

  if (error) {
    return (
      <Center minH="60vh">
        <Text color="red.500">{error}</Text>
      </Center>
    );
  }

  return (
    <Box maxW="6xl" mx="auto" py={10} px={4} className="mt-[80px]">
      <Text fontSize="2xl" fontWeight="bold" mb={8} color="blue.700" textAlign="center">درجات امتحاناتي</Text>
      <VStack spacing={6} align="stretch">
        {exams.length === 0 && (
          <Center py={20}><Text color="gray.500">لا توجد امتحانات متاحة</Text></Center>
        )}
        {exams.map((exam, idx) => (
          <Flex key={exam.exam_id} direction={{ base: 'column', md: 'row' }} align="center" justify="space-between" p={6} borderRadius="2xl" boxShadow="xl" bgGradient={exam.status === 'submitted' ? (exam.passed ? 'linear(to-r, green.50, white)' : 'linear(to-r, red.50, white)') : 'linear(to-r, blue.50, white)'} border="1px solid #e2e8f0" gap={6} _hover={{ boxShadow: '2xl', borderColor: 'blue.300', transform: 'scale(1.01)' }} transition="0.2s">
            <VStack align="start" spacing={2} flex={2} w="100%">
              <HStack spacing={3} mb={1}>
                <Tooltip label={exam.exam_type === 'course' ? 'امتحان شامل' : 'امتحان محاضرة'}>
                  <Box>
                    {exam.exam_type === 'course' ? (
                      <FaGraduationCap color="#805ad5" size={22} />
                    ) : (
                      <FaBookOpen color="#3182ce" size={22} />
                    )}
                  </Box>
                </Tooltip>
                <Text fontWeight="bold" fontSize="lg" color="blue.700">{exam.exam_title}</Text>
                <Badge colorScheme={exam.exam_type === 'course' ? 'purple' : 'blue'} fontSize="0.9em">
                  {exam.exam_type === 'course' ? 'شامل' : 'محاضرة'}
                </Badge>
              </HStack>
              <Text color="gray.600" fontSize="md">الكورس: <b>{exam.course_title}</b></Text>
              <HStack spacing={4} mt={2}>
                <Badge colorScheme="gray" fontSize="sm">الدرجة الكلية: {exam.total_grade}</Badge>
                {exam.status === 'submitted' && (
                  <Badge colorScheme={exam.passed ? 'green' : 'red'} fontSize="sm">
                    درجتك: {exam.student_grade}
                  </Badge>
                )}
                {exam.status === 'submitted' && (
                  <Badge colorScheme={exam.passed ? 'green' : 'red'} fontSize="sm">
                    {exam.passed ? <HStack><AiOutlineCheckCircle /> <span>ناجح</span></HStack> : <HStack><AiOutlineCloseCircle /> <span>راسب</span></HStack>}
                  </Badge>
                )}
                {exam.status !== 'submitted' && (
                  <Badge colorScheme="yellow" fontSize="sm">لم يتم التسليم</Badge>
                )}
              </HStack>
              <HStack spacing={4} mt={2}>
                {exam.status === 'submitted' && (
                  <CircularProgress value={Math.min(100, Math.round((exam.student_grade / exam.total_grade) * 100))} size="48px" color={exam.passed ? 'green.400' : 'red.400'} thickness="8px">
                    <CircularProgressLabel fontWeight="bold" fontSize="md">
                      {exam.student_grade}
                    </CircularProgressLabel>
                  </CircularProgress>
                )}
                <Text color="gray.500" fontSize="sm">
                  {exam.submitted_at ? (
                    <Badge colorScheme="blue" variant="subtle">
                      {new Date(exam.submitted_at).toLocaleString('ar-EG')}
                    </Badge>
                  ) : (
                    <Badge colorScheme="gray">لم يتم التسليم</Badge>
                  )}
                </Text>
              </HStack>
            </VStack>
            <Box flex={1} textAlign={{ base: 'center', md: 'end' }}>
              {exam.status !== 'submitted' ? (
                <Link to={exam.exam_type === 'course' ? `/exam/${exam.exam_id}` : `/ComprehensiveExam/${exam.exam_id}`}
                  style={{ textDecoration: 'none' }}>
                  <Button colorScheme="blue" size="lg" leftIcon={<Icon as={AiOutlineFileSearch} />} borderRadius="full" fontWeight="bold" px={8} py={6} boxShadow="lg">
                    ابدأ الامتحان
                  </Button>
                </Link>
              ) : (
                <Badge colorScheme="green" fontSize="md" px={4} py={2} borderRadius="xl">تم التسليم</Badge>
              )}
            </Box>
          </Flex>
        ))}
      </VStack>
    </Box>
  );
};

export default ExamGrades;