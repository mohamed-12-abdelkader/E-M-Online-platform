import { Zoom } from "react-awesome-reveal";
import VideoItem from "./VideoItem";
import PdfItem from "./PdfItem";
import { FaFileVideo, FaPhotoVideo, FaVideo, FaFilePdf, FaClipboardCheck } from "react-icons/fa";
import { GoArrowLeft } from "react-icons/go";
import { PiExamFill } from "react-icons/pi";
import { RiLogoutBoxRFill } from "react-icons/ri";
import { MdOutlineDeleteOutline } from "react-icons/md";
import { Link } from "react-router-dom";
import { Box, Button, Spinner, Tabs, TabList, TabPanels, Tab, TabPanel, Text, VStack } from "@chakra-ui/react";

const LectureContent = ({
  videos,
  pdfs,
  isTeacher,
  onDeleteVideo,
  onDeletePdf,
  examName,
  examId,
  lastResult,
  onDeleteExam,
  Loading,
}) => (
  <Box
    className="w-[100%] border shadow my-[70px] m-auto p-3"
    style={{ borderRadius: "20px" }}
  >
    <Tabs variant="soft-rounded" colorScheme="blue">
      <TabList mb={6} justifyContent="center" flexWrap="wrap" gap={2}>
        <Tab
          fontWeight="bold"
          fontSize={{ base: "sm", md: "md" }}
          _hover={{ bg: "blue.50" }}
          _selected={{ bg: "blue.500", color: "white" }}
          borderRadius="full"
          px={6}
          py={2}
        >
          <FaVideo style={{ marginRight: "8px" }} />
          الفيديوهات
        </Tab>
        <Tab
          fontWeight="bold"
          fontSize={{ base: "sm", md: "md" }}
          _hover={{ bg: "blue.50" }}
          _selected={{ bg: "blue.500", color: "white" }}
          borderRadius="full"
          px={6}
          py={2}
        >
          <FaFilePdf style={{ marginRight: "8px" }} />
          ملفات PDF
        </Tab>
        <Tab
          fontWeight="bold"
          fontSize={{ base: "sm", md: "md" }}
          _hover={{ bg: "blue.50" }}
          _selected={{ bg: "blue.500", color: "white" }}
          borderRadius="full"
          px={6}
          py={2}
        >
          <FaClipboardCheck style={{ marginRight: "8px" }} />
          الامتحانات
        </Tab>
      </TabList>

      <TabPanels>
        <TabPanel p={0}>
          <Box
            className="flex font-bold text-xl bg-blue-500 w-[230px] p-2 mb-4"
            style={{ borderRadius: "20px" }}
          >
            <FaFileVideo className="text-red-500 m-2" />
            <h1 className="text-white">الفيديوهات</h1>
          </Box>
          {videos.length > 0 ? (
            videos.map((video) => (
              <Zoom key={video.id}>
                <VideoItem
                  video={video}
                  onDelete={onDeleteVideo}
                  isTeacher={isTeacher}
                />
              </Zoom>
            ))
          ) : (
            <Box className="text-center flex justify-center items-center my-3 h-[150px]">
              {isTeacher ? (
                <Text className="font-bold flex">
                  لا يوجد محتوى للفيديوهات
                  <GoArrowLeft className="m-1 text-red-500 text-xl" />
                  <Link to={`/admin/add_video`}>
                    <span className="text-red-500">اضف المحتوى الان</span>
                  </Link>
                </Text>
              ) : (
                <Text className="font-bold flex">
                  <FaPhotoVideo className="m-1 text-red-500 text-xl" />
                  سوف يتم اضافة الفيديوهات قريبًا
                </Text>
              )}
            </Box>
          )}
        </TabPanel>
        <TabPanel p={0}>
          <Box
            className="flex font-bold text-xl bg-blue-500 w-[230px] p-2 mb-4"
            style={{ borderRadius: "20px" }}
          >
            <FaFilePdf className="text-red-500 m-2" />
            <h1 className="text-white">ملفات PDF</h1>
          </Box>
          {pdfs.length > 0 ? (
            pdfs.map((pdf) => (
              <Zoom key={pdf.id}>
                <PdfItem
                  pdf={pdf}
                  onDelete={onDeletePdf}
                  isTeacher={isTeacher}
                />
              </Zoom>
            ))
          ) : (
            <Box className="text-center flex justify-center items-center my-3 h-[150px]">
              <Text className="font-bold flex">
                <FaFilePdf className="m-1 text-red-500 text-xl" />
                لا توجد ملفات PDF متاحة
              </Text>
            </Box>
          )}
        </TabPanel>
        <TabPanel p={0}>
          <Box
            className="flex font-bold text-xl bg-blue-500 w-[230px] p-2 mb-4"
            style={{ borderRadius: "20px" }}
          >
            <FaClipboardCheck className="text-red-500 m-2" />
            <h1 className="text-white">الامتحانات</h1>
          </Box>
          {examName ? (
            <Zoom>
              <Box className="w-[100%] border shadow h-[80px] my-5 p-3 flex justify-between items-center">
                <Box>
                  <Text className="font-bold my-2 flex">
                    <PiExamFill className="m-1 text-red-500 text-xl" />
                    {examName}
                  </Text>
                  {lastResult && (
                    <Text className="font-bold m-2">- درجتك: {lastResult}</Text>
                  )}
                </Box>
                <Box className="flex">
                  <Link
                    to={isTeacher ? `/teacher_exam/${examId}` : `/exam/${examId}`}
                    className="mx-1"
                  >
                    <Button colorScheme="green" variant="outline">
                      <RiLogoutBoxRFill />
                    </Button>
                  </Link>
                  {isTeacher && (
                    <Button colorScheme="red" className="mx-1" onClick={onDeleteExam}>
                      {Loading ? <Spinner /> : <MdOutlineDeleteOutline />}
                    </Button>
                  )}
                </Box>
              </Box>
            </Zoom>
          ) : (
            <Box className="text-center flex justify-center items-center my-3 h-[150px]">
              <Text className="font-bold flex">
                <FaClipboardCheck className="m-1 text-red-500 text-xl" />
                لا توجد امتحانات متاحة
              </Text>
            </Box>
          )}
        </TabPanel>
      </TabPanels>
    </Tabs>
  </Box>
);

export default LectureContent;