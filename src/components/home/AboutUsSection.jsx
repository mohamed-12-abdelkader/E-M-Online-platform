import { Box, Flex, Text, Image } from "@chakra-ui/react";
import { FaGraduationCap, FaUserTie, FaRocket } from "react-icons/fa";

const  AboutUsSection = () => {
  return (
    <Box as="section"  py={16} >
      <Box maxW="7xl" mx="auto" px={4}>
        <Flex
          direction={{ base: "column", md: "row" }}
          align="center"
          justify="space-between"
          gap={12}
        >
          {/* الصورة على اليسار */}
          <Box w={{ base: "100%", md: "50%" }} maxW="600px">
            <Image
              src="/9468add9-bc67-497d-9ce5-63d27c77416c-removebg-preview.png"
              alt="منصة EM Online على أجهزة متعددة"
              objectFit="cover"
              w="100%"
              maxH="500px"
              borderRadius="xl"
            
              transition="transform 0.3s"
              _hover={{ transform: "scale(1.05)" }}
            />
          </Box>

          {/* النص على اليمين */}
          <Box w={{ base: "100%", md: "50%" }} textAlign="right">
            <Flex align="center" gap={2} mb={6}>
              <FaRocket className="text-blue-600" />
              <Text as="h2" fontSize="4xl" color="blue.500" fontWeight="bold" fontFamily="Tajawal">
                عن EM Online
              </Text>
            </Flex>
            <Box className="space-y-6">
              <Text fontSize="lg"  leading="relaxed">
                منصة <Text as="span" fontWeight="semibold" color="blue.600">"EM Online"</Text> هي وجهتك المثالية للتعلم الإلكتروني بطريقة مبتكرة وسهلة. نحن هنا لنقدم لك تجربة تعليمية متكاملة تجمع بين المحتوى التعليمي المتميز والتقنيات الحديثة.
              </Text>
              <Flex align="center" gap={2}>
                <FaGraduationCap className="text-blue-500" />
                <Text fontSize="lg" leading="relaxed">
                  لتمكين الطلاب من تحقيق أحلامهم الأكاديمية بكل يسر وسلاسة.
                </Text>
              </Flex>
              <Flex align="center" gap={2}>
                <FaUserTie className="text-blue-500" />
                <Text fontSize="lg" leading="relaxed">
                  سواء كنت طالبًا في المدرسة أو الجامعة، أو حتى محترفًا يسعى لتطوير مهاراته، فإن منصتنا مصممة لتلبية احتياجاتك التعليمية بأفضل طريقة ممكنة.
                </Text>
              </Flex>
              <Text fontSize="lg" leading="relaxed">
                انضم إلينا اليوم وابدأ رحلتك نحو النجاح!
              </Text>
            </Box>
          </Box>
        </Flex>
      </Box>
    </Box>
  );
};

export default AboutUsSection;