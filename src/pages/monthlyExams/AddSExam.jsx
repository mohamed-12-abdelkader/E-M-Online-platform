import React, { useState, useEffect } from "react";
import {
  Box,
  Heading,
  FormControl,
  FormLabel,
  Input,
  Button,
  VStack,
  Select,
} from "@chakra-ui/react";
import useGitAllExams from "../../Hooks/admin/mangeExam/useGitAllExams";
import useAddSubExams from "../../Hooks/admin/mangeExam/useAddSubExams";

const AddSExam = () => {
  const [examsLoading, exams, refetchExam] = useGitAllExams(); // البيانات التي تحتوي على الامتحانات
  const [selectedGrade, setSelectedGrade] = useState(""); // الحالة لإدارة الصف المختار
  const [filteredExams, setFilteredExams] = useState([]); // الحالة لإدارة الامتحانات التي تطابق الصف المختار

  const {
    handleImagesChange,
    handleSubmit,
    loading,
    settitle,
    title,
    setCollection_id,
    description,
    setdescription,
  } = useAddSubExams();

  // تحديث قائمة الامتحانات بناءً على الصف المختار
  useEffect(() => {
    if (exams && selectedGrade) {
      const filtered = exams.filter(
        (exam) => exam.grad_id === parseInt(selectedGrade)
      );
      setFilteredExams(filtered);
    } else {
      setFilteredExams([]); // إعادة تعيين الامتحانات إذا لم يتم اختيار الصف
    }
  }, [selectedGrade, exams]);

  // التعامل مع تغيير الصف
  const handleGradeChange = (e) => {
    const gradeId = e.target.value;
    setSelectedGrade(gradeId);
    setCollection_id(gradeId); // تحديث قيمة grad_id في الـ hook
  };

  return (
    <Box
      w={["90%", "90%", "70%"]}
      m='auto'
      mt={10}
      p={8}
      borderWidth={1}
      borderRadius='md'
      boxShadow='md'
    >
      <Heading size='lg' mb={5} color='blue.500' textAlign='center'>
        اضافة امتحان المادة
      </Heading>
      <form onSubmit={handleSubmit}>
        <VStack spacing={4}>
          {/* اسم الامتحان */}
          <FormControl isRequired>
            <FormLabel>اسم الامتحان</FormLabel>
            <Input
              type='text'
              placeholder='أدخل اسم الامتحان'
              value={title}
              onChange={(e) => settitle(e.target.value)}
            />
          </FormControl>

          {/* وصف الامتحان */}
          <FormControl isRequired>
            <FormLabel>وصف الامتحان</FormLabel>
            <Input
              type='text'
              placeholder='أدخل وصف الامتحان'
              value={description}
              onChange={(e) => setdescription(e.target.value)}
            />
          </FormControl>

          {/* اختيار الصف */}
          <FormControl isRequired>
            <FormLabel>اختر الصف</FormLabel>
            <Select
              placeholder='اختر الصف'
              value={selectedGrade}
              onChange={handleGradeChange}
            >
              <option value='1'>الصف الأول الثانوي</option>
              <option value='2'>الصف الثاني الثانوي</option>
              <option value='3'>الصف الثالث الثانوي</option>
            </Select>
          </FormControl>

          {/* اختيار الامتحان بناءً على الصف */}
          {selectedGrade && (
            <FormControl isRequired>
              <FormLabel>اختر الامتحان</FormLabel>
              <Select
                placeholder='اختر الامتحان'
                onChange={(e) => setCollection_id(e.target.value)}
              >
                {filteredExams.length > 0 ? (
                  filteredExams.map((exam) => (
                    <option key={exam.id} value={exam.id}>
                      {exam.name}
                    </option>
                  ))
                ) : (
                  <option disabled>لا توجد امتحانات لهذا الصف</option>
                )}
              </Select>
            </FormControl>
          )}

          {/* صورة الامتحان */}
          <FormControl>
            <FormLabel>صورة الامتحان</FormLabel>
            <Input
              type='file'
              accept='image/*'
              multiple
              onChange={(e) => handleImagesChange(Array.from(e.target.files))}
            />
          </FormControl>

          {/* زر الإرسال */}
          <Button
            type='submit'
            colorScheme='blue'
            size='md'
            w='100%'
            mt={4}
            isLoading={loading}
            loadingText='جاري الإرسال'
          >
            إنشاء الامتحان
          </Button>
        </VStack>
      </form>
    </Box>
  );
};

export default AddSExam;
