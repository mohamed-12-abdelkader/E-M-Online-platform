import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import { Box, Flex, useColorModeValue, Text, Button } from "@chakra-ui/react";
import Links from "../../components/links/Links";
import { FaDownload } from "react-icons/fa";
import UserType from "../../Hooks/auth/userType";

const HomeLogin = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // State to toggle sidebar
  const [userData, isAdmin, isTeacher, student] = UserType();
console.log(user)
  return (
    <Flex
      direction={{ base: "column", md: "row-reverse" }}
      minHeight="100vh"
      bg={useColorModeValue("gray.100", "gray.900")}
    >
      {/* Sidebar */}
      <Box
        display={{ base: "none", md: "block" }}
        width={isSidebarOpen ? { md: "250px" } : { md: "60px" }} // Width changes based on state
        height="100vh"
        position="fixed"
        top={0}
        right={0}
        mt={{ base: "0", md: "20px" }}
        zIndex={50} // High z-index to overlay content
        bg={useColorModeValue("white", "gray.800")}
        shadow="lg"
        p={isSidebarOpen ? 4 : 2}
        pt="80px"
        overflowY="auto"
        transition="width 0.3s ease" // Smooth transition for width
        onMouseEnter={() => setIsSidebarOpen(true)} // Expand on hover
        onMouseLeave={() => setIsSidebarOpen(false)} // Collapse on hover out
      >
        <Button
          className="mt-[50px]"
          as="a"
          href="https://www.mediafire.com/file/f3afz741f5hohts/E-M+Online.apk/file"
          target="_blank"
          bg="green"
          color="white"
          _hover={{ bg: "green" }}
          fontSize="lg"
          px={6}
          py={5}
          borderRadius="md"
          mt={6}
          boxShadow="lg"
          rightIcon={<FaDownload />}
          display={isSidebarOpen ? "flex" : "none"} // Hide button when collapsed
        >
          تحميل التطبيق
        </Button>

        <Text
          my={5}
          fontWeight="bold"
          color={useColorModeValue("gray.800", "white")}
          display={isSidebarOpen ? "block" : "none"} // Hide text when collapsed
        >
          اهلا : {user?.name || `${user?.fname} - ${user?.lname}`}
        </Text>
        {student ? (
          <Text
            my={5}
            fontWeight="bold"
            color={useColorModeValue("gray.800", "white")}
            display={isSidebarOpen ? "block" : "none"} // Hide text when collapsed
          >
            كود الطالب : {user?.id}
          </Text>
        ) : null}

        <Links isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />
      </Box>

      {/* Main Content */}
      <Box
        flex={1}
        className="md:mr-[4%]"
        mt={{ base: "80px", md: "80px" }}
        width="full" // Full width, no margin for sidebar
        bg={useColorModeValue("gray.50", "gray.900")}
        color={useColorModeValue("gray.800", "white")}
      >
        <Outlet />
      </Box>
    </Flex>
  );
};

export default HomeLogin;