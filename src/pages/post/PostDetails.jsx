import { useParams } from "react-router-dom";
import useGitPostDetails from "../../Hooks/posts/useGitPostDetails";
import Post from "../../components/posts/Post";
import { Skeleton, Box, Text } from "@chakra-ui/react";

const PostSkeleton = () => {
  // This component mimics the layout of a post to show as a placeholder during loading
  return (
    <Box p={4} borderWidth="1px" borderRadius="lg" boxShadow="md" mb={4}>
      <Skeleton height="20px" width="50%" mb={2} />
      <Skeleton height="15px" width="80%" mb={2} />
      <Skeleton height="15px" width="60%" mb={2} />
      <Skeleton height="15px" width="90%" mb={2} />
      <Skeleton height="200px" width="100%" mb={2} />
      <Skeleton height="15px" width="40%" />
    </Box>
  );
};

const PostDetails = () => {
  const { id } = useParams();
  const [postDetailsLoading, postDetails] = useGitPostDetails({ id: id });

  if (postDetailsLoading) {
    return (
      <div className="mt-[130px] mb-3 w-[100%] md:w-[80%] m-auto ">
        <PostSkeleton /> {/* Show a skeleton while loading */}
      </div>
    );
  }

  if (!postDetails) {
    return (
      <Box p={4} textAlign="center">
        <Text fontSize="lg" color="gray.500">
          لا يوجد بوست
        </Text>
      </Box>
    );
  }

  return (
    <div className="mt-[130px] mb-5">
      <Post post={postDetails} />
    </div>
  );
};

export default PostDetails;
