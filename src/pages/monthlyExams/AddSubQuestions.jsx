import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Radio,
  RadioGroup,
  Select,
  Stack,
  Textarea,
  useToast,
} from "@chakra-ui/react";
import useGitAllExams from "../../Hooks/admin/mangeExam/useGitAllExams";

const AddSubQuestions = () => {
  const [question, setQuestion] = useState("");
  const [choices, setChoices] = useState(["", "", "", ""]);
  const [correctAnswer, setCorrectAnswer] = useState("0");
  const [image, setImage] = useState(null);
  const [examsLoading, exams, refetchExam] = useGitAllExams(); // البيانات التي تحتوي على الامتحانات
  const [selectedGrade, setSelectedGrade] = useState(""); // الحالة لإدارة الصف المختار
  const [filteredExams, setFilteredExams] = useState([]);
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
  const handleChoiceChange = (value, index) => {
    const newChoices = [...choices];
    newChoices[index] = value;
    setChoices(newChoices);
  };

  const handleSubmit = () => {};

  return (
    <div className='my-[50px]'>
      <Box w='90%' maxW='600px' m='auto' p={5} boxShadow='lg' rounded='md'>
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
        <FormControl mb={4}>
          <FormLabel>نص السؤال</FormLabel>
          <Textarea
            placeholder='أدخل نص السؤال'
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
          />
        </FormControl>

        {choices.map((choice, index) => (
          <FormControl key={index} mb={4}>
            <FormLabel>الاختيار {index + 1}</FormLabel>
            <Input
              placeholder={`الاختيار ${index + 1}`}
              value={choice}
              onChange={(e) => handleChoiceChange(e.target.value, index)}
            />
          </FormControl>
        ))}

        <FormControl mb={4}>
          <FormLabel>الاختيار الصحيح</FormLabel>
          <RadioGroup
            onChange={setCorrectAnswer}
            value={correctAnswer}
            name='correctAnswer'
          >
            <Stack direction='row'>
              {choices.map((_, index) => (
                <Radio key={index} value={index.toString()}>
                  {`الاختيار ${index + 1}`}
                </Radio>
              ))}
            </Stack>
          </RadioGroup>
        </FormControl>

        <FormControl mb={4}>
          <FormLabel>إضافة صورة</FormLabel>
          <Input
            type='file'
            accept='image/*'
            onChange={(e) => setImage(e.target.files[0])}
          />
        </FormControl>

        <Button colorScheme='blue' w='full' onClick={handleSubmit}>
          حفظ
        </Button>
      </Box>
    </div>
  );
};

export default AddSubQuestions;
