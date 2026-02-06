import React from "react";
import {
  Box,
  Container,
  Flex,
  Heading,
  Text,
  Icon,
  Image,
  Link,
  useColorModeValue,
  Divider,
} from "@chakra-ui/react";
import { FaFacebook, FaYoutube, FaTiktok } from "react-icons/fa";
import logoImg from "../../img/next logo.png";

const Footer = () => {
  const footerBg = useColorModeValue("blue.600", "gray.900");
  const textColor = useColorModeValue("white", "gray.200");
  const brandOrange = useColorModeValue("orange.300", "orange.400");
  const iconHoverColor = useColorModeValue("orange.200", "orange.300");
  const dividerColor = useColorModeValue("whiteAlpha.300", "whiteAlpha.200");
  const subTextColor = useColorModeValue("whiteAlpha.900", "gray.400");

  const socialLinks = [
    {
      href: "https://www.facebook.com/profile.php?id=61556280021487&mibextid=kFxxJD",
      icon: FaFacebook,
      label: "فيسبوك",
    },
    {
      href: "https://youtube.com/@mostafaghost9046?si=JNjXytRrD92TuzR_",
      icon: FaYoutube,
      label: "يوتيوب",
    },
    {
      href: "https://www.tiktok.com/@e_m_online?_r=1&_d=ei334d9a1m0bii&sec_uid=MS4wLjABAAAAMgxPqNhKqZUBi01sBnm0qBC5mjF4k6Sm1GbYSfe95JajVy5U4smD5Uh21-GwaUzO&share_author_id=6678574675599049733&sharer_language=ar&source=h5_m&u_code=d5h7mii3ihaj8g&timestamp=1735542055&user_id=6678574675599049733&sec_user_id=MS4wLjABAAAAMgxPqNhKqZUBi01sBnm0qBC5mjF4k6Sm1GbYSfe95JajVy5U4smD5Uh21-GwaUzO&utm_source=copy&utm_campaign=client_share&utm_medium=android&share_iid=7453963791228897030&share_link_id=7e54a0d9-9ec3-47be-9815-fe84927dd0e3&share_app_id=1233&ugbiz_name=ACCOUNT&social_share_type=5&enable_checksum=1",
      icon: FaTiktok,
      label: "تيك توك",
    },
  ];

  return (
    <Box as="footer" w="full" bg={footerBg} color={textColor}>
      {/* شريط البراند العلوي */}
      <Box h="1" w="full" bgGradient="linear(to-r, blue.500, orange.500)" />
      <Container maxW="container.xl" py={10} px={{ base: 4, md: 6 }}>
        <Flex
          direction="column"
          align="center"
          justify="center"
          textAlign="center"
          gap={8}
        >
          {/* الشعار + الاسم */}
          <Flex align="center" gap={4} flexWrap="wrap" justify="center">
            <Box
              p={2}
              borderRadius="2xl"
              bg="white"
              boxShadow="0 8px 24px rgba(0,0,0,0.15)"
              _dark={{ bg: "gray.800" }}
            >
              <Image
                src={logoImg}
                alt="Next Edu School"
                maxH={{ base: "56px", md: "72px" }}
                w="auto"
                objectFit="contain"
              />
            </Box>
            <Box>
              <Heading as="h2" size={{ base: "lg", md: "xl" }} fontWeight="bold" letterSpacing="tight">
                <Text as="span" color="white">Next</Text>
                <Text as="span" color={brandOrange} mx={1}>Edu</Text>
                <Text as="span" color="white">School</Text>
              </Heading>
              <Text fontSize="sm" color={subTextColor} mt={1} fontWeight="medium">
                التعليم خطوتك القادمة
              </Text>
            </Box>
          </Flex>

          <Divider borderColor={dividerColor} w="full" maxW="280px" opacity={0.8} />

          {/* الجملة الترحيبية */}
          <Text
            fontSize={{ base: "md", md: "lg" }}
            maxW="2xl"
            lineHeight="tall"
            color={subTextColor}
          >
            مرحبًا بك في مجتمع <Text as="span" color={brandOrange} fontWeight="bold">Next Edu School</Text> التعليمي،
            حيث يبدأ طريقك نحو النجاح!
          </Text>

          {/* وسائل التواصل */}
          <Flex gap={4} align="center" justify="center" flexWrap="wrap">
            {socialLinks.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={item.label}
                p={3}
                borderRadius="full"
                bg="whiteAlpha.100"
                color="white"
                _hover={{
                  color: iconHoverColor,
                  bg: "whiteAlpha.200",
                  transform: "translateY(-4px) scale(1.05)",
                  boxShadow: "0 8px 20px rgba(0,0,0,0.15)",
                }}
                transition="all 0.25s ease"
              >
                <Icon as={item.icon} boxSize={7} />
              </Link>
            ))}
          </Flex>

          <Text fontSize="xs" color="whiteAlpha.700" _dark={{ color: "gray.500" }}>
            تابعنا على منصات التواصل الاجتماعي
          </Text>
        </Flex>
      </Container>
      <Box py={3} borderTopWidth="1px" borderColor={dividerColor} textAlign="center">
        <Text fontSize="xs" color="whiteAlpha.600" _dark={{ color: "gray.500" }}>
          © {new Date().getFullYear()} Next Edu School. جميع الحقوق محفوظة.
        </Text>
      </Box>
    </Box>
  );
};

export default Footer;
