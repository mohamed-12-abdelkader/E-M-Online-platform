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
} from "@chakra-ui/react";
import { MdCancelPresentation } from "react-icons/md";
import { Link } from "react-router-dom";
import { FaVideo } from "react-icons/fa";
import GitTeacherByToken from "../../Hooks/student/GitTeacherByToken";
import img from "../../img/Screenshot_2025-03-07_210502-removebg-preview.png";
import { motion } from "framer-motion";

const AllTeacherLogin = () => {
  const [loading, teachers] = GitTeacherByToken();
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
          .filter((item) => item.score > 20) // Threshold for relevance
          .sort((a, b) => b.score - a.score) // Sort by score descending
          .map((item) => item.teacher)
      : [];

    setSearchResults(results);
  };

  return (
    <div className="p-7 mb-[120px]">
      <Box w="100%" my="5">
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
            <Stack className="w-[90%] m-auto my-5">
              <Skeleton height="20px" className="mt-5" />
              <Skeleton height="20px" />
              <Skeleton height="20px" />
              <Skeleton height="20px" />
            </Stack>
          ) : searchClicked ? (
            searchResults.length > 0 ? (
              <div className="m-auto card-content flex justify-center md:justify-center flex-wrap" style={{ borderRadius: "20px" }}>
                {searchResults.map((teacher) => (
                  <Card key={teacher.id} className="w-[280px] teacher_card my-3 md:mx-3" style={{ border: "1px solid #ccc" }}>
                    <CardBody>
                      <Link to={`/teacher/${teacher.id}`}>
                        <Image src={teacher.image} h="220px" w="100%" borderRadius="10px" alt="Teacher" />
                        <p className="w-[100%] h-[2px] bg-[#ccc] mt-4 m-auto"></p>
                        <Flex justify="space-between" py="2">
                          <Text fontWeight="bold" mt="2">
                            {teacher.name}
                          </Text>
                          <Text fontWeight="bold" mt="2">
                            {teacher.subject}
                          </Text>
                        </Flex>
                        <div className="h-auto">
                          <h1 fontWeight="bold" className="flex font-bold my-2">
                            <FaVideo className="m-1 text-red-500" /> محاضر ال{teacher.subject}
                          </h1>
                        </div>
                      </Link>
                    </CardBody>
                  </Card>
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