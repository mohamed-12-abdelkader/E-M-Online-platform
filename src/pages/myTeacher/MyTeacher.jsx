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
import { Link } from "react-router-dom";
import { FaVideo, FaSearch } from "react-icons/fa";
import img from "../../img/Screenshot_2025-03-07_203419-removebg-preview.png";
import useGitMyTeacher from "../../Hooks/student/useGitMyTeacher";
import { motion } from "framer-motion";

const MyTeacher = () => {
  const [loading, teachers] = useGitMyTeacher();

  if (loading) {
    return (
      <Stack className="w-[90%] m-auto my-5">
        <Skeleton height="20px" className="mt-5" />
        <Skeleton height="20px" />
        <Skeleton height="20px" />
        <Skeleton height="20px" />
      </Stack>
    );
  }

  return (
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
        {!teachers?.teachers && <h1>ابحث عن محاضرك</h1>}
      </div>

      {/* عرض المحاضرين */}
      {teachers?.teachers?.length > 0 ? (
        <div
          className="m-auto card-content flex justify-center flex-wrap md:justify-start"
          style={{ borderRadius: "20px" }}
        >
          {teachers.teachers.map((teacher) => (
            <Card
              key={teacher.id}
              className="w-[290px] teacher_card my-3 md:mx-3"
              style={{ border: "1px solid #ccc" }}
            >
              <CardBody>
                <Link to={`/teacher/${teacher.id}`}>
                  <Image
                    src={teacher.image || img} // استخدام صورة افتراضية عند غياب الصورة
                    h="250px"
                    w="100%"
                    borderRadius="10px"
                    alt={teacher.name || "Teacher"}
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
                    <h1 className="flex font-bold my-2">
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
        // في حالة عدم وجود محاضرين
        <div className="text-center py-5">
          <section
            dir="rtl"
            className="flex mb-8 flex-col md:flex-row items-center justify-between px-6 md:px-12 py-12 relative"
          >
            {/* نص التوجيه */}
            <div dir="rtl" className="max-w-lg text-right space-y-5">
              <h1 className="text-2xl font-bold leading-snug ">
                🚀 لم تقم بالاشتراك مع أي محاضرين بعد!
              </h1>

              <p className="text-lg font-medium  leading-relaxed">
                يمكنك البحث عن محاضرك باستخدام{" "}
                <span className="text-blue-600 font-semibold">كود المحاضر</span>{" "}
                أو من خلال <span className="text-blue-600 font-semibold">اسمه</span>.
              </p>

              <Link
                to="/teachers"
                className="inline-flex items-center gap-2 font-bold bg-blue-500 text-white py-3 px-6 rounded-lg shadow-lg hover:bg-blue-600 transition-all duration-300 text-lg"
              >
                <FaSearch className="text-2xl" />
                <span>ابحث عن محاضرك</span>
              </Link>
            </div>

            {/* صورة توضيحية */}
          
          </section>
        </div>
      )}
    </Box>
  );
};

export default MyTeacher;
