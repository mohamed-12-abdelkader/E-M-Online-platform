import React from "react";
import PostHeader from "./PostHeader";
import PostBody from "./PostBody";
import PostFooter from "./PostFooter";

const Post = ({ post }) => {
  // تحقق من وجود الـ assets ثم طباعة الـ path
  const imagePath =
    post.assets && Array.isArray(post.assets) && post.assets.length > 0
      ? post.assets[0].path
      : ""; // إذا لم يكن هناك صورة، يمكن استخدام قيمة فارغة أو مسار افتراضي

  console.log(imagePath); // اطبع الـ path

  return (
    <div className="w-[100%]  mx-auto border shadow rounded-lg p-4 bg-white md:w-[80%]">
      {/* Header */}
      <PostHeader
        post={post}
        content={post.content}
        id={post.id}
        name={post.user.username}
        cover={post.user.cover}
        admi_id={post.admin_id}
      />

      {/* Post Time and Title */}
      <PostBody
        content={post.content}
        img={imagePath}
        likes={post.num_likes}
        commint={post.num_comments}
      />

      {/* Footer */}
      <PostFooter
        postId={post.id}
        post={post}
        likes={post.num_likes}
        commint={post.num_comments}
      />
    </div>
  );
};

export default Post;
