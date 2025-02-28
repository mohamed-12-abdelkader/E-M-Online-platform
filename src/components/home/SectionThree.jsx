import { Box, Flex, Heading, Text, useColorModeValue, Image } from "@chakra-ui/react";
import img from "../../img/teacher.png";
const SectionThree = () => {
  const cardBg = useColorModeValue("#f1f0fe", "#2c2c2c");
  const cardBorder = useColorModeValue("gray.300", "gray.600");
  const textColor = useColorModeValue("gray.700", "white");
  const secondaryTextColor = useColorModeValue("gray.600", "gray.300");
  const iconBg = useColorModeValue("#03a9f5", "#03a9f5");
  return (
    <Box my='50px' mx='5'>
    <Flex justify='center' mb='70px'>
      {/* يمكنك إضافة عناصر إضافية هنا إذا لزم الأمر */}
    </Flex>
    <Flex
      w='100%'
      maxW='1200px'
      m='auto'
      flexWrap='wrap'
      justify='space-between'
      align='center'
      direction={{ base: "column", md: "row" }}
    >
         <div>
        <Image
          src={img}
          alt='طالب'
          borderRadius='lg'           
          width='100%'
          maxW='400px'
          height='auto'
          mx='auto'
        />
      </div>
      <Box flex='1' maxW={{ base: "100%", md: "50%" }} p='4'>
        <Heading
          as='h1'
          fontSize='3xl'
          fontWeight='bold'
          mb='5'
          color={textColor}
        >
          ابداء رحلتك  فى عالم الاونلاين مع{" "}
          <Text as='span' color='blue.500'>
            EM Online
          </Text>
        </Heading>
        <Box>
 

  {/* مزايا للمدرس */}
  <Box>
    
    <Text fontSize='lg' fontWeight='bold' mb='4' color={textColor}>
      🔒 <strong>محتواك مؤمن</strong> نضمن حماية حقوقك الفكرية ونحمي محتواك من النسخ غير المصرح به.
    </Text>
    <Text fontSize='lg' fontWeight='bold' mb='4' color={textColor}>
      📞 <strong>خدمة عملاء متخصصة</strong> لتلبية احتياجاتك وحل أي مشكلات تواجهك.
    </Text>
  
    <Text fontSize='lg' fontWeight='bold' mb='4' color={textColor}>
      📈 <strong>خطة مدروسة للنجاح</strong> نضع لك خطة استراتيجية لتحقيق النجاح في مجال التعليم الأونلاين.
    </Text>
    <Text fontSize='lg' fontWeight='bold' mb='4' color={textColor}>
      💼 <strong>فرص للربح</strong> نقدم لك فرصًا لزيادة دخلك من خلال دوراتك وورش العمل.
    </Text>
  </Box>
</Box>
      </Box>
   
    </Flex>
  </Box>
  );
};

export default SectionThree;
