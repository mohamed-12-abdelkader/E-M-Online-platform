import React from "react";
import { Box, Text, Image, useColorModeValue } from "@chakra-ui/react";

const PostBody = ({ img, content, createdAt }) => {
  const textColor = useColorModeValue("gray.700", "gray.200");
  const metaColor = useColorModeValue("gray.500", "gray.400");
  const linkColor = useColorModeValue("blue.500", "blue.300");

  const renderContent = (text) => {
    if (!text) return null;

    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = text.split(urlRegex);

    return parts.map((part, index) =>
      urlRegex.test(part) ? (
        <Text
          as='a'
          key={index}
          href={part}
          target='_blank'
          rel='noopener noreferrer'
          color={linkColor}
          _hover={{ color: linkColor }}
          textDecoration='none'
          display='inline'
        >
          {part}
        </Text>
      ) : (
        <Text as='span' key={index}>
          {part}
        </Text>
      )
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("ar-EG", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Box py={2} px={4}>
      <Text fontSize='sm' color={metaColor} mb={2}>
        {formatDate(createdAt)}
      </Text>

      <Text
        fontSize='md'
        color={textColor}
        lineHeight='tall'
        mb={4}
        className='whitespace-pre-wrap'
      >
        {renderContent(content)}
      </Text>

      {img && (
        <Box
          position='relative'
          paddingTop='56.25%'
          borderRadius='md'
          overflow='hidden'
          mb={2}
        >
          <Image
            src={img}
            alt='Post media'
            position='absolute'
            top={0}
            left={0}
            w='full'
            h='full'
            objectFit='cover'
            loading='lazy'
          />
        </Box>
      )}
    </Box>
  );
};

export default PostBody;
