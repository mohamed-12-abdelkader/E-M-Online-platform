import { Box, Text, Avatar, VStack, HStack, Icon, useColorModeValue } from '@chakra-ui/react';
import { LuClock3 } from 'react-icons/lu'; // ساعة بسيطة
import { Link } from 'react-router-dom';

const GroupCard = ({group  }) => {
  const cardBg = useColorModeValue('blue.50', 'blue.700');

  return (
    <Link to={`/group_details/${group.id}`}>
    <Box
      w="full"
      maxW="sm"
      borderWidth="1px"
      borderRadius="lg"
      overflow="hidden"
      bg="white"
      _dark={{ bg: 'gray.800' }}
      boxShadow="md"
      _hover={{ boxShadow: 'lg' }}
    >
      <Box className='bg-blue-500' p={6} display="flex" justifyContent="center">
       <img src='/96cf8422-1635-4226-a6d8-5d44ee3f2218.jpg' className='h-[70px] w-[70px] ' style={{borderRadius:"50%"}}/>
      </Box>

      <VStack align="start" spacing={2} px={5} pb={5}>
        <h1 className='my-2 text-xl font-bold '>
        {group.name}
        </h1>
        <Text fontSize="sm" color="gray.500">
          Created at
        </Text>
        <Text fontSize="sm" color="gray.600">
          15/5/2025
        </Text>

        <HStack
          mt={2}
          spacing={2}
          borderWidth="1px"
          borderRadius="full"
          px={3}
          py={1}
          color="blue.700"
          _dark={{ color: 'gray.300', borderColor: 'gray.600' }}
        >
          <Icon as={LuClock3} />
          <Text fontSize="sm">{""}</Text>
        </HStack>
      </VStack>
    </Box>
      </Link>
  );
};

export default GroupCard;
