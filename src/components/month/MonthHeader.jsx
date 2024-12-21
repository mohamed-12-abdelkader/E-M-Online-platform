import React from "react";
import {
  Box,
  Flex,
  VStack,
  HStack,
  Image,
  Text,
  Button,
  Icon,
  useColorModeValue,
} from "@chakra-ui/react";
import { FaPlayCircle } from "react-icons/fa";

const MonthHeader = ({ image, description, noflecture }) => {
  // Color Mode Values
  const bgColor = useColorModeValue("gray.100", "gray.800");
  const textColor = useColorModeValue("gray.800", "white");
  const cardBg = useColorModeValue("gray.300", "gray.700");
  const highlightColor = useColorModeValue("teal.500", "yellow.400");

  return (
    <Box
      w='90%'
      m='auto'
      bg={bgColor}
      borderRadius='lg'
      p={8}
      shadow='lg'
      maxW='7xl'
      mt={10}
      mb={10}
    >
      <Flex
        direction={{ base: "column", md: "row" }}
        align='center'
        justify='space-between'
        gap={8}
      >
        {/* Image Section */}
        <Box
          w={{ base: "100%", md: "45%" }}
          overflow='hidden'
          borderRadius='md'
          transform='scale(1)'
          transition='transform 0.3s'
          _hover={{ transform: "scale(1.05)" }}
          shadow='lg'
        >
          <Image
            src={image}
            alt='Course Image'
            objectFit='cover'
            w='100%'
            h={{ base: "200px", md: "300px" }}
          />
        </Box>

        {/* Info Section */}
        <VStack
          align={{ base: "center", md: "flex-start" }}
          spacing={4}
          w={{ base: "100%", md: "50%" }}
        >
          <Text fontSize='2xl' fontWeight='bold' color={textColor}>
            {description}
          </Text>

          <Text fontSize='lg' fontWeight='bold' color={textColor}>
            اكتشف محتوى هذا الكورس واستفد من عدد المحاضرات المتميز. رحلة تعليمية
            مشوقة بانتظارك!
          </Text>

          <HStack
            spacing={4}
            w='full'
            justify={{ base: "center", md: "flex-start" }}
          >
            <Button
              size='lg'
              colorScheme='teal'
              variant='solid'
              leftIcon={<Icon as={FaPlayCircle} />}
            >
              ابدأ الكورس
            </Button>
          </HStack>

          <Box
            bg={cardBg}
            px={4}
            py={2}
            borderRadius='md'
            shadow='md'
            textAlign='center'
            mt={4}
          >
            <Text fontSize='lg' fontWeight='bold' color={highlightColor}>
              عدد المحاضرات: {noflecture}
            </Text>
          </Box>
        </VStack>
      </Flex>
    </Box>
  );
};

export default MonthHeader;
