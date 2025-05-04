import React, { useState } from "react";
import {
  Button,
  Spinner,
  Stack,
  Text,
  Box,
  Link,
  Heading,
  Grid,
  GridItem,
  useBreakpointValue,
  Flex,
} from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import baseUrl from "../../api/baseUrl";
import StreamMenu from "./menu";

const STREAM_REDIRECT_URL = import.meta.env.VITE_STREAM_REDIRECT_URL;

const fetchStreams = async ({ queryKey }) => {
  const [_key, { page, limit }] = queryKey;
  const skip = (page - 1) * limit;

  const res = await baseUrl.get("/api/meet/my-streams", {
    params: {
      limit,
      skip,
    },
    headers: {
      token: localStorage.getItem("token"),
    },
  });

  return res.data;
};

const MyStreams = () => {
  const [page, setPage] = useState(1);
  const limit = 10;

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["my-streams", { page, limit }],
    queryFn: fetchStreams,
    keepPreviousData: true, // Keeps previous data while loading new page
    refetchOnWindowFocus: true,
  });

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

  const totalStreams = data?.total || 0;
  const streams = data?.streams || [];
  const totalPages = Math.ceil(totalStreams / limit);

  return (
    <div className="mt-[100px]">
      <Heading as="h1" size="xl" textAlign="center" mb={6}>
        بثوثك المباشره
      </Heading>

      <Box maxW="1200px" mx="auto" p={4}>
        <Grid
          templateColumns={{
            base: "1fr", // One column on small screens
            md: "repeat(2, 1fr)", // Two columns on medium screens
            lg: "repeat(3, 1fr)", // Three columns on large screens
          }}
          gap={6}
        >
          {streams.length > 0 ? (
            streams.map((stream) => (
              <GridItem
                key={stream.id}
                p={4}
                borderWidth={1}
                borderRadius="md"
                boxShadow="md"
                bg="white"
                _hover={{ boxShadow: "lg" }}
                transition="box-shadow 0.3s"
              >
                <StreamMenu
                  stream={stream}
                  onStreamUpdated={() => refetch()}
                  onStreamDeleted={(deletedId) => {
                    refetch();
                  }}
                />

                <Text fontSize="xl" fontWeight="bold" mb={2}>
                  {stream.title}
                </Text>
                <Text mb={2}>{stream.description || "لا توجد وصف."}</Text>
                <Text fontSize="sm" color="gray.600" mb={3}>
                  حالة البث:{" "}
                  {stream.status === "started"
                    ? "قيد التشغيل"
                    : stream.status === "idle"
                    ? "بانتظار البدء"
                    : "منتهٍ"}
                </Text>

                {(stream.status === "started" || stream.status === "idle") && (
                  <Link
                    color="blue.500"
                    href={`${STREAM_REDIRECT_URL}/${
                      stream.room_name
                    }?t=${localStorage.getItem("token")}`}
                    isExternal
                  >
                    الانتقال إلى غرفة البث المباشر
                  </Link>
                )}
              </GridItem>
            ))
          ) : (
            <Text textAlign="center" colSpan={3}>
              لا توجد بثوث حالياً.
            </Text>
          )}
        </Grid>

        {/* Pagination controls */}
        <Stack direction="row" justify="center" spacing={4} mt={6}>
          <Button
            onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
            isDisabled={page === 1}
          >
            السابق
          </Button>
          <Text>
            الصفحة {page} من {totalPages}
          </Text>
          <Button
            onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
            isDisabled={page === totalPages}
          >
            التالي
          </Button>
        </Stack>
      </Box>
    </div>
  );
};

export default MyStreams;
