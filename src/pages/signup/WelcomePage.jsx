import React from 'react';
import { Box, Button, Text, VStack, HStack, Icon, useColorModeValue } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { FiUser, FiLogIn, FiStar, FiBookOpen, FiUsers, FiAward } from 'react-icons/fi';
import { Link, useNavigate } from 'react-router-dom';

const MotionBox = motion(Box);
const MotionButton = motion(Button);

const WelcomePage = () => {
  const navigate = useNavigate();
  const bgGradient = useColorModeValue(
    'linear(to-br, blue.50, indigo.100, purple.50)',
    'linear(to-br, gray.800, gray.900, blue.900)'
  );

  const handleNewUser = () => {
    navigate('/signup');
  };

  const handleExistingUser = () => {
    navigate('/login');
  };

  return (
    <Box
    className='mt-[100px]'
      minH="100vh"
      bgGradient={bgGradient}
      display="flex"
      alignItems="center"
      justifyContent="center"
      p={4}
      position="relative"
      overflow="hidden"
    >
      {/* Background Pattern */}
      <Box
        position="absolute"
        top="0"
        left="0"
        right="0"
        bottom="0"
        opacity="0.1"
        backgroundImage="url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%239C92AC%22%20fill-opacity%3D%220.4%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%224%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')"
      />

      <MotionBox
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        maxW="4xl"
        w="full"
        textAlign="center"
        position="relative"
        zIndex="1"
      >
        {/* Main Content Card */}
        <MotionBox
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          bg="white"
          borderRadius="3xl"
          p={{ base: 8, md: 12 }}
          boxShadow="0 25px 50px rgba(0, 0, 0, 0.15)"
          border="1px solid"
          borderColor="whiteAlpha.200"
          backdropFilter="blur(10px)"
          position="relative"
          overflow="hidden"
        >
          {/* Decorative Elements */}
          <Box
            position="absolute"
            top="-50px"
            right="-50px"
            w="100px"
            h="100px"
            bgGradient="linear(to-br, blue.400, purple.500)"
            borderRadius="full"
            opacity="0.1"
          />
          <Box
            position="absolute"
            bottom="-30px"
            left="-30px"
            w="60px"
            h="60px"
            bgGradient="linear(to-br, pink.400, red.500)"
            borderRadius="full"
            opacity="0.1"
          />

          {/* Welcome Content */}
          <VStack spacing={8} align="center">
            {/* Logo/Icon */}
            <MotionBox
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.4, type: "spring", stiffness: 200 }}
              w="120px"
              h="120px"
              bgGradient="linear(135deg, #667eea 0%, #764ba2 100%)"
              borderRadius="full"
              display="flex"
              alignItems="center"
              justifyContent="center"
              boxShadow="0 20px 40px rgba(102, 126, 234, 0.3)"
            >
              <Icon as={FiBookOpen} w="60px" h="60px" color="white" />
            </MotionBox>

            {/* Welcome Text */}
            <VStack spacing={4}>
              <MotionBox
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
              >
                <Text
                  fontSize={{ base: "3xl", md: "4xl", lg: "5xl" }}
                  fontWeight="bold"
                  bgGradient="linear(135deg, #667eea 0%, #764ba2 100%)"
                  bgClip="text"
                  mb={4}
                >
                  مرحباً بك في منصتنا التعليمية
                </Text>
                <Text
                  fontSize={{ base: "lg", md: "xl" }}
                  color="gray.600"
                  maxW="600px"
                  lineHeight="1.6"
                >
                  إذا كنت قد أنشأت حساب من قبل، قم بتسجيل الدخول. إذا لم تكن قد أنشأت حساب من قبل، قم بإنشاء حساب جديد.
                </Text>
              </MotionBox>
            </VStack>

            {/* Features */}
           

            {/* Simple Action Buttons */}
            <MotionBox
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1 }}
              w="full"
              maxW="500px"
            >
              <VStack spacing={6}>
                {/* Simple Question */}
                <Text fontSize="2xl" fontWeight="bold" color="gray.800" mb={4}>
                  هل لديك حساب من قبل؟
                </Text>
                
                {/* Two Simple Buttons */}
                <VStack spacing={4} w="full">
                  {/* Yes - Login Button */}
                  <MotionButton
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    size="lg"
                    w="full"
                    h="60px"
                    bgGradient="linear(135deg, #10b981 0%, #059669 100%)"
                    color="white"
                    _hover={{
                      bgGradient: "linear(135deg, #059669 0%, #047857 100%)",
                      boxShadow: "0 10px 25px rgba(16, 185, 129, 0.4)"
                    }}
                    borderRadius="xl"
                    fontSize="lg"
                    fontWeight="bold"
                    leftIcon={<Icon as={FiLogIn} />}
                    onClick={handleExistingUser}
                    boxShadow="0 8px 20px rgba(16, 185, 129, 0.3)"
                    transition="all 0.3s ease"
                  >
                    نعم، لدي حساب - تسجيل الدخول
                  </MotionButton>

                  {/* No - Signup Button */}
                  <MotionButton
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    size="lg"
                    w="full"
                    h="60px"
                    bgGradient="linear(135deg, #667eea 0%, #764ba2 100%)"
                    color="white"
                    _hover={{
                      bgGradient: "linear(135deg, #5a6fd8 0%, #6a4190 100%)",
                      boxShadow: "0 10px 25px rgba(102, 126, 234, 0.4)"
                    }}
                    borderRadius="xl"
                    fontSize="lg"
                    fontWeight="bold"
                    leftIcon={<Icon as={FiUser} />}
                    onClick={handleNewUser}
                    boxShadow="0 8px 20px rgba(102, 126, 234, 0.3)"
                    transition="all 0.3s ease"
                  >
                    لا، أنا جديد - إنشاء حساب
                  </MotionButton>
                </VStack>

                {/* Simple Help Text */}
                <Box
                  bg="blue.50"
                  borderRadius="lg"
                  p={4}
                  border="1px solid"
                  borderColor="blue.200"
                >
                  <Text fontSize="sm" color="blue.700" textAlign="center">
                    💡 <strong>غير متأكد؟</strong> جرب "تسجيل الدخول" أولاً. إذا لم يكن لديك حساب، سنوجهك لإنشاء حساب جديد.
                  </Text>
                </Box>

                {/* Additional Info */}
                <Text fontSize="sm" color="gray.500" textAlign="center">
                  انضم إلى أكثر من 10,000 طالب وطالبة
                </Text>
              </VStack>
            </MotionBox>
          </VStack>
        </MotionBox>

        {/* Bottom Features */}
        <MotionBox
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.2 }}
          mt={8}
          display="flex"
          justifyContent="center"
          wrap="wrap"
          gap={6}
        >
          <HStack spacing={2} color="gray.600">
            <Icon as={FiStar} w="4" h="4" color="yellow.500" />
            <Text fontSize="sm">تقييم 4.9/5</Text>
          </HStack>
          <HStack spacing={2} color="gray.600">
            <Icon as={FiUsers} w="4" h="4" color="blue.500" />
            <Text fontSize="sm">+10,000 طالب</Text>
          </HStack>
          <HStack spacing={2} color="gray.600">
            <Icon as={FiBookOpen} w="4" h="4" color="green.500" />
            <Text fontSize="sm">+500 درس</Text>
          </HStack>
        </MotionBox>
      </MotionBox>
    </Box>
  );
};

export default WelcomePage;
