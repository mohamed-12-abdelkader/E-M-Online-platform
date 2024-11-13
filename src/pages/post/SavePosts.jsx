import {
  Box,
  HStack,
  Skeleton,
  SkeletonCircle,
  SkeletonText,
  Text,
  VStack,
} from "@chakra-ui/react";
import useGitSavePosts from "../../Hooks/posts/useGitSavePosts";
import Post from "../../components/posts/Post";

const SavePosts = () => {
  const [postsLoading, posts] = useGitSavePosts();

  console.log(posts);
  return (
    <div className="my-5">
      {postsLoading ? (
        <VStack spacing="6" align="stretch">
          {[...Array(3)].map((_, i) => (
            <Box
              key={i}
              p="4"
              borderWidth="1px"
              borderRadius="lg"
              shadow="sm"
              className="w-[100%] md:w-[80%] m-auto"
            >
              <HStack spacing="4" mb="4">
                <SkeletonCircle size="10" />
                <Skeleton height="20px" width="40%" />
              </HStack>
              <SkeletonText mt="4" noOfLines={4} spacing="4" />
              <Skeleton height="20px" mt="4" width="20%" />
            </Box>
          ))}
        </VStack>
      ) : posts.bookmarks && posts.bookmarks.length > 0 ? (
        <div>
          {posts.bookmarks.map((post) => (
            <Box key={post.id} id={`post-${post.id}`}>
              <Post post={post} />
              <div className="h-[10px] bg-[#ccc] md:w-[80%] m-auto "></div>
            </Box>
          ))}
        </div>
      ) : (
        <Text fontSize="xl" textAlign="center" mt="4">
          لا يوجد بوستات حاليا
        </Text>
      )}
    </div>
  );
};

export default SavePosts;
