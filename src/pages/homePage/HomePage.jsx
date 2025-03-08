import React from "react";
import { Box, Grid, GridItem, Heading, Icon, Text, Flex, useBreakpointValue } from "@chakra-ui/react";
import { FaUsers, FaChalkboardTeacher, FaTrophy, FaBookOpen } from "react-icons/fa";
import MyLecture from "../leacter/MyLecture";
import MyTeacher from "../myTeacher/MyTeacher";
import { Link } from "react-router-dom";

const HomePage = () => {
  const links = [
    { name: "مجتمع EM Online", href: "/social", icon: FaUsers, color: "purple.500" },
    { name: "محاضرينى", href: "/my-teachers", icon: FaChalkboardTeacher, color: "green.500" },
    { name: "المسابقات اليومية", href: "/competitions", icon: FaTrophy, color: "yellow.500" },
    { name: "كورساتي", href: "/my_courses", icon: FaBookOpen, color: "blue.500" },
  ];

  // تحديد عدد الأعمدة بناءً على حجم الشاشة
  const gridColumns = useBreakpointValue({ base: "repeat(2, 1fr)", md: "repeat(auto-fit, minmax(170px, 1fr))" });

  return (
    <div className="mb-[150px]">
      <Box p={5} textAlign="center">
        <Heading fontSize="2xl" mb={6} color="blue.600">
          📌 تصفح المنصة  
        </Heading>

        <Grid templateColumns={gridColumns} gap={6}>
          {links.map((link, index) => (
            <GridItem
              key={index}
              as={Link}
              to={link.href}
              p={4}
              borderRadius="lg"
              boxShadow="lg"
              bg="white"
              _hover={{ bg: "gray.100", transform: "scale(1.05)" }}
              transition="all 0.3s"
              textAlign="center"
            >
              <Flex direction="column" align="center" justify="center">
                <Icon as={link.icon} boxSize={8} color={link.color} mb={3} />
                <Text fontSize="lg" fontWeight="bold" color="gray.700">
                  {link.name}
                </Text>
              </Flex>
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
