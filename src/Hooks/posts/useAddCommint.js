// src/hooks/posts/useAddComment.js
import { useState } from "react";
import { toast } from "react-toastify";
import baseUrl from "../../api/baseUrl";

const useAddComment = (postId, token, fetchData) => {
  const [commentLoading, setCommentLoading] = useState(false);
  const [content, setContent] = useState("");

  const handleContentChange = (e) => setContent(e.target.value);

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;

    try {
      setCommentLoading(true);
      await baseUrl.post(
        `api/posts/status/comments/${postId}`,
        { content },
        {
          headers: {
            token,
          },
        }
      );
      toast.success("تم التعليق بنجاح");
      setContent("");
      fetchData();
    } catch (error) {
      toast.error("فشل في إرسال التعليق");
      console.log(error);
    } finally {
      setCommentLoading(false);
    }
  };

  return {
    handleAddComment,
    handleContentChange,
    commentLoading,
    content,
    setContent,
  };
};

export default useAddComment;
