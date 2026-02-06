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
    IoImageOutline, IoDocumentOutline, IoCameraOutline, IoPlayCircleOutline, IoCloseOutline, IoReturnUpBack,
    IoCreateOutline, IoTrashOutline, IoCheckmarkOutline, IoBookOutline, IoSchoolOutline, 
    IoLibraryOutline, IoRocketOutline, IoStarOutline, IoFlameOutline, IoHeartOutline,
    IoDiamondOutline, IoShieldOutline, IoFlashOutline, IoLeafOutline, IoPlanetOutline
} from 'react-icons/io5';
import { io } from 'socket.io-client';
import dayjs from 'dayjs';
import baseUrl from '../../api/baseUrl';
import UserType from '../../Hooks/auth/userType';


// --- 1. خلفية الواتساب ---
const useChatBackground = () => {
    // WhatsApp-ish background (light/dark)
    const bgColor = useColorModeValue('#EFEAE2', '#0B141A');
    const patternOpacity = useColorModeValue(0.20, 0.08);
    return {
        backgroundImage: `linear-gradient(rgba(0,0,0,${patternOpacity}), rgba(0,0,0,${patternOpacity})), url("https://res.cloudinary.com/dz0b4712v/image/upload/v1720233000/whatsapp_bg_pattern_x8l5b0.png")`,
        backgroundRepeat: 'repeat',
        backgroundColor: bgColor,
    };
};

// --- دالة اختيار أيقونة المجموعة ---
const getGroupIcon = (groupName, index) => {
    const icons = [
        IoBookOutline, IoSchoolOutline, IoLibraryOutline, IoRocketOutline, 
        IoStarOutline, IoFlameOutline, IoHeartOutline, IoDiamondOutline,
        IoShieldOutline, IoFlashOutline, IoLeafOutline, IoPlanetOutline
    ];
    
    // اختيار أيقونة بناءً على اسم المجموعة أو الفهرس
    const iconIndex = groupName ? 
        groupName.charCodeAt(0) % icons.length : 
        index % icons.length;
    
    return icons[iconIndex];
};

// --- دالة اختيار لون المجموعة ---
const getGroupColor = (groupName, index) => {
    const colors = [
        'blue', 'green', 'purple', 'orange', 'pink', 'cyan', 
        'teal', 'indigo', 'red', 'yellow', 'gray', 'emerald'
    ];
    
    const colorIndex = groupName ? 
        groupName.charCodeAt(0) % colors.length : 
        index % colors.length;
    
    return colors[colorIndex];
};


// --- 2. مكون ChatListItem ---
const ChatListItem = ({ chat, type, onSelectChat, isActive, index = 0 }) => {
    const sidebarItemHover = useColorModeValue('#F0F2F5', '#202C33');
    const sidebarItemActive = useColorModeValue('#F0F2F5', '#2A3942');
    const subText = useColorModeValue('#667781', '#8696A0');
    const timeText = useColorModeValue('#667781', '#8696A0');
    const unreadBg = useColorModeValue('#25D366', '#00A884');

    return (
        <Flex
            align="center"
            px={4}
            py={3}
            cursor="pointer"
            _hover={{ bg: sidebarItemHover }}
            bg={isActive ? sidebarItemActive : 'transparent'}
            onClick={() => onSelectChat(type, chat.id)}
            borderBottom="1px solid"
            borderColor={useColorModeValue('gray.100', 'whiteAlpha.100')}
        >
            <HStack spacing={3} w="full" minW={0}>
                {type === 'group' ? (
                    <Avatar
                        size="md"
                        icon={<IoPeopleOutline fontSize="1.35rem" />}
                        bg={useColorModeValue('#DFE5E7', '#2A3942')}
                        color={useColorModeValue('#54656F', '#AEBAC1')}
                    />
                ) : (
                    <Avatar size="md" src={chat.avatar || undefined} name={chat.name} />
                )}

                <Box flex="1" minW={0}>
                    <HStack justify="space-between" align="center" spacing={2}>
                        <Text fontWeight="600" fontSize="md" noOfLines={1}>
                            {chat.name}
                        </Text>
                        <Text fontSize="xs" color={timeText} whiteSpace="nowrap">
                            {chat.time || ''}
                        </Text>
                    </HStack>

                    <HStack justify="space-between" align="center" spacing={2} mt={1}>
                        <Text fontSize="sm" color={subText} noOfLines={1}>
                            {chat.lastMessage || 'لا توجد رسائل'}
                        </Text>

                        {chat.unread > 0 && (
                            <Box
                                minW="20px"
                                h="20px"
                                px={2}
                                borderRadius="full"
                                bg={unreadBg}
                                color="white"
                                fontSize="xs"
                                fontWeight="700"
                                display="flex"
                                alignItems="center"
                                justifyContent="center"
                            >
                                {chat.unread > 99 ? '99+' : chat.unread}
                            </Box>
                        )}
                    </HStack>
                </Box>
            </HStack>
        </Flex>
    );
};

