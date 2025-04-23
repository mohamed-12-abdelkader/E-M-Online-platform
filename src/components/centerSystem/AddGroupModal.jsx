import {
    Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton,
    ModalBody, ModalFooter, Button, Input, useToast
  } from '@chakra-ui/react';
  import { useState } from 'react';
  
  const AddGroupModal = ({ isOpen, onClose, onAdd }) => {
    const [name, setName] = useState('');
    const toast = useToast();
  
    const handleAdd = () => {
      if (name.trim() === '') return toast({ title: 'من فضلك أدخل اسم المجموعة', status: 'warning' });
      onAdd({ name });
      setName('');
    };
  
    return (
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>إنشاء مجموعة جديدة</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Input placeholder="اسم المجموعة" value={name} onChange={(e) => setName(e.target.value)} />
          </ModalBody>
          <ModalFooter>
            <Button onClick={handleAdd} colorScheme="teal">إنشاء</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    );
  };
  
  export default AddGroupModal;
  