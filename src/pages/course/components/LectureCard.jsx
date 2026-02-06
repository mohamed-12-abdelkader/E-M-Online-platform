import React from "react";
import {
  Box, Flex, HStack, VStack, Text, Badge, Icon, IconButton, Button, Collapse, Divider, Tooltip, useColorModeValue,
  Stack, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter, ModalCloseButton,
  FormControl, FormLabel, Input, Textarea, Tabs, TabList, TabPanels, Tab, TabPanel,
  Center, Heading, useToast
} from "@chakra-ui/react";
import {
  FaPlayCircle, FaLock, FaEdit, FaTrash, FaPlus, FaGraduationCap, FaRegPaperPlane, FaVideo, FaFilePdf, FaLightbulb, FaClock, FaBookOpen, FaStar,
  FaAngleDown, FaAngleUp, FaEye, FaEyeSlash, FaCalendar, FaTag, FaComments, FaUsers, FaRegComment,
  FaChevronLeft, FaCheckCircle
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
  const defaultBorderColor = useColorModeValue('gray.200', 'gray.700');

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
      // toast error
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

  React.useEffect(() => {
    if (isExpanded && !lectureExam && !examLoading) {
      fetchLectureExam();
    }
  }, [isExpanded, lecture.id]);

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
      setEssayExam(response.data.exams && response.data.exams.length > 0 ? response.data.exams[0] : null);
    } catch (error) {
      console.log("Error fetching essay exam:", error);
      setEssayExam(null);
    } finally {
      setEssayExamLoading(false);
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

  React.useEffect(() => {
    if (isExpanded && !essayExam && !essayExamLoading) {
      fetchEssayExam();
    }
  }, [isExpanded, lecture.id]);

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


  return (
    <Box
      className="modern-card"
      bg={useColorModeValue('white', 'gray.800')}
      borderRadius="2xl"
      mb={6}
      overflow="hidden"
      transition="all 0.3s ease"
      border="1px solid"
      borderColor={isExpanded ? 'blue.400' : defaultBorderColor}
      boxShadow={isExpanded ? 'lg' : 'sm'}
      _hover={{ transform: 'translateY(-2px)', boxShadow: 'md' }}
    >
      <Flex
        align="stretch"
        minH="100px"
        cursor={canExpand ? "pointer" : "default"}
        onClick={(e) => {
          if (e.target.closest('button') || e.target.closest('[role="button"]')) return;
          if (canExpand) setExpandedLecture(isExpanded ? null : lecture.id);
        }}
        bg={lecture.locked ? useColorModeValue('gray.50', 'gray.900') : 'transparent'}
      >
        {/* Number Strip */}
        <Flex
          w={{ base: "60px", md: "80px" }}
          direction="column"
          align="center"
          justify="center"
          bg={lecture.locked ? "red.50" : "blue.50"}
          _dark={{ bg: lecture.locked ? "red.900" : "blue.900" }}
          borderLeft="1px solid"
          borderColor={useColorModeValue("gray.100", "gray.700")}
        >
          <Text
            fontSize={{ base: "2xl", md: "4xl" }}
            fontWeight="900"
            color={lecture.locked ? "red.200" : "blue.200"}
            lineHeight="1"
          >
            {String(lecture.position).padStart(2, '0')}
          </Text>
        </Flex>

        {/* Content Section */}
        <Box flex={1} p={{ base: 3, md: 6 }}>
          <Flex
            justify="space-between"
            align={{ base: "start", md: "center" }}
            direction={{ base: "column", md: "row" }}
            gap={{ base: 3, md: 4 }}
          >
            <VStack align="start" spacing={1} maxW={{ base: "100%", md: "70%" }} w="full">
              <HStack spacing={2} align="start">
                {lecture.locked && <Icon as={FaLock} color="red.400" mt={1} boxSize={3} />}
                <Text
                  fontSize={{ base: "md", md: "xl" }}
                  fontWeight="bold"
                  color={useColorModeValue("gray.800", "white")}
                  lineHeight="1.4"
                >
                  {lecture.title}
                </Text>
              </HStack>

              <HStack spacing={3} color="gray.500" fontSize="xs">
                <HStack spacing={1}>
                  <Icon as={FaCalendar} />
                  <Text>{formatDate(lecture.created_at)}</Text>
                </HStack>
              </HStack>
            </VStack>

            <HStack spacing={2} wrap="wrap" w={{ base: "full", md: "auto" }} justify={{ base: "flex-start", md: "flex-end" }}>
              {lecture.exam && (
                <Badge
                  colorScheme={lecture.exam.is_visible ? "green" : "orange"}
                  variant="subtle"
                  px={2} py={0.5}
                  fontSize="xs"
                  borderRadius="lg"
                >
                  {lecture.exam.is_visible ? "امتحان" : "مخفي"}
                </Badge>
              )}
              {lecture.videos?.length > 0 && (
                <Badge colorScheme="purple" variant="subtle" px={2} py={0.5} fontSize="xs" borderRadius="lg">
                  {lecture.videos.length} فيديو
                </Badge>
              )}
            </HStack>
          </Flex>

          {/* Action Bar (Only visible if expanded or teacher) */}
          {(isTeacher || canExpand) && (
            <Flex
              mt={{ base: 3, md: 4 }}
              pt={{ base: 3, md: 4 }}
              borderTop="1px solid"
              borderColor="gray.100"
              justify={{ base: "space-between", md: "flex-end" }}
              align="center"
              gap={2}
              wrap="wrap"
            >
              {isTeacher && (
                <>
                  <Tooltip label="تعديل">
                    <IconButton size="sm" icon={<Icon as={FaEdit} />} variant="ghost" colorScheme="blue" onClick={(e) => { e.stopPropagation(); handleEditLecture(lecture); }} />
                  </Tooltip>
                  <Tooltip label="حذف">
                    <IconButton size="sm" icon={<Icon as={FaTrash} />} colorScheme="red" variant="ghost" onClick={(e) => { e.stopPropagation(); handleDeleteLecture(lecture.id, lecture.title); }} aria-label="Delete" />
                  </Tooltip>
                  <IconButton
                    size="sm"
                    icon={<Icon as={isVisible ? FaEye : FaEyeSlash} />}
                    colorScheme={isVisible ? "green" : "gray"}
                    variant="ghost"
                    onClick={(e) => handleToggleVisibility(e)}
                    aria-label="Toggle Visibility"
                  />
                </>
              )}

              {canExpand && (
                <Button
                  size="sm"
                  rightIcon={<Icon as={isExpanded ? FaAngleUp : FaAngleDown} />}
                  variant="solid"
                  bg={isExpanded ? "blue.500" : "gray.100"}
                  color={isExpanded ? "white" : "gray.600"}
                  _hover={{ bg: isExpanded ? "blue.600" : "gray.200" }}
                  onClick={(e) => { e.stopPropagation(); setExpandedLecture(isExpanded ? null : lecture.id); }}
                >
                  {isExpanded ? "إخفاء التفاصيل" : "عرض التفاصيل"}
                </Button>
              )}
            </Flex>
          )}
        </Box>
      </Flex>

      {/* تفاصيل المحاضرة */}
      <Collapse in={isExpanded} animateOpacity>
        <Box px={{ base: 4, md: 8 }} py={6} bg={useColorModeValue('gray.50', 'gray.900')} borderTop="1px solid" borderColor="gray.100">
          <Tabs index={activeTab} onChange={setActiveTab} variant="unstyled" colorScheme="blue" isLazy>
            <TabList
              mb={6}
              display="flex"
              flexWrap="wrap"
              justifyContent={{ base: "center", md: "flex-start" }}
              py={2}
              gap={2}
            >
              {[
                { icon: FaVideo, label: "الفيديوهات" },
                { icon: FaFilePdf, label: "الملفات" },
                { icon: FaGraduationCap, label: "الامتحانات" },
                { icon: FaRegPaperPlane, label: "المقالية" },
                { icon: FaComments, label: "المناقشة" }
              ].map((tab, idx) => (
                <Tab
                  key={idx}
                  display="flex"
                  alignItems="center"
                  gap={2}
                  px={{ base: 3, md: 5 }}
                  py={{ base: 2, md: 3 }}
                  borderRadius="full"
                  fontWeight="bold"
                  fontSize={{ base: "xs", md: "sm" }}
                  whiteSpace="nowrap"
                  color={useColorModeValue("gray.500", "gray.400")}
                  bg={useColorModeValue("gray.100", "gray.800")}
                  _selected={{
                    bg: "blue.500",
                    color: "white",
                    shadow: "md",
                    transform: "scale(1.05)"
                  }}
                  transition="all 0.2s"
                  flex={{ base: "1 0 auto", md: "none" }}
                  justifyContent="center"
                >
                  <Icon as={tab.icon} />
                  {tab.label}
                </Tab>
              ))}
            </TabList>

            <TabPanels>
              {/* Videos Panel */}
              <TabPanel px={0} py={2}>
                <VStack spacing={4} w="full">
                  {lecture.videos && lecture.videos.length > 0 ? (
                    lecture.videos.map((video) => (
                      <Flex
                        key={video.id}
                        align="center"
                        justify="space-between"
                        p={4}
                        bg="white"
                        _dark={{ bg: "gray.800" }}
                        borderRadius="xl"
                        w="full"
                        shadow="sm"
                        border="1px solid"
                        borderColor={useColorModeValue("gray.100", "gray.700")}
                        _hover={{ shadow: "md", borderColor: "blue.200" }}
                        transition="all 0.2s"
                        direction={{ base: "column", sm: "row" }}
                        gap={4}
                      >
                        <HStack flex={1} spacing={4} w="full">
                          <Center w={12} h={12} bg="red.50" borderRadius="full" flexShrink={0}>
                            <Icon as={FaPlayCircle} color="red.500" boxSize={6} />
                          </Center>
                          <VStack align="start" spacing={0}>
                            <Text fontWeight="bold" fontSize="md" noOfLines={2}>{video.title}</Text>
                            <Text fontSize="xs" color="gray.500">فيديو تعليمي</Text>
                          </VStack>
                        </HStack>

                        <HStack w={{ base: "full", sm: "auto" }} justify="flex-end">
                          <Link to={`/video/${video.id}`} style={{ width: '100%' }}>
                            <Button size="sm" colorScheme="blue" leftIcon={<Icon as={FaPlayCircle} />}>شاهد</Button>
                          </Link>
                          {isTeacher && (
                            <HStack>
                              <IconButton size="sm" icon={<Icon as={FaEdit} />} colorScheme="gray" onClick={() => handleEditVideo(video, lecture.id)} aria-label="Edit Video" />
                              <IconButton size="sm" icon={<Icon as={FaTrash} />} colorScheme="red" variant="ghost" onClick={() => handleDeleteVideo(video.id, video.title)} aria-label="Delete Video" />
                            </HStack>
                          )}
                        </HStack>
                      </Flex>
                    ))
                  ) : (
                    <Center flexDir="column" py={10} bg="white" borderRadius="xl" border="1px dashed" borderColor="gray.200" w="full">
                      <Icon as={FaVideo} boxSize={10} color="gray.300" mb={3} />
                      <Text color="gray.500" fontWeight="medium">لا يوجد فيديوهات</Text>
                      {isTeacher && (
                        <Button mt={4} size="sm" colorScheme="blue" variant="outline" leftIcon={<Icon as={FaPlus} />} onClick={() => handleAddVideo(lecture.id)}>إضافة فيديو</Button>
                      )}
                    </Center>
                  )}
                  {isTeacher && lecture.videos?.length > 0 && (
                    <Button w="full" variant="dashed" border="1px dashed" borderColor="blue.300" color="blue.500" leftIcon={<Icon as={FaPlus} />} onClick={() => handleAddVideo(lecture.id)}>
                      إضافة فيديو جديد
                    </Button>
                  )}
                </VStack>
              </TabPanel>

              {/* Files Panel */}
              <TabPanel px={0} py={2}>
                <VStack spacing={4} w="full">
                  {lecture.files?.length > 0 ? (
                    lecture.files.map((file) => (
                      <Flex
                        key={file.id}
                        align="center"
                        justify="space-between"
                        p={4}
                        bg="white"
                        _dark={{ bg: "gray.800" }}
                        borderRadius="xl"
                        w="full"
                        shadow="md"
                        border="1px solid"
                        borderColor={useColorModeValue("gray.100", "gray.700")}
                        _hover={{ shadow: "md", borderColor: "blue.200" }}
                        direction={{ base: "column", sm: "row" }}
                        gap={4}

                      >
                        <HStack flex={1} spacing={4} w="full">
                          <Center w={12} h={12} bg="blue.50" borderRadius="full" flexShrink={0}>
                            <Icon as={resourceIconMap[file.type] || FaFilePdf} color="blue.500" boxSize={6} />
                          </Center>
                          <VStack align="start" spacing={0}>
                            <Text fontWeight="bold" fontSize="md" noOfLines={1}>{file.filename}</Text>
                            <Text fontSize="xs" color="gray.500">ملف مرفق</Text>
                          </VStack>
                        </HStack>

                        <HStack w={{ base: "full", sm: "auto" }} justify="flex-end">
                          <Button size="sm" variant="outline" colorScheme="blue" onClick={() => window.open(file.url, '_blank')}>تحميل</Button>
                          {isTeacher && (
                            <HStack>
                              <IconButton size="sm" icon={<Icon as={FaEdit} />} colorScheme="gray" onClick={() => handleEditFile(file, lecture.id)} aria-label="Edit File" />
                              <IconButton size="sm" icon={<Icon as={FaTrash} />} colorScheme="red" variant="ghost" onClick={() => handleDeleteFile(file.id, file.name)} aria-label="Delete File" />
                            </HStack>
                          )}
                        </HStack>
                      </Flex>
                    ))
                  ) : (
                    <Center flexDir="column" py={10} bg="white" borderRadius="xl" border="1px dashed" borderColor="gray.200" w="full">
                      <Icon as={FaFilePdf} boxSize={10} color="gray.300" mb={3} />
                      <Text color="gray.500" fontWeight="medium">لا يوجد ملفات</Text>
                      {isTeacher && (
                        <Button mt={4} size="sm" colorScheme="blue" variant="outline" leftIcon={<Icon as={FaPlus} />} onClick={() => handleAddFile(lecture.id)}>إضافة ملف</Button>
                      )}
                    </Center>
                  )}
                  {isTeacher && lecture.files?.length > 0 && (
                    <Button w="full" variant="dashed" border="1px dashed" borderColor="blue.300" color="blue.500" leftIcon={<Icon as={FaPlus} />} onClick={() => handleAddFile(lecture.id)}>
                      إضافة ملف جديد
                    </Button>
                  )}
                </VStack>
              </TabPanel>

              {/* Exams Panel */}
              <TabPanel px={0} py={2}>
                <VStack spacing={4} w="full">
                  {/* Main Lecture Exam */}
                  {lecture.exam ? (
                    <Box p={5} bg="white" _dark={{ bg: "gray.800" }} borderRadius="2xl" shadow="md" border="1px solid" borderColor="green.200" w="full">
                      <Flex justify="space-between" direction={{ base: "column", sm: "row" }} align="center" gap={4}>
                        <HStack spacing={4}>
                          <Center w={14} h={14} bg="green.50" borderRadius="2xl">
                            <Icon as={FaGraduationCap} color="green.500" boxSize={7} />
                          </Center>
                          <VStack align="start" spacing={1}>
                            <Heading size="sm" color="gray.700" _dark={{ color: "gray.200" }}>{lecture.exam.title}</Heading>
                            <Badge colorScheme={lecture.exam.is_visible ? "green" : "orange"}>{lecture.exam.is_visible ? "متاح للطلاب" : "مخفي"}</Badge>
                          </VStack>
                        </HStack>

                        <HStack spacing={2} w={{ base: "full", sm: "auto" }}>
                          <Link to={`/ComprehensiveExam/${lecture.exam.id}`} style={{ width: '100%' }}>
                            <Button w="full" colorScheme="green" leftIcon={<Icon as={FaPlayCircle} />}>{isTeacher ? "معاينة" : "ابدأ"}</Button>
                          </Link>

                          {isTeacher && (
                            <>
                              <IconButton icon={<Icon as={FaEdit} />} onClick={() => setExamModal({ isOpen: true, type: 'edit', data: lecture.exam })} aria-label="Edit Exam" />
                              <IconButton icon={<Icon as={FaTrash} />} colorScheme="red" variant="ghost" onClick={() => setDeleteExamDialog({ isOpen: true, examId: lecture.exam.id })} aria-label="Delete Exam" />
                              <Tooltip label="تغيير الحالة">
                                <IconButton
                                  icon={<Icon as={lecture.exam.is_visible ? FaEye : FaEyeSlash} />}
                                  onClick={async (e) => {
                                    // Toggle logic inline or separate handler
                                    try {
                                      const token = localStorage.getItem("token");
                                      await baseUrl.patch(`/api/course/lecture/exam/${lecture.exam.id}/visibility`, { is_visible: !lecture.exam.is_visible }, { headers: { Authorization: `Bearer ${token}` } });
                                      // Ideally refresh or update state
                                      fetchLectureExam();
                                    } catch (err) { }
                                  }}
                                  aria-label="Toggle Visibility"
                                />
                              </Tooltip>
                            </>
                          )}
                        </HStack>
                      </Flex>
                    </Box>
                  ) : (
                    <Center flexDir="column" py={8} w="full" bg="gray.50" borderRadius="xl" border="1px dashed" borderColor="gray.300">
                      <Text color="gray.500" mb={2}>لا يوجد امتحان للمحاضرة</Text>
                      {isTeacher && <Button size="sm" colorScheme="green" leftIcon={<Icon as={FaPlus} />} onClick={() => setExamModal({ isOpen: true, type: 'add', lectureId: lecture.id, data: null })}>إنشاء امتحان</Button>}
                    </Center>
                  )}
                </VStack>
              </TabPanel>

              {/* Essay Exams Panel */}
              <TabPanel px={0} py={2}>
                <VStack spacing={4} w="full">
                  {essayExam ? (
                    <Box p={5} bg="white" _dark={{ bg: "gray.800" }} borderRadius="2xl" shadow="md" border="1px solid" borderColor="purple.200" w="full">
                      <Flex justify="space-between" direction={{ base: "column", sm: "row" }} align="center" gap={4}>
                        <HStack spacing={4}>
                          <Center w={14} h={14} bg="purple.50" borderRadius="2xl">
                            <Icon as={FaRegPaperPlane} color="purple.500" boxSize={7} />
                          </Center>
                          <VStack align="start" spacing={1}>
                            <Heading size="sm" color="gray.700" _dark={{ color: "gray.200" }}>{essayExam.title}</Heading>
                            <Badge colorScheme={essayExam.is_visible ? "purple" : "orange"}>{essayExam.is_visible ? "متاح" : "مخفي"}</Badge>
                          </VStack>
                        </HStack>
                        <HStack spacing={2}>
                          <Link to={`/essay-exam/${essayExam.id}`}>
                            <Button colorScheme="purple">{isTeacher ? "المتابعة" : "حل الامتحان"}</Button>
                          </Link>
                          {isTeacher && (
                            <IconButton icon={<Icon as={FaTrash} />} colorScheme="red" variant="ghost" onClick={() => deleteEssayExam(essayExam.id)} aria-label="Delete Exam" />
                          )}
                        </HStack>
                      </Flex>
                    </Box>
                  ) : (
                    <Center flexDir="column" py={8} w="full" bg="gray.50" borderRadius="xl" border="1px dashed" borderColor="gray.300">
                      <Text color="gray.500" mb={2}>لا يوجد امتحانات مقالية</Text>
                      {isTeacher && <Button size="sm" colorScheme="purple" leftIcon={<Icon as={FaPlus} />} onClick={() => setEssayExamModal({ isOpen: true, type: 'add' })}>إنشاء امتحان مقالي</Button>}
                    </Center>
                  )}
                </VStack>
              </TabPanel>

              {/* Comments Panel */}
              <TabPanel px={0} py={2}>
                <Center py={10} flexDir="column">
                  <Icon as={FaComments} boxSize={12} color="gray.300" mb={4} />
                  <Text fontWeight="bold" fontSize="lg" color="gray.600">منطقة المناقشة</Text>
                  <Text color="gray.500" mb={4}>شارك اسئلتك واستفساراتك مع المدرس والزملاء</Text>
                  <Link to={`/lecture/${lecture.id}/comments`}>
                    <Button colorScheme="blue" leftIcon={<Icon as={FaRegComment} />}>فتح المناقشة الكاملة</Button>
                  </Link>
                </Center>
              </TabPanel>

            </TabPanels>
          </Tabs>
        </Box>
      </Collapse>
    </Box>
  );
};

export default LectureCard;