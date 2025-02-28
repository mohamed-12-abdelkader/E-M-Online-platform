import { Box, Flex, Heading, Text, useColorModeValue, Image } from "@chakra-ui/react";
import img from "../../img/طالب 2.png";

const SectionTwo = () => {
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
        <Box flex='1' maxW={{ base: "100%", md: "50%" }} p='4'>
          <Heading
            as='h1'
            fontSize='3xl'
            fontWeight='bold'
            mb='5'
            color={textColor}
          >
            ابداء رحلتك التعليمية مع{" "}
            <Text as='span' color='blue.500'>
              EM Online
            </Text>
          </Heading>
          <Box>
            <Text fontSize='lg' fontWeight='bold' mb='4' color={textColor}>
              🚀 <strong>أول منصة تعليمية تدعم الذكاء الاصطناعي (AI)</strong> لتوفير تجربة تعليمية ذكية ومخصصة لكل طالب.
            </Text>
            <Text fontSize='lg' fontWeight='bold' mb='4' color={textColor}>
              🏆 <strong>مسابقات يومية دورية</strong> لاختبار مهارات الطلاب وتحفيزهم على التفوق.
            </Text>
            <Text fontSize='lg' fontWeight='bold' mb='4' color={textColor}>
              🎖️ <strong>تكريم الأوائل</strong> بجوائز وشهادات تقدير لتحفيز روح التميز والتفوق.
            </Text>
            <Text fontSize='lg' fontWeight='bold' mb='4' color={textColor}>
              📅 <strong>امتحانات شهرية على مستوى الجمهورية</strong> لتقييم المستوى ومتابعة التقدم الدراسي.
            </Text>
            <Text fontSize='lg' fontWeight='bold' mb='4' color={textColor}>
              💡 <strong>دروس تفاعلية ومتابعة شخصية</strong> مع أفضل المعلمين لضمان استيعاب أفضل.
            </Text>
          </Box>
        </Box>
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
      </Flex>
    </Box>
  );
};

export default SectionTwo;