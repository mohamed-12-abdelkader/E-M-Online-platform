import { Box, Flex, Heading, Text, useColorModeValue } from "@chakra-ui/react";
import { PiExamLight } from "react-icons/pi";
import { GiTeacher, GiBookmarklet } from "react-icons/gi";
import { Zoom } from "react-awesome-reveal";

const SectionTwo = () => {
  const cardBg = useColorModeValue("#f1f0fe", "#2c2c2c");
  const cardBorder = useColorModeValue("gray.300", "gray.600");
  const textColor = useColorModeValue("gray.700", "white");
  const secondaryTextColor = useColorModeValue("gray.600", "gray.300");
  const iconBg = useColorModeValue("#03a9f5", "#03a9f5");

  return (
    <Box my='50px' mx='5'>
      <Flex justify='center' mb='70px'>
        <Heading
          as='h1'
          fontSize={{ base: "3xl", md: "50px" }}
          color={textColor}
          fontWeight='bold'
          textAlign='center'
        >
          ماذا نقدم ؟
        </Heading>
      </Flex>
      <Flex
        w='90%'
        m='auto'
        flexWrap='wrap'
        justify='space-between'
        align='center'
      >
        <Zoom>
          <Box
            h='320px'
            w='270px'
            bg={cardBg}
            border='1px solid'
            borderColor={cardBorder}
            borderRadius='20px'
            shadow='md'
            position='relative'
            my='40px'
          >
            <Flex
              bg={iconBg}
              h='120px'
              w='120px'
              borderRadius='full'
              position='absolute'
              top='-15%'
              right='-10%'
              justify='center'
              align='center'
            >
              <PiExamLight className='text-white text-5xl' />
            </Flex>
            <Box mt='80px' p='2'>
              <Heading
                as='h2'
                fontSize='xl'
                color={textColor}
                fontWeight='bold'
              >
                - امتحانات دورية ومستمرة
              </Heading>
              <Text mt='30px' color={secondaryTextColor} fontWeight='bold'>
                اختبر مستواك من خلال امتحانات دورية مستمرة على كل كورس او على كل
                محاضرة
              </Text>
            </Box>
          </Box>
        </Zoom>

        <Zoom>
          <Box
            h='320px'
            w='270px'
            bg={cardBg}
            border='1px solid'
            borderColor={cardBorder}
            borderRadius='20px'
            shadow='md'
            position='relative'
            my='40px'
          >
            <Flex
              bg={iconBg}
              h='120px'
              w='120px'
              borderRadius='full'
              position='absolute'
              top='-15%'
              right='-10%'
              justify='center'
              align='center'
            >
              <GiTeacher className='text-white text-5xl' />
            </Flex>
            <Box mt='80px' p='2'>
              <Heading
                as='h2'
                fontSize='xl'
                color={textColor}
                fontWeight='bold'
              >
                - نخبة من اكفاء المدرسين
              </Heading>
              <Text mt='30px' color={secondaryTextColor} fontWeight='bold'>
                المنصة بتوفرلك مجموعة من اكفاء وافضل المدرسين على مستوى
                الجمهورية فى كل مواد الثانوية العامة
              </Text>
            </Box>
          </Box>
        </Zoom>

        <Zoom>
          <Box
            h='320px'
            w='270px'
            bg={cardBg}
            border='1px solid'
            borderColor={cardBorder}
            borderRadius='20px'
            shadow='md'
            position='relative'
            my='40px'
          >
            <Flex
              bg={iconBg}
              h='120px'
              w='120px'
              borderRadius='full'
              position='absolute'
              top='-15%'
              right='-10%'
              justify='center'
              align='center'
            >
              <GiBookmarklet className='text-white text-5xl' />
            </Flex>
            <Box mt='80px' p='2'>
              <Heading
                as='h2'
                fontSize='xl'
                color={textColor}
                fontWeight='bold'
              >
                - كتب و pdf لكل المواد
              </Heading>
              <Text mt='30px' color={secondaryTextColor} fontWeight='bold'>
                متاح لكل محاضرة ال pdf الخاص بها او تقدر تطلب الكتاب الخاص
                بالمدرس وهيجيلك شحن لحد البيت
              </Text>
            </Box>
          </Box>
        </Zoom>
      </Flex>
    </Box>
  );
};

export default SectionTwo;
