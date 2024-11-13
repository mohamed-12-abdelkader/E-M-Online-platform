import React, { useState } from "react";
import { AiFillLike, AiOutlineLike, AiOutlineSave } from "react-icons/ai";
import { FaComment } from "react-icons/fa";
import { toast } from "react-toastify";
import baseUrl from "../../api/baseUrl";

const ActionPost = ({
  onOpen,
  handleToggleLike,
  loading,
  liked,
  likes,
  commint,
  postId,
}) => {
  const [likesnum, setLikesnum] = useState(likes);
  const [isLiked, setIsLiked] = useState(liked);

  const handleAddLike = (event) => {
    event.preventDefault();
    handleToggleLike(event);
    setIsLiked(!isLiked);
    setLikesnum((prevLikes) => (isLiked ? prevLikes - 1 : prevLikes + 1));
  };

  const token = localStorage.getItem("token");
  const [SavePostLoading, setLoading] = useState(false);

  const savePost = async () => {
    try {
      setLoading(true);
      await baseUrl.post(
        `/api/posts/status/bookmarks/${postId}`, // Ensuring postId is in the URL
        {}, // Empty body if not required
        {
          headers: {
            token: token, // Ensure token is properly formatted
          },
        }
      );
      toast.success("تم حفظ المنشور بنجاح");
    } catch (error) {
      toast.error("فشل حفظ المنشور");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex justify-around items-center">
        <div className="flex">
          <h1>({likesnum})</h1>
          <button
            className="flex items-center text-blue-500 hover:text-blue-700"
            onClick={handleAddLike}
          >
            {isLiked ? (
              <AiFillLike className="m-1" />
            ) : (
              <AiOutlineLike className="m-1" />
            )}
            {loading ? "أعجبني " : isLiked ? "أعجبني" : "أعجبني"}
          </button>
        </div>
        <div className="flex">
          <h1>({commint})</h1>
          <button
            className="flex items-center text-gray-500 hover:text-green-700"
            onClick={onOpen}
          >
            <FaComment className="m-1" />
            تعليق
          </button>
        </div>

        <button
          onClick={savePost}
          className="flex items-center text-yellow-500 hover:text-yellow-700"
          disabled={SavePostLoading} // Disable while loading
        >
          <AiOutlineSave className="m-1" />
          {SavePostLoading ? "جاري الحفظ..." : "حفظ"}
        </button>
      </div>
    </div>
  );
};

export default ActionPost;
