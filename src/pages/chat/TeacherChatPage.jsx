// src/pages/ChatPage.jsx
import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
    Box, Flex, Text, VStack, Divider, InputGroup, InputLeftElement, Input, Icon,
    Avatar, Badge, IconButton, useBreakpointValue, useColorModeValue, Menu, MenuButton, MenuList, MenuItem,
    InputRightElement, useToast, Image, Switch, Spinner, HStack, Drawer, DrawerOverlay, DrawerContent, DrawerHeader, DrawerBody, DrawerCloseButton,
    Button,
} from '@chakra-ui/react';
import {
    IoSearchOutline, IoPeopleOutline, IoPersonOutline, IoArrowBackOutline,
    IoEllipsisVertical, IoHappyOutline, IoAttachOutline, IoMicOutline, IoSend,
    IoImageOutline, IoDocumentOutline, IoCameraOutline, IoPlayCircleOutline, IoCloseOutline, IoReturnUpBack
} from 'react-icons/io5';
import { io } from 'socket.io-client';
import dayjs from 'dayjs';
import baseUrl from '../../api/baseUrl';
import UserType from '../../Hooks/auth/userType';


// --- 1. خلفية الواتساب ---
const useChatBackground = () => {
    const bgColor = useColorModeValue('#ECE5DD', '#1A202C');
    const patternOpacity = useColorModeValue(0.25, 0.06);
    // نستخدم نفس النمط لكن نعدل الشفافية حسب المود
    return {
        backgroundImage: `linear-gradient(rgba(0,0,0,${patternOpacity}), rgba(0,0,0,${patternOpacity})), url("https://res.cloudinary.com/dz0b4712v/image/upload/v1720233000/whatsapp_bg_pattern_x8l5b0.png")`,
    backgroundRepeat: 'repeat',
        backgroundColor: bgColor,
    };
};


// --- 2. مكون ChatListItem ---
const ChatListItem = ({ chat, type, onSelectChat, isActive }) => {
    return (
        <Flex
            align="center"
            p={2}
            borderRadius="lg"
            _hover={{ bg: 'gray.100', cursor: 'pointer' }}
            bg={isActive ? 'teal.50' : 'transparent'}
            onClick={() => onSelectChat(type, chat.id)}
            position="relative"
        >
            {type === 'group' ? (
                <Avatar size="md" icon={<IoPeopleOutline fontSize="1.5rem" />} bg="gray.200" color="gray.600" />
            ) : (
                <Avatar size="md" src={chat.avatar} name={chat.name} />
            )}
            <Box ml={3} flex="1" overflow="hidden">
                <Flex justify="space-between" align="center" mb={0.5}>
                    <Text fontWeight="semibold" fontSize="md" noOfLines={1}>{chat.name}</Text>
                    <Text fontSize="xs" color="gray.500">{chat.time}</Text>
                </Flex>
                <Text fontSize="sm" color="gray.600" noOfLines={1}>
                    {chat.lastMessage}
                </Text>
            </Box>
            {chat.unread > 0 && (
                <Badge
                    colorScheme="teal"
                    borderRadius="full"
                    px={2}
                    py={0.5}
                    fontSize="xs"
                    position="absolute"
                    top="50%"
                    left="8px"
                    transform="translateY(-50%)"
                >
                    {chat.unread}
                </Badge>
            )}
        </Flex>
    );
};

