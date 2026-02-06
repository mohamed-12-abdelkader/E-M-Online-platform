import React, { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import {
  Box, Flex, useColorModeValue, Text, Button, Avatar, VStack, HStack,
  Divider, Badge, Icon, Tooltip
} from "@chakra-ui/react";
import Links from "../../components/links/Links";
import { FaAndroid } from "react-icons/fa";
import UserType from "../../Hooks/auth/userType";

const HomeLogin = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [userData, isAdmin, isTeacher, student] = UserType();
  const location = useLocation();

  // نفس نظام الصفحة الرئيسية: cardBg + حدود + شريط أزرق
  const sidebarBg = useColorModeValue("white", "gray.800");
  const sidebarBorder = useColorModeValue("gray.200", "gray.700");
  const mainBg = useColorModeValue("gray.50", "gray.900");
  const headingColor = useColorModeValue("gray.800", "white");
  const subtextColor = useColorModeValue("gray.600", "gray.400");
  const scrollbarThumb = useColorModeValue("gray.300", "gray.600");
  const badgeBg = useColorModeValue("blue.50", "blue.900");
  const badgeColor = useColorModeValue("blue.600", "blue.200");

  // إخفاء السايدبار في صفحات المحتوى الكامل (كورس، إحصائيات، امتحان شامل، إلخ)
  const shouldHideSidebar =
    location.pathname.includes("CourseDetailsPage") ||
    location.pathname.includes("CourseStatisticsPage") ||
    location.pathname.includes("CourseStudentsPage") ||
    location.pathname.includes("ComprehensiveExam");

  return (
    <Flex
      direction={{ base: "column", md: "row-reverse" }}
      minHeight="100vh"
      bg={mainBg}
    >
      {/* Sidebar - Hide if on CourseDetailsPage */}
      {!shouldHideSidebar && (
        <Box
          display={{ base: "none", md: "flex" }}
          flexDirection="column"
          width="280px"
          height="100vh"
          position="fixed"
          top={0}
          right={0}
          zIndex={100}
          bg={sidebarBg}
          borderLeftWidth="1px"
          borderLeftStyle="solid"
          borderColor={sidebarBorder}
          boxShadow="lg"
          overflowX="hidden"
          overflowY="auto"
          sx={{
            "&::-webkit-scrollbar": { width: "6px" },
            "&::-webkit-scrollbar-track": { bg: "transparent" },
            "&::-webkit-scrollbar-thumb": {
              bg: scrollbarThumb,
              borderRadius: "24px",
            },
          }}
          className="sidebar-container mt-[80px]"
        >
          {/* شريط علوي أزرق — نفس هيرو الصفحة الرئيسية */}
          <Box h="4" w="100%" bgGradient="linear(to-r, blue.400, blue.500)" flexShrink={0} />

          {/* البروفايل — نفس أسلوب كارت الترحيب (خلفية الكارت، حدود أزرق، Badge أزرق) */}
          <Flex
            direction="column"
            align="center"
            pt={5}
            pb={5}
            px={5}
            borderBottomWidth="1px"
            borderColor={sidebarBorder}
          >
            <Avatar
              size="xl"
              name={user?.name || `${user?.fname} ${user?.lname}`}
              src={user?.avatar}
              mb={3}
              border="4px solid"
              borderColor="blue.500"
              boxShadow="0 6px 20px rgba(66, 153, 225, 0.25)"
            />
            <Text fontWeight="bold" fontSize="lg" color={headingColor} noOfLines={1} textAlign="center">
              {user?.name || `${user?.fname} ${user?.lname}`}
            </Text>
            {student && (
              <Badge
                mt={2}
                bg={badgeBg}
                color={badgeColor}
                borderRadius="full"
                px={3}
                py={1}
                fontSize="0.75rem"
                fontWeight="semibold"
              >
                كود الطالب: {user?.id}
              </Badge>
            )}
          </Flex>

          {/* الروابط */}
          <Box flex={1} py={3} px={3}>
            <Links isSidebarOpen={true} setIsSidebarOpen={() => { }} />
          </Box>

          {/* تحميل التطبيق — CTA برتقالي مثل الصفحة الرئيسية */}
          <Box p={4} borderTopWidth="1px" borderTopStyle="solid" borderColor={sidebarBorder}>
            <Button
              as="a"
              href="https://www.mediafire.com/file/f3afz741f5hohts/E-M+Online.apk/file"
              target="_blank"
              rel="noopener noreferrer"
              w="full"
              bg="orange.500"
              color="white"
              _hover={{
                bg: "orange.400",
                transform: "translateY(-2px)",
                boxShadow: "0 8px 20px rgba(237, 137, 54, 0.35)",
              }}
              rightIcon={<FaAndroid />}
              h="50px"
              borderRadius="xl"
              fontSize="md"
              fontWeight="bold"
              transition="all 0.2s"
            >
              تحميل التطبيق
            </Button>
          </Box>
        </Box>
      )}

      {/* Main Content */}
      <Box
        flex={1}
        mr={{ base: 0, md: shouldHideSidebar ? 0 : "280px" }} // Dynamic margin
        mt="80px" // Navbar height
        width="full"
        bg={mainBg}
        color={useColorModeValue("gray.800", "white")}
        transition="margin-right 0.3s"
        minH="calc(100vh - 80px)"
        p={6}
      >
        <Outlet />
      </Box>
    </Flex>
  );
};

export default HomeLogin;