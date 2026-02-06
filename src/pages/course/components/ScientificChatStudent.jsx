import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  Button,
  Icon,
  useColorModeValue,
  Spinner,
  Center,
  useToast,
  Textarea,
  IconButton,
  Divider,
  Collapse,
  Badge,
  Flex,
} from "@chakra-ui/react";
import { FaRobot, FaPaperPlane, FaUserGraduate, FaChevronDown, FaChevronUp } from "react-icons/fa";
import baseUrl from "../../../api/baseUrl";

/**
 * شات الدعم العلمي للطالب - نفس الصفحة (تبويب الدعم العلمي)
 * يتوافق مع الـ doc: POST ask + GET history
 * - جلب سجل المحادثة (GET /courses/:courseId/history)
 * - طرح سؤال (POST /courses/:courseId/ask) وعرض الإجابة + retrieved_chunks اختياري
 */
const ScientificChatStudent = ({ courseId, token }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [questionInput, setQuestionInput] = useState("");
  const [error, setError] = useState(null);
  const [expandedChunks, setExpandedChunks] = useState({});
  const messagesEndRef = useRef(null);
  const toast = useToast();

  const headingColor = useColorModeValue("blue.700", "blue.200");
  const sectionBg = useColorModeValue("gray.50", "gray.800");
  const cardBg = useColorModeValue("white", "gray.700");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const subTextColor = useColorModeValue("gray.600", "gray.400");
  const studentBubble = useColorModeValue("blue.50", "blue.900");
  const botBubble = useColorModeValue("gray.100", "gray.600");

  const fetchHistory = async () => {
    if (!courseId || !token) return;
    try {
      setLoading(true);
      setError(null);
      const response = await baseUrl.get(
        `/api/scientific-chatbot/courses/${courseId}/history`,
        { params: { limit: 50 }, headers: { Authorization: `Bearer ${token}` } }
      );
      const list = response.data?.history ?? [];
      setHistory(Array.isArray(list) ? list : []);
    } catch (err) {
      const msg =
        err?.response?.data?.error || err?.message || "فشل تحميل سجل المحادثة";
      setError(msg);
      setHistory([]);
      if (err?.response?.status !== 403) {
        toast({ title: "خطأ", description: msg, status: "error", isClosable: true });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [courseId, token]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history]);

  const handleAsk = async (e) => {
    e?.preventDefault();
    const question = (questionInput || "").trim();
    if (!question || sending) return;
    try {
      setSending(true);
      setError(null);
      const response = await baseUrl.post(
        `/api/scientific-chatbot/courses/${courseId}/ask`,
        { question },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const { answer, retrieved_chunks } = response.data || {};
      setHistory((prev) => [
        {
          id: `new-${Date.now()}`,
          question,
          answer: answer || "",
          retrieved_chunks: retrieved_chunks || [],
          created_at: new Date().toISOString(),
        },
        ...prev,
      ]);
      setQuestionInput("");
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    } catch (err) {
      const status = err?.response?.status;
      const msg =
        err?.response?.data?.error ||
        err?.message ||
        "فشل في الحصول على الإجابة";
      setError(msg);
      if (status === 404) {
        toast({
          title: "لا يوجد محتوى علمي",
          description: "هذا الكورس لا يحتوي على محتوى علمي بعد. اطلب من المدرس رفع المواد.",
          status: "warning",
          isClosable: true,
        });
      } else {
        toast({ title: "خطأ", description: msg, status: "error", isClosable: true });
      }
    } finally {
      setSending(false);
    }
  };

  const toggleChunks = (id) => {
    setExpandedChunks((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const formatDate = (d) => {
    if (!d) return "";
    try {
      return new Date(d).toLocaleDateString("ar-EG", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (_) {
      return String(d);
    }
  };

  return (
    <VStack spacing={4} align="stretch" h="100%">
      <HStack justify="space-between" align="center">
        <Heading size="md" color={headingColor} display="flex" alignItems="center" gap={2}>
          <Icon as={FaRobot} />
          المساعد العلمي
        </Heading>
      </HStack>
      <Text fontSize="sm" color={subTextColor}>
        اسأل أي سؤال عن محتوى الكورس وسيجيبك المساعد بناءً على المواد المرفوعة.
      </Text>
      <Divider borderColor={borderColor} />

      <Box
        flex={1}
        minH="320px"
        maxH="500px"
        overflowY="auto"
        bg={sectionBg}
        borderRadius="xl"
        p={4}
        borderWidth="1px"
        borderColor={borderColor}
      >
        {loading ? (
          <Center py={10}>
            <Spinner size="lg" colorScheme="blue" />
          </Center>
        ) : error && history.length === 0 ? (
          <Center py={10} flexDirection="column" gap={3}>
            <Text color="red.500" textAlign="center">
              {error}
            </Text>
            <Button size="sm" colorScheme="blue" onClick={fetchHistory}>
              إعادة المحاولة
            </Button>
          </Center>
        ) : history.length === 0 ? (
          <Center py={10} flexDirection="column" gap={2}>
            <Icon as={FaRobot} boxSize={12} color="gray.400" />
            <Text color={subTextColor} textAlign="center">
              لا توجد رسائل بعد. اطرح سؤالك الأول عن محتوى الكورس.
            </Text>
          </Center>
        ) : (
          <VStack spacing={4} align="stretch" pb={2}>
            {history.map((item) => (
              <Box key={item.id}>
                <HStack align="flex-start" gap={2}>
                  <Icon as={FaUserGraduate} color="blue.500" mt={1} boxSize={4} />
                  <Box flex={1}>
                    <Box
                      bg={studentBubble}
                      borderRadius="lg"
                      px={4}
                      py={2}
                      borderWidth="1px"
                      borderColor={borderColor}
                    >
                      <Text fontWeight="medium" fontSize="sm">
                        {item.question}
                      </Text>
                    </Box>
                    <Text fontSize="xs" color={subTextColor} mt={1} mr={2}>
                      {formatDate(item.created_at)}
                    </Text>
                  </Box>
                </HStack>
                <HStack align="flex-start" gap={2} mt={2} mr={6}>
                  <Icon as={FaRobot} color="teal.500" mt={1} boxSize={4} />
                  <Box flex={1}>
                    <Box
                      bg={botBubble}
                      borderRadius="lg"
                      px={4}
                      py={2}
                      borderWidth="1px"
                      borderColor={borderColor}
                    >
                      <Text fontSize="sm" whiteSpace="pre-wrap">
                        {item.answer || "—"}
                      </Text>
                      {item.retrieved_chunks && item.retrieved_chunks.length > 0 && (
                        <Box mt={3}>
                          <Button
                            size="xs"
                            variant="ghost"
                            colorScheme="teal"
                            rightIcon={
                              <Icon
                                as={expandedChunks[item.id] ? FaChevronUp : FaChevronDown}
                              />
                            }
                            onClick={() => toggleChunks(item.id)}
                          >
                            المصادر ({item.retrieved_chunks.length})
                          </Button>
                          <Collapse in={!!expandedChunks[item.id]}>
                            <VStack align="stretch" gap={2} mt={2}>
                              {item.retrieved_chunks.map((chunk, idx) => (
                                <Box
                                  key={chunk.id || idx}
                                  fontSize="xs"
                                  p={2}
                                  bg={cardBg}
                                  borderRadius="md"
                                  borderWidth="1px"
                                  borderColor={borderColor}
                                >
                                  <Flex gap={2} mb={1}>
                                    {chunk.similarity_score != null && (
                                      <Badge size="sm" colorScheme="green">
                                        {(chunk.similarity_score * 100).toFixed(0)}%
                                      </Badge>
                                    )}
                                  </Flex>
                                  <Text noOfLines={4}>{chunk.content}</Text>
                                </Box>
                              ))}
                            </VStack>
                          </Collapse>
                        </Box>
                      )}
                    </Box>
                  </Box>
                </HStack>
              </Box>
            ))}
            <div ref={messagesEndRef} />
          </VStack>
        )}
      </Box>

      <form onSubmit={handleAsk} style={{ width: "100%" }}>
        <HStack align="flex-end" gap={2} w="100%">
          <Textarea
            placeholder="اكتب سؤالك عن محتوى الكورس..."
            value={questionInput}
            onChange={(e) => setQuestionInput(e.target.value)}
            minH="44px"
            maxH="120px"
            resize="vertical"
            borderRadius="xl"
            borderColor={borderColor}
            _focus={{ borderColor: "blue.400", boxShadow: "0 0 0 1px var(--chakra-colors-blue-400)" }}
            isDisabled={sending}
          />
          <IconButton
            aria-label="إرسال"
            icon={<Icon as={FaPaperPlane} />}
            colorScheme="blue"
            size="lg"
            borderRadius="full"
            onClick={handleAsk}
            isLoading={sending}
            type="submit"
          />
        </HStack>
      </form>
    </VStack>
  );
};

export default ScientificChatStudent;
