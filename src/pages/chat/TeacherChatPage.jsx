// src/pages/ChatPage.jsx
import React, { useState, useEffect, useRef } from 'react';
import {
    Box, Flex, Text, VStack, Divider, InputGroup, InputLeftElement, Input, Icon,
    Avatar, Badge, IconButton, useBreakpointValue, Menu, MenuButton, MenuList, MenuItem,
    InputRightElement, useToast,
} from '@chakra-ui/react';
import {
    IoSearchOutline, IoPeopleOutline, IoPersonOutline, IoArrowBackOutline,
    IoEllipsisVertical, IoHappyOutline, IoAttachOutline, IoMicOutline, IoSend,
    IoImageOutline, IoDocumentOutline, IoCameraOutline, IoPlayCircleOutline // أيقونات التشغيل للصوت
} from 'react-icons/io5';


// --- 1. خلفية الواتساب ---
const whatsappBackground = {
    backgroundImage: 'url("https://res.cloudinary.com/dz0b4712v/image/upload/v1720233000/whatsapp_bg_pattern_x8l5b0.png")', // مثال لنمط
    backgroundRepeat: 'repeat',
    backgroundColor: '#ECE5DD', // لون احتياطي
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
const Sidebar = ({ dummyChats, onSelectChat, activeChat }) => {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredGroups = dummyChats.groups.filter(chat =>
        chat.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredStudents = dummyChats.students.filter(chat =>
        chat.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <Box p={4}>
            {/* شريط البحث */}
            <InputGroup mb={4}>
                <InputLeftElement pointerEvents="none">
                    <Icon as={IoSearchOutline} color="gray.400" />
                </InputLeftElement>
                <Input
                    placeholder="ابحث عن محادثة..."
                    borderRadius="full"
                    bg="gray.50"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </InputGroup>

            {/* جزء المجموعات */}
            <Text fontSize="md" fontWeight="bold" color="gray.600" mb={2}>مجموعات الصفوف</Text>
            <VStack align="stretch" spacing={1} mb={6}>
                {filteredGroups.length > 0 ? (
                    filteredGroups.map((chat) => (
                        <ChatListItem
                            key={chat.id}
                            chat={chat}
                            type="group"
                            onSelectChat={onSelectChat}
                            isActive={activeChat?.id === chat.id && activeChat?.type === 'group'}
                        />
                    ))
                ) : (
                    <Text fontSize="sm" color="gray.500" textAlign="center" py={4}>لا توجد مجموعات مطابقة.</Text>
                )}
            </VStack>

            <Divider mb={6} />

            {/* جزء الطلاب (محادثات فردية) */}
            <Text fontSize="md" fontWeight="bold" color="gray.600" mb={2}>محادثات الطلاب</Text>
            <VStack align="stretch" spacing={1}>
                {filteredStudents.length > 0 ? (
                    filteredStudents.map((chat) => (
                        <ChatListItem
                            key={chat.id}
                            chat={chat}
                            type="individual"
                            onSelectChat={onSelectChat}
                            isActive={activeChat?.id === chat.id && activeChat?.type === 'individual'}
                        />
                    ))
                ) : (
                    <Text fontSize="sm" color="gray.500" textAlign="center" py={4}>لا يوجد طلاب مطابقون.</Text>
                )}
            </VStack>
        </Box>
    );
};

// --- 4. مكون ChatHeader ---
const ChatHeader = ({ chatInfo, onBack, isMobile }) => {
    if (!chatInfo) return null;

    const isGroupChat = chatInfo.membersCount !== undefined;

    return (
        <Flex
            p={3}
            borderBottom="1px solid"
            borderColor="gray.200"
            align="center"
            bg="white"
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
            {isGroupChat ? (
                <Avatar size="md" icon={<IoPeopleOutline fontSize="1.5rem" />} bg="teal.100" color="teal.700" />
            ) : (
                <Avatar size="md" src={chatInfo.avatar} name={chatInfo.name} />
            )}
            <Box ml={3} flex="1">
                <Text fontSize="lg" fontWeight="semibold" noOfLines={1}>{chatInfo.name}</Text>
                {isGroupChat && <Text fontSize="sm" color="gray.500">{chatInfo.membersCount} أعضاء</Text>}
                {!isGroupChat && chatInfo.grade && <Text fontSize="sm" color="gray.500">{chatInfo.grade}</Text>}
            </Box>
            <IconButton
                icon={<IoEllipsisVertical />}
                variant="ghost"
                aria-label="Chat options"
            />
        </Flex>
    );
};

// --- 5. مكون ChatMessage ---
const ChatMessage = ({ message }) => {
    const isMine = message.isMine;
    const bgColor = isMine ? 'teal.400' : 'white';
    const textColor = isMine ? 'white' : 'gray.800';
    const alignment = isMine ? 'flex-end' : 'flex-start';

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
                {!isMine && message.sender && (
                    <Text fontWeight="bold" fontSize="xs" mb={1} color="purple.600">
                        {message.sender}
                    </Text>
                )}

                {message.type === 'text' && (
                    <Text fontSize="sm">{message.text}</Text>
                )}

                {message.type === 'image' && (
                    <Box>
                        <Image src={message.url} alt="Attached image" maxH="200px" objectFit="contain" borderRadius="md" mb={1} />
                        {message.text && message.text !== 'صورة' && <Text fontSize="sm">{message.text}</Text>}
                    </Box>
                )}

                {message.type === 'audio' && (
                    <Flex align="center">
                        <IconButton
                            icon={<IoPlayCircleOutline />}
                            size="sm"
                            variant="ghost"
                            colorScheme={isMine ? 'whiteAlpha' : 'teal'}
                            aria-label="Play audio"
                            onClick={() => console.log('Play audio:', message.url)}
                        />
                        <Text fontSize="sm" ml={2}>تسجيل صوتي ({message.duration || '0:05'})</Text>
                        {/* استخدام عنصر audio مخفي للتشغيل */}
                        {message.url && <audio src={message.url} style={{ display: 'none' }} controls />}
                    </Flex>
                )}

                <Text fontSize="xx-small" color={isMine ? 'whiteAlpha.700' : 'gray.600'} textAlign="end" mt={1}>
                    {message.timestamp}
                </Text>
            </Box>
        </Flex>
    );
};

// --- 6. مكون MessagesContainer ---
const MessagesContainer = ({ messages }) => {
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    return (
        <VStack flex="1" p={4} spacing={2} overflowY="auto" align="stretch">
            {messages.length > 0 ? (
                messages.map((msg) => (
                    <ChatMessage
                        key={msg.id}
                        message={msg}
                    />
                ))
            ) : (
                <Text textAlign="center" color="gray.500" mt={8}>لا توجد رسائل في هذه المحادثة حتى الآن.</Text>
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
const MessageInputBar = ({ onSendMessage }) => {
    const [message, setMessage] = useState('');
    const [isRecording, setIsRecording] = useState(false);
    const fileInputRef = useRef(null);
    const toast = useToast();

    const handleSend = () => {
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
        fileInputRef.current?.click();
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onloadend = () => {
                    const imageUrl = URL.createObjectURL(file); // لعرض الصورة محلياً
                    onSendMessage(imageUrl, 'image'); // إرسال الـ URL الوهمي
                    toast({
                        title: "تم إرفاق الصورة.",
                        status: "success",
                        duration: 2000,
                        isClosable: true,
                    });
                };
                reader.readAsDataURL(file);
            } else {
                toast({
                    title: "نوع ملف غير مدعوم.",
                    description: "الرجاء اختيار صورة.",
                    status: "warning",
                    duration: 3000,
                    isClosable: true,
                });
            }
        }
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
        <Flex p={4} bg="gray.100" align="center" borderTop="1px solid" borderColor="gray.200">
            {/* زر الإيموجي (Placeholder) */}
            <IconButton
                icon={<IoHappyOutline />}
                variant="ghost"
                aria-label="Emoji"
                size="lg"
                color="gray.600"
                borderRadius="full"
                mr={2}
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
                />
                <MenuList>
                    <MenuItem icon={<IoImageOutline />} onClick={handleImageUploadClick}>
                        صورة
                    </MenuItem>
                    <MenuItem icon={<IoDocumentOutline />}>
                        مستند
                    </MenuItem>
                    <MenuItem icon={<IoCameraOutline />}>
                        كاميرا
                    </MenuItem>
                </MenuList>
            </Menu>
            {/* Input مخفي لرفع الملفات */}
            <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleFileChange}
                style={{ display: 'none' }}
            />

            {/* مربع إدخال الرسالة */}
            <InputGroup flex="1" bg="white" borderRadius="full">
                <Input
                    placeholder="اكتب رسالة..."
                    borderRadius="full"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    pr="4.5rem"
                />
                <InputRightElement width="4.5rem">
                    {message.trim() ? (
                        <IconButton
                            icon={<IoSend />}
                            onClick={handleSend}
                            colorScheme="teal"
                            aria-label="Send message"
                            borderRadius="full"
                            size="md"
                        />
                    ) : (
                        <AudioRecorderButton
                            isRecording={isRecording}
                            onStartRecording={startRecording}
                            onStopRecording={stopRecording}
                        />
                    )}
                </InputRightElement>
            </InputGroup>
        </Flex>
    );
};

// --- 9. مكون MainChatArea ---
const MainChatArea = ({ chatInfo, messages, onSendMessage, onBack, isMobile }) => {
    return (
        <Flex direction="column" h="full">
            {/* Header */}
            <ChatHeader chatInfo={chatInfo} onBack={onBack} isMobile={isMobile} />

            {/* Messages Container */}
            <MessagesContainer messages={messages} />

            {/* Message Input Bar */}
            <MessageInputBar onSendMessage={onSendMessage} />
        </Flex>
    );
};


// --- 10. المكون الرئيسي ChatPage ---
const TeacherChat = () => {
    const [activeChat, setActiveChat] = useState(null);
    const [showSidebar, setShowSidebar] = useState(true);
    const isMobile = useBreakpointValue({ base: true, md: false });

    // بيانات وهمية للمحادثات في السايدبار
    const [dummyChats, setDummyChats] = useState({
        groups: [
            { id: 'grade10', name: 'مجموعة الصف الأول الثانوي', lastMessage: 'تمام يا أستاذ، شكراً.', time: '12:05 PM', unread: 2, membersCount: 25 },
            { id: 'grade11', name: 'مجموعة الصف الثاني الثانوي', lastMessage: 'الاختبار الأحد القادم.', time: 'أمس', unread: 0, membersCount: 18 },
            { id: 'grade12', name: 'مجموعة الصف الثالث الثانوي', lastMessage: 'لا تنسوا المراجعة النهائية.', time: 'الجمعة', unread: 0, membersCount: 22 },
        ],
        students: [
            { id: 'std101', name: 'أحمد علي', lastMessage: 'نعم يا أستاذ، لم أفهم...', time: '11:10 AM', unread: 1, avatar: 'https://bit.ly/dan-abramov', grade: 'أولى ثانوي' },
            { id: 'std102', name: 'ليلى خالد', lastMessage: 'تم حل الواجبات.', time: '10:30 AM', unread: 0, avatar: 'https://bit.ly/kent-c-dodds', grade: 'أولى ثانوي' },
            { id: 'std103', name: 'سارة إبراهيم', lastMessage: 'شكراً جزيلاً لك.', time: '02:05 PM', unread: 0, avatar: 'https://bit.ly/sage-adebayo', grade: 'ثانية ثانوي' },
            { id: 'std104', name: 'فاطمة حسين', lastMessage: 'أرجو المساعدة في ...', time: 'أمس', unread: 0, avatar: 'https://bit.ly/tioluwani-kolawole', grade: 'ثالثة ثانوي' },
        ],
    });

    // بيانات وهمية للرسائل (يجب أن تُجلب من الـ backend في تطبيق حقيقي)
    const [dummyMessages, setDummyMessages] = useState({
        'group_grade10': [
            { id: 1, sender: 'المدرس', text: 'أهلاً بالجميع، أرجو مراجعة واجبات الفصل الأول.', timestamp: '10:00 AM', isMine: true, type: 'text' },
            { id: 2, sender: 'أحمد علي', text: 'تمام يا أستاذ، هل هناك موعد نهائي؟', timestamp: '10:05 AM', isMine: false, type: 'text' },
            { id: 3, sender: 'المدرس', text: 'الموعد النهائي نهاية الأسبوع القادم.', timestamp: '10:10 AM', isMine: true, type: 'text' },
            { id: 4, sender: 'ليلى خالد', text: 'صورة توضيحية للمشكلة', timestamp: '10:15 AM', isMine: false, type: 'image', url: 'https://via.placeholder.com/200/A0A0A0/FFFFFF?text=Dummy+Image' },
            { id: 5, sender: 'المدرس', text: 'تسجيل صوتي', timestamp: '10:20 AM', isMine: true, type: 'audio', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' }, // Placeholder URL
        ],
        'individual_std101': [
            { id: 6, sender: 'المدرس', text: 'أحمد، هل واجهت صعوبة في فهم نقطة معينة؟', timestamp: '11:00 AM', isMine: true, type: 'text' },
            { id: 7, sender: 'أحمد علي', text: 'نعم يا أستاذ، لم أفهم شرح نظرية كذا جيداً.', timestamp: '11:05 AM', isMine: false, type: 'text' },
            { id: 8, sender: 'المدرس', text: 'يمكننا تحديد موعد لمراجعتها معك.', timestamp: '11:10 AM', isMine: true, type: 'text' },
            { id: 9, sender: 'أحمد علي', text: 'صورة من الكتاب', timestamp: '11:15 AM', isMine: false, type: 'image', url: 'https://via.placeholder.com/200/F0F0F0/000000?text=Book+Page' },
        ],
        // ... المزيد من الرسائل للمحادثات الأخرى
    });

    const handleChatSelect = (type, id) => {
        setActiveChat({ type, id });
        if (isMobile) {
            setShowSidebar(false);
        }
    };

    const handleBackToSidebar = () => {
        if (isMobile) {
            setShowSidebar(true);
            setActiveChat(null);
        }
    };

    const getActiveChatInfo = () => {
        if (!activeChat) return null;
        const chatList = activeChat.type === 'group' ? dummyChats.groups : dummyChats.students;
        return chatList.find(chat => chat.id === activeChat.id);
    };

    const getMessagesForChat = (type, id) => {
        return dummyMessages[`${type}_${id}`] || [];
    };

    const onSendMessage = (content, messageType = 'text') => {
        if (!activeChat) return;

        const chatKey = `${activeChat.type}_${activeChat.id}`;
        const newMsg = {
            id: Date.now(),
            sender: 'المدرس',
            text: messageType === 'text' ? content : (messageType === 'image' ? 'صورة مرفقة' : 'رسالة صوتية'),
            timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
            isMine: true,
            type: messageType,
            url: (messageType === 'image' || messageType === 'audio') ? content : undefined // URL للصورة أو الصوت
        };

        setDummyMessages(prevMessages => ({
            ...prevMessages,
            [chatKey]: [...(prevMessages[chatKey] || []), newMsg]
        }));

        setDummyChats(prevChats => {
            const updatedList = prevChats[activeChat.type].map(chat =>
                chat.id === activeChat.id ? { ...chat, lastMessage: newMsg.text, time: newMsg.timestamp, unread: 0 } : chat
            );
            return {
                ...prevChats,
                [activeChat.type]: updatedList
            };
        });
    };


    return (
        <Flex h="calc(100vh - 80px)" mt="80px" bg="gray.100" className='chat-page'>
            {/* Sidebar */}
            {(showSidebar || !isMobile) && (
                <Box
                    w={{ base: 'full', md: '350px' }}
                    bg="white"
                    borderEnd={{ base: 'none', md: '1px solid' }}
                    borderColor="gray.200"
                    overflowY="auto"
                    h="full"
                    pb={4}
                    display={isMobile && !showSidebar ? 'none' : 'block'}
                >
                    <Sidebar
                        dummyChats={dummyChats}
                        onSelectChat={handleChatSelect}
                        activeChat={activeChat}
                    />
                </Box>
            )}

            {/* Main Chat Area */}
            {(!showSidebar || !isMobile) && (
                <Box
                    flex="1"
                    h="full"
                    bg="white"
                    style={whatsappBackground}
                    display={isMobile && showSidebar ? 'none' : 'block'}
                >
                    {activeChat ? (
                        <MainChatArea
                            chatInfo={getActiveChatInfo()}
                            messages={getMessagesForChat(activeChat.type, activeChat.id)}
                            onSendMessage={onSendMessage}
                            onBack={handleBackToSidebar}
                            isMobile={isMobile}
                        />
                    ) : (
                        <Flex h="full" align="center" justify="center" direction="column">
                            <Text fontSize="2xl" color="gray.400">اختر محادثة للبدء</Text>
                            <Text fontSize="md" color="gray.400" mt={2}>يمكنك اختيار مجموعة أو طالب لبدء محادثة.</Text>
                        </Flex>
                    )}
                </Box>
            )}
        </Flex>
    );
};

export default TeacherChat;