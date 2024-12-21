import { useState } from "react";
import { Input, Button } from "@chakra-ui/react";
import { IoSend } from "react-icons/io5";

const CommentsSection = ({
  commints,
  user,
  handleReplyClick,
  handleReplyContentChange,
  replyContent,
  commentLoading,
  handleAddReply,
}) => {
  const [replyingToId, setReplyingToId] = useState(null);
  const [showReplies, setShowReplies] = useState({});

  const toggleReplies = (id) => {
    setShowReplies((prevState) => ({
      ...prevState,
      [id]: !prevState[id],
    }));
  };

  const getFirstLetter = (username) => {
    return username.charAt(0).toUpperCase();
  };

  const getColorForLetter = (letter) => {
    // You can modify this to return specific colors based on the letter.
    const colors = ["#4CAF50", "#2196F3", "#FFC107", "#F44336", "#9C27B0"];
    return colors[letter.charCodeAt(0) % colors.length];
  };

  return (
    <div>
      {commints.map((commint) => {
        const firstLetter = getFirstLetter(commint.user.username);
        const color = getColorForLetter(firstLetter);

        return (
          <div
            key={commint.id}
            className='p-2 my-2 border rounded-md  flex items-start'
          >
            {commint.user.cover ? (
              <img
                src={commint.user.cover}
                className='h-[40px] w-[40px] rounded-full mr-3 mx-2'
                alt='User avatar'
              />
            ) : (
              <div
                style={{ backgroundColor: color }}
                className='flex items-center justify-center w-10 h-10 rounded-full  font-bold mr-3'
              >
                {firstLetter}
              </div>
            )}

            <div>
              <p className='font-bold m-2'>{commint.user.username}</p>
              <p className='text-gray-500 text-xs'>
                {new Date(commint.created_at).toLocaleString()}
              </p>
              <p className='text-sm m-2 font-bold'>{commint.content}</p>

              {user.id === commint.user_id ? null : (
                <button
                  className='text-blue-500 text-sm mt-2'
                  onClick={() => handleReplyClick(commint.id)}
                >
                  رد
                </button>
              )}

              {replyingToId === commint.id && (
                <div className='mt-2 flex items-center gap-2'>
                  <Input
                    placeholder='أكتب ردك هنا...'
                    value={replyContent}
                    onChange={handleReplyContentChange}
                    className='w-full mb-2'
                  />
                  <Button
                    colorScheme='green'
                    onClick={(e) =>
                      handleAddReply(
                        e,
                        commint.id,
                        commint.user_id,
                        commint.teacher_id,
                        commint.admin_id
                      )
                    }
                    isLoading={commentLoading}
                  >
                    <IoSend />
                  </Button>
                  <Button
                    colorScheme='red'
                    onClick={() => setReplyingToId(null)}
                  >
                    X
                  </Button>
                </div>
              )}

              {/* عرض زر "عرض الردود" مع عدد الردود إذا كانت موجودة */}
              {commint.replies.length > 0 && (
                <div>
                  <button
                    className='text-blue-500 text-sm mt-2 ml-2'
                    onClick={() => toggleReplies(commint.id)}
                  >
                    {showReplies[commint.id]
                      ? "إخفاء الردود"
                      : `عرض الردود (${commint.replies.length})`}
                  </button>
                </div>
              )}

              {/* عرض الردود إذا كانت موجودة */}
              {showReplies[commint.id] &&
                commint.replies.map((reply) => {
                  const replyFirstLetter = getFirstLetter(reply.user.username);
                  const replyColor = getColorForLetter(replyFirstLetter);

                  return (
                    <div
                      key={reply.id}
                      className='ml-12 mt-2 p-2 flex border-l-4 w-[90%] m-auto border-gray-300 bg-gray-50 rounded-md'
                    >
                      {reply.user.cover ? (
                        <img
                          src={reply.user.cover}
                          className='h-[30px] w-[30px] rounded-full mr-3'
                          alt='User avatar'
                        />
                      ) : (
                        <div
                          style={{ backgroundColor: replyColor }}
                          className='flex items-center justify-center w-8 h-8 rounded-full text-white font-bold mr-3'
                        >
                          {replyFirstLetter}
                        </div>
                      )}

                      <div>
                        <p className='font-bold m-2'>{reply.user.username}</p>
                        <p className='text-gray-500 text-xs'>
                          {new Date(reply.created_at).toLocaleString()}
                        </p>
                        <p className='text-sm m-2'>{reply.content}</p>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default CommentsSection;
