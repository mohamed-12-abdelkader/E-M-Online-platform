import { useState } from "react";
import { toast } from "react-toastify";
import baseUrl from "../../api/baseUrl";
import { usePosts } from "./PostsContext";

const useEditePost = () => {
  const token = localStorage.getItem("token");
  const [editeLoading, setEditeLoading] = useState(false);
  const { refetchPosts } = usePosts();

  const editePost = async (id, newContent) => {
    try {
      setEditeLoading(true);
      const response = await baseUrl.put(
        `api/posts/${id}`,
        { content: newContent },
        {
          headers: {
            token: token,
          },
        }
      );

      if (response.status === 201) {
        toast.success("تم تعديل المنشور بنجاح");
        refetchPosts(); // Update posts list after editing
      } else {
        toast.error("فشل تعديل المنشور");
      }
      console.log(response);
    } catch (error) {
      toast.error("فشل تعديل المنشور");
      console.error(error);
    } finally {
      setEditeLoading(false);
    }
  };

  return [editeLoading, editePost];
};

export default useEditePost;
