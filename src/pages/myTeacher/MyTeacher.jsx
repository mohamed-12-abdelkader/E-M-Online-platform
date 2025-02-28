import React from "react";
import { useState } from "react";
import { PiChalkboardTeacherBold } from "react-icons/pi";
import {
  Box,
  Heading,
  Skeleton,
  Stack,
  Card,
  CardBody,
  Image,
  Flex,
  Text,
} from "@chakra-ui/react";
import { MdCancelPresentation } from "react-icons/md";
import { Link } from "react-router-dom";
import { FaVideo, FaSearch } from "react-icons/fa";
import img from "../../img/bf2cc492-ee5a-46cc-bd79-a98640b36893.jpg";
import useGitMyTeacher from "../../Hooks/student/useGitMyTeacher";

const MyTeacher = () => {
  const [loading, teachers] = useGitMyTeacher();

  if(loading){
    return(
      <Stack className="w-[90%] m-auto my-5">
      <Skeleton height="20px" className="mt-5" />
      <Skeleton height="20px" />
      <Skeleton height="20px" />
      <Skeleton height="20px" />
    </Stack>
    )
  }

  return (
    <div>
      <Box>
        {/* عنوان الصفحة */}
        <div className="text-center mt-5">
          <Heading
            as="h1"
            fontSize="30px"
            display="flex"
            alignItems="center"
            mb="2"
            className="text-[#03a9f5]"
          >
            <PiChalkboardTeacherBold className="mx-2 text-red-500" />
            محاضرينى
          </Heading>
          {!teachers.teachers && <h1>ابحث عن محاضرك</h1>}
        </div>

        {/* حالة التحميل */}
        {loading ? (
          <Stack className="w-[90%] m-auto my-5">
            <Skeleton height="20px" className="mt-5" />
            <Skeleton height="20px" />
            <Skeleton height="20px" />
            <Skeleton height="20px" />
          </Stack>
        ) : teachers.teachers ? (
          teachers.teachers.length > 0 ? (
            <div
              className="m-auto card-content flex justify-center flex-wrap md:justify-start"
              style={{ borderRadius: "20px" }}
            >
              {teachers.teachers.map((teacher) => (
                <Card
                  key={teacher.id}
                  className="w-[280px] teacher_card my-3 md:mx-3"
                  style={{ border: "1px solid #ccc" }}
                >
                  <CardBody>
                    <Link to={`/teacher/${teacher.id}`}>
                      <Image
                        src={teacher.image}
                        h="220px"
                        w="100%"
                        borderRadius="10px"
                        alt="Teacher"
                      />
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
                          <FaVideo className="m-1 text-red-500" /> محاضر ال{" "}
                          {teacher.subject}
                        </h1>
                      </div>
                    </Link>
                  </CardBody>
                </Card>
              ))}
            </div>
          ) : (
            // في حالة عدم وجود مدرسين
            <div className="text-center py-5">
              <Link
                to="/teachers"
                className="flex justify-center items-center font-bold bg-blue-500 text-white py-3 px-5 rounded-lg shadow-md hover:bg-blue-600 transition-all duration-300 w-fit mx-auto"
              >
                <FaSearch className="mr-2 text-xl mx-2" />
                ابحث عن محاضرك
              </Link>
               <div
                  className='text-center py-5 mt-[40px]  '
                  style={{ borderRadius: "20px" }}
                  >
                    <img
                      src={img}
                      alt="ابحث عن محاضرك"
                      w="400px"
                      borderRadius="20px"
                      className="h-[400px]"
                    />
                  </div>
            </div>
          )
        ) : (
          // صورة افتراضية قبل البحث
          <Flex
            justify="center"
            alignItems="center"
            w="100%"
            className="pt-8"
            style={{ height: "100vh" }}
          >
            <img src={img} alt="ابحث عن محاضرك" className="h-[400px]" />
          </Flex>
        )}
      </Box>
    </div>
  );
};

export default MyTeacher;
