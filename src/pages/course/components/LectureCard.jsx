import React from "react";
import {
  Box, Flex, HStack, VStack, Text, Badge, Icon, IconButton, Button, Collapse, Divider, Tooltip, useColorModeValue,
  Stack, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter, ModalCloseButton,
  FormControl, FormLabel, Input, Textarea
} from "@chakra-ui/react";
import {
  FaPlayCircle, FaLock, FaEdit, FaTrash, FaPlus, FaGraduationCap, FaRegPaperPlane, FaVideo, FaFilePdf, FaLightbulb, FaClock, FaBookOpen, FaStar,
  FaAngleDown, FaAngleUp, FaEye, FaEyeSlash, FaCalendar, FaTag, FaComments, FaUsers, FaRegComment
} from "react-icons/fa";
import baseUrl from "../../../api/baseUrl";
import { Link } from "react-router-dom";

const resourceIconMap = {
  pdf: FaFilePdf,
  doc: FaFilePdf,
  default: FaFilePdf,
};

const LectureCard = ({
  lecture,
  isTeacher,
  isAdmin,
  expandedLecture,
  setExpandedLecture,
  handleEditLecture,
  handleDeleteLecture,
  handleAddVideo,
  handleEditVideo,
  handleDeleteVideo,
  handleAddFile,
  handleEditFile,
  handleDeleteFile,
  setExamModal,
  setDeleteExamDialog,
  examActionLoading,
  itemBg,
  sectionBg,
  headingColor,
  subTextColor,
  borderColor,
  dividerColor,
  textColor,
  canExpand,
  isExpanded,
  formatDate,
  courseId,
  onAddBulkQuestions,
  handleOpenVideo,
  ...props
}) => {
  const [visibilityLoading, setVisibilityLoading] = React.useState(false);
  const [isVisible, setIsVisible] = React.useState(lecture.is_visible ?? true);
  const [lectureExam, setLectureExam] = React.useState(null);
  const [examLoading, setExamLoading] = React.useState(false);
  const [commentsStats, setCommentsStats] = React.useState({
    total: 0,
    recent: 0,
    loading: false
  });
  const [essayExam, setEssayExam] = React.useState(null);
  const [essayExamLoading, setEssayExamLoading] = React.useState(false);
  const [essayExamModal, setEssayExamModal] = React.useState({ isOpen: false, type: 'add', data: null });
  const [essayExamModalLoading, setEssayExamModalLoading] = React.useState(false);
  const [essayExamSubmissions, setEssayExamSubmissions] = React.useState([]);
  const [submissionsLoading, setSubmissionsLoading] = React.useState(false);
console.log(lecture)
  const handleToggleVisibility = async (e) => {
    e.stopPropagation();
    setVisibilityLoading(true);
    try {
      const token = localStorage.getItem("token");
      await baseUrl.patch(`/api/course/lecture/${lecture.id}/visibility`, {
        is_visible: !isVisible
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setIsVisible(!isVisible);
    } catch (error) {
      // يمكن إضافة toast هنا إذا رغبت
    } finally {
      setVisibilityLoading(false);
    }
  };

  // دالة جلب امتحان المحاضرة
  const fetchLectureExam = async () => {
    if (!lecture.id) return;
    
    setExamLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await baseUrl.get(`/api/course/lecture/${lecture.id}/exam`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // التعامل مع الشكل الجديد للبيانات
      setLectureExam(response.data.exam || response.data);
    } catch (error) {
      console.log("Error fetching lecture exam:", error);
      setLectureExam(null);
    } finally {
      setExamLoading(false);
    }
  };

  // دالة جلب إحصائيات التعليقات
  const fetchCommentsStats = async () => {
    if (!lecture.id) return;
    
    setCommentsStats(prev => ({ ...prev, loading: true }));
    try {
      const token = localStorage.getItem("token");
      const response = await baseUrl.get(`/api/lecture/${lecture.id}/comments/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCommentsStats({
        total: response.data.total || 0,
        recent: response.data.recent || 0,
        loading: false
      });
    } catch (error) {
      console.log("Error fetching comments stats:", error);
      setCommentsStats(prev => ({ ...prev, loading: false }));
    }
  };

  // جلب امتحان المحاضرة عند فتح المحاضرة
  React.useEffect(() => {
    if (isExpanded && !lectureExam && !examLoading) {
      fetchLectureExam();
    }
  }, [isExpanded, lecture.id]);

  // جلب إحصائيات التعليقات عند تحميل المكون
  React.useEffect(() => {
    fetchCommentsStats();
  }, [lecture.id]);

  // دالة جلب الامتحانات المقالية للمحاضرة
  const fetchEssayExam = async () => {
    if (!lecture.id) return;
    
    setEssayExamLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await baseUrl.get(`/api/essay-exams/lectures/${lecture.id}/exams`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // جلب أول امتحان إذا وجد (يمكن تعديل هذا لاحقاً لدعم عدة امتحانات)
      setEssayExam(response.data.exams && response.data.exams.length > 0 ? response.data.exams[0] : null);
    } catch (error) {
      console.log("Error fetching essay exam:", error);
      setEssayExam(null);
    } finally {
      setEssayExamLoading(false);
    }
  };

  // دالة جلب الطلاب الذين حلوا الامتحان المقالي (للمعلمين)
  const fetchEssayExamSubmissions = async (examId) => {
    setSubmissionsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await baseUrl.get(`/api/essay-exams/exams/${examId}/students`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEssayExamSubmissions(response.data.students || []);
    } catch (error) {
      console.log("Error fetching essay exam submissions:", error);
      setEssayExamSubmissions([]);
    } finally {
      setSubmissionsLoading(false);
    }
  };

  // دالة إنشاء امتحان مقالي
  const createEssayExam = async (examData) => {
    setEssayExamModalLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await baseUrl.post(`/api/essay-exams/lectures/${lecture.id}/exams`, {
        title: examData.title,
        description: examData.description,
        is_visible: examData.is_visible !== undefined ? examData.is_visible : true
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEssayExam(response.data.exam);
      return response.data.exam;
    } catch (error) {
      console.error("Error creating essay exam:", error);
      throw error;
    } finally {
      setEssayExamModalLoading(false);
    }
  };

  // دالة تحديث امتحان مقالي
  const updateEssayExam = async (examId, examData) => {
    setEssayExamModalLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await baseUrl.put(`/api/essay-exams/exams/${examId}`, {
        title: examData.title,
        description: examData.description,
        is_visible: examData.is_visible !== undefined ? examData.is_visible : true
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEssayExam(response.data.exam);
      return response.data.exam;
    } catch (error) {
      console.error("Error updating essay exam:", error);
      throw error;
    } finally {
      setEssayExamModalLoading(false);
    }
  };

  // دالة حذف امتحان مقالي
  const deleteEssayExam = async (examId) => {
    try {
      const token = localStorage.getItem("token");
      await baseUrl.delete(`/api/essay-exams/exams/${examId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEssayExam(null);
    } catch (error) {
      console.error("Error deleting essay exam:", error);
      throw error;
    }
  };

  // جلب الامتحان المقالي عند فتح المحاضرة
  React.useEffect(() => {
    if (isExpanded && !essayExam && !essayExamLoading) {
      fetchEssayExam();
    }
  }, [isExpanded, lecture.id]);

  // دالة تعديل امتحان المحاضرة
  const handleEditLectureExam = async (examData) => {
    if (!lectureExam?.id) return;
    
    try {
      const token = localStorage.getItem("token");
      const response = await baseUrl.put(`/api/course/lecture/exam/${lectureExam.id}`, {
        title: examData.title,
        total_grade: examData.total_grade,
        type: examData.type || 'exam'
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      // تحديث البيانات المحلية
      setLectureExam(response.data.exam || response.data);
      console.log("Exam updated successfully");
      
      // إعادة تحميل الامتحان للتأكد من التحديث
      setTimeout(() => {
        fetchLectureExam();
      }, 500);
    } catch (error) {
      console.error("Error updating exam:", error);
    }
  };

  // دالة حذف امتحان المحاضرة
  const handleDeleteLectureExam = async (examId) => {
    if (!examId) return;
    
    try {
      const token = localStorage.getItem("token");
      await baseUrl.delete(`/api/course/lecture/exam/${examId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      // إزالة الامتحان من البيانات المحلية
      setLectureExam(null);
      console.log("Exam deleted successfully");
      
      // إعادة تحميل الامتحان للتأكد من الحذف
      setTimeout(() => {
        fetchLectureExam();
      }, 500);
    } catch (error) {
      console.error("Error deleting exam:", error);
    }
  };

  // دالة إضافة امتحان جديد للمحاضرة
  const handleAddLectureExam = async (examData) => {
    try {
      const token = localStorage.getItem("token");
      const response = await baseUrl.post(`/api/course/lecture/${lecture.id}/exam`, {
        title: examData.title,
        total_grade: examData.total_grade,
        type: examData.type || 'exam'
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      // تحديث البيانات المحلية
      setLectureExam(response.data.exam || response.data);
      console.log("Exam created successfully");
      
      // إعادة تحميل الامتحان للتأكد من الإضافة
      setTimeout(() => {
        fetchLectureExam();
      }, 500);
    } catch (error) {
      console.error("Error creating exam:", error);
    }
  };
console.log(lecture)
  return (
    <Box
    className="w-[100%] lecture_container"
      bg={lecture.locked && !canExpand ? useColorModeValue('gray.100','gray.800') : useColorModeValue('white', 'gray.800')}
      p={0}
      borderRadius={{ base: 'xl', md: '2xl' }}
      borderWidth="2px"
      borderColor={isExpanded ? 'blue.400' : useColorModeValue('gray.200', 'gray.700')}
      boxShadow={isExpanded ? 'xl' : 'lg'}
      mb={4}
      transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
      _hover={{ 
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)', 
        borderColor: 'blue.400', 
        transform: 'translateY(-4px)' 
      }}
      position="relative"
      _before={{
        content: '""',
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        borderRadius: { base: 'xl', md: '2xl' },
        background: "linear-gradient(135deg, rgba(59, 130, 246, 0.03) 0%, rgba(147, 197, 253, 0.03) 100%)",
        zIndex: -1
      }}
    >
      {/* هيدر المحاضرة */}
      <Flex
        align="center"
        justify="space-between"
        px={{ base: 3, md: 6 }}
        py={{ base: 2, md: 4 }}
        borderBottomWidth={isExpanded ? '1px' : '0'}
        borderColor={dividerColor}
        borderTopRadius="2xl"
        bg={lecture.locked && !canExpand ? useColorModeValue('gray.200','gray.700') : sectionBg}
        style={{ cursor: canExpand ? 'pointer' : 'default' }}
        onClick={e => {
          // لا تفتح إذا كان الضغط على زر أو أيقونة
          if (
            e.target.closest('button') ||
            e.target.closest('svg') ||
            e.target.closest('[role="button"]')
          ) return;
          if (canExpand) setExpandedLecture(isExpanded ? null : lecture.id);
        }}
      >
        <HStack spacing={{ base: 2, md: 4 }} align="center" flexWrap="wrap">
          <Box 
            boxSize={{ base: 10, md: 12 }} 
            bg={lecture.locked ? 'linear-gradient(135deg, #FEE2E2 0%, #FECACA 100%)' : 'linear-gradient(135deg, #DBEAFE 0%, #BFDBFE 100%)'} 
            borderRadius="full" 
            display="flex" 
            alignItems="center" 
            justifyContent="center"
            boxShadow="0 4px 12px rgba(0, 0, 0, 0.1)"
            border="2px solid"
            borderColor={lecture.locked ? 'red.200' : 'blue.200'}
          >
            <Icon 
              as={lecture.locked ? FaLock : FaPlayCircle} 
              color={lecture.locked ? 'red.500' : 'blue.600'} 
              boxSize={{ base: 5, md: 6 }} 
            />
          </Box>
          <VStack align="start" spacing={0} minW={0} flex={1}>
            <HStack spacing={{ base: 1, md: 2 }} flexWrap="wrap" gap={1}>
              <Text fontWeight="bold" fontSize={{ base: 'sm', md: 'lg' }} color={headingColor} noOfLines={2}>{lecture.title}</Text>
              <Badge 
                colorScheme="blue" 
                fontSize={{ base: '0.7em', md: '0.85em' }} 
                borderRadius="full"
                px={2}
                py={1}
                boxShadow="0 2px 4px rgba(59, 130, 246, 0.2)"
              >
                #{lecture.position}
              </Badge>
              {lecture.locked && (
                <Badge 
                  colorScheme="red" 
                  fontSize={{ base: '0.7em', md: '0.85em' }} 
                  borderRadius="full"
                  px={2}
                  py={1}
                  boxShadow="0 2px 4px rgba(239, 68, 68, 0.2)"
                >
                  مقفولة
                </Badge>
              )}
              {lecture.exam && (
                <Badge 
                  colorScheme={lecture.exam.is_visible ? "green" : "yellow"} 
                  fontSize={{ base: '0.7em', md: '0.85em' }} 
                  borderRadius="full"
                  px={2}
                  py={1}
                  boxShadow={lecture.exam.is_visible ? "0 2px 4px rgba(16, 185, 129, 0.2)" : "0 2px 4px rgba(236, 201, 75, 0.2)"}
                >
                  امتحان {lecture.exam.is_visible ? "" : "(مخفي)"}
                </Badge>
              )}
            </HStack>
            <Text color={subTextColor} fontSize={{ base: 'xs', md: 'xs' }}>تاريخ الإضافة: {formatDate(lecture.created_at)}</Text>
          </VStack>
        </HStack>
        <HStack spacing={{ base: 1, md: 2 }} flexWrap="wrap" gap={1}>
          {isTeacher && (
            <>
              <Tooltip label="تعديل المحاضرة">
                <IconButton 
                  size={{ base: 'xs', md: 'sm' }} 
                  icon={<Icon as={FaEdit} />} 
                  colorScheme="blue" 
                  variant="ghost" 
                  onClick={() => handleEditLecture(lecture)} 
                />
              </Tooltip>
              <Tooltip label="حذف المحاضرة">
                <IconButton 
                  size={{ base: 'xs', md: 'sm' }} 
                  icon={<Icon as={FaTrash} />} 
                  colorScheme="red" 
                  variant="ghost" 
                  onClick={() => handleDeleteLecture(lecture.id, lecture.title)} 
                />
              </Tooltip>
              {isTeacher && (
                <Tooltip label={isVisible ? "إخفاء المحاضرة" : "عرض المحاضرة"} hasArrow>
                  <IconButton
                    size={{ base: 'xs', md: 'sm' }}
                    colorScheme={isVisible ? "green" : "yellow"}
                    variant="solid"
                    icon={<Icon as={isVisible ? FaEye : FaEyeSlash} />}
                    onClick={handleToggleVisibility}
                    isLoading={visibilityLoading}
                    borderRadius="full"
                    transition="all 0.2s"
                    _hover={{ transform: 'scale(1.15)' }}
                    aria-label={isVisible ? "إخفاء المحاضرة" : "عرض المحاضرة"}
                  />
                </Tooltip>
              )}
            </>
          )}
          {/* قسم التعليقات المحسن */}
          {canExpand && (
            <IconButton
              size={{ base: 'sm', md: 'md' }}
              icon={<Icon as={isExpanded ? FaAngleUp : FaAngleDown} />}
              variant="ghost"
              colorScheme="blue"
              aria-label="تفاصيل المحاضرة"
              onClick={() => setExpandedLecture(isExpanded ? null : lecture.id)}
              borderRadius="full"
            />
          )}
       
        </HStack>
      </Flex>
      {/* تفاصيل المحاضرة */}
      <Collapse in={isExpanded} animateOpacity>
        <Box px={6} py={4} bg={itemBg} borderBottomRadius="2xl">
          <VStack align="start" spacing={6} divider={<Divider borderColor={dividerColor} />}> 
            {/* وصف المحاضرة */}
          
            {/* الامتحانات المقالية */}
            <Box w="full">
              <HStack spacing={2} mb={3} display={{ base: 'none', md: 'flex' }}>
                <Icon as={FaRegPaperPlane} color="purple.400" boxSize={5} />
                <Text fontWeight="bold" color={headingColor}>الامتحانات المقالية</Text>
              </HStack>
              <Stack direction={{ base: 'column', md: 'row' }} spacing={2} mb={3} display={{ base: 'flex', md: 'none' }}>
                <Icon as={FaRegPaperPlane} color="purple.400" boxSize={5} />
                <Text fontWeight="bold" color={headingColor}>الامتحانات المقالية</Text>
              </Stack>
              
              {essayExamLoading ? (
                <Text color={subTextColor} fontSize="sm">جاري تحميل الامتحان...</Text>
              ) : essayExam ? (
                <VStack align="start" spacing={2} w="full">
                  <Flex align="center" p={3} bg={useColorModeValue('purple.50','purple.600')} borderRadius="md" w="full" _hover={{ bg: useColorModeValue('purple.100','purple.500'), boxShadow: 'sm' }}>
                    <Icon as={FaRegPaperPlane} color="purple.400" boxSize={4} mr={3} />
                    <VStack align="start" spacing={1} flex={1}>
                      <Text fontSize="sm" fontWeight="medium">{essayExam.title}</Text>
                      {essayExam.description && (
                        <Text fontSize="xs" color={subTextColor}>{essayExam.description}</Text>
                      )}
                      <Text fontSize="xs" color="purple.600">
                        {essayExam.questions_count || 0} سؤال
                      </Text>
                    </VStack>
                    <HStack spacing={1}>
                      {isTeacher ? (
                        <>
                          <Tooltip label="عرض التسليمات">
                            <IconButton 
                              size="xs" 
                              icon={<Icon as={FaUsers} />} 
                              colorScheme="blue" 
                              variant="ghost" 
                              onClick={() => fetchEssayExamSubmissions(essayExam.id)}
                            />
                          </Tooltip>
                          <Tooltip label="تعديل الامتحان">
                            <IconButton 
                              size="xs" 
                              icon={<Icon as={FaEdit} />} 
                              colorScheme="green" 
                              variant="ghost" 
                              onClick={() => setEssayExamModal({ isOpen: true, type: 'edit', data: essayExam })}
                            />
                          </Tooltip>
                          <Tooltip label="حذف الامتحان">
                            <IconButton 
                              size="xs" 
                              icon={<Icon as={FaTrash} />} 
                              colorScheme="red" 
                              variant="ghost" 
                              onClick={() => deleteEssayExam(essayExam.id)}
                            />
                          </Tooltip>
                        </>
                      ) : (
                        <Link to={`/essay-exam/${essayExam.id}`}>
                          <Button 
                            size="xs" 
                            variant="ghost" 
                            colorScheme="purple" 
                            _hover={{ bg: 'purple.50' }}
                          >
                            ابدأ الامتحان
                          </Button>
                        </Link>
                      )}
                    </HStack>
                  </Flex>
                  
                  {/* عرض التسليمات للمعلمين */}
                  {isTeacher && essayExamSubmissions.length > 0 && (
                    <Box w="full" mt={2}>
                      <Text fontSize="sm" fontWeight="bold" color={headingColor} mb={2}>
                        التسليمات ({essayExamSubmissions.length})
                      </Text>
                      <VStack spacing={2} align="start" w="full">
                        {essayExamSubmissions.map((student) => (
                          <Flex key={student.student_id} align="center" p={2} bg={useColorModeValue('gray.50','gray.600')} borderRadius="md" w="full">
                            <VStack align="start" spacing={0} flex={1}>
                              <Text fontSize="sm" fontWeight="medium">{student.student_name}</Text>
                              <Text fontSize="xs" color={subTextColor}>
                                {student.student_email}
                              </Text>
                              <Text fontSize="xs" color={subTextColor}>
                                {student.answered_questions}/{student.total_questions} أسئلة
                              </Text>
                            </VStack>
                            <HStack spacing={1}>
                              <Badge colorScheme={student.graded_at ? "green" : "yellow"}>
                                {student.graded_at ? "مقيم" : "في الانتظار"}
                              </Badge>
                              {student.graded_at && (
                                <Text fontSize="xs" color={subTextColor}>
                                  {student.total_grade}/{student.max_grade}
                                </Text>
                              )}
                            </HStack>
                          </Flex>
                        ))}
                      </VStack>
              </Box>
                  )}
                </VStack>
              ) : (
                <Text color={subTextColor} fontSize="sm">لا يوجد امتحان مقالي بعد.</Text>
              )}
              
              {isTeacher && !essayExam && (
                <Button 
                  size="sm" 
                  colorScheme="purple" 
                  variant="outline" 
                  leftIcon={<Icon as={FaPlus} />} 
                  mt={2} 
                  onClick={() => setEssayExamModal({ isOpen: true, type: 'add', data: null })}
                >
                  إضافة امتحان مقالي
                </Button>
              )}
            </Box>

            {/* قسم الامتحانات */}
            <Box w="full">
              <HStack spacing={2} mb={2} display={{ base: 'none', md: 'flex' }}>
                <Icon as={FaGraduationCap} color="green.500" boxSize={5} />
                <Text fontWeight="bold" color={headingColor}>امتحان المحاضرة</Text>
            </HStack>
              <Stack direction={{ base: 'column', md: 'row' }} spacing={2} mb={2} display={{ base: 'flex', md: 'none' }}>
                <Icon as={FaGraduationCap} color="green.500" boxSize={5} />
                <Text fontWeight="bold" color={headingColor}>امتحان المحاضرة</Text>
              </Stack>
              
            {/* عرض الامتحان إذا وجد */}
            {lecture.exam && (
                <HStack spacing={3} align="center" w="full" mb={2}>
                <Box flex={1}>
                  <Text fontWeight="medium">{lecture.exam.title}</Text>
                  <VStack spacing={2} mt={2} fontSize="sm" color={subTextColor} align="start">
                 
                   
                  
                   
                  </VStack>
                </Box>
                <HStack spacing={{ base: 1, sm: 2 }} flexWrap="wrap">
                  <Link to={`/ComprehensiveExam/${lecture.exam.id}`} style={{ textDecoration: 'none', width: '100%', minWidth: { base: '120px', sm: '140px' } }}>
                    <Button
                      size={{ base: 'xs', sm: 'sm', md: 'md' }}
                        colorScheme="blue"
                      variant="solid"
                        borderRadius="full"
                      leftIcon={<Icon as={FaEye} boxSize={{ base: 3, sm: 4, md: 4 }} />}
                      _hover={{
                        transform: 'translateY(-2px)',
                        boxShadow: 'lg',
                        bg: 'blue.600'
                      }}
                      transition="all 0.2s"
                      fontWeight="bold"
                      fontSize={{ base: 'xs', sm: 'sm', md: 'sm' }}
                      px={{ base: 2, sm: 3, md: 4 }}
                      py={{ base: 1, sm: 2, md: 2 }}
                      w="full"
                      h={{ base: '32px', sm: '36px', md: '40px' }}
                      minW={{ base: '120px', sm: '140px', md: '160px' }}
                    >
                      {isTeacher || isAdmin ? "عرض الامتحان" : "ابدأ الامتحان"}
                    </Button>
                    </Link>
                  {isTeacher && (
                    <>
                      <Tooltip label={lecture.exam.is_visible ? "إخفاء الامتحان" : "إظهار الامتحان"} hasArrow>
                        <IconButton
                          size={{ base: 'xs', sm: 'sm' }}
                          icon={<Icon as={lecture.exam.is_visible ? FaEye : FaEyeSlash} boxSize={{ base: 3, sm: 4 }} />}
                          colorScheme={lecture.exam.is_visible ? "green" : "yellow"}
                          variant="ghost"
                          onClick={async (e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            try {
                              const token = localStorage.getItem("token");
                              await baseUrl.patch(`/api/course/lecture/exam/${lecture.exam.id}/visibility`, {
                                is_visible: !lecture.exam.is_visible
                              }, {
                                headers: { Authorization: `Bearer ${token}` },
                              });
                              // تحديث البيانات المحلية
                              lecture.exam.is_visible = !lecture.exam.is_visible;
                              // إعادة تحميل الصفحة لتحديث البيانات
                              window.location.reload();
                            } catch (error) {
                              console.error("Error toggling exam visibility:", error);
                            }
                          }}
                          borderRadius="full"
                          minW={{ base: '32px', sm: '36px' }}
                          h={{ base: '32px', sm: '36px' }}
                        />
                      </Tooltip>
                      <Tooltip label="إضافة أسئلة للامتحان" hasArrow>
                        <IconButton
                          size={{ base: 'xs', sm: 'sm' }}
                          icon={<Icon as={FaPlus} boxSize={{ base: 3, sm: 4 }} />}
                          colorScheme="green"
                          variant="ghost"
                          onClick={() => onAddBulkQuestions && onAddBulkQuestions(lecture.exam.id, lecture.exam.title, 'lecture')}
                          borderRadius="full"
                          minW={{ base: '32px', sm: '36px' }}
                          h={{ base: '32px', sm: '36px' }}
                        />
                      </Tooltip>
                      <Tooltip label="تعديل الامتحان" hasArrow>
                        <IconButton
                          size={{ base: 'xs', sm: 'sm' }}
                          icon={<Icon as={FaEdit} boxSize={{ base: 3, sm: 4 }} />}
                          colorScheme="blue"
                          variant="ghost"
                          onClick={() => setExamModal && setExamModal({ isOpen: true, type: 'edit', lectureId: lecture.id, data: lecture.exam })}
                          borderRadius="full"
                          minW={{ base: '32px', sm: '36px' }}
                          h={{ base: '32px', sm: '36px' }}
                        />
                      </Tooltip>
                      <Tooltip label="حذف الامتحان" hasArrow>
                        <IconButton
                          size={{ base: 'xs', sm: 'sm' }}
                          icon={<Icon as={FaTrash} boxSize={{ base: 3, sm: 4 }} />}
                          colorScheme="red"
                          variant="ghost"
                          onClick={() => setDeleteExamDialog && setDeleteExamDialog({ isOpen: true, examId: lecture.exam.id, title: lecture.exam.title })}
                          borderRadius="full"
                          minW={{ base: '32px', sm: '36px' }}
                          h={{ base: '32px', sm: '36px' }}
                        />
                      </Tooltip>
                    </>
                  )}
                </HStack>
              </HStack>
            )}
              
              {/* زر إضافة امتحان إذا لم يوجد امتحان */}
              {!lecture.exam && !lectureExam && isTeacher && (
                <Button 
                  size="sm" 
                  colorScheme="green" 
                  variant="outline" 
                  leftIcon={<Icon as={FaPlus} />} 
                  onClick={() => setExamModal({ 
                    isOpen: true, 
                    type: 'add', 
                    lectureId: lecture.id, 
                    data: null,
                    onSave: handleAddLectureExam
                  })} 
                  isLoading={examActionLoading}
                  mt={2}
                >
                  إضافة امتحان
                </Button>
              )}
              
              {/* رسالة عدم وجود امتحان للطلاب */}
              {!lecture.exam && !lectureExam && !isTeacher && (
                <Text color={subTextColor} fontSize="sm">لا يوجد امتحان لهذه المحاضرة بعد.</Text>
              )}
            </Box>
            
            {/* قسم التعليقات التفصيلي */}
           

            {/* الفيديوهات */}
            <Box w="full">
              <HStack spacing={2} mb={2} display={{ base: 'none', md: 'flex' }}>
                <Icon as={FaVideo} color="red.400" boxSize={5} />
                <Text fontWeight="bold" color={headingColor}>الفيديوهات</Text>
              </HStack>
              <Stack direction={{ base: 'column', md: 'row' }} spacing={2} mb={2} display={{ base: 'flex', md: 'none' }}>
                <Icon as={FaVideo} color="red.400" boxSize={5} />
                <Text fontWeight="bold" color={headingColor}>الفيديوهات</Text>
              </Stack>
              {lecture.videos && lecture.videos.length > 0 ? (
                <VStack align="start" spacing={2} w="full">
                  {lecture.videos.map((video, idx) => (
                    <Flex key={video.id} align="center" p={2} bg={useColorModeValue('gray.50','gray.600')} borderRadius="md" w="full" _hover={{ bg: useColorModeValue('gray.100','gray.500'), boxShadow: 'sm' }}>
                      <Icon as={FaPlayCircle} color="red.400" boxSize={4} mr={2} />
                      <Text fontSize="sm" flex={1} fontWeight="medium">{video.title}</Text>
                      <Link to={`/video/${video.id}`}>
                      <Button 
                        size="xs" 
                        variant="ghost" 
                        colorScheme="red" 
                        
                        _hover={{ bg: 'red.50' }}
                        >
                        شاهد
                      </Button>
                        </Link>
                      {isTeacher && (
                        <>
                          <Tooltip label="تعديل الفيديو"><IconButton size="xs" icon={<Icon as={FaEdit} />} colorScheme="blue" variant="ghost" onClick={() => handleEditVideo(video, lecture.id)} /></Tooltip>
                          <Tooltip label="حذف الفيديو"><IconButton size="xs" icon={<Icon as={FaTrash} />} colorScheme="red" variant="ghost" onClick={() => handleDeleteVideo(video.id, video.title)} /></Tooltip>
                        </>
                      )}
                    </Flex>
                  ))}
                </VStack>
              ) : (
                <Text color={subTextColor} fontSize="sm">لا يوجد فيديوهات بعد.</Text>
              )}
              {isTeacher && (
                <Button size="sm" colorScheme="green" variant="outline" leftIcon={<Icon as={FaPlus} />} mt={2} onClick={() => handleAddVideo(lecture.id)}>إضافة فيديو</Button>
              )}
            </Box>
            {/* الملفات */}
            <Box w="full">
              <HStack spacing={2} mb={2} display={{ base: 'none', md: 'flex' }}>
                <Icon as={FaFilePdf} color="blue.400" boxSize={5} />
                <Text fontWeight="bold" color={headingColor}>الملفات المرفقة</Text>
              </HStack>
              <Stack direction={{ base: 'column', md: 'row' }} spacing={2} mb={2} display={{ base: 'flex', md: 'none' }}>
                <Icon as={FaFilePdf} color="blue.400" boxSize={5} />
                <Text fontWeight="bold" color={headingColor}>الملفات المرفقة</Text>
              </Stack>
              {lecture.files && lecture.files.length > 0 ? (
                <VStack align="start" spacing={2} w="full">
                  {lecture.files.map((file, idx) => (
                    <Flex key={file.id} align="center" p={2} bg={useColorModeValue('gray.50','gray.600')} borderRadius="md" w="full" _hover={{ bg: useColorModeValue('gray.100','gray.500'), boxShadow: 'sm' }}>
                      <Icon as={resourceIconMap[file.type] || resourceIconMap.default} color="blue.400" boxSize={4} mr={2} />
                      <Text fontSize="sm" flex={1} fontWeight="medium">{file.filename}</Text>
                      <Button size="xs" variant="ghost" colorScheme="blue" onClick={() => window.open(file.url, '_blank')} _hover={{ bg: 'blue.50' }}>تحميل</Button>
                      {isTeacher && (
                        <>
                          <Tooltip label="تعديل الملف"><IconButton size="xs" icon={<Icon as={FaEdit} />} colorScheme="blue" variant="ghost" onClick={() => handleEditFile(file, lecture.id)} /></Tooltip>
                          <Tooltip label="حذف الملف"><IconButton size="xs" icon={<Icon as={FaTrash} />} colorScheme="red" variant="ghost" onClick={() => handleDeleteFile(file.id, file.name)} /></Tooltip>
                        </>
                      )}
                    </Flex>
                  ))}
                </VStack>
              ) : (
                <Text color={subTextColor} fontSize="sm">لا يوجد ملفات مرفقة بعد.</Text>
              )}
              {isTeacher && (
                <Button size="sm" colorScheme="green" variant="outline" leftIcon={<Icon as={FaPlus} />} mt={2} onClick={() => handleAddFile(lecture.id)}>إضافة ملف</Button>
              )}
            </Box>
             <Box w="full">
              <HStack spacing={3} align="center" w="full" mb={3}>
                <Icon as={FaComments} color="orange.500" boxSize={5} />
                <Box flex={1}>
                  <Text fontWeight="bold" color={headingColor} mb={1}>مناقشة المحاضرة</Text>
                  <Text fontSize="sm" color={subTextColor}>
                    شارك في النقاش مع زملائك حول هذه المحاضرة
                  </Text>
                </Box>
                <VStack spacing={1} align="center">
                  <HStack spacing={4}>
                   
                    {commentsStats.recent > 0 && (
                      <VStack spacing={0} align="center">
                        <Text fontSize="lg" fontWeight="bold" color="green.600">
                          {commentsStats.recent}
                        </Text>
                        <Text fontSize="xs" color={subTextColor}>جديدة</Text>
                      </VStack>
                    )}
                  </HStack>
                </VStack>
              </HStack>
              
              <HStack spacing={2} flexWrap="wrap">
                <Link to={`/lectur_commints/${lecture.id}`} style={{ textDecoration: 'none', flex: 1 }}>
                  <Button
                    size="md"
                    colorScheme="orange"
                    variant="solid"
                    leftIcon={<Icon as={FaRegComment} />}
                    borderRadius="full"
                    w="full"
                    _hover={{
                      transform: 'translateY(-2px)',
                      boxShadow: 'lg',
                      bg: 'orange.600'
                    }}
                    transition="all 0.2s"
                    fontWeight="bold"
                  >
                    {commentsStats.total > 0 ? "عرض التعليقات" : "ابدأ النقاش"}
                  </Button>
                </Link>
                
                {commentsStats.total > 0 && (
                  <Link to={`/lectur_commints/${lecture.id}`} style={{ textDecoration: 'none' }}>
                    <Button
                      size="md"
                      colorScheme="orange"
                      variant="outline"
                      leftIcon={<Icon as={FaUsers} />}
                      borderRadius="full"
                      _hover={{
                        transform: 'translateY(-2px)',
                        boxShadow: 'md',
                        bg: 'orange.50'
                      }}
                      transition="all 0.2s"
                    >
                      المشاركون
                    </Button>
                  </Link>
                )}
              </HStack>
              
              {commentsStats.total === 0 && (
                <Box
                  mt={3}
                  p={4}
                  bg={useColorModeValue('orange.50', 'orange.900')}
                  borderRadius="lg"
                  border="1px solid"
                  borderColor="orange.200"
                >
                  <HStack spacing={3}>
                    <Icon as={FaLightbulb} color="orange.500" boxSize={5} />
                    <VStack align="start" spacing={1}>
                      <Text fontSize="sm" fontWeight="medium" color="orange.700">
                       اسال سؤالك عن المحاضرة
                      </Text>
                      <Text fontSize="xs" color="orange.600">
                        شارك استفساراتك أو ملاحظاتك مع زملائك
                      </Text>
                    </VStack>
                  </HStack>
                </Box>
              )}
            </Box>
            {/* إذا لا يوجد محتوى */}
            {(!lecture.videos || lecture.videos.length === 0) && (!lecture.files || lecture.files.length === 0) && !lecture.exam && (
              <HStack spacing={2}>
                <Icon as={FaLightbulb} color="gray.400" boxSize={5} />
                <Text color={subTextColor} fontSize="sm">لا يوجد محتوى بعد لهذه المحاضرة.</Text>
              </HStack>
            )}
          </VStack>
        </Box>
      </Collapse>
      {/* إذا المحاضرة مقفولة للطالب */}
      {!canExpand && (
        <Box px={6} py={4} bg={useColorModeValue('red.50','red.900')} borderBottomRadius="2xl">
          <Text color="red.500" fontWeight="bold" fontSize="md">يجب حل امتحانات المحاضرات السابقة لفتح هذه المحاضرة</Text>
        </Box>
      )}

      {/* مودال إنشاء/تعديل الامتحان المقالي */}
      <EssayExamModal
        isOpen={essayExamModal.isOpen}
        onClose={() => setEssayExamModal({ isOpen: false, type: 'add', data: null })}
        type={essayExamModal.type}
        data={essayExamModal.data}
        onSubmit={essayExamModal.type === 'add' ? createEssayExam : updateEssayExam}
        loading={essayExamModalLoading}
      />
    </Box>
  );
};

// مكون مودال الامتحان المقالي
const EssayExamModal = ({ isOpen, onClose, type, data, onSubmit, loading }) => {
  const [formData, setFormData] = React.useState({
    title: data?.title || '',
    description: data?.description || '',
    is_visible: data?.is_visible !== undefined ? data.is_visible : true
  });

  React.useEffect(() => {
    if (data) {
      setFormData({
        title: data.title || '',
        description: data.description || '',
        is_visible: data.is_visible !== undefined ? data.is_visible : true
      });
    } else {
      setFormData({
        title: '',
        description: '',
        is_visible: true
      });
    }
  }, [data, isOpen]);


  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (type === 'edit' && data?.id) {
        await onSubmit(data.id, formData);
      } else {
        await onSubmit(formData);
      }
      onClose();
    } catch (error) {
      console.error('Error submitting essay exam:', error);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={loading ? undefined : onClose} size="2xl" closeOnOverlayClick={!loading}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          {type === 'add' ? 'إنشاء امتحان مقالي' : 'تعديل الامتحان المقالي'}
        </ModalHeader>
        <ModalCloseButton isDisabled={loading} />
        <form onSubmit={handleSubmit}>
          <ModalBody>
            <VStack spacing={6} align="stretch">
              {/* عنوان الامتحان */}
              <FormControl isRequired>
                <FormLabel>عنوان الامتحان</FormLabel>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="أدخل عنوان الامتحان"
                  isDisabled={loading}
                />
              </FormControl>

              {/* وصف الامتحان */}
              <FormControl>
                <FormLabel>وصف الامتحان (اختياري)</FormLabel>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="أدخل وصف الامتحان"
                  rows={3}
                  isDisabled={loading}
                />
              </FormControl>

              {/* إظهار/إخفاء الامتحان */}
              <FormControl>
                <HStack spacing={4}>
                  <FormLabel mb={0}>إظهار الامتحان للطلاب</FormLabel>
                  <Button
                    size="sm"
                    colorScheme={formData.is_visible ? "green" : "gray"}
                    variant={formData.is_visible ? "solid" : "outline"}
                    onClick={() => setFormData({ ...formData, is_visible: !formData.is_visible })}
                    isDisabled={loading}
                  >
                    {formData.is_visible ? "ظاهر" : "مخفي"}
                  </Button>
                </HStack>
              </FormControl>

              {/* ملاحظة حول الأسئلة */}
              <Box p={4} bg={useColorModeValue('blue.50', 'blue.900')} borderRadius="md" border="1px solid" borderColor="blue.200">
                <HStack spacing={3}>
                  <Icon as={FaLightbulb} color="blue.500" boxSize={5} />
                  <VStack align="start" spacing={1}>
                    <Text fontSize="sm" fontWeight="medium" color="blue.700">
                      إدارة الأسئلة
                    </Text>
                    <Text fontSize="xs" color="blue.600">
                      يمكنك إضافة وإدارة أسئلة الامتحان بعد إنشاء الامتحان من خلال صفحة إدارة الامتحان
                    </Text>
                  </VStack>
                </HStack>
              </Box>
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose} isDisabled={loading}>
              إلغاء
            </Button>
            <Button
              colorScheme="purple"
              type="submit"
              isLoading={loading}
              loadingText={type === 'add' ? 'جاري الإنشاء...' : 'جاري التحديث...'}
              isDisabled={loading}
            >
              {type === 'add' ? 'إنشاء الامتحان' : 'تحديث الامتحان'}
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
};

export default LectureCard; 