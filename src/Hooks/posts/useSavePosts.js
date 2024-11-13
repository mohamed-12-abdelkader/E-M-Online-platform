import React, { useState } from "react";
import { toast } from "react-toastify";
import baseUrl from "../../api/baseUrl";
import axios from "axios";

const useSavePosts = ({ postId }) => {
  const token = localStorage.getItem("token");
  const [SavePostLoading, setLoading] = useState(false);
  const savePost = async (id) => {
    try {
      setLoading(true);
      await axios.post(
        `http://localhost:4004/api/posts/status/bookmarks/${id}`,
        {
          headers: {
            token: token,
          },
        }
      );
      toast.success("done");
    } catch (error) {
      toast.error("فشل   ");
      console.log(error);
    } finally {
      setLoading(false);
      console.log(postId);
    }
  };
  return [SavePostLoading, savePost];
};

export default useSavePosts;