// --- 3. مكون Sidebar ---
const Sidebar = ({ groups, onSelectGroup, activeGroupId }) => {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredGroups = useMemo(() => {
        return (groups || []).filter(chat => (chat.name || '').toLowerCase().includes(searchTerm.toLowerCase()));
    }, [groups, searchTerm]);

    return (
        <Box p={4}>
            {/* شريط البحث */}
            <InputGroup mb={4}>
                <InputLeftElement pointerEvents="none">
                    <Icon as={IoSearchOutline} color={useColorModeValue('gray.400','gray.500')} />
                </InputLeftElement>
                <Input
                    placeholder="ابحث عن محادثة..."
                    borderRadius="full"
                    bg={useColorModeValue('gray.50','gray.700')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </InputGroup>

            {/* جزء المجموعات */}
            <Text fontSize="md" fontWeight="bold" color={useColorModeValue('gray.600','gray.300')} mb={2}>مجموعات الصفوف</Text>
            <VStack align="stretch" spacing={1} mb={6}>
                {filteredGroups.length > 0 ? (
                    filteredGroups.map((chat) => (
                        <ChatListItem
                            key={chat.id}
                            chat={chat}
                            type="group"
                            onSelectChat={() => onSelectGroup(chat.id)}
                            isActive={activeGroupId === chat.id}
                        />
                    ))
                ) : (
                    <Text fontSize="sm" color={useColorModeValue('gray.500','gray.400')} textAlign="center" py={4}>لا توجد مجموعات مطابقة.</Text>
                )}
            </VStack>
        </Box>
    );
};

// --- 4. مكون ChatHeader ---
const ChatHeader = ({ chatInfo, onBack, isMobile, canTogglePermission, allowStudentSend, onTogglePermission, togglingPermission, onOpenMembers, canViewMembers }) => {
    if (!chatInfo) return null;

    return (
        <Flex
            p={3}
            borderBottom="1px solid"
            borderColor={useColorModeValue('gray.200','gray.700')}
            align="center"
            bg={useColorModeValue('white','gray.800')}
            boxShadow="sm"
        >
            {isMobile && (
                <IconButton
                    icon={<IoArrowBackOutline />}
                    onClick={onBack}
                    variant="ghost"
                    aria-label="Back to chats"
                    mr={2}
                />
            )}
            <Avatar size="md" icon={<IoPeopleOutline fontSize="1.5rem" />} bg={useColorModeValue('teal.100','gray.700')} color={useColorModeValue('teal.700','teal.200')} />
            <Box ml={3} flex="1">
                <Text fontSize="lg" fontWeight="semibold" noOfLines={1}>{chatInfo.name}</Text>
                <Text fontSize="sm" color={useColorModeValue('gray.500','gray.400')}>دردشة صفية جماعية</Text>
            </Box>
            {canViewMembers && (
            <IconButton
                    icon={<IoPersonOutline />}
                    onClick={onOpenMembers}
                variant="ghost"
                    aria-label="عرض الأعضاء"
                    mr={1}
                />
            )}
            {canTogglePermission && (
                <HStack spacing={2} mr={2}>
                    <Text fontSize="sm" color="gray.600">سماح الطلاب بالإرسال</Text>
                    <Switch isChecked={allowStudentSend} onChange={onTogglePermission} isDisabled={togglingPermission} colorScheme="teal" />
                </HStack>
            )}
            <IconButton icon={<IoEllipsisVertical />} variant="ghost" aria-label="Chat options" />
        </Flex>
    );
};

// --- 5. مكون ChatMessage ---
const ChatMessage = ({ message, onReply }) => {
    const isMine = message.isMine;
    const bgColor = isMine ? 'teal.400' : 'white';
    const textColor = isMine ? 'white' : 'gray.800';
    const alignment = isMine ? 'flex-end' : 'flex-start';
    const hasAttachment = !!message.attachment_url;
    const attachmentType = message.attachment_type;

    return (
        <Flex justify={alignment}>
            <Box
                bg={bgColor}
                color={textColor}
                px={3}
                py={2}
                borderRadius="lg"
                maxWidth="75%"
                sx={{
                    // لتقليد الذيل (يعمل بشكل جيد في Chrome و Firefox)
                    // يمكن تحسينه أكثر أو استخدام CSS خارجي
                    ...(isMine ? {
                        borderBottomRightRadius: '2px', // لجعل الذيل يبرز
                    } : {
                        borderBottomLeftRadius: '2px',
                    }),
                }}
            >
                {/* Reply preview inside bubble */}
                {message.reply_to_preview && (
                    <Box mb={2} p={2} borderLeft="3px solid" borderColor={isMine ? 'whiteAlpha.700' : 'teal.400'} bg={isMine ? 'whiteAlpha.200' : 'gray.100'} borderRadius="md">
                        <Text fontSize="xs" fontWeight="bold" mb={1} color={isMine ? 'whiteAlpha.900' : 'teal.600'} noOfLines={1}>{message.reply_to_preview.sender || 'مستخدم'}</Text>
                        <Text fontSize="xs" noOfLines={2} color={isMine ? 'whiteAlpha.800' : 'gray.700'}>
                            {message.reply_to_preview.text || (message.reply_to_preview.attachment_type === 'image' ? 'صورة' : message.reply_to_preview.attachment_name || 'مرفق')}
                        </Text>
                    </Box>
                )}
                {!isMine && message.sender && (
                    <Text fontWeight="bold" fontSize="xs" mb={1} color="purple.600">
                        {message.sender}
                    </Text>
                )}

                {message.type === 'text' && (
                    <Text fontSize="sm">{message.text}</Text>
                )}

                {(message.type === 'image' || (hasAttachment && attachmentType === 'image')) && (
                    <Box>
                        <Image src={message.url || message.attachment_url} alt="Attached image" maxH="240px" objectFit="contain" borderRadius="md" mb={1} />
                        {message.text && message.text !== 'صورة' && <Text fontSize="sm">{message.text}</Text>}
                    </Box>
                )}

                {(message.type === 'audio' || (hasAttachment && attachmentType === 'audio')) && (
                    <Flex align="center">
                        <IconButton
                            icon={<IoPlayCircleOutline />}
                            size="sm"
                            variant="ghost"
                            colorScheme={isMine ? 'whiteAlpha' : 'teal'}
                            aria-label="Play audio"
                            onClick={() => console.log('Play audio:', message.url || message.attachment_url)}
                        />
                        <Text fontSize="sm" ml={2}>تسجيل صوتي ({message.duration || (message.duration_ms ? `${Math.round((message.duration_ms/1000))}s` : '0:05')})</Text>
                        {/* استخدام عنصر audio مخفي للتشغيل */}
                        {(message.url || message.attachment_url) && <audio src={message.url || message.attachment_url} style={{ display: 'none' }} controls />}
                    </Flex>
                )}

                {hasAttachment && attachmentType && attachmentType !== 'image' && attachmentType !== 'audio' && (
                    <Box>
                        <a href={message.attachment_url} target="_blank" rel="noreferrer" style={{ textDecoration: 'underline' }}>
                            <Text fontSize="sm">{message.attachment_name || 'ملف مرفق'}</Text>
                        </a>
                        {message.text && <Text fontSize="sm" mt={1}>{message.text}</Text>}
                    </Box>
                )}

                <Flex justify="space-between" align="center" mt={1}>
                    <IconButton aria-label="reply" icon={<IoReturnUpBack />} size="xs" variant="ghost" colorScheme={isMine ? 'whiteAlpha' : 'teal'} onClick={() => onReply?.(message)} />
                    <Text fontSize="xx-small" color={isMine ? 'whiteAlpha.700' : 'gray.600'} textAlign="end">
                    {message.timestamp}
                </Text>
                </Flex>
            </Box>
        </Flex>
    );
};

// --- 6. مكون MessagesContainer ---
const MessagesContainer = ({ messages, onReply }) => {
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    return (
        <VStack flex="1" p={4} spacing={2} overflowY="auto" align="stretch" bg={useColorModeValue('transparent','gray.900')}>
            {messages.length > 0 ? (
                messages.map((msg) => (
                    <ChatMessage
                        key={msg.id}
                        message={msg}
                        onReply={onReply}
                    />
                ))
            ) : (
                <Text textAlign="center" color={useColorModeValue('gray.500','gray.400')} mt={8}>لا توجد رسائل في هذه المحادثة حتى الآن.</Text>
            )}
            <Box ref={messagesEndRef} h="1px" />
        </VStack>
    );
};

// --- 7. مكون AudioRecorderButton (مبسط) ---
const AudioRecorderButton = ({ onSendAudio, isRecording, onStartRecording, onStopRecording }) => {
    // هذا مجرد Placeholder للواجهة
    return (
        <IconButton
            icon={<IoMicOutline />}
            colorScheme={isRecording ? 'red' : 'gray'}
            variant="ghost"
            aria-label="Record audio"
            size="lg"
            onClick={isRecording ? onStopRecording : onStartRecording}
            borderRadius="full"
        />
    );
};

// --- 8. مكون MessageInputBar ---
const MessageInputBar = ({ onSendMessage, onSendAttachment, disabled, replyTarget, onCancelReply }) => {
    const [message, setMessage] = useState('');
    const [isRecording, setIsRecording] = useState(false);
    const fileInputRef = useRef(null);
    const toast = useToast();
    const [pendingAttachment, setPendingAttachment] = useState(null);

    const handleSend = () => {
        if (disabled) return;
        if (message.trim()) {
            onSendMessage(message, 'text');
            setMessage('');
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSend();
        }
    };

    const handleImageUploadClick = () => {
        if (disabled) return;
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (disabled) return;
        setPendingAttachment({ file, previewUrl: file.type.startsWith('image/') ? URL.createObjectURL(file) : null });
        e.target.value = '';
    };

    const startRecording = () => {
        setIsRecording(true);
        toast({
            title: "بدء التسجيل الصوتي...",
            status: "info",
            duration: 1500,
            isClosable: true,
        });
        // هنا تبدأ فعلياً بتسجيل الصوت
    };

    const stopRecording = () => {
        setIsRecording(false);
        // هنا توقف التسجيل وتحصل على ملف الصوت وترسله
        toast({
            title: "تم إرسال التسجيل الصوتي.",
            status: "success",
            duration: 2000,
            isClosable: true,
        });
        onSendMessage('https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', 'audio'); // مثال لـ URL صوتي وهمي
    };


    return (
        <Flex p={4} bg={useColorModeValue('gray.100','gray.800')} align="center" borderTop="1px solid" borderColor={useColorModeValue('gray.200','gray.700')}>
            {/* زر الإيموجي (Placeholder) */}
            <IconButton
                icon={<IoHappyOutline />}
                variant="ghost"
                aria-label="Emoji"
                size="lg"
                color="gray.600"
                borderRadius="full"
                mr={2}
                isDisabled={disabled}
            />

            {/* قائمة الإرفاق */}
            <Menu>
                <MenuButton
                    as={IconButton}
                    icon={<IoAttachOutline />}
                    variant="ghost"
                    aria-label="Attach file"
                    size="lg"
                    color="gray.600"
                    borderRadius="full"
                    mr={2}
                    isDisabled={disabled}
                />
                <MenuList bg={useColorModeValue('white','gray.800')}>
                    <MenuItem icon={<IoImageOutline />} onClick={handleImageUploadClick}>
                        صورة/ملف
                    </MenuItem>
                </MenuList>
            </Menu>
            {/* Input مخفي لرفع الملفات */}
            <input
                type="file"
                accept="image/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,audio/*,video/*,application/zip,application/x-zip-compressed,application/x-7z-compressed"
                ref={fileInputRef}
                onChange={handleFileChange}
                style={{ display: 'none' }}
            />

            {/* شريط الرد */}
            {replyTarget && (
                <Flex align="center" bg={useColorModeValue('green.50','green.900')} borderLeft="4px solid" borderColor="green.400" px={3} py={2} borderRadius="md" mr={3} mb={2}>
                    <Box flex="1">
                        <Text fontSize="xs" fontWeight="bold" color={useColorModeValue('green.700','green.200')} noOfLines={1}>{replyTarget.sender || 'مستخدم'}</Text>
                        <Text fontSize="xs" color={useColorModeValue('green.700','green.300')} noOfLines={2}>{replyTarget.text || (replyTarget.attachment_type === 'image' ? 'صورة' : replyTarget.attachment_name || 'مرفق')}</Text>
                    </Box>
                    <IconButton aria-label="إلغاء الرد" icon={<IoCloseOutline />} size="sm" variant="ghost" onClick={onCancelReply} />
                </Flex>
            )}

            {/* معاينة المرفق قبل الإرسال */}
            {pendingAttachment && (
                <Flex align="center" bg={useColorModeValue('gray.50','gray.700')} border="1px solid" borderColor={useColorModeValue('gray.200','gray.600')} px={3} py={2} borderRadius="md" mr={3}>
                    {pendingAttachment.previewUrl ? (
                        <Image src={pendingAttachment.previewUrl} alt="preview" boxSize="44px" objectFit="cover" borderRadius="md" mr={3} />
                    ) : (
                        <Text fontSize="sm" mr={3}>ملف: {pendingAttachment.file.name}</Text>
                    )}
                    <IconButton aria-label="إزالة" icon={<IoCloseOutline />} size="sm" variant="ghost" onClick={() => setPendingAttachment(null)} />
                    <Button ml={2} colorScheme="teal" size="sm" onClick={async () => {
                        if (!pendingAttachment) return;
                        try {
                            await onSendAttachment(pendingAttachment.file, { text: message });
                            setPendingAttachment(null);
                            setMessage('');
                        } catch {
                            // toast داخل onSendAttachment
                        }
                    }}>إرسال</Button>
                </Flex>
            )}

            {/* مربع إدخال الرسالة */}
            <InputGroup flex="1" bg={useColorModeValue('white','gray.700')} borderRadius="full">
                <Input
                    placeholder="اكتب رسالة..."
                    borderRadius="full"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    pr="4.5rem"
                    isDisabled={disabled}
                />
                <InputRightElement width="4.5rem">
                    {message.trim() && !pendingAttachment ? (
                        <IconButton
                            icon={<IoSend />}
                            onClick={handleSend}
                            colorScheme="teal"
                            aria-label="Send message"
                            borderRadius="full"
                            size="md"
                            isDisabled={disabled}
                        />
                    ) : (
                        <AudioRecorderButton
                            isRecording={isRecording}
                            onStartRecording={startRecording}
                            onStopRecording={stopRecording}
                            isDisabled={disabled}
                        />
                    )}
                </InputRightElement>
            </InputGroup>
        </Flex>
    );
};

// --- 9. مكون MainChatArea ---
const MainChatArea = ({ chatInfo, messages, onSendMessage, onBack, isMobile, canTogglePermission, allowStudentSend, onTogglePermission, togglingPermission, inputDisabled, onOpenMembers, canViewMembers, onSendAttachment, replyTarget, onSelectReply }) => {
    return (
        <Flex direction="column" h="full">
            {/* Header */}
            <ChatHeader chatInfo={chatInfo} onBack={onBack} isMobile={isMobile} canTogglePermission={canTogglePermission} allowStudentSend={allowStudentSend} onTogglePermission={onTogglePermission} togglingPermission={togglingPermission} onOpenMembers={onOpenMembers} canViewMembers={canViewMembers} />

            {/* Messages Container */}
            <MessagesContainer messages={messages} onReply={onSelectReply} />

            {/* Notice: sending disabled for students */}
            {inputDisabled && (
                <Flex px={4} py={2} bg="yellow.50" borderTop="1px solid" borderColor="yellow.200" align="center">
                    <Text fontSize="sm" color="yellow.700">تم إيقاف إرسال الرسائل للطلاب من قبل المعلم.</Text>
                </Flex>
            )}

            {/* Message Input Bar */}
            <MessageInputBar onSendMessage={onSendMessage} onSendAttachment={onSendAttachment} disabled={inputDisabled} replyTarget={replyTarget} onCancelReply={() => onSelectReply(null)} />
        </Flex>
    );
};


// --- 10. المكون الرئيسي ChatPage ---
const TeacherChat = () => {
    const [showSidebar, setShowSidebar] = useState(true);
    const isMobile = useBreakpointValue({ base: true, md: false });
    const toast = useToast();
    const [userData, isAdmin, isTeacher, student] = UserType();

    const [groups, setGroups] = useState([]);
    const [activeGroupId, setActiveGroupId] = useState(null);
    const [messagesByGroup, setMessagesByGroup] = useState({});
    const [isLoadingGroups, setIsLoadingGroups] = useState(true);
    const [isLoadingHistory, setIsLoadingHistory] = useState(false);
    const [togglingPermission, setTogglingPermission] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [isMembersOpen, setIsMembersOpen] = useState(false);
    const [members, setMembers] = useState([]);
    const [membersLoading, setMembersLoading] = useState(false);
    const [replyTarget, setReplyTarget] = useState(null);
    const socketRef = useRef(null);

    const authHeader = useMemo(() => {
        const raw = localStorage.getItem('Authorization') || localStorage.getItem('token');
        if (!raw) return undefined;
        return /^Bearer\s+/i.test(raw) ? raw : `Bearer ${raw}`;
    }, []);

    const socketEndpoint = useMemo(() => {
        try {
            const url = new URL(baseUrl.defaults.baseURL || window.location.origin);
            return url.origin;
        } catch {
            return window.location.origin;
        }
    }, []);

    // Fetch groups on mount
    useEffect(() => {
        let ignore = false;
        const fetchGroups = async () => {
            setIsLoadingGroups(true);
            try {
                const { data } = await baseUrl.get('/api/chat/groups', {
                    headers: authHeader ? { Authorization: authHeader } : {},
                });
                if (ignore) return;
                const apiGroups = (data?.groups || []).map(g => ({
                    id: g.id,
                    grade_id: g.grade_id,
                    name: g.name,
                    owner_teacher_id: g.owner_teacher_id,
                    allow_student_send: g.allow_student_send,
                    created_at: g.created_at,
                    lastMessage: '',
                    time: '',
                    unread: 0,
                }));
                setGroups(apiGroups);
                // Auto-select first group if none selected
                if (!activeGroupId && apiGroups.length > 0) {
                    setActiveGroupId(apiGroups[0].id);
                }
            } catch (err) {
                toast({ title: 'فشل تحميل المجموعات', status: 'error', duration: 3000, isClosable: true });
            } finally {
                setIsLoadingGroups(false);
            }
        };
        fetchGroups();
        return () => { ignore = true; };
    }, [authHeader, toast]);

    // Connect socket
    useEffect(() => {
        const tokenOnly = (localStorage.getItem('Authorization') || '').replace(/^Bearer\s+/i, '') || localStorage.getItem('token');
        const s = io(socketEndpoint, {
            path: '/socket.io',
            withCredentials: true,
            auth: tokenOnly ? { token: tokenOnly } : {},
            transports: ['websocket'],
        });
        socketRef.current = s;

        s.on('connect_error', (e) => {
            console.error('Socket connect_error:', e);
        });

        s.on('chat:new-message', (payload) => {
            const groupId = payload?.group_id;
            if (!groupId) return;
            setMessagesByGroup(prev => {
                const existing = prev[groupId] || [];
                const transformed = {
                    id: payload.id,
                    sender: payload.sender_name,
                    text: payload.text,
                    timestamp: dayjs(payload.created_at).format('h:mm A'),
                    isMine: !!(userData && (payload.sender_id === userData?.id || payload.sender_id === userData?._id)),
                    type: 'text',
                };
                return { ...prev, [groupId]: [...existing, transformed] };
            });
            // update last message on group
            setGroups(prev => prev.map(g => g.id === groupId ? { ...g, lastMessage: payload.text, time: dayjs(payload.created_at).format('h:mm A'), unread: g.id === activeGroupId ? 0 : (g.unread || 0) + 1 } : g));
        });

        s.on('chat:permission-changed', (payload) => {
            if (!payload?.groupId) return;
            setGroups(prev => prev.map(g => g.id === payload.groupId ? { ...g, allow_student_send: payload.allow_student_send } : g));
        });

        return () => {
            s.disconnect();
        };
    }, [socketEndpoint, userData, activeGroupId]);

    // Join rooms when groups list updates
    useEffect(() => {
        const s = socketRef.current;
        if (!s) return;
        (groups || []).forEach(g => {
            s.emit('chat:join-group', g.id);
        });
    }, [groups]);

    // Load history when selecting a group (first time or on explicit change)
    useEffect(() => {
        const loadHistory = async () => {
            if (!activeGroupId) return;
            if (messagesByGroup[activeGroupId]?.length) return;
            setIsLoadingHistory(true);
            try {
                const { data } = await baseUrl.get(`/api/chat/groups/${activeGroupId}/history`, {
                    params: { limit: 50 },
                    headers: authHeader ? { Authorization: authHeader } : {},
                });
                const transformed = (data?.messages || []).map(m => ({
                    id: m.id,
                    sender: m.sender_name,
                    text: m.text,
                    attachment_url: m.attachment_url,
                    attachment_type: m.attachment_type,
                    attachment_name: m.attachment_name,
                    attachment_mime: m.attachment_mime,
                    attachment_size: m.attachment_size,
                    duration_ms: m.attachment_duration_ms,
                    reply_to: m.reply_to_message_id || m.reply_to || undefined,
                    reply_to_preview: m.reply ? {
                        id: m.reply.id,
                        sender: m.reply.sender_name,
                        text: m.reply.text,
                        attachment_type: m.reply.attachment_type,
                        attachment_name: m.reply.attachment_name,
                    } : undefined,
                    timestamp: dayjs(m.created_at).format('h:mm A'),
                    isMine: !!(userData && (m.sender_id === userData?.id || m.sender_id === userData?._id)),
                    type: m.attachment_type === 'image' ? 'image' : (m.attachment_type === 'audio' ? 'audio' : 'text'),
                }));
                setMessagesByGroup(prev => ({ ...prev, [activeGroupId]: transformed }));
                const last = transformed[transformed.length - 1];
                setGroups(prev => prev.map(g => g.id === activeGroupId ? { ...g, lastMessage: last?.text || '', time: last?.timestamp || '' } : g));
            } catch (err) {
                toast({ title: 'فشل تحميل الرسائل', status: 'error', duration: 3000, isClosable: true });
            } finally {
                setIsLoadingHistory(false);
            }
        };
        loadHistory();
    }, [activeGroupId, authHeader, toast, userData]);

    const handleChatSelect = (id) => {
        setActiveGroupId(id);
        if (isMobile) {
            setShowSidebar(false);
        }
    };

    const handleBackToSidebar = () => {
        if (isMobile) {
            setShowSidebar(true);
            setActiveGroupId(null);
        }
    };

    const getActiveChatInfo = () => {
        if (!activeGroupId) return null;
        return groups.find(chat => chat.id === activeGroupId);
    };

    const getMessagesForChat = (id) => messagesByGroup[id] || [];

    const onSendMessage = async (content, messageType = 'text') => {
        if (!activeGroupId) return;
        if (messageType !== 'text') return;
        try {
            setIsSending(true);
            const body = { text: content };
            if (replyTarget?.id) body.reply_to = replyTarget.id;
            const { data } = await baseUrl.post(`/api/chat/groups/${activeGroupId}/messages`, body, {
                headers: authHeader ? { Authorization: authHeader } : {},
            });
            const m = data?.message;
            if (m) {
                const connected = !!(socketRef.current && socketRef.current.connected);
                if (!connected) {
                    const transformed = {
                        id: m.id,
                        sender: userData?.name || 'أنا',
                        text: m.text,
                        reply_to: m.reply_to,
                        timestamp: dayjs(m.created_at).format('h:mm A'),
                        isMine: true,
                        type: 'text',
                    };
                    setMessagesByGroup(prev => {
                        const existing = prev[activeGroupId] || [];
                        if (existing.some(x => x.id === m.id)) return prev;
                        return { ...prev, [activeGroupId]: [...existing, transformed] };
                    });
                }
                setGroups(prev => prev.map(g => g.id === activeGroupId ? { ...g, lastMessage: m.text, time: dayjs(m.created_at).format('h:mm A') } : g));
                setReplyTarget(null);
            }
        } catch (e) {
            toast({ title: 'تعذر إرسال الرسالة', status: 'error', duration: 2500, isClosable: true });
        } finally {
            setIsSending(false);
        }
    };

    const canTogglePermission = !!(isAdmin || isTeacher);
    const activeGroup = getActiveChatInfo();
    const allowStudentSend = activeGroup?.allow_student_send;
    const isStudent = !!student;
    const inputDisabled = isStudent && activeGroup && activeGroup.allow_student_send === false;

    const onSendAttachment = async (file, extra = {}) => {
        if (!activeGroupId) return;
        const form = new FormData();
        form.append('file', file);
        if (extra.text) form.append('text', extra.text);
        if (typeof extra.duration_ms === 'number') form.append('duration_ms', String(extra.duration_ms));
        try {
            const { data } = await baseUrl.post(`/api/chat/groups/${activeGroupId}/attachments`, form, {
                headers: {
                    ...(authHeader ? { Authorization: authHeader } : {}),
                },
            });
            const m = data?.message;
            if (m) {
                const transformed = {
                    id: m.id,
                    sender: userData?.name || 'أنا',
                    text: m.text,
                    attachment_url: m.attachment_url,
                    attachment_type: m.attachment_type,
                    attachment_name: m.attachment_name,
                    attachment_mime: m.attachment_mime,
                    attachment_size: m.attachment_size,
                    duration_ms: m.duration_ms,
                    timestamp: dayjs(m.created_at).format('h:mm A'),
            isMine: true,
                    type: m.attachment_type === 'image' ? 'image' : (m.attachment_type === 'audio' ? 'audio' : 'file'),
                };
                setMessagesByGroup(prev => ({
                    ...prev,
                    [activeGroupId]: [...(prev[activeGroupId] || []), transformed],
                }));
                setGroups(prev => prev.map(g => g.id === activeGroupId ? { ...g, lastMessage: m.text || 'مرفق', time: dayjs(m.created_at).format('h:mm A') } : g));
            }
        } catch (e) {
            toast({ title: 'تعذر رفع المرفق', status: 'error', duration: 2500, isClosable: true });
            throw e;
        }
    };

    const handleTogglePermission = async () => {
        if (!activeGroup) return;
        try {
            setTogglingPermission(true);
            const newValue = !activeGroup.allow_student_send;
            await baseUrl.patch(`/api/chat/groups/${activeGroup.id}/permission`, { allow_student_send: newValue }, {
                headers: authHeader ? { Authorization: authHeader } : {},
            });
            setGroups(prev => prev.map(g => g.id === activeGroup.id ? { ...g, allow_student_send: newValue } : g));
        } catch (e) {
            toast({ title: 'تعذر تغيير الصلاحية', status: 'error', duration: 2500, isClosable: true });
        } finally {
            setTogglingPermission(false);
        }
    };

    const canViewMembers = !!(isTeacher || isAdmin);

    const openMembers = async () => {
        if (!activeGroupId) return;
        setIsMembersOpen(true);
        setMembersLoading(true);
        try {
            const { data } = await baseUrl.get(`/api/chat/groups/${activeGroupId}/members`, {
                headers: authHeader ? { Authorization: authHeader } : {},
            });
            setMembers(data?.members || []);
        } catch (e) {
            toast({ title: 'تعذر تحميل الأعضاء', status: 'error', duration: 2500, isClosable: true });
        } finally {
            setMembersLoading(false);
        }
    };


    return (
        <Flex h="calc(100vh - 80px)" mt="80px" bg={useColorModeValue('gray.100','gray.900')} className='chat-page'>
            {/* Sidebar */}
            {(showSidebar || !isMobile) && (
                <Box
                    w={{ base: 'full', md: '350px' }}
                    bg={useColorModeValue('white','gray.800')}
                    borderEnd={{ base: 'none', md: '1px solid' }}
                    borderColor={useColorModeValue('gray.200','gray.700')}
                    overflowY="auto"
                    h="full"
                    pb={4}
                    display={isMobile && !showSidebar ? 'none' : 'block'}
                >
                    {isLoadingGroups ? (
                        <Flex align="center" justify="center" h="full" py={6}>
                            <Spinner color="teal.500" />
                        </Flex>
                    ) : (
                    <Sidebar
                            groups={groups}
                            onSelectGroup={handleChatSelect}
                            activeGroupId={activeGroupId}
                        />
                    )}
                </Box>
            )}

            {/* Main Chat Area */}
            {(!showSidebar || !isMobile) && (
                <Box
                    flex="1"
                    h="full"
                    bg={useColorModeValue('white','gray.800')}
                    style={useChatBackground()}
                    display={isMobile && showSidebar ? 'none' : 'block'}
                >
                    {!activeGroupId ? (
                        <Flex h="full" align="center" justify="center" direction="column">
                            <Text fontSize="2xl" color="gray.400">اختر محادثة للبدء</Text>
                            <Text fontSize="md" color="gray.400" mt={2}>يمكنك اختيار مجموعة لبدء محادثة.</Text>
                        </Flex>
                    ) : isLoadingHistory && !messagesByGroup[activeGroupId]?.length ? (
                        <Flex h="full" align="center" justify="center" direction="column">
                            <Spinner color="teal.500" />
                            <Text fontSize="md" color="gray.500" mt={3}>جاري تحميل الرسائل...</Text>
                        </Flex>
                    ) : (
                        <MainChatArea
                            chatInfo={activeGroup}
                            messages={getMessagesForChat(activeGroupId)}
                            onSendMessage={onSendMessage}
                            onBack={handleBackToSidebar}
                            isMobile={isMobile}
                            canTogglePermission={canTogglePermission}
                            allowStudentSend={!!allowStudentSend}
                            onTogglePermission={handleTogglePermission}
                            togglingPermission={togglingPermission}
                            inputDisabled={inputDisabled || isSending}
                            onOpenMembers={openMembers}
                            canViewMembers={canViewMembers}
                            onSendAttachment={onSendAttachment}
                            replyTarget={replyTarget}
                            onSelectReply={setReplyTarget}
                        />
                    )}
                </Box>
            )}
            {canViewMembers && (
                <Drawer isOpen={isMembersOpen} placement="right" onClose={() => setIsMembersOpen(false)} size="sm">
                    <DrawerOverlay />
                    <DrawerContent>
                        <DrawerCloseButton />
                        <DrawerHeader>أعضاء المجموعة</DrawerHeader>
                        <DrawerBody>
                            {membersLoading ? (
                                <Flex align="center" justify="center" py={6}>
                                    <Spinner color="teal.500" />
                                </Flex>
                            ) : members.length === 0 ? (
                                <Text color="gray.500">لا يوجد أعضاء.</Text>
                            ) : (
                                <VStack align="stretch" spacing={3}>
                                    {members.map((m) => (
                                        <Flex key={m.id} align="center" p={2} borderRadius="md" bg="gray.50" border="1px solid" borderColor="gray.200">
                                            <Avatar size="sm" name={m.name} mr={3} />
                                            <Box flex="1">
                                                <Text fontWeight="semibold">{m.name}</Text>
                                                <Text fontSize="sm" color="gray.600">الدور: {m.role === 'teacher' ? 'معلم' : m.role === 'admin' ? 'مشرف' : 'طالب'}</Text>
                                            </Box>
                                            <Text fontSize="xs" color="gray.500">انضم: {dayjs(m.joined_at).format('YYYY/MM/DD HH:mm')}</Text>
                                        </Flex>
                                    ))}
                                </VStack>
                            )}
                        </DrawerBody>
                    </DrawerContent>
                </Drawer>
            )}
        </Flex>
    );
};

export default TeacherChat;