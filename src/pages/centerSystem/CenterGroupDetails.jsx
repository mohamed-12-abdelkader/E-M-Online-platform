import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Table,
  Thead,
  Tr,
  Th,
  Tbody,
  Td,
  useDisclosure,
  TableContainer,
  Text,
  Badge,
  IconButton,
  Input,
  InputGroup,
  InputLeftElement,
  Flex,
} from '@chakra-ui/react';
import { useState } from 'react';
import { FiEdit, FiTrash2, FiSearch } from 'react-icons/fi';
import AddStudentModal from '../../components/centerSystem/AddStudentModal';

const CenterGroupDetails = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const navigate = useNavigate(); // للتنقل بين الصفحات
  const [students, setStudents] = useState([
    {
      id: 1,
      name: 'أحمد محمد',
      code: 'ST123',
      attendance: 8,
      level: 'ثالثة ثانوي',
      absence: '20%',
    },
    {
      id: 2,
      name: 'محمد علي',
      code: 'ST124',
      attendance: 7,
      level: 'ثانية ثانوي',
      absence: '15%',
    },
    {
      id: 3,
      name: 'خالد أحمد',
      code: 'ST125',
      attendance: 9,
      level: 'ثالثة ثانوي',
      absence: '10%',
    },
    {
      id: 4,
      name: 'عبدالله سعيد',
      code: 'ST126',
      attendance: 6,
      level: 'أولى ثانوي',
      absence: '25%',
    },
    {
      id: 5,
      name: 'يوسف حسن',
      code: 'ST127',
      attendance: 8,
      level: 'ثالثة ثانوي',
      absence: '18%',
    },
  ]);

  const [searchTerm, setSearchTerm] = useState('');

  const handleAddStudent = (student) => {
    setStudents([...students, { ...student, id: Date.now() }]);
  };

  const handleDeleteStudent = (id) => {
    setStudents(students.filter((student) => student.id !== id));
  };

  // التنقل إلى صفحة تفاصيل الطالب
  const handleRowClick = (id) => {
    navigate(`/student/${id}`);
  };

  const filteredStudents = students.filter((student) =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Box p={6} mt="80px" bg="gray.50" borderRadius="lg" shadow="md">
      <Flex justifyContent="space-between" alignItems="center" mb={6}>
        <Button
          colorScheme="teal"
          onClick={onOpen}
          size="lg"
          _hover={{ transform: 'scale(1.05)', transition: '0.2s' }}
        >
          إضافة طالب
        </Button>
        <InputGroup maxW="300px">
          <InputLeftElement pointerEvents="none">
            <FiSearch color="gray.500" />
          </InputLeftElement>
          <Input
            placeholder="ابحث باسم الطالب"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            bg="white"
            borderRadius="md"
            shadow="sm"
            _focus={{ borderColor: 'teal.500', shadow: 'md' }}
          />
        </InputGroup>
      </Flex>

      <TableContainer bg="white" borderRadius="md" shadow="sm">
        <Table variant="striped" colorScheme="teal">
          <Thead bg="teal.500">
            <Tr>
              <Th color="white" fontSize="lg" textAlign="right">الاسم</Th>
              <Th color="white" fontSize="lg" textAlign="right">الكود</Th>
              <Th color="white" fontSize="lg" textAlign="right">الحضور</Th>
              <Th color="white" fontSize="lg" textAlign="right">المستوى الدراسي</Th>
              <Th color="white" fontSize="lg" textAlign="right">نسبة الغياب</Th>
              <Th color="white" fontSize="lg" textAlign="right">الإجراءات</Th>
            </Tr>
          </Thead>
          <Tbody>
            {filteredStudents.length > 0 ? (
              filteredStudents.map((s) => (
                <Tr
                  key={s.id}
                  _hover={{ bg: 'teal.50', transition: '0.2s', cursor: 'pointer' }}
                  onClick={() => handleRowClick(s.id)} // التنقل عند النقر
                >
                  <Td>
                    <Text fontWeight="bold">{s.name}</Text>
                  </Td>
                  <Td>
                    <Badge colorScheme="blue" p={2} borderRadius="md">{s.code}</Badge>
                  </Td>
                  <Td>
                    <Text color="green.600">{s.attendance} أيام</Text>
                  </Td>
                  <Td>{s.level}</Td>
                  <Td>
                    <Text color={parseFloat(s.absence) > 20 ? 'red.500' : 'gray.600'}>
                      {s.absence}
                    </Text>
                  </Td>
                  <Td onClick={(e) => e.stopPropagation()}> {/* منع النقر على الأزرار من تفعيل التنقل */}
                    <IconButton
                      aria-label="Edit student"
                      icon={<FiEdit />}
                      colorScheme="teal"
                      variant="ghost"
                      mr={2}
                      _hover={{ bg: 'teal.100' }}
                    />
                    <IconButton
                      aria-label="Delete student"
                      icon={<FiTrash2 />}
                      colorScheme="red"
                      variant="ghost"
                      _hover={{ bg: 'red.100' }}
                      onClick={() => handleDeleteStudent(s.id)}
                    />
                  </Td>
                </Tr>
              ))
            ) : (
              <Tr>
                <Td colSpan={6} textAlign="center">
                  <Text color="gray.500" fontSize="lg">
                    لا توجد نتائج مطابقة
                  </Text>
                </Td>
              </Tr>
            )}
          </Tbody>
        </Table>
      </TableContainer>

      <AddStudentModal isOpen={isOpen} onClose={onClose} onAdd={handleAddStudent} />
    </Box>
  );
};

export default CenterGroupDetails;