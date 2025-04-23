import React, { useState } from 'react';
import {
  Box, Button, Flex, SimpleGrid, Text, useDisclosure
} from '@chakra-ui/react';

import GroupCard from '../../components/centerSystem/GroupCard';
import AddGroupModal from '../../components/centerSystem/AddGroupModal';
import { IoAddCircleOutline } from 'react-icons/io5';


const GroupsPage = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [groups, setGroups] = useState([
    { id: 1, name: 'مجموعة الرياضيات - ثالثة ثانوي' },
    { id: 2, name: 'مجموعة الكيمياء - ثانية ثانوي' },
  ]);

  const handleAddGroup = (newGroup) => {
    setGroups([...groups, { ...newGroup, id: Date.now() }]);
    onClose();
  };

  return (
    <Box p={6} className='mt-[80px]'>
      <Flex justify="space-between" align="center" mb={4}>
        <Text fontSize="2xl" fontWeight="bold">المجموعات</Text>
        <Button leftIcon={<IoAddCircleOutline />} colorScheme="teal" onClick={onOpen}>
          إنشاء مجموعة
        </Button>
      </Flex>

      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
        {groups.map((group) => (
          <GroupCard key={group.id} group={group} />
        ))}
      </SimpleGrid>

      <AddGroupModal isOpen={isOpen} onClose={onClose} onAdd={handleAddGroup} />
    </Box>
  );
};

export default GroupsPage;
