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
  VStack,
  HStack,
  Badge,
  Icon,
  Divider,
} from "@chakra-ui/react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useState, useEffect } from "react";

import { FaHeart, FaMoon, FaRegComment, FaReply, FaSun, FaBookOpen, FaVideo, FaFileAlt, FaBell, FaCheck } from "react-icons/fa";
import { Link } from "react-router-dom";
import { MdNotificationsActive } from "react-icons/md";
import logo from "../../../public/Picsart_25-08-26_23-28-39-014.png";
import logo2 from "../../../public/logooo.png";
import baseUrl from "../../api/baseUrl";

import Links from "../links/Links";

export default function Nav() {
  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");
  const { colorMode, toggleColorMode } = useColorMode();
 
  const { isOpen, onOpen, onClose } = useDisclosure();
  const isMobile = useBreakpointValue({ base: true, md: false });

  const { scrollYProgress } = useScroll();
  const scaleX = useTransform(scrollYProgress, [0, 1], [0, 1]);

  // State for notifications
  const [notifications, setNotifications] = useState({ notifications: [] });
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [hasFetched, setHasFetched] = useState(false);

  const handleDrawerOpen = () => {
    if (!isOpen) {
      onOpen();
    }
  };

  // Fetch notifications from API
  const fetchNotifications = async () => {
    if (!user || !token) return;
    
    try {
      setNotificationsLoading(true);
      const response = await baseUrl.get('/api/notifications/', {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      // Check if response has valid data
      if (response.data && response.data.notifications) {
        setNotifications(response.data);
        
        // Calculate unread count
        const unread = response.data.notifications.filter(notif => !notif.is_read).length;
        setUnreadCount(unread);
      } else {
        setNotifications({ notifications: [] });
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      
      // Check if error message indicates session expired
      if (error.response && error.response.data && error.response.data.message === "Session expired or replaced") {
        // Clear localStorage and redirect to login
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        window.location.href = "/login";
        return;
      }
      
      setNotifications({ notifications: [] });
      setUnreadCount(0);
    } finally {
      setNotificationsLoading(false);
      setHasFetched(true);
    }
  };

  // Fetch notifications on component mount only
  useEffect(() => {
    if (user && token && !hasFetched) {
      fetchNotifications();
    }
  }, [user, token, hasFetched]);

  // Function to mark notification as read
  const markAsRead = async (notificationId) => {
    try {
      await baseUrl.put(`/api/notifications/${notificationId}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      // Update local state
      setNotifications(prev => ({
        ...prev,
        notifications: prev.notifications.map(notif => 
          notif.id === notificationId ? { ...notif, is_read: true } : notif
        )
      }));
      
      // Update unread count
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
      
      // Check if error message indicates session expired
      if (error.response && error.response.data && error.response.data.message === "Session expired or replaced") {
        // Clear localStorage and redirect to login
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        window.location.href = "/login";
        return;
      }
    }
  };

  return (
    <>
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
        borderBottom={"2px solid #ccc"}
      >
        <Flex h={16} alignItems={"center"} justifyContent={"space-between"}>
          <Link to={user ? `/home` : "/"}>
       
            <div className="flex items-center space-x-2 space-x-reverse">
                 <img  src={logo} alt="شعار أكاديمية EM"  className="h-[65px] w-auto" />
                                
           </div>
          </Link>

          <Flex alignItems={"center"} className='mt-4'>
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
                      <Button
                        variant='ghost'
                        position='relative'
                        className='mt-2'
                      >
                        <MdNotificationsActive className='text-3xl' />
                        {unreadCount > 0 && (
                          <Badge
                            position="absolute"
                            top="-2"
                            right="-2"
                            colorScheme="red"
                            borderRadius="full"
                            fontSize="xs"
                            minW="20px"
                            h="20px"
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                          >
                            {unreadCount > 99 ? '99+' : unreadCount}
                          </Badge>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent
                      width='300px'
                      style={{ transition: "all 0.3s ease" }}
                    >
                      <PopoverArrow />
                      <PopoverCloseButton />
                      <PopoverHeader fontWeight='bold' borderBottomWidth="1px" borderColor="gray.200" pb={3}>
                        <HStack spacing={2}>
                          <Icon as={FaBell} color="blue.500" />
                          <Text>الإشعارات</Text>
                        
                        </HStack>
                      </PopoverHeader>
                      <PopoverBody maxH='400px' overflowY='auto' p={0}>
                        {notificationsLoading ? (
                          <VStack spacing={4} py={6}>
                            <Icon as={FaBell} color="gray.400" boxSize={8} />
                            <Text color="gray.500" fontSize="sm">جاري تحميل الإشعارات...</Text>
                          </VStack>
                        ) : notifications && notifications.notifications && notifications.notifications.length > 0 ? (
                          <VStack spacing={0} align="stretch">
                            {notifications.notifications.map((notification, index) => (
                              <Box
                                key={notification.id}
                                p={4}
                                borderBottom={index < notifications.notifications.length - 1 ? '1px solid' : 'none'}
                                borderColor="gray.100"
                                _hover={{ bg: useColorModeValue("gray.50", "gray.700") }}
                                transition="all 0.2s ease"
                                cursor="pointer"
                                position="relative"
                                bg={!notification.is_read ? useColorModeValue("blue.50", "blue.900") : "transparent"}
                                onClick={() => {
                                  // Mark as read if not already read
                                  if (!notification.is_read) {
                                    markAsRead(notification.id);
                                  }
                                  
                                  // Navigate based on notification type
                                  if (notification.type === 'lecture_added') {
                                    window.location.href = `/CourseDetailsPage/${notification.course_id}`;
                                  } else if (notification.type === 'video_added') {
                                    window.location.href = `/CourseDetailsPage/${notification.course_id}`;
                                  } else {
                                    window.location.href = `/CourseDetailsPage/${notification.course_id}`;
                                  }
                                }}
                              >
                                <HStack spacing={3} align="flex-start">
                                  <Box
                                    p={2}
                                    borderRadius="full"
                                    bg={notification.type === "lecture_added" ? "blue.500" : 
                                        notification.type === "video_added" ? "green.500" : "purple.500"}
                                    color="white"
                                    shadow="md"
                                  >
                                    <Icon 
                                      as={notification.type === "lecture_added" ? FaBookOpen : 
                                          notification.type === "video_added" ? FaVideo : FaFileAlt} 
                                      boxSize={4} 
                                    />
                                  </Box>
                                  
                                  <VStack align="flex-start" spacing={2} flex={1}>
                                    <VStack align="flex-start" spacing={1} w="full">
                                      <Text fontWeight="bold" fontSize="sm" color={useColorModeValue("gray.800", "gray.100")}>
                                        {notification.title}
                                      </Text>
                                      <Text fontSize="xs" color="gray.500" noOfLines={2}>
                                        {notification.message}
                                      </Text>
                                    </VStack>
                                    
                                    <VStack align="flex-start" spacing={1} w="full">
                                      <HStack spacing={2} w="full">
                                        <Badge colorScheme="blue" size="sm" fontSize="xs">
                                          {notification.course_title}
                                        </Badge>
                                        {!notification.is_read && (
                                          <Badge colorScheme="red" size="sm" fontSize="xs">
                                            جديد
                                          </Badge>
                                        )}
                                      </HStack>
                                      
                                      <Text fontSize="xs" color="gray.400">
                                        {new Date(notification.created_at).toLocaleDateString('ar-EG', {
                                          year: 'numeric',
                                          month: 'short',
                                          day: 'numeric',
                                          hour: '2-digit',
                                          minute: '2-digit'
                                        })}
                                      </Text>
                                    </VStack>
                                  </VStack>
                                  
                                  {!notification.is_read && (
                                    <Box
                                      position="absolute"
                                      top={3}
                                      right={3}
                                      w={2}
                                      h={2}
                                      borderRadius="full"
                                      bg="red.500"
                                    />
                                  )}
                                </HStack>
                              </Box>
                            ))}
                          </VStack>
                        ) : (
                          <VStack spacing={4} py={8}>
                            <Icon as={FaBell} color="gray.400" boxSize={12} />
                            <Text color="gray.500" fontSize="sm" textAlign="center">
                              لا توجد إشعارات جديدة
                            </Text>
                          </VStack>
                        )}
                      </PopoverBody>
                      <PopoverFooter textAlign='center' borderTopWidth="1px" borderColor="gray.200" pt={3}>
                        <Button 
                          size='sm' 
                          variant='link' 
                          colorScheme="blue"
                          onClick={() => {
                            // Refresh notifications
                            fetchNotifications();
                          }}
                          isLoading={notificationsLoading}
                        >
                          تحديث الإشعارات
                        </Button>
                      </PopoverFooter>
                    </PopoverContent>
                  </Popover>

                  {isMobile && (
                    <Button
                      onClick={handleDrawerOpen} // التحقق من حالة الفتح
                      variant='outline'
                      className='mt-2'
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
                        <Links isSidebarOpen={true} onClose={onClose} />
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
      {/* شريط تقدم التمرير */}
      <motion.div
        style={{ scaleX }}
        className="fixed left-0 top-[80px] h-1 w-full bg-gradient-to-r from-blue-500 via-purple-500 to-orange-500 origin-left z-[999]"
      />
    </>
  );
}
