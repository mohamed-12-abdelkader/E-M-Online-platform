import React, { useState } from "react";
import {
  Box,
  Button,
  Heading,
  Stack,
  Text,
  Spinner,
  Flex,
  Image,
  SimpleGrid,
} from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import baseUrl from "../../api/baseUrl";

const fetchStreams = async ({ pageParam }) => {
  const skip = pageParam * 10;
  const { data } = await baseUrl.get(
    `/api/meet/meetings?skip=${skip}&limit=10`
  );
  return data.streams;
};

const STREAM_REDIRECT_URL = import.meta.env.VITE_STREAM_REDIRECT_URL;

const StreamList = () => {
  const [page, setPage] = useState(0);

  const {
    data: streams = [],
    isLoading,
    isError,
    isFetching,
  } = useQuery({
    queryKey: ["meetings", page],
    queryFn: () => fetchStreams({ pageParam: page }),
    keepPreviousData: true,
  });

  return (
    <Box p={6} dir="rtl" className="mt-[70px]">
      <Heading textAlign="center" mb={4}>
        كل البثوث المباشرة
      </Heading>

      {isLoading ? (
        <Spinner />
      ) : isError ? (
        <Text color="red.500">فشل في تحميل البثوث.</Text>
      ) : streams.length === 0 ? (
        <Text>لا توجد بثوث متاحة حالياً.</Text>
      ) : (
        <SimpleGrid columns={[1, 2, 3]} spacing={6}>
          {streams.map((stream) => (
            <Box
              key={stream.id}
              p={4}
              borderWidth="1px"
              borderRadius="2xl"
              shadow="md"
              bg="white"
              display="flex"
              flexDirection="column"
            >
              {stream.cover_image && (
                <Image
                  src={stream.cover_image}
                  alt={stream.title}
                  borderRadius="xl"
                  objectFit="cover"
                  maxH="180px"
                  width="100%"
                  mb={3}
                />
              )}

              <Heading fontSize="xl" mb={2}>
                {stream.title}
              </Heading>

              {stream.description && (
                <Text fontSize="md" mb={2} color="gray.600">
                  {stream.description}
                </Text>
              )}

              <Text fontWeight="medium" mb={1}>
                الحالة:{" "}
                <span style={{ textTransform: "capitalize" }}>
                  {stream.status === "started"
                    ? "مباشر"
                    : stream.status === "ended"
                    ? "انتهى"
                    : stream.status}
                </span>
              </Text>

              <Text fontSize="sm" color="gray.500" mb={3}>
                تاريخ الإنشاء:{" "}
                {new Date(stream.created_at).toLocaleString("ar-EG")}
              </Text>

              {(stream.status === "started" || stream.status === "ended") && (
                <a
                  href={`${STREAM_REDIRECT_URL}/${
                    stream.room_name
                  }?t=${localStorage.getItem("token")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block w-full text-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-xl transition duration-200 mt-auto"
                >
                  الانتقال إلى غرفة البث المباشر
                </a>
              )}
            </Box>
          ))}
        </SimpleGrid>
      )}

      <Flex mt={6} justifyContent="space-between">
        <Button
          onClick={() => setPage((p) => Math.max(p - 1, 0))}
          isDisabled={page === 0}
        >
          السابق
        </Button>
        <Button
          onClick={() => setPage((p) => p + 1)}
          isDisabled={streams.length < 10}
          isLoading={isFetching}
        >
          التالي
        </Button>
      </Flex>
    </Box>
  );
};

export default StreamList;
