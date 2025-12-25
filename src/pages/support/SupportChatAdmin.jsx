import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  VStack,
  HStack,
  Text,
  Input,
  InputGroup,
  InputLeftElement,
  Button,
  Avatar,
  Badge,
  IconButton,
  useColorModeValue,
  Flex,
  Spinner,
  useToast,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Image,
  Link,
  Container,
  Progress,
  Tooltip,
  useBreakpointValue,
  useDisclosure as useChakraDisclosure,
  Drawer as MobileDrawer,
  DrawerBody as MobileDrawerBody,
  DrawerHeader as MobileDrawerHeader,
  DrawerOverlay as MobileDrawerOverlay,
  DrawerContent as MobileDrawerContent,
  DrawerCloseButton as MobileDrawerCloseButton,
  Drawer,
  DrawerBody,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  useDisclosure,
  FormControl,
  FormLabel,
  Textarea,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Switch,
  Divider,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  Tag,
  TagLabel,
  TagCloseButton,
  Wrap,
  WrapItem,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Card,
  CardBody,
  CardHeader,
} from "@chakra-ui/react";
import {
  MdSearch,
  MdSend,
  MdAttachFile,
  MdImage,
  MdClose,
  MdMoreVert,
  MdCheckCircle,
  MdDone,
  MdDoneAll,
  MdMessage,
  MdFilterList,
  MdMic,
  MdStop,
  MdVideoLibrary,
  MdInsertDriveFile,
  MdSettings,
  MdAdd,
  MdEdit,
  MdDelete,
  MdQuestionAnswer,
  MdCheck,
  MdClose as MdCloseIcon,
} from "react-icons/md";
import { io } from "socket.io-client";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/ar";
import baseUrl from "../../api/baseUrl";

dayjs.extend(relativeTime);
dayjs.locale("ar");

