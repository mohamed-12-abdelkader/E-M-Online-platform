import { createContext, useContext } from "react";
import baseUrl from "../../api/baseUrl";
import { useInfiniteQuery } from "@tanstack/react-query";

const PostsContext = createContext();

export const usePosts = () => useContext(PostsContext);

const fetchPosts = async ({ pageParam }) => {
  console.info("PageParams", pageParam)
  const token = localStorage.getItem("token"); // User token

  const response = await baseUrl.get("api/posts", {
    params: { cursor: pageParam, limit: 20 },
    headers: { token },
  });
  return response.data;
};

export const PostsProvider = ({ children }) => {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isPending,
  } = useInfiniteQuery({
    queryKey: ["posts"], // Query key
    queryFn: fetchPosts,
    initialPageParam: null,
    getNextPageParam: (lastPage, pages) => lastPage.nextCursor, // Pagination handling
  });

  // Flattening the paginated posts data
  const flatPosts = data?.pages.flatMap((page) => page.posts) || [];

  return (
    <PostsContext.Provider
      value={{
        posts: flatPosts,
        postsLoading: isFetchingNextPage || isPending,
        loadMorePosts: fetchNextPage,
        hasMorePosts: hasNextPage,
      }}
    >
      {children}
    </PostsContext.Provider>
  );
};