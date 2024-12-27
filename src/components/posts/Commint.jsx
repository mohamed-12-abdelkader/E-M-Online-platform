import {
  Button,
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Input,
  Box,
  Skeleton,
} from "@chakra-ui/react";

import { useState } from "react";
import { IoSend } from "react-icons/io5";
import { MdMoreHoriz } from "react-icons/md";
import logo from "../../img/new-logo.png";
import useDeleateCommint from "../../Hooks/posts/useDeleateCommint";
import useAddReply from "../../Hooks/posts/useAddReply";

const getFirstLetter = (name) => name.charAt(0).toUpperCase();
const getColorForLetter = (letter) => {
  const colors = [
    "#f44336",
    "#2196f3",
    "#4caf50",
    "#9c27b0",
    "#ff9800",
    "#ffeb3b",
    "#009688",
  ];
  return colors[letter.charCodeAt(0) % colors.length];
};

const Commint = ({
  postId,
  post,
  commintsLoading,
  commints,
  fetchData,
  openEditModal,
}) => {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));
  const [showReplies, setShowReplies] = useState({});

  const [deletecommintLoading, deletecommint] = useDeleateCommint({
    postId: postId,
    fetchData,
  });

  const {
    handleAddReply,
    handleReplyContentChange,
    setReplyingToId,
    replyContent,
    replyingToId,
    commentLoading: replyLoading,
  } = useAddReply(postId, token, fetchData);

  const toggleReplies = (commentId) => {
    setShowReplies((prev) => ({
      ...prev,
      [commentId]: !prev[commentId],
    }));
  };
  const handleReplyClick = (id) => {
    setReplyingToId(id);
  };

  return (
    <div>
      <div>
        {commintsLoading ? (
          <Box p={3} borderWidth='1px' borderRadius='lg' boxShadow='md' mb={4}>
            <Skeleton height='15px' width='30%' mb={2} /> {/* اسم المستخدم */}
            <Skeleton height='10px' width='80%' mb={1} /> {/* محتوى التعليق */}
            <Skeleton height='10px' width='90%' mb={1} />
            <Skeleton height='10px' width='60%' />
          </Box>
        ) : commints.length === 0 ? (
          <p>لا توجد تعليقات بعد.</p>
        ) : (
          commints.map((commint) => {
            const firstLetter = getFirstLetter(commint.user.username);
            const color = getColorForLetter(firstLetter);
            return (
              <div
                key={commint.id}
                className=' p-2 my-2 border rounded-md shadow-md  flex justify-between items-start'
              >
                <div>
                  {commint.admin_id ? (
                    <div className='flex items-center'>
                      <img
                        src={logo} // Use the imported logo
                        className='h-[40px] w-[40px] rounded-full mr-3 mx-2'
                        alt='E-M Online Logo'
                      />
                      <div>
                        <p className='font-bold m-2'>E-M Online</p>
                      </div>
                    </div>
                  ) : commint.user.cover ? (
                    <div className='flex'>
                      <img
                        src={commint.user.cover}
                        className='h-[40px] w-[40px] rounded-full mr-3 mx-2'
                        alt='User avatar'
                      />
                      <div>
                        <p className='font-bold m-2'>{commint.user.username}</p>
                      </div>
                    </div>
                  ) : (
                    <div className='flex items-center'>
                      <div
                        style={{ backgroundColor: color }}
                        className='flex items-center justify-center w-10 h-10 rounded-full text-white font-bold mr-3'
                      >
                        {firstLetter}
                      </div>
                      <div>
                        <p className='font-bold m-2'>{commint.user.username}</p>
                      </div>
                    </div>
                  )}

                  <div className='px-5'>
                    <p className='text-sm m-3 font-bold'>{commint.content}</p>
                    {(user.role == null && user.id == commint.user_id) ||
                    (user.role == "teacher" && user.id == commint.teacher_id) ||
                    (user.role == "admin" &&
                      user.id == commint.admin_id) ? null : (
                      <button
                        className='text-blue-500 text-sm '
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
                          isLoading={replyLoading}
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
                    {commint.replies && commint.replies.length > 0 ? (
                      <div>
                        <button
                          className='text-blue-500 text-sm mt-2 ml-2'
                          onClick={() => toggleReplies(commint.id)}
                        >
                          {showReplies[commint.id]
                            ? "إخفاء الردود"
                            : ` عرض الردود (${commint.replies.length})`}
                        </button>
                      </div>
                    ) : null}

                    {showReplies[commint.id] &&
                      commint.replies.map((reply) => {
                        const replyFirstLetter = getFirstLetter(
                          reply.user.username
                        );
                        const replyColor = getColorForLetter(replyFirstLetter);
                        return (
                          <div
                            key={reply.id}
                            className='ml-12 mt-2 p-2 flex border-l-4 w-[90%] m-auto  border rounded-md'
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
                                className='flex items-center justify-center w-8 h-8 rounded-full  font-bold mr-3'
                              >
                                {replyFirstLetter}
                              </div>
                            )}
                            <div>
                              <div className='flex'>
                                <p className='font-bold mx-2 my-1'>
                                  {reply.user.username}
                                </p>
                                {(user.role == null &&
                                  user.id == reply.user_id) ||
                                (user.role == "teacher" &&
                                  user.id == reply.teacher_id) ||
                                user.role == "admin" ? (
                                  <div className='mx-5'>
                                    <Menu>
                                      <MenuButton
                                        as={IconButton}
                                        icon={<MdMoreHoriz />}
                                        variant='ghost'
                                        aria-label='Options'
                                      />
                                      <MenuList>
                                        <MenuItem
                                          onClick={() => openEditModal(reply)}
                                        >
                                          تعديل
                                        </MenuItem>
                                        <MenuItem
                                          onClick={() =>
                                            deletecommint(reply.id)
                                          }
                                        >
                                          حذف
                                        </MenuItem>
                                      </MenuList>
                                    </Menu>
                                  </div>
                                ) : null}
                              </div>

                              <div></div>

                              <p className='text-gray-500 text-xs'></p>
                              <p className='text-sm m-2 text-blue-500'>
                                {reply.replyingTo} @
                              </p>
                              <p className='text-sm m-2'>{reply.content}</p>
                              {(user.role == null &&
                                user.id == reply.user_id) ||
                              (user.role == "teacher" &&
                                user.id == reply.teacher_id) ||
                              (user.role == "admin" &&
                                user.id == reply.admin_id) ? null : (
                                <button
                                  className='text-blue-500 text-sm mt-2'
                                  onClick={() => handleReplyClick(reply.id)}
                                >
                                  رد
                                </button>
                              )}

                              <div>
                                {replyingToId === reply.id && (
                                  <div className='mt-2 flex items-center gap-2 '>
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
                                          reply.user_id,
                                          reply.teacher_id,
                                          reply.admin_id
                                        )
                                      }
                                      isLoading={replyLoading}
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
                              </div>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
                <div>
                  {(user.role == null && user.id == commint.user_id) ||
                  (user.role == "teacher" && user.id == commint.teacher_id) ||
                  user.role == "admin" ? (
                    <div>
                      <Menu>
                        <MenuButton
                          as={IconButton}
                          icon={<MdMoreHoriz />}
                          variant='ghost'
                          aria-label='Options'
                        />
                        <MenuList>
                          <MenuItem onClick={() => openEditModal(commint)}>
                            تعديل
                          </MenuItem>
                          <MenuItem onClick={() => deletecommint(commint.id)}>
                            حذف
                          </MenuItem>
                        </MenuList>
                      </Menu>
                    </div>
                  ) : null}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Commint;
