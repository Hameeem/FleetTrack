import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import api from '../services/api';
import StatusBadge from '../components/StatusBadge';
import {
  Box,
  Heading,
  Text,
  Button,
  Input,
  Select,
  HStack,
  VStack,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  IconButton,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  ModalFooter,
  FormControl,
  FormLabel,
  useDisclosure,
  useToast,
  Badge,
  Spinner,
  Center,
  Flex
} from '@chakra-ui/react';
import { Plus, Search, Edit2, Trash2, Eye, User, Phone, Mail, Award, Truck } from 'lucide-react';

export default function Drivers() {
  const toast = useToast();
  const { user } = useSelector((state) => state.auth);
  const isDriverRole = user?.role === 'Driver';

  const [drivers, setDrivers] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modals
  const addModal = useDisclosure();
  const detailModal = useDisclosure();

  const [selectedDriver, setSelectedDriver] = useState(null);
  const [driverTrips, setDriverTrips] = useState([]);

  const [form, setForm] = useState({
    id: null,
    name: '',
    email: '',
    phone: '',
    employee_id: '',
    license_number: '',
    license_expiry: '',
    status: 'Active',
    assigned_vehicle_id: ''
  });

  const fetchDrivers = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;

      const res = await api.get('/drivers', { params });
      if (res.data.success) {
        setDrivers(res.data.drivers);
      }
    } catch (err) {
      toast({ title: 'Failed to fetch drivers', status: 'error', duration: 3000 });
    } finally {
      setLoading(false);
    }
  };

  const fetchVehicles = async () => {
    try {
      const res = await api.get('/vehicles');
      if (res.data.success) {
        setVehicles(res.data.vehicles);
      }
    } catch (e) {}
  };

  useEffect(() => {
    fetchDrivers();
    fetchVehicles();
  }, [search, statusFilter]);

  const handleOpenAdd = () => {
    setForm({
      id: null,
      name: '',
      email: '',
      phone: '',
      employee_id: `EMP-${Math.floor(1000 + Math.random() * 9000)}`,
      license_number: `DL-CA-${Math.floor(100000 + Math.random() * 900000)}`,
      license_expiry: '2028-12-31',
      status: 'Active',
      assigned_vehicle_id: ''
    });
    addModal.onOpen();
  };

  const handleOpenEdit = (driver) => {
    setForm({
      id: driver.id,
      name: driver.name,
      email: driver.email,
      phone: driver.phone || '',
      employee_id: driver.employee_id,
      license_number: driver.license_number,
      license_expiry: driver.license_expiry ? driver.license_expiry.split('T')[0] : '',
      status: driver.status,
      assigned_vehicle_id: driver.assigned_vehicle_id || ''
    });
    addModal.onOpen();
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...form,
        assigned_vehicle_id: form.assigned_vehicle_id ? Number(form.assigned_vehicle_id) : null
      };

      if (form.id) {
        await api.put(`/drivers/${form.id}`, payload);
        toast({ title: 'Driver updated successfully', status: 'success', duration: 3000 });
      } else {
        await api.post('/drivers', payload);
        toast({ title: 'Driver created successfully', status: 'success', duration: 3000 });
      }
      addModal.onClose();
      fetchDrivers();
    } catch (err) {
      toast({ title: err.response?.data?.message || 'Error saving driver', status: 'error', duration: 4000 });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this driver?')) return;
    try {
      await api.delete(`/drivers/${id}`);
      toast({ title: 'Driver deleted', status: 'info', duration: 3000 });
      fetchDrivers();
    } catch (err) {
      toast({ title: 'Delete failed', status: 'error', duration: 3000 });
    }
  };

  const handleViewDetails = async (driver) => {
    setSelectedDriver(driver);
    try {
      const res = await api.get(`/drivers/${driver.id}/trips`);
      if (res.data.success) {
        setDriverTrips(res.data.trips);
      }
    } catch (e) {
      setDriverTrips([]);
    }
    detailModal.onOpen();
  };

  return (
    <VStack spacing={6} align="stretch">
      <Flex justify="space-between" align={{ base: 'start', md: 'center' }} direction={{ base: 'column', md: 'row' }} gap={4}>
        <Box>
          <Heading size="lg" fontWeight="black" color="gray.800">
            Driver Roster & Licensing
          </Heading>
          <Text color="gray.500" fontSize="sm">
            Manage organization drivers, vehicle assignments, and trip history
          </Text>
        </Box>

        {!isDriverRole && (
          <Button colorScheme="blue" leftIcon={<Plus size={18} />} onClick={handleOpenAdd} shadow="md">
            Add New Driver
          </Button>
        )}
      </Flex>

      {/* Filters Bar */}
      <HStack spacing={4} bg="white" p={4} borderRadius="xl" shadow="sm" borderWidth="1px" borderColor="gray.100">
        <HStack flex="1">
          <Search size={18} color="#A0AEC0" />
          <Input
            placeholder="Search driver by name, email, employee ID, or license #..."
            variant="unstyled"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </HStack>
        <Select w="200px" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All Statuses</option>
          <option value="Active">Active</option>
          <option value="On Trip">On Trip</option>
          <option value="Off Duty">Off Duty</option>
          <option value="Inactive">Inactive</option>
        </Select>
      </HStack>

      {/* Drivers Data Table */}
      <Box bg="white" borderRadius="xl" shadow="sm" borderWidth="1px" borderColor="gray.100" overflow="hidden">
        {loading ? (
          <Center py={10}><Spinner size="lg" color="blue.500" /></Center>
        ) : (
          <Table variant="simple">
            <Thead bg="gray.50">
              <Tr>
                <Th>Driver</Th>
                <Th>Emp ID</Th>
                <Th>License #</Th>
                <Th>Expiry</Th>
                <Th>Status</Th>
                <Th>Assigned Vehicle</Th>
                <Th textAlign="right">Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {drivers.length === 0 ? (
                <Tr>
                  <Td colSpan={7} textAlign="center" py={8} color="gray.500">
                    No drivers match the current criteria.
                  </Td>
                </Tr>
              ) : (
                drivers.map((d) => (
                  <Tr key={d.id} _hover={{ bg: 'gray.50' }}>
                    <Td>
                      <Box>
                        <Text fontWeight="bold" color="gray.800">{d.name}</Text>
                        <Text fontSize="xs" color="gray.500">{d.email}</Text>
                      </Box>
                    </Td>
                    <Td><Badge colorScheme="purple">{d.employee_id}</Badge></Td>
                    <Td fontSize="sm" fontFamily="mono">{d.license_number}</Td>
                    <Td fontSize="xs" color="gray.600">{d.license_expiry ? d.license_expiry.split('T')[0] : 'N/A'}</Td>
                    <Td><StatusBadge status={d.status} /></Td>
                    <Td fontSize="xs" color="gray.700">
                      {d.assigned_vehicle_number ? `${d.assigned_vehicle_number} (${d.assigned_vehicle_model})` : 'Unassigned'}
                    </Td>
                    <Td textAlign="right">
                      <HStack justify="flex-end" spacing={1}>
                        <IconButton icon={<Eye size={16} />} size="sm" variant="ghost" onClick={() => handleViewDetails(d)} aria-label="View Details" />
                        {!isDriverRole && (
                          <>
                            <IconButton icon={<Edit2 size={16} />} size="sm" variant="ghost" colorScheme="blue" onClick={() => handleOpenEdit(d)} aria-label="Edit" />
                            <IconButton icon={<Trash2 size={16} />} size="sm" variant="ghost" colorScheme="red" onClick={() => handleDelete(d.id)} aria-label="Delete" />
                          </>
                        )}
                      </HStack>
                    </Td>
                  </Tr>
                ))
              )}
            </Tbody>
          </Table>
        )}
      </Box>

      {/* Modal 1: Add/Edit Driver */}
      <Modal isOpen={addModal.isOpen} onClose={addModal.onClose} size="lg">
        <ModalOverlay />
        <ModalContent borderRadius="xl">
          <form onSubmit={handleSave}>
            <ModalHeader>{form.id ? 'Edit Driver Record' : 'Add New Driver'}</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <VStack spacing={4}>
                <FormControl isRequired>
                  <FormLabel fontSize="xs" fontWeight="bold" uppercase>Full Name</FormLabel>
                  <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="John Miller" />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel fontSize="xs" fontWeight="bold" uppercase>Email Address</FormLabel>
                  <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="john@company.com" />
                </FormControl>
                <HStack w="100%">
                  <FormControl isRequired>
                    <FormLabel fontSize="xs" fontWeight="bold" uppercase>Employee ID</FormLabel>
                    <Input value={form.employee_id} onChange={(e) => setForm({ ...form, employee_id: e.target.value })} />
                  </FormControl>
                  <FormControl>
                    <FormLabel fontSize="xs" fontWeight="bold" uppercase>Phone Number</FormLabel>
                    <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+1-555-0192" />
                  </FormControl>
                </HStack>
                <HStack w="100%">
                  <FormControl isRequired>
                    <FormLabel fontSize="xs" fontWeight="bold" uppercase>License Number</FormLabel>
                    <Input value={form.license_number} onChange={(e) => setForm({ ...form, license_number: e.target.value })} />
                  </FormControl>
                  <FormControl isRequired>
                    <FormLabel fontSize="xs" fontWeight="bold" uppercase>License Expiry Date</FormLabel>
                    <Input type="date" value={form.license_expiry} onChange={(e) => setForm({ ...form, license_expiry: e.target.value })} />
                  </FormControl>
                </HStack>
                <HStack w="100%">
                  <FormControl>
                    <FormLabel fontSize="xs" fontWeight="bold" uppercase>Duty Status</FormLabel>
                    <Select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                      <option value="Active">Active</option>
                      <option value="On Trip">On Trip</option>
                      <option value="Off Duty">Off Duty</option>
                      <option value="Inactive">Inactive</option>
                    </Select>
                  </FormControl>
                  <FormControl>
                    <FormLabel fontSize="xs" fontWeight="bold" uppercase>Assigned Vehicle</FormLabel>
                    <Select value={form.assigned_vehicle_id} onChange={(e) => setForm({ ...form, assigned_vehicle_id: e.target.value })}>
                      <option value="">Unassigned</option>
                      {vehicles.map(v => (
                        <option key={v.id} value={v.id}>{v.vehicle_number} ({v.model})</option>
                      ))}
                    </Select>
                  </FormControl>
                </HStack>
              </VStack>
            </ModalBody>
            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={addModal.onClose}>Cancel</Button>
              <Button colorScheme="blue" type="submit">Save Driver</Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>

      {/* Modal 2: View Driver Profile & Trip History */}
      <Modal isOpen={detailModal.isOpen} onClose={detailModal.onClose} size="xl">
        <ModalOverlay />
        <ModalContent borderRadius="xl">
          <ModalHeader>Driver Details & Trip History</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            {selectedDriver && (
              <VStack align="stretch" spacing={5}>
                <Box bg="blue.50" p={4} borderRadius="lg" border="1px solid" borderColor="blue.100">
                  <HStack justify="space-between">
                    <Box>
                      <Heading size="md" color="blue.900">{selectedDriver.name}</Heading>
                      <Text fontSize="xs" color="blue.700">{selectedDriver.email} • {selectedDriver.phone || 'No phone'}</Text>
                    </Box>
                    <StatusBadge status={selectedDriver.status} />
                  </HStack>
                </Box>

                <HStack justify="space-between" fontSize="sm">
                  <Text color="gray.600">Employee ID: <Text as="span" fontWeight="bold">{selectedDriver.employee_id}</Text></Text>
                  <Text color="gray.600">License: <Text as="span" fontWeight="bold">{selectedDriver.license_number}</Text></Text>
                  <Text color="gray.600">Expiry: <Text as="span" fontWeight="bold">{selectedDriver.license_expiry?.split('T')[0]}</Text></Text>
                </HStack>

                <Heading size="xs" textTransform="uppercase" color="gray.500" mt={2}>Assigned Trip History ({driverTrips.length})</Heading>
                <Box maxH="200px" overflowY="auto">
                  <Table size="sm" variant="simple">
                    <Thead bg="gray.50">
                      <Tr><Th>Trip #</Th><Th>Vehicle</Th><Th>Route</Th><Th>Status</Th></Tr>
                    </Thead>
                    <Tbody>
                      {driverTrips.map(t => (
                        <Tr key={t.id}>
                          <Td fontWeight="bold" color="blue.600">{t.trip_number}</Td>
                          <Td>{t.vehicle_number}</Td>
                          <Td fontSize="xs">{t.origin_name} ➔ {t.destination_name}</Td>
                          <Td><StatusBadge status={t.status} /></Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </Box>
              </VStack>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </VStack>
  );
}
