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
  useToast,
} from "@chakra-ui/react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useState, useEffect, useRef } from "react";

import { FaHeart, FaMoon, FaRegComment, FaReply, FaSun, FaBookOpen, FaVideo, FaFileAlt, FaBell, FaCheck, FaComments, FaThumbsUp, FaHeart as FaHeartSolid, FaHandsHelping, FaGraduationCap, FaClipboardList, FaFilePdf, FaPlayCircle, FaBook, FaUserGraduate, FaChalkboardTeacher, FaUsers, FaShare, FaEdit, FaExclamationCircle } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { MdNotificationsActive } from "react-icons/md";
import logo from "../../../public/Picsart_25-08-26_23-28-39-014.png";
import logo2 from "../../../public/logooo.png";
import baseUrl from "../../api/baseUrl";

import Links from "../links/Links";

export default function Nav() {
  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");
  const { colorMode, toggleColorMode } = useColorMode();
  const toast = useToast();
  const navigate = useNavigate();
 
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isNotificationOpen, onOpen: onNotificationOpen, onClose: onNotificationClose } = useDisclosure();
  const isMobile = useBreakpointValue({ base: true, md: false });

  const { scrollYProgress } = useScroll();
  const scaleX = useTransform(scrollYProgress, [0, 1], [0, 1]);

  // State for notifications
  const [notifications, setNotifications] = useState({ notifications: [] });
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [hasFetched, setHasFetched] = useState(false);
  const fetchTimeoutRef = useRef(null);
  const isFetchingRef = useRef(false);
  const lastFetchTimeRef = useRef(0);

  const handleDrawerOpen = () => {
    if (!isOpen) {
      onOpen();
    }
  };

  // Fetch notifications from API
  const fetchNotifications = async (forceRefresh = false) => {
    if (!user || !token) return;
    
    const now = Date.now();
    const timeSinceLastFetch = now - lastFetchTimeRef.current;
    
    // Prevent requests if less than 2 seconds have passed since last fetch (unless force refresh)
    if (!forceRefresh && timeSinceLastFetch < 2000) {
      console.log('Too soon since last fetch, skipping...');
      return;
    }
    
    // Clear any existing timeout
    if (fetchTimeoutRef.current) {
      clearTimeout(fetchTimeoutRef.current);
      fetchTimeoutRef.current = null;
    }
    
    // Prevent multiple simultaneous requests
    if (isFetchingRef.current && !forceRefresh) {
      console.log('Already fetching notifications, skipping...');
      return;
    }
    
    // Add a small delay to prevent rapid successive calls
    if (!forceRefresh) {
      fetchTimeoutRef.current = setTimeout(async () => {
        lastFetchTimeRef.current = Date.now();
        await performFetch();
      }, 100);
    } else {
      lastFetchTimeRef.current = Date.now();
      await performFetch();
    }
  };

  const performFetch = async () => {
    if (!user || !token) return;
    
    try {
      isFetchingRef.current = true;
      setNotificationsLoading(true);
      
      console.log('Fetching notifications...');
      const response = await baseUrl.get('/api/notifications/', {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      // Check if response has valid data
      if (response.data && response.data.notifications) {
        setNotifications(response.data);
        
        // Calculate unread count
        const unread = response.data.notifications.filter(notif => !notif.is_read).length;
        setUnreadCount(unread);
        console.log(`Fetched ${response.data.notifications.length} notifications, ${unread} unread`);
      } else {
        setNotifications({ notifications: [] });
        setUnreadCount(0);
        console.log('No notifications found');
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
      isFetchingRef.current = false;
      setNotificationsLoading(false);
      setHasFetched(true);
    }
  };


  // Fetch notifications on component mount only
  useEffect(() => {
    if (user && token && !hasFetched && !isFetchingRef.current) {
      console.log('Initial fetch of notifications');
      fetchNotifications();
    }
  }, [user, token, hasFetched]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Clear any pending fetch timeout
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
        fetchTimeoutRef.current = null;
      }
    };
  }, []);

  // Function to get notification icon based on type
  const getNotificationIcon = (notification) => {
    switch (notification.type) {
      case 'lecture_added':
        return FaBookOpen;
      case 'video_added':
        return FaPlayCircle;
      case 'file_added':
        return FaFilePdf;
      case 'exam_added':
        return FaClipboardList;
      case 'course_added':
        return FaGraduationCap;
      case 'chat_message':
        return FaComments;
      case 'social_comment':
        return FaRegComment;
      case 'social_reply':
        return FaReply;
      case 'social_reaction':
        if (notification.social_reaction_type === 'like') return FaThumbsUp;
        if (notification.social_reaction_type === 'love') return FaHeartSolid;
        if (notification.social_reaction_type === 'support') return FaHandsHelping;
        return FaThumbsUp;
      case 'social_post':
        return FaShare;
      case 'teacher_message':
        return FaChalkboardTeacher;
      case 'student_message':
        return FaUserGraduate;
      case 'group_message':
        return FaUsers;
      case 'announcement':
        return FaExclamationCircle;
      default:
        return FaBell;
    }
  };

  // Function to get notification color based on type
  const getNotificationColor = (notification) => {
    switch (notification.type) {
      case 'lecture_added':
      case 'video_added':
      case 'file_added':
      case 'exam_added':
      case 'course_added':
        return 'blue';
      case 'chat_message':
      case 'teacher_message':
      case 'student_message':
      case 'group_message':
        return 'green';
      case 'social_comment':
      case 'social_reply':
        return 'orange';
      case 'social_reaction':
        return 'purple';
      case 'social_post':
        return 'pink';
      case 'announcement':
        return 'red';
      default:
        return 'gray';
    }
  };

  // Function to get navigation path based on notification type
  const getNotificationPath = (notification) => {
    switch (notification.type) {
      case 'lecture_added':
      case 'video_added':
      case 'file_added':
      case 'exam_added':
      case 'course_added':
        return notification.course_id ? `/CourseDetailsPage/${notification.course_id}` : '/home';
      case 'chat_message':
      case 'teacher_message':
      case 'student_message':
      case 'group_message':
        return '/TeacherChat';
      case 'social_comment':
      case 'social_reply':
      case 'social_reaction':
      case 'social_post':
        return '/social';
      case 'announcement':
        return '/home';
      default:
        return '/home';
    }
  };

  // Function to mark notification as read
  const markAsRead = async (notificationId) => {
    try {
      console.log(`Marking notification ${notificationId} as read`);
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
      console.log(`Notification ${notificationId} marked as read`);
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
                  <Popover 
                    placement='bottom-end' 
                    isLazy
                    isOpen={isNotificationOpen}
                    onClose={onNotificationClose}
                  >
                    <PopoverTrigger>
                      <Button
                        variant='ghost'
                        position='relative'
                        className='mt-2'
                        onClick={onNotificationOpen}
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
                      width='350px'
                      maxW="90vw"
                      style={{ transition: "all 0.3s ease" }}
                      borderRadius="xl"
                      shadow="2xl"
                      border="none"
                      bg={useColorModeValue("white", "gray.800")}
                    >
                      <PopoverArrow />
                      <PopoverCloseButton />
                      <PopoverHeader 
                        fontWeight='bold' 
                        borderBottomWidth="1px" 
                        borderColor={useColorModeValue("gray.200", "gray.600")} 
                        pb={4}
                        pt={4}
                        px={6}
                        bg={useColorModeValue("gray.50", "gray.700")}
                        borderRadius="xl 0 0 0"
                      >
                        <HStack spacing={3} justify="space-between">
                          <HStack spacing={3}>
                            <Box
                              p={2}
                              borderRadius="lg"
                              bg="blue.500"
                              color="white"
                            >
                              <Icon as={FaBell} boxSize={4} />
                            </Box>
                            <VStack align="flex-start" spacing={0}>
                              <Text fontSize="lg" fontWeight="bold">
                                الإشعارات
                              </Text>
                              <Text fontSize="xs" color="gray.500">
                                {unreadCount > 0 ? `${unreadCount} إشعار جديد` : 'لا توجد إشعارات جديدة'}
                              </Text>
                            </VStack>
                          </HStack>
                        
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
                                _hover={{ 
                                  bg: useColorModeValue(`${getNotificationColor(notification)}.100`, `${getNotificationColor(notification)}.800`),
                                  transform: 'translateX(4px)',
                                  shadow: 'md'
                                }}
                                transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                                cursor="pointer"
                                position="relative"
                                bg={!notification.is_read ? useColorModeValue(`${getNotificationColor(notification)}.50`, `${getNotificationColor(notification)}.900`) : "transparent"}
                                borderRadius="lg"
                                mx={2}
                                my={1}
                                borderLeft={!notification.is_read ? `4px solid` : '4px solid transparent'}
                                borderLeftColor={!notification.is_read ? `${getNotificationColor(notification)}.500` : 'transparent'}
                                onClick={() => {
                                  // Mark as read if not already read
                                  if (!notification.is_read) {
                                    markAsRead(notification.id);
                                  }
                                  
                                  // Close the notification popover
                                  onNotificationClose();
                                  
                                  // Navigate based on notification type using React Router
                                  const path = getNotificationPath(notification);
                                  navigate(path);
                                }}
                              >
                                <HStack spacing={3} align="flex-start">
                                  <Box
                                    p={3}
                                    borderRadius="xl"
                                    bg={`${getNotificationColor(notification)}.500`}
                                    color="white"
                                    shadow="lg"
                                    position="relative"
                                    _before={{
                                      content: '""',
                                      position: 'absolute',
                                      top: 0,
                                      left: 0,
                                      right: 0,
                                      bottom: 0,
                                      borderRadius: 'xl',
                                      bg: 'white',
                                      opacity: 0.1,
                                      transform: 'scale(0.8)',
                                      transition: 'all 0.3s ease'
                                    }}
                                    _hover={{
                                      transform: 'scale(1.1)',
                                      shadow: 'xl'
                                    }}
                                    transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                                  >
                                    <Icon 
                                      as={getNotificationIcon(notification)} 
                                      boxSize={5} 
                                    />
                                  </Box>
                                  
                                  <VStack align="flex-start" spacing={3} flex={1}>
                                    <VStack align="flex-start" spacing={2} w="full">
                                      <Text 
                                        fontWeight="bold" 
                                        fontSize="md" 
                                        color={useColorModeValue("gray.800", "gray.100")}
                                        lineHeight="1.4"
                                      >
                                        {notification.title}
                                      </Text>
                                      <Text 
                                        fontSize="sm" 
                                        color={useColorModeValue("gray.600", "gray.300")} 
                                        noOfLines={2}
                                        lineHeight="1.5"
                                      >
                                        {notification.message}
                                      </Text>
                                    </VStack>
                                    
                                    <VStack align="flex-start" spacing={2} w="full">
                                      <HStack spacing={2} w="full" flexWrap="wrap">
                                        {notification.course_title && (
                                          <Badge 
                                            colorScheme={getNotificationColor(notification)} 
                                            size="md" 
                                            fontSize="xs"
                                            px={3}
                                            py={1}
                                            borderRadius="full"
                                            fontWeight="semibold"
                                          >
                                            {notification.course_title}
                                          </Badge>
                                        )}
                                        {!notification.is_read && (
                                          <Badge 
                                            colorScheme="red" 
                                            size="md" 
                                            fontSize="xs"
                                            px={3}
                                            py={1}
                                            borderRadius="full"
                                            fontWeight="bold"
                                            animation="pulse 2s infinite"
                                          >
                                            جديد
                                          </Badge>
                                        )}
                                        <Badge 
                                          colorScheme={getNotificationColor(notification)} 
                                          variant="subtle" 
                                          size="md" 
                                          fontSize="xs"
                                          px={3}
                                          py={1}
                                          borderRadius="full"
                                          fontWeight="medium"
                                        >
                                          {notification.type === 'lecture_added' ? 'محاضرة' :
                                           notification.type === 'video_added' ? 'فيديو' :
                                           notification.type === 'file_added' ? 'ملف' :
                                           notification.type === 'exam_added' ? 'امتحان' :
                                           notification.type === 'course_added' ? 'كورس' :
                                           notification.type === 'chat_message' ? 'دردشة' :
                                           notification.type === 'social_comment' ? 'تعليق' :
                                           notification.type === 'social_reply' ? 'رد' :
                                           notification.type === 'social_reaction' ? 'تفاعل' :
                                           notification.type === 'social_post' ? 'منشور' :
                                           notification.type === 'announcement' ? 'إعلان' :
                                           'إشعار'}
                                        </Badge>
                                      </HStack>
                                      
                                      <HStack spacing={2} w="full" justify="space-between">
                                        <Text 
                                          fontSize="xs" 
                                          color={useColorModeValue("gray.500", "gray.400")}
                                          fontWeight="medium"
                                        >
                                          {new Date(notification.created_at).toLocaleDateString('ar-EG', {
                                            year: 'numeric',
                                            month: 'short',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                          })}
                                        </Text>
                                        {!notification.is_read && (
                                          <Box
                                            w="8px"
                                            h="8px"
                                            borderRadius="full"
                                            bg={`${getNotificationColor(notification)}.500`}
                                            animation="pulse 2s infinite"
                                          />
                                        )}
                                      </HStack>
                                    </VStack>
                                  </VStack>
                                  
                                  {!notification.is_read && (
                                    <Box
                                      position="absolute"
                                      top={4}
                                      right={4}
                                      w={3}
                                      h={3}
                                      borderRadius="full"
                                      bg={`${getNotificationColor(notification)}.500`}
                                      shadow="md"
                                      _before={{
                                        content: '""',
                                        position: 'absolute',
                                        top: '-2px',
                                        left: '-2px',
                                        right: '-2px',
                                        bottom: '-2px',
                                        borderRadius: 'full',
                                        bg: `${getNotificationColor(notification)}.200`,
                                        opacity: 0.6,
                                        animation: 'pulse 2s infinite'
                                      }}
                                    />
                                  )}
                                </HStack>
                              </Box>
                            ))}
                          </VStack>
                        ) : (
                          <VStack spacing={6} py={12}>
                            <Box
                              p={6}
                              borderRadius="full"
                              bg={useColorModeValue("gray.100", "gray.700")}
                              color="gray.400"
                            >
                              <Icon as={FaBell} boxSize={16} />
                            </Box>
                            <VStack spacing={2}>
                              <Text 
                                color={useColorModeValue("gray.600", "gray.300")} 
                                fontSize="lg" 
                                fontWeight="semibold"
                                textAlign="center"
                              >
                                لا توجد إشعارات جديدة
                              </Text>
                              <Text 
                                color={useColorModeValue("gray.500", "gray.400")} 
                                fontSize="sm" 
                                textAlign="center"
                                maxW="200px"
                              >
                                ستظهر الإشعارات الجديدة هنا عند وصولها
                              </Text>
                            </VStack>
                          </VStack>
                        )}
                      </PopoverBody>
                      <PopoverFooter 
                        textAlign='center' 
                        borderTopWidth="1px" 
                        borderColor={useColorModeValue("gray.200", "gray.600")} 
                        pt={4}
                        pb={4}
                        px={6}
                        bg={useColorModeValue("gray.50", "gray.700")}
                        borderRadius="0 0 xl xl"
                      >
                        <HStack spacing={3} justify="center">
                          <Button 
                            size='sm' 
                            variant='solid' 
                            colorScheme="blue"
                            borderRadius="full"
                            px={6}
                            onClick={() => {
                              // Refresh notifications with force refresh
                              fetchNotifications(true);
                              // Keep popover open after refresh
                            }}
                            isLoading={notificationsLoading}
                            leftIcon={<Icon as={FaBell} />}
                          >
                            تحديث الإشعارات
                          </Button>
                        </HStack>
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
