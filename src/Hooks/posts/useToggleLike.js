// src/hooks/posts/useToggleLike.js
import { useState } from "react";
import baseUrl from "../../api/baseUrl";

const useToggleLike = (postId, token, fetchData, initialLiked = false) => {
  const [loading, setLoading] = useState(false);
  const [liked, setLiked] = useState(initialLiked);

  const handleToggleLike = async (e) => {
    e.preventDefault();
    const action = liked ? "unlike" : "like";

    try {
      setLoading(true);
      setLiked(!liked);

      await baseUrl.post(
        `api/posts/${action}/${postId}`,
        {},
        {
          headers: {
            token,
          },
        }
      );

      fetchData();
    } catch (error) {
      setLiked(liked);
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  return {
    handleToggleLike,
    liked,
    loading,
  };
};

export default useToggleLike;
