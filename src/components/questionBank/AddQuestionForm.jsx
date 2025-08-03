import React from "react";
import {
  Box,
  Heading,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Select,
  Button,
  VStack,
  useColorModeValue,
  Checkbox,
  Stack,
  NumberInput, NumberInputField, NumberInputStepper, NumberIncrementStepper, NumberDecrementStepper,
} from "@chakra-ui/react";

const AddQuestionForm = () => {
  const formBg = useColorModeValue("white", "gray.700");
  const labelColor = useColorModeValue("gray.700", "gray.300");
  const inputBorder = useColorModeValue("gray.300", "gray.600");

  return (
    <Box p={6} bg={formBg} borderRadius="lg" shadow="md" w="full" maxWidth="800px" mx="auto">
      <Heading as="h3" size="lg" mb={6} textAlign="center" color={labelColor}>
        إضافة سؤال جديد
      </Heading>
      <VStack spacing={4} align="stretch">
        <FormControl id="question-text" isRequired>
          <FormLabel color={labelColor}>نص السؤال</FormLabel>
          <Textarea
            placeholder="اكتب نص السؤال هنا..."
            rows={4}
            borderColor={inputBorder}
            _hover={{ borderColor: useColorModeValue("blue.400", "blue.300") }}
            _focus={{ borderColor: useColorModeValue("blue.500", "blue.400"), boxShadow: `0 0 0 1px ${useColorModeValue("blue.500", "blue.400")}` }}
            color={labelColor}
          />
        </FormControl>

        <FormControl id="question-type" isRequired>
          <FormLabel color={labelColor}>نوع السؤال</FormLabel>
          <Select
            placeholder="اختر نوع السؤال"
            borderColor={inputBorder}
            _hover={{ borderColor: useColorModeValue("blue.400", "blue.300") }}
            _focus={{ borderColor: useColorModeValue("blue.500", "blue.400"), boxShadow: `0 0 0 1px ${useColorModeValue("blue.500", "blue.400")}` }}
            color={labelColor}
          >
            <option value="multiple-choice">اختيار من متعدد</option>
            <option value="true-false">صح/خطأ</option>
            <option value="essay">مقالي</option>
          </Select>
        </FormControl>

        <FormControl id="category" isRequired>
          <FormLabel color={labelColor}>التصنيف</FormLabel>
          <Select
            placeholder="اختر التصنيف"
            borderColor={inputBorder}
            _hover={{ borderColor: useColorModeValue("blue.400", "blue.300") }}
            _focus={{ borderColor: useColorModeValue("blue.500", "blue.400"), boxShadow: `0 0 0 1px ${useColorModeValue("blue.500", "blue.400")}` }}
            color={labelColor}
          >
            <option value="math">الرياضيات</option>
            <option value="science">العلوم</option>
            <option value="arabic">اللغة العربية</option>
          </Select>
        </FormControl>

        <FormControl id="difficulty">
            <FormLabel color={labelColor}>مستوى الصعوبة</FormLabel>
            <NumberInput defaultValue={1} min={1} max={5} borderColor={inputBorder}>
                <NumberInputField borderColor={inputBorder} color={labelColor} />
                <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
                </NumberInputStepper>
            </NumberInput>
        </FormControl>

        <FormControl id="options">
          <FormLabel color={labelColor}>الخيارات (إن وجد)</FormLabel>
          <VStack spacing={2} align="stretch">
            <Input placeholder="الخيار الأول" borderColor={inputBorder} color={labelColor} />
            <Input placeholder="الخيار الثاني" borderColor={inputBorder} color={labelColor} />
            <Input placeholder="الخيار الثالث" borderColor={inputBorder} color={labelColor} />
            <Input placeholder="الخيار الرابع" borderColor={inputBorder} color={labelColor} />
          </VStack>
        </FormControl>

        <FormControl id="correct-answer">
          <FormLabel color={labelColor}>الإجابة الصحيحة</FormLabel>
          <Input
            placeholder="الإجابة الصحيحة (للسؤال المقالي أو الاختيار من متعدد)"
            borderColor={inputBorder}
            _hover={{ borderColor: useColorModeValue("blue.400", "blue.300") }}
            _focus={{ borderColor: useColorModeValue("blue.500", "blue.400"), boxShadow: `0 0 0 1px ${useColorModeValue("blue.500", "blue.400")}` }}
            color={labelColor}
          />
        </FormControl>

        <FormControl id="is-active">
          <Checkbox colorScheme="blue" defaultChecked color={labelColor}>
            تفعيل السؤال
          </Checkbox>
        </FormControl>

        <Button colorScheme="blue" size="lg" mt={4} w="full">
          حفظ السؤال
        </Button>
      </VStack>
    </Box>
  );
};

export default AddQuestionForm;