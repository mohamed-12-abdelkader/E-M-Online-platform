import { useState } from "react";
import { toast } from "react-toastify";
import baseUrl from "../../api/baseUrl";
import { usePosts } from "./PostsContext";

const useEditeCommint = ({ postId }) => {
  const token = localStorage.getItem("token");
  const [editeCommintLoading, setEditeLoading] = useState(false);
  const { fetchPosts } = usePosts();

  const editeCommint = async (id, editCommentContent) => {
    try {
      setEditeLoading(true);
      const response = await baseUrl.put(
        `api/posts/status/comments/${postId}/${id}`,
        { content: editCommentContent },
        {
          headers: {
            token: token,
          },
        }
      );

      if (response.status === 200) {
        toast.success("تم تعديل التعليق بنجاح");
        fetchPosts(); // Update posts list after editing
      } else {
        toast.error("فشل تعديل التعليق");
      }
      console.log(response);
    } catch (error) {
      toast.error("فشل تعديل التعليق");
      console.error(error);
    } finally {
      setEditeLoading(false);
    }
  };

  return [editeCommintLoading, editeCommint];
};

export default useEditeCommint;
