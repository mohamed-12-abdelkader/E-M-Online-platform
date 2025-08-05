import ScrollToTop from "../../components/scollToTop/ScrollToTop";
import Lectures from "../../components/lecture/Lectures";
import { Box, useColorModeValue } from "@chakra-ui/react";

const MyLecture = () => {
  const bgGradient = useColorModeValue(
    "linear(to-br, blue.50, purple.50, pink.50)",
    "linear(to-br, gray.900, blue.900, purple.900)"
  );

  return (
    <Box 
      minH="100vh" 
      bgGradient={bgGradient}
      pt={{ base: "60px", sm: "70px", md: "80px" }}
      pb={{ base: "80px", sm: "90px", md: "100px" }}
      position="relative"
      overflow="hidden"
      px={{ base: 2, sm: 4, md: 6 }}
      w="100%"
      style={{ width: '100% !important' }}
    >
      {/* Background decorative elements */}
      <Box
        position="absolute"
        top="10%"
        left="5%"
        w={{ base: "100px", sm: "150px", md: "200px" }}
        h={{ base: "100px", sm: "150px", md: "200px" }}
        bg="blue.200"
        borderRadius="full"
        opacity="0.1"
        filter="blur(40px)"
        animation="float 6s ease-in-out infinite"
      />
      <Box
        position="absolute"
        top="20%"
        right="10%"
        w={{ base: "80px", sm: "120px", md: "150px" }}
        h={{ base: "80px", sm: "120px", md: "150px" }}
        bg="purple.200"
        borderRadius="full"
        opacity="0.1"
        filter="blur(30px)"
        animation="float 8s ease-in-out infinite reverse"
      />
      <Box
        position="absolute"
        bottom="20%"
        left="15%"
        w={{ base: "60px", sm: "80px", md: "100px" }}
        h={{ base: "60px", sm: "80px", md: "100px" }}
        bg="pink.200"
        borderRadius="full"
        opacity="0.1"
        filter="blur(25px)"
        animation="float 7s ease-in-out infinite"
      />

      <Box position="relative" zIndex={1}>
        <Lectures />
      </Box>
      
      <ScrollToTop />

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }
      `}</style>
    </Box>
  );
};

export default MyLecture;
