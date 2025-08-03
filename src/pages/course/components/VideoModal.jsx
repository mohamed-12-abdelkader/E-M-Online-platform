import React, { useState, useEffect } from "react";
import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton, VStack, FormControl, FormLabel, Input, Button } from "@chakra-ui/react";

const VideoModal = ({ isOpen, onClose, type, data, lectureId, onSubmit, loading }) => {
  const [formData, setFormData] = useState({
    video_url: data?.video_url || '',
    title: data?.title || '',
    position: data?.position || 1
  });

  useEffect(() => {
    if (data) {
      setFormData({
        video_url: data.video_url || '',
        title: data.title || '',
        position: data.position || 1
      });
    }
  }, [data]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (type === 'edit') {
      onSubmit(data.id, formData);
    } else {
      onSubmit(lectureId, formData);
    }
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          {type === 'add' ? 'إضافة فيديو جديد' : 'تعديل الفيديو'}
        </ModalHeader>
        <ModalCloseButton />
        <form onSubmit={handleSubmit}>
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>رابط الفيديو</FormLabel>
                <Input
                  value={formData.video_url}
                  onChange={(e) => setFormData({...formData, video_url: e.target.value})}
                  placeholder="أدخل رابط الفيديو"
                />
              </FormControl>
              <FormControl>
                <FormLabel>عنوان الفيديو (اختياري)</FormLabel>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder="أدخل عنوان الفيديو"
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>ترتيب الفيديو</FormLabel>
                <Input
                  type="number"
                  value={formData.position}
                  onChange={(e) => setFormData({...formData, position: parseInt(e.target.value)})}
                  placeholder="أدخل ترتيب الفيديو"
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

export default VideoModal; 