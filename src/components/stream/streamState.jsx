import {
  Box,
  Button,
  Flex,
  Heading,
  HStack,
  Image,
  Spinner,
  Stack,
  Text,
  useColorModeValue,
  useDisclosure,
  VStack,
} from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import baseUrl from "../../api/baseUrl";
import CreateStreamModal from "./createModel";
import StreamMenu from "./menu";

const STREAM_REDIRECT_URL = import.meta.env.VITE_STREAM_REDIRECT_URL;

function StreamState() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    data: stream,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["stream_state"],
    queryFn: async () => {
      try {
        const res = await baseUrl.get("/api/meet/current", {
          headers: { token: localStorage.getItem("token") },
        });
        return res.data;
      } catch (err) {
        if (
          err?.response?.status === 404 &&
          err?.response?.data?.error === "No active meeting found."
        ) {
          return null;
        }
        throw err;
      }
    },
    refetchInterval: 10000,
  });

  const hasActiveStream = stream && stream.status && stream.status !== "ended";

  const statusLabel = {
    started: "البث مباشر الآن",
    idle: "تم الإنشاء ولم يبدأ بعد",
    ended: "انتهى",
  };

  const statusColor = {
    started: "green.500",
    idle: "orange.400",
    ended: "red.500",
  };

  return (
    <Box maxW="lg" mx="auto" mt={10} px={4} dir="rtl">
      {isLoading ? (
        <Flex justify="center" py={10}>
          <Spinner size="lg" />
        </Flex>
      ) : isError ? (
        <Text color="red.500" textAlign="center">
          حدث خطأ أثناء تحميل حالة البث. حاول مجددًا.
        </Text>
      ) : hasActiveStream ? (
        <Box
          bg={useColorModeValue("white", "gray.800")}
          boxShadow="lg"
          borderRadius="lg"
          overflow="hidden"
        >
          <Image
            src={stream.cover_image}
            alt="صورة الغلاف"
            objectFit="cover"
            w="100%"
            h="200px"
          />

          <Box p={5} position="relative">
            <Flex justify="space-between" align="start">
              <Heading fontSize="xl">{stream.title}</Heading>
              <Box>
                <StreamMenu
                  stream={stream}
                  onStreamUpdated={() => {
                    refetch();
                  }}
                  onStreamDeleted={() => {
                    refetch();
                  }}
                />
              </Box>
            </Flex>

            <Text mt={2} color="gray.600">
              {stream.description || "لا يوجد وصف متاح"}
            </Text>

            <HStack mt={3}>
              <Text fontWeight="bold">الحالة:</Text>
              <Text color={statusColor[stream.status]}>
                {statusLabel[stream.status]}
              </Text>
            </HStack>

            <Stack mt={5} spacing={3}>
              <Button
                as="a"
                href={`${STREAM_REDIRECT_URL}/${
                  stream.room_name
                }?t=${localStorage.getItem("token")}`}
                target="_blank"
                rel="noopener noreferrer"
                colorScheme="blue"
                w="full"
              >
                الانتقال إلى غرفة البث المباشر
              </Button>
            </Stack>
          </Box>
        </Box>
      ) : (
        <Stack spacing={4} align="center" textAlign="center">
          <Text fontSize="lg" color="gray.600">
            لا يوجد بث مباشر نشط حاليًا.
          </Text>
          <Button colorScheme="green" onClick={onOpen}>
            بدء بث مباشر جديد
          </Button>
        </Stack>
      )}

      <CreateStreamModal
        isOpen={isOpen}
        onClose={onClose}
        onSuccess={() => {
          onClose();
          refetch();
        }}
      />
    </Box>
  );
}

export default StreamState;
