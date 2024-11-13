import React from "react";
import { FaMedal, FaTrophy, FaStar } from "react-icons/fa";
import { Box, Text, VStack, HStack, Flex } from "@chakra-ui/react";

const TheFirsts = () => {
  const topCompetitors = [
    {
      name: "أحمد علي",
      rank: 1,
      points: 1500,
    },
    {
      name: "سارة محمد",
      rank: 2,
      points: 1400,
    },
    {
      name: "محمد حسن",
      rank: 3,
      points: 1300,
    },
    {
      name: "ليلى عبد الله",
      rank: 4,
      points: 1200,
    },
    {
      name: "خالد عمرو",
      rank: 5,
      points: 1100,
    },
  ];

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1:
        return <FaTrophy color="gold" size="30" />;
      case 2:
        return <FaMedal color="silver" size="30" />;
      case 3:
        return <FaStar color="orange" size="30" />;
      default:
        return null;
    }
  };

  const getRankStyle = (rank) => {
    if (rank === 1) {
      return { border: "2px solid gold", bg: "yellow.100" };
    } else if (rank === 2) {
      return { border: "2px solid silver", bg: "gray.200" };
    } else if (rank === 3) {
      return { border: "2px solid orange", bg: "orange.50" };
    }
    return { border: "1px solid gray", bg: "white" };
  };

  const getAvatarLetters = (name) => {
    const names = name.split(" ");
    const firstLetter = names[0][0].toUpperCase();
    const secondLetter = names[1] ? names[1][0].toUpperCase() : "";
    return `${firstLetter}${secondLetter}`;
  };

  return (
    <VStack spacing={6} mt={10} width="80%" mx="auto">
      {topCompetitors.map((competitor) => (
        <Box
          key={competitor.rank}
          p={5}
          shadow="lg"
          borderWidth="1px"
          borderRadius="md"
          width="100%"
          bg={getRankStyle(competitor.rank).bg}
          border={getRankStyle(competitor.rank).border}
          transition="transform 0.2s"
          _hover={{ transform: "scale(1.02)" }}
        >
          <Flex alignItems="center">
            <Box
              display="flex"
              justifyContent="center"
              alignItems="center"
              width="40px"
              className="mx-2"
              height="40px"
              borderRadius="full"
              bg={
                competitor.rank === 1
                  ? "gold"
                  : competitor.rank === 2
                  ? "silver"
                  : "orange"
              }
              color="white"
              fontSize="lg"
              fontWeight="bold"
            >
              {getAvatarLetters(competitor.name)}
            </Box>
            <Box ml={4} flex="1">
              <Text fontSize="lg" fontWeight="bold" color="gray.800">
                {competitor.name}
              </Text>
              <Text color="gray.500">الترتيب: {competitor.rank}</Text>
              <Text color="gray.500">النقاط: {competitor.points}</Text>
            </Box>
            <Box className="">{getRankIcon(competitor.rank)}</Box>
          </Flex>
        </Box>
      ))}
    </VStack>
  );
};

export default TheFirsts;
