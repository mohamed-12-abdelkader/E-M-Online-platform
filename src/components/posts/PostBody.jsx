import React from "react";

const PostBody = ({ img, content, likes, commint }) => {
  return (
    <div>
      <div className="mb-4">
        <p className="text-gray-500 text-sm">3:30</p>
        <h2 className="text-lg font-semibold mt-2">{content}</h2>
      </div>
      {img && (
        <img
          src={img}
          className="w-full h-auto object-cover rounded-lg mt-4"
          alt="Post media"
          loading="lazy"
        />
      )}
      <div className="flex justify-between"></div>
    </div>
  );
};

export default PostBody;
