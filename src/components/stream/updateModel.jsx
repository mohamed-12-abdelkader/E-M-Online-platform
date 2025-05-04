import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  Checkbox,
  Button,
  Stack,
  Text,
  Image,
} from "@chakra-ui/react";
import { useState, useEffect, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import baseUrl from "../../api/baseUrl";
import { toast } from "react-toastify";

const UpdateStreamModal = ({ isOpen, onClose, onSuccess, stream }) => {
  const [form, setForm] = useState({
    title: "",
    description: "",
    allowChat: true,
    canPublishSources: [],
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (stream) {
      setForm({
        title: stream.title || "",
        description: stream.description || "",
        allowChat: stream.allow_chat ?? true,
        canPublishSources: stream.can_publish_sources || [],
      });
      setImagePreview(stream.cover_image || null);
    }
  }, [stream]);

  const toggleSource = (source) => {
    setForm((prev) => {
      const exists = prev.canPublishSources.includes(source);
      return {
        ...prev,
        canPublishSources: exists
          ? prev.canPublishSources.filter((s) => s !== source)
          : [...prev.canPublishSources, source],
      };
    });
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  }, []);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    multiple: false,
  });

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("title", form.title);
      if (form.description) formData.append("description", form.description);
      formData.append("allowChat", form.allowChat);
      formData.append(
        "canPublishSources",
        JSON.stringify(form.canPublishSources)
      );
      if (imageFile) formData.append("cover_image", imageFile);

      const { data } = await baseUrl.put(`/api/meet/${stream.id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          token: localStorage.getItem("token"),
        },
      });

      toast.success("تم تحديث البث بنجاح");
      onSuccess?.(data);
      onClose();
    } catch (err) {
      console.error(err);
      toast.error("فشل في تحديث البث");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg" isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>تحديث معلومات البث</ModalHeader>
        <ModalCloseButton position="absolute" top={2} left={2} right="auto" />
        <ModalBody>
          <Stack spacing={4}>
            <FormControl isRequired>
              <FormLabel>عنوان البث</FormLabel>
              <Input name="title" value={form.title} onChange={handleChange} />
            </FormControl>

            <FormControl>
              <FormLabel>الوصف</FormLabel>
              <Input
                name="description"
                value={form.description}
                onChange={handleChange}
              />
            </FormControl>

            <FormControl>
              <Checkbox
                name="allowChat"
                isChecked={form.allowChat}
                onChange={handleChange}
              >
                السماح بالمحادثة أثناء البث
              </Checkbox>
            </FormControl>

            <FormControl>
              <FormLabel>المصادر المسموح بها</FormLabel>
              <Stack pl={2}>
                {[
                  { key: "camera", label: "الكاميرا" },
                  { key: "microphone", label: "الميكروفون" },
                  { key: "screen_share", label: "مشاركة الشاشة" },
                  { key: "screen_share_audio", label: "صوت مشاركة الشاشة" },
                ].map((source) => (
                  <Checkbox
                    key={source.key}
                    isChecked={form.canPublishSources.includes(source.key)}
                    onChange={() => toggleSource(source.key)}
                  >
                    {source.label}
                  </Checkbox>
                ))}
              </Stack>
            </FormControl>

            <FormControl>
              <FormLabel>تغيير صورة الغلاف</FormLabel>
              <div
                {...getRootProps()}
                style={{
                  border: "2px dashed #ccc",
                  padding: "1rem",
                  textAlign: "center",
                  cursor: "pointer",
                }}
              >
                <input {...getInputProps()} />
                {imagePreview ? (
                  <Image
                    src={imagePreview}
                    alt="Preview"
                    maxH="150px"
                    mx="auto"
                  />
                ) : (
                  <Text color="gray.500">اختر صورة جديدة</Text>
                )}
              </div>
            </FormControl>
          </Stack>
        </ModalBody>

        <ModalFooter>
          <Button variant="ghost" ml={3} onClick={onClose}>
            إلغاء
          </Button>
          <Button colorScheme="blue" isLoading={loading} onClick={handleSubmit}>
            تحديث
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default UpdateStreamModal;
