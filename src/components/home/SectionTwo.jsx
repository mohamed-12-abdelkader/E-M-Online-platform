import React from "react";
import { motion, useInView } from "framer-motion";
import { Box, Flex, Heading, Text, useColorModeValue, Icon } from "@chakra-ui/react";
import { FaRobot, FaChalkboardTeacher, FaTrophy, FaBook, FaRocket, FaStar } from "react-icons/fa";
import { BsFillBookFill, BsFillTrophyFill } from "react-icons/bs";

const SectionTwo = () => {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const bgGradient = useColorModeValue(
    "linear(to-br, #f0f4ff, #e5e8ff)",
    "linear(to-br, #1a202c, #2d3748)"
  );
  const cardBg = useColorModeValue("rgba(255, 255, 255, 0.9)", "rgba(45, 55, 72, 0.8)");
  const textColor = useColorModeValue("gray.900", "white");
  const descriptionColor = useColorModeValue("gray.600", "gray.400");

  const features = [
    {
      id: 1,
      name: "مسابقات يومية",
      description: "اختبر مهاراتك يوميًا من خلال تحديات تعليمية ممتعة.",
      icon: BsFillTrophyFill,
      color: "purple.500",
    },
    {
      id: 2,
      name: "امتحانات شهرية",
      description: "قم بتقييم مستواك عبر امتحانات شهرية متخصصة.",
      icon: BsFillBookFill,
      color: "blue.500",
    },
    {
      id: 3,
      name: "ذكاء اصطناعي",
      description: "استفد من أحدث تقنيات الذكاء الاصطناعي في التعليم.",
      icon: FaRobot,
      color: "green.500",
    },
    {
      id: 4,
      name: "أقوى المحاضرين",
      description: "تعلم من نخبة المحاضرين المتخصصين في مختلف المجالات.",
      icon: FaChalkboardTeacher,
      color: "orange.500",
    },
  ];
 const fadeInUp = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } },
  };
  return (
    <Box w="full" py={10} px={6} className="" textAlign="center">
      <motion.h1
              variants={fadeInUp}
              className="text-6xl my-3 text-orange-500 sm:text-5xl lg:text-7xl font-extrabold leading-tight">
        خدماتنا التعليمية 
      </motion.h1>
      <Text fontSize="lg" color="blue.500" mb={10}>
        اكتشف أفضل الدورات التعليمية والدروس الخاصة مع خبراء التعليم.
      </Text>

      <Flex wrap="wrap" justify="center" gap={8}>
        {features.map((service) => (
          <Box
            key={service.id}
            p={8}
            bg={cardBg}
            backdropFilter="blur(10px)"
            border="1px solid rgba(255, 255, 255, 0.18)"
            borderRadius="2xl"
            boxShadow="0 8px 30px rgba(0, 0, 0, 0.1)"
            transition="transform 0.4s ease, box-shadow 0.4s ease"
            _hover={{
              transform: "translateY(-10px)",
              boxShadow: "0 12px 50px rgba(0, 0, 0, 0.2)",
            }}
            w={{ base: "100%", sm: "45%", md: "22%" }}
          >
            <Flex justify="center" align="center" mb={6}>
              <Box
                bg={service.color}
                p={5}
                borderRadius="full"
                boxShadow="inset 0 0 10px rgba(0,0,0,0.1)"
                display="flex"
                alignItems="center"
                justifyContent="center"
                transition="all 0.4s"
                _hover={{ transform: "scale(1.1) rotate(10deg)" }}
              >
                <Icon as={service.icon} boxSize={10} color="white" />
              </Box>
            </Flex>
            <Heading fontSize="xl" fontWeight="bold" color="blue.500" mb={3}>
              {service.name}
            </Heading>
            <Text fontSize="md" color={descriptionColor}>
              {service.description}
            </Text>
          </Box>
        ))}
      </Flex>
    </Box>
  );
};

export default SectionTwo;
