import { useState } from "react";
import { PiChalkboardTeacherBold } from "react-icons/pi";
import {
  Box,
  Heading,
  Spinner,
  FormControl,
  Input,
  Button,
  Image,
  Flex,
  Text,
  Skeleton,
  Stack,
  Card,
  CardBody,
  VStack,
  HStack,
} from "@chakra-ui/react";
import { MdCancelPresentation } from "react-icons/md";
import { Link } from "react-router-dom";
import { FaVideo } from "react-icons/fa";
import useGitTeacherByToken from "../../Hooks/student/GitTeacherByToken";
import { FaUserCircle } from "react-icons/fa";
import img from "../../img/Screenshot_2025-03-07_210502-removebg-preview.png";
import { motion } from "framer-motion";

const AllTeacherLogin = () => {
  const [loading, teachers] = useGitTeacherByToken();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchClicked, setSearchClicked] = useState(false);

  // Fuzzy search function
  const fuzzySearch = (query, text) => {
    if (!query || !text) return 0;
    const normalizedQuery = query.toLowerCase().trim();
    const normalizedText = text.toLowerCase().trim();

    // Exact ID match
    if (normalizedText === normalizedQuery) return 100;

    let score = 0;
    const queryWords = normalizedQuery.split(/\s+/);
    const textWords = normalizedText.split(/\s+/);

    // Score based on word matches
    queryWords.forEach((qWord) => {
      textWords.forEach((tWord) => {
        if (tWord.includes(qWord)) {
          score += (qWord.length / tWord.length) * 50;
        }
      });
    });

    // Boost score for consecutive character matches
    let matchLength = 0;
    for (let i = 0; i < normalizedText.length && i < normalizedQuery.length; i++) {
      if (normalizedText[i] === normalizedQuery[i]) {
        matchLength++;
      }
    }
    score += (matchLength / normalizedText.length) * 50;

    return Math.min(score, 100);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setSearchClicked(false);
  };

  const handleSearchClick = () => {
    setSearchClicked(true);

    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const results = Array.isArray(teachers)
      ? teachers
          .map((teacher) => ({
            teacher,
            score: Math.max(
              fuzzySearch(searchQuery, teacher.name),
              teacher.id.toString() === searchQuery.trim() ? 100 : 0
            ),
          }))
          .filter((item) => item.score > 20)
          .sort((a, b) => b.score - a.score)
          .map((item) => item.teacher)
      : [];

    setSearchResults(results);
  };

  return (
    <div className="p-7 mb-[120px]">
      <Box w="100%" my="5" style={{ width: '100% !important' }}>
        <Heading as="h1" fontSize="30px" display="flex" alignItems="center" mb="2" className="text-[#03a9f5]">
          <PiChalkboardTeacherBold className="mx-2 text-red-500" />
          ابحث عن محاضرك
        </Heading>

        <FormControl mb="4" mt="4" display="flex" gap="2">
          <Input
            type="text"
            placeholder="ابحث عن محاضرك بالاسم أو كود المحاضر..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="h-[80px]"
            style={{ borderRadius: "20px", height: "50px" }}
          />
          <Button onClick={handleSearchClick} colorScheme="blue">
            بحث
          </Button>
        </FormControl>

        <Box>
          {loading ? (
            <Stack className="w-full my-5" style={{ width: '100% !important' }}>
              <Skeleton height="20px" className="mt-5" />
              <Skeleton height="20px" />
              <Skeleton height="20px" />
              <Skeleton height="20px" />
            </Stack>
          ) : searchClicked ? (
            searchResults.length > 0 ? (
              <div className="flex justify-start flex-wrap gap-6" style={{ width: 'fit-content' }}>
                {searchResults.map((teacher) => (
                  <Link key={teacher.id} to={`/teacher/${teacher.id}`}>
                    <Card
                      className="w-[350px]"
                      style={{
                        borderRadius: "20px",
                        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
                        background: "#fff",
                        overflow: "hidden",
                        border: "1px solid #f0f0f0",
                        transition: "all 0.3s ease",
                        cursor: "pointer"
                      }}
                      _hover={{
                        transform: "translateY(-8px)",
                        boxShadow: "0 16px 48px rgba(0, 0, 0, 0.15)"
                      }}
                    >
                      {/* صورة المدرس مع تأثيرات */}
                      <Box
                        position="relative"
                        w="100%"
                        h="300px"
                        overflow="hidden"
                      >
                        <Image
                          src={teacher.avatar || "https://via.placeholder.com/320x200/4fd1c5/ffffff?text=صورة+المدرس"}
                          alt={teacher.name}
                          w="100%"
                          h="100%"
                          objectFit="cover"
                          transition="transform 0.3s ease"
                          _hover={{ transform: "scale(1.05)" }}
                        />
                        {/* Badge للمادة */}
                        <Box
                          position="absolute"
                          top={3}
                          right={3}
                          bg="rgba(0, 0, 0, 0.7)"
                          color="white"
                          px={3}
                          py={1}
                          borderRadius="full"
                          fontSize="xs"
                          fontWeight="bold"
                          backdropFilter="blur(10px)"
                        >
                          {teacher.subject}
                        </Box>
                        {/* Badge للمدرس */}
                        <Box
                          position="absolute"
                          top={3}
                          left={3}
                          bg="rgba(59, 130, 246, 0.9)"
                          color="white"
                          px={3}
                          py={1}
                          borderRadius="full"
                          fontSize="xs"
                          fontWeight="bold"
                          backdropFilter="blur(10px)"
                        >
                          مدرس
                        </Box>
                      </Box>

                      <CardBody p={6}>
                        <VStack align="flex-start" spacing={4}>
                          {/* اسم المدرس */}
                          <Box w="full">
                            <Text 
                              fontWeight="bold" 
                              fontSize="xl" 
                              color="#2d3748" 
                              textAlign="right"
                              mb={1}
                            >
                               {teacher.name}
                            </Text>
                          </Box>

                          {/* وصف المدرس */}
                          {teacher.description && (
                            <Text 
                              fontSize="sm" 
                              color="#718096" 
                              textAlign="right"
                              noOfLines={3}
                              lineHeight="1.5"
                            >
                              {teacher.description}
                            </Text>
                          )}

                          {/* معلومات إضافية */}
                          <Flex justify="space-between" align="center" w="full" pt={2}>
                            <HStack spacing={2}>
                              <FaVideo color="#3b82f6" />
                              <Text fontSize="xs" color="#718096" fontWeight="medium">
                                {teacher.subject}
                              </Text>
                            </HStack>
                           
                          </Flex>

                          {/* زر عرض التفاصيل */}
                          <Button 
                            colorScheme="blue" 
                            w="full" 
                            borderRadius="xl" 
                            fontWeight="bold" 
                            fontSize="md"
                            h="48px"
                            mt={2}
                            _hover={{
                              transform: "translateY(-2px)",
                              boxShadow: "0 8px 16px rgba(0, 0, 0, 0.2)"
                            }}
                            transition="all 0.2s ease"
                          >
                            عرض الكورسات
                          </Button>
                        </VStack>
                      </CardBody>
                    </Card>
                  </Link>
                ))}
              </div>
            ) : (
              <Flex justify="center" alignItems="center" bg="white" h="200px" borderRadius="20px">
                <Text fontWeight="bold" display="flex" alignItems="center" color="black">
                  <MdCancelPresentation className="m-1 text-red-500" />
                  لا يوجد مدرس بهذا الاسم أو رقم الهوية
                </Text>
              </Flex>
            )
          ) : (
            <section
              dir="rtl"
              className="flex mb-8 flex-col md:flex-row items-center justify-between px-6 md:px-12 py-12 relative"
            >
              <div dir="rtl" className="max-w-lg text-right space-y-5">
                <h1 className="text-2xl font-bold leading-snug">
                  🚀 ابحث عن محاضرك
                </h1>
                <p className="text-lg font-medium leading-relaxed">
                  يمكنك البحث عن محاضرك باستخدام{" "}
                  <span className="text-blue-600 font-semibold">كود المحاضر</span>{" "}
                  أو من خلال <span className="text-blue-600 font-semibold">اسمه</span>.
                </p>
              </div>
            </section>
          )}
        </Box>
      </Box>
    </div>
  );
};

export default AllTeacherLogin;