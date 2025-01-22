import React, { useState } from "react";
import {
  Button,
  Icon,
  Text,
  Flex,
  useColorModeValue,
  Divider,
} from "@chakra-ui/react";
import { AiFillLike, AiOutlineLike, AiOutlineSave } from "react-icons/ai";
import { FaComment } from "react-icons/fa";
import { toast } from "react-toastify";
import baseUrl from "../../api/baseUrl";

const ActionPost = ({
  onOpen,
  handleToggleLike,
  loading,
  liked,
  likes,
  commint,
  postId,
}) => {
  const [likesnum, setLikesnum] = useState(likes);
  const [isLiked, setIsLiked] = useState(liked);
  const [SavePostLoading, setLoading] = useState(false);

  const buttonBg = useColorModeValue("gray.50", "gray.700");
  const buttonHoverBg = useColorModeValue("gray.100", "gray.600");
  const textColor = useColorModeValue("gray.600", "gray.300");
  const iconColor = useColorModeValue("gray.500", "gray.400");
  const dividerColor = useColorModeValue("gray.200", "gray.600");

  const handleAddLike = (event) => {
    event.preventDefault();
    handleToggleLike(event);
    setIsLiked(!isLiked);
    setLikesnum((prevLikes) => (isLiked ? prevLikes - 1 : prevLikes + 1));
  };

  const savePost = async () => {
    try {
      setLoading(true);
      await baseUrl.post(
        `/api/posts/status/bookmarks/${postId}`,
        {},
        {
          headers: { token: localStorage.getItem("token") },
        }
      );
      toast.success("تم حفظ المنشور بنجاح");
    } catch (error) {
      toast.error("فشل حفظ المنشور");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Likes and Comments Count */}
      <Flex justify='space-between' align='center' px={4} py={2}>
        <Flex align='center' gap={1}>
          <Icon
            as={AiFillLike}
            color='blue.500'
            bg='blue.50'
            p={1}
            boxSize={5}
            borderRadius='full'
          />
          <Text fontSize='sm' color={textColor}>
            {likesnum}
          </Text>
        </Flex>
        <Text fontSize='sm' color={textColor}>
          {commint} تعليق
        </Text>
      </Flex>

      <Divider borderColor={dividerColor} />

      {/* Action Buttons */}
      <Flex justify='space-between' px={2} py={1}>
        <Button
          flex={1}
          variant='ghost'
          onClick={handleAddLike}
          isLoading={loading}
          leftIcon={
            <Icon
              as={isLiked ? AiFillLike : AiOutlineLike}
              color={isLiked ? "blue.500" : iconColor}
              boxSize={5}
            />
          }
          color={isLiked ? "blue.500" : textColor}
          fontWeight='normal'
          _hover={{ bg: buttonHoverBg }}
          size='md'
        >
          إعجاب
        </Button>

        <Button
          flex={1}
          variant='ghost'
          onClick={onOpen}
          leftIcon={<Icon as={FaComment} color={iconColor} boxSize={5} />}
          color={textColor}
          fontWeight='normal'
          _hover={{ bg: buttonHoverBg }}
          size='md'
        >
          تعليق
        </Button>

        <Button
          flex={1}
          variant='ghost'
          onClick={savePost}
          isLoading={SavePostLoading}
          leftIcon={<Icon as={AiOutlineSave} color={iconColor} boxSize={5} />}
          color={textColor}
          fontWeight='normal'
          _hover={{ bg: buttonHoverBg }}
          size='md'
        >
          حفظ
        </Button>
      </Flex>
    </>
  );
};

export default ActionPost;
