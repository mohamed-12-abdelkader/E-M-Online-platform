import { useState } from "react";
import baseUrl from "../../api/baseUrl";
import { toast } from "react-toastify";
import { usePosts } from "./PostsContext";

const useSponser = ({ postId }) => {
  const { fetchPosts } = usePosts();
  const token = localStorage.getItem("token");
  const [commentLoading, setCommentLoading] = useState(false);
  const [start_date, setstart_date] = useState("");
  const [end_date, setend_date] = useState("");
  const [priority, setpriority] = useState("");
  const [is_active, setis_active] = useState(true);

  const handlestart_dateChange = (e) => setstart_date(e.target.value);
  const handleend_dateChange = (e) => setend_date(e.target.value);
  const handlepriorityChange = (e) => setpriority(e.target.value);

  const handleAddsponser = async (e) => {
    e.preventDefault();

    try {
      setCommentLoading(true);
      await baseUrl.post(
        `api/posts/status/ads/${postId}`,
        { start_date, end_date, priority, is_active },
        {
          headers: {
            token,
          },
        }
      );
      toast.success("تم التمويل بنجاح");

      fetchPosts();
    } catch (error) {
      toast.error(" فشل التمويل");
      console.log(error);
    } finally {
      setCommentLoading(false);
      console.log(postId);
    }
  };

  return {
    handleAddsponser,
    handlestart_dateChange,
    handleend_dateChange,
    handlepriorityChange,
    commentLoading,
    start_date,
    priority,
    end_date,
  };
};

export default useSponser;
