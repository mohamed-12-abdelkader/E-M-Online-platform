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
    const bgColor = useColorModeValue('#ECE5DD', '#1A202C');
    const patternOpacity = useColorModeValue(0.25, 0.06);
    // نستخدم نفس النمط لكن نعدل الشفافية حسب المود
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
    const GroupIcon = getGroupIcon(chat.name, index);
    const groupColor = getGroupColor(chat.name, index);
    
    return (
        <Flex
            align="center"
            p={4}
            borderRadius="xl"
            _hover={{ 
                bg: useColorModeValue('gray.50', 'gray.700'), 
                cursor: 'pointer',
                transform: 'translateX(4px)',
                boxShadow: 'lg'
            }}
            bg={isActive ? useColorModeValue(`${groupColor}.50`, `${groupColor}.900`) : 'transparent'}
            borderLeft={isActive ? '4px solid' : '4px solid transparent'}
            borderColor={isActive ? `${groupColor}.500` : 'transparent'}
            onClick={() => onSelectChat(type, chat.id)}
            position="relative"
            transition="all 0.3s ease"
            mb={2}
            boxShadow={isActive ? 'md' : 'sm'}
            _before={{
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                borderRadius: 'xl',
                bg: isActive ? 
                    `linear-gradient(135deg, ${useColorModeValue(`${groupColor}.100`, `${groupColor}.800`)}, transparent)` : 
                    'transparent',
                zIndex: -1
            }}
        >
            {type === 'group' ? (
                <Box
                    position="relative"
                    w="48px"
                    h="48px"
                    borderRadius="full"
                    bg={isActive ? 
                        `linear-gradient(135deg, ${useColorModeValue(`${groupColor}.200`, `${groupColor}.700`)}, ${useColorModeValue(`${groupColor}.300`, `${groupColor}.600`)})` : 
                        `linear-gradient(135deg, ${useColorModeValue('gray.100', 'gray.600')}, ${useColorModeValue('gray.200', 'gray.500')})`
                    }
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    boxShadow="md"
                    _hover={{
                        transform: 'scale(1.05)',
                        boxShadow: 'lg'
                    }}
                    transition="all 0.2s ease"
                >
                    <GroupIcon 
                        fontSize="1.5rem" 
                        color={isActive ? 
                            useColorModeValue(`${groupColor}.700`, `${groupColor}.200`) : 
                            useColorModeValue('gray.600', 'gray.300')
                        } 
                    />
                    {isActive && (
                        <Box
                            position="absolute"
                            top="-2px"
                            right="-2px"
                            w="12px"
                            h="12px"
                            borderRadius="full"
                            bg={`${groupColor}.500`}
                            border="2px solid"
                            borderColor={useColorModeValue('white', 'gray.800')}
                        />
                    )}
                </Box>
            ) : (
                <Avatar size="md" src={chat.avatar} name={chat.name} />
            )}
            <Box ml={4} flex="1" overflow="hidden" minW={0}>
                <Flex justify="space-between" align="center" mb={2}>
                    <Text 
                        fontWeight={isActive ? "bold" : "semibold"} 
                        fontSize="md" 
                        noOfLines={1}
                        color={isActive ? 
                            useColorModeValue(`${groupColor}.700`, `${groupColor}.200`) : 
                            useColorModeValue('gray.800', 'gray.200')
                        }
                    >
                        {chat.name}
                    </Text>
                    <Text 
                        fontSize="xs" 
                        color={useColorModeValue('gray.500', 'gray.400')}
                        fontWeight="medium"
                    >
                        {chat.time}
                    </Text>
                </Flex>
                <Text 
                    fontSize="sm" 
                    color={isActive ? 
                        useColorModeValue(`${groupColor}.600`, `${groupColor}.300`) : 
                        useColorModeValue('gray.600', 'gray.400')
                    } 
                    noOfLines={2}
                    lineHeight="1.4"
                >
                    {chat.lastMessage || 'لا توجد رسائل'}
                </Text>
            </Box>
            {chat.unread > 0 && (
                <Badge
                    colorScheme={groupColor}
                    borderRadius="full"
                    px={3}
                    py={1}
                    fontSize="xs"
                    fontWeight="bold"
                    minW="24px"
                    h="24px"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    boxShadow="md"
                    _hover={{
                        transform: 'scale(1.1)'
                    }}
                    transition="all 0.2s ease"
                >
                    {chat.unread > 99 ? '99+' : chat.unread}
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
        <Box p={{ base: 3, md: 4 }} h="full" display="flex" flexDirection="column">
            {/* Header */}
            <Box mb={4}>
                <Text 
                    fontSize={{ base: "lg", md: "xl" }} 
                    fontWeight="bold" 
                    color={useColorModeValue('gray.700','gray.200')} 
                    mb={1}
                >
                    المحادثات
                </Text>
                <Text fontSize="sm" color={useColorModeValue('gray.500','gray.400')}>
                    {groups?.length || 0} مجموعة متاحة
                </Text>
            </Box>

            {/* شريط البحث */}
            <InputGroup mb={4}>
                <InputLeftElement pointerEvents="none">
                    <Icon as={IoSearchOutline} color={useColorModeValue('gray.400','gray.500')} />
                </InputLeftElement>
                <Input
                    placeholder="ابحث عن محادثة..."
                    borderRadius="full"
                    bg={useColorModeValue('gray.50','gray.700')}
                    border="1px solid"  
                    borderColor={useColorModeValue('gray.200','gray.600')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    _focus={{
                        borderColor: 'teal.500',
                        boxShadow: '0 0 0 1px teal.500'
                    }}
                />
            </InputGroup>

            {/* جزء المجموعات */}
            <Box flex="1" overflowY="auto">
                <Text 
                    fontSize="sm" 
                    fontWeight="semibold" 
                    color={useColorModeValue('gray.600','gray.300')} 
                    mb={3}
                    px={2}
                >
                    مجموعات الصفوف
                </Text>
                <VStack align="stretch" spacing={1}>
                    {filteredGroups.length > 0 ? (
                        filteredGroups.map((chat, index) => (
                            <ChatListItem
                                key={chat.id}
                                chat={chat}
                                type="group"
                                onSelectChat={() => onSelectGroup(chat.id)}
                                isActive={activeGroupId === chat.id}
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
            </Box>
        </Box>
    );
};

// --- 4. مكون ChatHeader ---
const ChatHeader = ({ chatInfo, onBack, isMobile, canTogglePermission, allowStudentSend, onTogglePermission, togglingPermission, onOpenMembers, canViewMembers }) => {
    if (!chatInfo) return null;

    return (
        <Flex
            p={{ base: 3, md: 4 }}
            borderBottom="1px solid"
            borderColor={useColorModeValue('gray.200','gray.700')}
            align="center"
            bg={useColorModeValue('white','gray.800')}
            boxShadow="sm"
            minH="70px"
        >
            {isMobile && (
                <IconButton
                    icon={<IoArrowBackOutline />}
                    onClick={onBack}
                    variant="ghost"
                    aria-label="العودة للمحادثات"
                    mr={2}
                    size="md"
                    _hover={{ bg: useColorModeValue('gray.100', 'gray.700') }}
                />
            )}
            
            <Avatar 
                size="md" 
                icon={<IoPeopleOutline fontSize="1.5rem" />} 
                bg={useColorModeValue('teal.100','teal.900')} 
                color={useColorModeValue('teal.700','teal.200')} 
            />
            
            <Box ml={3} flex="1" minW={0}>
                <Text 
                    fontSize={{ base: "md", md: "lg" }} 
                    fontWeight="semibold" 
                    noOfLines={1}
                    color={useColorModeValue('gray.800', 'gray.200')}
                >
                    {chatInfo.name}
                </Text>
                <Text 
                    fontSize="sm" 
                    color={useColorModeValue('gray.500','gray.400')}
                >
                    دردشة صفية جماعية
                </Text>
            </Box>

            <HStack spacing={2} align="center">
                {canViewMembers && (
                    <IconButton
                        icon={<IoPersonOutline />}
                        onClick={onOpenMembers}
                        variant="ghost"
                        aria-label="عرض الأعضاء"
                        size="md"
                        _hover={{ bg: useColorModeValue('gray.100', 'gray.700') }}
                    />
                )}
                
                {canTogglePermission && (
                    <HStack spacing={2} display={{ base: 'none', md: 'flex' }}>
                        <Text fontSize="sm" color={useColorModeValue('gray.600', 'gray.300')}>
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
                    _hover={{ bg: useColorModeValue('gray.100', 'gray.700') }}
                />
            </HStack>
        </Flex>
    );
};

// --- 5. مكون ChatMessage ---
const ChatMessage = ({ message, onReply, onEdit, onDelete, isEditing, isDeleting }) => {
    const isMine = message.isMine;
    const bgColor = isMine ? 
        'linear-gradient(135deg, #38B2AC, #319795)' : 
        useColorModeValue('white', 'gray.700');
    const textColor = isMine ? 'white' : useColorModeValue('gray.800', 'gray.200');
    const alignment = isMine ? 'flex-end' : 'flex-start';
    const hasAttachment = !!message.attachment_url;
    const attachmentType = message.attachment_type;

    return (
        <Flex justify={alignment} mb={4} px={2}>
            <Box
                bg={isMine ? 'transparent' : bgColor}
                backgroundImage={isMine ? bgColor : 'none'}
                color={textColor}
                px={5}
                py={4}
                borderRadius="2xl"
                maxWidth="80%"
                position="relative"
                boxShadow={isMine ? 
                    '0 6px 20px rgba(56, 178, 172, 0.25)' : 
                    useColorModeValue('0 4px 15px rgba(0,0,0,0.08)', '0 4px 15px rgba(0,0,0,0.25)')
                }
                _hover={{
                    transform: 'translateY(-2px)',
                    boxShadow: isMine ? 
                        '0 8px 25px rgba(56, 178, 172, 0.35)' : 
                        useColorModeValue('0 6px 20px rgba(0,0,0,0.12)', '0 6px 20px rgba(0,0,0,0.35)')
                }}
                transition="all 0.3s ease"
                border={isMine ? 'none' : '1px solid'}
                borderColor={useColorModeValue('gray.100', 'gray.600')}
                sx={{
                    // تحسين الذيل
                    ...(isMine ? {
                        borderBottomRightRadius: '8px',
                        '&::after': {
                            content: '""',
                            position: 'absolute',
                            bottom: 0,
                            right: '-10px',
                            width: 0,
                            height: 0,
                            borderLeft: '10px solid #38B2AC',
                            borderTop: '10px solid transparent',
                            borderBottom: '10px solid transparent',
                        }
                    } : {
                        borderBottomLeftRadius: '8px',
                        '&::after': {
                            content: '""',
                            position: 'absolute',
                            bottom: 0,
                            left: '-10px',
                            width: 0,
                            height: 0,
                            borderRight: '10px solid',
                            borderRightColor: useColorModeValue('white', 'gray.700'),
                            borderTop: '10px solid transparent',
                            borderBottom: '10px solid transparent',
                        }
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
                            colorScheme={isMine ? 'whiteAlpha' : 'teal'} 
                            onClick={() => onReply?.(message)}
                            _hover={{
                                bg: isMine ? 'whiteAlpha.300' : 'teal.100',
                                transform: 'scale(1.15)',
                                boxShadow: 'md'
                            }}
                            transition="all 0.2s"
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
                                            transform: 'translateX(4px)'
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
                                            transform: 'translateX(4px)'
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
                            color={isMine ? 'whiteAlpha.800' : 'gray.500'} 
                            textAlign="end"
                            fontWeight="500"
                        >
                    {message.timestamp}
                </Text>
                        {message.isEdited && (
                            <Text 
                                fontSize="xs" 
                                color={isMine ? 'whiteAlpha.700' : 'gray.400'} 
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
        <VStack flex="1" p={4} spacing={2} overflowY="auto" align="stretch" bg={useColorModeValue('transparent','gray.900')}>
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
            colorScheme="teal"
            variant="solid"
            aria-label="إرسال الرسالة"
            size="md"
            onClick={onSend}
            isDisabled={disabled}
            isLoading={isLoading}
            borderRadius="full"
            bg="linear-gradient(135deg, #38B2AC, #319795)"
            _hover={{
                transform: 'scale(1.1)',
                boxShadow: '0 6px 16px rgba(56, 178, 172, 0.5)',
                bg: 'linear-gradient(135deg, #319795, #2C7A7B)'
            }}
            _active={{
                transform: 'scale(0.95)'
            }}
            _disabled={{
                bg: 'gray.300',
                cursor: 'not-allowed',
                transform: 'none',
                boxShadow: 'none'
            }}
            transition="all 0.2s ease"
            boxShadow="0 2px 8px rgba(56, 178, 172, 0.3)"
        />
    );
};

// --- 8. مكون MessageInputBar ---
const MessageInputBar = ({ onSendMessage, onSendAttachment, disabled, replyTarget, onCancelReply, isSending, editingMessage, editText, setEditText, onSaveEdit, onCancelEdit }) => {
    const [message, setMessage] = useState('');
    const fileInputRef = useRef(null);
    const toast = useToast();
    const [pendingAttachment, setPendingAttachment] = useState(null);

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
        <Box>
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
                p={{ base: 3, md: 4 }} 
                bg={useColorModeValue('white','gray.800')} 
                align="center" 
                borderTop="1px solid" 
                borderColor={useColorModeValue('gray.200','gray.700')}
                gap={3}
                boxShadow="0 -4px 12px rgba(0,0,0,0.05)"
                position="relative"
                _before={{
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '1px',
                    bg: 'linear-gradient(90deg, transparent, teal.300, transparent)'
                }}
            >
                {/* قائمة الإرفاق */}
                <Menu>
                    <MenuButton
                        as={IconButton}
                        icon={<IoAttachOutline />}
                        variant="ghost"
                        aria-label="إرفاق ملف"
                        size="lg"
                        color="gray.600"
                        borderRadius="full"
                        isDisabled={disabled}
                        _hover={{
                            bg: useColorModeValue('gray.100', 'gray.700'),
                            transform: 'scale(1.05)'
                        }}
                        transition="all 0.2s"
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
                    bg={useColorModeValue('gray.50','gray.700')} 
                    borderRadius="full"
                    boxShadow="sm"
                    _hover={{
                        boxShadow: 'md'
                    }}
                    transition="all 0.2s ease"
                >
                    <Input
                        placeholder={editingMessage ? "عدل الرسالة..." : "اكتب رسالة..."}
                        borderRadius="full"
                        value={editingMessage ? editText : message}
                        onChange={(e) => editingMessage ? setEditText(e.target.value) : setMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        pr="3.5rem"
                        isDisabled={disabled}
                        border="none"
                        bg="transparent"
                        _focus={{
                            boxShadow: '0 0 0 2px teal.400',
                            bg: useColorModeValue('white', 'gray.600')
                        }}
                        _hover={{
                            bg: useColorModeValue('white', 'gray.600')
                        }}
                        transition="all 0.2s ease"
                    />
                    <InputRightElement width="3.5rem" pr={2}>
                        <SendButton
                            onSend={editingMessage ? handleSaveEdit : handleSend}
                            disabled={disabled || (editingMessage ? !editText.trim() : !message.trim())}
                            isLoading={isSending}
                        />
                    </InputRightElement>
                </InputGroup>
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
            h="calc(100vh - 80px)" 
            mt={{ base: "20px", md: "30px" }} 
            bg={useColorModeValue('gray.50','gray.900')} 
            className='chat-page'
            borderRadius={{ base: "none", md: "lg" }}
            overflow="hidden"
            boxShadow={{ base: "none", md: "xl" }}
        >
            <Flex h="full" direction={{ base: "column", md: "row" }}>
                {/* Sidebar */}
                <Box
                    w={{ base: '100%', md: '350px', lg: '380px' }}
                    h={{ base: showSidebar ? '50%' : '0', md: '100%' }}
                    bg={useColorModeValue('white','gray.800')}
                    borderEnd={{ base: 'none', md: '1px solid' }}
                    borderColor={useColorModeValue('gray.200','gray.700')}
                    overflowY="auto"
                    transition="all 0.3s ease"
                    transform={{ base: showSidebar ? 'translateY(0)' : 'translateY(-100%)', md: 'translateY(0)' }}
                    position={{ base: 'absolute', md: 'relative' }}
                    zIndex={{ base: 10, md: 1 }}
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
                            onSelectGroup={handleChatSelect}
                            activeGroupId={activeGroupId}
                        />
                    )}
                </Box>

                {/* Main Chat Area */}
                <Box
                    flex="1"
                    h="full"
                    bg={useColorModeValue('white','gray.800')}
                    style={useChatBackground()}
                    position="relative"
                    display={{ base: !showSidebar ? 'block' : 'none', md: 'block' }}
                >
                    {!activeGroupId ? (
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
                    ) : isLoadingHistory && !messagesByGroup[activeGroupId]?.length ? (
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