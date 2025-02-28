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
import img from "../../img/910b0350-ffe8-451e-9a0f-06222d3e717a.jpg";

const AllTeacherLogin = () => {
  const [loading, teachers] = GitTeacherByToken();
  const [searchQuery, setSearchQuery] = useState(""); 
  const [searchResults, setSearchResults] = useState([]);
  const [searchClicked, setSearchClicked] = useState(false); // ✅ حالة تتبع البحث

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value.toLowerCase());
    setSearchClicked(false); // ✅ إعادة تعيين عند تغيير الإدخال
  };

  const handleSearchClick = () => {
    setSearchClicked(true); // ✅ تم الضغط على زر البحث

    if (!searchQuery.trim()) {
      setSearchResults([]); 
      return;
    }

    const results = Array.isArray(teachers)
      ? teachers.filter((teacher) =>
          teacher.name.toLowerCase().includes(searchQuery)
        )
      : [];

    setSearchResults(results);
  };

  return (
    <div className="p-7 mb-[120px]">
      <Box w="100%" my="5">
        <Heading as="h1" fontSize="30px" display="flex" alignItems="center" mb="2" className="text-[#03a9f5]">
          <PiChalkboardTeacherBold className="mx-2 text-red-500" />
          ابحث عن مدرسك 
        </Heading>

        <FormControl mb="4" mt="4" display="flex" gap="2">
          <Input
            type="text"
            placeholder="ابحث عن مدرسك..."
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
                            <FaVideo className="m-1 text-red-500" /> محاضر  ال {teacher.subject}  
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
                  لا يوجد مدرس بهذا الاسم
                </Text>
              </Flex>
            )
          ) : (
            <Flex justify="center" alignItems="center" w="100%" mt="20">
              <img src={img} alt="ابحث عن مدرسك" w="400px" borderRadius="20px" />
            </Flex>
          )}
        </Box>
      </Box>
    </div>
  );
};

export default AllTeacherLogin;
