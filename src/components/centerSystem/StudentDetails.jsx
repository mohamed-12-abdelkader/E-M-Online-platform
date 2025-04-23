import { useState } from 'react';
import {
  Box,
  Text,
  Avatar,
  HStack,
  VStack,
  SimpleGrid,
  Badge,
  Table,
  Thead,
  Tr,
  Th,
  Tbody,
  Td,
  Button,
  useDisclosure,
  Icon,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  useToast,
  Center,
  Progress,
  Flex,
} from '@chakra-ui/react';
import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { MdEdit, MdDelete } from 'react-icons/md';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell } from 'recharts';
import { motion } from 'framer-motion';

const MotionBox = motion(Box);
const MotionButton = motion(Button);

const StudentDetails = () => {
  const [student, setStudent] = useState({
    name: 'أحمد محمد',
    code: 'ST123',
    avatar: '',
    onlineLectures: 3,
    attended: 5,
    missed: 3,
    submittedAssignments: 2,
    totalAssignments: 4,
    exams: [
      { name: 'امتحان 1', score: 18, total: 20 },
      { name: 'امتحان 2', score: 15, total: 20 },
    ],
    assignments: [
      { id: 1, name: 'واجب 1', score: 8, total: 10, submitted: true, date: '2025-04-10' },
      { id: 2, name: 'واجب 2', score: 0, total: 10, submitted: false, date: '-' },
      { id: 3, name: 'واجب 3', score: 9, total: 10, submitted: true, date: '2025-04-12' },
      { id: 4, name: 'واجب 4', score: 0, total: 10, submitted: false, date: '-' },
    ],
  });

  const [lectures] = useState([
    { id: 1, name: 'محاضرة 1', attended: true },
    { id: 2, name: 'محاضرة 2', attended: false },
    { id: 3, name: 'محاضرة 3', attended: true },
    { id: 4, name: 'محاضرة 4', attended: true },
    { id: 5, name: 'محاضرة 5', attended: false },
    { id: 6, name: 'محاضرة 6', attended: true },
    { id: 7, name: 'محاضرة 7', attended: false },
    { id: 8, name: 'محاضرة 8', attended: true },
  ]);

  const [newExam, setNewExam] = useState({ name: '', score: 0, total: 20 });
  const [editExam, setEditExam] = useState(null);
  const [newAssignment, setNewAssignment] = useState({ name: '', score: 0, total: 10, submitted: false, date: '' });
  const { isOpen: isExamOpen, onOpen: onExamOpen, onClose: onExamClose } = useDisclosure();
  const { isOpen: isEditExamOpen, onOpen: onEditExamOpen, onClose: onEditExamClose } = useDisclosure();
  const { isOpen: isAssignmentOpen, onOpen: onAssignmentOpen, onClose: onAssignmentClose } = useDisclosure();
  const toast = useToast();

  // Toggle lecture attendance
  const toggleLectureAttendance = (id) => {
    setStudent((prev) => {
      const lecture = lectures.find((lec) => lec.id === id);
      const newAttended = lecture.attended ? prev.attended - 1 : prev.attended + 1;
      const newMissed = lecture.attended ? prev.missed + 1 : prev.missed - 1;
      return { ...prev, attended: newAttended, missed: newMissed };
    });
    toast({
      title: 'تم تحديث الحضور',
      status: 'success',
      duration: 2000,
      isClosable: true,
    });
  };

  // Add new exam
  const addExam = () => {
    if (!newExam.name || newExam.score < 0 || newExam.total <= 0) {
      toast({
        title: 'خطأ',
        description: 'يرجى إدخال بيانات صحيحة',
        status: 'error',
        duration: 2000,
        isClosable: true,
      });
      return;
    }
    setStudent((prev) => ({
      ...prev,
      exams: [...prev.exams, newExam],
    }));
    setNewExam({ name: '', score: 0, total: 20 });
    onExamClose();
    toast({
      title: 'تم إضافة الامتحان',
      status: 'success',
      duration: 2000,
      isClosable: true,
    });
  };

  // Edit exam
  const handleEditExam = (exam) => {
    setEditExam(exam);
    onEditExamOpen();
  };

  const updateExam = () => {
    if (!editExam.name || editExam.score < 0 || editExam.total <= 0) {
      toast({
        title: 'خطأ',
        description: 'يرجى إدخال بيانات صحيحة',
        status: 'error',
        duration: 2000,
        isClosable: true,
      });
      return;
    }
    setStudent((prev) => ({
      ...prev,
      exams: prev.exams.map((ex) => (ex.name === editExam.name ? editExam : ex)),
    }));
    setEditExam(null);
    onEditExamClose();
    toast({
      title: 'تم تعديل الامتحان',
      status: 'success',
      duration: 2000,
      isClosable: true,
    });
  };

  // Delete exam
  const deleteExam = (name) => {
    setStudent((prev) => ({
      ...prev,
      exams: prev.exams.filter((ex) => ex.name !== name),
    }));
    toast({
      title: 'تم حذف الامتحان',
      status: 'success',
      duration: 2000,
      isClosable: true,
    });
  };

  // Add new assignment
  const addAssignment = () => {
    if (!newAssignment.name || newAssignment.total <= 0) {
      toast({
        title: 'خطأ',
        description: 'يرجى إدخال بيانات صحيحة',
        status: 'error',
        duration: 2000,
        isClosable: true,
      });
      return;
    }
    setStudent((prev) => ({
      ...prev,
      assignments: [
        ...prev.assignments,
        { id: prev.assignments.length + 1, ...newAssignment, date: newAssignment.submitted ? new Date().toISOString().split('T')[0] : '-' },
      ],
      submittedAssignments: newAssignment.submitted ? prev.submittedAssignments + 1 : prev.submittedAssignments,
      totalAssignments: prev.totalAssignments + 1,
    }));
    setNewAssignment({ name: '', score: 0, total: 10, submitted: false, date: '' });
    onAssignmentClose();
    toast({
      title: 'تم إضافة الواجب',
      status: 'success',
      duration: 2000,
      isClosable: true,
    });
  };

  // Delete assignment
  const deleteAssignment = (id) => {
    const assignment = student.assignments.find((ass) => ass.id === id);
    setStudent((prev) => ({
      ...prev,
      assignments: prev.assignments.filter((ass) => ass.id !== id),
      submittedAssignments: assignment.submitted ? prev.submittedAssignments - 1 : prev.submittedAssignments,
      totalAssignments: prev.totalAssignments - 1,
    }));
    toast({
      title: 'تم حذف الواجب',
      status: 'success',
      duration: 2000,
      isClosable: true,
    });
  };

  // Send report to guardian
  const sendReport = () => {
    toast({
      title: 'تم إرسال التقرير',
      description: 'تم إرسال تقرير الطالب إلى ولي الأمر',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };

  // Chart data
  const attendanceData = [
    { name: 'حضر', value: student.attended },
    { name: 'غاب', value: student.missed },
  ];

  const assignmentData = [
    { name: 'تم التسليم', value: student.submittedAssignments },
    { name: 'متبقي', value: student.totalAssignments - student.submittedAssignments },
  ];

  const COLORS = ['#16a8f0', '#FF6B6B'];

  return (
    <Center>
      <Box p={5} maxW="1200px" w="100%" my="80px" bg="gray.50" borderRadius="lg" boxShadow="xl">
        {/* Student Info */}
        <HStack spacing={6} align="center" mb={8} p={4} bg="white" borderRadius="md">
          <Avatar name={student.name} size="xl" border="2px solid" borderColor="teal.500" />
          <VStack align="start" spacing={2}>
            <Text fontSize="2xl" fontWeight="bold" color="teal.600">{student.name}</Text>
            <Text color="gray.600">كود الطالب: {student.code}</Text>
            <HStack spacing={4}>
              <Badge colorScheme="green" p={2} borderRadius="md">محاضرات حضرها: {student.attended}</Badge>
              <Badge colorScheme="red" p={2} borderRadius="md">محاضرات غاب عنها: {student.missed}</Badge>
              <Badge colorScheme="blue" p={2} borderRadius="md">أونلاين: {student.onlineLectures}</Badge>
            </HStack>
          </VStack>
        </HStack>

        {/* Charts */}
        <Box mb={8} p={4} bg="white" borderRadius="md">
          <Text fontSize="xl" fontWeight="semibold" mb={4} color="teal.600">إحصائيات الطالب</Text>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={10}>
            <Box>
              <Text fontWeight="bold" mb={2}>الحضور</Text>
              <PieChart width={300} height={200}>
                <Pie
                  data={attendanceData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {attendanceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </Box>
            <Box>
              <Text fontWeight="bold" mb={2}>الواجبات</Text>
              <BarChart width={300} height={200} data={assignmentData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#00C4B4" />
              </BarChart>
            </Box>
          </SimpleGrid>
        </Box>

        {/* Lectures */}
        <Box mb={8} p={4} bg="white" borderRadius="md">
          <Text fontSize="xl" fontWeight="semibold" mb={4} color="teal.600">جدول المحاضرات</Text>
          <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
            {lectures.map((lec) => (
              <MotionBox
                key={lec.id}
                p={4}
                borderWidth="1px"
                borderRadius="md"
                bg={lec.attended ? 'green.50' : 'red.50'}
                textAlign="center"
                cursor="pointer"
                onClick={() => toggleLectureAttendance(lec.id)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Text fontWeight="bold" color={lec.attended ? 'green.600' : 'red.600'}>{lec.name}</Text>
                <Icon
                  as={lec.attended ? FaCheckCircle : FaTimesCircle}
                  color={lec.attended ? 'green.500' : 'red.500'}
                  boxSize={6}
                />
              </MotionBox>
            ))}
          </SimpleGrid>
        </Box>

        {/* Assignments */}
        <Box mb={8} p={4} bg="white" borderRadius="md">
          <HStack justify="space-between" mb={4}>
            <Text fontSize="xl" fontWeight="semibold" color="teal.600">الواجبات</Text>
            <MotionButton
              leftIcon={<MdEdit />}
              colorScheme="teal"
              onClick={onAssignmentOpen}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              إضافة واجب
            </MotionButton>
          </HStack>
          <Progress
            value={(student.submittedAssignments / student.totalAssignments) * 100}
            size="sm"
            colorScheme="teal"
            mb={4}
          />
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>الواجب</Th>
                <Th>الدرجة</Th>
                <Th>من</Th>
                <Th>الحالة</Th>
                <Th>تاريخ التسليم</Th>
                <Th>حذف</Th>
              </Tr>
            </Thead>
            <Tbody>
              {student.assignments.map((assignment) => (
                <Tr key={assignment.id}>
                  <Td>{assignment.name}</Td>
                  <Td>{assignment.score}</Td>
                  <Td>{assignment.total}</Td>
                  <Td>
                    <Badge colorScheme={assignment.submitted ? 'green' : 'red'}>
                      {assignment.submitted ? 'تم التسليم' : 'لم يتم التسليم'}
                    </Badge>
                  </Td>
                  <Td>{assignment.date}</Td>
                  <Td>
                    <MotionButton
                      size="sm"
                      leftIcon={<MdDelete />}
                      colorScheme="red"
                      onClick={() => deleteAssignment(assignment.id)}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      حذف
                    </MotionButton>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>

        {/* Exams */}
        <Box mb={8} p={4} bg="white" borderRadius="md">
          <HStack justify="space-between" mb={4}>
            <Text fontSize="xl" fontWeight="semibold" color="teal.600">نتائج الامتحانات</Text>
            <MotionButton
              leftIcon={<MdEdit />}
              colorScheme="teal"
              onClick={onExamOpen}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              إضافة امتحان
            </MotionButton>
          </HStack>
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>الامتحان</Th>
                <Th>الدرجة</Th>
                <Th>من</Th>
                <Th>تعديل</Th>
                <Th>حذف</Th>
              </Tr>
            </Thead>
            <Tbody>
              {student.exams.map((exam, idx) => (
                <Tr key={idx}>
                  <Td>{exam.name}</Td>
                  <Td>{exam.score}</Td>
                  <Td>{exam.total}</Td>
                  <Td>
                    <MotionButton
                      size="sm"
                      leftIcon={<MdEdit />}
                      colorScheme="blue"
                      onClick={() => handleEditExam(exam)}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      تعديل
                    </MotionButton>
                  </Td>
                  <Td>
                    <MotionButton
                      size="sm"
                      leftIcon={<MdDelete />}
                      colorScheme="red"
                      onClick={() => deleteExam(exam.name)}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      حذف
                    </MotionButton>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>

        {/* Send Report Button */}
        <MotionButton
          colorScheme="purple"
          onClick={sendReport}
          w="full"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          إرسال تقرير إلى ولي الأمر
        </MotionButton>

        {/* Add Exam Modal */}
        <Modal isOpen={isExamOpen} onClose={onExamClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>إضافة امتحان جديد</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <FormControl mb={4}>
                <FormLabel>اسم الامتحان</FormLabel>
                <Input
                  value={newExam.name}
                  onChange={(e) => setNewExam({ ...newExam, name: e.target.value })}
                />
              </FormControl>
              <FormControl mb={4}>
                <FormLabel>الدرجة</FormLabel>
                <Input
                  type="number"
                  value={newExam.score}
                  onChange={(e) => setNewExam({ ...newExam, score: Number(e.target.value) })}
                />
              </FormControl>
              <FormControl>
                <FormLabel>الدرجة الكلية</FormLabel>
                <Input
                  type="number"
                  value={newExam.total}
                  onChange={(e) => setNewExam({ ...newExam, total: Number(e.target.value) })}
                />
              </FormControl>
            </ModalBody>
            <ModalFooter>
              <Button colorScheme="blue" mr={3} onClick={addExam}>
                إضافة
              </Button>
              <Button variant="ghost" onClick={onExamClose}>
                إلغاء
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* Edit Exam Modal */}
        <Modal isOpen={isEditExamOpen} onClose={onEditExamClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>تعديل الامتحان</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              {editExam && (
                <>
                  <FormControl mb={4}>
                    <FormLabel>اسم الامتحان</FormLabel>
                    <Input
                      value={editExam.name}
                      onChange={(e) => setEditExam({ ...editExam, name: e.target.value })}
                    />
                  </FormControl>
                  <FormControl mb={4}>
                    <FormLabel>الدرجة</FormLabel>
                    <Input
                      type="number"
                      value={editExam.score}
                      onChange={(e) => setEditExam({ ...editExam, score: Number(e.target.value) })}
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel>الدرجة الكلية</FormLabel>
                    <Input
                      type="number"
                      value={editExam.total}
                      onChange={(e) => setEditExam({ ...editExam, total: Number(e.target.value) })}
                    />
                  </FormControl>
                </>
              )}
            </ModalBody>
            <ModalFooter>
              <Button colorScheme="blue" mr={3} onClick={updateExam}>
                حفظ
              </Button>
              <Button variant="ghost" onClick={onEditExamClose}>
                إلغاء
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* Add Assignment Modal */}
        <Modal isOpen={isAssignmentOpen} onClose={onAssignmentClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>إضافة واجب جديد</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <FormControl mb={4}>
                <FormLabel>اسم الواجب</FormLabel>
                <Input
                  value={newAssignment.name}
                  onChange={(e) => setNewAssignment({ ...newAssignment, name: e.target.value })}
                />
              </FormControl>
              <FormControl mb={4}>
                <FormLabel>الدرجة</FormLabel>
                <Input
                  type="number"
                  value={newAssignment.score}
                  onChange={(e) => setNewAssignment({ ...newAssignment, score: Number(e.target.value) })}
                />
              </FormControl>
              <FormControl mb={4}>
                <FormLabel>الدرجة الكلية</FormLabel>
                <Input
                  type="number"
                  value={newAssignment.total}
                  onChange={(e) => setNewAssignment({ ...newAssignment, total: Number(e.target.value) })}
                />
              </FormControl>
              <FormControl>
                <FormLabel>الحالة</FormLabel>
                <Input
                  type="checkbox"
                  checked={newAssignment.submitted}
                  onChange={(e) => setNewAssignment({ ...newAssignment, submitted: e.target.checked })}
                />
                <Text as="span" ml={2}>تم التسليم</Text>
              </FormControl>
            </ModalBody>
            <ModalFooter>
              <Button colorScheme="blue" mr={3} onClick={addAssignment}>
                إضافة
              </Button>
              <Button variant="ghost" onClick={onAssignmentClose}>
                إلغاء
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </Box>
    </Center>
  );
};

export default StudentDetails;