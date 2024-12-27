import { createContext, useContext, useEffect, useState } from "react";
import baseUrl from "../../api/baseUrl";

const PostsContext = createContext();

export const usePosts = () => useContext(PostsContext);

export const PostsProvider = ({ children }) => {
  const [posts, setPosts] = useState([]);
  const [postsLoading, setPostsLoading] = useState(false);
  const [limit, setLimit] = useState(20); // عدد البوستات الافتراضي

  const fetchPosts = async (currentLimit) => {
    const token = localStorage.getItem("token");
    try {
      setPostsLoading(true);
      const response = await baseUrl.get(`api/posts?limit=${currentLimit}`, {
        headers: { token: token },
      });
      setPosts(response.data.posts); // عرض البيانات المحدثة
    } catch (error) {
      console.log("Error fetching posts:", error);
    } finally {
      setPostsLoading(false);
    }
  };

  const loadMorePosts = () => setLimit((prevLimit) => prevLimit + 20);

  useEffect(() => {
    fetchPosts(limit);
  }, [limit]);

  return (
    <PostsContext.Provider value={{ posts, postsLoading, loadMorePosts }}>
      {children}
    </PostsContext.Provider>
  );
};
