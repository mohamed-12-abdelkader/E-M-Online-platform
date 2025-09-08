import {
  Box,
  Flex,
  Heading,
  Link,
  Spinner,
  Text,
  Badge,
  IconButton,
  useColorModeValue,
  HStack,
  Input,
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
} from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import {
  FaPlay,
  FaExternalLinkAlt,
  FaTimesCircle,
  FaEdit,
  FaTrash,
} from "react-icons/fa";
import { useState } from "react";
import baseUrl from "../../api/baseUrl";
import { toast } from "react-toastify";

const STREAM_REDIRECT_URL = import.meta.env.VITE_STREAM_REDIRECT_URL;

const fetchStreams = async (courseId) => {
  const res = await baseUrl.get("/api/meeting/me", {
    params: { courseId },
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  });
  return res.data;
};

const statusLabel = {
  started: "مباشر",
  idle: "قيد الانتظار",
  ended: "انتهى",
};

const statusColor = {
  started: "green",
  idle: "orange",
  ended: "red",
};

const CourseStreamsList = ({ courseId }) => {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["myStreams", courseId],
    queryFn: () => fetchStreams(courseId),
  });

  const subTextColor = useColorModeValue("gray.500", "gray.400");
  const streams = data?.meetings || [];

  // state for edit & delete
  const [editingStream, setEditingStream] = useState(null);
  const [newTitle, setNewTitle] = useState("");
  const [deletingStream, setDeletingStream] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();

  const handleUpdateTitle = async () => {
    try {
      await baseUrl.put(
        `/api/meeting/${editingStream.id}`,
        { title: newTitle },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      toast.success("تم تحديث العنوان");
      setEditingStream(null);
      setNewTitle("");
      refetch();
    } catch {
      toast.error("فشل في تحديث العنوان");
    }
  };

  const handleCloseStream = async (id) => {
    try {
      await baseUrl.post(
        `/api/meeting/${id}/close`,
        {},
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      toast.success("تم إغلاق البث");
      refetch();
    } catch {
      toast.error("فشل في إغلاق البث");
    }
  };

  const handleDelete = async () => {
    if (!deletingStream) return;
    try {
      await baseUrl.delete(`/api/meeting/${deletingStream.id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      toast.success("تم حذف البث");
      setDeletingStream(null);
      onClose();
      refetch();
    } catch {
      toast.error("فشل في حذف البث");
    }
  };

  if (isLoading) {
    return (
      <Flex justify="center" py={10}>
        <Spinner size="lg" />
      </Flex>
    );
  }

  if (isError) {
    return (
      <Text color="red.500" mt={10} textAlign="center">
        حدث خطأ أثناء تحميل البيانات
      </Text>
    );
  }

  return (
    <Box maxW="1000px" mx="auto" mt={6}>
      <Heading as="h2" size="lg" mb={6} textAlign="center">
        جلسات الكورس
      </Heading>

      {streams.length > 0 ? (
        <Flex direction="column" gap={3}>
          {streams.map((stream) => (
            <Flex
              key={stream.id}
              p={3}
              borderWidth={1}
              borderRadius="md"
              boxShadow="sm"
              bg="white"
              align="center"
              justify="space-between"
              _hover={{ boxShadow: "md" }}
            >
              {/* Left side: title + status */}
              <Flex direction="column">
                <Text fontSize="md" fontWeight="bold">
                  {stream.title}
                </Text>
                <Badge
                  mt={1}
                  colorScheme={statusColor[stream.status]}
                  width="fit-content"
                >
                  {statusLabel[stream.status]}
                </Badge>
              </Flex>

              <Flex align="center" gap={2}>
                {(stream.status === "started" || stream.status === "idle") && (
                  <Button
                    as="a"
                    href={`${STREAM_REDIRECT_URL}/${
                      stream.id
                    }?t=${localStorage.getItem("token")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    leftIcon={<FaPlay />}
                    colorScheme="blue"
                    size="sm"
                  >
                    دخول البث
                  </Button>
                )}

                {stream.status === "ended" && stream.egress_url && (
                  <Button
                    as={Link}
                    href={stream.egress_url}
                    isExternal
                    leftIcon={<FaExternalLinkAlt />}
                    colorScheme="purple"
                    size="sm"
                  >
                    مشاهدة التسجيل
                  </Button>
                )}

                {(stream.status === "started" || stream.status === "idle") && (
                  <IconButton
                    icon={<FaTimesCircle />}
                    aria-label="إغلاق البث"
                    colorScheme="red"
                    variant="outline"
                    size="sm"
                    onClick={() => handleCloseStream(stream.id)}
                  />
                )}

                <IconButton
                  icon={<FaEdit />}
                  aria-label="تعديل"
                  colorScheme="teal"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setEditingStream(stream);
                    setNewTitle(stream.title);
                  }}
                />
                <IconButton
                  icon={<FaTrash />}
                  aria-label="حذف"
                  colorScheme="red"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setDeletingStream(stream);
                    onOpen();
                  }}
                />
              </Flex>
            </Flex>
          ))}
        </Flex>
      ) : (
        <Text color={subTextColor} textAlign="center" py={8}>
          لا توجد جلسات مباشرة متاحة حالياً
        </Text>
      )}

      {/* Edit Modal */}
      <Modal
        isOpen={!!editingStream}
        onClose={() => setEditingStream(null)}
        isCentered
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>تعديل العنوان</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <HStack>
              <Input
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
              />
            </HStack>
          </ModalBody>
          <ModalFooter>
            <Button
              variant="ghost"
              mr={3}
              onClick={() => setEditingStream(null)}
            >
              إلغاء
            </Button>
            <Button colorScheme="blue" onClick={handleUpdateTitle}>
              حفظ
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deletingStream}
        onClose={() => setDeletingStream(null)}
        isCentered
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>تأكيد الحذف</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text>
              هل أنت متأكد أنك تريد حذف البث بعنوان{" "}
              <strong>{deletingStream?.title}</strong>؟
            </Text>
          </ModalBody>
          <ModalFooter>
            <Button
              variant="ghost"
              mr={3}
              onClick={() => setDeletingStream(null)}
            >
              إلغاء
            </Button>
            <Button colorScheme="red" onClick={handleDelete}>
              حذف
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default CourseStreamsList;
