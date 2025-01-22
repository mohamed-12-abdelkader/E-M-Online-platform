import React from "react";
import { Box, useColorModeValue } from "@chakra-ui/react";
import PostHeader from "./PostHeader";
import PostBody from "./PostBody";
import PostFooter from "./PostFooter";

const Post = ({ post }) => {
  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.100", "gray.700");

  // تحقق من وجود الـ assets ثم طباعة الـ path
  const imagePath =
    post.assets && Array.isArray(post.assets) && post.assets.length > 0
      ? post.assets[0].path
      : ""; // إذا لم يكن هناك صورة، يمكن استخدام قيمة فارغة أو مسار افتراضي

  console.log(imagePath); // اطبع الـ path

  return (
    <Box
      w={{ base: "100%", md: "80%" }}
      mx='auto'
      bg={bgColor}
      borderWidth='1px'
      borderColor={borderColor}
      borderRadius='lg'
      boxShadow='sm'
      transition='all 0.2s'
      _hover={{ boxShadow: "md" }}
      overflow='hidden'
    >
      <Box p={4}>
        {/* Header */}
        <PostHeader
          post={post}
          content={post.content}
          id={post.id}
          name={post.user.username}
          cover={post.user.cover}
          admi_id={post.admin_id}
        />

        {/* Post Time and Title */}
        <PostBody
          content={post.content}
          img={imagePath}
          createdAt={post.created_at}
        />

        {/* Footer */}
        <PostFooter
          postId={post.id}
          post={post}
          likes={post.num_likes}
          commint={post.num_comments}
        />
      </Box>
    </Box>
  );
};

export default Post;
