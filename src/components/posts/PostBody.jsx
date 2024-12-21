import React from "react";

const PostBody = ({ img, content, likes, commint }) => {
  // التحقق مما إذا كان النص يحتوي على رابط
  const renderContent = (text) => {
    if (!text) return null; // التحقق من وجود النص

    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = text.split(urlRegex);

    return parts.map((part, index) =>
      urlRegex.test(part) ? (
        <a
          key={index}
          href={part}
          target='_blank'
          rel='noopener noreferrer'
          className='text-blue-500 underline'
        >
          {part}
        </a>
      ) : (
        <span key={index}>{part}</span>
      )
    );
  };

  return (
    <div>
      <div className='mb-4'>
        <p className='text-gray-500 text-sm'>3:30</p>
        <h2 className='text-lg font-semibold mt-2'>{renderContent(content)}</h2>
      </div>
      {img && (
        <img
          src={img}
          className='w-full h-auto object-cover rounded-lg mt-4'
          alt='Post media'
          loading='lazy'
        />
      )}
      <div className='flex justify-between'></div>
    </div>
  );
};

export default PostBody;
