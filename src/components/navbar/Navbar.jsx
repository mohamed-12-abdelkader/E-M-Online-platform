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
import logo from "../../img/Red_and_Blue_Badminton_Team_Sport_Logo__6_-removebg-preview.png";
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
  const { isOpen, onOpen, onClose } = useDisclosure();
  const isMobile = useBreakpointValue({ base: true, md: false });
  const [eventsLoading, events] = useGitEvents();

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
          <img src={logo} className='h-[80px] w-[120px] my-2' alt='logo' />
        </Link>

        <Flex alignItems={"center"}>
          <Stack direction={"row"} spacing={4}>
            <Button
              onClick={toggleColorMode}
              className='my-2'
              variant='outline'
              leftIcon={colorMode === "light" ? <FaMoon /> : <FaSun />}
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
                  <PopoverContent width='300px'>
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
                  <Button onClick={onOpen} variant='outline'>
                    ☰
                  </Button>
                )}

                <Drawer isOpen={isOpen} placement='right' onClose={onClose}>
                  <DrawerOverlay />
                  <DrawerContent>
                    <DrawerHeader className='flex'>
                      <DrawerCloseButton className='' dir='ltr' />
                      <h1 className='mt-5'>
                        مرحباً: {user.name || user.fname + " " + user.lname}
                      </h1>
                    </DrawerHeader>
                    <DrawerBody>
                      <Links onClose={onClose} />
                    </DrawerBody>
                  </DrawerContent>
                </Drawer>
              </>
            ) : (
              <Stack direction='row' spacing={2}>
                <Link to='/login'>
                  <img
                    src='log in (1).png'
                    className='h-[60px] w-[160px]'
                    alt='login'
                  />
                </Link>
                <Link to='/signup'>
                  <img
                    src='signup2.png'
                    className='h-[60px] w-[160px]'
                    alt='signup'
                  />
                </Link>
              </Stack>
            )}
          </Stack>
        </Flex>
      </Flex>
    </Box>
  );
}
