import { useEffect } from "react";
import {
  Skeleton,
  Box,
  VStack,
  HStack,
  Text,
  SkeletonCircle,
  SkeletonText,
  Button,
} from "@chakra-ui/react";
import Post from "../../components/posts/Post";
import AddPost from "../../components/posts/AddPost";
import { usePosts } from "../../Hooks/posts/PostsContext";

const PostsHome = () => {
  const { posts, postsLoading, loadMorePosts } = usePosts();

  return (
    <div className='space-y-6 mb-[80px] post_page'>
      <AddPost />
      {postsLoading && posts.length === 0 ? (
        <VStack spacing='6' align='stretch'>
          {[...Array(3)].map((_, i) => (
            <Box
              key={i}
              p='4'
              borderWidth='1px'
              borderRadius='lg'
              shadow='sm'
              className='w-[100%] md:w-[80%] m-auto'
            >
              <HStack spacing='4' mb='4'>
                <SkeletonCircle size='10' />
                <Skeleton height='20px' width='40%' />
              </HStack>
              <SkeletonText mt='4' noOfLines={4} spacing='4' />
              <Skeleton height='20px' mt='4' width='20%' />
            </Box>
          ))}
        </VStack>
      ) : posts?.length > 0 ? (
        <div>
          {posts.map((post) => (
            <Box key={post.id} id={`post-${post.id}`} className='my-2'>
              <Post post={post} />
            </Box>
          ))}
          {postsLoading ? (
            <VStack spacing='6' align='stretch'>
              {[...Array(3)].map((_, i) => (
                <Box
                  key={i}
                  p='4'
                  borderWidth='1px'
                  borderRadius='lg'
                  shadow='sm'
                  className='w-[100%] md:w-[80%] m-auto'
                >
                  <HStack spacing='4' mb='4'>
                    <SkeletonCircle size='10' />
                    <Skeleton height='20px' width='40%' />
                  </HStack>
                  <SkeletonText mt='4' noOfLines={4} spacing='4' />
                  <Skeleton height='20px' mt='4' width='20%' />
                </Box>
              ))}
            </VStack>
          ) : (
            <div className='text-center md:w-[90%] m-auto'>
              <Button
                onClick={loadMorePosts}
                colorScheme='blue'
                size='md'
                className=' block my-4  m-auto w-[100%] md:w-[90%]'
              >
                عرض المزيد من البوستات
              </Button>
            </div>
          )}
        </div>
      ) : (
        <Text fontSize='xl' textAlign='center' mt='4'>
          لا يوجد بوستات حاليا
        </Text>
      )}
    </div>
  );
};

export default PostsHome;
