import React from "react";
import {
  Box, Flex, HStack, VStack, Text, Badge, Icon, IconButton, Button, Collapse, Divider, Tooltip, useColorModeValue,
  Stack, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter, ModalCloseButton,
  FormControl, FormLabel, Input, Textarea, Tabs, TabList, TabPanels, Tab, TabPanel
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
  const [activeTab, setActiveTab] = React.useState(0); // 0 = فيديوهات (افتراضي)
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
          <Tabs index={activeTab} onChange={setActiveTab} variant="enclosed" colorScheme="gray" size="lg">
            <TabList mb={8} flexWrap="wrap" bg={useColorModeValue('white', 'gray.800')} borderRadius="2xl" p={2} boxShadow="lg" border="1px solid" borderColor={useColorModeValue('gray.200', 'gray.600')}>
              <Tab 
                fontSize={{ base: 'sm', md: 'md' }} 
                fontWeight="bold"
                borderRadius="xl"
                _selected={{ 
                  bg: 'red.500', 
                  color: 'white',
                  boxShadow: 'xl',
                  transform: 'translateY(-2px)',
                  border: '2px solid',
                  borderColor: 'red.300'
                }}
                _hover={{ 
                  bg: 'red.50', 
                  color: 'red.600',
                  transform: 'translateY(-1px)',
                  boxShadow: 'md'
                }}
                transition="all 0.3s ease"
                px={6}
                py={4}
                mx={1}
                border="1px solid"
                borderColor="transparent"
              >
                <Icon as={FaVideo} mr={3} boxSize={5} />
                الفيديوهات
              </Tab>
              <Tab 
                fontSize={{ base: 'sm', md: 'md' }} 
                fontWeight="bold"
                borderRadius="xl"
                _selected={{ 
                  bg: 'blue.500', 
                  color: 'white',
                  boxShadow: 'xl',
                  transform: 'translateY(-2px)',
                  border: '2px solid',
                  borderColor: 'blue.300'
                }}
                _hover={{ 
                  bg: 'blue.50', 
                  color: 'blue.600',
                  transform: 'translateY(-1px)',
                  boxShadow: 'md'
                }}
                transition="all 0.3s ease"
                px={6}
                py={4}
                mx={1}
                border="1px solid"
                borderColor="transparent"
              >
                <Icon as={FaFilePdf} mr={3} boxSize={5} />
                الملفات
              </Tab>
              <Tab 
                fontSize={{ base: 'sm', md: 'md' }} 
                fontWeight="bold"
                borderRadius="xl"
                _selected={{ 
                  bg: 'green.500', 
                  color: 'white',
                  boxShadow: 'xl',
                  transform: 'translateY(-2px)',
                  border: '2px solid',
                  borderColor: 'green.300'
                }}
                _hover={{ 
                  bg: 'green.50', 
                  color: 'green.600',
                  transform: 'translateY(-1px)',
                  boxShadow: 'md'
                }}
                transition="all 0.3s ease"
                px={6}
                py={4}
                mx={1}
                border="1px solid"
                borderColor="transparent"
              >
                <Icon as={FaGraduationCap} mr={3} boxSize={5} />
                امتحان المحاضرة
              </Tab>
              <Tab 
                fontSize={{ base: 'sm', md: 'md' }} 
                fontWeight="bold"
                borderRadius="xl"
                _selected={{ 
                  bg: 'purple.500', 
                  color: 'white',
                  boxShadow: 'xl',
                  transform: 'translateY(-2px)',
                  border: '2px solid',
                  borderColor: 'purple.300'
                }}
                _hover={{ 
                  bg: 'purple.50', 
                  color: 'purple.600',
                  transform: 'translateY(-1px)',
                  boxShadow: 'md'
                }}
                transition="all 0.3s ease"
                px={6}
                py={4}
                mx={1}
                border="1px solid"
                borderColor="transparent"
              >
                <Icon as={FaRegPaperPlane} mr={3} boxSize={5} />
                الامتحانات المقالية
              </Tab>
              <Tab 
                fontSize={{ base: 'sm', md: 'md' }} 
                fontWeight="bold"
                borderRadius="xl"
                _selected={{ 
                  bg: 'orange.500', 
                  color: 'white',
                  boxShadow: 'xl',
                  transform: 'translateY(-2px)',
                  border: '2px solid',
                  borderColor: 'orange.300'
                }}
                _hover={{ 
                  bg: 'orange.50', 
                  color: 'orange.600',
                  transform: 'translateY(-1px)',
                  boxShadow: 'md'
                }}
                transition="all 0.3s ease"
                px={6}
                py={4}
                mx={1}
                border="1px solid"
                borderColor="transparent"
              >
                <Icon as={FaComments} mr={3} boxSize={5} />
                المناقشة
              </Tab>
            </TabList>

            <TabPanels>
              {/* تاب الفيديوهات */}
              <TabPanel px={0}>
                <VStack align="start" spacing={3} w="full">
                  {lecture.videos && lecture.videos.length > 0 ? (
                    lecture.videos.map((video, idx) => (
                      <Flex key={video.id} align="center" p={3} bg={useColorModeValue('gray.50','gray.600')} borderRadius="md" w="full" _hover={{ bg: useColorModeValue('gray.100','gray.500'), boxShadow: 'sm' }}>
                        <Icon as={FaPlayCircle} color="red.400" boxSize={5} mr={3} />
                        <VStack align="start" spacing={1} flex={1}>
                          <Text fontSize="md" fontWeight="medium">{video.title}</Text>
                          <Text fontSize="sm" color={subTextColor}>فيديو تعليمي</Text>
                        </VStack>
                        <HStack spacing={2}>
                          <Link to={`/video/${video.id}`}>
                            <Button 
                              size="sm" 
                              colorScheme="red" 
                              variant="solid"
                              _hover={{ bg: 'red.600' }}
                            >
                              شاهد
                            </Button>
                          </Link>
                          {isTeacher && (
                            <>
                              <Tooltip label="تعديل الفيديو">
                                <IconButton 
                                  size="sm" 
                                  icon={<Icon as={FaEdit} />} 
                                  colorScheme="blue" 
                                  variant="ghost" 
                                  onClick={() => handleEditVideo(video, lecture.id)} 
                                />
                              </Tooltip>
                              <Tooltip label="حذف الفيديو">
                                <IconButton 
                                  size="sm" 
                                  icon={<Icon as={FaTrash} />} 
                                  colorScheme="red" 
                                  variant="ghost" 
                                  onClick={() => handleDeleteVideo(video.id, video.title)} 
                                />
                              </Tooltip>
                            </>
                          )}
                        </HStack>
                      </Flex>
                    ))
                  ) : (
                    <Box textAlign="center" w="full" py={8}>
                      <Icon as={FaVideo} color="gray.400" boxSize={12} mb={3} />
                      <Text color={subTextColor} fontSize="md">لا يوجد فيديوهات بعد</Text>
                      {isTeacher && (
                        <Button 
                          size="md" 
                          colorScheme="green" 
                          variant="outline" 
                          leftIcon={<Icon as={FaPlus} />} 
                          mt={4} 
                          onClick={() => handleAddVideo(lecture.id)}
                        >
                          إضافة فيديو
                        </Button>
                      )}
                    </Box>
                  )}
                  
                  {isTeacher && lecture.videos && lecture.videos.length > 0 && (
                    <Button 
                      size="md" 
                      colorScheme="green" 
                      variant="outline" 
                      leftIcon={<Icon as={FaPlus} />} 
                      mt={2} 
                      onClick={() => handleAddVideo(lecture.id)}
                    >
                      إضافة فيديو جديد
                    </Button>
                  )}
                </VStack>
              </TabPanel>

              {/* تاب الملفات */}
              <TabPanel px={0}>
                <VStack align="start" spacing={4} w="full">
                  {lecture.files && lecture.files.length > 0 ? (
                    lecture.files.map((file, idx) => (
                      <Flex key={file.id} align="center" p={6} bg={useColorModeValue('white','gray.800')} borderRadius="2xl" w="full" border="2px solid" borderColor={useColorModeValue('blue.100','blue.800')} _hover={{ bg: useColorModeValue('blue.50','blue.900'), boxShadow: '2xl', transform: 'translateY(-3px)', borderColor: 'blue.300' }} transition="all 0.4s ease" boxShadow="lg">
                        <Box p={4} bg="blue.100" borderRadius="2xl" mr={6} boxShadow="md">
                          <Icon as={resourceIconMap[file.type] || resourceIconMap.default} color="blue.600" boxSize={8} />
                        </Box>
                        <VStack align="start" spacing={3} flex={1}>
                          <Text fontSize="xl" fontWeight="bold" color={headingColor}>{file.filename}</Text>
                          <Text fontSize="md" color={subTextColor} fontWeight="medium">ملف مرفق</Text>
                        </VStack>
                        <HStack spacing={4}>
                          <Button 
                            size="lg" 
                            colorScheme="blue" 
                            variant="solid"
                            borderRadius="2xl"
                            leftIcon={<Icon as={FaFilePdf} />}
                            onClick={() => window.open(file.url, '_blank')} 
                            _hover={{ bg: 'blue.600', transform: 'scale(1.1)', boxShadow: 'xl' }}
                            transition="all 0.3s ease"
                            fontWeight="bold"
                            px={8}
                            py={6}
                            boxShadow="lg"
                          >
                            تحميل
                          </Button>
                          {isTeacher && (
                            <>
                              <Tooltip label="تعديل الملف">
                                <IconButton 
                                  size="lg" 
                                  icon={<Icon as={FaEdit} />} 
                                  colorScheme="blue" 
                                  variant="solid" 
                                  borderRadius="2xl"
                                  onClick={() => handleEditFile(file, lecture.id)}
                                  _hover={{ transform: 'scale(1.1)', boxShadow: 'xl' }}
                                  transition="all 0.3s ease"
                                  boxShadow="md"
                                />
                              </Tooltip>
                              <Tooltip label="حذف الملف">
                                <IconButton 
                                  size="lg" 
                                  icon={<Icon as={FaTrash} />} 
                                  colorScheme="red" 
                                  variant="solid" 
                                  borderRadius="2xl"
                                  onClick={() => handleDeleteFile(file.id, file.name)}
                                  _hover={{ transform: 'scale(1.1)', boxShadow: 'xl' }}
                                  transition="all 0.3s ease"
                                  boxShadow="md"
                                />
                              </Tooltip>
                            </>
                          )}
                        </HStack>
                      </Flex>
                    ))
                  ) : (
                    <Box textAlign="center" w="full" py={16} bg={useColorModeValue('blue.50','blue.900')} borderRadius="2xl" border="3px dashed" borderColor={useColorModeValue('blue.200','blue.700')} boxShadow="lg">
                      <Box p={6} bg="blue.100" borderRadius="3xl" w="fit-content" mx="auto" mb={6} boxShadow="xl">
                        <Icon as={FaFilePdf} color="blue.500" boxSize={20} />
                      </Box>
                      <Text color={headingColor} fontSize="2xl" fontWeight="bold" mb={3}>لا يوجد ملفات مرفقة بعد</Text>
                      <Text color={subTextColor} fontSize="lg" mb={8} fontWeight="medium">أضف ملفات تعليمية للمحاضرة</Text>
                      {isTeacher && (
                        <Button 
                          size="xl" 
                          colorScheme="blue" 
                          variant="solid" 
                          leftIcon={<Icon as={FaPlus} />} 
                          borderRadius="2xl"
                          px={12}
                          py={8}
                          _hover={{ transform: 'translateY(-3px)', boxShadow: '2xl', bg: 'blue.600' }}
                          transition="all 0.3s ease"
                          fontWeight="bold"
                          boxShadow="xl"
                          onClick={() => handleAddFile(lecture.id)}
                        >
                          إضافة ملف
                        </Button>
                      )}
                    </Box>
                  )}
                  
                  {isTeacher && lecture.files && lecture.files.length > 0 && (
                    <Button 
                      size="lg" 
                      colorScheme="blue" 
                      variant="outline" 
                      leftIcon={<Icon as={FaPlus} />} 
                      mt={4} 
                      borderRadius="full"
                      px={8}
                      _hover={{ bg: 'blue.50', transform: 'translateY(-2px)' }}
                      transition="all 0.2s"
                      onClick={() => handleAddFile(lecture.id)}
                    >
                      إضافة ملف جديد
                    </Button>
                  )}
                </VStack>
              </TabPanel>

              {/* تاب امتحان المحاضرة */}
              <TabPanel px={0}>
                <VStack align="start" spacing={4} w="full">
                  {lecture.exam ? (
                    <Box w="full" p={8} bg={useColorModeValue('green.50','green.900')} borderRadius="3xl" border="3px solid" borderColor="green.200" boxShadow="2xl">
                      <HStack spacing={6} mb={6}>
                        <Box p={6} bg="green.100" borderRadius="3xl" boxShadow="xl">
                          <Icon as={FaGraduationCap} color="green.600" boxSize={10} />
                        </Box>
                        <VStack align="start" spacing={3} flex={1}>
                          <Text fontSize="2xl" fontWeight="bold" color={headingColor}>{lecture.exam.title}</Text>
                          <Text fontSize="lg" color={subTextColor} fontWeight="medium">امتحان المحاضرة</Text>
                        </VStack>
                        <Badge colorScheme={lecture.exam.is_visible ? "green" : "yellow"} size="xl" px={6} py={3} borderRadius="2xl" fontSize="lg" fontWeight="bold">
                          {lecture.exam.is_visible ? "ظاهر" : "مخفي"}
                        </Badge>
                      </HStack>
                      
                      <HStack spacing={4} flexWrap="wrap">
                        <Link to={`/ComprehensiveExam/${lecture.exam.id}`} style={{ textDecoration: 'none', flex: 1 }}>
                          <Button
                            size="xl"
                            colorScheme="blue"
                            variant="solid"
                            leftIcon={<Icon as={FaEye} />}
                            borderRadius="2xl"
                            w="full"
                            _hover={{
                              transform: 'translateY(-3px)',
                              boxShadow: '2xl',
                              bg: 'blue.600'
                            }}
                            transition="all 0.3s ease"
                            fontWeight="bold"
                            px={10}
                            py={8}
                            boxShadow="xl"
                          >
                            {isTeacher || isAdmin ? "عرض الامتحان" : "ابدأ الامتحان"}
                          </Button>
                        </Link>
                        
                        {isTeacher && (
                          <>
                            <Tooltip label={lecture.exam.is_visible ? "إخفاء الامتحان" : "إظهار الامتحان"} hasArrow>
                              <IconButton
                                size="xl"
                                icon={<Icon as={lecture.exam.is_visible ? FaEye : FaEyeSlash} />}
                                colorScheme={lecture.exam.is_visible ? "green" : "yellow"}
                                variant="solid"
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
                                    lecture.exam.is_visible = !lecture.exam.is_visible;
                                    window.location.reload();
                                  } catch (error) {
                                    console.error("Error toggling exam visibility:", error);
                                  }
                                }}
                                borderRadius="2xl"
                                _hover={{ transform: 'scale(1.1)', boxShadow: 'xl' }}
                                transition="all 0.3s ease"
                                boxShadow="lg"
                              />
                            </Tooltip>
                            <Tooltip label="إضافة أسئلة للامتحان" hasArrow>
                              <IconButton
                                size="xl"
                                icon={<Icon as={FaPlus} />}
                                colorScheme="green"
                                variant="solid"
                                onClick={() => onAddBulkQuestions && onAddBulkQuestions(lecture.exam.id, lecture.exam.title, 'lecture')}
                                borderRadius="2xl"
                                _hover={{ transform: 'scale(1.1)', boxShadow: 'xl' }}
                                transition="all 0.3s ease"
                                boxShadow="lg"
                              />
                            </Tooltip>
                            <Tooltip label="تعديل الامتحان" hasArrow>
                              <IconButton
                                size="xl"
                                icon={<Icon as={FaEdit} />}
                                colorScheme="blue"
                                variant="solid"
                                onClick={() => setExamModal && setExamModal({ isOpen: true, type: 'edit', lectureId: lecture.id, data: lecture.exam })}
                                borderRadius="2xl"
                                _hover={{ transform: 'scale(1.1)', boxShadow: 'xl' }}
                                transition="all 0.3s ease"
                                boxShadow="lg"
                              />
                            </Tooltip>
                            <Tooltip label="حذف الامتحان" hasArrow>
                              <IconButton
                                size="xl"
                                icon={<Icon as={FaTrash} />}
                                colorScheme="red"
                                variant="solid"
                                onClick={() => setDeleteExamDialog && setDeleteExamDialog({ isOpen: true, examId: lecture.exam.id, title: lecture.exam.title })}
                                borderRadius="2xl"
                                _hover={{ transform: 'scale(1.1)', boxShadow: 'xl' }}
                                transition="all 0.3s ease"
                                boxShadow="lg"
                              />
                            </Tooltip>
                          </>
                        )}
                      </HStack>
                    </Box>
                  ) : (
                    <Box textAlign="center" w="full" py={16} bg={useColorModeValue('green.50','green.900')} borderRadius="2xl" border="3px dashed" borderColor={useColorModeValue('green.200','green.700')} boxShadow="lg">
                      <Box p={6} bg="green.100" borderRadius="3xl" w="fit-content" mx="auto" mb={6} boxShadow="xl">
                        <Icon as={FaGraduationCap} color="green.500" boxSize={20} />
                      </Box>
                      <Text color={headingColor} fontSize="2xl" fontWeight="bold" mb={3}>لا يوجد امتحان لهذه المحاضرة بعد</Text>
                      <Text color={subTextColor} fontSize="lg" mb={8} fontWeight="medium">أضف امتحان للمحاضرة لتقييم الطلاب</Text>
                      {isTeacher && (
                        <Button 
                          size="xl" 
                          colorScheme="green" 
                          variant="solid" 
                          leftIcon={<Icon as={FaPlus} />} 
                          borderRadius="2xl"
                          px={12}
                          py={8}
                          _hover={{ transform: 'translateY(-3px)', boxShadow: '2xl', bg: 'green.600' }}
                          transition="all 0.3s ease"
                          fontWeight="bold"
                          boxShadow="xl"
                          onClick={() => setExamModal({ 
                            isOpen: true, 
                            type: 'add', 
                            lectureId: lecture.id, 
                            data: null,
                            onSave: handleAddLectureExam
                          })} 
                          isLoading={examActionLoading}
                        >
                          إضافة امتحان
                        </Button>
                      )}
                    </Box>
                  )}
                </VStack>
              </TabPanel>

              {/* تاب الامتحانات المقالية */}
              <TabPanel px={0}>
                <VStack align="start" spacing={4} w="full">
                  {essayExamLoading ? (
                    <Box textAlign="center" w="full" py={12} bg={useColorModeValue('gray.50','gray.800')} borderRadius="xl">
                      <Text color={subTextColor} fontSize="lg">جاري تحميل الامتحان...</Text>
                    </Box>
                  ) : essayExam ? (
                    <Box w="full" p={6} bg={useColorModeValue('purple.50','purple.800')} borderRadius="2xl" border="2px solid" borderColor="purple.200" boxShadow="lg">
                      <HStack spacing={4} mb={4}>
                        <Box p={4} bg="purple.100" borderRadius="xl">
                          <Icon as={FaRegPaperPlane} color="purple.600" boxSize={8} />
                        </Box>
                        <VStack align="start" spacing={2} flex={1}>
                          <Text fontSize="xl" fontWeight="bold" color={headingColor}>{essayExam.title}</Text>
                          {essayExam.description && (
                            <Text fontSize="md" color={subTextColor}>{essayExam.description}</Text>
                          )}
                          <Text fontSize="md" color="purple.600" fontWeight="medium">
                            {essayExam.questions_count || 0} سؤال
                          </Text>
                        </VStack>
                        <Badge colorScheme={essayExam.is_visible ? "green" : "yellow"} size="lg" px={4} py={2} borderRadius="full">
                          {essayExam.is_visible ? "ظاهر" : "مخفي"}
                        </Badge>
                      </HStack>
                      
                      <HStack spacing={3} flexWrap="wrap">
                        {isTeacher ? (
                          <>
                            <Tooltip label="عرض التسليمات">
                              <Button 
                                size="lg" 
                                colorScheme="blue" 
                                variant="solid"
                                leftIcon={<Icon as={FaUsers} />}
                                borderRadius="full"
                                onClick={() => fetchEssayExamSubmissions(essayExam.id)}
                                _hover={{ transform: 'translateY(-2px)', boxShadow: 'lg' }}
                                transition="all 0.2s"
                              >
                                التسليمات
                              </Button>
                            </Tooltip>
                            <Tooltip label="تعديل الامتحان">
                              <IconButton 
                                size="lg" 
                                icon={<Icon as={FaEdit} />} 
                                colorScheme="green" 
                                variant="solid" 
                                borderRadius="full"
                                onClick={() => setEssayExamModal({ isOpen: true, type: 'edit', data: essayExam })}
                              />
                            </Tooltip>
                            <Tooltip label="حذف الامتحان">
                              <IconButton 
                                size="lg" 
                                icon={<Icon as={FaTrash} />} 
                                colorScheme="red" 
                                variant="solid" 
                                borderRadius="full"
                                onClick={() => deleteEssayExam(essayExam.id)}
                              />
                            </Tooltip>
                          </>
                        ) : (
                          <Link to={`/essay-exam/${essayExam.id}`}>
                            <Button 
                              size="lg" 
                              colorScheme="purple" 
                              variant="solid"
                              leftIcon={<Icon as={FaRegPaperPlane} />}
                              borderRadius="full"
                              px={8}
                              _hover={{ bg: 'purple.600', transform: 'translateY(-2px)', boxShadow: 'lg' }}
                              transition="all 0.2s"
                              fontWeight="bold"
                            >
                              ابدأ الامتحان
                            </Button>
                          </Link>
                        )}
                      </HStack>
                      
                      {/* عرض التسليمات للمعلمين */}
                      {isTeacher && essayExamSubmissions.length > 0 && (
                        <Box w="full" mt={6} p={4} bg={useColorModeValue('white','gray.700')} borderRadius="xl" border="1px solid" borderColor={useColorModeValue('gray.200','gray.600')}>
                          <Text fontSize="lg" fontWeight="bold" color={headingColor} mb={4}>
                            التسليمات ({essayExamSubmissions.length})
                          </Text>
                          <VStack spacing={3} align="start" w="full">
                            {essayExamSubmissions.map((student) => (
                              <Flex key={student.student_id} align="center" p={4} bg={useColorModeValue('gray.50','gray.600')} borderRadius="lg" w="full" border="1px solid" borderColor={useColorModeValue('gray.200','gray.500')}>
                                <VStack align="start" spacing={2} flex={1}>
                                  <Text fontSize="md" fontWeight="bold">{student.student_name}</Text>
                                  <Text fontSize="sm" color={subTextColor}>
                                    {student.student_email}
                                  </Text>
                                  <Text fontSize="sm" color={subTextColor}>
                                    {student.answered_questions}/{student.total_questions} أسئلة
                                  </Text>
                                </VStack>
                                <HStack spacing={3}>
                                  <Badge colorScheme={student.graded_at ? "green" : "yellow"} size="lg" px={3} py={1} borderRadius="full">
                                    {student.graded_at ? "مقيم" : "في الانتظار"}
                                  </Badge>
                                  {student.graded_at && (
                                    <Text fontSize="md" color={subTextColor} fontWeight="bold">
                                      {student.total_grade}/{student.max_grade}
                                    </Text>
                                  )}
                                </HStack>
                              </Flex>
                            ))}
                          </VStack>
                        </Box>
                      )}
                    </Box>
                  ) : (
                    <Box textAlign="center" w="full" py={12} bg={useColorModeValue('gray.50','gray.800')} borderRadius="xl" border="2px dashed" borderColor={useColorModeValue('gray.300','gray.600')}>
                      <Box p={4} bg="purple.50" borderRadius="full" w="fit-content" mx="auto" mb={4}>
                        <Icon as={FaRegPaperPlane} color="purple.400" boxSize={16} />
                      </Box>
                      <Text color={subTextColor} fontSize="lg" fontWeight="medium" mb={2}>لا يوجد امتحان مقالي بعد</Text>
                      <Text color={subTextColor} fontSize="sm" mb={6}>أضف امتحان مقالي للمحاضرة</Text>
                      {isTeacher && (
                        <Button 
                          size="lg" 
                          colorScheme="purple" 
                          variant="solid" 
                          leftIcon={<Icon as={FaPlus} />} 
                          borderRadius="full"
                          px={8}
                          _hover={{ transform: 'translateY(-2px)', boxShadow: 'lg' }}
                          transition="all 0.2s"
                          onClick={() => setEssayExamModal({ isOpen: true, type: 'add', data: null })}
                        >
                          إضافة امتحان مقالي
                        </Button>
                      )}
                    </Box>
                  )}
                </VStack>
              </TabPanel>

              {/* تاب المناقشة */}
              <TabPanel px={0}>
                <VStack align="start" spacing={4} w="full">
                  <Box w="full" p={6} bg={useColorModeValue('orange.50','orange.800')} borderRadius="2xl" border="2px solid" borderColor="orange.200" boxShadow="lg">
                    <HStack spacing={4} mb={4}>
                      <Box p={4} bg="orange.100" borderRadius="xl">
                        <Icon as={FaComments} color="orange.600" boxSize={8} />
                      </Box>
                      <VStack align="start" spacing={2} flex={1}>
                        <Text fontSize="xl" fontWeight="bold" color={headingColor}>مناقشة المحاضرة</Text>
                        <Text fontSize="md" color={subTextColor}>
                          شارك في النقاش مع زملائك حول هذه المحاضرة
                        </Text>
                      </VStack>
                      {commentsStats.recent > 0 && (
                        <VStack spacing={1} align="center">
                          <Text fontSize="2xl" fontWeight="bold" color="green.600">
                            {commentsStats.recent}
                          </Text>
                          <Text fontSize="sm" color={subTextColor}>جديدة</Text>
                        </VStack>
                      )}
                    </HStack>
                    
                    <HStack spacing={3} flexWrap="wrap">
                      <Link to={`/lectur_commints/${lecture.id}`} style={{ textDecoration: 'none', flex: 1 }}>
                        <Button
                          size="lg"
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
                          px={8}
                        >
                          {commentsStats.total > 0 ? "عرض التعليقات" : "ابدأ النقاش"}
                        </Button>
                      </Link>
                      
                      {commentsStats.total > 0 && (
                        <Link to={`/lectur_commints/${lecture.id}`} style={{ textDecoration: 'none' }}>
                          <Button
                            size="lg"
                            colorScheme="orange"
                            variant="outline"
                            leftIcon={<Icon as={FaUsers} />}
                            borderRadius="full"
                            px={8}
                            _hover={{
                              transform: 'translateY(-2px)',
                              boxShadow: 'md',
                              bg: 'orange.50'
                            }}
                            transition="all 0.2s"
                            fontWeight="bold"
                          >
                            المشاركون
                          </Button>
                        </Link>
                      )}
                    </HStack>
                    
                    {commentsStats.total === 0 && (
                      <Box
                        mt={6}
                        p={6}
                        bg={useColorModeValue('orange.100', 'orange.700')}
                        borderRadius="xl"
                        border="1px solid"
                        borderColor="orange.300"
                      >
                        <HStack spacing={4}>
                          <Box p={3} bg="orange.200" borderRadius="lg">
                            <Icon as={FaLightbulb} color="orange.600" boxSize={6} />
                          </Box>
                          <VStack align="start" spacing={2}>
                            <Text fontSize="lg" fontWeight="bold" color="orange.700">
                              اسأل سؤالك عن المحاضرة
                            </Text>
                            <Text fontSize="md" color="orange.600">
                              شارك استفساراتك أو ملاحظاتك مع زملائك
                            </Text>
                          </VStack>
                        </HStack>
                      </Box>
                    )}
                  </Box>
                </VStack>
              </TabPanel>
            </TabPanels>
          </Tabs>
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