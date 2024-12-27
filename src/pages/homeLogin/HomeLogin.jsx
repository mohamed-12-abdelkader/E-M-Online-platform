import React from "react";
import { Outlet } from "react-router-dom";
import { Box, Flex, useColorModeValue, Text } from "@chakra-ui/react";
import Links from "../../components/links/Links";

const HomeLogin = () => {
  const user = JSON.parse(localStorage.getItem("user"));

  return (
    <Flex
      direction={{ base: "column", md: "row-reverse" }}
      minHeight='100vh'
      bg={useColorModeValue("gray.100", "gray.900")}
    >
      {/* Sidebar */}
      <Box
        display={{ base: "none", md: "block" }}
        width={{ md: "22%" }}
        height='100vh'
        position='fixed'
        top={0}
        right={0}
        mt={{ base: "0", md: "20px" }}
        zIndex={30}
        bg={useColorModeValue("white", "gray.800")}
        shadow='lg'
        p={4}
        pt='80px'
        overflowY='auto'
      >
        <Text
          my={5}
          fontWeight='bold'
          color={useColorModeValue("gray.800", "white")}
        >
          اهلا : {user?.name || `${user?.fname} - ${user?.lname}`}
        </Text>
        <Links />
      </Box>

      {/* Main Content */}
      <Box
        flex={1}
        mt={{ base: "80px", md: "80px" }}
        mr={{ md: "22%" }}
        width='full'
        bg={useColorModeValue("gray.50", "gray.900")}
        color={useColorModeValue("gray.800", "white")}
      >
        <Outlet />
      </Box>
    </Flex>
  );
};

export default HomeLogin;
