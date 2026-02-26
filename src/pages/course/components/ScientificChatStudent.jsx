import React, { useState, useEffect, useRef, useCallback } from "react";
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

const HISTORY_PAGE_SIZE = 20;

/**
 * شات الدعم العلمي للطالب
 * يتوافق مع Scientific Chatbot API - Student:
 * - GET  /api/scientific-chatbot/courses/:courseId/history?limit=20&beforeId=  — سجل المحادثة (أحدث لأقدم)
 * - POST /api/scientific-chatbot/courses/:courseId/ask { question }           — طرح سؤال، الاستجابة: answer + retrieved_chunks
 */
const ScientificChatStudent = ({ courseId, token }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [historyLoadingMore, setHistoryLoadingMore] = useState(false);
  const [hasMoreHistory, setHasMoreHistory] = useState(true);
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
      if (status === 400) {
        toast({
          title: "السؤال مطلوب",
          description: msg || "يرجى كتابة سؤال غير فارغ.",
          status: "warning",
          isClosable: true,
        });
      } else if (status === 404) {
        toast({
          title: "لا يوجد محتوى علمي",
          description: msg || "هذا الكورس لا يحتوي على محتوى مرفوع بعد. اطلب من المدرس رفع المواد.",
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

  const loadMoreHistory = useCallback(async () => {
    if (!courseId || !token || historyLoadingMore || !hasMoreHistory || history.length === 0) return;
    const lastId = history[history.length - 1]?.id;
    if (!lastId) return;
    setHistoryLoadingMore(true);
    try {
      const response = await baseUrl.get(
        `/api/scientific-chatbot/courses/${courseId}/history`,
        { params: { limit: HISTORY_PAGE_SIZE, beforeId: lastId }, headers: { Authorization: `Bearer ${token}` } }
      );
      const list = response.data?.history ?? [];
      const newList = Array.isArray(list) ? list : [];
      setHasMoreHistory(newList.length >= HISTORY_PAGE_SIZE);
      setHistory((prev) => [...prev, ...newList]);
    } catch {
      setHasMoreHistory(false);
    } finally {
      setHistoryLoadingMore(false);
    }
  }, [courseId, token, historyLoadingMore, hasMoreHistory, history]);

  return (
    <VStack spacing={{ base: 3, md: 4 }} align="stretch" h="100%">
      <HStack justify="space-between" align="center">
        <Heading size={{ base: "sm", md: "md" }} color={headingColor} display="flex" alignItems="center" gap={2}>
          <Icon as={FaRobot} />
          المساعد العلمي
        </Heading>
      </HStack>
      <Text fontSize={{ base: "xs", md: "sm" }} color={subTextColor}>
        اسأل أي سؤال عن محتوى الكورس وسيجيبك المساعد بناءً على المواد المرفوعة.
      </Text>
      <Divider borderColor={borderColor} />

      <Box
        flex={1}
        minH={{ base: "240px", md: "320px" }}
        maxH={{ base: "50vh", md: "500px" }}
        overflowY="auto"
        bg={sectionBg}
        borderRadius="xl"
        p={{ base: 3, md: 4 }}
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
                                  key={chunk.file_id != null ? `f${chunk.file_id}-${chunk.chunk_index ?? idx}` : idx}
                                  fontSize="xs"
                                  p={2}
                                  bg={cardBg}
                                  borderRadius="md"
                                  borderWidth="1px"
                                  borderColor={borderColor}
                                >
                                  {(chunk.file_id != null || chunk.chunk_index != null) && (
                                    <Flex gap={2} mb={1}>
                                      {chunk.file_id != null && (
                                        <Badge size="sm" colorScheme="blue">
                                          ملف #{chunk.file_id}
                                        </Badge>
                                      )}
                                      {chunk.chunk_index != null && (
                                        <Badge size="sm" colorScheme="gray">
                                          جزء {chunk.chunk_index + 1}
                                        </Badge>
                                      )}
                                    </Flex>
                                  )}
                                  <Text noOfLines={6} whiteSpace="pre-wrap">
                                    {chunk.chunk_text ?? chunk.content ?? "—"}
                                  </Text>
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
            {hasMoreHistory && history.length > 0 && (
              <Button
                size="sm"
                variant="ghost"
                colorScheme="blue"
                onClick={() => loadMoreHistory()}
                isLoading={historyLoadingMore}
                loadingText="جاري تحميل المزيد..."
              >
                تحميل رسائل أقدم
              </Button>
            )}
            <div ref={messagesEndRef} />
          </VStack>
        )}
      </Box>

      <form onSubmit={handleAsk} style={{ width: "100%" }}>
        <Flex
          direction={{ base: "column", sm: "row" }}
          align={{ base: "stretch", sm: "flex-end" }}
          gap={2}
          w="100%"
        >
          <Textarea
            placeholder="اكتب سؤالك عن محتوى الكورس..."
            value={questionInput}
            onChange={(e) => setQuestionInput(e.target.value)}
            minH={{ base: "40px", md: "44px" }}
            maxH="120px"
            resize="vertical"
            borderRadius="xl"
            borderColor={borderColor}
            _focus={{ borderColor: "blue.400", boxShadow: "0 0 0 1px var(--chakra-colors-blue-400)" }}
            isDisabled={sending}
            size={{ base: "sm", md: "md" }}
          />
          <IconButton
            aria-label="إرسال"
            icon={<Icon as={FaPaperPlane} />}
            colorScheme="blue"
            size={{ base: "md", md: "lg" }}
            borderRadius="full"
            onClick={handleAsk}
            isLoading={sending}
            type="submit"
            flexShrink={0}
          />
        </Flex>
      </form>
    </VStack>
  );
};

export default ScientificChatStudent;
