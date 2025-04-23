import React, { useState } from 'react';
import {
  ChakraProvider,
  Box,
  Flex,
  Text,
  VStack,
  HStack,
  Input,
  Button,
  Avatar,
  useColorMode,
  useColorModeValue,
  IconButton,
  extendTheme,
  ColorModeScript,
} from '@chakra-ui/react';

import {
  FiSend,
  FiMoon,
  FiSun,
} from 'react-icons/fi';
import { BsChatDots } from 'react-icons/bs';
import { FaUserGraduate } from 'react-icons/fa';
import { AiOutlineRobot } from 'react-icons/ai';

const theme = extendTheme({
  config: {
    initialColorMode: 'light',
    useSystemColorMode: true,
  },
});

const subjects = [
  { id: 1, name: 'الرياضيات' },
  { id: 2, name: 'اللغة العربية' },
  { id: 3, name: 'العلوم' },
  { id: 4, name: 'التاريخ' },
];

const mockChats = {
  1: [
    { from: 'student', text: 'ما هو التفاضل؟' },
    { from: 'ai', text: 'التفاضل هو فرع من فروع الرياضيات يدرس التغير في الكميات.' },
  ],
  2: [
    { from: 'student', text: 'ما معنى الجملة الاسمية؟' },
    { from: 'ai', text: 'هي الجملة التي تبدأ باسم وتتكون من مبتدأ وخبر.' },
  ],
  3: [],
  4: [],
};

const ChatPage = () => {
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [chats, setChats] = useState(mockChats);
  const [input, setInput] = useState('');
  const { colorMode, toggleColorMode } = useColorMode();

  const bgSidebar = useColorModeValue('gray.100', 'gray.800');
  const bgChat = useColorModeValue('gray.50', 'gray.700');
  const bubbleStudent = useColorModeValue('teal.100', 'teal.600');
  const bubbleAI = useColorModeValue('gray.200', 'gray.600');

  const handleSend = () => {
    if (!input || selectedSubject === null) return;
    const updated = [...chats[selectedSubject], { from: 'student', text: input }];
    updated.push({
      from: 'ai',
      text: `إجابة تلقائية للسؤال: ${input}`,
    });
    setChats({ ...chats, [selectedSubject]: updated });
    setInput('');
  };

  return (
    <ChakraProvider theme={theme}>
    
      <Flex h="100vh" direction={{ base: 'column', md: 'row' }} className='mt-[80px]'>
        {/* Sidebar */}
        <Box
          w={{ base: '100%', md: '300px' }}
          h={{ base: 'auto', md: '100vh' }}
          bg={bgSidebar}
          p={4}
        >
          <Flex justify="space-between" align="center" mb={4}>
            <Text fontSize="xl" fontWeight="bold">
              المحادثات
            </Text>
            
          </Flex>
          <VStack align="stretch" spacing={3}>
            {subjects.map((subject) => (
              <Box
                key={subject.id}
                p={3}
                bg={selectedSubject === subject.id ? 'teal.400' : useColorModeValue('white', 'gray.700')}
                color={selectedSubject === subject.id ? 'white' : 'inherit'}
                borderRadius="md"
                cursor="pointer"
                _hover={{ bg: 'teal.300', color: 'white' }}
                onClick={() => setSelectedSubject(subject.id)}
              >
                <HStack>
                  <BsChatDots />
                  <Text>{subject.name}</Text>
                </HStack>
              </Box>
            ))}
          </VStack>
        </Box>

        {/* Chat Area */}
        <Flex flex="1" direction="column" p={4} bg={bgChat}>
          {selectedSubject ? (
            <>
              <Text fontSize="lg" fontWeight="bold" mb={3}>
                محادثة: {subjects.find((s) => s.id === selectedSubject)?.name}
              </Text>

              <VStack
                flex="1"
                overflowY="auto"
                spacing={4}
                align="stretch"
                p={2}
                mb={4}
              >
                {chats[selectedSubject].map((msg, idx) => (
                  <HStack
                    key={idx}
                    alignSelf={msg.from === 'student' ? 'flex-end' : 'flex-start'}
                    bg={msg.from === 'student' ? bubbleStudent : bubbleAI}
                    px={4}
                    py={2}
                    borderRadius="lg"
                    maxW="80%"
                    spacing={3}
                  >
                    {msg.from === 'ai' && <AiOutlineRobot />}
                    <Text>{msg.text}</Text>
                    {msg.from === 'student' && <FaUserGraduate />}
                  </HStack>
                ))}
              </VStack>

              {/* Input */}
              <HStack mt="auto">
                <Input
                  placeholder="اكتب رسالتك..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  bg={useColorModeValue('white', 'gray.600')}
                />
                <Button colorScheme="teal" onClick={handleSend}>
                  <FiSend />
                </Button>
              </HStack>
            </>
          ) : (
            <Flex align="center" justify="center" flex="1">
              <Text fontSize="xl">اختر مادة لبدء المحادثة</Text>
            </Flex>
          )}
        </Flex>
      </Flex>
    </ChakraProvider>
  );
};

export default ChatPage;
