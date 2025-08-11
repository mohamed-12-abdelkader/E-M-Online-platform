import React from "react";
import {
  Box, Flex, HStack, VStack, Text, Badge, Icon, IconButton, Button, Collapse, Divider, Tooltip, useColorModeValue,
  Stack
} from "@chakra-ui/react";
import {
  FaPlayCircle, FaLock, FaEdit, FaTrash, FaPlus, FaGraduationCap, FaRegPaperPlane, FaVideo, FaFilePdf, FaLightbulb, FaClock, FaBookOpen, FaStar,
  FaAngleDown, FaAngleUp, FaEye, FaEyeSlash, FaCalendar, FaTag
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

  // جلب امتحان المحاضرة عند فتح المحاضرة
  React.useEffect(() => {
    if (isExpanded && !lectureExam && !examLoading) {
      fetchLectureExam();
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
              {!lecture.exam && !lectureExam && (
                <Button 
                  size={{ base: 'xs', md: 'sm' }}
                  colorScheme="green" 
                  leftIcon={<Icon as={FaPlus} />} 
                  onClick={() => setExamModal({ 
                    isOpen: true, 
                    type: 'add', 
                    lectureId: lecture.id, 
                    data: null,
                    onSave: handleAddLectureExam
                  })} 
                  isLoading={examActionLoading}
                  fontSize={{ base: 'xs', md: 'sm' }}
                >
                  إضافة امتحان
                </Button>
              )}
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
            <HStack spacing={3} align="start">
              <Icon as={FaRegPaperPlane} color="blue.400" boxSize={5} mt={1} />
              <Box>
                <Text fontWeight="bold" color={headingColor} mb={1}>وصف المحاضرة</Text>
                <Text color={textColor} fontSize="md" fontWeight="medium">
                  {lecture.description || "لا يوجد وصف للمحاضرة"}
                </Text>
              </Box>
            </HStack>
            {/* عرض الامتحان إذا وجد */}
            {lecture.exam && (
              <HStack spacing={3} align="center" w="full">
                <Icon as={FaGraduationCap} color="green.500" boxSize={5} />
                <Box flex={1}>
                  <Text fontWeight="bold" color={headingColor} mb={1}>امتحان المحاضرة</Text>
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
    </Box>
  );
};

export default LectureCard; 