import React from "react";
import { Box, Grid, GridItem, Link, Heading, Icon } from "@chakra-ui/react";
import { FaUsers, FaChalkboardTeacher, FaTrophy, FaBookOpen } from "react-icons/fa";
import MyLecture from "../leacter/MyLecture";
import MyTeacher from "../myTeacher/MyTeacher";

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
            <GridItem
              key={index}
              bg="blue.100"
              p={3}
              borderRadius="md"
              textAlign="center"
              _hover={{ bg: "blue.200", transform: "scale(1.05)" }}
              transition="0.3s"
            >
              <Link href={link.href} display="flex" flexDirection="column" alignItems="center">
                <Icon as={link.icon} boxSize={6} color="blue.600" mb={2} />
                {link.name}
              </Link>
            </GridItem>
          ))}
        </Grid>
      </Box>

      <MyTeacher />
      <MyLecture />
    </div>
  );
};

export default HomePage;
