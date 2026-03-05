import {
  Box,
  Flex,
  Heading,
  Spinner,
  Text,
  Badge,
  IconButton,
  useColorModeValue,
} from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import { FaPlay, FaExternalLinkAlt } from "react-icons/fa";
import baseUrl from "../../api/baseUrl";

const STREAM_REDIRECT_URL = import.meta.env.VITE_STREAM_REDIRECT_URL;

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

const fetchCourseStreams = async (courseId) => {
  const res = await baseUrl.get(`/api/meeting/course/${courseId}`, {
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  });
  return res.data;
};

const StudentStreamsList = ({ courseId }) => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["studentCourseStreams", courseId],
    queryFn: () => fetchCourseStreams(courseId),
  });

  const subTextColor = useColorModeValue("gray.500", "gray.400");
  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.100", "gray.700");
  const streams = data?.meetings || [];

  if (isLoading) {
    return (
      <Flex justify="center" py={10} direction="column" align="center">
        <Spinner size="lg" color="blue.500" thickness="3px" />
        <Text mt={4} color="gray.500" fontWeight="medium">جاري تحميل الجلسات...</Text>
      </Flex>
    );
  }

  if (isError) {
    return (
      <Box textAlign="center" py={10} bg={useColorModeValue("red.50", "red.900")} borderRadius="xl" border="1px dashed" borderColor={useColorModeValue("red.200", "red.700")}>
        <Text color={useColorModeValue("red.600", "red.200")} fontWeight="bold">
          حدث خطأ أثناء تحميل البيانات
        </Text>
      </Box>
    );
  }

  return (
    <Box mt={6}>
      <Heading as="h2" size="lg" mb={6} textAlign="center" color={useColorModeValue("gray.700", "white")}>
        الجلسات المباشرة
      </Heading>

      {streams.length > 0 ? (
        <Flex direction="column" gap={4}>
          {streams.map((stream) => (
            <Flex
              key={stream.id}
              p={{ base: 4, md: 5 }}
              borderWidth="1px"
              borderColor={stream.status === 'started' ? "red.200" : borderColor}
              borderRadius="2xl"
              boxShadow={stream.status === 'started' ? "0 4px 20px rgba(229, 62, 62, 0.15)" : "sm"}
              bg={cardBg}
              direction={{ base: "column", md: "row" }}
              align={{ base: "stretch", md: "center" }}
              justify="space-between"
              gap={{ base: 4, md: 6 }}
              transition="all 0.3s ease"
              _hover={{ transform: "translateY(-2px)", boxShadow: "md" }}
              position="relative"
              overflow="hidden"
            >
              {stream.status === 'started' && (
                <Box
                  position="absolute"
                  top={0}
                  right={0}
                  width="4px"
                  height="100%"
                  bg="red.500"
                />
              )}

              {/* Left side: title + status */}
              <Flex gap={4} flex={1} align="center">
                <Flex
                  align="center"
                  justify="center"
                  w={{ base: 12, md: 14 }}
                  h={{ base: 12, md: 14 }}
                  borderRadius="2xl"
                  bg={stream.status === 'started' ? useColorModeValue("red.50", "red.900") : useColorModeValue("blue.50", "blue.900")}
                  color={stream.status === 'started' ? useColorModeValue("red.500", "red.300") : useColorModeValue("blue.500", "blue.300")}
                  flexShrink={0}
                >
                  <FaPlay size="20px" />
                </Flex>
                <Flex direction="column">
                  <Text fontSize="md" fontWeight="bold" color={useColorModeValue("gray.800", "white")}>
                    {stream.title}
                  </Text>
                  <Badge
                    mt={1}
                    colorScheme={statusColor[stream.status]}
                    width="fit-content"
                    px={2}
                    py={0.5}
                    borderRadius="md"
                    fontSize="xs"
                    variant="subtle"
                  >
                    {statusLabel[stream.status]}
                  </Badge>
                </Flex>
              </Flex>

              {/* Right side: student actions */}
              <Flex align="center" gap={2} mt={{ base: 2, md: 0 }}>
                {stream.status === "started" && (
                  <IconButton
                    as="a"
                    href={`${STREAM_REDIRECT_URL}/${stream.id
                      }?t=${localStorage.getItem("token")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    icon={<FaPlay />}
                    aria-label="دخول البث"
                    colorScheme="red"
                    size="md"
                    borderRadius="xl"
                    boxShadow="0 4px 12px rgba(229, 62, 62, 0.4)"
                    _hover={{ transform: "scale(1.05)" }}
                    w={{ base: "full", sm: "auto" }}
                  />
                )}

                {stream.status === "ended" && stream.egress_url && (
                  <IconButton
                    as="a"
                    href={stream.egress_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    icon={<FaExternalLinkAlt />}
                    aria-label="مشاهدة التسجيل"
                    colorScheme="purple"
                    size="md"
                    borderRadius="xl"
                    variant="outline"
                    w={{ base: "full", sm: "auto" }}
                  />
                )}
              </Flex>
            </Flex>
          ))}
        </Flex>
      ) : (
        <Flex
          direction="column"
          align="center"
          justify="center"
          py={16}
          bg={cardBg}
          borderRadius="2xl"
          border="2px dashed"
          borderColor={borderColor}
        >
          <Box p={4} bg={useColorModeValue("gray.50", "gray.700")} borderRadius="full" mb={4}>
            <FaPlay color={useColorModeValue("var(--chakra-colors-gray-400)", "var(--chakra-colors-gray-500)")} size={30} />
          </Box>
          <Text color={useColorModeValue("gray.500", "gray.400")} fontSize="lg" fontWeight="bold">لا توجد جلسات مباشرة حالياً</Text>
          <Text color={useColorModeValue("gray.400", "gray.500")} fontSize="sm">عند بدء بث مباشر جديد سيظهر هنا</Text>
        </Flex>
      )}
    </Box>
  );
};

export default StudentStreamsList;
