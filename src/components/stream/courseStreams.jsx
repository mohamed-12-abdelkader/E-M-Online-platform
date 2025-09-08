import {
  Box,
  Button,
  Flex,
  Heading,
  Spinner,
  Text,
  useColorModeValue,
  useDisclosure,
  TabPanel,
} from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import baseUrl from "../../api/baseUrl";
import CreateStreamModal from "./createModel";
import CourseStreamsList from "./courseStreamsList";

const STREAM_REDIRECT_URL = import.meta.env.VITE_STREAM_REDIRECT_URL;

function CourseStreams({ courseId, isAdmin, isTeacher, isStudent }) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const headingColor = useColorModeValue("blue.700", "blue.200");

  const {
    data: stream,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["currStream"],
    queryFn: async () => {
      try {
        const res = await baseUrl.get("/api/meeting/me/current", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        return res.data.meeting;
      } catch (err) {
        if (err?.response?.status === 404) return null;
        throw err;
      }
    },
    refetchInterval: 10000,
  });

  const hasActiveStream = stream && stream.status !== "ended";

  return (
    <TabPanel>
      {isLoading ? (
        <Flex justify="center" py={6}>
          <Spinner size="lg" />
        </Flex>
      ) : isError ? (
        <Text color="red.500" textAlign="center">
          حدث خطأ ما؟
        </Text>
      ) : (
        <Flex justify="space-between" align="center">
          <Heading size="md" color={headingColor} mb={4}>
            الجلسات المباشرة
          </Heading>

          {hasActiveStream ? (
            <Button
              as="a"
              href={`${STREAM_REDIRECT_URL}/${
                stream.id
              }?t=${localStorage.getItem("token")}`}
              target="_blank"
              rel="noopener noreferrer"
              colorScheme="blue"
            >
              دخول غرفة البث
            </Button>
          ) : (
            <Button colorScheme="green" onClick={onOpen}>
              انشاء جلسة
            </Button>
          )}
        </Flex>
      )}

      <CourseStreamsList courseId={courseId}/>

      <CreateStreamModal
        courseId={courseId}
        isOpen={isOpen}
        onClose={onClose}
        onSuccess={() => {
          onClose();
          refetch();
        }}
      />
    </TabPanel>
  );
}

export default CourseStreams;
