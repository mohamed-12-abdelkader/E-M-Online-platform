import {
  Box,
  Flex,
  Avatar,
  Button,
  Stack,
  useColorMode,
  useColorModeValue,
  useBreakpointValue,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  useDisclosure,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverHeader,
  PopoverBody,
  PopoverCloseButton,
  PopoverArrow,
  PopoverFooter,
  Text,
} from "@chakra-ui/react";

import { FaHeart, FaMoon, FaRegComment, FaReply, FaSun } from "react-icons/fa";
import { Link } from "react-router-dom";
import { MdNotificationsActive } from "react-icons/md";
import logo from "../../../public/2 (5).png";
import logo2 from "../../../public/3 (5).png";
import UserType from "../../Hooks/auth/userType";
import MyWallet from "../../Hooks/student/MyWallet";
import useGitNotification from "../../Hooks/posts/useGitNotification";
import Links from "../links/Links";
import useGitEvents from "../../Hooks/posts/useGitEvents";

export default function Nav() {
  const [walletLoading, myWallet] = MyWallet();
  const [userData, isAdmin, isTeacher, student] = UserType();
  const user = JSON.parse(localStorage.getItem("user"));
  const { colorMode, toggleColorMode } = useColorMode();
  const [notificationsLoading, notifications] = useGitNotification();
  const { isOpen, onOpen, onClose } = useDisclosure(); // تعريف onClose هنا
  const isMobile = useBreakpointValue({ base: true, md: false });
  const [eventsLoading, events] = useGitEvents();

  const handleDrawerOpen = () => {
    if (!isOpen) {
      onOpen();
    }
  };

  return (
    <Box
      bg={useColorModeValue("gray.100", "gray.900")}
      px={4}
      position='fixed'
      top={0}
      left={0}
      width='100%'
      height='80px'
      zIndex={1000}
      style={{ direction: "ltr" }}
    >
      <Flex h={16} alignItems={"center"} justifyContent={"space-between"}>
        <Link to={user ? `/home` : "/"}>
          <img
            src={colorMode === "light" ? logo : logo2}
            className='h-[150px] w-[] mt-3'
            alt='logo'
          />
        </Link>

        <Flex alignItems={"center"}>
          <Stack direction={"row"} spacing={1}>
            <Button
              width={"20px"}
              onClick={toggleColorMode}
              variant='outline'
              leftIcon={
                colorMode === "light" ? (
                  <FaMoon className='mx-2' />
                ) : (
                  <FaSun className='mx-2' />
                )
              }
              style={{ transition: "all 0.2s ease" }} // سريع
              className='my-2 flex justify-center p-2'
            >
              {colorMode === "light" ? " " : " "}
            </Button>

            {user ? (
              <>
                <Popover placement='bottom-end' isLazy>
                  <PopoverTrigger>
                    <Button variant='ghost' position='relative'>
                      <MdNotificationsActive className='text-3xl' />
                      {events?.totalEvents > 0 && (
                        <Text
                          fontSize='xs'
                          color='white'
                          bg='red.500'
                          borderRadius='full'
                          position='absolute'
                          top='-1'
                          right='-1'
                          px='2'
                          py='0.5'
                          lineHeight='shorter'
                        >
                          {events.totalEvents}
                        </Text>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    width='300px'
                    style={{ transition: "all 0.3s ease" }}
                  >
                    <PopoverArrow />
                    <PopoverCloseButton />
                    <PopoverHeader fontWeight='bold'>
                      Notifications
                    </PopoverHeader>
                    <PopoverBody maxH='300px' overflowY='auto'>
                      {notificationsLoading ? (
                        <p>Loading...</p>
                      ) : notifications?.notifications?.length > 0 ? (
                        notifications.notifications.map((notification) => (
                          <Link
                            to={`post/${notification.post_id}`}
                            key={notification.id}
                          >
                            <Box
                              p={2}
                              borderBottom='1px solid'
                              borderColor='gray.200'
                              _hover={{ bg: "gray.100" }}
                              style={{ transition: "background 0.2s ease" }} // تأثير سريع
                            >
                              <Flex alignItems='center'>
                                <Avatar
                                  size='sm'
                                  src={notification.interactors[0]?.from?.cover}
                                  name={
                                    notification.interactors[0]?.from?.username
                                  }
                                />
                                <Box ml={3}>
                                  <Flex alignItems='center'>
                                    {notification.variant === "reply" && (
                                      <FaReply className='text-xl text-blue-500' />
                                    )}
                                    {notification.variant === "likes" && (
                                      <FaHeart className='text-xl text-red-500' />
                                    )}
                                    {notification.variant === "comments" && (
                                      <FaRegComment className='text-xl text-green-500' />
                                    )}
                                    <p className='ml-2'>
                                      <strong>
                                        {
                                          notification.interactors[0]?.from
                                            ?.username
                                        }
                                      </strong>{" "}
                                      قام بفعل ما!
                                    </p>
                                  </Flex>
                                  <p className='text-gray-500 text-xs'>
                                    {new Date(
                                      notification.last_event
                                    ).toLocaleString()}
                                  </p>
                                </Box>
                              </Flex>
                            </Box>
                          </Link>
                        ))
                      ) : (
                        <p>No new notifications</p>
                      )}
                    </PopoverBody>
                    <PopoverFooter textAlign='center'>
                      <Button size='sm' variant='link' onClick={onClose}>
                        View All Notifications
                      </Button>
                    </PopoverFooter>
                  </PopoverContent>
                </Popover>

                {isMobile && (
                  <Button
                    onClick={handleDrawerOpen} // التحقق من حالة الفتح
                    variant='outline'
                    style={{ transition: "all 0.3s ease" }} // سريع
                  >
                    ☰
                  </Button>
                )}

                <Drawer isOpen={isOpen} placement='right' onClose={onClose}>
                  <DrawerOverlay />
                  <DrawerContent>
                    <DrawerHeader className='flex'>
                      <DrawerCloseButton className='' dir='ltr' />
                      <h1 className='mt-5'>
                        مرحباً: {user.name || `${user.fname} ${user.lname}`}
                      </h1>
                    </DrawerHeader>
                    <DrawerBody>
                      <Links onClose={onClose} />
                      {/* إرسال onClose إلى Links */}
                    </DrawerBody>
                  </DrawerContent>
                </Drawer>
              </>
            ) : (
              <div className='flex' direction='row'>
                <Link to='/login'>
                  <img
                    src='log in (1).png'
                    className='h-[60px] w-[150px]'
                    alt='login'
                  />
                </Link>
                <Link to='/signup'>
                  <img
                    src='signup2.png'
                    className='h-[60px] w-[150px]'
                    alt='signup'
                  />
                </Link>
              </div>
            )}
          </Stack>
        </Flex>
      </Flex>
    </Box>
  );
}