// --- 3. مكون Sidebar ---
const Sidebar = ({ groups, contacts, onSelectGroup, onSelectContact, activeChat }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const sidebarBg = useColorModeValue('#FFFFFF', '#111B21');
    const sidebarHeaderBg = useColorModeValue('#F0F2F5', '#202C33');
    const sidebarText = useColorModeValue('#111B21', '#E9EDEF');
    const sidebarSubText = useColorModeValue('#667781', '#8696A0');
    const searchBg = useColorModeValue('#FFFFFF', '#111B21');
    const searchBorder = useColorModeValue('#E9EDEF', '#2A3942');

    const filteredGroups = useMemo(() => {
        return (groups || []).filter(chat => (chat.name || '').toLowerCase().includes(searchTerm.toLowerCase()));
    }, [groups, searchTerm]);

    const filteredContacts = useMemo(() => {
        return (contacts || []).filter(c => (c.name || '').toLowerCase().includes(searchTerm.toLowerCase()));
    }, [contacts, searchTerm]);

    return (
        <Box h="full" display="flex" flexDirection="column" bg={sidebarBg}>
            {/* WhatsApp-like header */}
            <Flex
                px={3}
                py={2}
                align="center"
                justify="space-between"
                bg={sidebarHeaderBg}
                borderBottom="1px solid"
                borderColor={useColorModeValue('#E9EDEF', '#2A3942')}
            >
                <HStack spacing={3} minW={0}>
                    <Avatar size="sm" bg={useColorModeValue('gray.300', 'gray.600')} />
                    <Box minW={0}>
                        <Text fontWeight="700" fontSize="sm" color={sidebarText} noOfLines={1}>
                            المحادثات
                        </Text>
                        <Text fontSize="xs" color={sidebarSubText} noOfLines={1}>
                            {(groups?.length || 0)} مجموعات • {(contacts?.length || 0)} طلاب
                        </Text>
                    </Box>
                </HStack>
                <HStack spacing={1}>
                    <IconButton
                        aria-label="بحث"
                        icon={<IoSearchOutline />}
                        variant="ghost"
                        size="sm"
                    />
                    <IconButton
                        aria-label="المزيد"
                        icon={<IoEllipsisVertical />}
                        variant="ghost"
                        size="sm"
                    />
                </HStack>
            </Flex>

            {/* شريط البحث */}
            <Box px={3} py={2} bg={sidebarBg}>
                <InputGroup>
                    <InputLeftElement pointerEvents="none">
                        <Icon as={IoSearchOutline} color={sidebarSubText} />
                    </InputLeftElement>
                    <Input
                        placeholder="ابحث أو ابدأ محادثة جديدة"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        bg={searchBg}
                        border="1px solid"
                        borderColor={searchBorder}
                        borderRadius="xl"
                        h="38px"
                        fontSize="sm"
                        _focus={{
                            borderColor: useColorModeValue('#00A884', '#00A884'),
                            boxShadow: 'none',
                        }}
                    />
                </InputGroup>
            </Box>

            {/* جزء المجموعات */}
            <Box flex="1" overflowY="auto" pb={2}>
                <Text fontSize="xs" fontWeight="700" color={sidebarSubText} px={4} py={2}>
                    مجموعات
                </Text>
                <VStack align="stretch" spacing={1}>
                    {filteredGroups.length > 0 ? (
                        filteredGroups.map((chat, index) => (
                            <ChatListItem
                                key={chat.id}
                                chat={chat}
                                type="group"
                                onSelectChat={() => onSelectGroup(chat.id)}
                                isActive={activeChat?.type === 'group' && activeChat?.id === chat.id}
                                index={index}
                            />
                        ))
                    ) : (
                        <Flex 
                            align="center" 
                            justify="center" 
                            py={8}
                            flexDirection="column"
                        >
                            <IoPeopleOutline size="48px" color={useColorModeValue('gray.300','gray.600')} />
                            <Text 
                                fontSize="sm" 
                                color={useColorModeValue('gray.500','gray.400')} 
                                textAlign="center" 
                                mt={2}
                            >
                                {searchTerm ? 'لا توجد مجموعات مطابقة' : 'لا توجد مجموعات متاحة'}
                            </Text>
                        </Flex>
                    )}
                </VStack>

                {/* Contacts (Teacher only) */}
                <Divider my={2} borderColor={useColorModeValue('#E9EDEF', '#2A3942')} />
                <Text fontSize="xs" fontWeight="700" color={sidebarSubText} px={4} py={2}>
                    الطلاب (شات مباشر)
                </Text>
                <VStack align="stretch" spacing={1}>
                    {filteredContacts.length > 0 ? (
                        filteredContacts.map((c, index) => (
                            <ChatListItem
                                key={`student-${c.id}`}
                                chat={{
                                    id: c.id,
                                    name: c.name,
                                    avatar: c.avatar,
                                    lastMessage: c.lastMessage,
                                    time: c.time,
                                    unread: c.unread || 0,
                                }}
                                type="direct"
                                onSelectChat={() => onSelectContact(c)}
                                isActive={activeChat?.type === 'direct' && activeChat?.id === c.id}
                                index={index}
                            />
                        ))
                    ) : (
                        <Flex align="center" justify="center" py={6} flexDirection="column">
                            <IoPersonOutline size="48px" color={useColorModeValue('gray.300','gray.600')} />
                            <Text fontSize="sm" color={useColorModeValue('gray.500','gray.400')} textAlign="center" mt={2}>
                                {searchTerm ? 'لا توجد نتائج مطابقة' : 'لا يوجد طلاب متاحين للشات'}
                            </Text>
                        </Flex>
                    )}
                </VStack>
            </Box>
        </Box>
    );
};

// --- 4. مكون ChatHeader ---
const ChatHeader = ({ chatInfo, onBack, isMobile, canTogglePermission, allowStudentSend, onTogglePermission, togglingPermission, onOpenMembers, canViewMembers }) => {
    if (!chatInfo) return null;

    const headerBg = useColorModeValue('#F0F2F5', '#202C33');
    const headerBorder = useColorModeValue('#E9EDEF', '#2A3942');
    const headerText = useColorModeValue('#111B21', '#E9EDEF');
    const headerSub = useColorModeValue('#667781', '#8696A0');
    const iconColor = useColorModeValue('#54656F', '#AEBAC1');

    return (
        <Flex
            px={{ base: 3, md: 4 }}
            py={{ base: 2, md: 3 }}
            borderBottom="1px solid"
            borderColor={headerBorder}
            align="center"
            bg={headerBg}
            minH="70px"
            position="sticky"
            top="0"
            zIndex={5}
        >
            {isMobile && (
                <IconButton
                    icon={<IoArrowBackOutline />}
                    onClick={onBack}
                    variant="ghost"
                    aria-label="العودة للمحادثات"
                    mr={2}
                    size="md"
                    color={iconColor}
                    _hover={{ bg: useColorModeValue('blackAlpha.50', 'whiteAlpha.100') }}
                />
            )}
            
            {chatInfo.isDirect ? (
                <Avatar size="md" src={chatInfo.avatar || undefined} name={chatInfo.name} />
            ) : (
                <Avatar 
                    size="md" 
                    icon={<IoPeopleOutline fontSize="1.5rem" />} 
                    bg={useColorModeValue('#DFE5E7', '#2A3942')}
                    color={useColorModeValue('#54656F', '#AEBAC1')}
                />
            )}
            
            <Box ml={3} flex="1" minW={0}>
                <Text 
                    fontSize={{ base: "md", md: "lg" }} 
                    fontWeight="700" 
                    noOfLines={1}
                    color={headerText}
                >
                    {chatInfo.name}
                </Text>
                <Text 
                    fontSize="sm" 
                    color={headerSub}
                >
                    {chatInfo.isDirect ? 'شات مباشر' : 'دردشة صفية جماعية'}
                </Text>
            </Box>

            <HStack spacing={2} align="center">
                <IconButton
                    icon={<IoSearchOutline />}
                    variant="ghost"
                    aria-label="بحث داخل المحادثة"
                    size="md"
                    color={iconColor}
                    _hover={{ bg: useColorModeValue('blackAlpha.50', 'whiteAlpha.100') }}
                />
                {canViewMembers && (
                    <IconButton
                        icon={<IoPersonOutline />}
                        onClick={onOpenMembers}
                        variant="ghost"
                        aria-label="عرض الأعضاء"
                        size="md"
                        color={iconColor}
                        _hover={{ bg: useColorModeValue('blackAlpha.50', 'whiteAlpha.100') }}
                    />
                )}
                
                {canTogglePermission && (
                    <HStack spacing={2} display={{ base: 'none', md: 'flex' }}>
                        <Text fontSize="sm" color={headerSub}>
                            سماح الطلاب
                        </Text>
                        <Switch 
                            isChecked={allowStudentSend} 
                            onChange={onTogglePermission} 
                            isDisabled={togglingPermission} 
                            colorScheme="teal" 
                            size="sm"
                        />
                    </HStack>
                )}
                
                <IconButton 
                    icon={<IoEllipsisVertical />} 
                    variant="ghost" 
                    aria-label="خيارات المحادثة"
                    size="md"
                    color={iconColor}
                    _hover={{ bg: useColorModeValue('blackAlpha.50', 'whiteAlpha.100') }}
                />
            </HStack>
        </Flex>
    );
};

