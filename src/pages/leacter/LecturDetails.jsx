import { useState, useRef, useMemo } from "react"; // Removed useEffect as we're mocking
import { useParams } from "react-router-dom";
import {
  Box,
  Image,
  useDisclosure,
  Flex,
  Text,
  Button,
  HStack,
  Icon,
  Input,
  InputGroup,
  InputLeftElement,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  VStack,
  useColorModeValue,
} from "@chakra-ui/react";
import {
  FaEye,
  FaUserTimes,
  FaSearch,
} from "react-icons/fa";
import { Zoom } from "react-awesome-reveal";
import ScrollToTop from "../../components/scollToTop/ScrollToTop";

import GitLecturTdetails from "../../Hooks/teacher/GitLecturTdetails";
import UserType from "../../Hooks/auth/userType";
import DeleateCenterVedio from "../../Hooks/teacher/DeleateCenterVedio";
import DeleateExamG from "../../Hooks/teacher/DeleateExamG";
import DeleatPdf from "../../Hooks/teacher/DeleatPdf";
import GitLectureCenterDetails from "../../Hooks/student/GitLectureCenterDetails";
import LectureContent from "../../components/lecture/LectureContent";
import AlertDialogComponent from "../../components/lecture/AlertDialogComponent";
import Loading from "../../components/loading/Loading";
// import baseUrl from "../../api/baseUrl"; // Not needed for mock data fetching
// import { toast } from "react-toastify"; // Not strictly needed for mock, but kept for future actual use

