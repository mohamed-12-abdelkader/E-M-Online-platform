import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Box,
  Flex,
  Text,
  VStack,
  HStack,
  Input,
  InputGroup,
  InputLeftElement,
  Button,
  Badge,
  Avatar,
  Divider,
  Select,
  IconButton,
  useToast,
  Spinner,
  Center,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  useDisclosure,
  FormControl,
  FormLabel,
  Textarea,
  Image,
  useColorModeValue,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  Tag,
  TagLabel,
  Icon,
} from '@chakra-ui/react';
import {
  FaSearch,
  FaPaperPlane,
  FaImage,
  FaMicrophone,
  FaTimes,
  FaCheck,
  FaEdit,
  FaTrash,
  FaPlus,
  FaUser,
  FaRobot,
  FaClock,
  FaFilter,
  FaQuestionCircle,
  FaFileAlt,
  FaPlay,
  FaPause,
} from 'react-icons/fa';
import { io } from 'socket.io-client';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/ar';
import { toast } from 'react-toastify';
import baseUrl from '../../api/baseUrl';

dayjs.extend(relativeTime);
dayjs.locale('ar');

const SupportChatAdmin = () => {
  const toastChakra = useToast();
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(false);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [pagination, setPagination] = useState({ total: 0, limit: 50, offset: 0, has_more: false });
  const [unreadCount, setUnreadCount] = useState(0);
  const [faqs, setFaqs] = useState([]);
  const [faqLoading, setFaqLoading] = useState(false);
  const [typing, setTyping] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const audioInputRef = useRef(null);
  const audioRecorderRef = useRef(null);
  const [recording, setRecording] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  
  const faqModal = useDisclosure();
  const deleteFaqModal = useDisclosure();
  const [editingFaq, setEditingFaq] = useState(null);
  const [faqForm, setFaqForm] = useState({
    question: '',
    answer: '',
    keywords: '',
    priority: 0,
    is_active: true,
  });
  const [deleteFaqId, setDeleteFaqId] = useState(null);

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const hoverBg = useColorModeValue('gray.50', 'gray.700');

  const authHeader = useMemo(() => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, []);

  const socketEndpoint = useMemo(() => {
    try {
      const url = new URL(baseUrl.defaults.baseURL || window.location.origin);
      return url.origin;
    } catch {
      return window.location.origin;
    }
  }, []);

  // Socket.io connection
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    const socket = io(socketEndpoint, {
      path: '/socket.io',
      withCredentials: true,
      auth: { token },
      transports: ['websocket'],
      reconnection: true,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('✅ Connected as admin');
    });

    socket.on('message:receive', (data) => {
      if (data.chat_id === selectedChat?.id) {
        setMessages(prev => [...prev, data.message]);
        scrollToBottom();
      }
      // Update chat list
      fetchChats();
      fetchUnreadCount();
    });

    socket.on('notification:new', (data) => {
      console.log('New notification:', data);
      if (data.type === 'new_message') {
        fetchChats();
        fetchUnreadCount();
        if (data.chat_id !== selectedChat?.id) {
          toast.info(`رسالة جديدة من ${data.student_name}`);
        }
      }
    });

    socket.on('conversation:update', (data) => {
      console.log('Chat updated:', data.conversation);
      const updatedChat = data.conversation;
      
      // Update chat in list
      setChats(prev => {
        const index = prev.findIndex(c => c.id === updatedChat.id);
        if (index >= 0) {
          const newChats = [...prev];
          newChats[index] = updatedChat;
          return newChats;
        } else {
          return [updatedChat, ...prev];
        }
      });
      
      // Update selected chat if it's the same
      if (selectedChat?.id === updatedChat.id) {
        const oldStatus = selectedChat.status;
        setSelectedChat(prev => ({ ...prev, ...updatedChat }));
        
        // Show notification if status changed from waiting_for_admin to admin_handling
        if (oldStatus === 'waiting_for_admin' && updatedChat.status === 'admin_handling') {
          toast.success('تم تغيير حالة المحادثة إلى "الأدمن يتعامل". يمكن للطالب الآن إرسال الرسائل.');
        }
      }
    });

    socket.on('support:typing', (data) => {
      if (data.chat_id === selectedChat?.id) {
        setIsTyping(data.is_typing);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [socketEndpoint, selectedChat]);

  // Join chat room when chat is selected
  useEffect(() => {
    if (selectedChat && socketRef.current) {
      socketRef.current.emit('support:join-chat', selectedChat.id);
      fetchMessages(selectedChat.id);
    }
  }, [selectedChat]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch chats
  const fetchChats = async () => {
    try {
      setLoading(true);
      const params = {
        limit: pagination.limit,
        offset: pagination.offset,
      };
      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }
      const { data } = await baseUrl.get('/api/support/chats', {
        params,
        headers: authHeader,
      });
      setChats(data.chats || []);
      setPagination(data.pagination || {});
    } catch (error) {
      console.error('Error fetching chats:', error);
      toast.error('فشل تحميل المحادثات');
    } finally {
      setLoading(false);
    }
  };

  // Fetch messages
  const fetchMessages = async (chatId) => {
    try {
      setMessagesLoading(true);
      const { data } = await baseUrl.get(`/api/support/chats/${chatId}/messages`, {
        params: { limit: 50 },
        headers: authHeader,
      });
      setMessages(data.messages || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast.error('فشل تحميل الرسائل');
    } finally {
      setMessagesLoading(false);
    }
  };

  // Fetch unread count
  const fetchUnreadCount = async () => {
    try {
      const { data } = await baseUrl.get('/api/support/unread-count', {
        headers: authHeader,
      });
      setUnreadCount(data.unread_count || 0);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  // Fetch FAQs
  const fetchFaqs = async () => {
    try {
      setFaqLoading(true);
      const { data } = await baseUrl.get('/api/support/faq/admin', {
        headers: authHeader,
      });
      setFaqs(data.faqs || []);
    } catch (error) {
      console.error('Error fetching FAQs:', error);
      toast.error('فشل تحميل الأسئلة الشائعة');
    } finally {
      setFaqLoading(false);
    }
  };

  useEffect(() => {
    fetchChats();
    fetchUnreadCount();
    fetchFaqs();
  }, [statusFilter, pagination.offset]);

  // Assign admin to chat
  const handleAssignChat = async (chatId) => {
    try {
      await baseUrl.post(`/api/support/chats/${chatId}/assign`, {}, { headers: authHeader });
      toast.success('تم تعيينك للمحادثة');
      fetchChats();
      if (selectedChat?.id === chatId) {
        setSelectedChat(prev => ({ ...prev, status: 'admin_handling', admin_id: JSON.parse(localStorage.getItem('user'))?.id }));
      }
    } catch (error) {
      console.error('Error assigning chat:', error);
      toast.error('فشل تعيين المحادثة');
    }
  };

  // Update chat status
  const handleUpdateStatus = async (chatId, status) => {
    try {
      await baseUrl.patch(`/api/support/chats/${chatId}/status`, { status }, { headers: authHeader });
      toast.success('تم تحديث حالة المحادثة');
      fetchChats();
      if (selectedChat?.id === chatId) {
        setSelectedChat(prev => ({ ...prev, status }));
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('فشل تحديث الحالة');
    }
  };

  // Send text message
  const handleSendMessage = async () => {
    if (!messageText.trim() || !selectedChat) return;

    try {
      const oldStatus = selectedChat.status;
      const textToSend = messageText;
      
      // Option 1: Send via REST API (recommended)
      const { data } = await baseUrl.post(
        '/api/support/messages',
        { text: textToSend, chat_id: selectedChat.id },
        { headers: authHeader }
      );
      
      // Option 2: Or send via Socket.io (alternative)
      // if (socketRef.current) {
      //   socketRef.current.emit('support:send-message', {
      //     chat_id: selectedChat.id,
      //     text: textToSend
      //   });
      // }
      
      setMessages(prev => [...prev, data.message]);
      setMessageText('');
      scrollToBottom();
      
      // Stop typing indicator
      if (socketRef.current) {
        socketRef.current.emit('support:typing', { chat_id: selectedChat.id, is_typing: false });
      }
      
      // Refresh chat status after sending (status may have changed from waiting_for_admin to admin_handling)
      // The conversation:update event will also handle this, but we refresh to be sure
      setTimeout(async () => {
        try {
          const chatResponse = await baseUrl.get('/api/support/chats', {
            params: { limit: 100, offset: 0 },
            headers: authHeader,
          });
          const updatedChat = chatResponse.data.chats?.find(c => c.id === selectedChat.id);
          
          if (updatedChat) {
            setSelectedChat(prev => ({ ...prev, ...updatedChat }));
            setChats(prev => prev.map(chat => 
              chat.id === updatedChat.id ? updatedChat : chat
            ));
            
            // Show notification if status changed
            if (oldStatus === 'waiting_for_admin' && updatedChat.status === 'admin_handling') {
              toast.success('تم تغيير حالة المحادثة إلى "الأدمن يتعامل". يمكن للطالب الآن إرسال الرسائل.');
            }
          }
        } catch (err) {
          console.error('Error refreshing chat status:', err);
        }
      }, 500);
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('فشل إرسال الرسالة');
    }
  };

  // Send media message
  const handleSendMedia = async () => {
    if (!selectedFile || !selectedChat) return;

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('chat_id', selectedChat.id);
      if (messageText.trim()) {
        formData.append('text', messageText);
      }

      const { data } = await baseUrl.post('/api/support/messages/media', formData, {
        headers: { ...authHeader, 'Content-Type': 'multipart/form-data' },
      });
      
      setMessages(prev => [...prev, data.message]);
      setSelectedFile(null);
      setPreviewUrl(null);
      setMessageText('');
      scrollToBottom();
    } catch (error) {
      console.error('Error sending media:', error);
      toast.error('فشل إرسال الملف');
    }
  };

  // Send audio message
  const handleSendAudio = async (audioBlob, duration) => {
    if (!audioBlob || !selectedChat) return;

    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'voice-message.m4a');
      formData.append('chat_id', selectedChat.id);
      if (duration) {
        formData.append('duration', duration);
      }

      const { data } = await baseUrl.post('/api/support/messages/audio', formData, {
        headers: { ...authHeader, 'Content-Type': 'multipart/form-data' },
      });
      
      setMessages(prev => [...prev, data.message]);
      scrollToBottom();
    } catch (error) {
      console.error('Error sending audio:', error);
      toast.error('فشل إرسال الرسالة الصوتية');
    }
  };

  // Start recording audio
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      const chunks = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/m4a' });
        const duration = chunks.length * 0.1; // Approximate duration
        handleSendAudio(blob, duration);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      audioRecorderRef.current = mediaRecorder;
      setRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
      toast.error('فشل بدء التسجيل');
    }
  };

  // Stop recording audio
  const stopRecording = () => {
    if (audioRecorderRef.current) {
      audioRecorderRef.current.stop();
      setRecording(false);
    }
  };

  // Handle file selection
  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      if (file.type.startsWith('image/')) {
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
      }
    }
  };

  // Handle typing
  const handleTyping = (e) => {
    setMessageText(e.target.value);
    if (!typing && selectedChat && socketRef.current) {
      setTyping(true);
      socketRef.current.emit('support:typing', { chat_id: selectedChat.id, is_typing: true });
      setTimeout(() => {
        setTyping(false);
        if (socketRef.current) {
          socketRef.current.emit('support:typing', { chat_id: selectedChat.id, is_typing: false });
        }
      }, 1000);
    }
  };

  // FAQ Management
  const handleCreateFaq = async () => {
    try {
      const keywords = faqForm.keywords.split(',').map(k => k.trim()).filter(k => k);
      const payload = {
        question: faqForm.question,
        answer: faqForm.answer,
        keywords,
        priority: faqForm.priority,
      };

      if (editingFaq) {
        await baseUrl.put(`/api/support/faq/${editingFaq.id}`, payload, { headers: authHeader });
        toast.success('تم تحديث السؤال');
      } else {
        await baseUrl.post('/api/support/faq', payload, { headers: authHeader });
        toast.success('تم إضافة السؤال');
      }
      
      faqModal.onClose();
      setFaqForm({ question: '', answer: '', keywords: '', priority: 0, is_active: true });
      setEditingFaq(null);
      fetchFaqs();
    } catch (error) {
      console.error('Error saving FAQ:', error);
      toast.error('فشل حفظ السؤال');
    }
  };

  const handleEditFaq = (faq) => {
    setEditingFaq(faq);
    setFaqForm({
      question: faq.question,
      answer: faq.answer,
      keywords: faq.keywords?.join(', ') || '',
      priority: faq.priority || 0,
      is_active: faq.is_active !== false,
    });
    faqModal.onOpen();
  };

  const handleDeleteFaq = async () => {
    if (!deleteFaqId) return;
    try {
      await baseUrl.delete(`/api/support/faq/${deleteFaqId}`, { headers: authHeader });
      toast.success('تم حذف السؤال');
      deleteFaqModal.onClose();
      setDeleteFaqId(null);
      fetchFaqs();
    } catch (error) {
      console.error('Error deleting FAQ:', error);
      toast.error('فشل حذف السؤال');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      bot_handling: 'green',
      waiting_for_admin: 'yellow',
      admin_handling: 'blue',
      closed: 'gray',
      resolved: 'purple',
    };
    return colors[status] || 'gray';
  };

  const getStatusLabel = (status) => {
    const labels = {
      bot_handling: 'البوت يتعامل',
      waiting_for_admin: 'في انتظار الأدمن',
      admin_handling: 'الأدمن يتعامل',
      closed: 'مغلق',
      resolved: 'تم الحل',
    };
    return labels[status] || status;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return dayjs(dateStr).format('YYYY-MM-DD HH:mm');
  };

  const formatRelativeTime = (dateStr) => {
    if (!dateStr) return '';
    return dayjs(dateStr).fromNow();
  };

  return (
    <Flex  className='mt-[150px]' h="calc(100vh - 80px)" bg={useColorModeValue('gray.50', 'gray.900')}>
      {/* Sidebar - Chat List */}
      <Box
        w="400px"
       
        borderRight="1px"
        borderColor={borderColor}
        bg={bgColor}
        display="flex"
        flexDirection="column"
      >
        {/* Header */}
        <Box p={4} borderBottom="1px" borderColor={borderColor}>
          <HStack justify="space-between" mb={4}>
            <Text fontSize="xl" fontWeight="bold">
              محادثات الدعم
            </Text>
            {unreadCount > 0 && (
              <Badge colorScheme="red" fontSize="md" px={2} py={1}>
                {unreadCount}
              </Badge>
            )}
          </HStack>
          
          <InputGroup mb={3}>
            <InputLeftElement pointerEvents="none">
              <Icon as={FaSearch} color="gray.400" />
            </InputLeftElement>
            <Input
              placeholder="بحث..."
              bg={useColorModeValue('gray.50', 'gray.700')}
            />
          </InputGroup>

          <Select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPagination(prev => ({ ...prev, offset: 0 }));
            }}
            bg={useColorModeValue('gray.50', 'gray.700')}
          >
            <option value="all">جميع الحالات</option>
            <option value="waiting_for_admin">في انتظار الأدمن</option>
            <option value="admin_handling">الأدمن يتعامل</option>
            <option value="bot_handling">البوت يتعامل</option>
            <option value="closed">مغلق</option>
            <option value="resolved">تم الحل</option>
          </Select>
        </Box>

        {/* Chat List */}
        <Box flex="1" overflowY="auto">
          {loading ? (
            <Center p={8}>
              <Spinner />
            </Center>
          ) : chats.length === 0 ? (
            <Center p={8}>
              <Text color="gray.500">لا توجد محادثات</Text>
            </Center>
          ) : (
            chats.map((chat) => (
              <Box
                key={chat.id}
                p={4}
                borderBottom="1px"
                borderColor={borderColor}
                cursor="pointer"
                bg={selectedChat?.id === chat.id ? hoverBg : 'transparent'}
                _hover={{ bg: hoverBg }}
                onClick={() => setSelectedChat(chat)}
              >
                <HStack justify="space-between" mb={2}>
                  <HStack>
                    <Avatar size="sm" name={chat.student_name} />
                    <VStack align="start" spacing={0}>
                      <Text fontWeight="bold" fontSize="sm">
                        {chat.student_name}
                      </Text>
                      <Text fontSize="xs" color="gray.500">
                        {chat.student_email}
                      </Text>
                    </VStack>
                  </HStack>
                  {chat.unread_count > 0 && (
                    <Badge colorScheme="red">{chat.unread_count}</Badge>
                  )}
                </HStack>
                
                <HStack justify="space-between" mt={2}>
                  <Badge colorScheme={getStatusColor(chat.status)}>
                    {getStatusLabel(chat.status)}
                  </Badge>
                  <Text fontSize="xs" color="gray.500">
                    {formatRelativeTime(chat.last_message_at)}
                  </Text>
                </HStack>

                {/* Bot Tracking Information */}
                <VStack align="start" spacing={1} mt={2}>
                  {chat.current_intent && (
                    <HStack spacing={1}>
                      <Badge colorScheme="purple" fontSize="xs">
                        النية: {chat.current_intent}
                      </Badge>
                    </HStack>
                  )}
                  
                  {chat.bot_attempts !== undefined && chat.bot_attempts > 0 && (
                    <Text fontSize="xs" color="gray.500">
                      محاولات البوت: {chat.bot_attempts}
                    </Text>
                  )}
                  
                  {chat.escalation_reason && (
                    <Box
                      p={1}
                      bg="yellow.50"
                      borderRadius="sm"
                      w="full"
                    >
                      <Text fontSize="xs" color="yellow.800">
                        ⚠️ {chat.escalation_reason}
                      </Text>
                      {chat.escalated_at && (
                        <Text fontSize="xs" color="yellow.600" mt={0.5}>
                          {formatRelativeTime(chat.escalated_at)}
                        </Text>
                      )}
                    </Box>
                  )}
                </VStack>
              </Box>
            ))
          )}
        </Box>

        {/* Pagination */}
        {pagination.has_more && (
          <Box p={4} borderTop="1px" borderColor={borderColor}>
            <Button
              size="sm"
              w="full"
              onClick={() => setPagination(prev => ({ ...prev, offset: prev.offset + prev.limit }))}
            >
              تحميل المزيد
            </Button>
          </Box>
        )}
      </Box>

      {/* Main Content - Chat View */}
      <Flex flex="1" flexDirection="column" bg={bgColor}>
        {selectedChat ? (
          <>
            {/* Chat Header */}
            <Box p={4} borderBottom="1px" borderColor={borderColor}>
              <HStack justify="space-between">
                <HStack>
                  <Avatar name={selectedChat.student_name} />
                  <VStack align="start" spacing={0}>
                    <Text fontWeight="bold">{selectedChat.student_name}</Text>
                    <Text fontSize="sm" color="gray.500">
                      {selectedChat.student_email}
                    </Text>
                  </VStack>
                </HStack>

                <HStack>
                  <Badge colorScheme={getStatusColor(selectedChat.status)}>
                    {getStatusLabel(selectedChat.status)}
                  </Badge>
                  
                  {selectedChat.status !== 'admin_handling' && !selectedChat.admin_id && (
                    <Button
                      size="sm"
                      colorScheme="blue"
                      onClick={() => handleAssignChat(selectedChat.id)}
                    >
                      تعيين لي
                    </Button>
                  )}

                  <Select
                    size="sm"
                    w="150px"
                    value={selectedChat.status}
                    onChange={(e) => handleUpdateStatus(selectedChat.id, e.target.value)}
                  >
                    <option value="bot_handling">البوت يتعامل</option>
                    <option value="waiting_for_admin">في انتظار الأدمن</option>
                    <option value="admin_handling">الأدمن يتعامل</option>
                    <option value="closed">مغلق</option>
                    <option value="resolved">تم الحل</option>
                  </Select>
                </HStack>
              </HStack>

              {/* Bot Tracking Information */}
              <VStack align="start" spacing={2} mt={3}>
                {selectedChat.current_intent && (
                  <HStack>
                    <Badge colorScheme="purple">
                      النية المكتشفة: {selectedChat.current_intent}
                    </Badge>
                  </HStack>
                )}
                
                {selectedChat.bot_attempts !== undefined && selectedChat.bot_attempts > 0 && (
                  <HStack>
                    <Icon as={FaRobot} color="gray.500" />
                    <Text fontSize="sm" color="gray.600">
                      محاولات البوت: {selectedChat.bot_attempts}
                    </Text>
                  </HStack>
                )}
                
                {selectedChat.escalation_reason && (
                  <Box p={2} bg="yellow.50" borderRadius="md" w="full">
                    <HStack mb={1}>
                      <Icon as={FaRobot} color="yellow.700" />
                      <Text fontSize="sm" fontWeight="bold" color="yellow.800">
                        سبب التصعيد:
                      </Text>
                    </HStack>
                    <Text fontSize="sm" color="yellow.800">
                      {selectedChat.escalation_reason}
                    </Text>
                    {selectedChat.escalated_at && (
                      <Text fontSize="xs" color="yellow.600" mt={1}>
                        في: {formatDate(selectedChat.escalated_at)}
                      </Text>
                    )}
                  </Box>
                )}
              </VStack>
            </Box>

            {/* Messages */}
            <Box flex="1" overflowY="auto" p={4}>
              {messagesLoading ? (
                <Center h="full">
                  <Spinner />
                </Center>
              ) : messages.length === 0 ? (
                <Center h="full">
                  <Text color="gray.500">لا توجد رسائل</Text>
                </Center>
              ) : (
                <VStack align="stretch" spacing={4}>
                  {messages.map((msg) => (
                    <Box
                      key={msg.id}
                      alignSelf={msg.sender_role === 'admin' ? 'flex-end' : 'flex-start'}
                      maxW="70%"
                    >
                      <HStack
                        spacing={2}
                        justify={msg.sender_role === 'admin' ? 'flex-end' : 'flex-start'}
                        mb={1}
                      >
                        <Avatar size="xs" name={msg.sender_name} />
                        <Text fontSize="xs" color="gray.500">
                          {msg.sender_name}
                        </Text>
                        {msg.is_auto_reply && (
                          <Badge colorScheme="green" fontSize="xs">
                            <Icon as={FaRobot} mr={1} />
                            تلقائي
                          </Badge>
                        )}
                      </HStack>

                      <Box
                        p={3}
                        borderRadius="lg"
                        bg={
                          msg.is_auto_reply
                            ? 'green.100'
                            : msg.sender_role === 'admin'
                            ? 'blue.500'
                            : 'gray.200'
                        }
                        color={
                          msg.is_auto_reply
                            ? 'green.900'
                            : msg.sender_role === 'admin'
                            ? 'white'
                            : 'black'
                        }
                        border={msg.is_auto_reply ? '2px solid' : 'none'}
                        borderColor={msg.is_auto_reply ? 'green.400' : 'transparent'}
                        position="relative"
                      >
                        {/* Badge للرسائل التلقائية */}
                        {msg.is_auto_reply && (
                          <Box
                            position="absolute"
                            top="-10px"
                            right="10px"
                            bg="green.500"
                            color="white"
                            px={2}
                            py={1}
                            borderRadius="full"
                            fontSize="xs"
                            fontWeight="bold"
                          >
                            <HStack spacing={1}>
                              <Icon as={FaRobot} boxSize={2} />
                              <Text>رد تلقائي</Text>
                            </HStack>
                          </Box>
                        )}

                        {/* عرض النص لجميع أنواع الرسائل */}
                        {(msg.message_type === 'text' || msg.message_type === 'auto_reply') && (
                          <Text whiteSpace="pre-wrap">{msg.text}</Text>
                        )}

                        {msg.message_type === 'image' && msg.media_url && (
                          <VStack align="start" spacing={2}>
                            <Image src={msg.media_url} maxH="300px" borderRadius="md" />
                            {msg.text && <Text whiteSpace="pre-wrap">{msg.text}</Text>}
                          </VStack>
                        )}

                        {msg.message_type === 'audio' && msg.media_url && (
                          <VStack align="start" spacing={2}>
                            <HStack spacing={2}>
                              <audio controls src={msg.media_url} style={{ maxWidth: '200px' }} />
                              {msg.duration && (
                                <Text fontSize="xs">{Math.round(msg.duration)}s</Text>
                              )}
                            </HStack>
                            {msg.text && <Text whiteSpace="pre-wrap">{msg.text}</Text>}
                          </VStack>
                        )}

                        {msg.message_type === 'file' && msg.media_url && (
                          <VStack align="start" spacing={2}>
                            <HStack spacing={2}>
                              <Icon as={FaFileAlt} />
                              <Text>{msg.media_name || 'ملف'}</Text>
                              <Button size="xs" as="a" href={msg.media_url} target="_blank">
                                تحميل
                              </Button>
                            </HStack>
                            {msg.text && <Text whiteSpace="pre-wrap">{msg.text}</Text>}
                          </VStack>
                        )}

                        <Text fontSize="xs" mt={2} opacity={0.8}>
                          {formatDate(msg.created_at)}
                        </Text>
                      </Box>
                    </Box>
                  ))}
                  
                  {isTyping && (
                    <Box alignSelf="flex-start">
                      <Text fontSize="sm" color="gray.500" fontStyle="italic">
                        الطالب يكتب...
                      </Text>
                    </Box>
                  )}
                  
                  <div ref={messagesEndRef} />
                </VStack>
              )}
            </Box>

            {/* Message Input */}
            <Box p={4} borderTop="1px" borderColor={borderColor}>
              {selectedFile && (
                <Box mb={2} p={2} bg="gray.100" borderRadius="md" position="relative">
                  {previewUrl ? (
                    <Image src={previewUrl} maxH="100px" />
                  ) : (
                    <Text>{selectedFile.name}</Text>
                  )}
                  <IconButton
                    icon={<FaTimes />}
                    size="xs"
                    position="absolute"
                    top={1}
                    right={1}
                    onClick={() => {
                      setSelectedFile(null);
                      setPreviewUrl(null);
                    }}
                  />
                </Box>
              )}

              <HStack spacing={2}>
                <input
                  type="file"
                  ref={fileInputRef}
                  style={{ display: 'none' }}
                  onChange={handleFileSelect}
                  accept="image/*,video/*,application/*"
                />
                <input
                  type="file"
                  ref={audioInputRef}
                  style={{ display: 'none' }}
                  accept="audio/*"
                />

                <IconButton
                  icon={<FaImage />}
                  onClick={() => fileInputRef.current?.click()}
                  aria-label="إرسال صورة"
                />
                
                <IconButton
                  icon={recording ? <FaPause /> : <FaMicrophone />}
                  colorScheme={recording ? 'red' : 'gray'}
                  onClick={recording ? stopRecording : startRecording}
                  aria-label="رسالة صوتية"
                />

                <Input
                  value={messageText}
                  onChange={handleTyping}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      if (selectedFile) {
                        handleSendMedia();
                      } else {
                        handleSendMessage();
                      }
                    }
                  }}
                  placeholder="اكتب رسالة..."
                  flex="1"
                />

                <Button
                  colorScheme="blue"
                  onClick={selectedFile ? handleSendMedia : handleSendMessage}
                  isDisabled={!messageText.trim() && !selectedFile}
                >
                  <Icon as={FaPaperPlane} />
                </Button>
              </HStack>
            </Box>
          </>
        ) : (
          <Center h="full">
            <VStack spacing={4}>
              <Icon as={FaQuestionCircle} boxSize={16} color="gray.400" />
              <Text fontSize="xl" color="gray.500">
                اختر محادثة لعرضها
              </Text>
            </VStack>
          </Center>
        )}
      </Flex>

      {/* FAQ Management Sidebar */}
      <Box
        w="350px"
        borderLeft="1px"
        borderColor={borderColor}
        bg={bgColor}
        display="flex"
        flexDirection="column"
      >
        <Box p={4} borderBottom="1px" borderColor={borderColor}>
          <HStack justify="space-between" mb={4}>
            <Text fontSize="lg" fontWeight="bold">
              الأسئلة الشائعة
            </Text>
            <Button
              size="sm"
              leftIcon={<FaPlus />}
              onClick={() => {
                setEditingFaq(null);
                setFaqForm({ question: '', answer: '', keywords: '', priority: 0, is_active: true });
                faqModal.onOpen();
              }}
            >
              إضافة
            </Button>
          </HStack>
        </Box>

        <Box flex="1" overflowY="auto" p={4}>
          {faqLoading ? (
            <Center p={8}>
              <Spinner />
            </Center>
          ) : faqs.length === 0 ? (
            <Center p={8}>
              <Text color="gray.500">لا توجد أسئلة</Text>
            </Center>
          ) : (
            <VStack align="stretch" spacing={3}>
              {faqs.map((faq) => (
                <Box
                  key={faq.id}
                  p={3}
                  border="1px"
                  borderColor={borderColor}
                  borderRadius="md"
                  bg={!faq.is_active ? 'gray.100' : 'transparent'}
                >
                  <HStack justify="space-between" mb={2}>
                    <Badge colorScheme={faq.is_active ? 'green' : 'gray'}>
                      {faq.is_active ? 'نشط' : 'غير نشط'}
                    </Badge>
                    <HStack>
                      <IconButton
                        icon={<FaEdit />}
                        size="xs"
                        onClick={() => handleEditFaq(faq)}
                      />
                      <IconButton
                        icon={<FaTrash />}
                        size="xs"
                        colorScheme="red"
                        onClick={() => {
                          setDeleteFaqId(faq.id);
                          deleteFaqModal.onOpen();
                        }}
                      />
                    </HStack>
                  </HStack>
                  
                  <Text fontWeight="bold" fontSize="sm" mb={1}>
                    {faq.question}
                  </Text>
                  <Text fontSize="xs" color="gray.600" noOfLines={2}>
                    {faq.answer}
                  </Text>
                  
                  {faq.keywords && faq.keywords.length > 0 && (
                    <HStack mt={2} flexWrap="wrap">
                      {faq.keywords.map((keyword, idx) => (
                        <Tag key={idx} size="sm" colorScheme="blue">
                          {keyword}
                        </Tag>
                      ))}
                    </HStack>
                  )}
                  
                  <Text fontSize="xs" color="gray.400" mt={2}>
                    الأولوية: {faq.priority}
                  </Text>
                </Box>
              ))}
            </VStack>
          )}
        </Box>
      </Box>

      {/* FAQ Modal */}
      <Modal isOpen={faqModal.isOpen} onClose={faqModal.onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {editingFaq ? 'تعديل سؤال' : 'إضافة سؤال جديد'}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl>
                <FormLabel>السؤال</FormLabel>
                <Textarea
                  value={faqForm.question}
                  onChange={(e) => setFaqForm({ ...faqForm, question: e.target.value })}
                  placeholder="أدخل السؤال..."
                />
              </FormControl>

              <FormControl>
                <FormLabel>الإجابة</FormLabel>
                <Textarea
                  value={faqForm.answer}
                  onChange={(e) => setFaqForm({ ...faqForm, answer: e.target.value })}
                  placeholder="أدخل الإجابة..."
                  rows={6}
                />
              </FormControl>

              <FormControl>
                <FormLabel>الكلمات المفتاحية (مفصولة بفواصل)</FormLabel>
                <Input
                  value={faqForm.keywords}
                  onChange={(e) => setFaqForm({ ...faqForm, keywords: e.target.value })}
                  placeholder="كلمة1, كلمة2, كلمة3"
                />
              </FormControl>

              <FormControl>
                <FormLabel>الأولوية</FormLabel>
                <Input
                  type="number"
                  value={faqForm.priority}
                  onChange={(e) => setFaqForm({ ...faqForm, priority: parseInt(e.target.value) || 0 })}
                />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={faqModal.onClose}>
              إلغاء
            </Button>
            <Button colorScheme="blue" onClick={handleCreateFaq}>
              {editingFaq ? 'تحديث' : 'إضافة'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Delete FAQ Modal */}
      <AlertDialog
        isOpen={deleteFaqModal.isOpen}
        leastDestructiveRef={React.useRef()}
        onClose={deleteFaqModal.onClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              حذف السؤال
            </AlertDialogHeader>
            <AlertDialogBody>
              هل أنت متأكد من حذف هذا السؤال؟ لا يمكن التراجع عن هذه العملية.
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={React.useRef()} onClick={deleteFaqModal.onClose}>
                إلغاء
              </Button>
              <Button colorScheme="red" onClick={handleDeleteFaq} ml={3}>
                حذف
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Flex>
  );
};

export default SupportChatAdmin;
