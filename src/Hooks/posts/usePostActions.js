import { useState } from "react";
import baseUrl from "../../api/baseUrl";
import { toast } from "react-toastify";

const usePostActions = (postId, initialLiked) => {
  const token = localStorage.getItem("token");
  const [liked, setLiked] = useState(initialLiked || false);
  const [loading, setLoading] = useState(false);
  const [commentLoading, setCommentLoading] = useState(false);

  const handleAddLike = async () => {
    const action = liked ? "unlike" : "like";
    try {
      setLoading(true);
      setLiked(!liked);
      await baseUrl.post(
        `api/posts/${action}/${postId}`,
        {},
        { headers: { token } }
      );
    } catch (error) {
      setLiked(liked); // revert on error
    } finally {
      setLoading(false);
    }
  };

  const addComment = async (content, fetchData) => {
    if (!content.trim()) return;
    try {
      setCommentLoading(true);
      await baseUrl.post(
        `api/posts/status/comments/${postId}`,
        { content },
        { headers: { token } }
      );
      toast.success("تم التعليق بنجاح");
      fetchData();
    } catch (error) {
      toast.error("فشل في إرسال التعليق");
    } finally {
      setCommentLoading(false);
    }
  };

  return { liked, loading, commentLoading, handleAddLike, addComment };
};

export default usePostActions;
