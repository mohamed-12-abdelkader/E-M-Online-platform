import React from "react";
import {
  Box,
  Text,
  Image,
  Flex,
  Container,
  Badge,
  useColorModeValue,
} from "@chakra-ui/react";
import { FaGraduationCap, FaBookOpen, FaUserGraduate } from "react-icons/fa";

const TeacherInfo = ({ teacher, number }) => {
  const bgGradient = useColorModeValue(
    "linear-gradient(135deg, rgba(26, 54, 93, 0.95) 0%, rgba(43, 108, 176, 0.95) 100%)",
    "linear-gradient(135deg, rgba(26, 32, 44, 0.95) 0%, rgba(45, 55, 72, 0.95) 100%)"
  );
  const cardBg = useColorModeValue("white", "gray.800");
  const textColor = useColorModeValue("gray.600", "gray.300");
  const headingColor = useColorModeValue("blue.600", "blue.200");
  const statBg = useColorModeValue("blue.50", "blue.900");

  return (
    <Box position='relative' className='mt-[80px]'>
      {/* Hero Section with Background Image and Gradient */}
      <Box position='relative' color='white' overflow='hidden'>
        {/* Background Image */}
        <Box
          position='absolute'
          top='0'
          left='0'
          right='0'
          bottom='0'
          bgImage="url('/2(5).png')"
          bgSize='cover'
          bgPosition='center'
          bgRepeat='no-repeat'
          filter='blur(2px)'
          className='px-5'
        />

        {/* Gradient Overlay */}
        <Box
          position='absolute'
          top='0'
          left='0'
          right='0'
          bottom='0'
          bg={bgGradient}
        />

        {/* Content */}
        <Container
          maxW='7xl'
          h='full'
          position='relative'
          className='h-[00px] teacher-info-cntainer'
          style={{ height: "400px" }}
        >
          <Flex
            direction={{ base: "column", md: "row" }}
            align='center'
            justify='space-between'
            h='full'
            py={8}
            gap={8}
            className='px-5'
          >
            {/* Teacher Info */}
            <Flex
              direction='column'
              align={{ base: "center", md: "start" }}
              flex='1'
            >
              <Text
                fontSize={{ base: "3xl", md: "4xl" }}
                fontWeight='bold'
                mb={4}
                textAlign={{ base: "center", md: "start" }}
              >
                {teacher.name}
              </Text>
              <Flex
                align='center'
                gap={2}
                bg='whiteAlpha.200'
                p={3}
                borderRadius='full'
                backdropFilter='blur(10px)'
              >
                <FaGraduationCap size={20} />
                <Text>مدرس {teacher.subject} للثانوية العامة</Text>
              </Flex>
            </Flex>

            {/* Teacher Image */}
            <Box
              position='relative'
              w={{ base: "200px", md: "300px" }}
              h={{ base: "200px", md: "300px" }}
            >
              <Box
                position='absolute'
                inset='0'
                borderRadius='full'
                border='4px solid'
                borderColor='whiteAlpha.300'
                transform='scale(1.1)'
              />
              <Box
                borderRadius='full'
                overflow='hidden'
                boxShadow='xl'
                border='4px solid white'
              >
                <Image
                  src={teacher.image}
                  alt={teacher.name}
                  objectFit='cover'
                  w='full'
                  h='full'
                />
              </Box>
            </Box>
          </Flex>
        </Container>

        {/* Wave Effect */}
        <Box
          position='absolute'
          bottom='-2px'
          left='0'
          right='0'
          height='120px'
          bgImage={`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1440 320'%3E%3Cpath fill='${encodeURIComponent(
            useColorModeValue("#f7fafc", "#1a202c")
          )}' d='M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,112C672,96,768,96,864,112C960,128,1056,160,1152,160C1248,160,1344,128,1392,112L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z'%3E%3C/path%3E%3C/svg%3E")`}
          bgSize='cover'
          bgRepeat='no-repeat'
        />
      </Box>

      {/* Stats Section */}
      <Container maxW='7xl' mt={8}>
        <Flex justify='center' gap={8} flexWrap='wrap'>
          <StatCard
            icon={<FaUserGraduate size={24} />}
            label='المادة'
            value={teacher.subject}
            bg={cardBg}
            textColor={textColor}
            headingColor={headingColor}
            statBg={statBg}
          />
          <StatCard
            icon={<FaBookOpen size={24} />}
            label='عدد الكورسات'
            value={number || 0}
            bg={cardBg}
            textColor={textColor}
            headingColor={headingColor}
            statBg={statBg}
          />
        </Flex>
      </Container>
    </Box>
  );
};

const StatCard = ({
  icon,
  label,
  value,
  bg,
  textColor,
  headingColor,
  statBg,
}) => (
  <Flex
    direction='column'
    align='center'
    p={6}
    minW='200px'
    bg={bg}
    borderRadius='2xl'
    boxShadow='lg'
    transition='all 0.3s'
    _hover={{
      transform: "translateY(-5px)",
      boxShadow: "xl",
    }}
  >
    <Box color={headingColor} bg={statBg} p={3} borderRadius='full' mb={4}>
      {icon}
    </Box>
    <Text color={textColor} fontSize='sm' mb={2}>
      {label}
    </Text>
    <Text fontSize='2xl' fontWeight='bold' color={headingColor}>
      {value}
    </Text>
  </Flex>
);

export default TeacherInfo;
