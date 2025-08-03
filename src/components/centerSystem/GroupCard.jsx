import { 
  Box, Text, VStack, HStack, Icon, useColorModeValue, 
  Button, IconButton, Badge, Tooltip, useDisclosure,
  AlertDialog, AlertDialogBody, AlertDialogFooter, AlertDialogHeader,
  AlertDialogContent, AlertDialogOverlay, AlertDialogCloseButton
} from '@chakra-ui/react';
import { LuClock3, LuUsers, LuCalendar } from 'react-icons/lu';
import { MdEdit, MdDelete } from 'react-icons/md';
import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';

const GroupCard = ({ group, onEdit, onDelete, loading = false }) => {
  const cardBg = useColorModeValue('blue.50', 'blue.700');
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = useRef();

  const formatTime = (timeString) => {
    if (!timeString) return '';
    return timeString.substring(0, 5); // إزالة الثواني
  };

  const formatDays = (daysString) => {
    if (!daysString) return '';
    return daysString.split(',').join('، ');
  };

  const handleDelete = () => {
    onDelete(group.id);
    onClose();
  };

  const handleCardClick = (e) => {
    // إذا تم النقر على أزرار التعديل أو الحذف، لا ننتقل للتفاصيل
    if (e.target.closest('button') || e.target.closest('[role="button"]')) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
  };

  return (
    <>
      <Link to={`/group_details/${group.id}`} style={{ textDecoration: 'none' }}>
    <Box
      w="full"
      maxW="sm"
      borderWidth="1px"
      borderRadius="lg"
      overflow="hidden"
      bg="white"
      _dark={{ bg: 'gray.800' }}
      boxShadow="md"
          _hover={{ boxShadow: 'lg', transform: 'translateY(-2px)' }}
          transition="all 0.2s"
          cursor="pointer"
          onClick={handleCardClick}
    >
          <Box className='bg-gradient-to-r from-blue-500 to-blue-600' p={6} display="flex" justifyContent="center" position="relative">
            <img 
              src='/96cf8422-1635-4226-a6d8-5d44ee3f2218.jpg' 
              className='h-[70px] w-[70px]' 
              style={{borderRadius:"50%"}}
              alt="Group"
            />
            
            {/* أزرار التعديل والحذف */}
            <HStack position="absolute" top={2} right={2} spacing={1}>
              <Tooltip label="تعديل المجموعة" hasArrow>
                <IconButton
                  icon={<MdEdit />}
                  size="sm"
                  colorScheme="yellow"
                  variant="solid"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onEdit(group);
                  }}
                  aria-label="تعديل المجموعة"
                />
              </Tooltip>
              <Tooltip label="حذف المجموعة" hasArrow>
                <IconButton
                  icon={<MdDelete />}
                  size="sm"
                  colorScheme="red"
                  variant="solid"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onOpen();
                  }}
                  aria-label="حذف المجموعة"
                />
              </Tooltip>
            </HStack>
      </Box>

          <VStack align="start" spacing={3} px={5} pb={5}>
            <Text fontSize="xl" fontWeight="bold" color="gray.800" noOfLines={2}>
        {group.name}
        </Text>

            <HStack spacing={2} flexWrap="wrap">
              <Badge colorScheme="blue" fontSize="xs">
                <HStack spacing={1}>
                  <Icon as={LuUsers} />
                  <Text>{group.students_count || 0} طالب</Text>
                </HStack>
              </Badge>
              {group.teacher_name && (
                <Badge colorScheme="green" fontSize="xs">
                  {group.teacher_name}
                </Badge>
              )}
            </HStack>

            <VStack align="start" spacing={2} width="100%">
              <HStack spacing={2} color="blue.700">
          <Icon as={LuClock3} />
                <Text fontSize="sm" fontWeight="medium">
                  {formatTime(group.start_time)} - {formatTime(group.end_time)}
                </Text>
              </HStack>
              
              <HStack spacing={2} color="purple.700">
                <Icon as={LuCalendar} />
                <Text fontSize="sm" fontWeight="medium">
                  {formatDays(group.days)}
                </Text>
        </HStack>
            </VStack>

            <Text fontSize="xs" color="gray.500" mt={2}>
              تم الإنشاء: {new Date(group.created_at).toLocaleDateString('ar-EG')}
            </Text>
      </VStack>
    </Box>
      </Link>

      {/* Alert Dialog للحذف */}
      <AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={cancelRef}
        onClose={onClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              حذف المجموعة
            </AlertDialogHeader>

            <AlertDialogBody>
              هل أنت متأكد من حذف مجموعة "{group.name}"؟ لا يمكن التراجع عن هذه العملية.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onClose}>
                إلغاء
              </Button>
              <Button 
                colorScheme="red" 
                onClick={handleDelete} 
                ml={3}
                isLoading={loading}
                loadingText="جاري الحذف..."
              >
                حذف
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </>
  );
};

export default GroupCard;