// --- 5. مكون ChatMessage ---
const ChatMessage = ({ message, onReply, onEdit, onDelete, isEditing, isDeleting }) => {
    const isMine = message.isMine;
    const outBg = useColorModeValue('#D9FDD3', '#005C4B');
    const inBg = useColorModeValue('#FFFFFF', '#202C33');
    const outText = useColorModeValue('#111B21', '#E9EDEF');
    const inText = useColorModeValue('#111B21', '#E9EDEF');
    const alignment = isMine ? 'flex-end' : 'flex-start';
    const hasAttachment = !!message.attachment_url;
    const attachmentType = message.attachment_type;

    return (
        <Flex justify={alignment} mb={4} px={2}>
            <Box
                bg={isMine ? outBg : inBg}
                color={isMine ? outText : inText}
                px={4}
                py={3}
                borderRadius="lg"
                maxWidth="80%"
                position="relative"
                boxShadow={useColorModeValue('0 1px 1px rgba(0,0,0,0.10)', '0 1px 1px rgba(0,0,0,0.40)')}
                transition="background-color 0.2s ease"
                sx={{
                    ...(isMine ? { borderTopRightRadius: '6px' } : { borderTopLeftRadius: '6px' }),
                }}
            >
                {/* Reply preview inside bubble */}
                {message.reply_to_preview && (
                    <Box
                        mb={2}
                        p={2}
                        borderLeft="3px solid"
                        borderColor={useColorModeValue('#00A884', '#00A884')}
                        bg={useColorModeValue('blackAlpha.50', 'whiteAlpha.100')}
                        borderRadius="md"
                    >
                        <Text fontSize="xs" fontWeight="700" mb={1} color={useColorModeValue('#006D5B', '#9FEFE1')} noOfLines={1}>
                            {message.reply_to_preview.sender || 'مستخدم'}
                        </Text>
                        <Text fontSize="xs" noOfLines={2} color={useColorModeValue('#667781', '#8696A0')}>
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
                    <Text 
                        fontSize="md" 
                        lineHeight="1.6"
                        fontWeight="400"
                        wordBreak="break-word"
                        whiteSpace="pre-wrap"
                    >
                        {message.text}
                    </Text>
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

                <Flex justify="space-between" align="center" mt={3}>
                    <HStack spacing={2} opacity={0.8} _groupHover={{ opacity: 1 }} transition="opacity 0.3s">
                        <IconButton 
                            aria-label="reply" 
                            icon={<IoReturnUpBack />} 
                            size="sm" 
                            variant="ghost" 
                            colorScheme={isMine ? 'blackAlpha' : 'teal'} 
                            onClick={() => onReply?.(message)}
                            _hover={{
                                bg: useColorModeValue('blackAlpha.50', 'whiteAlpha.100'),
                            }}
                            borderRadius="full"
                        />
                        {isMine && message.type === 'text' && !hasAttachment && (
                            <Menu placement="top-start">
                                <MenuButton
                                    as={IconButton}
                                    icon={<IoEllipsisVertical />}
                                    size="sm"
                                    variant="ghost"
                                    colorScheme={isMine ? 'whiteAlpha' : 'teal'}
                                    aria-label="خيارات الرسالة"
                                    _hover={{
                                        bg: isMine ? 'whiteAlpha.300' : 'teal.100',
                                        transform: 'scale(1.15)',
                                        boxShadow: 'md'
                                    }}
                                    transition="all 0.2s"
                                    borderRadius="full"
                                />
                                <MenuList 
                                    bg={useColorModeValue('white','gray.800')} 
                                    borderColor={useColorModeValue('gray.200','gray.600')}
                                    boxShadow="2xl"
                                    borderRadius="xl"
                                    py={3}
                                    px={2}
                                    minW="140px"
                                >
                                    <MenuItem 
                                    color="blue.500"
                                        icon={<IoCreateOutline />} 
                                        onClick={() => onEdit?.(message)}
                                        _hover={{ 
                                            bg: useColorModeValue('blue.50', 'blue.900'),
                                            color: 'blue.500',
                                            transform: 'none'
                                        }}
                                        borderRadius="lg"
                                        mx={1}
                                        py={3}
                                        transition="all 0.2s"
                                        fontWeight="medium"
                                    >
                                        تعديل الرسالة
                                    </MenuItem>
                                    <MenuItem 
                                        icon={<IoTrashOutline />} 
                                        onClick={() => onDelete?.(message.id)}
                                        color="red.500"
                                        _hover={{ 
                                            bg: useColorModeValue('red.50', 'red.900'),
                                            color: 'red.600',
                                            transform: 'none'
                                        }}
                                        borderRadius="lg"
                                        mx={1}
                                        py={3}
                                        transition="all 0.2s"
                                        fontWeight="medium"
                                    >
                                        حذف الرسالة
                                    </MenuItem>
                                </MenuList>
                            </Menu>
                        )}
                    </HStack>
                    <VStack spacing={0} align="end">
                        <Text 
                            fontSize="xs" 
                            color={useColorModeValue('#667781', '#8696A0')} 
                            textAlign="end"
                            fontWeight="500"
                        >
                    {message.timestamp}
                </Text>
                        {message.isEdited && (
                            <Text 
                                fontSize="xs" 
                                color={useColorModeValue('#667781', '#8696A0')}
                                fontStyle="italic"
                                fontWeight="400"
                            >
                                (تم التعديل)
                            </Text>
                        )}
                    </VStack>
                </Flex>
            </Box>
        </Flex>
    );
};

// --- 6. مكون MessagesContainer ---
const MessagesContainer = ({ messages, onReply, onEdit, onDelete, isEditing, isDeleting }) => {
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    return (
        <VStack
            flex="1"
            px={{ base: 2, md: 4 }}
            py={{ base: 3, md: 4 }}
            spacing={2}
            overflowY="auto"
            align="stretch"
            bg="transparent"
        >
            {messages.length > 0 ? (
                messages.map((msg) => (
                    <ChatMessage
                        key={msg.id}
                        message={msg}
                        onReply={onReply}
                        onEdit={onEdit}
                        onDelete={onDelete}
                        isEditing={isEditing}
                        isDeleting={isDeleting}
                    />
                ))
            ) : (
                <Text textAlign="center" color={useColorModeValue('gray.500','gray.400')} mt={8}>لا توجد رسائل في هذه المحادثة حتى الآن.</Text>
            )}
            <Box ref={messagesEndRef} h="1px" />
        </VStack>
    );
};

// --- 7. مكون SendButton ---
const SendButton = ({ onSend, disabled, isLoading }) => {
    return (
        <IconButton
            icon={<IoSend />}
            colorScheme="green"
            variant="solid"
            aria-label="إرسال الرسالة"
            size="md"
            onClick={onSend}
            isDisabled={disabled}
            isLoading={isLoading}
            borderRadius="full"
            bg={useColorModeValue('#00A884', '#00A884')}
            color="white"
            _hover={{
                bg: useColorModeValue('#008069', '#008069'),
            }}
            _active={{
                bg: useColorModeValue('#00705E', '#00705E'),
            }}
            _disabled={{
                bg: 'gray.300',
                cursor: 'not-allowed',
                boxShadow: 'none'
            }}
            transition="background-color 0.15s ease"
        />
    );
};

// --- 8. مكون MessageInputBar ---
const MessageInputBar = ({ onSendMessage, onSendAttachment, disabled, replyTarget, onCancelReply, isSending, editingMessage, editText, setEditText, onSaveEdit, onCancelEdit }) => {
    const [message, setMessage] = useState('');
    const fileInputRef = useRef(null);
    const toast = useToast();
    const [pendingAttachment, setPendingAttachment] = useState(null);
    const inputBarBg = useColorModeValue('#F0F2F5', '#202C33');
    const inputBg = useColorModeValue('#FFFFFF', '#2A3942');
    const iconColor = useColorModeValue('#54656F', '#AEBAC1');

    const handleSend = () => {
        if (disabled || !message.trim()) return;
        onSendMessage(message, 'text');
        setMessage('');
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            if (editingMessage) {
                onSaveEdit(editingMessage.id, editText);
            } else {
            handleSend();
            }
        }
    };

    const handleSaveEdit = () => {
        if (!editText.trim()) return;
        onSaveEdit(editingMessage.id, editText);
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


    return (
        <Box position="sticky" bottom="0" zIndex={5}>
            {/* شريط تعديل الرسالة */}
            {editingMessage && (
                <Flex 
                    align="center" 
                    bg={useColorModeValue('blue.50','blue.900')} 
                    border="2px solid"
                    borderColor="blue.300"
                    px={4} 
                    py={3} 
                    borderRadius="xl" 
                    mx={4}
                    mb={3}
                    boxShadow="lg"
                    position="relative"
                    _before={{
                        content: '""',
                        position: 'absolute',
                        top: '-8px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: 0,
                        height: 0,
                        borderLeft: '8px solid transparent',
                        borderRight: '8px solid transparent',
                        borderBottom: '8px solid',
                        borderBottomColor: 'blue.300'
                    }}
                >
                    <Box flex="1">
                        <Text fontSize="sm" fontWeight="bold" color={useColorModeValue('blue.700','blue.200')} mb={2}>
                            ✏️ تعديل الرسالة
                        </Text>
                        <Text 
                            fontSize="sm" 
                            color={useColorModeValue('blue.600','blue.300')} 
                            noOfLines={2}
                            bg={useColorModeValue('white','blue.800')}
                            p={2}
                            borderRadius="md"
                            border="1px solid"
                            borderColor={useColorModeValue('blue.200','blue.600')}
                        >
                            {editingMessage.text}
                        </Text>
                    </Box>
                    <HStack spacing={2} ml={4}>
                        <IconButton 
                            aria-label="حفظ التعديل" 
                            icon={<IoCheckmarkOutline />} 
                            size="md" 
                            colorScheme="green" 
                            variant="solid"
                            onClick={handleSaveEdit}
                            isDisabled={!editText.trim()}
                            borderRadius="full"
                            _hover={{
                                transform: 'scale(1.1)',
                                boxShadow: 'lg'
                            }}
                            transition="all 0.2s"
                        />
                        <IconButton 
                            aria-label="إلغاء التعديل" 
                            icon={<IoCloseOutline />} 
                            size="md" 
                            colorScheme="red" 
                            variant="solid"
                            onClick={onCancelEdit}
                            borderRadius="full"
                            _hover={{
                                transform: 'scale(1.1)',
                                boxShadow: 'lg'
                            }}
                            transition="all 0.2s"
                        />
                    </HStack>
                </Flex>
            )}

            {/* شريط الرد */}
            {replyTarget && !editingMessage && (
                <Flex 
                    align="center" 
                    bg={useColorModeValue('green.50','green.900')} 
                    border="2px solid"
                    borderColor="green.300"
                    px={4} 
                    py={3} 
                    borderRadius="xl" 
                    mx={4}
                    mb={3}
                    boxShadow="lg"
                    position="relative"
                    _before={{
                        content: '""',
                        position: 'absolute',
                        top: '-8px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: 0,
                        height: 0,
                        borderLeft: '8px solid transparent',
                        borderRight: '8px solid transparent',
                        borderBottom: '8px solid',
                        borderBottomColor: 'green.300'
                    }}
                >
                    <Box flex="1">
                        <Text fontSize="sm" fontWeight="bold" color={useColorModeValue('green.700','green.200')} mb={2}>
                            💬 الرد على {replyTarget.sender || 'مستخدم'}
                        </Text>
                        <Text 
                            fontSize="sm" 
                            color={useColorModeValue('green.600','green.300')} 
                            noOfLines={2}
                            bg={useColorModeValue('white','green.800')}
                            p={2}
                            borderRadius="md"
                            border="1px solid"
                            borderColor={useColorModeValue('green.200','green.600')}
                        >
                            {replyTarget.text || (replyTarget.attachment_type === 'image' ? 'صورة' : replyTarget.attachment_name || 'مرفق')}
                        </Text>
                    </Box>
                    <IconButton 
                        aria-label="إلغاء الرد" 
                        icon={<IoCloseOutline />} 
                        size="md" 
                        colorScheme="red" 
                        variant="solid"
                        onClick={onCancelReply} 
                        borderRadius="full"
                        ml={4}
                        _hover={{
                            transform: 'scale(1.1)',
                            boxShadow: 'lg'
                        }}
                        transition="all 0.2s"
                    />
                </Flex>
            )}

            {/* معاينة المرفق قبل الإرسال */}
            {pendingAttachment && (
                <Flex 
                    align="center" 
                    bg={useColorModeValue('purple.50','purple.900')} 
                    border="2px solid" 
                    borderColor="purple.300" 
                    px={4} 
                    py={3} 
                    borderRadius="xl" 
                    mx={4}
                    mb={3}
                    boxShadow="lg"
                    position="relative"
                    _before={{
                        content: '""',
                        position: 'absolute',
                        top: '-8px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: 0,
                        height: 0,
                        borderLeft: '8px solid transparent',
                        borderRight: '8px solid transparent',
                        borderBottom: '8px solid',
                        borderBottomColor: 'purple.300'
                    }}
                >
                    <Box flex="1">
                        <Text fontSize="sm" fontWeight="bold" color={useColorModeValue('purple.700','purple.200')} mb={2}>
                            📎 معاينة المرفق
                        </Text>
                        <Flex align="center">
                    {pendingAttachment.previewUrl ? (
                        <Image 
                            src={pendingAttachment.previewUrl} 
                            alt="preview" 
                                    boxSize="60px" 
                            objectFit="cover" 
                                    borderRadius="lg" 
                            mr={3} 
                                    border="2px solid"
                                    borderColor={useColorModeValue('purple.200','purple.600')}
                        />
                    ) : (
                                <Box 
                                    bg={useColorModeValue('white','purple.800')}
                                    p={3}
                                    borderRadius="lg"
                                    border="2px solid"
                                    borderColor={useColorModeValue('purple.200','purple.600')}
                                    mr={3}
                                >
                                    <Text fontSize="sm" fontWeight="medium" color={useColorModeValue('purple.600','purple.300')}>
                                        📄 {pendingAttachment.file.name}
                                    </Text>
                                </Box>
                            )}
                        </Flex>
                    </Box>
                    <HStack spacing={2} ml={4}>
                    <IconButton 
                        aria-label="إزالة" 
                        icon={<IoCloseOutline />} 
                            size="md" 
                            colorScheme="red" 
                            variant="solid"
                        onClick={() => setPendingAttachment(null)} 
                            borderRadius="full"
                            _hover={{
                                transform: 'scale(1.1)',
                                boxShadow: 'lg'
                            }}
                            transition="all 0.2s"
                    />
                    <Button 
                        colorScheme="teal" 
                            size="md" 
                            borderRadius="full"
                        onClick={async () => {
                            if (!pendingAttachment) return;
                            try {
                                await onSendAttachment(pendingAttachment.file, { text: message });
                                setPendingAttachment(null);
                                setMessage('');
                            } catch {
                                // toast داخل onSendAttachment
                            }
                        }}
                            _hover={{
                                transform: 'scale(1.05)',
                                boxShadow: 'lg'
                            }}
                            transition="all 0.2s"
                    >
                        إرسال
                    </Button>
                    </HStack>
                </Flex>
            )}

            {/* شريط الإدخال الرئيسي */}
            <Flex 
                p={{ base: 2, md: 3 }} 
                bg={inputBarBg} 
                align="center" 
                borderTop="1px solid" 
                borderColor={useColorModeValue('#E9EDEF', '#2A3942')}
                gap={3}
            >
                {/* قائمة الإرفاق */}
                <Menu>
                    <MenuButton
                        as={IconButton}
                        icon={<IoAttachOutline />}
                        variant="ghost"
                        aria-label="إرفاق ملف"
                        size="md"
                        color={iconColor}
                        borderRadius="full"
                        isDisabled={disabled}
                        _hover={{
                            bg: useColorModeValue('blackAlpha.50', 'whiteAlpha.100'),
                        }}
                    />
                    <MenuList bg={useColorModeValue('white','gray.800')} borderColor={useColorModeValue('gray.200','gray.600')}>
                        <MenuItem 
                            icon={<IoImageOutline />} 
                            onClick={handleImageUploadClick}
                            _hover={{ bg: useColorModeValue('gray.50', 'gray.700') }}
                        >
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

                {/* مربع إدخال الرسالة */}
                <InputGroup 
                    flex="1" 
                    bg={inputBg} 
                    borderRadius="2xl"
                    border="1px solid"
                    borderColor={useColorModeValue('#E9EDEF', '#2A3942')}
                >
                    <Input
                        placeholder={editingMessage ? "عدل الرسالة..." : "اكتب رسالة..."}
                        borderRadius="2xl"
                        value={editingMessage ? editText : message}
                        onChange={(e) => editingMessage ? setEditText(e.target.value) : setMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        pr="3.5rem"
                        isDisabled={disabled}
                        border="none"
                        bg="transparent"
                        _focus={{
                            boxShadow: 'none',
                        }}
                    />
                    <InputRightElement width="3.5rem" pr={2}>
                        <SendButton
                            onSend={editingMessage ? handleSaveEdit : handleSend}
                            disabled={disabled || (editingMessage ? !editText.trim() : !message.trim())}
                            isLoading={isSending}
                        />
                    </InputRightElement>
                </InputGroup>

                <IconButton
                    aria-label="تسجيل صوتي"
                    icon={<IoMicOutline />}
                    variant="ghost"
                    size="md"
                    color={iconColor}
                    borderRadius="full"
                    isDisabled={disabled}
                    _hover={{ bg: useColorModeValue('blackAlpha.50', 'whiteAlpha.100') }}
                />
            </Flex>
        </Box>
    );
};

// --- 9. مكون MainChatArea ---
const MainChatArea = ({ chatInfo, messages, onSendMessage, onBack, isMobile, canTogglePermission, allowStudentSend, onTogglePermission, togglingPermission, inputDisabled, onOpenMembers, canViewMembers, onSendAttachment, replyTarget, onSelectReply, isSending, onEditMessage, onDeleteMessage, editingMessage, editText, setEditText, onSaveEdit, onCancelEdit, isEditing, isDeleting }) => {
    return (
        <Flex direction="column" h="full">
            {/* Header */}
            <ChatHeader 
                chatInfo={chatInfo} 
                onBack={onBack} 
                isMobile={isMobile} 
                canTogglePermission={canTogglePermission} 
                allowStudentSend={allowStudentSend} 
                onTogglePermission={onTogglePermission} 
                togglingPermission={togglingPermission} 
                onOpenMembers={onOpenMembers} 
                canViewMembers={canViewMembers} 
            />

            {/* Messages Container */}
            <MessagesContainer 
                messages={messages} 
                onReply={onSelectReply} 
                onEdit={onEditMessage}
                onDelete={onDeleteMessage}
                isEditing={isEditing}
                isDeleting={isDeleting}
            />

            {/* Notice: sending disabled for students */}
            {inputDisabled && (
                <Flex 
                    px={4} 
                    py={2} 
                    bg="yellow.50" 
                    borderTop="1px solid" 
                    borderColor="yellow.200" 
                    align="center"
                    justify="center"
                >
                    <Text fontSize="sm" color="yellow.700" textAlign="center">
                        تم إيقاف إرسال الرسائل للطلاب من قبل المعلم.
                    </Text>
                </Flex>
            )}

            {/* Message Input Bar */}
            <MessageInputBar 
                onSendMessage={onSendMessage} 
                onSendAttachment={onSendAttachment} 
                disabled={inputDisabled} 
                replyTarget={replyTarget} 
                onCancelReply={() => onSelectReply(null)}
                isSending={isSending}
                editingMessage={editingMessage}
                editText={editText}
                setEditText={setEditText}
                onSaveEdit={onSaveEdit}
                onCancelEdit={onCancelEdit}
            />
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
    const [activeChatType, setActiveChatType] = useState('group'); // group | direct
    const [activeDirect, setActiveDirect] = useState(null); // { id, name, avatar, chat_group_id }
    const [messagesByGroup, setMessagesByGroup] = useState({});
    const [isLoadingGroups, setIsLoadingGroups] = useState(true);
    const [isLoadingHistory, setIsLoadingHistory] = useState(false);
    const [togglingPermission, setTogglingPermission] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [isMembersOpen, setIsMembersOpen] = useState(false);
    const [members, setMembers] = useState([]);
    const [membersLoading, setMembersLoading] = useState(false);
    const [replyTarget, setReplyTarget] = useState(null);
    const [editingMessage, setEditingMessage] = useState(null);
    const [editText, setEditText] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const socketRef = useRef(null);

    // Direct contacts (Teacher -> students)
    const [contacts, setContacts] = useState([]);
    const [contactsLoading, setContactsLoading] = useState(false);

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

    // Fetch contacts (Teacher: students)
    useEffect(() => {
        let ignore = false;
        const fetchContacts = async () => {
            if (!isTeacher) return;
            setContactsLoading(true);
            try {
                const { data } = await baseUrl.get('/api/chat/contacts', {
                    headers: authHeader ? { Authorization: authHeader } : {},
                });
                if (ignore) return;
                const list = (data?.contacts || [])
                    .filter(c => c?.type === 'student' && c?.student)
                    .map(c => ({
                        id: c.student.id,
                        name: c.student.name,
                        avatar: c.student.avatar,
                        direct_chat_group_id: c.direct_chat_group_id,
                        lastMessage: '',
                        time: '',
                        unread: 0,
                    }));
                setContacts(list);
            } catch (err) {
                toast({ title: 'فشل تحميل الطلاب', status: 'error', duration: 3000, isClosable: true });
                setContacts([]);
            } finally {
                setContactsLoading(false);
            }
        };
        fetchContacts();
        return () => { ignore = true; };
    }, [authHeader, isTeacher, toast]);

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
            // update last message on direct contacts (if this groupId is a direct chat group)
            setContacts(prev => prev.map(c => c.direct_chat_group_id === groupId ? { ...c, lastMessage: payload.text, time: dayjs(payload.created_at).format('h:mm A'), unread: (activeChatType === 'direct' && activeDirect?.id === c.id) ? 0 : (c.unread || 0) + 1 } : c));
        });

        s.on('chat:permission-changed', (payload) => {
            if (!payload?.groupId) return;
            setGroups(prev => prev.map(g => g.id === payload.groupId ? { ...g, allow_student_send: payload.allow_student_send } : g));
        });

        return () => {
            s.disconnect();
        };
    }, [socketEndpoint, userData, activeGroupId, activeChatType, activeDirect]);

    // Join rooms when groups list updates
    useEffect(() => {
        const s = socketRef.current;
        if (!s) return;
        (groups || []).forEach(g => {
            s.emit('chat:join-group', g.id);
        });
        (contacts || []).forEach(c => {
            if (c.direct_chat_group_id) s.emit('chat:join-group', c.direct_chat_group_id);
        });
    }, [groups, contacts]);

    // Load history when selecting a group/direct chat (first time or on explicit change)
    useEffect(() => {
        const loadHistory = async () => {
            if (activeChatType === 'direct') {
                const otherId = activeDirect?.id;
                if (!otherId) return;
                const knownGroupId = activeDirect?.chat_group_id || contacts.find(c => c.id === otherId)?.direct_chat_group_id;
                if (knownGroupId && messagesByGroup[knownGroupId]?.length) return;
                setIsLoadingHistory(true);
                try {
                    const { data } = await baseUrl.get(`/api/chat/direct/${otherId}/messages`, {
                        params: { limit: 50 },
                        headers: authHeader ? { Authorization: authHeader } : {},
                    });
                    const chatGroupId = data?.chat_group_id || knownGroupId;
                    const transformed = (data?.messages || []).map(m => ({
                        id: m.id,
                        sender: m.sender_name,
                        text: m.text,
                        timestamp: dayjs(m.created_at).format('h:mm A'),
                        isMine: !!(userData && (m.sender_id === userData?.id || m.sender_id === userData?._id)),
                        type: 'text',
                    }));
                    if (chatGroupId) {
                        setMessagesByGroup(prev => ({ ...prev, [chatGroupId]: transformed }));
                        setActiveDirect(prev => prev && prev.id === otherId ? { ...prev, chat_group_id: chatGroupId } : prev);
                        setContacts(prev => prev.map(c => c.id === otherId ? { ...c, direct_chat_group_id: chatGroupId, unread: 0 } : c));
                        socketRef.current?.emit('chat:join-group', chatGroupId);
                    }
                } catch (err) {
                    toast({ title: 'فشل تحميل الرسائل', status: 'error', duration: 3000, isClosable: true });
                } finally {
                    setIsLoadingHistory(false);
                }
                return;
            }

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
    }, [activeGroupId, activeChatType, activeDirect, authHeader, toast, userData, contacts, messagesByGroup]);

    const handleChatSelect = (id) => {
        setActiveChatType('group');
        setActiveDirect(null);
        setActiveGroupId(id);
        if (isMobile) {
            setShowSidebar(false);
        }
    };

    const handleDirectSelect = (contact) => {
        setActiveChatType('direct');
        setActiveGroupId(null);
        setActiveDirect({
            id: contact.id,
            name: contact.name,
            avatar: contact.avatar,
            chat_group_id: contact.direct_chat_group_id || null,
        });
        if (isMobile) setShowSidebar(false);
        if (contact.direct_chat_group_id) socketRef.current?.emit('chat:join-group', contact.direct_chat_group_id);
        // Reset unread
        setContacts(prev => prev.map(c => c.id === contact.id ? { ...c, unread: 0 } : c));
    };

    const handleBackToSidebar = () => {
        if (isMobile) {
            setShowSidebar(true);
            setActiveGroupId(null);
            setActiveDirect(null);
        }
    };

    const getActiveChatInfo = () => {
        if (activeChatType === 'direct') {
            if (!activeDirect) return null;
            return {
                id: activeDirect.id,
                name: activeDirect.name,
                avatar: activeDirect.avatar,
                isDirect: true,
            };
        }
        if (!activeGroupId) return null;
        return groups.find(chat => chat.id === activeGroupId);
    };

    const getMessagesForChat = (id) => messagesByGroup[id] || [];

    const getActiveChatGroupId = () => {
        if (activeChatType === 'direct') {
            const otherId = activeDirect?.id;
            if (!otherId) return null;
            return activeDirect?.chat_group_id || contacts.find(c => c.id === otherId)?.direct_chat_group_id || null;
        }
        return activeGroupId;
    };

    const onSendMessage = async (content, messageType = 'text') => {
        if (activeChatType === 'direct') {
            const otherId = activeDirect?.id;
            if (!otherId) return;
            if (messageType !== 'text') return;
            try {
                setIsSending(true);
                const { data } = await baseUrl.post(`/api/chat/direct/${otherId}/messages`, { message: content }, {
                    headers: authHeader ? { Authorization: authHeader } : {},
                });
                const chatGroupId = data?.chat_group_id;
                const m = data?.message;
                if (chatGroupId) {
                    socketRef.current?.emit('chat:join-group', chatGroupId);
                    setActiveDirect(prev => prev && prev.id === otherId ? { ...prev, chat_group_id: chatGroupId } : prev);
                    setContacts(prev => prev.map(c => c.id === otherId ? { ...c, direct_chat_group_id: chatGroupId, lastMessage: m?.text || content, time: dayjs(m?.created_at || new Date()).format('h:mm A'), unread: 0 } : c));
                }
                if (chatGroupId && m) {
                    const transformed = {
                        id: m.id,
                        sender: userData?.name || 'أنا',
                        text: m.text,
                        timestamp: dayjs(m.created_at).format('h:mm A'),
                        isMine: true,
                        type: 'text',
                    };
                    setMessagesByGroup(prev => ({
                        ...prev,
                        [chatGroupId]: [...(prev[chatGroupId] || []), transformed],
                    }));
                }
                setReplyTarget(null);
            } catch (e) {
                toast({ title: 'تعذر إرسال الرسالة', status: 'error', duration: 2500, isClosable: true });
            } finally {
                setIsSending(false);
            }
            return;
        }

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
    const allowStudentSend = activeChatType === 'group' ? activeGroup?.allow_student_send : true;
    const isStudent = !!student;
    const inputDisabled = activeChatType === 'group' && isStudent && activeGroup && activeGroup.allow_student_send === false;

    const onSendAttachment = async (file, extra = {}) => {
        if (activeChatType !== 'group') {
            toast({ title: 'غير متاح', description: 'المرفقات غير مدعومة في الشات المباشر حالياً.', status: 'info', duration: 2500, isClosable: true });
            return;
        }
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

    const canViewMembers = !!(isTeacher || isAdmin) && activeChatType === 'group';

    const openMembers = async () => {
        if (!activeGroupId || activeChatType !== 'group') return;
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

    // دالة تعديل الرسالة
    const handleEditMessage = async (messageId, newText) => {
        if (!messageId || !newText.trim()) return;
        try {
            setIsEditing(true);
            await baseUrl.put(`/api/chat/messages/${messageId}`, { text: newText }, {
                headers: authHeader ? { Authorization: authHeader } : {},
            });
            
            // تحديث الرسالة في المحادثة المحلية
            setMessagesByGroup(prev => {
                const updated = { ...prev };
                Object.keys(updated).forEach(groupId => {
                    updated[groupId] = updated[groupId].map(msg => 
                        msg.id === messageId ? { ...msg, text: newText, isEdited: true } : msg
                    );
                });
                return updated;
            });
            
            setEditingMessage(null);
            setEditText('');
            toast({ title: 'تم تعديل الرسالة بنجاح', status: 'success', duration: 2000, isClosable: true });
        } catch (e) {
            toast({ title: 'تعذر تعديل الرسالة', status: 'error', duration: 2500, isClosable: true });
        } finally {
            setIsEditing(false);
        }
    };

    // دالة حذف الرسالة
    const handleDeleteMessage = async (messageId) => {
        if (!messageId) return;
        try {
            setIsDeleting(true);
            await baseUrl.delete(`/api/chat/messages/${messageId}`, {
                headers: authHeader ? { Authorization: authHeader } : {},
            });
            
            // إزالة الرسالة من المحادثة المحلية
            setMessagesByGroup(prev => {
                const updated = { ...prev };
                Object.keys(updated).forEach(groupId => {
                    updated[groupId] = updated[groupId].filter(msg => msg.id !== messageId);
                });
                return updated;
            });
            
            toast({ title: 'تم حذف الرسالة بنجاح', status: 'success', duration: 2000, isClosable: true });
        } catch (e) {
            toast({ title: 'تعذر حذف الرسالة', status: 'error', duration: 2500, isClosable: true });
        } finally {
            setIsDeleting(false);
        }
    };

    // دالة بدء تعديل الرسالة
    const startEditMessage = (message) => {
        setEditingMessage(message);
        setEditText(message.text);
    };

    // دالة إلغاء التعديل
    const cancelEdit = () => {
        setEditingMessage(null);
        setEditText('');
    };


    return (
        <Box 
            h={{ base: "calc(100vh - 80px)", md: "calc(100vh - 80px)" }} 
            mt={{ base: "0px", md: "30px" }} 
            bg={useColorModeValue('#EFEAE2','#0B141A')} 
            className='chat-page'
            borderRadius={{ base: "none", md: "lg" }}
            overflow="hidden"
            boxShadow={{ base: "none", md: "xl" }}
        >
            <Flex h="full" direction={{ base: "column", md: "row" }}>
                {/* Sidebar */}
                <Box
                    w={{ base: '100%', md: '350px', lg: '380px' }}
                    h={{ base: '100%', md: '100%' }}
                    bg={useColorModeValue('#FFFFFF','#111B21')}
                    borderEnd={{ base: 'none', md: '1px solid' }}
                    borderColor={useColorModeValue('#E9EDEF','#2A3942')}
                    overflowY="auto"
                    transition="all 0.3s ease"
                    position={{ base: 'relative', md: 'relative' }}
                    display={{ base: showSidebar ? 'block' : 'none', md: 'block' }}
                >
                    {isLoadingGroups ? (
                        <Flex align="center" justify="center" h="full" py={6}>
                            <VStack spacing={4}>
                                <Spinner color="teal.500" size="lg" />
                                <Text color="gray.500" fontSize="sm">جاري تحميل المجموعات...</Text>
                            </VStack>
                        </Flex>
                    ) : (
                        <Sidebar
                            groups={groups}
                            contacts={contacts}
                            onSelectGroup={handleChatSelect}
                            onSelectContact={handleDirectSelect}
                            activeChat={activeChatType === 'direct' ? { type: 'direct', id: activeDirect?.id } : { type: 'group', id: activeGroupId }}
                        />
                    )}
                </Box>

                {/* Main Chat Area */}
                <Box
                    flex="1"
                    h="full"
                    bg={useColorModeValue('#EFEAE2','#0B141A')}
                    style={useChatBackground()}
                    position="relative"
                    display={{ base: !showSidebar ? 'block' : 'none', md: 'block' }}
                >
                    {(!activeGroupId && activeChatType !== 'direct') && !activeDirect ? (
                        <Flex 
                            h="full" 
                            align="center" 
                            justify="center" 
                            direction="column"
                            px={6}
                            textAlign="center"
                        >
                            <Box
                                w="120px"
                                h="120px"
                                bg={useColorModeValue('teal.50','teal.900')}
                                borderRadius="full"
                                display="flex"
                                align="center"
                                justify="center"
                                mb={6}
                            >
                                <IoPeopleOutline size="48px" color={useColorModeValue('teal.500','teal.300')} />
                            </Box>
                            <Text fontSize={{ base: "xl", md: "2xl" }} color={useColorModeValue('gray.600','gray.300')} fontWeight="semibold">
                                اختر محادثة للبدء
                            </Text>
                            <Text fontSize={{ base: "sm", md: "md" }} color={useColorModeValue('gray.500','gray.400')} mt={2}>
                                يمكنك اختيار مجموعة لبدء محادثة.
                            </Text>
                        </Flex>
                    ) : isLoadingHistory && !getMessagesForChat(getActiveChatGroupId())?.length ? (
                        <Flex h="full" align="center" justify="center" direction="column">
                            <VStack spacing={4}>
                                <Spinner color="teal.500" size="lg" />
                                <Text fontSize="md" color={useColorModeValue('gray.500','gray.400')}>
                                    جاري تحميل الرسائل...
                                </Text>
                            </VStack>
                        </Flex>
                    ) : (
                        <MainChatArea
                            chatInfo={activeGroup}
                            messages={getMessagesForChat(getActiveChatGroupId())}
                            onSendMessage={onSendMessage}
                            onBack={handleBackToSidebar}
                            isMobile={isMobile}
                            canTogglePermission={canTogglePermission && activeChatType === 'group'}
                            allowStudentSend={!!allowStudentSend}
                            onTogglePermission={handleTogglePermission}
                            togglingPermission={togglingPermission}
                            inputDisabled={inputDisabled || isSending}
                            onOpenMembers={openMembers}
                            canViewMembers={canViewMembers}
                            onSendAttachment={onSendAttachment}
                            replyTarget={replyTarget}
                            onSelectReply={setReplyTarget}
                            isSending={isSending}
                            onEditMessage={startEditMessage}
                            onDeleteMessage={handleDeleteMessage}
                            editingMessage={editingMessage}
                            editText={editText}
                            setEditText={setEditText}
                            onSaveEdit={handleEditMessage}
                            onCancelEdit={cancelEdit}
                            isEditing={isEditing}
                            isDeleting={isDeleting}
                        />
                    )}
                </Box>
            </Flex>
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
        </Box>
    );
};

export default TeacherChat;