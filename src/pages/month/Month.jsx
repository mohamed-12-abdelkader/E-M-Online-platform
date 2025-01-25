import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { Box, Container, useColorModeValue } from "@chakra-ui/react";
import { useDisclosure } from "@chakra-ui/react";
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
  const bgColor = useColorModeValue("gray.50", "gray.900");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  {
    usersLoading ? console.log("loading") : console.log(users.users);
  }
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
    return <div>Error loading data</div>;
  }

  return (
    <Box bg={bgColor} minH='100vh' pt={{ base: 20, md: 28 }} pb={10}>
      <Container maxW='7xl'>
        {months.monthData.image && (
          <MonthHeader
            image={months.monthData.image}
            description={months.monthData.description}
            noflecture={months.monthData.noflecture}
            users={users?.users || []}
            isTeacher={isTeacher}
          />
        )}

        <Box
          mt={8}
          bg={useColorModeValue("white", "gray.800")}
          borderRadius='xl'
          borderWidth='1px'
          borderColor={borderColor}
          p={6}
          shadow='sm'
        >
          <LectureList
            lectures={months.monthcontent}
            isTeacher={isTeacher}
            onOpen={onOpen}
            setSelectedLecture={setSelectedLecture}
            monthLoading={monthLoading}
            noflecture={months.monthData.noflecture}
          />
        </Box>
      </Container>

      <LectureDialog
        isOpen={isOpen}
        onClose={onClose}
        cancelRef={cancelRef}
        selectedLecture={selectedLecture}
        onDelete={handleDelete}
        deleteLoading={deleteOnlineLoading}
      />

      <ScrollToTop />
    </Box>
  );
};

export default Month;
