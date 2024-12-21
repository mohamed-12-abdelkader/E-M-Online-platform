import React, { useState } from "react";
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Radio,
  RadioGroup,
  Stack,
  Textarea,
  useToast,
} from "@chakra-ui/react";

const AddSubQuestions = () => {
  const [question, setQuestion] = useState("");
  const [choices, setChoices] = useState(["", "", "", ""]);
  const [correctAnswer, setCorrectAnswer] = useState("0");
  const [image, setImage] = useState(null);
  const toast = useToast();

  const handleChoiceChange = (value, index) => {
    const newChoices = [...choices];
    newChoices[index] = value;
    setChoices(newChoices);
  };

  const handleSubmit = () => {
    if (!question || choices.some((choice) => !choice)) {
      toast({
        title: "خطأ",
        description: "يرجى ملء جميع الحقول.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const formData = {
      question,
      choices,
      correctAnswer: parseInt(correctAnswer),
      image,
    };

    console.log("تم إرسال البيانات:", formData);

    toast({
      title: "تم الحفظ",
      description: "تم إضافة السؤال بنجاح.",
      status: "success",
      duration: 3000,
      isClosable: true,
    });

    // إعادة تعيين النموذج
    setQuestion("");
    setChoices(["", "", "", ""]);
    setCorrectAnswer("0");
    setImage(null);
  };

  return (
    <div className='my-[50px]'>
      <Box w='90%' maxW='600px' m='auto' p={5} boxShadow='lg' rounded='md'>
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
