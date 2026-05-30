import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Button,
  Box,
  Text,
  HStack,
  IconButton,
  Spinner,
  useToast,
} from "@chakra-ui/react";
import { FaChevronLeft, FaChevronRight, FaCrop } from "react-icons/fa";
import * as pdfjsLib from "pdfjs-dist";
import pdfjsWorker from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import baseUrl from "../../api/baseUrl";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

const MIN_CROP_SIZE = 20;
const MAX_UPLOAD_DIMENSION = 2400;
const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;

const canvasToJpegFile = (canvas, quality = 0.88) =>
  new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("تعذر إنشاء ملف الصورة"));
          return;
        }
        resolve(
          new File([blob], `question-crop-${Date.now()}.jpg`, {
            type: "image/jpeg",
          })
        );
      },
      "image/jpeg",
      quality
    );
  });

/** Crop from source canvas, resize if needed, export as JPEG for reliable CDN upload */
const buildUploadFileFromCrop = async (sourceCanvas, sx, sy, sw, sh) => {
  let outW = sw;
  let outH = sh;
  const maxDim = Math.max(outW, outH);
  if (maxDim > MAX_UPLOAD_DIMENSION) {
    const scale = MAX_UPLOAD_DIMENSION / maxDim;
    outW = Math.round(sw * scale);
    outH = Math.round(sh * scale);
  }

  const out = document.createElement("canvas");
  out.width = Math.max(1, outW);
  out.height = Math.max(1, outH);
  const ctx = out.getContext("2d");
  ctx.drawImage(sourceCanvas, sx, sy, sw, sh, 0, 0, outW, outH);

  const qualities = [0.88, 0.72, 0.55];
  let file = null;
  for (const q of qualities) {
    file = await canvasToJpegFile(out, q);
    if (file.size <= MAX_UPLOAD_BYTES) break;
  }

  if (!file || file.size < 100) {
    throw new Error("ملف الصورة فارغ أو تالف — جرّب منطقة قص أصغر");
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new Error("الصورة كبيرة جداً بعد الضغط — قلّل منطقة القص");
  }
  return file;
};

const extractImageUrl = (data) =>
  data?.image_url ??
  data?.url ??
  data?.data?.image_url ??
  data?.data?.url ??
  null;

const uploadQuestionImage = (file, token) => {
  const formData = new FormData();
  formData.append("image", file);

  return baseUrl.post("/api/teacher/questions/upload-image", formData, {
    headers: { Authorization: `Bearer ${token}` },
    timeout: 120000,
  });
};

/**
 * @param {{ isOpen: boolean, onClose: () => void, source: { file: File, url: string, type: 'image'|'pdf' } | null, onUploaded: (imageUrl: string) => void }} props
 */
