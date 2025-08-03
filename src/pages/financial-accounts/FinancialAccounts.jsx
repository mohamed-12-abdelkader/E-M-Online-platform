import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Flex,
  Heading,
  Text,
  SimpleGrid,
  useColorModeValue,
  Icon,
  Badge,
  Divider,
  VStack,
  HStack,
  Button,
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
  Select,
  Textarea,
  useToast,
  useDisclosure,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  IconButton,
  Tooltip,
  Card,
  CardBody,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Spinner,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Progress,
  Alert,
  AlertIcon,
} from "@chakra-ui/react";
import {
  FaMoneyBillWave,
  FaArrowUp,
  FaArrowDown,
  FaChartLine,
  FaPlusCircle,
  FaMinusCircle,
  FaEdit,
  FaTrash,
  FaCalendar,
  FaFilter,
  FaDownload,
} from "react-icons/fa";
import { MdOutlineReceiptLong, MdOutlineCreditCard } from "react-icons/md";
import baseUrl from "../../api/baseUrl";

const FinancialAccounts = () => {
  // States
  const [income, setIncome] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  const [filters, setFilters] = useState({
    start_date: "",
    end_date: "",
    source_type: "",
    category: "",
  });

  // Modals
  const { isOpen: isIncomeModalOpen, onOpen: onIncomeModalOpen, onClose: onIncomeModalClose } = useDisclosure();
  const { isOpen: isExpenseModalOpen, onOpen: onExpenseModalOpen, onClose: onExpenseModalClose } = useDisclosure();
  const { isOpen: isDeleteModalOpen, onOpen: onDeleteModalOpen, onClose: onDeleteModalClose } = useDisclosure();

  // Form states
  const [incomeForm, setIncomeForm] = useState({
    title: "",
    description: "",
    amount: "",
    source_type: "",
    source_id: "",
    payment_method: "",
    transaction_date: "",
  });

  const [expenseForm, setExpenseForm] = useState({
    title: "",
    description: "",
    amount: "",
    category: "",
    expense_type: "",
    payment_method: "",
    transaction_date: "",
  });

  const [loadingAction, setLoadingAction] = useState(false);
  const toast = useToast();
  const cancelRef = React.useRef();

  // Colors
  const headerBg = useColorModeValue("blue.600", "gray.800");
  const headerTextColor = useColorModeValue("white", "whiteAlpha.900");
  const cardBg = useColorModeValue("white", "gray.700");
  const cardBorderColor = useColorModeValue("gray.200", "gray.600");
  const incomeColor = useColorModeValue("green.500", "green.300");
  const expenseColor = useColorModeValue("red.500", "red.300");
  const profitColor = useColorModeValue("purple.600", "purple.300");

  // Fetch data
  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      // Fetch income
      const incomeResponse = await baseUrl.get("/api/accounting/income", { headers });
      setIncome(incomeResponse.data.income || []);

      // Fetch expenses
      const expensesResponse = await baseUrl.get("/api/accounting/expenses", { headers });
      setExpenses(expensesResponse.data.expenses || []);

      // Fetch stats
      const statsResponse = await baseUrl.get("/api/accounting/stats", { headers });
      setStats(statsResponse.data.stats || {});

    } catch (error) {
      console.error("Error fetching data:", error);
      toast({
        title: "خطأ",
        description: "فشل في جلب البيانات المالية",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handle form changes
  const handleIncomeFormChange = (field, value) => {
    setIncomeForm(prev => ({ ...prev, [field]: value }));
  };

  const handleExpenseFormChange = (field, value) => {
    setExpenseForm(prev => ({ ...prev, [field]: value }));
  };

  // Add income
  const handleAddIncome = async () => {
    try {
      setLoadingAction(true);
      const token = localStorage.getItem("token");
      
      const response = await baseUrl.post("/api/accounting/income", incomeForm, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      toast({
        title: "نجح",
        description: "تم إضافة المدخول بنجاح",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      setIncomeForm({
        title: "",
        description: "",
        amount: "",
        source_type: "",
        source_id: "",
        payment_method: "",
        transaction_date: "",
      });
      onIncomeModalClose();
      fetchData();

    } catch (error) {
      console.error("Error adding income:", error);
      toast({
        title: "خطأ",
        description: error.response?.data?.message || "فشل في إضافة المدخول",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoadingAction(false);
    }
  };

  // Add expense
  const handleAddExpense = async () => {
    try {
      setLoadingAction(true);
      const token = localStorage.getItem("token");
      
      const response = await baseUrl.post("/api/accounting/expenses", expenseForm, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      toast({
        title: "نجح",
        description: "تم إضافة المصروف بنجاح",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      setExpenseForm({
        title: "",
        description: "",
        amount: "",
        category: "",
        expense_type: "",
        payment_method: "",
        transaction_date: "",
      });
      onExpenseModalClose();
      fetchData();

    } catch (error) {
      console.error("Error adding expense:", error);
      toast({
        title: "خطأ",
        description: error.response?.data?.message || "فشل في إضافة المصروف",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoadingAction(false);
    }
  };

  // Delete item
  const handleDelete = async () => {
    if (!selectedItem) return;

    try {
      setLoadingAction(true);
      const token = localStorage.getItem("token");
      const endpoint = selectedItem.type === "income" 
        ? `/api/accounting/income/${selectedItem.id}`
        : `/api/accounting/expenses/${selectedItem.id}`;

      await baseUrl.delete(endpoint, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast({
        title: "نجح",
        description: `تم حذف ${selectedItem.type === "income" ? "المدخول" : "المصروف"} بنجاح`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      onDeleteModalClose();
      fetchData();

    } catch (error) {
      console.error("Error deleting item:", error);
      toast({
        title: "خطأ",
        description: error.response?.data?.message || "فشل في الحذف",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoadingAction(false);
    }
  };

  // Open delete modal
  const openDeleteModal = (item, type) => {
    setSelectedItem({ ...item, type });
    onDeleteModalOpen();
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("ar-EG", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Stat Card Component
  const StatCard = ({ title, value, icon, color, subtitle }) => (
    <Card bg={cardBg} shadow="lg" borderRadius="xl" border="1px solid" borderColor={cardBorderColor}>
      <CardBody>
        <Stat>
          <HStack justify="space-between" mb={2}>
            <StatLabel color="gray.500" fontSize="sm">{title}</StatLabel>
            <Icon as={icon} color={color} boxSize={6} />
          </HStack>
          <StatNumber color={color} fontSize="2xl" fontWeight="bold">
            {value ? value.toLocaleString() : "0"} د.ع
          </StatNumber>
          {subtitle && <StatHelpText color="gray.500">{subtitle}</StatHelpText>}
        </Stat>
      </CardBody>
    </Card>
  );

  // Transaction Item Component
  const TransactionItem = ({ item, type, onDelete }) => (
    <HStack
      justify="space-between"
      align="center"
      p={4}
      bg={cardBg}
      borderRadius="md"
      border="1px solid"
      borderColor={cardBorderColor}
      _hover={{ shadow: "md" }}
      transition="all 0.2s"
    >
      <VStack align="start" spacing={1} flex={1}>
        <Text fontWeight="bold" fontSize="md">
          {item.title}
          </Text>
        {item.description && (
          <Text fontSize="sm" color="gray.600" noOfLines={1}>
            {item.description}
          </Text>
        )}
        <HStack spacing={4} fontSize="xs" color="gray.500">
          <HStack spacing={1}>
            <FaCalendar size={10} />
            <Text>{formatDate(item.transaction_date)}</Text>
          </HStack>
          <Badge colorScheme={type === "income" ? "green" : "red"} variant="subtle">
            {type === "income" ? item.source_type : item.category}
          </Badge>
        </HStack>
        </VStack>
      
      <VStack align="end" spacing={2}>
      <Text
        fontWeight="bold"
        fontSize="lg"
        color={type === "income" ? incomeColor : expenseColor}
      >
          {type === "expense" && "-"} {parseFloat(item.amount).toLocaleString()} د.ع
      </Text>
        <HStack spacing={1}>
          <Tooltip label="حذف" hasArrow>
            <IconButton
              icon={<FaTrash />}
              colorScheme="red"
              variant="ghost"
              size="sm"
              onClick={() => onDelete(item, type)}
            />
          </Tooltip>
        </HStack>
      </VStack>
    </HStack>
  );

  if (loading) {
    return (
      <Box minH="100vh" className="mt-[40px]" bg={useColorModeValue("gray.50", "gray.900")} py={10}>
        <Flex justify="center" align="center" minH="60vh">
          <VStack spacing={4}>
            <Spinner size="xl" color="blue.500" />
            <Text>جاري تحميل البيانات المالية...</Text>
          </VStack>
        </Flex>
      </Box>
    );
  }

  return (
    <Box minH="100vh" className="mt-[40px]" bg={useColorModeValue("gray.50", "gray.900")} py={10} dir="rtl">
      {/* Header */}
      <Flex
        as="header"
        align="center"
        justify="center"
        bg={headerBg}
        color={headerTextColor}
        py={8}
        mb={10}
        boxShadow="md"
        textAlign="center"
      >
        <VStack spacing={2}>
          <Icon as={MdOutlineReceiptLong} w={12} h={12} />
          <Heading as="h1" size="xl" fontWeight="extrabold">
            نظام الحسابات المالية
          </Heading>
          <Text fontSize="lg" opacity={0.9}>
            إدارة المدخلات والمصروفات والميزانية
          </Text>
        </VStack>
      </Flex>

      <Container maxW="7xl">
        {/* Statistics Cards */}
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6} mb={8}>
          <StatCard
            title="إجمالي المدخلات"
            value={stats.total_income || 0}
            icon={FaArrowUp}
            color={incomeColor}
            subtitle="جميع المدخلات"
          />
          <StatCard
            title="إجمالي المصروفات"
            value={stats.total_expenses || 0}
            icon={FaArrowDown}
            color={expenseColor}
            subtitle="جميع المصروفات"
          />
          <StatCard
            title="صافي الربح"
            value={stats.net_profit || 0}
            icon={FaChartLine}
            color={profitColor}
            subtitle={`نسبة الربح: ${stats.profit_margin || 0}%`}
          />
        </SimpleGrid>

        {/* Action Buttons */}
        <HStack justify="center" spacing={4} mb={8}>
            <Button
                leftIcon={<FaPlusCircle />}
                colorScheme="green"
                size="lg"
            onClick={onIncomeModalOpen}
                boxShadow="md"
                _hover={{ boxShadow: "lg", transform: "translateY(-2px)" }}
            >
            إضافة مدخول
            </Button>
            <Button
                leftIcon={<FaMinusCircle />}
                colorScheme="red"
                size="lg"
            onClick={onExpenseModalOpen}
                boxShadow="md"
                _hover={{ boxShadow: "lg", transform: "translateY(-2px)" }}
            >
                إضافة مصروف
            </Button>
        </HStack>

        {/* Tabs for Income and Expenses */}
        <Tabs variant="enclosed" colorScheme="blue" mb={8}>
          <TabList>
            <Tab>
              <HStack spacing={2}>
                <FaArrowUp color={incomeColor} />
                <Text>المدخلات ({income.length})</Text>
              </HStack>
            </Tab>
            <Tab>
              <HStack spacing={2}>
                <FaArrowDown color={expenseColor} />
                <Text>المصروفات ({expenses.length})</Text>
              </HStack>
            </Tab>
          </TabList>

          <TabPanels>
            <TabPanel>
              <VStack spacing={4} align="stretch">
                {income.length > 0 ? (
                  income.map((item) => (
                  <TransactionItem
                      key={item.id}
                      item={item}
                    type="income"
                      onDelete={openDeleteModal}
                  />
                ))
              ) : (
                  <Alert status="info" borderRadius="md">
                    <AlertIcon />
                    لا يوجد مدخلات حتى الآن
                  </Alert>
              )}
            </VStack>
            </TabPanel>

            <TabPanel>
              <VStack spacing={4} align="stretch">
                {expenses.length > 0 ? (
                  expenses.map((item) => (
                  <TransactionItem
                      key={item.id}
                      item={item}
                    type="expense"
                      onDelete={openDeleteModal}
                  />
                ))
              ) : (
                  <Alert status="info" borderRadius="md">
                    <AlertIcon />
                    لا يوجد مصروفات حتى الآن
                  </Alert>
              )}
            </VStack>
            </TabPanel>
          </TabPanels>
        </Tabs>

        {/* Detailed Statistics */}
        {stats.income_by_source && stats.expenses_by_category && (
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} mb={8}>
            <Card bg={cardBg} shadow="lg" borderRadius="xl">
              <CardBody>
                <Heading size="md" mb={4} color={incomeColor}>
                  المدخلات حسب المصدر
                </Heading>
                <VStack spacing={3} align="stretch">
                  {stats.income_by_source.map((source, index) => (
                    <Box key={index}>
                      <HStack justify="space-between" mb={1}>
                        <Text fontSize="sm" fontWeight="medium">
                          {source.source_type === "course_payment" ? "دفع كورس" :
                           source.source_type === "subscription" ? "اشتراك" : "أخرى"}
                        </Text>
                        <Text fontSize="sm" fontWeight="bold" color={incomeColor}>
                          {parseFloat(source.total).toLocaleString()} د.ع
                        </Text>
                      </HStack>
                      <Progress
                        value={(parseFloat(source.total) / (stats.total_income || 1)) * 100}
                        colorScheme="green"
                        size="sm"
                        borderRadius="full"
                      />
          </Box>
                  ))}
                </VStack>
              </CardBody>
            </Card>

            <Card bg={cardBg} shadow="lg" borderRadius="xl">
              <CardBody>
                <Heading size="md" mb={4} color={expenseColor}>
                  المصروفات حسب الفئة
            </Heading>
                <VStack spacing={3} align="stretch">
                  {stats.expenses_by_category.map((category, index) => (
                    <Box key={index}>
                      <HStack justify="space-between" mb={1}>
                        <Text fontSize="sm" fontWeight="medium">
                          {category.category === "hosting" ? "استضافة" :
                           category.category === "marketing" ? "تسويق" :
                           category.category === "salaries" ? "رواتب" :
                           category.category === "maintenance" ? "صيانة" : "أخرى"}
                        </Text>
                        <Text fontSize="sm" fontWeight="bold" color={expenseColor}>
                          {parseFloat(category.total).toLocaleString()} د.ع
            </Text>
                      </HStack>
                      <Progress
                        value={(parseFloat(category.total) / (stats.total_expenses || 1)) * 100}
                        colorScheme="red"
                        size="sm"
                        borderRadius="full"
                      />
                    </Box>
                  ))}
          </VStack>
              </CardBody>
            </Card>
          </SimpleGrid>
        )}
      </Container>

      {/* Add Income Modal */}
      <Modal isOpen={isIncomeModalOpen} onClose={onIncomeModalClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            <HStack spacing={2}>
              <FaPlusCircle color={incomeColor} />
              <Text>إضافة مدخول جديد</Text>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel fontWeight="bold">العنوان</FormLabel>
                <Input
                  value={incomeForm.title}
                  onChange={(e) => handleIncomeFormChange("title", e.target.value)}
                  placeholder="أدخل عنوان المدخول"
                />
              </FormControl>

              <FormControl>
                <FormLabel fontWeight="bold">الوصف</FormLabel>
                <Textarea
                  value={incomeForm.description}
                  onChange={(e) => handleIncomeFormChange("description", e.target.value)}
                  placeholder="أدخل وصف المدخول"
                  rows={3}
                />
              </FormControl>

              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} w="full">
                <FormControl isRequired>
                  <FormLabel fontWeight="bold">المبلغ</FormLabel>
                  <Input
                    type="number"
                    value={incomeForm.amount}
                    onChange={(e) => handleIncomeFormChange("amount", e.target.value)}
                    placeholder="أدخل المبلغ"
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel fontWeight="bold">نوع المصدر</FormLabel>
                  <Select
                    value={incomeForm.source_type}
                    onChange={(e) => handleIncomeFormChange("source_type", e.target.value)}
                    placeholder="اختر نوع المصدر"
                  >
                    <option value="course_payment">دفع كورس</option>
                    <option value="subscription">اشتراك</option>
                    <option value="other">أخرى</option>
                  </Select>
                </FormControl>
              </SimpleGrid>

              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} w="full">
                <FormControl>
                  <FormLabel fontWeight="bold">رقم المصدر</FormLabel>
                  <Input
                    type="number"
                    value={incomeForm.source_id}
                    onChange={(e) => handleIncomeFormChange("source_id", e.target.value)}
                    placeholder="رقم الكورس أو الاشتراك"
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel fontWeight="bold">طريقة الدفع</FormLabel>
                  <Select
                    value={incomeForm.payment_method}
                    onChange={(e) => handleIncomeFormChange("payment_method", e.target.value)}
                    placeholder="اختر طريقة الدفع"
                  >
                    <option value="cash">نقداً</option>
                    <option value="bank_transfer">تحويل بنكي</option>
                    <option value="online_payment">دفع إلكتروني</option>
                  </Select>
                </FormControl>
              </SimpleGrid>

              <FormControl isRequired>
                <FormLabel fontWeight="bold">تاريخ المعاملة</FormLabel>
                <Input
                  type="date"
                  value={incomeForm.transaction_date}
                  onChange={(e) => handleIncomeFormChange("transaction_date", e.target.value)}
                />
              </FormControl>
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onIncomeModalClose}>
              إلغاء
            </Button>
            <Button
              colorScheme="green"
              onClick={handleAddIncome}
              isLoading={loadingAction}
              loadingText="جاري الإضافة..."
            >
              إضافة المدخول
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Add Expense Modal */}
      <Modal isOpen={isExpenseModalOpen} onClose={onExpenseModalClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            <HStack spacing={2}>
              <FaMinusCircle color={expenseColor} />
              <Text>إضافة مصروف جديد</Text>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel fontWeight="bold">العنوان</FormLabel>
                <Input
                  value={expenseForm.title}
                  onChange={(e) => handleExpenseFormChange("title", e.target.value)}
                  placeholder="أدخل عنوان المصروف"
                />
              </FormControl>

              <FormControl>
                <FormLabel fontWeight="bold">الوصف</FormLabel>
                <Textarea
                  value={expenseForm.description}
                  onChange={(e) => handleExpenseFormChange("description", e.target.value)}
                  placeholder="أدخل وصف المصروف"
                  rows={3}
                />
              </FormControl>

              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} w="full">
                <FormControl isRequired>
                  <FormLabel fontWeight="bold">المبلغ</FormLabel>
                  <Input
                    type="number"
                    value={expenseForm.amount}
                    onChange={(e) => handleExpenseFormChange("amount", e.target.value)}
                    placeholder="أدخل المبلغ"
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel fontWeight="bold">الفئة</FormLabel>
                  <Select
                    value={expenseForm.category}
                    onChange={(e) => handleExpenseFormChange("category", e.target.value)}
                    placeholder="اختر الفئة"
                  >
                    <option value="hosting">استضافة</option>
                    <option value="marketing">تسويق</option>
                    <option value="salaries">رواتب</option>
                    <option value="maintenance">صيانة</option>
                    <option value="other">أخرى</option>
                  </Select>
                </FormControl>
              </SimpleGrid>

              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} w="full">
                <FormControl isRequired>
                  <FormLabel fontWeight="bold">نوع المصروف</FormLabel>
                  <Select
                    value={expenseForm.expense_type}
                    onChange={(e) => handleExpenseFormChange("expense_type", e.target.value)}
                    placeholder="اختر نوع المصروف"
                  >
                    <option value="monthly">شهري</option>
                    <option value="one_time">مرة واحدة</option>
                    <option value="recurring">متكرر</option>
                  </Select>
                </FormControl>

                <FormControl isRequired>
                  <FormLabel fontWeight="bold">طريقة الدفع</FormLabel>
                  <Select
                    value={expenseForm.payment_method}
                    onChange={(e) => handleExpenseFormChange("payment_method", e.target.value)}
                    placeholder="اختر طريقة الدفع"
                  >
                    <option value="cash">نقداً</option>
                    <option value="bank_transfer">تحويل بنكي</option>
                    <option value="check">شيك</option>
                  </Select>
                </FormControl>
              </SimpleGrid>

              <FormControl isRequired>
                <FormLabel fontWeight="bold">تاريخ المعاملة</FormLabel>
                <Input
                  type="date"
                  value={expenseForm.transaction_date}
                  onChange={(e) => handleExpenseFormChange("transaction_date", e.target.value)}
                />
              </FormControl>
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onExpenseModalClose}>
              إلغاء
            </Button>
            <Button
              colorScheme="red"
              onClick={handleAddExpense}
              isLoading={loadingAction}
              loadingText="جاري الإضافة..."
            >
              إضافة المصروف
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Delete Confirmation Modal */}
      <AlertDialog
        isOpen={isDeleteModalOpen}
        leastDestructiveRef={cancelRef}
        onClose={onDeleteModalClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              تأكيد الحذف
            </AlertDialogHeader>

            <AlertDialogBody>
              هل أنت متأكد من حذف{" "}
              <Text as="span" fontWeight="bold" color="red.500">
                {selectedItem?.title}
              </Text>
              ؟ هذا الإجراء لا يمكن التراجع عنه.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onDeleteModalClose}>
                إلغاء
              </Button>
              <Button
                colorScheme="red"
                onClick={handleDelete}
                ml={3}
                isLoading={loadingAction}
                loadingText="جاري الحذف..."
              >
                حذف
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
};

export default FinancialAccounts;