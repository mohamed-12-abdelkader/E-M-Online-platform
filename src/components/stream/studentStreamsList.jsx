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
  const streams = data?.meetings || [];

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
        الجلسات المباشرة
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

              {/* Right side: student actions */}
              <Flex align="center" gap={2}>
                {stream.status === "started" && (
                  <IconButton
                    as="a"
                    href={`${STREAM_REDIRECT_URL}/${
                      stream.id
                    }?t=${localStorage.getItem("token")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    icon={<FaPlay />}
                    aria-label="دخول البث"
                    colorScheme="blue"
                    size="sm"
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
                    size="sm"
                  />
                )}
              </Flex>
            </Flex>
          ))}
        </Flex>
      ) : (
        <Text color={subTextColor} textAlign="center" py={8}>
          لا توجد جلسات مباشرة متاحة حالياً
        </Text>
      )}
    </Box>
  );
};

export default StudentStreamsList;