const QuestionDocumentCropModal = ({
  isOpen,
  onClose,
  source,
  onUploaded,
}) => {
  const toast = useToast();
  const containerRef = useRef(null);
  const displayCanvasRef = useRef(null);
  const sourceCanvasRef = useRef(null);

  const [pdfPage, setPdfPage] = useState(1);
  const [pdfPageCount, setPdfPageCount] = useState(1);
  const [loadingSource, setLoadingSource] = useState(false);
  const [renderSize, setRenderSize] = useState({ w: 0, h: 0 });
  const [crop, setCrop] = useState(null);
  const [dragStart, setDragStart] = useState(null);
  const [uploading, setUploading] = useState(false);

  const resetCrop = () => setCrop(null);

  const renderPdfPage = useCallback(async (file, pageNum) => {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    setPdfPageCount(pdf.numPages);
    const page = await pdf.getPage(pageNum);
    const viewport = page.getViewport({ scale: 2 });
    const canvas = sourceCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    await page.render({ canvasContext: ctx, viewport }).promise;
    setRenderSize({ w: viewport.width, h: viewport.height });
  }, []);

  const renderImageSource = useCallback(async (url) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
      img.src = url;
    });
    const canvas = sourceCanvasRef.current;
    if (!canvas) return;
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0);
    setRenderSize({ w: img.naturalWidth, h: img.naturalHeight });
    setPdfPageCount(1);
  }, []);

  const paintDisplayCanvas = useCallback(() => {
    const src = sourceCanvasRef.current;
    const display = displayCanvasRef.current;
    const container = containerRef.current;
    if (!src || !display || !container || !src.width) return;

    const maxW = container.clientWidth || 700;
    const scale = Math.min(1, maxW / src.width);
    const dw = Math.floor(src.width * scale);
    const dh = Math.floor(src.height * scale);
    display.width = dw;
    display.height = dh;
    const ctx = display.getContext("2d");
    ctx.drawImage(src, 0, 0, dw, dh);
    setRenderSize({ w: dw, h: dh, naturalW: src.width, naturalH: src.height });
  }, []);

  useEffect(() => {
    if (!isOpen || !source) return;
    let cancelled = false;

    const load = async () => {
      setLoadingSource(true);
      resetCrop();
      try {
        if (source.type === "pdf") {
          await renderPdfPage(source.file, pdfPage);
        } else {
          await renderImageSource(source.url);
        }
        if (!cancelled) {
          requestAnimationFrame(() => paintDisplayCanvas());
        }
      } catch {
        if (!cancelled) {
          toast({
            title: "خطأ",
            description: "تعذر تحميل المستند للمعاينة",
            status: "error",
            duration: 4000,
            isClosable: true,
          });
        }
      } finally {
        if (!cancelled) setLoadingSource(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [isOpen, source, pdfPage, renderPdfPage, renderImageSource, paintDisplayCanvas, toast]);

  useEffect(() => {
    if (!isOpen) return;
    const onResize = () => paintDisplayCanvas();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [isOpen, paintDisplayCanvas]);

  useEffect(() => {
    if (isOpen && source?.type === "image") {
      setPdfPage(1);
    }
  }, [isOpen, source]);

  const getRelativePoint = (e) => {
    const rect = displayCanvasRef.current?.getBoundingClientRect();
    if (!rect) return null;
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const y = Math.max(0, Math.min(e.clientY - rect.top, rect.height));
    return { x, y };
  };

  const onPointerDown = (e) => {
    if (loadingSource || uploading) return;
    const pt = getRelativePoint(e);
    if (!pt) return;
    setDragStart(pt);
    setCrop({ x: pt.x, y: pt.y, w: 0, h: 0 });
  };

  const onPointerMove = (e) => {
    if (!dragStart) return;
    const pt = getRelativePoint(e);
    if (!pt) return;
    const x = Math.min(dragStart.x, pt.x);
    const y = Math.min(dragStart.y, pt.y);
    const w = Math.abs(pt.x - dragStart.x);
    const h = Math.abs(pt.y - dragStart.y);
    setCrop({ x, y, w, h });
  };

  const onPointerUp = () => {
    setDragStart(null);
  };

  const buildCroppedUploadFile = async () => {
    const src = sourceCanvasRef.current;
    const display = displayCanvasRef.current;
    if (!src || !crop || !display?.width) return null;

    const scaleX = src.width / display.width;
    const scaleY = src.height / display.height;
    const sx = Math.round(crop.x * scaleX);
    const sy = Math.round(crop.y * scaleY);
    const sw = Math.max(1, Math.round(crop.w * scaleX));
    const sh = Math.max(1, Math.round(crop.h * scaleY));

    return buildUploadFileFromCrop(src, sx, sy, sw, sh);
  };

  const handleApplyCrop = async () => {
    if (!crop || crop.w < MIN_CROP_SIZE || crop.h < MIN_CROP_SIZE) {
      toast({
        title: "تنبيه",
        description: "ارسم مستطيلاً حول منطقة السؤال أولاً",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setUploading(true);
    try {
      const file = await buildCroppedUploadFile();
      if (!file) throw new Error("فشل إعداد ملف القص");

      const token = localStorage.getItem("token");
      if (!token) throw new Error("يجب تسجيل الدخول أولاً");

      const response = await uploadQuestionImage(file, token);
      const imageUrl = extractImageUrl(response.data);

      if (!imageUrl) {
        throw new Error("لم يُرجع الخادم رابط الصورة");
      }

      onUploaded(imageUrl);
      toast({
        title: "تم الرفع",
        description: "تم ربط صورة السؤال",
        status: "success",
        duration: 2500,
        isClosable: true,
      });
      onClose();
    } catch (error) {
      const data = error.response?.data;
      const msg =
        data?.message ||
        data?.error ||
        (typeof data === "string" ? data : null) ||
        error.message ||
        "فشل رفع الصورة";
      toast({ title: "خطأ", description: msg, status: "error", duration: 5000, isClosable: true });
    } finally {
      setUploading(false);
    }
  };

  const draggingActive = !!dragStart;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="5xl" isCentered scrollBehavior="inside">
      <ModalOverlay />
      <ModalContent maxH="95vh" dir="rtl">
        <ModalHeader>قص صورة السؤال من المستند</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          {!source ? (
            <Text color="gray.600" py={8} textAlign="center">
              لا يوجد مستند للمعاينة. ارفع PDF أو صورة أولاً.
            </Text>
          ) : (
          <>
          <Text fontSize="sm" color="gray.600" mb={3}>
            اسحب على المستند لتحديد منطقة السؤال (أشكال، رسوم بيانية، …) ثم اضغط «تطبيق القص».
          </Text>

          {source?.type === "pdf" && pdfPageCount > 1 && (
            <HStack justify="center" mb={3}>
              <IconButton
                icon={<FaChevronRight />}
                aria-label="الصفحة السابقة"
                size="sm"
                isDisabled={pdfPage <= 1 || loadingSource}
                onClick={() => {
                  resetCrop();
                  setPdfPage((p) => Math.max(1, p - 1));
                }}
              />
              <Text fontWeight="bold">
                صفحة {pdfPage} / {pdfPageCount}
              </Text>
              <IconButton
                icon={<FaChevronLeft />}
                aria-label="الصفحة التالية"
                isDisabled={pdfPage >= pdfPageCount || loadingSource}
                onClick={() => {
                  resetCrop();
                  setPdfPage((p) => Math.min(pdfPageCount, p + 1));
                }}
              />
            </HStack>
          )}

          <Box
            ref={containerRef}
            position="relative"
            w="100%"
            minH="200px"
            bg="gray.100"
            borderRadius="lg"
            overflow="auto"
            display="flex"
            justifyContent="center"
            alignItems="flex-start"
            py={2}
          >
            <canvas ref={sourceCanvasRef} style={{ display: "none" }} />
            {loadingSource ? (
              <Spinner size="lg" my={20} />
            ) : (
              <Box
                position="relative"
                display="inline-block"
                cursor="crosshair"
                onMouseDown={onPointerDown}
                onMouseMove={draggingActive ? onPointerMove : undefined}
                onMouseUp={onPointerUp}
                onMouseLeave={onPointerUp}
                userSelect="none"
              >
                <canvas ref={displayCanvasRef} style={{ display: "block", maxWidth: "100%" }} />
                {crop && crop.w > 0 && crop.h > 0 && (
                  <Box
                    position="absolute"
                    left={`${crop.x}px`}
                    top={`${crop.y}px`}
                    width={`${crop.w}px`}
                    height={`${crop.h}px`}
                    border="2px dashed"
                    borderColor="purple.400"
                    bg="purple.200"
                    opacity={0.35}
                    pointerEvents="none"
                  />
                )}
              </Box>
            )}
          </Box>
          </>
          )}
        </ModalBody>
        <ModalFooter>
          <Button
            colorScheme="purple"
            leftIcon={<FaCrop />}
            onClick={handleApplyCrop}
            isLoading={uploading}
            isDisabled={loadingSource || !crop || !source}
          >
            تطبيق القص ورفع الصورة
          </Button>
          <Button variant="ghost" ml={3} onClick={onClose} isDisabled={uploading}>
            إلغاء
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default QuestionDocumentCropModal;
