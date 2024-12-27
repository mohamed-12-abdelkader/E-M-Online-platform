import { MdCancelPresentation, MdOutlineVideoLibrary } from "react-icons/md";
import useGitFreeCourses from "../../Hooks/student/useGitFreeCourses";
import {
  Button,
  Card,
  CardBody,
  Skeleton,
  Stack,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
} from "@chakra-ui/react";
import { Link } from "react-router-dom";
import BuyLecture from "../../Hooks/student/BuyLecture";
import { useState } from "react";
import { CoursesCard } from "../../ui/card/CoursesCard";

const FreeCourses = () => {
  const [freeMonth, freeMonthLoading] = useGitFreeCourses();
  const [buyLoading, buyLecture, buyMonth] = BuyLecture();
  const { isOpen, onOpen, onClose } = useDisclosure(); // للتحكم في المودال
  const [selectedLectureId, setSelectedLectureId] = useState(null); // لتخزين الـ ID الخاص بالكورس المحدد

  // دالة لفتح المودال وتحديد الكورس
  const openConfirmationModal = (id) => {
    setSelectedLectureId(id);
    onOpen(); // فتح المودال
  };

  // دالة لتفعيل الشهر بعد التأكيد
  const handleBuyMonth = () => {
    if (selectedLectureId) {
      buyMonth(selectedLectureId); // تنفيذ عملية الشراء بعد التأكيد
      onClose(); // غلق المودال
    }
  };
  {
    freeMonthLoading ? console.log("loading") : console.log("fre", freeMonth);
  }

  return (
    <div className='p-'>
      <div>
        <h1
          className='fonts font-bold text-3xl flex text-[#03a9f5] my-3'
          style={{ fontWeight: "bold", fontSize: "30px" }}
        >
          <MdOutlineVideoLibrary className='m-1 mx-2 text-red-500' />
          الكورسات المجانية
        </h1>
      </div>
      <div className=' w-[90%] m-auto'>
        {freeMonthLoading ? (
          <Stack className='w-[90%] m-auto my-5'>
            <Skeleton height='20px' className='mt-5' />
            <Skeleton height='20px' />
            <Skeleton height='20px' />
            <Skeleton height='20px' />
            <Skeleton height='20px' />
            <Skeleton height='20px' />
            <Skeleton height='20px' />
          </Stack>
        ) : freeMonth && freeMonth.months.length > 0 ? (
          <div dir='rtl' className='w-[100%]  '>
            <div
              className=' m-auto card-content  bg- p- flex justify-center md:justify-start flex-wrap'
              style={{ borderRadius: "20px" }}
            >
              {freeMonth.months.map((lectre) => (
                <CoursesCard
                  key={lectre.id}
                  lectre={lectre}
                  type={"freeCourses"}
                  onClick={() => openConfirmationModal(lectre.id)}
                  href={`/month/${lectre.id}`}
                />
              ))}
            </div>
          </div>
        ) : (
          <div
            className='text-center py-5 bg-white h-[200px] flex justify-center items-center'
            style={{ borderRadius: "20px" }}
          >
            <h1 className='font-bold flex justify-center text-black'>
              <MdCancelPresentation className='m-1 text-red-500' />
              لا يوجد كورسات مجانية الان
            </h1>
          </div>
        )}
      </div>

      {/* مودال التأكيد */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>تأكيد التفعيل</ModalHeader>

          <ModalBody>هل أنت متأكد من أنك تريد تفعيل هذا الكورس؟ </ModalBody>

          <ModalFooter>
            <Button variant='ghost' onClick={onClose}>
              إلغاء
            </Button>
            <Button
              colorScheme='blue'
              onClick={handleBuyMonth}
              isLoading={buyLoading}
              ml={3}
            >
              تفعيل
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
};

export default FreeCourses;
