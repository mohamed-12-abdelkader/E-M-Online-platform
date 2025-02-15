import React, { useState } from "react";
import {
  Box,
  Flex,
  Text,
  VStack,
  HStack,
  Icon,
  Button,
  useColorModeValue,
  useToast,
  Spinner,
} from "@chakra-ui/react";
import { FaPhoneAlt, FaFilePdf } from "react-icons/fa";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const TeacherCode = () => {
  const toast = useToast();
  const [isExporting, setIsExporting] = useState(false);

  const codes = JSON.parse(localStorage.getItem("code")) || {
    name: "",
    codes: [],
  };
  const cardBg = useColorModeValue("white", "gray.700");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const textColor = useColorModeValue("gray.800", "white");

  const exportToPDF = async () => {
    if (codes.codes.length === 0) {
      toast({
        title: "لا توجد أكواد لتصديرها!",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsExporting(true);
    const pdf = new jsPDF("p", "mm", "a4");
    const codesPerPage = 12;
    // تقليل عدد الأكواد بالصفحة ليكون التصميم أوسع

    for (let i = 0; i < codes.codes.length; i += codesPerPage) {
      const tempDiv = document.createElement("div");
      tempDiv.style.position = "absolute";
      tempDiv.style.left = "-9999px";
      tempDiv.style.width = "900px"; // زيادة عرض الصفحة
      document.body.appendChild(tempDiv);

      tempDiv.innerHTML = `
      <div class='' style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; padding: 6px; background: white;">
        ${codes.codes
          .slice(i, i + codesPerPage)
          .map(
            (code, index) => `
          <div class='code' style="padding: 10px; height: 180px; border: 1px solid #e2e8f0; border-radius: 8px; box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1); text-align: center; position: relative; overflow: hidden;">
    <div style="display: flex; justify-content: space-between; align-items: center; padding: 4px 0;">
    <h1 style="font-size: 16px; font-weight: bold; color: #3182ce; margin-bottom: 6px;">${
      codes.name
    }</h1>
      <h3 style="font-size: 14px; font-weight: bold; color: #c53030;"> رقم الكود : ${
        i + index + 1
      } </h3>
        </div>
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 4px 0;">
              <h3 style="font-size: 20px; font-weight: bold; color: #c53030;"> كود التفعيل :</h3>
              <h3 style="font-size: 20px; font-weight: bold; color: #c53030;"> ${code}</h3>
            </div>
           <div style=" margin-top: 35px;">
           <FaPhoneAlt/>
           <p style="font-size: 15px; font-weight: bold; color: #4a5568; display: flex; justify-content: center; align-items: center; gap: 6px;">
           01286525940 | 01111272393
           </p>
           </div>
          </div>`
          )
          .join("")}
      </div>
    `;

      const canvas = await html2canvas(tempDiv, { scale: 2, useCORS: true });
      pdf.addImage(
        canvas.toDataURL("image/png"),
        "PNG",
        10,
        10,
        190,
        (canvas.height * 190) / canvas.width
      );
      if (i + codesPerPage < codes.codes.length) pdf.addPage();
      document.body.removeChild(tempDiv);
    }

    pdf.save("teacher_codes.pdf");
    setIsExporting(false);
  };

  return (
    <Box my='120px' w='100%' mx='auto'>
      <Button
        colorScheme='red'
        mb='6'
        onClick={exportToPDF}
        leftIcon={<FaFilePdf />}
      >
        {isExporting ? <Spinner size='sm' /> : "تصدير الأكواد كـ PDF"}
      </Button>
      {codes.codes.length === 0 ? (
        <Text fontSize='lg' color='gray.500' textAlign='center'>
          لا توجد أكواد متاحة حاليًا
        </Text>
      ) : (
        <Flex flexWrap='wrap' gap='6' justifyContent='center'>
          {codes.codes.map((code, index) => (
            <Box
              className='code'
              key={index}
              flex={{ base: "1 1 100%", md: "1 1 calc(33.33% - 24px)" }}
              maxW={{ base: "100%", md: "calc(33.33% - 24px)" }}
              p='6'
              borderWidth='1px'
              borderColor={borderColor}
              borderRadius='xl'
              boxShadow='md'
              bg={cardBg}
              transition='all 0.2s'
              _hover={{ transform: "scale(1.02)", boxShadow: "lg" }}
            >
              <VStack align='start' spacing='4'>
                <div className='flex justify-between w-[100%]'>
                  <Text fontSize='xl' fontWeight='bold' color='blue.500'>
                    {codes.name}
                  </Text>
                  <Text fontSize='xl' fontWeight='bold' color='blue.500'>
                    {index + 1} رقم الكود
                  </Text>
                </div>
                <div className='flex justify-between w-[100%]'>
                  <h1>كود التفعيل:</h1>
                  <h1>{code}</h1>
                </div>
                <VStack align='start' spacing='2' mt='4'>
                  <Text fontSize='md' fontWeight='semibold' color={textColor}>
                    أرقام الدعم الفني:
                  </Text>
                  <HStack spacing='4'>
                    <HStack>
                      <Icon as={FaPhoneAlt} color='green.400' boxSize='5' />
                      <Text fontWeight='medium' color={textColor}>
                        01286525940
                      </Text>
                    </HStack>
                    <HStack>
                      <Icon as={FaPhoneAlt} color='green.400' boxSize='5' />
                      <Text fontWeight='medium' color={textColor}>
                        01111272393
                      </Text>
                    </HStack>
                  </HStack>
                </VStack>
              </VStack>
            </Box>
          ))}
        </Flex>
      )}
    </Box>
  );
};

export default TeacherCode;
