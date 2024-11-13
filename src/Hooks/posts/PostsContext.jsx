import { createContext, useContext, useEffect, useState } from "react";
import baseUrl from "../../api/baseUrl";

const PostsContext = createContext();

export const usePosts = () => useContext(PostsContext);

export const PostsProvider = ({ children }) => {
  const [posts, setPosts] = useState([]);
  const [postsLoading, setPostsLoading] = useState(false);

  const fetchPosts = async () => {
    const token = localStorage.getItem("token");
    try {
      setPostsLoading(true);
      const response = await baseUrl.get(`api/posts`, {
        headers: { token: token },
      });
      setPosts(response.data);
    } catch (error) {
      console.log("Error fetching posts:", error);
    } finally {
      setPostsLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  return (
    <PostsContext.Provider value={{ posts, postsLoading, fetchPosts }}>
      {children}
    </PostsContext.Provider>
  );
};
