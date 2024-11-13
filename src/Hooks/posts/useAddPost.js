import { useState } from "react";
import { toast } from "react-toastify";
import baseUrl from "../../api/baseUrl";
import { usePosts } from "./PostsContext";

const useAddPost = () => {
  const token = localStorage.getItem("token");
  const { fetchPosts } = usePosts();

  const [selectedImages, setSelectedImages] = useState([]);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  const handleImagesChange = (images) => {
    setSelectedImages(images);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    formData.append("content", content);

    if (selectedImages.length > 0) {
      selectedImages.forEach((image) => {
        formData.append("assets", image);
      });
    }

    const headers = {
      "Content-Type": "multipart/form-data",
      token: token,
    };

    try {
      const response = await baseUrl.post(`api/posts`, formData, { headers });

      if (response.status === 201) {
        toast.success("تم إضافة المنشور بنجاح");
        fetchPosts(); // تحديث قائمة البوستات
      } else {
        toast.error("فشل في إضافة المنشور.");
      }
    } catch (error) {
      console.error("Error adding post:", error);
      toast.error("حدث خطأ أثناء إضافة المنشور.");
    } finally {
      setContent("");
      setSelectedImages("");
      setLoading(false);
    }
  };

  return [handleImagesChange, handleSubmit, loading, content, setContent];
};

export default useAddPost;
