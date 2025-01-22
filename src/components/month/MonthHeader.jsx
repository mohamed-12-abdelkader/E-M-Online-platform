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
  Badge,
} from "@chakra-ui/react";
import { FaPlayCircle, FaBookOpen } from "react-icons/fa";
import { motion } from "framer-motion";

const MotionBox = motion(Box);

const MonthHeader = ({ image, description, noflecture }) => {
  const bgColor = useColorModeValue("white", "gray.800");
  const textColor = useColorModeValue("gray.800", "white");
  const accentColor = useColorModeValue("blue.500", "blue.300");
  const statBg = useColorModeValue("blue.50", "blue.900");

  return (
    <Box
      bg={bgColor}
      borderRadius='xl'
      overflow='hidden'
      shadow='lg'
      borderWidth='1px'
      borderColor={useColorModeValue("gray.200", "gray.700")}
    >
      <Flex
        direction={{ base: "column", md: "row" }}
        align='stretch'
        h={{ md: "400px" }}
      >
        {/* Image Section */}
        <MotionBox
          w={{ base: "100%", md: "50%" }}
          h={{ base: "250px", md: "full" }}
          position='relative'
          overflow='hidden'
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.3 }}
        >
          <Image
            src={image}
            alt='Course Cover'
            objectFit='cover'
            w='full'
            h='full'
          />
          <Box
            position='absolute'
            top='0'
            left='0'
            right='0'
            bottom='0'
            bg='blackAlpha.300'
          />
        </MotionBox>

        {/* Content Section */}
        <Flex
          direction='column'
          justify='center'
          p={{ base: 6, md: 10 }}
          w={{ base: "100%", md: "50%" }}
        >
          <Badge
            colorScheme='blue'
            alignSelf='flex-start'
            mb={4}
            fontSize='sm'
            px={3}
            py={1}
            borderRadius='full'
          >
            كورس تعليمي
          </Badge>

          <Text
            fontSize={{ base: "2xl", md: "3xl" }}
            fontWeight='bold'
            color={textColor}
            mb={4}
          >
            {description}
          </Text>

          <Text color={useColorModeValue("gray.600", "gray.300")} mb={6}>
            اكتشف محتوى هذا الكورس المميز واستفد من المحاضرات القيمة. رحلة
            تعليمية مشوقة تنتظرك!
          </Text>

          <HStack spacing={4} mb={6}>
            <Button
              leftIcon={<Icon as={FaPlayCircle} />}
              colorScheme='blue'
              size='lg'
              _hover={{
                transform: "translateY(-2px)",
                boxShadow: "lg",
              }}
            >
              ابدأ التعلم
            </Button>
          </HStack>

          <Flex
            bg={statBg}
            p={4}
            borderRadius='lg'
            align='center'
            justify='center'
            color={accentColor}
          >
            <Icon as={FaBookOpen} mr={2} />
            <Text fontWeight='bold'>عدد المحاضرات: {noflecture}</Text>
          </Flex>
        </Flex>
      </Flex>
    </Box>
  );
};

export default MonthHeader;
