import React from "react";
import {
  Box,
  Heading,
  FormControl,
  FormLabel,
  Input,
  Button,
  VStack,
  HStack,
  Select,
} from "@chakra-ui/react";
import useCreateExam from "../../Hooks/admin/mangeExam/useCreateExam";

const CreateExams = () => {
  const {
    handleImagesChange,
    handleSubmit,
    loading,
    name,
    setName,
    grad_id,
    setGrad_id,
    price,
    setPrice,
    start_at,
    setStart_at,
    end_at,
    setEnd_at,
  } = useCreateExam();

  return (
    <Box
      w={["90%", "90%", "90%"]}
      m='auto'
      mt={10}
      p={8}
      borderWidth={1}
      borderRadius='md'
      boxShadow='md'
    >
      <Heading size='lg' mb={5} color='blue.500' textAlign='center'>
        إنشاء امتحان جديد
      </Heading>
      <form onSubmit={handleSubmit}>
        <VStack spacing={4}>
          {/* اسم الامتحان */}
          <FormControl isRequired>
            <FormLabel>اسم الامتحان</FormLabel>
            <Input
              type='text'
              placeholder='أدخل اسم الامتحان'
              name='name'
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </FormControl>

          {/* السعر */}
          <FormControl isRequired>
            <FormLabel>السعر</FormLabel>
            <Input
              type='number'
              placeholder='أدخل السعر'
              name='price'
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
          </FormControl>

          {/* اختيار الصف */}
          <FormControl>
            <FormLabel>اختر الصف</FormLabel>
            <Select
              placeholder='اختر الصف'
              value={grad_id}
              onChange={(e) => setGrad_id(e.target.value)}
              dir='ltr'
            >
              <option value='1'>الصف الأول الثانوي</option>
              <option value='2'>الصف الثاني الثانوي</option>
              <option value='3'>الصف الثالث الثانوي</option>
            </Select>
          </FormControl>

          {/* صورة الامتحان */}
          <FormControl>
            <FormLabel>صورة الامتحان</FormLabel>
            <Input
              type='file'
              accept='image/*'
              onChange={(e) => handleImagesChange(Array.from(e.target.files))}
            />
          </FormControl>

          {/* تاريخ البدء والانتهاء */}
          <HStack w='100%'>
            <FormControl isRequired>
              <FormLabel>تاريخ البدء</FormLabel>
              <Input
                value={start_at}
                onChange={(e) => setStart_at(e.target.value)}
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel>تاريخ الانتهاء</FormLabel>
              <Input
                value={end_at}
                onChange={(e) => setEnd_at(e.target.value)}
              />
            </FormControl>
          </HStack>

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

export default CreateExams;
