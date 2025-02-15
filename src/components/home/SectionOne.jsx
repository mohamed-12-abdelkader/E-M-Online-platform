import React, { useState, useEffect } from "react";
import { Zoom } from "react-awesome-reveal";
import { Link } from "react-router-dom";
import UserType from "../../Hooks/auth/userType";
import { useColorMode, Box, Text, Button } from "@chakra-ui/react"; // إضافة Button
import { FaDownload } from "react-icons/fa"; // إضافة أيقونة تحميل
import img from "../../img/Red and Blue Badminton Team Sport Logo (7).png";

const SectionOne = () => {
  const [userData, isAdmin, isTeacher, student] = UserType();
  const [displayedName, setDisplayedName] = useState("");
  const [nameIndex, setNameIndex] = useState(0);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const { colorMode } = useColorMode(); // الحصول على الوضع الحالي (Dark أو Light)

  const name =
    "منصة متخصصة في جميع مواد الاعدادية و الثانوية العامة وكورسات الجامعات ";
  const description = "استمتع بدروس الثانوية العامة على دعم تعليمي";

  const messages = [
    "نقدم لك دعم تعليمى متميز ",
    "محاضرات باعلى جودة ",
    "منصة ثابتة وسريعة ",
    "امتحانات دورية مستمرة ",
  ];

  useEffect(() => {
    if (nameIndex < name.length) {
      const timer = setTimeout(() => {
        setDisplayedName(name.slice(0, nameIndex + 1));
        setNameIndex(nameIndex + 1);
      }, 100); // تحديد معدل السرعة بالميلي ثانية
      return () => clearTimeout(timer);
    }
  }, [name, nameIndex]);

  useEffect(() => {
    const messageTimer = setInterval(() => {
      setCurrentMessageIndex((prevIndex) => (prevIndex + 1) % messages.length);
    }, 2000); // تغيير الجملة كل 2 ثانية
    return () => clearInterval(messageTimer);
  }, []);

  return (
    <Box
      bg={colorMode === "dark" ? "#1A202C" : "#03a9f5"} // تحديد الخلفية حسب الوضع
      className='section_one relative overflow-hidden'
    >
      {/* النقاط الخلفية */}
      <Box
        className='absolute inset-0 bg-dots-pattern bg-dots opacity-10'
        bg={colorMode === "dark" ? "#2D3748" : "#03a9f5"} // تغيير اللون خلف النقاط
      ></Box>
      <Box className='relative z-10 py-20'>
        <div className='container mx-auto flex flex-col items-center'>
          {/* صورة الشعار */}
          <Zoom>
            <img
              src={"تصميم بدون عنوان (18).png"}
              alt='Logo'
              className='h-[300px] w-[300px] md:h-[350px] md:w-[350px]'
            />
          </Zoom>
          {/* نص متحرك */}
          <Text
            fontSize={["2xl", "3xl"]}
            color={colorMode === "dark" ? "white" : "black"} // تغيير اللون بناءً على الوضع
            fontWeight='bold'
            textAlign='center'
            mb={4}
          >
            {displayedName}
          </Text>
          {/* خط فاصل */}
          <div className='h-1 w-[150px] bg-[#ff6600] mb-6'></div>
          {/* حالة المستخدم */}
          {isTeacher ? (
            <Box display='flex' justifyContent='center'>
              <Text
                fontSize={["lg", "xl"]}
                color={colorMode === "dark" ? "white" : "gray.800"} // تغيير النص حسب الوضع
                fontWeight='medium'
              >
                {messages[currentMessageIndex]}
              </Text>
            </Box>
          ) : student ? (
            <Box className='flex flex-col items-center my-4'>
              <Text
                fontSize={["2xl", "3xl"]}
                color={colorMode === "dark" ? "white" : "black"}
                fontWeight='bold'
                textAlign='center'
                mb={4}
              >
                كود الطالب: {userData.id}
              </Text>
            </Box>
          ) : isAdmin ? (
            <Box display='flex' justifyContent='center'>
              <Text
                fontSize={["lg", "xl"]}
                color={colorMode === "dark" ? "white" : "gray.800"}
                fontWeight='medium'
              >
                مرحباً، يمكنك إدارة المنصة من هنا.
              </Text>
            </Box>
          ) : (
            <Box display='flex' spaceX={4}>
              <Link to='/login'>
                <img src='log in (1).png' className='h-[60px] w-[160px]' />
              </Link>
              <Link to='/signup'>
                <img src='signup2.png' className='h-[60px] w-[160px]' />
              </Link>
            </Box>
          )}

          {/* زر تحميل التطبيق */}
          <Button
            as='a'
            href='https://www.mediafire.com/file/f3afz741f5hohts/E-M+Online.apk/file'
            target='_blank'
            bg='#ff6600'
            color='white'
            _hover={{ bg: "#e65c00" }}
            fontSize='lg'
            px={6}
            py={8}
            borderRadius='md'
            mt={6}
            boxShadow='lg'
            rightIcon={<FaDownload />}
          >
            تحميل التطبيق
          </Button>
        </div>
      </Box>
    </Box>
  );
};

export default SectionOne;
