import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Container,
  Heading,
  Text,
  Button,
  VStack,
  HStack,
  Card,
  CardBody,
  Image,
  Badge,
  Spinner,
  Center,
  useColorModeValue,
  Icon,
  SimpleGrid,
  Divider,
  IconButton,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Select,
  Input,
  Textarea,
  useDisclosure,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  Tooltip,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Alert,
  AlertIcon,
} from '@chakra-ui/react';
import {
  FiArrowLeft,
  FiEdit,
  FiTrash2,
  FiCheckCircle,
  FiHelpCircle,
  FiImage,
} from 'react-icons/fi';
import baseUrl from '../../api/baseUrl';
import ScrollToTop from '../../components/scollToTop/ScrollToTop';
import UserType from '../../Hooks/auth/userType';

const AssignmentQuestions = () => {
  const { assignmentId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [userData, isAdmin, isTeacher, student] = UserType();
  const toast = useToast();

  // Color mode values
  const bg = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.800', 'white');
  const subTextColor = useColorModeValue('gray.600', 'gray.400');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const primaryColor = useColorModeValue('blue.500', 'blue.300');
  const blueLight = useColorModeValue('blue.50', 'gray.700');

  // States
  const [assignment, setAssignment] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [editingQuestion, setEditingQuestion] = useState(false);
  const [updatingCorrectAnswer, setUpdatingCorrectAnswer] = useState(false);
  const [deletingQuestion, setDeletingQuestion] = useState(false);
  const [editQuestionFormData, setEditQuestionFormData] = useState({
    question_text: '',
    option_a: '',
    option_b: '',
    option_c: '',
    option_d: '',
    correct_answer: 'a',
    order_index: 0,
  });

  // Modals
  const { isOpen: isEditQuestionModalOpen, onOpen: onEditQuestionModalOpen, onClose: onEditQuestionModalClose } = useDisclosure();
  const { isOpen: isDeleteQuestionOpen, onOpen: onDeleteQuestionOpen, onClose: onDeleteQuestionClose } = useDisclosure();
  const { isOpen: isUpdateCorrectAnswerOpen, onOpen: onUpdateCorrectAnswerOpen, onClose: onUpdateCorrectAnswerClose } = useDisclosure();
  const cancelRef = React.useRef();

  // Fetch assignment and questions
  useEffect(() => {
    fetchAssignmentAndQuestions();
  }, [assignmentId]);

  const fetchAssignmentAndQuestions = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      // Fetch questions - this endpoint returns assignment_id and questions
      const questionsResponse = await baseUrl.get(`/api/assignments/${assignmentId}/questions`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (questionsResponse.data?.success) {
        // Set questions
        if (questionsResponse.data?.questions) {
          setQuestions(questionsResponse.data.questions);
        } else {
          setQuestions([]);
        }

        // Set assignment info from response or location state
        const assignmentName = location.state?.assignmentName || 'الواجب';
        const assignmentDuration = location.state?.assignmentDuration;
        
        if (questionsResponse.data?.assignment_id) {
          setAssignment({
            id: questionsResponse.data.assignment_id,
            name: assignmentName,
            duration_minutes: assignmentDuration,
          });
        }
      } else {
        setQuestions([]);
      }
    } catch (error) {
      console.error('Error fetching assignment questions:', error);
      
      // Handle specific error cases
      if (error.response?.status === 403) {
        toast({
          title: 'غير مصرح! ⚠️',
          description: error.response?.data?.message || 'يجب تفعيل الباقة أولاً للوصول إلى أسئلة الواجب',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
        // Navigate back after showing error
        setTimeout(() => {
          navigate(-1);
        }, 2000);
      } else if (error.response?.status === 404) {
        toast({
          title: 'غير موجود! ⚠️',
          description: error.response?.data?.error || 'الواجب غير موجود',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
        setTimeout(() => {
          navigate(-1);
        }, 2000);
      } else {
        toast({
          title: 'خطأ',
          description: error.response?.data?.error || error.response?.data?.message || 'فشل في جلب أسئلة الواجب',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
      setQuestions([]);
    } finally {
      setLoading(false);
    }
  };

  // Open edit question modal
  const openEditQuestionModal = (question) => {
    setSelectedQuestion(question);
    setEditQuestionFormData({
      question_text: question.question_text || '',
      option_a: question.option_a || '',
      option_b: question.option_b || '',
      option_c: question.option_c || '',
      option_d: question.option_d || '',
      correct_answer: question.correct_answer || 'a',
      order_index: question.order_index || 0,
    });
    onEditQuestionModalOpen();
  };

  // Update question
  const handleUpdateQuestion = async () => {
    if (!selectedQuestion) return;

    try {
      setEditingQuestion(true);
      const token = localStorage.getItem('token');

      const updateData = {};
      if (editQuestionFormData.question_text) updateData.question_text = editQuestionFormData.question_text;
      if (editQuestionFormData.option_a) updateData.option_a = editQuestionFormData.option_a;
      if (editQuestionFormData.option_b) updateData.option_b = editQuestionFormData.option_b;
      if (editQuestionFormData.option_c) updateData.option_c = editQuestionFormData.option_c;
      if (editQuestionFormData.option_d) updateData.option_d = editQuestionFormData.option_d;
      if (editQuestionFormData.correct_answer) updateData.correct_answer = editQuestionFormData.correct_answer;
      if (editQuestionFormData.order_index !== undefined) updateData.order_index = editQuestionFormData.order_index;

      const response = await baseUrl.put(
        `/api/assignment-questions/${selectedQuestion.id}`,
        updateData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.data?.success) {
        await fetchAssignmentAndQuestions();
        
        toast({
          title: 'تم التحديث بنجاح! ✅',
          description: 'تم تحديث السؤال بنجاح',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        onEditQuestionModalClose();
        setSelectedQuestion(null);
      }
    } catch (error) {
      console.error('Error updating question:', error);
      toast({
        title: 'فشل التحديث! ❌',
        description: error.response?.data?.error || error.response?.data?.message || 'حدث خطأ أثناء تحديث السؤال',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setEditingQuestion(false);
    }
  };

  // Update correct answer only
  const handleUpdateCorrectAnswer = async () => {
    if (!selectedQuestion) return;

    try {
      setUpdatingCorrectAnswer(true);
      const token = localStorage.getItem('token');

      const response = await baseUrl.patch(
        `/api/assignment-questions/${selectedQuestion.id}/correct-answer`,
        { correct_answer: editQuestionFormData.correct_answer },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.data?.success) {
        await fetchAssignmentAndQuestions();
        
        toast({
          title: 'تم التحديث بنجاح! ✅',
          description: 'تم تحديث الإجابة الصحيحة بنجاح',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        onUpdateCorrectAnswerClose();
        setSelectedQuestion(null);
      }
    } catch (error) {
      console.error('Error updating correct answer:', error);
      toast({
        title: 'فشل التحديث! ❌',
        description: error.response?.data?.error || error.response?.data?.message || 'حدث خطأ أثناء تحديث الإجابة الصحيحة',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setUpdatingCorrectAnswer(false);
    }
  };

  // Delete question
  const handleDeleteQuestion = async () => {
    if (!selectedQuestion) return;

    try {
      setDeletingQuestion(true);
      const token = localStorage.getItem('token');

      await baseUrl.delete(`/api/assignment-questions/${selectedQuestion.id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      toast({
        title: 'تم الحذف بنجاح! ✅',
        description: 'تم حذف السؤال بنجاح',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      await fetchAssignmentAndQuestions();
      
      onDeleteQuestionClose();
      setSelectedQuestion(null);
    } catch (error) {
      console.error('Error deleting question:', error);
      toast({
        title: 'فشل الحذف! ❌',
        description: error.response?.data?.error || error.response?.data?.message || 'حدث خطأ أثناء حذف السؤال',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setDeletingQuestion(false);
    }
  };

  // Open update correct answer dialog
  const openUpdateCorrectAnswerDialog = (question) => {
    setSelectedQuestion(question);
    setEditQuestionFormData(prev => ({
      ...prev,
      correct_answer: question.correct_answer || 'a',
    }));
    onUpdateCorrectAnswerOpen();
  };

  if (loading) {
    return (
      <Box minH="100vh" bg={bg}>
        <Container maxW="container.xl" py={8}>
          <Center py={20}>
            <VStack spacing={4}>
              <Spinner size="xl" color={primaryColor} />
              <Text color={subTextColor}>جاري التحميل...</Text>
            </VStack>
          </Center>
        </Container>
      </Box>
    );
  }

  return (
    <Box minH="100vh" mt="80px" bg={bg}>
      <Container maxW="container.xl" py={8}>
        {/* Header */}
        <Card bg={cardBg} border="1px solid" borderColor={borderColor} borderRadius="xl" mb={6}>
          <CardBody p={6}>
            <HStack justify="space-between" flexWrap="wrap" spacing={4}>
              <VStack align="start" spacing={2}>
                <HStack spacing={3}>
                  <Button
                    leftIcon={<Icon as={FiArrowLeft} />}
                    variant="outline"
                    colorScheme="blue"
                    onClick={() => navigate(-1)}
                    borderRadius="xl"
                  >
                    العودة
                  </Button>
                  <Heading size="lg" color={textColor}>
                    أسئلة الواجب: {assignment?.name || 'الواجب'}
                  </Heading>
                </HStack>
                {assignment && (
                  <HStack spacing={4} fontSize="sm" color={subTextColor}>
                    <Text>{questions.length} سؤال</Text>
                    {assignment.duration_minutes && (
                      <Text>{assignment.duration_minutes} دقيقة</Text>
                    )}
                  </HStack>
                )}
              </VStack>
            </HStack>
          </CardBody>
        </Card>

        {/* Questions List */}
        {questions.length > 0 ? (
          <VStack spacing={4} align="stretch">
            {questions.map((question, index) => (
              <Card key={question.id} bg={cardBg} border="2px solid" borderColor="green.500" borderRadius="xl">
                <CardBody p={6}>
                  <VStack spacing={4} align="stretch">
                    {/* Question Header */}
                    <HStack justify="space-between" flexWrap="wrap">
                      <HStack spacing={3}>
                        <Box
                          bg="green.500"
                          color="white"
                          borderRadius="full"
                          p={2}
                          minW="40px"
                          textAlign="center"
                          fontWeight="bold"
                          fontSize="md"
                        >
                          {index + 1}
                        </Box>
                        <Badge colorScheme={question.question_type === 'image' ? 'pink' : 'purple'} fontSize="sm" px={3} py={1}>
                          {question.question_type === 'image' ? 'صورة' : 'نصي'}
                        </Badge>
                        <Badge colorScheme="green" fontSize="sm" px={3} py={1}>
                          الإجابة: {question.correct_answer?.toUpperCase()}
                        </Badge>
                      </HStack>
                      {(isAdmin || isTeacher) && (
                        <HStack spacing={1}>
                          <Tooltip label="تحديث الإجابة الصحيحة" hasArrow>
                            <IconButton
                              icon={<Icon as={FiCheckCircle} />}
                              size="sm"
                              colorScheme="green"
                              variant="outline"
                              onClick={() => openUpdateCorrectAnswerDialog(question)}
                              aria-label="تحديث الإجابة"
                            />
                          </Tooltip>
                          <IconButton
                            icon={<Icon as={FiEdit} />}
                            size="sm"
                            colorScheme="blue"
                            variant="outline"
                            onClick={() => openEditQuestionModal(question)}
                            aria-label="تعديل"
                          />
                          <IconButton
                            icon={<Icon as={FiTrash2} />}
                            size="sm"
                            colorScheme="red"
                            variant="outline"
                            onClick={() => {
                              setSelectedQuestion(question);
                              onDeleteQuestionOpen();
                            }}
                            aria-label="حذف"
                          />
                        </HStack>
                      )}
                    </HStack>

                    <Divider />

                    {/* Question Content */}
                    {question.question_type === 'image' && question.images && question.images.length > 0 ? (
                      <Box>
                        <Text fontWeight="bold" color={textColor} fontSize="md" mb={3}>
                          الصور:
                        </Text>
                        <SimpleGrid columns={{ base: 2, md: 3, lg: 4 }} spacing={3}>
                          {question.images.map((img, imgIdx) => (
                            <Box key={imgIdx} position="relative">
                              <Image
                                src={img.image_url}
                                alt={`صورة ${imgIdx + 1}`}
                                borderRadius="md"
                                w="100%"
                                h="150px"
                                objectFit="cover"
                                border="2px solid"
                                borderColor={borderColor}
                                cursor="pointer"
                                _hover={{ borderColor: primaryColor }}
                                onClick={() => window.open(img.image_url, '_blank')}
                              />
                            </Box>
                          ))}
                        </SimpleGrid>
                      </Box>
                    ) : (
                      <Box>
                        <Text fontWeight="bold" color={textColor} fontSize="md" mb={2}>
                          نص السؤال:
                        </Text>
                        <Text color={textColor} fontSize="md" p={3} bg={blueLight} borderRadius="md" border="1px solid" borderColor={borderColor}>
                          {question.question_text || 'لا يوجد نص'}
                        </Text>
                      </Box>
                    )}

                    <Divider />

                    {/* Options */}
                    <Box>
                      <Text fontWeight="bold" color={textColor} fontSize="md" mb={3}>
                        الخيارات:
                      </Text>
                      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3}>
                        <Card bg={question.correct_answer === 'a' ? 'green.50' : cardBg} border="2px solid" borderColor={question.correct_answer === 'a' ? 'green.500' : borderColor}>
                          <CardBody p={3}>
                            <HStack spacing={2}>
                              <Badge colorScheme={question.correct_answer === 'a' ? 'green' : 'gray'} fontSize="sm">
                                أ
                              </Badge>
                              <Text color={textColor} fontSize="sm" flex={1}>
                                {question.option_a}
                              </Text>
                              {question.correct_answer === 'a' && (
                                <Icon as={FiCheckCircle} color="green.500" boxSize={5} />
                              )}
                            </HStack>
                          </CardBody>
                        </Card>
                        <Card bg={question.correct_answer === 'b' ? 'green.50' : cardBg} border="2px solid" borderColor={question.correct_answer === 'b' ? 'green.500' : borderColor}>
                          <CardBody p={3}>
                            <HStack spacing={2}>
                              <Badge colorScheme={question.correct_answer === 'b' ? 'green' : 'gray'} fontSize="sm">
                                ب
                              </Badge>
                              <Text color={textColor} fontSize="sm" flex={1}>
                                {question.option_b}
                              </Text>
                              {question.correct_answer === 'b' && (
                                <Icon as={FiCheckCircle} color="green.500" boxSize={5} />
                              )}
                            </HStack>
                          </CardBody>
                        </Card>
                        <Card bg={question.correct_answer === 'c' ? 'green.50' : cardBg} border="2px solid" borderColor={question.correct_answer === 'c' ? 'green.500' : borderColor}>
                          <CardBody p={3}>
                            <HStack spacing={2}>
                              <Badge colorScheme={question.correct_answer === 'c' ? 'green' : 'gray'} fontSize="sm">
                                ج
                              </Badge>
                              <Text color={textColor} fontSize="sm" flex={1}>
                                {question.option_c}
                              </Text>
                              {question.correct_answer === 'c' && (
                                <Icon as={FiCheckCircle} color="green.500" boxSize={5} />
                              )}
                            </HStack>
                          </CardBody>
                        </Card>
                        <Card bg={question.correct_answer === 'd' ? 'green.50' : cardBg} border="2px solid" borderColor={question.correct_answer === 'd' ? 'green.500' : borderColor}>
                          <CardBody p={3}>
                            <HStack spacing={2}>
                              <Badge colorScheme={question.correct_answer === 'd' ? 'green' : 'gray'} fontSize="sm">
                                د
                              </Badge>
                              <Text color={textColor} fontSize="sm" flex={1}>
                                {question.option_d}
                              </Text>
                              {question.correct_answer === 'd' && (
                                <Icon as={FiCheckCircle} color="green.500" boxSize={5} />
                              )}
                            </HStack>
                          </CardBody>
                        </Card>
                      </SimpleGrid>
                    </Box>
                  </VStack>
                </CardBody>
              </Card>
            ))}
          </VStack>
        ) : (
          <Card bg={cardBg} border="1px solid" borderColor={borderColor} borderRadius="xl">
            <CardBody p={8}>
              <Center>
                <VStack spacing={4}>
                  <Icon as={FiHelpCircle} boxSize={12} color={subTextColor} />
                  <Text color={subTextColor} fontSize="lg">
                    لا توجد أسئلة
                  </Text>
                </VStack>
              </Center>
            </CardBody>
          </Card>
        )}

        {/* Edit Question Modal */}
        <Modal isOpen={isEditQuestionModalOpen} onClose={onEditQuestionModalClose} size={{ base: "full", sm: "md", md: "lg", lg: "xl" }} isCentered>
          <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(10px)" />
          <ModalContent borderRadius={{ base: "xl", md: "2xl" }} overflow="hidden" m={{ base: 0, sm: 4 }}>
            <Box bg="linear-gradient(135deg, #3182CE 0%, #2B6CB0 100%)" p={{ base: 4, md: 6 }} color="white">
              <ModalHeader p={0}>
                <HStack spacing={{ base: 2, md: 3 }}>
                  <Icon as={FiEdit} boxSize={{ base: 5, md: 6 }} />
                  <Text fontSize={{ base: "lg", md: "xl" }} fontWeight="bold">
                    تعديل السؤال
                  </Text>
                </HStack>
              </ModalHeader>
              <ModalCloseButton color="white" _hover={{ bg: 'whiteAlpha.200' }} size={{ base: "md", md: "lg" }} />
            </Box>

            <ModalBody p={{ base: 4, md: 6 }} bg={cardBg} maxH="80vh" overflowY="auto">
              <VStack spacing={6} align="stretch">
                {selectedQuestion?.question_type === 'text' && (
                  <FormControl>
                    <FormLabel fontWeight="bold" color={textColor} fontSize="md" mb={2}>
                      نص السؤال
                    </FormLabel>
                    <Textarea
                      value={editQuestionFormData.question_text}
                      onChange={(e) =>
                        setEditQuestionFormData((prev) => ({ ...prev, question_text: e.target.value }))
                      }
                      placeholder="أدخل نص السؤال"
                      borderColor={borderColor}
                      borderRadius="lg"
                      rows={3}
                      _focus={{
                        borderColor: primaryColor,
                        boxShadow: `0 0 0 3px ${primaryColor}33`,
                        borderWidth: '2px',
                      }}
                    />
                  </FormControl>
                )}

                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                  <FormControl>
                    <FormLabel fontWeight="bold" color={textColor} fontSize="md" mb={2}>
                      الخيار أ
                    </FormLabel>
                    <Input
                      value={editQuestionFormData.option_a}
                      onChange={(e) =>
                        setEditQuestionFormData((prev) => ({ ...prev, option_a: e.target.value }))
                      }
                      placeholder="أدخل الخيار أ"
                      borderColor={borderColor}
                      borderRadius="lg"
                      size="lg"
                      _focus={{
                        borderColor: primaryColor,
                        boxShadow: `0 0 0 3px ${primaryColor}33`,
                        borderWidth: '2px',
                      }}
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel fontWeight="bold" color={textColor} fontSize="md" mb={2}>
                      الخيار ب
                    </FormLabel>
                    <Input
                      value={editQuestionFormData.option_b}
                      onChange={(e) =>
                        setEditQuestionFormData((prev) => ({ ...prev, option_b: e.target.value }))
                      }
                      placeholder="أدخل الخيار ب"
                      borderColor={borderColor}
                      borderRadius="lg"
                      size="lg"
                      _focus={{
                        borderColor: primaryColor,
                        boxShadow: `0 0 0 3px ${primaryColor}33`,
                        borderWidth: '2px',
                      }}
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel fontWeight="bold" color={textColor} fontSize="md" mb={2}>
                      الخيار ج
                    </FormLabel>
                    <Input
                      value={editQuestionFormData.option_c}
                      onChange={(e) =>
                        setEditQuestionFormData((prev) => ({ ...prev, option_c: e.target.value }))
                      }
                      placeholder="أدخل الخيار ج"
                      borderColor={borderColor}
                      borderRadius="lg"
                      size="lg"
                      _focus={{
                        borderColor: primaryColor,
                        boxShadow: `0 0 0 3px ${primaryColor}33`,
                        borderWidth: '2px',
                      }}
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel fontWeight="bold" color={textColor} fontSize="md" mb={2}>
                      الخيار د
                    </FormLabel>
                    <Input
                      value={editQuestionFormData.option_d}
                      onChange={(e) =>
                        setEditQuestionFormData((prev) => ({ ...prev, option_d: e.target.value }))
                      }
                      placeholder="أدخل الخيار د"
                      borderColor={borderColor}
                      borderRadius="lg"
                      size="lg"
                      _focus={{
                        borderColor: primaryColor,
                        boxShadow: `0 0 0 3px ${primaryColor}33`,
                        borderWidth: '2px',
                      }}
                    />
                  </FormControl>
                </SimpleGrid>

                <FormControl>
                  <FormLabel fontWeight="bold" color={textColor} fontSize="md" mb={2}>
                    الإجابة الصحيحة
                  </FormLabel>
                  <Select
                    value={editQuestionFormData.correct_answer}
                    onChange={(e) =>
                      setEditQuestionFormData((prev) => ({ ...prev, correct_answer: e.target.value }))
                    }
                    borderColor={borderColor}
                    borderRadius="lg"
                    size="lg"
                    _focus={{
                      borderColor: primaryColor,
                      boxShadow: `0 0 0 3px ${primaryColor}33`,
                      borderWidth: '2px',
                    }}
                  >
                    <option value="a">أ - {editQuestionFormData.option_a || 'الخيار أ'}</option>
                    <option value="b">ب - {editQuestionFormData.option_b || 'الخيار ب'}</option>
                    <option value="c">ج - {editQuestionFormData.option_c || 'الخيار ج'}</option>
                    <option value="d">د - {editQuestionFormData.option_d || 'الخيار د'}</option>
                  </Select>
                </FormControl>

                <FormControl>
                  <FormLabel fontWeight="bold" color={textColor} fontSize="md" mb={2}>
                    ترتيب السؤال
                  </FormLabel>
                  <NumberInput
                    value={editQuestionFormData.order_index}
                    onChange={(valueString) =>
                      setEditQuestionFormData((prev) => ({ ...prev, order_index: parseInt(valueString) || 0 }))
                    }
                    min={0}
                  >
                    <NumberInputField
                      borderColor={borderColor}
                      borderRadius="lg"
                      size="lg"
                      _focus={{
                        borderColor: primaryColor,
                        boxShadow: `0 0 0 3px ${primaryColor}33`,
                        borderWidth: '2px',
                      }}
                    />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                </FormControl>
              </VStack>
            </ModalBody>

            <ModalFooter p={{ base: 4, md: 6 }} bg={useColorModeValue("gray.50", "gray.700")} borderTop="1px solid" borderColor={borderColor}>
              <HStack spacing={3} w="full" justify="flex-end">
                <Button onClick={onEditQuestionModalClose} variant="outline" size={{ base: "md", md: "lg" }} borderRadius="xl" px={{ base: 4, md: 6 }} fontSize={{ base: "sm", md: "md" }}>
                  إلغاء
                </Button>
                <Button
                  bg="linear-gradient(135deg, #3182CE 0%, #2B6CB0 100%)"
                  color="white"
                  onClick={handleUpdateQuestion}
                  isLoading={editingQuestion}
                  loadingText="جاري التحديث..."
                  size={{ base: "md", md: "lg" }}
                  px={{ base: 6, md: 8 }}
                  borderRadius="xl"
                  fontWeight="bold"
                  leftIcon={<Icon as={FiEdit} />}
                  fontSize={{ base: "sm", md: "md" }}
                  _hover={{
                    transform: 'translateY(-2px)',
                    shadow: 'xl',
                  }}
                  transition="all 0.3s ease"
                >
                  حفظ التغييرات
                </Button>
              </HStack>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* Update Correct Answer Modal */}
        <Modal isOpen={isUpdateCorrectAnswerOpen} onClose={onUpdateCorrectAnswerClose} size={{ base: "full", sm: "md", md: "lg" }} isCentered>
          <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(10px)" />
          <ModalContent borderRadius={{ base: "xl", md: "2xl" }} overflow="hidden" m={{ base: 0, sm: 4 }}>
            <Box bg="linear-gradient(135deg, #38A169 0%, #2F855A 100%)" p={{ base: 4, md: 6 }} color="white">
              <ModalHeader p={0}>
                <HStack spacing={{ base: 2, md: 3 }}>
                  <Icon as={FiCheckCircle} boxSize={{ base: 5, md: 6 }} />
                  <Text fontSize={{ base: "lg", md: "xl" }} fontWeight="bold">
                    تحديث الإجابة الصحيحة
                  </Text>
                </HStack>
              </ModalHeader>
              <ModalCloseButton color="white" _hover={{ bg: 'whiteAlpha.200' }} size={{ base: "md", md: "lg" }} />
            </Box>

            <ModalBody p={{ base: 4, md: 6 }} bg={cardBg}>
              <VStack spacing={4} align="stretch">
                <Text color={textColor} fontSize="md">
                  اختر الإجابة الصحيحة للسؤال:
                </Text>
                {selectedQuestion && (
                  <Box p={3} bg={blueLight} borderRadius="md" border="1px solid" borderColor={borderColor}>
                    {selectedQuestion.question_type === 'image' && selectedQuestion.images && selectedQuestion.images.length > 0 ? (
                      <Text color={textColor} fontSize="sm" fontWeight="medium">
                        سؤال بصورة ({selectedQuestion.images.length} صورة)
                      </Text>
                    ) : (
                      <Text color={textColor} fontSize="sm" fontWeight="medium" noOfLines={2}>
                        {selectedQuestion.question_text}
                      </Text>
                    )}
                  </Box>
                )}
                <FormControl isRequired>
                  <FormLabel fontWeight="bold" color={textColor} fontSize="md" mb={2}>
                    الإجابة الصحيحة
                  </FormLabel>
                  <Select
                    value={editQuestionFormData.correct_answer}
                    onChange={(e) =>
                      setEditQuestionFormData((prev) => ({ ...prev, correct_answer: e.target.value }))
                    }
                    borderColor={borderColor}
                    borderRadius="lg"
                    size="lg"
                    _focus={{
                      borderColor: primaryColor,
                      boxShadow: `0 0 0 3px ${primaryColor}33`,
                      borderWidth: '2px',
                    }}
                  >
                    <option value="a">أ - {selectedQuestion?.option_a || 'الخيار أ'}</option>
                    <option value="b">ب - {selectedQuestion?.option_b || 'الخيار ب'}</option>
                    <option value="c">ج - {selectedQuestion?.option_c || 'الخيار ج'}</option>
                    <option value="d">د - {selectedQuestion?.option_d || 'الخيار د'}</option>
                  </Select>
                </FormControl>
              </VStack>
            </ModalBody>

            <ModalFooter p={{ base: 4, md: 6 }} bg={useColorModeValue("gray.50", "gray.700")} borderTop="1px solid" borderColor={borderColor}>
              <HStack spacing={3} w="full" justify="flex-end">
                <Button onClick={onUpdateCorrectAnswerClose} variant="outline" size={{ base: "md", md: "lg" }} borderRadius="xl" px={{ base: 4, md: 6 }} fontSize={{ base: "sm", md: "md" }}>
                  إلغاء
                </Button>
                <Button
                  bg="linear-gradient(135deg, #38A169 0%, #2F855A 100%)"
                  color="white"
                  onClick={handleUpdateCorrectAnswer}
                  isLoading={updatingCorrectAnswer}
                  loadingText="جاري التحديث..."
                  size={{ base: "md", md: "lg" }}
                  px={{ base: 6, md: 8 }}
                  borderRadius="xl"
                  fontWeight="bold"
                  leftIcon={<Icon as={FiCheckCircle} />}
                  fontSize={{ base: "sm", md: "md" }}
                  _hover={{
                    transform: 'translateY(-2px)',
                    shadow: 'xl',
                  }}
                  transition="all 0.3s ease"
                >
                  تحديث الإجابة
                </Button>
              </HStack>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* Delete Question Dialog */}
        <AlertDialog
          isOpen={isDeleteQuestionOpen}
          leastDestructiveRef={cancelRef}
          onClose={onDeleteQuestionClose}
        >
          <AlertDialogOverlay>
            <AlertDialogContent>
              <AlertDialogHeader fontSize="lg" fontWeight="bold">
                حذف السؤال
              </AlertDialogHeader>

              <AlertDialogBody>
                هل أنت متأكد من حذف هذا السؤال؟ هذا الإجراء لا يمكن التراجع عنه.
              </AlertDialogBody>

              <AlertDialogFooter>
                <Button ref={cancelRef} onClick={onDeleteQuestionClose}>
                  إلغاء
                </Button>
                <Button
                  colorScheme="red"
                  onClick={handleDeleteQuestion}
                  ml={3}
                  isLoading={deletingQuestion}
                  loadingText="جاري الحذف..."
                >
                  حذف
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialogOverlay>
        </AlertDialog>
      </Container>
      <ScrollToTop />
    </Box>
  );
};

export default AssignmentQuestions;

