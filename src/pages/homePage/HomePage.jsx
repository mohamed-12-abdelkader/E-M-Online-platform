import React from "react";
import { Box, Grid, GridItem, Heading, Icon } from "@chakra-ui/react";
import { FaUsers, FaChalkboardTeacher, FaTrophy, FaBookOpen } from "react-icons/fa";
import MyLecture from "../leacter/MyLecture";
import MyTeacher from "../myTeacher/MyTeacher";
import { Link } from "react-router-dom";

const HomePage = () => {
  const links = [
    { name: "مجتمع EM Online", href: "/social", icon: FaUsers }, // أيقونة تعبر عن المجتمع
    { name: "محاضرينى", href: "/my-teachers", icon: FaChalkboardTeacher }, // أيقونة المدرسين
    { name: "المسابقات اليومية", href: "/competitions", icon: FaTrophy }, // أيقونة الكأس للمسابقات
    { name: "كورساتي", href: "/my_courses", icon: FaBookOpen }, // أيقونة الكتب للدورات
  ];

  return (
    <div className="mb-[150px]">
      <Box p={5} textAlign="center">
        <Heading fontSize="2xl" mb={4} color="blue.500">
          📌 تصفح المنصة  
        </Heading>
        <Grid templateColumns="repeat(auto-fit, minmax(150px, 1fr))" gap={4}>
          {links.map((link, index) => (
            <Link to={link.href} >
            <GridItem
              key={index}
              bg="blue.100"
              p={3}
              borderRadius="md"
              textAlign="center"
              _hover={{ bg: "blue.200", transform: "scale(1.05)" }}
              transition="0.3s"
            >
              <div>

                <Icon as={link.icon} boxSize={6} color="blue.600" mb={2} />
                <h1>

                {link.name}
                </h1>
              </div>
            </GridItem>
              </Link>
          ))}
        </Grid>
      </Box>

      <MyTeacher />
      <MyLecture />
    </div>
  );
};

export default HomePage;
