import React, { useState } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Button,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  VStack,
  HStack,
  Input,
  FormControl,
  FormLabel,
  InputGroup,
  InputLeftElement,
  useToast
} from '@chakra-ui/react';
import { FaIdBadge, FaUser, FaPhone } from 'react-icons/fa';

const AddStudentDualModal = ({ isOpen, onClose, onAddByCode, onAddByName, loading = false }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [studentId, setStudentId] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [parentPhone, setParentPhone] = useState('');
  const toast = useToast();

  const reset = () => {
    setStudentId('');
    setName('');
    setPhone('');
    setParentPhone('');
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const submitByCode = async () => {
    const trimmed = String(studentId).trim();
    const numericId = Number(trimmed);
    if (!trimmed || Number.isNaN(numericId) || numericId <= 0) {
      toast({ title: 'خطأ', description: 'يرجى إدخال رقم طالب صحيح', status: 'error', duration: 3000, isClosable: true });
      return;
    }
    await onAddByCode?.(numericId);
    handleClose();
  };

  const submitByName = async () => {
    if (!name.trim()) {
      toast({ title: 'خطأ', description: 'يرجى إدخال اسم الطالب', status: 'error', duration: 3000, isClosable: true });
      return;
    }
    const payload = { name: name.trim() };
    if (phone.trim()) payload.phone = phone.trim();
    if (parentPhone.trim()) payload.parent_phone = parentPhone.trim();
    try {
      await onAddByName?.(payload);
      // Clear inputs and keep modal open for faster multiple entries
      setName('');
      setPhone('');
      setParentPhone('');
    } catch (e) {
      // Parent shows toast on error
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="lg">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>إضافة طالب</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Tabs index={activeTab} onChange={setActiveTab} variant="enclosed" isFitted>
            <TabList>
              <Tab>عن طريق الكود</Tab>
              <Tab>عن طريق الاسم</Tab>
            </TabList>
            <TabPanels>
              <TabPanel>
                <VStack spacing={4} align="stretch">
                  <FormControl isRequired>
                    <FormLabel>رقم الطالب</FormLabel>
                    <InputGroup>
                      <InputLeftElement>
                        <FaIdBadge color="gray.300" />
                      </InputLeftElement>
                      <Input
                        value={studentId}
                        onChange={(e) => setStudentId(e.target.value)}
                        placeholder="أدخل رقم الطالب (ID)"
                        type="number"
                        size="lg"
                        borderRadius="xl"
                      />
                    </InputGroup>
                  </FormControl>
                </VStack>
              </TabPanel>
              <TabPanel>
                <VStack spacing={4} align="stretch">
                  <FormControl isRequired>
                    <FormLabel>اسم الطالب</FormLabel>
                    <InputGroup>
                      <InputLeftElement>
                        <FaUser color="gray.300" />
                      </InputLeftElement>
                      <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="أدخل اسم الطالب" size="lg" borderRadius="xl" />
                    </InputGroup>
                  </FormControl>
                  <FormControl isRequired>
                    <FormLabel>هاتف الطالب</FormLabel>
                    <InputGroup>
                      <InputLeftElement>
                        <FaPhone color="gray.300" />
                      </InputLeftElement>
                      <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="01000000000" size="lg" borderRadius="xl" />
                    </InputGroup>
                  </FormControl>
                  <FormControl isRequired>
                    <FormLabel>هاتف ولي الأمر</FormLabel>
                    <InputGroup>
                      <InputLeftElement>
                        <FaPhone color="gray.300" />
                      </InputLeftElement>
                      <Input value={parentPhone} onChange={(e) => setParentPhone(e.target.value)} placeholder="01111111111" size="lg" borderRadius="xl" />
                    </InputGroup>
                  </FormControl>
                </VStack>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </ModalBody>
        <ModalFooter>
          <HStack spacing={3}>
            <Button variant="ghost" onClick={handleClose}>إلغاء</Button>
            {activeTab === 0 ? (
              <Button colorScheme="blue" onClick={submitByCode} isLoading={loading}>إضافة بالكود</Button>
            ) : (
              <Button colorScheme="blue" onClick={submitByName} isLoading={loading}>إضافة بالاسم</Button>
            )}
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default AddStudentDualModal;