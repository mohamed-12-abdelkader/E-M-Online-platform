// src/hooks/posts/useAddReply.js
import { useState } from "react";
import { toast } from "react-toastify";
import baseUrl from "../../api/baseUrl";

const useAddReply = (postId, token, fetchData) => {
  const [commentLoading, setCommentLoading] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [replyingToId, setReplyingToId] = useState(null);

  const handleReplyContentChange = (e) => setReplyContent(e.target.value);

  const handleAddReply = async (e, parentId, user_id, teacher_id, admin_id) => {
    e.preventDefault();
    if (!replyContent.trim()) return;

    let replyTo = null;
    if (user_id) replyTo = { reply_to_user: user_id };
    else if (teacher_id) replyTo = { reply_to_teacher: teacher_id };
    else if (admin_id) replyTo = { reply_to_admin: admin_id };

    try {
      setCommentLoading(true);
      await baseUrl.post(
        `api/posts/status/comments/${postId}`,
        {
          content: replyContent,
          parent_comment_id: parentId,
          ...replyTo,
        },
        {
          headers: {
            token,
          },
        }
      );
      toast.success("تم الرد بنجاح");
      setReplyContent("");
      setReplyingToId(null);
      fetchData();
    } catch (error) {
      toast.error("فشل في إرسال الرد");
      console.log(error);
    } finally {
      setCommentLoading(false);
    }
  };

  return {
    handleAddReply,
    handleReplyContentChange,
    setReplyingToId,
    replyContent,
    setReplyContent,
    replyingToId,
    commentLoading,
  };
};

export default useAddReply;
