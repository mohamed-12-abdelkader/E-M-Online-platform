import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { Box, Container, Tabs, TabList, TabPanels, Tab, TabPanel, Text, VStack } from "@chakra-ui/react";
import { useDisclosure } from "@chakra-ui/react";
import { FaBook, FaClipboardCheck, FaVideo } from "react-icons/fa";
import GitLecturMonth from "../../Hooks/teacher/GitLecturMonth";
import DeleateLecture from "../../Hooks/teacher/DeleateLecture";
import ScrollToTop from "../../components/scollToTop/ScrollToTop";
import UserType from "../../Hooks/auth/userType";
import MonthHeader from "../../components/month/MonthHeader";
import LectureList from "../../components/month/LectureList";
import LectureDialog from "../../components/month/LectureDialog";
import Loading from "../../components/loading/Loading";
import useGitStuSubs from "../../Hooks/teacher/useGitStuSubs";

const Month = () => {
  const { id } = useParams();
  const [months, monthLoading] = GitLecturMonth({ id });
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = React.useRef();
  const [selectedLecture, setSelectedLecture] = useState(null);
  const [deleteOnlineLoading, deleteLecture] = DeleateLecture({ m_id: id });
  const [userData, isAdmin, isTeacher, student] = UserType();
  const [usersLoading, users] = useGitStuSubs({ id: id });

  const handleDelete = () => {
    if (selectedLecture) {
      deleteLecture({ l_id: selectedLecture.id });
      onClose();
    }
  };

  if (monthLoading) {
    return <Loading />;
  }

  if (!months || !months.monthData) {
    return <div>خطأ في تحميل البيانات</div>;
  }

  return (
    <Box minH="100vh" pt={{ base: 20, md: 28 }} pb={10} mb="80px">
      <Container maxW="7xl">
        {months.monthData.image && (
          <MonthHeader
            image={months.monthData.image}
            description={months.monthData.description}
            noflecture={months.monthData.noflecture}
            users={users?.users || []}
            isTeacher={isTeacher}
          />
        )}

        <Box mt={8} borderRadius="xl" borderWidth="1px" p={6} shadow="sm">
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
                <FaBook style={{ marginRight: "8px" }} className="mx-2" />
                المحاضرات
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
                <FaClipboardCheck style={{ marginRight: "8px" }} className="mx-2" />
                الامتحانات الشاملة
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
                <FaVideo style={{ marginRight: "8px" }}  className="mx-2"/>
                البث المباشر
              </Tab>
            </TabList>

            <TabPanels>
              <TabPanel p={0}>
                <LectureList
                  lectures={months.monthcontent}
                  isTeacher={isTeacher}
                  onOpen={onOpen}
                  setSelectedLecture={setSelectedLecture}
                  monthLoading={monthLoading}
                  noflecture={months.monthData.noflecture}
                />
              </TabPanel>
              <TabPanel p={0}>
                <VStack spacing={4} align="stretch">
                  <Text fontSize="lg" fontWeight="bold">الامتحانات الشاملة</Text>
                  <Text color="gray.500">لا توجد امتحانات متاحة لهذا الشهر بعد.</Text>
                  {isTeacher && (
                    <Text color="blue.500" cursor="pointer">إضافة امتحان جديد</Text>
                  )}
                </VStack>
              </TabPanel>
              <TabPanel p={0}>
                <VStack spacing={4} align="stretch">
                  <Text fontSize="lg" fontWeight="bold">البث المباشر</Text>
                  <Text color="gray.500">لا توجد بثوث مباشرة مجدولة.</Text>
                  {isTeacher && (
                    <Text color="blue.500" cursor="pointer">جدولة بث مباشر جديد</Text>
                  )}
                </VStack>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </Box>

        <LectureDialog
          isOpen={isOpen}
          onClose={onClose}
          cancelRef={cancelRef}
          selectedLecture={selectedLecture}
          onDelete={handleDelete}
          deleteLoading={deleteOnlineLoading}
        />

        <ScrollToTop />
      </Container>
    </Box>
  );
};

export default Month;