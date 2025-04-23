import {
    Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton,
    ModalBody, ModalFooter, Button, Input, Stack
  } from '@chakra-ui/react';
  import { useState } from 'react';
  
  const AddStudentModal = ({ isOpen, onClose, onAdd }) => {
    const [form, setForm] = useState({
      name: '',
      code: '',
      attendance: 0,
      level: '',
      absence: '',
    });
  
    const handleChange = (e) => {
      setForm({ ...form, [e.target.name]: e.target.value });
    };
  
    const handleSubmit = () => {
      onAdd(form);
      setForm({ name: '', code: '', attendance: 0, level: '', absence: '' });
      onClose();
    };
  
    return (
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>إضافة طالب</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Stack spacing={3}>
              <Input placeholder="الاسم" name="name" value={form.name} onChange={handleChange} />
              <Input placeholder="الكود" name="code" value={form.code} onChange={handleChange} />
              <Input type="number" placeholder="الحضور" name="attendance" value={form.attendance} onChange={handleChange} />
              <Input placeholder="المستوى الدراسي" name="level" value={form.level} onChange={handleChange} />
              <Input placeholder="نسبة الغياب" name="absence" value={form.absence} onChange={handleChange} />
            </Stack>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="teal" onClick={handleSubmit}>إضافة</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    );
  };
  
  export default AddStudentModal;
  