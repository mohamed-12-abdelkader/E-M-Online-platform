import React from "react";
import {
  Box,
  Text,
  Image,
  Flex,
  Container,
  useColorModeValue,
  SlideFade,
  Icon,
  Heading,
  HStack,
} from "@chakra-ui/react";
import { FaGraduationCap, FaBookOpen, FaUserGraduate } from "react-icons/fa";

const TeacherInfo = ({ teacher, number }) => {
  const bgGradient = useColorModeValue(
    "linear-gradient(135deg, #2563EB, #1E3A8A)",
    "linear-gradient(135deg, #2D3748, #1A202C)"
  );
  const cardBg = useColorModeValue("white", "gray.800");
  const textColor = useColorModeValue("gray.600", "gray.300");
  const headingColor = useColorModeValue("blue.600", "blue.200");
  const statBg = useColorModeValue("blue.100", "gray.700");

  return (
    <Box position="relative" mt="80px">

 <div
  className="bg-blue-500 px-5" // هذا الـ div الخارجي قد لا يكون ضرورياً إذا كانت الـ section تغطي المساحة
>
  <section
    dir="rtl"
    className="relative flex flex-col h-[350px] md:flex-row items-center justify-between md: py-16 md:py-24 bg-gradient-to-br from-white via-blue-50 to-blue-400 "
    style={{
      fontFamily: "'Cairo', sans-serif",
  position:"relative",
      backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23f97316' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30v4h-4v2h4v4h2v-4h4v-2h-4v-4h-2zM6 34v4h4v2h-4v4h-2v-4h-4v-2h4v-4h2zM6 4v4h-4v2h4v4h2v-4h4v-2h-4v-4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
      backgroundAttachment: "fixed", // لجعل النمط يظهر ثابتًا
      backgroundRepeat: "repeat",
      backgroundSize: "auto", // أو يمكنك استخدام 'cover' حسب تأثير الـ SVG
    }}
  >
    {/* Contained content to keep things aligned */}
    <div
      className="container mx-auto flex flex-col md:flex-row items-center justify-between z-10"
      style={{ minHeight: "inherit" }}
    >
      {/* Course Info (Right Side in RTL) */}
      <div className="flex-1 text-center md:text-right mb-10 md:mb-0 md:ml-12 p-4">
        <Heading
                      fontSize={{ base: "3xl", md: "4xl" }}
                      fontWeight="bold"
                      textAlign={{ base: "center", md: "start" }}
                      mb={3}
                      color={"white"} // استخدام لون العنوان من Chakra UI
                    >
                      {teacher.name}
                    </Heading>
                    <h4  className="my-3 text-white font-bold">
                      {teacher.description}
                    </h4>
        <Flex
                    align="center"
                    gap={2}
                    bg="orange.500"
                    p={3}
                    px={5}
                    width={300}
                    borderRadius="full"
                    backdropFilter="(10px)"
                    mb={4} // إضافة مسافة أسفل اسم المحاضر
                  >
                    <Icon as={FaGraduationCap} size={18} color={headingColor} /> {/* استخدام لون العنوان للأيقونة */}
                    <Text fontSize="md" color={"white"}>
                      محاضر {teacher.subject}
                    </Text>
                  </Flex>
             
                  <Flex
                   width={300}
                    align="center"
                    gap={2}
                    bg="orange.500"
                    p={3}
                    px={5}
                    borderRadius="full"
                    backdropFilter="(10px)"
                    mb={4} // إضافة مسافة أسفل اسم المحاضر
                  >
                    <Icon as={FaBookOpen} size={18} color={headingColor} /> {/* استخدام لون العنوان للأيقونة */}
                    <Text fontSize="md" color={"white"}>
                      عدد الكورسات:  {number || 0}
                    </Text>
                  </Flex>
            
        
      </div>

      {/* Image Container (Left Side in RTL) */}
      
    </div>
    <div className=" flex-1 px-3 flex justify-center md:justify-start mt-10 md:mt-0 p-4">
        {/* الصورة الأساسية */}
       <img
    src={teacher.avatar}
  alt="Course Instructor"
  className="rounded-3xl shadow-2xl w-[350px] max-h-[300px] md:left-0 max-w-[400px] max-h-[400px]"
  style={{
    border: "6px solid white",
    outline: "6px solid #60A5FA",
    objectFit: "cover",
    objectPosition: "center",
    
    background: "#fff",
    position:"absolute"
  }}
/>

        {/* عنصر زخرفي إضافي خلف الصورة لإضافة عمق */}
     
      </div>
  </section>

    </div>

<div className="h-[200px] px-8">
  
</div>

    

    
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
    direction="column"
    align="center"
    p={6}
    minW="220px"
    bg={bg}
    borderRadius="2xl"
    boxShadow="lg"
    transition="all 0.3s ease"
    _hover={{
      transform: "translateY(-8px)",
      boxShadow: "2xl",
    }}
  >
    <Box color={headingColor} bg={statBg} p={3} borderRadius="full" mb={4}>
      {icon}
    </Box>
    <Text color={textColor} fontSize="sm" mb={1}>
      {label}
    </Text>
    <Text fontSize="2xl" fontWeight="bold" color={headingColor}>
      {value}
    </Text>
  </Flex>
);

export default TeacherInfo;