const LectureDetails = () => {
  const { id } = useParams();
  // const token = localStorage.getItem("token"); // Not needed for mock data fetching

  const [lectureLoading, lectures] = GitLectureCenterDetails({ id });
  const [lectureTLoading, lecturesT] = GitLecturTdetails({ id });
  const [userData, isAdmin, isTeacher] = UserType();
  const [deleteVedioCenterLoading, deletVedioCenter] = DeleateCenterVedio();
  const [deleteGLoading, deleteExamsG] = DeleateExamG();
  const [deletePdfLoading, deletPdf] = DeleatPdf();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = useRef();
  const [selectedItem, setSelectedItem] = useState(null);

  // New states for watched/missed students functionality
  const { isOpen: isWatchedStudentsOpen, onOpen: onWatchedStudentsOpen, onClose: onWatchedStudentsClose } = useDisclosure();
  const { isOpen: isMissedStudentsOpen, onOpen: onMissedStudentsOpen, onClose: onMissedStudentsClose } = useDisclosure();

  const [watchedStudents, setWatchedStudents] = useState([]);
  const [missedStudents, setMissedStudents] = useState([]);
  const [watchedSearchTerm, setWatchedSearchTerm] = useState("");
  const [missedSearchTerm, setMissedSearchTerm] = useState("");
  const [studentsLoading, setStudentsLoading] = useState(false); // Loading state for students

  const videosToMap = lectures?.videos || lecturesT?.videos || [];
  const pdfsToMap = lectures?.pdfs || lecturesT?.pdfs || [];
  const examName = lecturesT?.exam_name || lectures?.exam_name;
  const examId = lecturesT?.exam_id || lectures?.exam_id;
  const lastResult = lectures?.last_result;

  const handleDeleteVideo = (video) => {
    setSelectedItem(video);
    onOpen();
  };

  const handleDeletePdf = (pdf) => {
    setSelectedItem(pdf);
    onOpen();
  };

  const handleDeleteExam = (exam) => {
    setSelectedItem(exam);
    onOpen();
  };

  const handleConfirmDelete = () => {
    if (selectedItem?.v_name) {
      deletVedioCenter(selectedItem.id);
    } else if (selectedItem?.pdf_name) {
      deletPdf(selectedItem.id);
    } else if (selectedItem?.exam_name) {
      deleteExamsG(selectedItem.id);
    }
    onClose(); // Close the alert dialog after confirming delete action
  };

  // --- Mock Data ---
  const mockWatchedStudents = useMemo(() => ([
    { user_id: 1, user_name: "أحمد محمد", user_email: "ahmed.m@example.com" },
    { user_id: 2, user_name: "فاطمة علي", user_email: "fatma.a@example.com" },
    { user_id: 3, user_name: "يوسف خالد", user_email: "youssef.k@example.com" },
    { user_id: 4, user_name: "ليلى حسن", user_email: "layla.h@example.com" },
    { user_id: 5, user_name: "محمد محمود", user_email: "mohamed.m@example.com" },
    { user_id: 6, user_name: "سارة جمال", user_email: "sara.g@example.com" },
    { user_id: 7, user_name: "علي رضا", user_email: "ali.r@example.com" },
    { user_id: 8, user_name: "هند فوزي", user_email: "hind.f@example.com" },
    { user_id: 9, user_name: "عمران سمير", user_email: "omran.s@example.com" },
    { user_id: 10, user_name: "نور كمال", user_email: "nour.k@example.com" },
  ]), []);

  const mockMissedStudents = useMemo(() => ([
    { user_id: 11, user_name: "زينب سعيد", user_email: "zainab.s@example.com" },
    { user_id: 12, user_name: "خالد منصور", user_email: "khalid.m@example.com" },
    { user_id: 13, user_name: "ريم عادل", user_email: "reem.a@example.com" },
    { user_id: 14, user_name: "سامي ناصر", user_email: "samy.n@example.com" },
    { user_id: 15, user_name: "مريم صبري", user_email: "maryam.s@example.com" },
  ]), []);
  // --- End Mock Data ---

  // Function to simulate fetching watched students
  const fetchWatchedStudents = () => {
    setStudentsLoading(true);
    setTimeout(() => { // Simulate network delay
      setWatchedStudents(mockWatchedStudents);
      setStudentsLoading(false);
      // toast.success("تم تحميل قائمة الطلاب الذين شاهدوا المحاضرة (بيانات وهمية)."); // Optional: for debugging mock data
    }, 800); // 800ms delay
  };

  // Function to simulate fetching missed students
  const fetchMissedStudents = () => {
    setStudentsLoading(true);
    setTimeout(() => { // Simulate network delay
      setMissedStudents(mockMissedStudents);
      setStudentsLoading(false);
      // toast.success("تم تحميل قائمة الطلاب المتراكم عليهم المحاضرة (بيانات وهمية)."); // Optional: for debugging mock data
    }, 800); // 800ms delay
  };

  // Filtered lists for modals
  const filteredWatchedStudents = useMemo(() => {
    return watchedStudents.filter(
      (student) =>
        student.user_name.toLowerCase().includes(watchedSearchTerm.toLowerCase()) ||
        student.user_email.toLowerCase().includes(watchedSearchTerm.toLowerCase())
    );
  }, [watchedStudents, watchedSearchTerm]);

  const filteredMissedStudents = useMemo(() => {
    return missedStudents.filter(
      (student) =>
        student.user_name.toLowerCase().includes(missedSearchTerm.toLowerCase()) ||
        student.user_email.toLowerCase().includes(missedSearchTerm.toLowerCase())
    );
  }, [missedStudents, missedSearchTerm]);

  // Handle opening modals and fetching data
  const handleOpenWatchedStudents = () => {
    fetchWatchedStudents();
    onWatchedStudentsOpen();
  };

  const handleOpenMissedStudents = () => {
    fetchMissedStudents();
    onMissedStudentsOpen();
  };

  if (lectureLoading || lectureTLoading || studentsLoading) {
    return <Loading />;
  }

  // Common styling for modals
  const modalBg = useColorModeValue("gray.800", "gray.900");
  const tableThColor = "white";
  const tableTdColor = "white";

  // Render function for student tables within modals
  const renderStudentTable = (students, searchTerm, setSearchTerm) => (
    <>
      <InputGroup mb={6}>
        <InputLeftElement pointerEvents="none">
          <Icon as={FaSearch} color="gray.400" />
        </InputLeftElement>
        <Input
          placeholder="ابحث عن طالب..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          borderRadius="full"
          bg={useColorModeValue("gray.700", "gray.800")}
          color="white"
        />
      </InputGroup>
      {students.length > 0 ? (
        <Table variant="simple" colorScheme="purple" sx={{ boxShadow: "lg" }}>
          <Thead>
            <Tr>
              <Th color={tableThColor}>الرقم التعريفي</Th>
              <Th color={tableThColor}>اسم المستخدم</Th>
              <Th color={tableThColor}>البريد الإلكتروني</Th>
            </Tr>
          </Thead>
          <Tbody>
            {students.map((student) => (
              <Tr key={student.user_id} _hover={{ bg: "purple.900" }}>
                <Td color={tableTdColor}>{student.user_id}</Td>
                <Td color={tableTdColor}>{student.user_name}</Td>
                <Td color={tableTdColor}>{student.user_email}</Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      ) : (
        <Text color="gray.300" textAlign="center" mt={4}>
          لا يوجد طلبة مطابقين
        </Text>
      )}
    </>
  );

  return (
    <Box my="80px" mx="auto">
      <div className="bg-blue-500 px-5">
        <section
          dir="rtl"
          className="relative flex flex-col md:flex-row items-center justify-between md: py-16 md:py-24 bg-gradient-to-br from-white via-blue-50 to-blue-400 "
          style={{
            fontFamily: "'Cairo', sans-serif",
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23f97316' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30v4h-4v2h4v4h2v-4h4v-2h-4v-4h-2zM6 34v4h4v2h-4v4h-2v-4h-4v-2h4v-4h2zM6 4v4h-4v2h4v4h2v-4h4v-2h-4v-4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            backgroundAttachment: "fixed",
            backgroundRepeat: "repeat",
            backgroundSize: "auto",
          }}
        >
          <div
            className="container mx-auto flex flex-col md:flex-row items-center justify-between z-10"
            style={{ minHeight: "inherit" }}
          >
            <div className="flex-1 text-center md:text-right mb-10 md:mb-0 md:ml-12 p-4">
              <h1 className="text-2xl md:text-3xl font-extrabold text-white mb-4 leading-tight">
                {lecturesT?.description || lectures?.description}
              </h1>
              <p className="text-lg md:text-xl text-white mb-6 max-w-lg md:max-w-none mx-auto">
                {/* يمكنك إضافة وصف محدد للمحاضرة هنا إذا كان متوفراً في بياناتك */}
              </p>

              {isTeacher && (
                <HStack spacing={4} mt={6} justify={{ base: "center", md: "flex-end" }} w="full">
                  <Button
                    leftIcon={<Icon as={FaEye} />}
                    colorScheme="green"
                    size="lg"
                    borderRadius="full"
                    onClick={handleOpenWatchedStudents}
                    transition="all 0.3s"
                    _hover={{ transform: "scale(1.05)", shadow: "xl" }}
                  >
                    عرض الطلاب الذين شاهدوا
                  </Button>
                  <Button
                    leftIcon={<Icon as={FaUserTimes} />}
                    colorScheme="orange"
                    size="lg"
                    borderRadius="full"
                    onClick={handleOpenMissedStudents}
                    transition="all 0.3s"
                    _hover={{ transform: "scale(1.05)", shadow: "xl" }}
                  >
                    عرض الطلاب المتراكم عليهم
                  </Button>
                </HStack>
              )}
            </div>

            <div className="flex-1 px-3 flex justify-center md:justify-start mt-10 md:mt-0 p-4">
              <Image
                src={lecturesT?.image || lectures?.image}
                alt="Lecture Thumbnail"
                className="rounded-3xl shadow-2xl w-[350px] max-h-[300px] md:left-0 max-w-[400px] max-h-[400px]"
                style={{
                  position: "absolute",
                  border: "6px solid white",
                  outline: "6px solid #60A5FA",
                  objectFit: "scale-down",
                  objectPosition: "center",
                }}
              />
            </div>
          </div>
        </section>
      </div>

      <div className="h-[500px] px-8">
        <Image
          src={lecturesT?.image || lectures?.image}
          alt="Lecture Thumbnail"
          className="rounded-3xl shadow-2xl object-cover w-[750px] h-[430px] mt-[50px] "
          style={{
            objectFit: "scale-down",
            border: "6px solid white",
            outline: "6px solid #60A5FA",
          }}
        />
      </div>

      <Box mt="120px">
        <LectureContent
          Loading={deleteGLoading}
          videos={videosToMap}
          pdfs={pdfsToMap}
          isTeacher={isTeacher}
          onDeleteVideo={handleDeleteVideo}
          onDeletePdf={handleDeletePdf}
          examName={examName}
          examId={examId}
          lastResult={lastResult}
          onDeleteExam={() =>
            handleDeleteExam({ id: examId, exam_name: examName })
          }
        />

        <ScrollToTop />
      </Box>

      <AlertDialogComponent
        Loading={deleteGLoading || deleteVedioCenterLoading || deletePdfLoading}
        isOpen={isOpen}
        onClose={onClose}
        onConfirm={handleConfirmDelete}
        selectedItem={selectedItem}
        cancelRef={cancelRef}
      />

      {/* Modal for Watched Students */}
      <Modal isOpen={isWatchedStudentsOpen} onClose={onWatchedStudentsClose} size={{ base: "full", md: "5xl" }} motionPreset="scale">
        <ModalOverlay bg="blackAlpha.800" />
        <ModalContent borderRadius="2xl" p={{ base: 4, md: 6 }} bg={modalBg}>
          <Flex justify="space-between" align="center" mb={4}>
            <VStack align="start" spacing={1}>
              <Text fontWeight="bold" fontSize={{ base: "xl", md: "2xl" }} color="white">
                الطلاب الذين شاهدوا المحاضرة
              </Text>
              <Text fontWeight="bold" fontSize="lg" color="green.300">
                عدد الطلاب: {filteredWatchedStudents.length} طالب
              </Text>
            </VStack>
            <ModalCloseButton
              size="lg"
              colorScheme="green"
              bg="green.500"
              color="white"
              borderRadius="full"
              _hover={{ bg: "green.600", transform: "scale(1.1)" }}
            />
          </Flex>
          <ModalBody maxH="60vh" overflowY="auto" px={{ base: 2, md: 6 }}>
            {renderStudentTable(filteredWatchedStudents, watchedSearchTerm, setWatchedSearchTerm)}
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Modal for Missed Students */}
      <Modal isOpen={isMissedStudentsOpen} onClose={onMissedStudentsClose} size={{ base: "full", md: "5xl" }} motionPreset="scale">
        <ModalOverlay bg="blackAlpha.800" />
        <ModalContent borderRadius="2xl" p={{ base: 4, md: 6 }} bg={modalBg}>
          <Flex justify="space-between" align="center" mb={4}>
            <VStack align="start" spacing={1}>
              <Text fontWeight="bold" fontSize={{ base: "xl", md: "2xl" }} color="white">
                الطلاب المتراكم عليهم المحاضرة
              </Text>
              <Text fontWeight="bold" fontSize="lg" color="orange.300">
                عدد الطلاب: {filteredMissedStudents.length} طالب
              </Text>
            </VStack>
            <ModalCloseButton
              size="lg"
              colorScheme="orange"
              bg="orange.500"
              color="white"
              borderRadius="full"
              _hover={{ bg: "orange.600", transform: "scale(1.1)" }}
            />
          </Flex>
          <ModalBody maxH="60vh" overflowY="auto" px={{ base: 2, md: 6 }}>
            {renderStudentTable(filteredMissedStudents, missedSearchTerm, setMissedSearchTerm)}
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default LectureDetails;