const SupportChatAdmin = () => {
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [socket, setSocket] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUser, setTypingUser] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [showChatsList, setShowChatsList] = useState(true);
  
  // Mobile responsive states
  const isMobile = useBreakpointValue({ base: true, md: false });
  const isTablet = useBreakpointValue({ base: false, md: true, lg: false });
  const chatsListWidth = useBreakpointValue({ base: "100%", md: "350px", lg: "400px" });
  const { isOpen: isMobileChatsOpen, onOpen: onMobileChatsOpen, onClose: onMobileChatsClose } = useChakraDisclosure();
  
  // FAQ Management States
  const [faqs, setFaqs] = useState([]);
  const [faqsLoading, setFaqsLoading] = useState(false);
  const [creatingFaq, setCreatingFaq] = useState(false);
  const [updatingFaq, setUpdatingFaq] = useState(false);
  const [deletingFaq, setDeletingFaq] = useState(false);
  const [selectedFaq, setSelectedFaq] = useState(null);
  const [faqForm, setFaqForm] = useState({
    question: "",
    answer: "",
    keywords: [],
    priority: 0,
    is_active: true,
  });
  const [keywordInput, setKeywordInput] = useState("");
  const [testQuestion, setTestQuestion] = useState("");
  const [testResult, setTestResult] = useState(null);
  
  const { isOpen: isFaqDrawerOpen, onOpen: onFaqDrawerOpen, onClose: onFaqDrawerClose } = useDisclosure();
  const { isOpen: isDeleteFaqOpen, onOpen: onDeleteFaqOpen, onClose: onDeleteFaqClose } = useDisclosure();
  const { isOpen: isTestMatchOpen, onOpen: onTestMatchOpen, onClose: onTestMatchClose } = useDisclosure();
  
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const durationIntervalRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const pendingMessagesRef = useRef(new Set()); // Track pending messages to prevent duplicates
  const currentRoomRef = useRef(null); // Track current room
  const selectedChatRef = useRef(null); // Track selected chat for socket listeners
  const chatsRef = useRef([]); // Track chats for socket listeners
  const toast = useToast();

  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const textColor = useColorModeValue("gray.800", "gray.100");
  const subTextColor = useColorModeValue("gray.600", "gray.400");
  const inputBg = useColorModeValue("gray.50", "gray.700");
  const chatBg = useColorModeValue("gray.50", "gray.900");
  const selectedChatBg = useColorModeValue("blue.50", "blue.900");
  const hoverChatBg = useColorModeValue("gray.50", "gray.700");
  const headerBg = useColorModeValue("gray.50", "gray.700");

  // Get auth token
  const getAuthToken = () => {
    const authHeader = localStorage.getItem("Authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      return authHeader.replace("Bearer ", "");
    }
    return localStorage.getItem("token") || "";
  };

  // Get auth header
  const getAuthHeader = () => {
    const token = getAuthToken();
    return token ? `Bearer ${token}` : "";
  };

  // Scroll to bottom
  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch chats
  const fetchChats = async () => {
    try {
      setLoading(true);
      const response = await baseUrl.get("/api/support/chats", {
        headers: {
          Authorization: getAuthHeader(),
        },
        params: {
          status: statusFilter !== "all" ? statusFilter : undefined,
        },
      });
      const chatsList = response.data.chats || [];
      
      // Sort chats by last_message_at (newest first)
      const sortedChats = [...chatsList].sort((a, b) => {
        const timeA = new Date(a.last_message_at || a.created_at || 0).getTime();
        const timeB = new Date(b.last_message_at || b.created_at || 0).getTime();
        return timeB - timeA;
      });
      
      setChats(sortedChats);
      chatsRef.current = sortedChats; // Update ref
      
      // Calculate total unread count
      const totalUnread = sortedChats.reduce(
        (sum, chat) => sum + (chat.unread_count || 0),
        0
      );
      setUnreadCount(totalUnread);
    } catch (error) {
      console.error("Error fetching chats:", error);
      toast({
        title: "خطأ",
        description: "فشل في تحميل الشاتات",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch messages for a chat
  const fetchMessages = async (chatId) => {
    try {
      const response = await baseUrl.get(`/api/support/chats/${chatId}/messages`, {
        headers: {
          Authorization: getAuthHeader(),
        },
      });
      setMessages(response.data.messages || []);
      
      // Mark all messages as read
      if (socket && selectedChat) {
        socket.emit("support:mark-chat-read", chatId);
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
      toast({
        title: "خطأ",
        description: "فشل في تحميل الرسائل",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Send message via Socket.io (Real-time)
  const sendMessage = async () => {
    if (!messageText.trim() || !selectedChat || sending) return;

    const text = messageText.trim();
    const tempId = `temp-${Date.now()}-${Math.random()}`;
    setMessageText("");

    // Optimistic update - Add message immediately for instant feedback
    const optimisticMessage = {
      id: tempId,
      text: text,
      chat_id: selectedChat.id,
      sender_role: "admin",
      message_type: "text",
      status: "sent",
      created_at: new Date().toISOString(),
      is_optimistic: true, // Flag to identify optimistic messages
    };

    setMessages((prev) => [...prev, optimisticMessage]);
    scrollToBottom();

    // Update chat list optimistically
    setChats((prev) => {
      const updated = prev.map((chat) =>
        chat.id === selectedChat.id
          ? {
              ...chat,
              last_message_at: optimisticMessage.created_at,
              unread_count: 0,
            }
          : chat
      );
      // Sort by last_message_at
      const sorted = updated.sort((a, b) => {
        const timeA = new Date(a.last_message_at || a.created_at || 0).getTime();
        const timeB = new Date(b.last_message_at || b.created_at || 0).getTime();
        return timeB - timeA;
      });
      chatsRef.current = sorted; // Update ref
      return sorted;
    });

    // Send via Socket.io for real-time
    if (socket && socket.connected && selectedChat) {
      setSending(true);
      
      // Timeout fallback - stop loading after 5 seconds even if no response
      const timeoutId = setTimeout(() => {
        setSending(false);
      }, 5000);
      
      socket.emit(
        "support:send-message",
        {
          chat_id: selectedChat.id,
          text: text,
        },
        (response) => {
          // Clear timeout
          clearTimeout(timeoutId);
          
          // Handle callback if server supports it
          if (response && response.error) {
            // Remove optimistic message on error
            setMessages((prev) => prev.filter((msg) => msg.id !== tempId));
            toast({
              title: "خطأ",
              description: response.error || "فشل في إرسال الرسالة",
              status: "error",
              duration: 3000,
              isClosable: true,
            });
          }
          setSending(false);
        }
      );
    } else {
      // Fallback to REST API
      try {
        setSending(true);
        const response = await baseUrl.post(
          "/api/support/messages",
          {
            text: text,
            chat_id: selectedChat.id,
          },
          {
            headers: {
              Authorization: getAuthHeader(),
              "Content-Type": "application/json",
            },
          }
        );

        const newMessage = response.data.message;
        
        // Replace optimistic message with real one
        setMessages((prev) => {
          const filtered = prev.filter((msg) => msg.id !== tempId);
          const exists = filtered.some((msg) => msg.id === newMessage.id);
          if (exists) return filtered;
          return [...filtered, newMessage];
        });
        
        // Handle auto-reply if exists
        if (response.data.auto_reply) {
          setTimeout(() => {
            setMessages((prev) => {
              const exists = prev.some((msg) => msg.id === response.data.auto_reply.id);
              if (exists) return prev;
              return [...prev, response.data.auto_reply];
            });
            scrollToBottom();
          }, 500);
        }

        // Update chat last message
        setChats((prev) => {
          const updated = prev.map((chat) =>
            chat.id === selectedChat.id
              ? {
                  ...chat,
                  last_message_at: newMessage.created_at,
                  unread_count: 0,
                }
              : chat
          );
          const sorted = updated.sort((a, b) => {
            const timeA = new Date(a.last_message_at || a.created_at || 0).getTime();
            const timeB = new Date(b.last_message_at || b.created_at || 0).getTime();
            return timeB - timeA;
          });
          chatsRef.current = sorted; // Update ref
          return sorted;
        });
      } catch (error) {
        console.error("Error sending message:", error);
        // Remove optimistic message on error
        setMessages((prev) => prev.filter((msg) => msg.id !== tempId));
        toast({
          title: "خطأ",
          description: "فشل في إرسال الرسالة",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      } finally {
        setSending(false);
      }
    }
  };

  // Send media (image/video/file)
  const sendMedia = async (file, type) => {
    if (!selectedChat || !file) return;

    const tempId = `temp-media-${Date.now()}-${Math.random()}`;
    const text = messageText.trim();
    if (text) setMessageText("");

    // Optimistic update
    const optimisticMessage = {
      id: tempId,
      text: text,
      chat_id: selectedChat.id,
      sender_role: "admin",
      message_type: type,
      status: "sending",
      created_at: new Date().toISOString(),
      is_optimistic: true,
      media_url: URL.createObjectURL(file), // Preview
    };

    setMessages((prev) => [...prev, optimisticMessage]);
    scrollToBottom();

    try {
      setSending(true);
      const formData = new FormData();
      formData.append("file", file);
      formData.append("chat_id", selectedChat.id.toString());
      if (text) {
        formData.append("text", text);
      }

      const response = await baseUrl.post("/api/support/messages/media", formData, {
        headers: {
          Authorization: getAuthHeader(),
          "Content-Type": "multipart/form-data",
        },
      });

      const newMessage = response.data.message;
      
      // Replace optimistic message with real one
      setMessages((prev) => {
        const filtered = prev.filter((msg) => msg.id !== tempId);
        // Clean up object URL
        if (optimisticMessage.media_url) {
          URL.revokeObjectURL(optimisticMessage.media_url);
        }
        const exists = filtered.some((msg) => msg.id === newMessage.id);
        if (exists) return filtered;
        return [...filtered, newMessage];
      });
      scrollToBottom();

      // Update chat and sort
      setChats((prev) => {
        const updated = prev.map((chat) =>
          chat.id === selectedChat.id
            ? {
                ...chat,
                last_message_at: newMessage.created_at,
              }
            : chat
        );
        const sorted = updated.sort((a, b) => {
          const timeA = new Date(a.last_message_at || a.created_at || 0).getTime();
          const timeB = new Date(b.last_message_at || b.created_at || 0).getTime();
          return timeB - timeA;
        });
        chatsRef.current = sorted; // Update ref
        return sorted;
      });

      // Emit socket event for real-time update
      if (socket && socket.connected) {
        socket.emit("support:message-sent", {
          chat_id: selectedChat.id,
          message: newMessage,
        });
      }
    } catch (error) {
      console.error("Error sending media:", error);
      // Remove optimistic message on error
      setMessages((prev) => {
        const filtered = prev.filter((msg) => msg.id !== tempId);
        if (optimisticMessage.media_url) {
          URL.revokeObjectURL(optimisticMessage.media_url);
        }
        return filtered;
      });
      toast({
        title: "خطأ",
        description: "فشل في إرسال الملف",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setSending(false);
    }
  };

  // Start recording voice message
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      const chunks = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunks, { type: "audio/webm" });
        await sendVoiceMessage(audioBlob, recordingDuration);

        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop());
        }

        setIsRecording(false);
        setRecordingDuration(0);
        if (durationIntervalRef.current) {
          clearInterval(durationIntervalRef.current);
        }
      };

      mediaRecorder.start();
      setIsRecording(true);

      // Update duration every second
      durationIntervalRef.current = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);
    } catch (error) {
      console.error("Error starting recording:", error);
      toast({
        title: "خطأ",
        description: "فشل في الوصول للميكروفون",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
    }
  };

  // Send voice message
  const sendVoiceMessage = async (audioBlob, duration) => {
    if (!selectedChat) return;

    const tempId = `temp-audio-${Date.now()}-${Math.random()}`;
    const audioUrl = URL.createObjectURL(audioBlob);

    // Optimistic update
    const optimisticMessage = {
      id: tempId,
      text: "",
      chat_id: selectedChat.id,
      sender_role: "admin",
      message_type: "audio",
      status: "sending",
      created_at: new Date().toISOString(),
      is_optimistic: true,
      media_url: audioUrl,
      duration: duration,
    };

    setMessages((prev) => [...prev, optimisticMessage]);
    scrollToBottom();

    try {
      setSending(true);
      const formData = new FormData();
      formData.append("audio", audioBlob, "voice-message.webm");
      formData.append("chat_id", selectedChat.id.toString());
      formData.append("duration", duration.toString());

      const response = await baseUrl.post("/api/support/messages/audio", formData, {
        headers: {
          Authorization: getAuthHeader(),
          "Content-Type": "multipart/form-data",
        },
      });

      const newMessage = response.data.message;
      
      // Replace optimistic message with real one
      setMessages((prev) => {
        const filtered = prev.filter((msg) => msg.id !== tempId);
        URL.revokeObjectURL(audioUrl);
        const exists = filtered.some((msg) => msg.id === newMessage.id);
        if (exists) return filtered;
        return [...filtered, newMessage];
      });
      scrollToBottom();

      // Update chat and sort
      setChats((prev) => {
        const updated = prev.map((chat) =>
          chat.id === selectedChat.id
            ? {
                ...chat,
                last_message_at: newMessage.created_at,
              }
            : chat
        );
        const sorted = updated.sort((a, b) => {
          const timeA = new Date(a.last_message_at || a.created_at || 0).getTime();
          const timeB = new Date(b.last_message_at || b.created_at || 0).getTime();
          return timeB - timeA;
        });
        chatsRef.current = sorted; // Update ref
        return sorted;
      });

      // Emit socket event for real-time update
      if (socket && socket.connected) {
        socket.emit("support:message-sent", {
          chat_id: selectedChat.id,
          message: newMessage,
        });
      }
    } catch (error) {
      console.error("Error sending voice message:", error);
      // Remove optimistic message on error
      setMessages((prev) => {
        const filtered = prev.filter((msg) => msg.id !== tempId);
        URL.revokeObjectURL(audioUrl);
        return filtered;
      });
      toast({
        title: "خطأ",
        description: "فشل في إرسال الرسالة الصوتية",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setSending(false);
    }
  };

  // Handle typing indicator
  const handleTyping = (isTyping) => {
    if (socket && selectedChat) {
      socket.emit("support:typing", {
        chat_id: selectedChat.id,
        is_typing: isTyping,
      });

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      if (isTyping) {
        typingTimeoutRef.current = setTimeout(() => {
          handleTyping(false);
        }, 3000);
      }
    }
  };

  // Update chat status
  const updateChatStatus = async (chatId, status) => {
    try {
      await baseUrl.patch(
        `/api/support/chats/${chatId}/status`,
        { status },
        {
          headers: {
            Authorization: getAuthHeader(),
            "Content-Type": "application/json",
          },
        }
      );
      setChats((prev) =>
        prev.map((chat) => (chat.id === chatId ? { ...chat, status } : chat))
      );
      if (selectedChat?.id === chatId) {
        setSelectedChat((prev) => ({ ...prev, status }));
      }
      toast({
        title: "نجح",
        description: "تم تحديث حالة الشات",
        status: "success",
        duration: 2000,
        isClosable: true,
      });
    } catch (error) {
      console.error("Error updating chat status:", error);
      toast({
        title: "خطأ",
        description: "فشل في تحديث حالة الشات",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Socket setup
  useEffect(() => {
    const token = getAuthToken();
    let socketEndpoint;
    try {
      socketEndpoint = new URL(baseUrl.defaults.baseURL || window.location.origin).origin;
    } catch {
      socketEndpoint = window.location.origin;
    }

    const newSocket = io(socketEndpoint, {
      path: "/socket.io",
      withCredentials: true,
      auth: token ? { token } : {},
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
      timeout: 20000,
    });

    newSocket.on("connect", () => {
      console.log("✅ Socket connected for support chat");
      setIsConnected(true);
      
      // Join admin room
      newSocket.emit("support:admin-join");
    });

    newSocket.on("disconnect", () => {
      console.log("❌ Socket disconnected");
      setIsConnected(false);
    });

    newSocket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
      setIsConnected(false);
    });

    // Admin connected event
    newSocket.on("support:admin-connected", (data) => {
      console.log("Admin connected, total chats:", data.total_chats);
      fetchChats();
    });

    // New message event (Real-time) - Primary event for incoming messages
    newSocket.on("support:new-message", (message) => {
      if (!message || !message.chat_id) return;
      
      // Stop loading if this is our sent message
      if (message.sender_role === "admin") {
        setSending(false);
      }
      
      // Prevent duplicate messages
      if (message.id && pendingMessagesRef.current.has(message.id)) {
        return;
      }
      if (message.id) {
        pendingMessagesRef.current.add(message.id);
      }

      // Clean up old pending messages (keep last 100)
      if (pendingMessagesRef.current.size > 100) {
        const array = Array.from(pendingMessagesRef.current);
        pendingMessagesRef.current = new Set(array.slice(-50));
      }

      // If current chat is open, add message immediately
      const currentSelectedChat = selectedChatRef.current;
      if (currentSelectedChat && message.chat_id === currentSelectedChat.id) {
        setMessages((prev) => {
          // Check if message already exists (by ID or content)
          const exists = prev.some((msg) => 
            msg.id === message.id || 
            (msg.text === message.text && 
             msg.created_at === message.created_at &&
             msg.sender_role === message.sender_role)
          );
          if (exists) return prev;
          
          // Remove any optimistic messages that might match
          const filtered = prev.filter((msg) => 
            !msg.is_optimistic || 
            msg.text !== message.text ||
            msg.chat_id !== message.chat_id
          );
          
          return [...filtered, message];
        });
        scrollToBottom();
        
        // Mark as read
        if (newSocket && newSocket.connected) {
          newSocket.emit("support:mark-chat-read", currentSelectedChat.id);
        }
      } else {
        // Show notification for new message in other chats
        const chat = chatsRef.current.find((c) => c.id === message.chat_id);
        if (chat) {
          toast({
            title: "رسالة جديدة",
            description: `${chat.student_name}: ${message.text?.substring(0, 50) || "ملف"}`,
            status: "info",
            duration: 4000,
            isClosable: true,
            position: "top-left",
          });
        }
      }

      // Update chat list with new message and sort
      setChats((prev) => {
        const updated = prev.map((chat) =>
          chat.id === message.chat_id
            ? {
                ...chat,
                last_message_at: message.created_at,
                unread_count:
                  currentSelectedChat?.id === message.chat_id
                    ? 0
                    : (chat.unread_count || 0) + 1,
              }
            : chat
        );
        
        // Sort by last_message_at (newest first)
        const sorted = updated.sort((a, b) => {
          const timeA = new Date(a.last_message_at || a.created_at || 0).getTime();
          const timeB = new Date(b.last_message_at || b.created_at || 0).getTime();
          return timeB - timeA;
        });
        chatsRef.current = sorted; // Update ref
        return sorted;
      });
    });

    // New chat message notification - Alternative event
    newSocket.on("support:new-chat-message", (data) => {
      if (!data || !data.chat_id) return;
      
      // Prevent duplicates
      if (data.message?.id && pendingMessagesRef.current.has(data.message.id)) {
        return;
      }
      if (data.message?.id) {
        pendingMessagesRef.current.add(data.message.id);
      }

      // Update chats list
      setChats((prev) => {
        const existingChat = prev.find((chat) => chat.id === data.chat_id);
        if (existingChat) {
          const updated = prev.map((chat) =>
            chat.id === data.chat_id
              ? {
                  ...chat,
                  unread_count: 
                    selectedChatRef.current?.id === data.chat_id
                      ? 0
                      : (chat.unread_count || 0) + 1,
                  last_message_at: data.message?.created_at || chat.last_message_at,
                }
              : chat
          );
          // Sort by last_message_at
          return updated.sort((a, b) => {
            const timeA = new Date(a.last_message_at || a.created_at || 0).getTime();
            const timeB = new Date(b.last_message_at || b.created_at || 0).getTime();
            return timeB - timeA;
          });
        }
        // If new chat, refresh list
        fetchChats();
        return prev;
      });

      // If chat is open, add message immediately
      if (selectedChatRef.current?.id === data.chat_id && data.message) {
        // Stop loading if this is our sent message
        if (data.message.sender_role === "admin") {
          setSending(false);
        }
        
        setMessages((prev) => {
          const exists = prev.some((msg) => 
            msg.id === data.message.id ||
            (msg.text === data.message.text && 
             msg.created_at === data.message.created_at)
          );
          if (exists) return prev;
          
          // Remove optimistic messages
          const filtered = prev.filter((msg) => 
            !msg.is_optimistic || 
            msg.text !== data.message.text ||
            msg.chat_id !== data.chat_id
          );
          
          return [...filtered, data.message];
        });
        scrollToBottom();
      } else if (data.message) {
        // Show notification for messages in other chats
        const chat = chatsRef.current.find((c) => c.id === data.chat_id);
        if (chat) {
          toast({
            title: "رسالة جديدة",
            description: `${chat.student_name}: ${data.message.text?.substring(0, 50) || "ملف"}`,
            status: "info",
            duration: 4000,
            isClosable: true,
            position: "top-left",
          });
        }
      }
    });

    // Message sent confirmation - Replace optimistic messages
    newSocket.on("support:message-sent", (data) => {
      if (data && data.message) {
        setSending(false); // Stop loading indicator
        
        setMessages((prev) => {
          // Remove optimistic message and add real one
          const filtered = prev.filter((msg) => 
            !msg.is_optimistic || 
            msg.chat_id !== data.message.chat_id ||
            msg.text !== data.message.text
          );
          
          const exists = filtered.some((msg) => msg.id === data.message.id);
          if (exists) return filtered;
          
          return [...filtered, data.message];
        });
        scrollToBottom();
      }
    });
    
    // Handle message sent confirmation from server (alternative event)
    newSocket.on("support:message-confirmed", (data) => {
      setSending(false); // Stop loading indicator
      
      if (data && data.message) {
        setMessages((prev) => {
          // Remove optimistic message and add real one
          const filtered = prev.filter((msg) => 
            !msg.is_optimistic || 
            msg.chat_id !== data.message.chat_id ||
            msg.text !== data.message.text
          );
          
          const exists = filtered.some((msg) => msg.id === data.message.id);
          if (exists) return filtered;
          
          return [...filtered, data.message];
        });
        scrollToBottom();
      }
    });

    // Message status updated
    newSocket.on("support:message-status-updated", (data) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === data.message_id
            ? {
                ...msg,
                status: data.status,
                delivered_at: data.delivered_at,
                read_at: data.read_at,
              }
            : msg
        )
      );
    });

    // Typing indicator
    newSocket.on("support:user-typing", (data) => {
      if (selectedChat && data.chat_id === selectedChat.id) {
        if (data.is_typing) {
          setTypingUser(data.user_name);
          setIsTyping(true);
        } else {
          setIsTyping(false);
          setTypingUser(null);
        }
      }
    });

    // Conversation updated
    newSocket.on("support:conversation-updated", (data) => {
      if (data && data.chat_id) {
        setChats((prev) => {
          const updated = prev.map((chat) =>
            chat.id === data.chat_id
              ? {
                  ...chat,
                  ...data.updates,
                  last_message_at: data.last_message_at || chat.last_message_at,
                }
              : chat
          );
          // Sort by last_message_at
          const sorted = updated.sort((a, b) => {
            const timeA = new Date(a.last_message_at || a.created_at || 0).getTime();
            const timeB = new Date(b.last_message_at || b.created_at || 0).getTime();
            return timeB - timeA;
          });
          chatsRef.current = sorted; // Update ref
          return sorted;
        });
      }
    });

    // Alternative event names for message receiving (in case backend uses different names)
    newSocket.on("message:receive", (message) => {
      // Handle message:receive event
      if (message && message.chat_id) {
        // Stop loading if this is our sent message
        if (message.sender_role === "admin") {
          setSending(false);
        }
        
        // Prevent duplicates
        if (message.id && pendingMessagesRef.current.has(message.id)) {
          return;
        }
        if (message.id) {
          pendingMessagesRef.current.add(message.id);
        }

        const currentSelectedChat = selectedChatRef.current;
        
        // Add message to current chat if open
        if (currentSelectedChat && message.chat_id === currentSelectedChat.id) {
          setMessages((prev) => {
            const exists = prev.some((msg) => 
              msg.id === message.id || 
              (msg.text === message.text && 
               msg.created_at === message.created_at &&
               msg.sender_role === message.sender_role)
            );
            if (exists) return prev;
            
            const filtered = prev.filter((msg) => 
              !msg.is_optimistic || 
              msg.text !== message.text ||
              msg.chat_id !== message.chat_id
            );
            
            return [...filtered, message];
          });
          scrollToBottom();
        }

        // Update chat list
        setChats((prev) => {
          const updated = prev.map((chat) =>
            chat.id === message.chat_id
              ? {
                  ...chat,
                  last_message_at: message.created_at,
                  unread_count:
                    currentSelectedChat?.id === message.chat_id
                      ? 0
                      : (chat.unread_count || 0) + 1,
                }
              : chat
          );
          
          const sorted = updated.sort((a, b) => {
            const timeA = new Date(a.last_message_at || a.created_at || 0).getTime();
            const timeB = new Date(b.last_message_at || b.created_at || 0).getTime();
            return timeB - timeA;
          });
          chatsRef.current = sorted;
          return sorted;
        });
      }
    });

    // Listen for latest messages response
    newSocket.on("support:latest-messages", (data) => {
      if (data && data.chat_id && data.messages) {
        const currentSelectedChat = selectedChatRef.current;
        if (currentSelectedChat && currentSelectedChat.id === data.chat_id) {
          // Merge with existing messages, avoiding duplicates
          setMessages((prev) => {
            const existingIds = new Set(prev.map((msg) => msg.id));
            const newMessages = data.messages.filter((msg) => !existingIds.has(msg.id));
            if (newMessages.length === 0) return prev;
            
            // Combine and sort by created_at
            const combined = [...prev, ...newMessages].sort((a, b) => {
              const timeA = new Date(a.created_at || 0).getTime();
              const timeB = new Date(b.created_at || 0).getTime();
              return timeA - timeB;
            });
            
            return combined;
          });
          scrollToBottom();
        }
      }
    });

    // Listen for any message-related events (for debugging)
    newSocket.onAny((eventName, ...args) => {
      // Debug: log all socket events (can be removed in production)
      if (process.env.NODE_ENV === "development") {
        if (eventName.includes("message") || eventName.includes("chat")) {
          console.log("📨 Socket event:", eventName, args);
        }
      }
    });

    setSocket(newSocket);

    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      newSocket.disconnect();
      setIsConnected(false);
    };
  }, []);

  // Update selectedChat ref when it changes
  useEffect(() => {
    selectedChatRef.current = selectedChat;
  }, [selectedChat]);

  // Update chats ref when chats change
  useEffect(() => {
    chatsRef.current = chats;
  }, [chats]);

  // Join chat room when selected chat changes
  useEffect(() => {
    if (socket && socket.connected && selectedChat) {
      // Leave previous room
      if (currentRoomRef.current && currentRoomRef.current !== selectedChat.id) {
        socket.emit("support:leave-chat", currentRoomRef.current);
      }
      
      // Join new room
      currentRoomRef.current = selectedChat.id;
      socket.emit("support:join-chat", selectedChat.id);
      
      // Fetch messages (this will also mark as read)
      fetchMessages(selectedChat.id);
      
      // Reset unread count
      setChats((prev) => {
        const updated = prev.map((chat) =>
          chat.id === selectedChat.id ? { ...chat, unread_count: 0 } : chat
        );
        chatsRef.current = updated;
        return updated;
      });
      
      // Mark as read via socket
      socket.emit("support:mark-chat-read", selectedChat.id);
      
      // Request latest messages from server via socket
      socket.emit("support:get-latest-messages", selectedChat.id);
    }
    
    return () => {
      // Cleanup: leave room when component unmounts or chat changes
      if (socket && socket.connected && currentRoomRef.current) {
        socket.emit("support:leave-chat", currentRoomRef.current);
        currentRoomRef.current = null;
      }
    };
  }, [selectedChat, socket]);

  // Initial fetch
  useEffect(() => {
    fetchChats();
    fetchFAQs();
  }, [statusFilter]);

  // Fetch FAQs
  const fetchFAQs = async () => {
    try {
      setFaqsLoading(true);
      const response = await baseUrl.get("/api/support/faq", {
        headers: {
          Authorization: getAuthHeader(),
        },
        params: {
          active_only: false, // Get all FAQs for management
        },
      });
      setFaqs(response.data.faqs || []);
    } catch (error) {
      console.error("Error fetching FAQs:", error);
      toast({
        title: "خطأ",
        description: "فشل في تحميل الردود التلقائية",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setFaqsLoading(false);
    }
  };

  // Create FAQ
  const createFAQ = async () => {
    try {
      if (!faqForm.question.trim() || !faqForm.answer.trim()) {
        toast({
          title: "خطأ",
          description: "يرجى إدخال السؤال والإجابة",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
        return;
      }

      setCreatingFaq(true);

      const response = await baseUrl.post(
        "/api/support/faq",
        faqForm,
        {
          headers: {
            Authorization: getAuthHeader(),
            "Content-Type": "application/json",
          },
        }
      );

      toast({
        title: "نجح",
        description: "تم إنشاء الرد التلقائي بنجاح",
        status: "success",
        duration: 2000,
        isClosable: true,
      });

      setFaqForm({
        question: "",
        answer: "",
        keywords: [],
        priority: 0,
        is_active: true,
      });
      setKeywordInput("");
      await fetchFAQs();
      
      // Switch to list tab after creation
      setTimeout(() => {
        const tabs = document.querySelectorAll('[role="tab"]');
        if (tabs[0]) tabs[0].click();
      }, 100);
    } catch (error) {
      console.error("Error creating FAQ:", error);
      toast({
        title: "خطأ",
        description: error.response?.data?.message || "فشل في إنشاء الرد التلقائي",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setCreatingFaq(false);
    }
  };

  // Update FAQ
  const updateFAQ = async () => {
    try {
      if (!selectedFaq || !faqForm.question.trim() || !faqForm.answer.trim()) {
        toast({
          title: "خطأ",
          description: "يرجى إدخال السؤال والإجابة",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
        return;
      }

      setUpdatingFaq(true);

      await baseUrl.put(
        `/api/support/faq/${selectedFaq.id}`,
        faqForm,
        {
          headers: {
            Authorization: getAuthHeader(),
            "Content-Type": "application/json",
          },
        }
      );

      toast({
        title: "نجح",
        description: "تم تحديث الرد التلقائي بنجاح",
        status: "success",
        duration: 2000,
        isClosable: true,
      });

      setSelectedFaq(null);
      setFaqForm({
        question: "",
        answer: "",
        keywords: [],
        priority: 0,
        is_active: true,
      });
      setKeywordInput("");
      await fetchFAQs();
      
      // Switch to list tab after update
      setTimeout(() => {
        const tabs = document.querySelectorAll('[role="tab"]');
        if (tabs[0]) tabs[0].click();
      }, 100);
    } catch (error) {
      console.error("Error updating FAQ:", error);
      toast({
        title: "خطأ",
        description: error.response?.data?.message || "فشل في تحديث الرد التلقائي",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setUpdatingFaq(false);
    }
  };

  // Delete FAQ
  const deleteFAQ = async () => {
    try {
      if (!selectedFaq) return;

      setDeletingFaq(true);

      await baseUrl.delete(`/api/support/faq/${selectedFaq.id}`, {
        headers: {
          Authorization: getAuthHeader(),
        },
      });

      toast({
        title: "نجح",
        description: "تم حذف الرد التلقائي بنجاح",
        status: "success",
        duration: 2000,
        isClosable: true,
      });

      const deletedFaq = selectedFaq;
      setSelectedFaq(null);
      onDeleteFaqClose();
      await fetchFAQs();
    } catch (error) {
      console.error("Error deleting FAQ:", error);
      toast({
        title: "خطأ",
        description: error.response?.data?.message || "فشل في حذف الرد التلقائي",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setDeletingFaq(false);
    }
  };

  // Test Match
  const testMatch = async () => {
    try {
      if (!testQuestion.trim()) {
        toast({
          title: "خطأ",
          description: "يرجى إدخال سؤال للاختبار",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
        return;
      }

      const response = await baseUrl.post(
        "/api/support/faq/test-match",
        { question: testQuestion },
        {
          headers: {
            Authorization: getAuthHeader(),
            "Content-Type": "application/json",
          },
        }
      );

      setTestResult(response.data);
    } catch (error) {
      console.error("Error testing match:", error);
      setTestResult({ matched: false, question: testQuestion });
    }
  };

  // Handle FAQ form actions
  const handleOpenFaqDrawer = (faq = null) => {
    if (faq) {
      setSelectedFaq(faq);
      setFaqForm({
        question: faq.question || "",
        answer: faq.answer || "",
        keywords: faq.keywords || [],
        priority: faq.priority || 0,
        is_active: faq.is_active !== undefined ? faq.is_active : true,
      });
      setKeywordInput("");
    } else {
      setSelectedFaq(null);
      setFaqForm({
        question: "",
        answer: "",
        keywords: [],
        priority: 0,
        is_active: true,
      });
      setKeywordInput("");
    }
    onFaqDrawerOpen();
  };

  const handleCloseFaqDrawer = () => {
    setSelectedFaq(null);
    setFaqForm({
      question: "",
      answer: "",
      keywords: [],
      priority: 0,
      is_active: true,
    });
    setKeywordInput("");
    onFaqDrawerClose();
  };

  const handleAddKeyword = () => {
    if (keywordInput.trim() && !faqForm.keywords.includes(keywordInput.trim())) {
      setFaqForm({
        ...faqForm,
        keywords: [...faqForm.keywords, keywordInput.trim()],
      });
      setKeywordInput("");
    }
  };

  const handleRemoveKeyword = (keyword) => {
    setFaqForm({
      ...faqForm,
      keywords: faqForm.keywords.filter((k) => k !== keyword),
    });
  };

  const handleSubmitFaq = () => {
    if (selectedFaq) {
      updateFAQ();
    } else {
      createFAQ();
    }
  };

  // Filter chats
  const filteredChats = chats.filter((chat) => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        chat.student_name?.toLowerCase().includes(query) ||
        chat.student_email?.toLowerCase().includes(query)
      );
    }
    return true;
  });

  // Get status badge color
  const getStatusColor = (status) => {
    switch (status) {
      case "open":
        return "blue";
      case "closed":
        return "gray";
      case "resolved":
        return "green";
      default:
        return "gray";
    }
  };

  // Get status label
  const getStatusLabel = (status) => {
    switch (status) {
      case "open":
        return "مفتوح";
      case "closed":
        return "مغلق";
      case "resolved":
        return "تم الحل";
      default:
        return status;
    }
  };

  // Get message status icon
  const getMessageStatusIcon = (status) => {
    switch (status) {
      case "read":
        return <MdDoneAll color="blue" />;
      case "delivered":
        return <MdDoneAll color="gray" />;
      case "sent":
        return <MdDone color="gray" />;
      default:
        return <MdDone color="gray" />;
    }
  };

  // Format duration
  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Handle chat selection on mobile
  const handleChatSelect = (chat) => {
    setSelectedChat(chat);
    if (isMobile) {
      onMobileChatsClose();
    }
  };

  return (
    <Container className="mt-[50px]" maxW="1600px" py={{ base: 3, md: 6 }} px={{ base: 2, md: 4 }} dir="rtl">
      <VStack spacing={{ base: 3, md: 4 }} align="stretch" h={{ base: "calc(100vh - 80px)", md: "calc(100vh - 120px)" }}>
        {/* Header - Hidden on Mobile */}
        <Box display={{ base: "none", md: "block" }}>
          <VStack align="stretch" spacing={3}>
            <HStack justify="space-between" flexWrap="wrap" spacing={2}>
              <VStack align="flex-start" spacing={1} flex={1} minW="200px">
                <Text fontSize={{ base: "xl", md: "2xl" }} fontWeight="bold" color={textColor}>
                  إدارة شات الدعم الفني
                </Text>
                <Text fontSize={{ base: "xs", md: "sm" }} color={subTextColor}>
                  إدارة محادثات الطلاب والدعم الفني
                </Text>
              </VStack>
              <HStack spacing={2} flexWrap="wrap">
                {!isConnected && (
                  <Badge colorScheme="orange" fontSize="xs" px={2} py={1} borderRadius="full">
                    غير متصل
                  </Badge>
                )}
                {isConnected && (
                  <Badge colorScheme="green" fontSize="xs" px={2} py={1} borderRadius="full">
                    متصل
                  </Badge>
                )}
                {unreadCount > 0 && (
                  <Badge colorScheme="red" fontSize={{ base: "xs", md: "md" }} px={{ base: 2, md: 3 }} py={1} borderRadius="full">
                    {unreadCount} غير مقروءة
                  </Badge>
                )}
              </HStack>
            </HStack>
            <HStack spacing={2} flexWrap="wrap">
              <Button
                leftIcon={<MdQuestionAnswer />}
                colorScheme="purple"
                variant="outline"
                onClick={onTestMatchOpen}
                size={{ base: "xs", md: "sm" }}
                fontSize={{ base: "xs", md: "sm" }}
                flex={{ base: 1, md: "none" }}
                minW={{ base: "auto", md: "auto" }}
              >
                <Text display={{ base: "none", sm: "block" }}>اختبار المطابقة</Text>
                <Text display={{ base: "block", sm: "none" }}>اختبار</Text>
              </Button>
              <Button
                leftIcon={<MdSettings />}
                colorScheme="blue"
                onClick={() => handleOpenFaqDrawer()}
                size={{ base: "xs", md: "sm" }}
                fontSize={{ base: "xs", md: "sm" }}
                flex={{ base: 1, md: "none" }}
                minW={{ base: "auto", md: "auto" }}
              >
                <Text display={{ base: "none", sm: "block" }}>إدارة الردود التلقائية</Text>
                <Text display={{ base: "block", sm: "none" }}>الردود</Text>
              </Button>
            </HStack>
          </VStack>
        </Box>

        <Flex
          gap={0}
          h="full"
          flex={1}
          overflow="hidden"
          direction="row"
          position="relative"
        >
          {/* Chats List - Always visible when no chat selected */}
          {!selectedChat && (
            <Box
              w={{ base: "100%", md: chatsListWidth }}
              bg={bgColor}
              borderRadius="xl"
              border="1px solid"
              borderColor={borderColor}
              shadow="md"
              display="flex"
              flexDirection="column"
              overflow="hidden"
            >
            {/* Search and Filter */}
            <Box p={4} borderBottom="1px solid" borderColor={borderColor}>
              <InputGroup size="md" mb={3}>
                <InputLeftElement pointerEvents="none">
                  <MdSearch color="gray.400" />
                </InputLeftElement>
                <Input
                  placeholder="ابحث عن شات..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  bg={inputBg}
                  borderColor={borderColor}
                />
              </InputGroup>
              <Menu>
                <MenuButton
                  as={Button}
                  size="sm"
                  variant="outline"
                  rightIcon={<MdFilterList />}
                  w="full"
                >
                  {statusFilter === "all"
                    ? "جميع الحالات"
                    : getStatusLabel(statusFilter)}
                </MenuButton>
                <MenuList>
                  <MenuItem onClick={() => setStatusFilter("all")}>
                    جميع الحالات
                  </MenuItem>
                  <MenuItem onClick={() => setStatusFilter("open")}>
                    مفتوح
                  </MenuItem>
                  <MenuItem onClick={() => setStatusFilter("closed")}>
                    مغلق
                  </MenuItem>
                  <MenuItem onClick={() => setStatusFilter("resolved")}>
                    تم الحل
                  </MenuItem>
                </MenuList>
              </Menu>
            </Box>

            {/* Chats */}
            <Box flex={1} overflowY="auto">
              {loading ? (
                <Flex justify="center" align="center" h="200px">
                  <Spinner size="lg" color="blue.500" />
                </Flex>
              ) : filteredChats.length === 0 ? (
                <Flex
                  justify="center"
                  align="center"
                  h="200px"
                  direction="column"
                >
                  <MdMessage size={48} color="gray" />
                  <Text color={subTextColor} mt={2}>
                    لا توجد شاتات
                  </Text>
                </Flex>
              ) : (
                filteredChats.map((chat) => (
                  <Box
                    key={chat.id}
                    p={4}
                    cursor="pointer"
                    bg={
                      selectedChat?.id === chat.id
                        ? selectedChatBg
                        : "transparent"
                    }
                    borderBottom="1px solid"
                    borderColor={borderColor}
                    _hover={{
                      bg: hoverChatBg,
                    }}
                    onClick={() => handleChatSelect(chat)}
                  >
                    <HStack spacing={3}>
                      <Avatar
                        name={chat.student_name}
                        size="md"
                        bg="blue.500"
                      />
                      <VStack align="flex-start" spacing={1} flex={1}>
                        <HStack justify="space-between" w="full">
                          <Text fontWeight="bold" fontSize="sm" color={textColor}>
                            {chat.student_name}
                          </Text>
                          {chat.unread_count > 0 && (
                            <Badge
                              colorScheme="red"
                              borderRadius="full"
                              fontSize="xs"
                            >
                              {chat.unread_count}
                            </Badge>
                          )}
                        </HStack>
                        <Text
                          fontSize="xs"
                          color={subTextColor}
                          noOfLines={1}
                          w="full"
                        >
                          {chat.student_email}
                        </Text>
                        <HStack spacing={2}>
                          <Badge
                            colorScheme={getStatusColor(chat.status)}
                            fontSize="xs"
                          >
                            {getStatusLabel(chat.status)}
                          </Badge>
                          {chat.last_message_at && (
                            <Text fontSize="xs" color={subTextColor}>
                              {dayjs(chat.last_message_at).fromNow()}
                            </Text>
                          )}
                        </HStack>
                      </VStack>
                    </HStack>
                  </Box>
                ))
              )}
            </Box>
            </Box>
          )}

          {/* Back to Chats List Button - Desktop */}
          {selectedChat && !isMobile && (
            <Box
              w={chatsListWidth}
              bg={bgColor}
              borderRadius="xl"
              border="1px solid"
              borderColor={borderColor}
              shadow="md"
              p={4}
              display="flex"
              flexDirection="column"
              alignItems="center"
              justifyContent="center"
            >
              <VStack spacing={4}>
                <IconButton
                  icon={<MdClose />}
                  onClick={() => setSelectedChat(null)}
                  size="lg"
                  colorScheme="blue"
                  variant="outline"
                  borderRadius="full"
                  aria-label="العودة إلى قائمة المحادثات"
                />
                <Text fontSize="sm" color={subTextColor} textAlign="center">
                  اضغط للعودة إلى قائمة المحادثات
                </Text>
              </VStack>
            </Box>
          )}

          {/* Mobile: Chats List Drawer */}
          {isMobile && !selectedChat && (
            <MobileDrawer
              isOpen={isMobileChatsOpen}
              placement="right"
              onClose={onMobileChatsClose}
              size="full"
            >
              <MobileDrawerOverlay />
              <MobileDrawerContent>
                <MobileDrawerCloseButton />
                <MobileDrawerHeader borderBottom="1px solid" borderColor={borderColor}>
                  <Text fontSize="lg" fontWeight="bold">
                    المحادثات
                  </Text>
                </MobileDrawerHeader>
                <MobileDrawerBody p={0}>
                  <Box
                    bg={bgColor}
                    h="full"
                    display="flex"
                    flexDirection="column"
                    overflow="hidden"
                  >
                    {/* Search and Filter */}
                    <Box p={3} borderBottom="1px solid" borderColor={borderColor}>
                      <InputGroup size="md" mb={2}>
                        <InputLeftElement pointerEvents="none">
                          <MdSearch color="gray.400" />
                        </InputLeftElement>
                        <Input
                          placeholder="ابحث عن شات..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          bg={inputBg}
                          borderColor={borderColor}
                          fontSize="sm"
                        />
                      </InputGroup>
                      <Menu>
                        <MenuButton
                          as={Button}
                          size="sm"
                          variant="outline"
                          rightIcon={<MdFilterList />}
                          w="full"
                          fontSize="xs"
                        >
                          {statusFilter === "all"
                            ? "جميع الحالات"
                            : getStatusLabel(statusFilter)}
                        </MenuButton>
                        <MenuList>
                          <MenuItem onClick={() => setStatusFilter("all")}>
                            جميع الحالات
                          </MenuItem>
                          <MenuItem onClick={() => setStatusFilter("open")}>
                            مفتوح
                          </MenuItem>
                          <MenuItem onClick={() => setStatusFilter("closed")}>
                            مغلق
                          </MenuItem>
                          <MenuItem onClick={() => setStatusFilter("resolved")}>
                            تم الحل
                          </MenuItem>
                        </MenuList>
                      </Menu>
                    </Box>

                    {/* Chats */}
                    <Box flex={1} overflowY="auto">
                      {loading ? (
                        <Flex justify="center" align="center" h="200px">
                          <Spinner size="lg" color="blue.500" />
                        </Flex>
                      ) : filteredChats.length === 0 ? (
                        <Flex
                          justify="center"
                          align="center"
                          h="200px"
                          direction="column"
                        >
                          <MdMessage size={48} color="gray" />
                          <Text color={subTextColor} mt={2} fontSize="sm">
                            لا توجد شاتات
                          </Text>
                        </Flex>
                      ) : (
                        filteredChats.map((chat) => (
                          <Box
                            key={chat.id}
                            p={3}
                            cursor="pointer"
                            bg={
                              selectedChat?.id === chat.id
                                ? selectedChatBg
                                : "transparent"
                            }
                            borderBottom="1px solid"
                            borderColor={borderColor}
                            _hover={{
                              bg: hoverChatBg,
                            }}
                            onClick={() => handleChatSelect(chat)}
                          >
                            <HStack spacing={2}>
                              <Avatar
                                name={chat.student_name}
                                size="sm"
                                bg="blue.500"
                              />
                              <VStack align="flex-start" spacing={1} flex={1}>
                                <HStack justify="space-between" w="full">
                                  <Text fontWeight="bold" fontSize="xs" color={textColor} noOfLines={1}>
                                    {chat.student_name}
                                  </Text>
                                  {chat.unread_count > 0 && (
                                    <Badge
                                      colorScheme="red"
                                      borderRadius="full"
                                      fontSize="2xs"
                                      px={1.5}
                                      py={0.5}
                                    >
                                      {chat.unread_count}
                                    </Badge>
                                  )}
                                </HStack>
                                <Text
                                  fontSize="2xs"
                                  color={subTextColor}
                                  noOfLines={1}
                                  w="full"
                                >
                                  {chat.student_email}
                                </Text>
                                <HStack spacing={1.5} flexWrap="wrap">
                                  <Badge
                                    colorScheme={getStatusColor(chat.status)}
                                    fontSize="2xs"
                                    px={1.5}
                                    py={0.5}
                                  >
                                    {getStatusLabel(chat.status)}
                                  </Badge>
                                  {chat.last_message_at && (
                                    <Text fontSize="2xs" color={subTextColor}>
                                      {dayjs(chat.last_message_at).fromNow()}
                                    </Text>
                                  )}
                                </HStack>
                              </VStack>
                            </HStack>
                          </Box>
                        ))
                      )}
                    </Box>
                  </Box>
                </MobileDrawerBody>
              </MobileDrawerContent>
            </MobileDrawer>
          )}

          {/* Chat Messages - Only show when chat is selected */}
          {selectedChat ? (
            <Box
              flex={1}
              bg={bgColor}
              borderRadius={{ base: "md", md: "xl" }}
              border="1px solid"
              borderColor={borderColor}
              shadow="md"
              display="flex"
              flexDirection="column"
              overflow="hidden"
              w={{ base: "100%", md: "auto" }}
              minH={{ base: "calc(100vh - 200px)", md: "auto" }}
            >
              <>
                {/* Chat Header */}
                <Box
                  p={{ base: 3, md: 4 }}
                  borderBottom="1px solid"
                  borderColor={borderColor}
                  bg={headerBg}
                >
                  <HStack justify="space-between">
                    <HStack spacing={{ base: 2, md: 3 }} flex={1} minW={0}>
                      {/* Back Button - Mobile */}
                      {isMobile && (
                        <IconButton
                          icon={<MdClose />}
                          onClick={() => {
                            setSelectedChat(null);
                            onMobileChatsOpen();
                          }}
                          variant="ghost"
                          size="sm"
                          aria-label="العودة إلى قائمة المحادثات"
                        />
                      )}
                      <Avatar
                        name={selectedChat.student_name}
                        size={{ base: "sm", md: "md" }}
                        bg="blue.500"
                      />
                      <VStack align="flex-start" spacing={0} flex={1} minW={0}>
                        <Text
                          fontWeight="bold"
                          color={textColor}
                          fontSize={{ base: "sm", md: "md" }}
                          noOfLines={1}
                        >
                          {selectedChat.student_name}
                        </Text>
                        <Text
                          fontSize={{ base: "xs", md: "sm" }}
                          color={subTextColor}
                          noOfLines={1}
                        >
                          {selectedChat.student_email}
                        </Text>
                      </VStack>
                    </HStack>
                    <Menu>
                      <MenuButton
                        as={IconButton}
                        icon={<MdMoreVert />}
                        variant="ghost"
                        size={{ base: "sm", md: "md" }}
                      />
                      <MenuList>
                        <MenuItem
                          onClick={() =>
                            updateChatStatus(selectedChat.id, "resolved")
                          }
                          fontSize={{ base: "xs", md: "sm" }}
                        >
                          تم الحل
                        </MenuItem>
                        <MenuItem
                          onClick={() =>
                            updateChatStatus(selectedChat.id, "closed")
                          }
                          fontSize={{ base: "xs", md: "sm" }}
                        >
                          إغلاق الشات
                        </MenuItem>
                        <MenuItem
                          onClick={() =>
                            updateChatStatus(selectedChat.id, "open")
                          }
                          fontSize={{ base: "xs", md: "sm" }}
                        >
                          فتح الشات
                        </MenuItem>
                      </MenuList>
                    </Menu>
                  </HStack>
                </Box>

                {/* Messages */}
                <Box
                  flex={1}
                  overflowY="auto"
                  p={{ base: 2, md: 4 }}
                  bg={chatBg}
                  backgroundImage={`url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`}
                >
                  {messages.map((message) => {
                    const isAdmin = message.sender_role === "admin";
                    const isAutoReply = message.is_auto_reply;
                    return (
                      <Flex
                        key={message.id}
                        justify={isAdmin ? "flex-end" : "flex-start"}
                        mb={4}
                      >
                        <Box
                          maxW={{ base: "85%", md: "70%" }}
                          bg={
                            isAdmin
                              ? "blue.500"
                              : isAutoReply
                              ? "purple.500"
                              : "white"
                          }
                          color={isAdmin || isAutoReply ? "white" : textColor}
                          p={{ base: 2, md: 3 }}
                          borderRadius="xl"
                          borderTopLeftRadius={isAdmin ? "xl" : "sm"}
                          borderTopRightRadius={isAdmin ? "sm" : "xl"}
                          shadow="sm"
                        >
                          {isAutoReply && (
                            <Badge
                              colorScheme="purple"
                              fontSize="xs"
                              mb={1}
                              variant="solid"
                            >
                              رد تلقائي
                            </Badge>
                          )}
                          {message.message_type === "text" && (
                            <Text fontSize="sm">
                              {message.text}
                              {message.is_optimistic && (
                                <Text as="span" fontSize="xs" opacity={0.7} ml={2}>
                                  (جاري الإرسال...)
                                </Text>
                              )}
                            </Text>
                          )}
                          {message.message_type === "image" && message.media_url && (
                            <Box>
                              <Image
                                src={message.media_url}
                                alt={message.text || "صورة"}
                                maxH="300px"
                                borderRadius="md"
                                mb={message.text ? 2 : 0}
                              />
                              {message.is_optimistic && (
                                <Text fontSize="xs" opacity={0.7} mt={1}>
                                  جاري الإرسال...
                                </Text>
                              )}
                            </Box>
                          )}
                          {message.message_type === "video" && message.media_url && (
                            <Box mb={message.text ? 2 : 0}>
                              <video
                                controls
                                src={message.media_url}
                                style={{
                                  maxWidth: "100%",
                                  maxHeight: "300px",
                                  borderRadius: "8px",
                                }}
                              >
                                متصفحك لا يدعم الفيديو
                              </video>
                            </Box>
                          )}
                          {message.message_type === "audio" && message.media_url && (
                            <Box mb={message.text ? 2 : 0}>
                              <audio
                                controls
                                src={message.media_url}
                                style={{ width: "100%" }}
                              >
                                <source
                                  src={message.media_url}
                                  type={message.media_type || "audio/mpeg"}
                                />
                                متصفحك لا يدعم تشغيل الصوت
                              </audio>
                              {message.duration && (
                                <Text fontSize="xs" mt={1} opacity={0.8}>
                                  {formatDuration(message.duration)} ثانية
                                </Text>
                              )}
                              {message.is_optimistic && (
                                <Text fontSize="xs" opacity={0.7} mt={1}>
                                  جاري الإرسال...
                                </Text>
                              )}
                            </Box>
                          )}
                          {message.message_type === "file" && message.media_url && (
                            <Link
                              href={message.media_url}
                              isExternal
                              color={isAdmin || isAutoReply ? "white" : "blue.500"}
                            >
                              <HStack spacing={2}>
                                <MdInsertDriveFile size={20} />
                                <Text fontSize="sm">
                                  {message.media_name || "ملف"}
                                </Text>
                              </HStack>
                            </Link>
                          )}
                          <HStack
                            justify={isAdmin ? "flex-end" : "flex-start"}
                            mt={2}
                            spacing={2}
                          >
                            <Text
                              fontSize="xs"
                              opacity={0.8}
                            >
                              {dayjs(message.created_at).format("h:mm A")}
                            </Text>
                            {isAdmin && (
                              <Tooltip
                                label={
                                  message.status === "read"
                                    ? "تمت المشاهدة"
                                    : message.status === "delivered"
                                    ? "تم الاستلام"
                                    : "تم الإرسال"
                                }
                              >
                                <Box>{getMessageStatusIcon(message.status)}</Box>
                              </Tooltip>
                            )}
                          </HStack>
                        </Box>
                      </Flex>
                    );
                  })}
                  
                  {/* Typing Indicator */}
                  {isTyping && typingUser && (
                    <Flex justify="flex-start" mb={4}>
                      <Box
                        bg="white"
                        p={3}
                        borderRadius="xl"
                        borderTopLeftRadius="sm"
                        shadow="sm"
                      >
                        <Text fontSize="sm" color={textColor}>
                          {typingUser} يكتب...
                        </Text>
                      </Box>
                    </Flex>
                  )}
                  
                  <div ref={messagesEndRef} />
                </Box>

                {/* Message Input */}
                <Box
                  p={{ base: 2, md: 4 }}
                  borderTop="1px solid"
                  borderColor={borderColor}
                  bg={bgColor}
                >
                  {isRecording && (
                    <HStack mb={2} p={2} bg="red.50" borderRadius="md">
                      <IconButton
                        icon={<MdStop />}
                        colorScheme="red"
                        onClick={stopRecording}
                        size="xs"
                      />
                      <Text fontSize={{ base: "xs", md: "sm" }} color="red.600" fontWeight="bold">
                        {formatDuration(recordingDuration)}
                      </Text>
                      <Text fontSize="2xs" color="red.500">
                        جاري التسجيل...
                      </Text>
                    </HStack>
                  )}
                  
                  <HStack spacing={{ base: 1, md: 2 }}>
                    <InputGroup flex={1}>
                      <Input
                        placeholder="اكتب رسالة..."
                        value={messageText}
                        onChange={(e) => {
                          setMessageText(e.target.value);
                          handleTyping(e.target.value.length > 0);
                        }}
                        onKeyPress={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            sendMessage();
                            handleTyping(false);
                          }
                        }}
                        bg={inputBg}
                        borderColor={borderColor}
                        size={{ base: "sm", md: "md" }}
                        fontSize={{ base: "sm", md: "md" }}
                      />
                    </InputGroup>
                    <Menu>
                      <MenuButton
                        as={IconButton}
                        icon={<MdAttachFile />}
                        variant="ghost"
                        size={{ base: "sm", md: "md" }}
                      />
                      <MenuList>
                        <MenuItem
                          icon={<MdImage />}
                          onClick={() => fileInputRef.current?.click()}
                          fontSize={{ base: "xs", md: "sm" }}
                        >
                          صورة
                        </MenuItem>
                        <MenuItem
                          icon={<MdVideoLibrary />}
                          onClick={() => {
                            const input = document.createElement("input");
                            input.type = "file";
                            input.accept = "video/*";
                            input.onchange = (e) => {
                              const file = e.target.files[0];
                              if (file) sendMedia(file, "video");
                            };
                            input.click();
                          }}
                          fontSize={{ base: "xs", md: "sm" }}
                        >
                          فيديو
                        </MenuItem>
                        <MenuItem
                          icon={<MdInsertDriveFile />}
                          onClick={() => {
                            const input = document.createElement("input");
                            input.type = "file";
                            input.onchange = (e) => {
                              const file = e.target.files[0];
                              if (file) sendMedia(file, "file");
                            };
                            input.click();
                          }}
                          fontSize={{ base: "xs", md: "sm" }}
                        >
                          ملف
                        </MenuItem>
                      </MenuList>
                    </Menu>
                    {!isRecording ? (
                      <IconButton
                        icon={<MdMic />}
                        onClick={startRecording}
                        variant="ghost"
                        colorScheme="red"
                        size={{ base: "sm", md: "md" }}
                      />
                    ) : (
                      <IconButton
                        icon={<MdStop />}
                        onClick={stopRecording}
                        variant="ghost"
                        colorScheme="red"
                        size={{ base: "sm", md: "md" }}
                      />
                    )}
                    <Button
                      colorScheme="blue"
                      onClick={sendMessage}
                      isLoading={sending}
                      leftIcon={<MdSend />}
                      size={{ base: "sm", md: "md" }}
                      fontSize={{ base: "xs", md: "sm" }}
                      px={{ base: 3, md: 4 }}
                    >
                      <Text display={{ base: "none", sm: "block" }}>إرسال</Text>
                      <Text display={{ base: "block", sm: "none" }}>✓</Text>
                    </Button>
                  </HStack>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    style={{ display: "none" }}
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) sendMedia(file, "image");
                      e.target.value = "";
                    }}
                  />
                </Box>
              </>
            ) : null}
            </Box>
          ) : (
            /* Empty State - No chat selected */
            !isMobile && (
              <Box
                flex={1}
                bg={bgColor}
                borderRadius="xl"
                border="1px solid"
                borderColor={borderColor}
                shadow="md"
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <VStack spacing={4} color={subTextColor}>
                  <MdMessage size={64} />
                  <Text fontSize="lg" fontWeight="medium">
                    اختر محادثة لعرض الرسائل
                  </Text>
                  <Text fontSize="sm" textAlign="center" px={4}>
                    اضغط على أي محادثة من القائمة لبدء المحادثة
                  </Text>
                </VStack>
              </Box>
            )
          )}
        </Flex>
      </VStack>

      {/* FAQ Management Drawer */}
      <Drawer
        isOpen={isFaqDrawerOpen}
        placement="right"
        onClose={handleCloseFaqDrawer}
        size={{ base: "full", md: "xl" }}
      >
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader borderBottom="1px solid" borderColor={borderColor} bg={headerBg}>
            <VStack align="flex-start" spacing={2}>
              <HStack spacing={2}>
                <MdQuestionAnswer size={24} color="blue.500" />
                <Text fontSize="xl" fontWeight="bold" color={textColor}>
                  إدارة الردود التلقائية
                </Text>
              </HStack>
              <Text fontSize="sm" color={subTextColor}>
                إنشاء وإدارة الردود التلقائية للأسئلة الشائعة
              </Text>
            </VStack>
          </DrawerHeader>

          <DrawerBody p={0} overflow="hidden">
            <Tabs defaultIndex={selectedFaq ? 1 : 0} colorScheme="blue" h="full" display="flex" flexDirection="column">
              <TabList px={4} pt={4} borderBottom="1px solid" borderColor={borderColor}>
                <Tab>
                  <HStack spacing={2}>
                    <MdQuestionAnswer />
                    <Text>قائمة الردود ({faqs.length})</Text>
                  </HStack>
                </Tab>
                <Tab>
                  <HStack spacing={2}>
                    {selectedFaq ? <MdEdit /> : <MdAdd />}
                    <Text>{selectedFaq ? "تعديل رد تلقائي" : "إضافة رد تلقائي جديد"}</Text>
                  </HStack>
                </Tab>
              </TabList>

              <TabPanels flex={1} overflowY="auto" px={4} py={4}>
                {/* Tab 1: FAQs List */}
                <TabPanel p={0}>
                  <VStack spacing={4} align="stretch">
                    {/* Action Buttons */}
                    <HStack justify="space-between">
                      <Text fontWeight="bold" fontSize="md" color={textColor}>
                        جميع الردود التلقائية
                      </Text>
                      <Button
                        leftIcon={<MdAdd />}
                        colorScheme="blue"
                        size="sm"
                        onClick={() => {
                          handleOpenFaqDrawer();
                          // Switch to form tab
                          const tabs = document.querySelectorAll('[role="tab"]');
                          if (tabs[1]) tabs[1].click();
                        }}
                      >
                        إضافة جديد
                      </Button>
                    </HStack>

                    {/* FAQs List */}
                    {faqsLoading ? (
                      <Flex justify="center" align="center" py={12}>
                        <VStack spacing={4}>
                          <Spinner size="xl" color="blue.500" />
                          <Text color={subTextColor}>جاري التحميل...</Text>
                        </VStack>
                      </Flex>
                    ) : faqs.length === 0 ? (
                      <Card bg={bgColor} border="1px solid" borderColor={borderColor}>
                        <CardBody>
                          <VStack spacing={4} py={8}>
                            <MdQuestionAnswer size={64} color={subTextColor} />
                            <VStack spacing={2}>
                              <Text fontSize="lg" fontWeight="bold" color={textColor}>
                                لا توجد ردود تلقائية
                              </Text>
                              <Text fontSize="sm" color={subTextColor} textAlign="center">
                                ابدأ بإنشاء رد تلقائي جديد للأسئلة الشائعة
                              </Text>
                            </VStack>
                            <Button
                              leftIcon={<MdAdd />}
                              colorScheme="blue"
                              onClick={() => {
                                handleOpenFaqDrawer();
                                const tabs = document.querySelectorAll('[role="tab"]');
                                if (tabs[1]) tabs[1].click();
                              }}
                            >
                              إضافة رد تلقائي جديد
                            </Button>
                          </VStack>
                        </CardBody>
                      </Card>
                    ) : (
                      <VStack spacing={3} align="stretch">
                        {faqs.map((faq) => (
                          <Card
                            key={faq.id}
                            bg={selectedFaq?.id === faq.id ? selectedChatBg : bgColor}
                            border="1px solid"
                            borderColor={
                              selectedFaq?.id === faq.id ? "blue.300" : borderColor
                            }
                            borderWidth={selectedFaq?.id === faq.id ? "2px" : "1px"}
                            cursor="pointer"
                            onClick={() => {
                              handleOpenFaqDrawer(faq);
                              const tabs = document.querySelectorAll('[role="tab"]');
                              if (tabs[1]) tabs[1].click();
                            }}
                            _hover={{
                              borderColor: "blue.300",
                              shadow: "md",
                              transform: "translateY(-2px)",
                              transition: "all 0.2s",
                            }}
                            transition="all 0.2s"
                          >
                            <CardBody p={4}>
                              <HStack justify="space-between" align="flex-start">
                                <VStack align="flex-start" spacing={2} flex={1}>
                                  <HStack spacing={2} w="full">
                                    <Text
                                      fontWeight="bold"
                                      fontSize="md"
                                      color={textColor}
                                      noOfLines={2}
                                      flex={1}
                                    >
                                      {faq.question}
                                    </Text>
                                    {selectedFaq?.id === faq.id && (
                                      <Badge colorScheme="blue" fontSize="xs">
                                        محدد
                                      </Badge>
                                    )}
                                  </HStack>
                                  
                                  <Text
                                    fontSize="sm"
                                    color={subTextColor}
                                    noOfLines={2}
                                    mt={1}
                                  >
                                    {faq.answer.substring(0, 100)}
                                    {faq.answer.length > 100 ? "..." : ""}
                                  </Text>

                                  <HStack spacing={2} flexWrap="wrap">
                                    <Badge
                                      colorScheme={faq.is_active ? "green" : "gray"}
                                      fontSize="xs"
                                      px={2}
                                      py={1}
                                      borderRadius="full"
                                    >
                                      {faq.is_active ? "✓ نشط" : "✗ غير نشط"}
                                    </Badge>
                                    <Badge
                                      colorScheme="blue"
                                      fontSize="xs"
                                      px={2}
                                      py={1}
                                      borderRadius="full"
                                    >
                                      أولوية: {faq.priority}
                                    </Badge>
                                    {faq.keywords && faq.keywords.length > 0 && (
                                      <Badge
                                        colorScheme="purple"
                                        fontSize="xs"
                                        px={2}
                                        py={1}
                                        borderRadius="full"
                                      >
                                        {faq.keywords.length} كلمة مفتاحية
                                      </Badge>
                                    )}
                                  </HStack>

                                  {faq.keywords && faq.keywords.length > 0 && (
                                    <Wrap spacing={1} mt={1}>
                                      {faq.keywords.slice(0, 5).map((keyword, index) => (
                                        <WrapItem key={index}>
                                          <Tag size="sm" colorScheme="blue" borderRadius="full">
                                            {keyword}
                                          </Tag>
                                        </WrapItem>
                                      ))}
                                      {faq.keywords.length > 5 && (
                                        <WrapItem>
                                          <Tag size="sm" colorScheme="gray" borderRadius="full">
                                            +{faq.keywords.length - 5}
                                          </Tag>
                                        </WrapItem>
                                      )}
                                    </Wrap>
                                  )}
                                </VStack>

                                <Menu>
                                  <MenuButton
                                    as={IconButton}
                                    icon={<MdMoreVert />}
                                    variant="ghost"
                                    size="sm"
                                    onClick={(e) => e.stopPropagation()}
                                  />
                                  <MenuList>
                                    <MenuItem
                                      icon={<MdEdit />}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleOpenFaqDrawer(faq);
                                        const tabs = document.querySelectorAll('[role="tab"]');
                                        if (tabs[1]) tabs[1].click();
                                      }}
                                    >
                                      تعديل
                                    </MenuItem>
                                    <MenuItem
                                      icon={<MdDelete />}
                                      color="red.500"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedFaq(faq);
                                        onDeleteFaqOpen();
                                      }}
                                    >
                                      حذف
                                    </MenuItem>
                                  </MenuList>
                                </Menu>
                              </HStack>
                            </CardBody>
                          </Card>
                        ))}
                      </VStack>
                    )}
                  </VStack>
                </TabPanel>

                {/* Tab 2: FAQ Form */}
                <TabPanel p={0}>
                  <VStack spacing={6} align="stretch">
                    {/* Form Header */}
                    <Box>
                      <HStack spacing={2} mb={2}>
                        {selectedFaq ? (
                          <>
                            <MdEdit size={20} color="blue.500" />
                            <Text fontSize="lg" fontWeight="bold" color={textColor}>
                              تعديل رد تلقائي
                            </Text>
                          </>
                        ) : (
                          <>
                            <MdAdd size={20} color="blue.500" />
                            <Text fontSize="lg" fontWeight="bold" color={textColor}>
                              إضافة رد تلقائي جديد
                            </Text>
                          </>
                        )}
                      </HStack>
                      <Text fontSize="sm" color={subTextColor}>
                        املأ النموذج أدناه لإنشاء رد تلقائي جديد
                      </Text>
                    </Box>

                    {/* FAQ Form */}
                    <Card bg={bgColor} border="1px solid" borderColor={borderColor}>
                      <CardBody>
                        <VStack spacing={5} align="stretch">
                          {/* Question */}
                          <FormControl isRequired>
                            <FormLabel fontWeight="semibold" color={textColor}>
                              السؤال
                            </FormLabel>
                              <Input
                                value={faqForm.question}
                                onChange={(e) =>
                                  setFaqForm({ ...faqForm, question: e.target.value })
                                }
                                placeholder="مثال: كيف أشترك في الباقة؟"
                                bg={inputBg}
                                borderColor={borderColor}
                                _focus={{
                                  borderColor: "blue.500",
                                  boxShadow: "0 0 0 1px blue.500",
                                }}
                                size="md"
                                isDisabled={creatingFaq || updatingFaq}
                              />
                            <Text fontSize="xs" color={subTextColor} mt={1}>
                              اكتب السؤال الذي قد يسأله الطالب
                            </Text>
                          </FormControl>

                          {/* Answer */}
                          <FormControl isRequired>
                            <FormLabel fontWeight="semibold" color={textColor}>
                              الإجابة
                            </FormLabel>
                            <Textarea
                              value={faqForm.answer}
                              onChange={(e) =>
                                setFaqForm({ ...faqForm, answer: e.target.value })
                              }
                              placeholder="مثال: يمكنك الاشتراك في الباقة من خلال:&#10;1. الذهاب إلى صفحة الباقات&#10;2. اختيار الباقة المناسبة&#10;3. الضغط على زر الاشتراك"
                              rows={8}
                              bg={inputBg}
                              borderColor={borderColor}
                              _focus={{
                                borderColor: "blue.500",
                                boxShadow: "0 0 0 1px blue.500",
                              }}
                              resize="vertical"
                              isDisabled={creatingFaq || updatingFaq}
                            />
                            <Text fontSize="xs" color={subTextColor} mt={1}>
                              اكتب الإجابة التفصيلية (يمكنك استخدام الأسطر الجديدة)
                            </Text>
                          </FormControl>

                          {/* Keywords */}
                          <FormControl>
                            <FormLabel fontWeight="semibold" color={textColor}>
                              الكلمات المفتاحية
                            </FormLabel>
                            <HStack spacing={2}>
                              <Input
                                value={keywordInput}
                                onChange={(e) => setKeywordInput(e.target.value)}
                                onKeyPress={(e) => {
                                  if (e.key === "Enter" && !creatingFaq && !updatingFaq) {
                                    e.preventDefault();
                                    handleAddKeyword();
                                  }
                                }}
                                placeholder="أدخل كلمة مفتاحية واضغط Enter"
                                bg={inputBg}
                                borderColor={borderColor}
                                _focus={{
                                  borderColor: "blue.500",
                                  boxShadow: "0 0 0 1px blue.500",
                                }}
                                isDisabled={creatingFaq || updatingFaq}
                              />
                              <Button
                                onClick={handleAddKeyword}
                                colorScheme="blue"
                                leftIcon={<MdAdd />}
                                isDisabled={creatingFaq || updatingFaq}
                              >
                                إضافة
                              </Button>
                            </HStack>
                            <Text fontSize="xs" color={subTextColor} mt={1}>
                              أضف كلمات مفتاحية تساعد في مطابقة السؤال (مثال: اشتراك، كيف، باقة)
                            </Text>
                            {faqForm.keywords.length > 0 && (
                              <Box mt={3} p={3} bg={inputBg} borderRadius="md" border="1px solid" borderColor={borderColor}>
                                <Text fontSize="xs" fontWeight="semibold" color={subTextColor} mb={2}>
                                  الكلمات المضافة ({faqForm.keywords.length}):
                                </Text>
                                <Wrap spacing={2}>
                                  {faqForm.keywords.map((keyword, index) => (
                                    <WrapItem key={index}>
                                      <Tag
                                        size="md"
                                        colorScheme="blue"
                                        borderRadius="full"
                                        px={3}
                                        py={1}
                                      >
                                        <TagLabel>{keyword}</TagLabel>
                                        <TagCloseButton
                                          onClick={() => handleRemoveKeyword(keyword)}
                                        />
                                      </Tag>
                                    </WrapItem>
                                  ))}
                                </Wrap>
                              </Box>
                            )}
                          </FormControl>

                          {/* Priority and Active Status */}
                          <HStack spacing={4} align="flex-start">
                            {/* Priority */}
                            <FormControl flex={1}>
                              <FormLabel fontWeight="semibold" color={textColor}>
                                الأولوية
                              </FormLabel>
                              <NumberInput
                                value={faqForm.priority}
                                onChange={(valueString) =>
                                  setFaqForm({
                                    ...faqForm,
                                    priority: parseInt(valueString) || 0,
                                  })
                                }
                                min={0}
                                max={100}
                                isDisabled={creatingFaq || updatingFaq}
                              >
                                <NumberInputField
                                  bg={inputBg}
                                  borderColor={borderColor}
                                  _focus={{
                                    borderColor: "blue.500",
                                    boxShadow: "0 0 0 1px blue.500",
                                  }}
                                />
                                <NumberInputStepper>
                                  <NumberIncrementStepper />
                                  <NumberDecrementStepper />
                                </NumberInputStepper>
                              </NumberInput>
                              <Text fontSize="xs" color={subTextColor} mt={1}>
                                كلما زادت كلما تم فحصها أولاً (0-100)
                              </Text>
                            </FormControl>

                            {/* Active Status */}
                            <FormControl flex={1}>
                              <FormLabel fontWeight="semibold" color={textColor} mb={2}>
                                الحالة
                              </FormLabel>
                              <Box
                                p={3}
                                bg={inputBg}
                                borderRadius="md"
                                border="1px solid"
                                borderColor={borderColor}
                              >
                                <HStack justify="space-between">
                                  <VStack align="flex-start" spacing={0}>
                                    <Text fontSize="sm" fontWeight="medium" color={textColor}>
                                      {faqForm.is_active ? "نشط" : "غير نشط"}
                                    </Text>
                                    <Text fontSize="xs" color={subTextColor}>
                                      {faqForm.is_active
                                        ? "سيتم استخدام هذا الرد"
                                        : "لن يتم استخدام هذا الرد"}
                                    </Text>
                                  </VStack>
                                  <Switch
                                    isChecked={faqForm.is_active}
                                    onChange={(e) =>
                                      setFaqForm({
                                        ...faqForm,
                                        is_active: e.target.checked,
                                      })
                                    }
                                    colorScheme="green"
                                    size="lg"
                                    isDisabled={creatingFaq || updatingFaq}
                                  />
                                </HStack>
                              </Box>
                            </FormControl>
                          </HStack>
                        </VStack>
                      </CardBody>
                    </Card>
                  </VStack>
                </TabPanel>
              </TabPanels>
            </Tabs>
          </DrawerBody>

          <DrawerFooter borderTop="1px solid" borderColor={borderColor} bg={headerBg}>
            <HStack spacing={3} w="full">
              <Button
                variant="outline"
                onClick={handleCloseFaqDrawer}
                flex={1}
                leftIcon={<MdClose />}
              >
                إلغاء
              </Button>
              <Button
                colorScheme="blue"
                onClick={handleSubmitFaq}
                flex={1}
                leftIcon={selectedFaq ? <MdEdit /> : <MdAdd />}
                isLoading={faqsLoading}
              >
                {selectedFaq ? "تحديث الرد التلقائي" : "إنشاء رد تلقائي جديد"}
              </Button>
            </HStack>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      {/* Delete FAQ Alert Dialog */}
      <AlertDialog
        isOpen={isDeleteFaqOpen}
        leastDestructiveRef={undefined}
        onClose={onDeleteFaqClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              حذف رد تلقائي
            </AlertDialogHeader>

            <AlertDialogBody>
              هل أنت متأكد من حذف هذا الرد التلقائي؟ هذا الإجراء لا يمكن التراجع عنه.
              {selectedFaq && (
                <Box mt={2} p={2} bg="gray.50" borderRadius="md">
                  <Text fontWeight="bold">السؤال:</Text>
                  <Text>{selectedFaq.question}</Text>
                </Box>
              )}
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button onClick={onDeleteFaqClose}>إلغاء</Button>
              <Button colorScheme="red" onClick={deleteFAQ} ml={3}>
                حذف
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>

      {/* Test Match Modal */}
      <Modal isOpen={isTestMatchOpen} onClose={onTestMatchClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>اختبار مطابقة السؤال</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4} align="stretch">
              <FormControl>
                <FormLabel>السؤال للاختبار</FormLabel>
                <Input
                  value={testQuestion}
                  onChange={(e) => setTestQuestion(e.target.value)}
                  placeholder="مثال: مش عارف أشترك إزاي"
                  bg={inputBg}
                  borderColor={borderColor}
                />
              </FormControl>

              <Button
                colorScheme="blue"
                onClick={testMatch}
                leftIcon={<MdCheck />}
                w="full"
              >
                اختبار المطابقة
              </Button>

              {testResult && (
                <Box
                  p={4}
                  borderRadius="md"
                  bg={testResult.matched ? "green.50" : "red.50"}
                  border="1px solid"
                  borderColor={testResult.matched ? "green.200" : "red.200"}
                >
                  <HStack spacing={2} mb={2}>
                    {testResult.matched ? (
                      <>
                        <MdCheckCircle color="green" size={24} />
                        <Text fontWeight="bold" color="green.700">
                          تم العثور على تطابق!
                        </Text>
                      </>
                    ) : (
                      <>
                        <MdCloseIcon color="red" size={24} />
                        <Text fontWeight="bold" color="red.700">
                          لم يتم العثور على تطابق
                        </Text>
                      </>
                    )}
                  </HStack>

                  {testResult.matched && testResult.faq && (
                    <VStack align="stretch" spacing={2} mt={3}>
                      <Box>
                        <Text fontWeight="bold" fontSize="sm" color={subTextColor}>
                          السؤال المطابق:
                        </Text>
                        <Text>{testResult.faq.question}</Text>
                      </Box>
                      <Box>
                        <Text fontWeight="bold" fontSize="sm" color={subTextColor}>
                          الإجابة:
                        </Text>
                        <Text whiteSpace="pre-wrap">{testResult.faq.answer}</Text>
                      </Box>
                      {testResult.faq.keywords && testResult.faq.keywords.length > 0 && (
                        <Box>
                          <Text fontWeight="bold" fontSize="sm" color={subTextColor}>
                            الكلمات المفتاحية:
                          </Text>
                          <Wrap spacing={2} mt={1}>
                            {testResult.faq.keywords.map((keyword, index) => (
                              <WrapItem key={index}>
                                <Tag colorScheme="blue">{keyword}</Tag>
                              </WrapItem>
                            ))}
                          </Wrap>
                        </Box>
                      )}
                    </VStack>
                  )}
                </Box>
              )}
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button onClick={onTestMatchClose}>إغلاق</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Container>
  );
};

export default SupportChatAdmin;
