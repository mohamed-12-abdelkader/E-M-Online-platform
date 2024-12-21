import React from "react";
import { Box, Text, Image, Flex } from "@chakra-ui/react";

const TeacherProfile = ({ teacher }) => {
  return (
    <Box
      position='relative'
      bg='blue.500'
      color='white'
      h='250px'
      w='full'
      borderRadius='lg'
      overflow='visible' // للسماح بخروج الصورة
      shadow='md'
    >
      {/* النصوص في الجزء العلوي */}
      <Flex
        direction='column'
        align='center'
        justify='center'
        h='60%'
        textAlign='center'
        p={4}
      >
        <h1 fontSize='2xl' fontWeight='bold' className='big-font text-xl'>
          E-M Online
        </h1>
        <Text fontSize='2xl' fontWeight='bold'>
          {teacher.name}
        </Text>
        <Text fontSize='lg' mt={2} className='font-bold'>
          مدرس ال{teacher.subject} للثانوية العامة
        </Text>
      </Flex>

      {/* صورة المدرس */}
      <Box
        position='absolute'
        top='250px' // وضع الصورة بحيث يكون نصفها خارج الـ div
        transform='translate(-50%, -50%)'
        borderRadius='full'
        border='5px solid white'
        overflow='hidden'
        bg='white'
        shadow='lg'
        className='h-[250px] w-[250px] left-[50%] md:h-[300px] md:w-[300px] md:left-[80%]'
      >
        <Image
          src={teacher.image}
          alt={teacher.name}
          objectFit='cover'
          w='full'
          h='full'
        />
      </Box>

      {/* النصوص أسفل الصورة */}
    </Box>
  );
};

export default TeacherProfile;
