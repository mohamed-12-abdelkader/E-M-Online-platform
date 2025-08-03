import React, { useState, useEffect } from "react";
import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton, VStack, FormControl, FormLabel, Input, Textarea, Button } from "@chakra-ui/react";

const LectureModal = ({ isOpen, onClose, type, data, onSubmit, loading }) => {
  const [formData, setFormData] = useState({
    title: data?.title || '',
    description: data?.description || '',
    position: data?.position || 1
  });

  useEffect(() => {
    if (data) {
      setFormData({
        title: data.title || '',
        description: data.description || '',
        position: data.position || 1
      });
    }
  }, [data]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (type === 'edit') {
      onSubmit(data.id, formData);
    } else {
      onSubmit(formData);
    }
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          {type === 'add' ? 'إضافة محاضرة جديدة' : 'تعديل المحاضرة'}
        </ModalHeader>
        <ModalCloseButton />
        <form onSubmit={handleSubmit}>
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>عنوان المحاضرة</FormLabel>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder="أدخل عنوان المحاضرة"
                />
              </FormControl>
              <FormControl>
                <FormLabel>وصف المحاضرة (اختياري)</FormLabel>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="أدخل وصف المحاضرة"
                  rows={3}
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>ترتيب المحاضرة</FormLabel>
                <Input
                  type="number"
                  value={formData.position}
                  onChange={(e) => setFormData({...formData, position: parseInt(e.target.value)})}
                  placeholder="أدخل ترتيب المحاضرة"
                />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              إلغاء
            </Button>
            <Button colorScheme="blue" type="submit" isLoading={loading}>
              {type === 'add' ? 'إضافة' : 'تعديل'}
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
};

export default LectureModal; 