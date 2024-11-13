import { useEffect } from "react";
import { useSearchParams } from "react-router-dom"; // Import useSearchParams
import {
  Skeleton,
  Box,
  VStack,
  HStack,
  Text,
  SkeletonCircle,
  SkeletonText,
} from "@chakra-ui/react";
import Post from "../../components/posts/Post";
import useGitPosts from "../../Hooks/posts/useGitPosts";
import AddPost from "../../components/posts/AddPost";
import { usePosts } from "../../Hooks/posts/PostsContext";

const PostsHome = () => {
  const { posts, postsLoading } = usePosts();
  const [searchParams] = useSearchParams(); // Initialize search params
  const postId = searchParams.get("postId"); // Get postId from URL

  useEffect(() => {
    if (postId) {
      const postElement = document.getElementById(`post-${postId}`);
      if (postElement) {
        postElement.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, [postId, posts]); // Re-run if postId or posts change
  console.log(posts);
  return (
    <div className="space-y-6 mb-[80px]">
      <AddPost />
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
      ) : posts.posts && posts.posts.length > 0 ? (
        <div>
          {posts.posts.map((post) => (
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

export default PostsHome;
