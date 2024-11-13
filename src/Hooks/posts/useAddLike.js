import { toast } from "react-toastify";
import baseUrl from "../../api/baseUrl";
import { useState } from "react";
import axios from "axios";

const useAddLike = () => {
  const token = localStorage.getItem("token");
  const [Loading, setLoading] = useState(false);
  const addLike = async (id) => {
    try {
      setLoading(true);
      await axios.post(`http://localhost:4004/api/posts/like/${id}`, {
        headers: {
          token: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTk1NywibWFpbCI6IjQ1NzY1NDQiLCJpYXQiOjE3Mjk0ODMzMzcsImV4cCI6MTc2MTE5MjEzN30.rukdmQBlSV36f3Y3-o3aYB5TzgSncrIewByj4qDScSA`,
        },
      });
      toast.success("done");
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch (error) {
      toast.error("فشل   ");
      console.log(error);
    } finally {
      setLoading(false);
    }
  };
  return [Loading, addLike];
};

export default useAddLike;
