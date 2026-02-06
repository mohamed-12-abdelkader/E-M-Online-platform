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
  SimpleGrid,
  Badge,
  useToast,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  IconButton,
  Tooltip,
  Divider,
} from "@chakra-ui/react";
import {
  FaFileAlt,
  FaUpload,
  FaTrash,
  FaSync,
  FaRobot,
  FaPlus,
} from "react-icons/fa";
import baseUrl from "../../../api/baseUrl";

/**
 * تبويب إدارة الشات الدعم العلمي للمدرس
 * يتوافق مع API: /api/scientific-chatbot
 * - عرض ملفات المحتوى العلمي للكورس
 * - رفع ملفات (.txt, .md)
 * - حذف ملف
 * - إعادة توليد الـ embeddings
 */
const ScientificChatTab = ({ courseId, token }) => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState({
    isOpen: false,
    fileId: null,
    fileName: "",
  });
  const cancelRef = useRef();
  const fileInputRef = useRef(null);
  const toast = useToast();

  const headingColor = useColorModeValue("blue.700", "blue.200");
  const sectionBg = useColorModeValue("gray.50", "gray.800");
  const cardBg = useColorModeValue("white", "gray.700");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const subTextColor = useColorModeValue("gray.600", "gray.400");

  const fetchFiles = async () => {
    if (!courseId || !token) return;
    try {
      setLoading(true);
      setError(null);
      const response = await baseUrl.get(
        `/api/scientific-chatbot/courses/${courseId}/files`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setFiles(response.data?.files ?? []);
    } catch (err) {
      const msg =
        err?.response?.data?.error || err?.message || "فشل تحميل الملفات";
      setError(msg);
      setFiles([]);
      toast({
        title: "خطأ",
        description: msg,
        status: "error",
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, [courseId, token]);

  const handleUpload = async (e) => {
    const file = e?.target?.files?.[0];
    if (!file) return;
    const allowed = ["text/plain", "text/markdown"];
    const ext = (file.name || "").toLowerCase();
    const ok =
      allowed.includes(file.type) ||
      ext.endsWith(".txt") ||
      ext.endsWith(".md");
    if (!ok) {
      toast({
        title: "نوع ملف غير مدعوم",
        description: "المسموح: .txt أو .md فقط",
        status: "warning",
        isClosable: true,
      });
      return;
    }
    const formData = new FormData();
    formData.append("file", file);
    try {
      setUploading(true);
      await baseUrl.post(
        `/api/scientific-chatbot/courses/${courseId}/files`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      toast({
        title: "تم رفع الملف",
        description: "تمت معالجة الملف وإضافته للمساعد العلمي.",
        status: "success",
        isClosable: true,
      });
      fetchFiles();
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err) {
      const msg =
        err?.response?.data?.error || err?.message || "فشل رفع الملف";
      toast({
        title: "خطأ في الرفع",
        description: msg,
        status: "error",
        isClosable: true,
      });
    } finally {
      setUploading(false);
    }
  };

  const handleResetEmbeddings = async () => {
    try {
      setResetting(true);
      await baseUrl.post(
        `/api/scientific-chatbot/courses/${courseId}/reset-embeddings`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast({
        title: "تم إعادة توليد الـ embeddings",
        description: "تمت إعادة المعالجة بنجاح.",
        status: "success",
        isClosable: true,
      });
      fetchFiles();
    } catch (err) {
      const msg =
        err?.response?.data?.error ||
        err?.message ||
        "فشل إعادة توليد الـ embeddings";
      toast({
        title: "خطأ",
        description: msg,
        status: "error",
        isClosable: true,
      });
    } finally {
      setResetting(false);
    }
  };

  const openDeleteDialog = (file) => {
    setDeleteDialog({
      isOpen: true,
      fileId: file.id,
      fileName: file.file_name || file.fileName || "الملف",
    });
  };

  const handleDeleteConfirm = async () => {
    const { fileId } = deleteDialog;
    if (!fileId) {
      setDeleteDialog({ isOpen: false, fileId: null, fileName: "" });
      return;
    }
    try {
      setDeletingId(fileId);
      await baseUrl.delete(`/api/scientific-chatbot/files/${fileId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast({
        title: "تم حذف الملف",
        status: "success",
        isClosable: true,
      });
      fetchFiles();
      setDeleteDialog({ isOpen: false, fileId: null, fileName: "" });
    } catch (err) {
      const msg =
        err?.response?.data?.error || err?.message || "فشل حذف الملف";
      toast({
        title: "خطأ",
        description: msg,
        status: "error",
        isClosable: true,
      });
    } finally {
      setDeletingId(null);
    }
  };

  const formatSize = (bytes) => {
    if (bytes == null || bytes === 0) return "—";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDate = (d) => {
    if (!d) return "—";
    try {
      return new Date(d).toLocaleDateString("ar-EG", {
        year: "numeric",
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
    <VStack spacing={{ base: 4, md: 6 }} align="stretch">
      <HStack justify="space-between" align="center" flexWrap="wrap" gap={3}>
        <Heading size="md" color={headingColor} display="flex" alignItems="center" gap={2}>
          <Icon as={FaRobot} />
          إدارة الشات الدعم العلمي
        </Heading>
        <HStack spacing={2} flexWrap="wrap">
          <input
            ref={fileInputRef}
            type="file"
            accept=".txt,.md,text/plain,text/markdown"
            style={{ display: "none" }}
            onChange={handleUpload}
          />
          <Button
            size="sm"
            colorScheme="blue"
            leftIcon={<Icon as={FaUpload} />}
            onClick={() => fileInputRef.current?.click()}
            isLoading={uploading}
            loadingText="جاري الرفع..."
          >
            رفع ملف
          </Button>
          <Tooltip label="إعادة معالجة كل الملفات وتوليد الـ embeddings من جديد">
            <Button
              size="sm"
              variant="outline"
              colorScheme="teal"
              leftIcon={<Icon as={FaSync} />}
              onClick={handleResetEmbeddings}
              isLoading={resetting}
              loadingText="جاري..."
            >
              إعادة توليد الـ embeddings
            </Button>
          </Tooltip>
        </HStack>
      </HStack>

      <Text fontSize="sm" color={subTextColor}>
        ارفع ملفات المحتوى العلمي (نص أو markdown) لتمكين الطلاب من السؤال عن الكورس عبر المساعد العلمي.
      </Text>

      <Divider borderColor={borderColor} />

      {loading ? (
        <Center py={10}>
          <Spinner size="lg" colorScheme="blue" />
        </Center>
      ) : error ? (
        <Box
          p={6}
          bg={cardBg}
          borderRadius="xl"
          borderWidth="1px"
          borderColor={borderColor}
          textAlign="center"
        >
          <Text color="red.500">{error}</Text>
          <Button mt={3} size="sm" colorScheme="blue" onClick={fetchFiles}>
            إعادة المحاولة
          </Button>
        </Box>
      ) : files.length === 0 ? (
        <Box
          p={8}
          bg={sectionBg}
          borderRadius="xl"
          borderWidth="1px"
          borderColor={borderColor}
          textAlign="center"
        >
          <Icon as={FaFileAlt} boxSize={12} color="gray.400" mb={3} />
          <Text color={subTextColor} mb={4}>
            لا توجد ملفات محتوى علمي بعد. ارفع ملف .txt أو .md لتفعيل الدعم العلمي.
          </Text>
          <Button
            colorScheme="blue"
            leftIcon={<Icon as={FaPlus} />}
            onClick={() => fileInputRef.current?.click()}
            isLoading={uploading}
          >
            رفع أول ملف
          </Button>
        </Box>
      ) : (
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
          {files.map((file) => (
            <Box
              key={file.id}
              p={4}
              bg={cardBg}
              borderRadius="xl"
              borderWidth="1px"
              borderColor={borderColor}
              _hover={{ borderColor: "blue.300", shadow: "md" }}
              transition="all 0.2s"
            >
              <HStack justify="space-between" align="flex-start" mb={2}>
                <Icon as={FaFileAlt} color="blue.500" boxSize={5} mt={0.5} />
                <IconButton
                  aria-label="حذف الملف"
                  icon={<FaTrash />}
                  size="xs"
                  colorScheme="red"
                  variant="ghost"
                  onClick={() => openDeleteDialog(file)}
                />
              </HStack>
              <Text fontWeight="bold" noOfLines={2} fontSize="sm" mb={2}>
                {file.file_name || file.fileName || "بدون اسم"}
              </Text>
              <HStack fontSize="xs" color={subTextColor} spacing={3}>
                <span>{formatSize(file.file_size ?? file.fileSize)}</span>
                <span>•</span>
                <span>{formatDate(file.uploaded_at ?? file.uploadedAt)}</span>
              </HStack>
              {file.file_type === "application/pdf" && (
                <Badge mt={2} colorScheme="red" fontSize="xs">
                  PDF
                </Badge>
              )}
            </Box>
          ))}
        </SimpleGrid>
      )}

      <AlertDialog
        isOpen={deleteDialog.isOpen}
        leastDestructiveRef={cancelRef}
        onClose={() =>
          !deletingId &&
          setDeleteDialog({ isOpen: false, fileId: null, fileName: "" })
        }
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              تأكيد حذف الملف
            </AlertDialogHeader>
            <AlertDialogBody>
              هل أنت متأكد من حذف الملف "{deleteDialog.fileName}"؟ سيتم إزالة محتواه من المساعد العلمي.
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button
                ref={cancelRef}
                onClick={() =>
                  setDeleteDialog({ isOpen: false, fileId: null, fileName: "" })
                }
                isDisabled={!!deletingId}
              >
                إلغاء
              </Button>
              <Button
                colorScheme="red"
                onClick={handleDeleteConfirm}
                isLoading={deletingId !== null}
                mr={3}
              >
                حذف
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </VStack>
  );
};

export default ScientificChatTab;
