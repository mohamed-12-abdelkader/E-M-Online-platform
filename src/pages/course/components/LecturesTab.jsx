import React from "react";
import { VStack, Flex, Heading, Button, Icon } from "@chakra-ui/react";
import { FaPlus } from "react-icons/fa";
import LectureCard from "./LectureCard";

const LecturesTab = ({
  lectures,
  isTeacher,
  isAdmin,
  expandedLecture,
  setExpandedLecture,
  handleAddLecture,
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
  formatDate,
  onAddBulkQuestions,
  handleOpenVideo
}) => (
  <VStack spacing={{ base: 3, md: 4 }} align="stretch" className="">
    <Flex 
      justify="space-between" 
      align="center" 
      mb={{ base: 2, md: 4 }}
      direction={{ base: 'column', sm: 'row' }}
      gap={{ base: 2, sm: 0 }}
    >
      <Heading size={{ base: 'sm', md: 'md' }} color={headingColor}>
        محاضرات الكورس ({lectures.length})
      </Heading>
      {isTeacher && (
        <Button
          size={{ base: 'sm', md: 'md' }}
          colorScheme="green"
          leftIcon={<Icon as={FaPlus} />}
          borderRadius="full"
          onClick={handleAddLecture}
          w={{ base: '100%', sm: 'auto' }}
        >
          إضافة محاضرة
        </Button>
      )}
    </Flex>
    {lectures.map((lecture, index) => {
      const isLocked = lecture.locked;
      const canExpand = !isLocked || isTeacher || isAdmin;
      const isExpanded = expandedLecture === lecture.id && canExpand;
      return (
        <LectureCard
          key={lecture.id}
          lecture={lecture}
          isTeacher={isTeacher}
          isAdmin={isAdmin}
          expandedLecture={expandedLecture}
          setExpandedLecture={setExpandedLecture}
          handleEditLecture={handleEditLecture}
          handleDeleteLecture={handleDeleteLecture}
          handleAddVideo={handleAddVideo}
          handleEditVideo={handleEditVideo}
          handleDeleteVideo={handleDeleteVideo}
          handleAddFile={handleAddFile}
          handleEditFile={handleEditFile}
          handleDeleteFile={handleDeleteFile}
          setExamModal={setExamModal}
          setDeleteExamDialog={setDeleteExamDialog}
          examActionLoading={examActionLoading}
          itemBg={itemBg}
          sectionBg={sectionBg}
          headingColor={headingColor}
          subTextColor={subTextColor}
          borderColor={borderColor}
          dividerColor={dividerColor}
          textColor={textColor}
          canExpand={canExpand}
          isExpanded={isExpanded}
          formatDate={formatDate}
          onAddBulkQuestions={onAddBulkQuestions}
          handleOpenVideo={handleOpenVideo}
        />
      );
    })}
  </VStack>
);

export default LecturesTab; 