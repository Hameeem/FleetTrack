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
import { Plus, Search, Edit2, Trash2, Eye, Truck, Navigation, Gauge } from 'lucide-react';

export default function Vehicles() {
  const toast = useToast();
  const { user } = useSelector((state) => state.auth);
  const isDriverRole = user?.role === 'Driver';

  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modals
  const addModal = useDisclosure();
  const detailModal = useDisclosure();

  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [vehicleTrips, setVehicleTrips] = useState([]);

  const [form, setForm] = useState({
    id: null,
    vehicle_number: '',
    registration_number: '',
    vehicle_type: 'Truck',
    model: '',
    status: 'Available',
    current_lat: 37.774929,
    current_lng: -122.419418,
    total_distance: 0,
    assigned_driver_id: ''
  });

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;

      const res = await api.get('/vehicles', { params });
      if (res.data.success) {
        setVehicles(res.data.vehicles);
      }
    } catch (err) {
      toast({ title: 'Failed to fetch vehicles', status: 'error', duration: 3000 });
    } finally {
      setLoading(false);
    }
  };

  const fetchDrivers = async () => {
    try {
      const res = await api.get('/drivers');
      if (res.data.success) {
        setDrivers(res.data.drivers);
      }
    } catch (e) {}
  };

  useEffect(() => {
    fetchVehicles();
    fetchDrivers();
  }, [search, statusFilter]);

  const handleOpenAdd = () => {
    setForm({
      id: null,
      vehicle_number: `TRK-${Math.floor(100 + Math.random() * 900)}`,
      registration_number: `REG-APEX-${Math.floor(100 + Math.random() * 900)}`,
      vehicle_type: 'Heavy Duty Truck',
      model: 'Volvo FH16 (2024)',
      status: 'Available',
      current_lat: 37.774929,
      current_lng: -122.419418,
      total_distance: 500.0,
      assigned_driver_id: ''
    });
    addModal.onOpen();
  };

  const handleOpenEdit = (v) => {
    setForm({
      id: v.id,
      vehicle_number: v.vehicle_number,
      registration_number: v.registration_number,
      vehicle_type: v.vehicle_type,
      model: v.model,
      status: v.status,
      current_lat: v.current_lat,
      current_lng: v.current_lng,
      total_distance: v.total_distance,
      assigned_driver_id: v.assigned_driver_id || ''
    });
    addModal.onOpen();
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...form,
        assigned_driver_id: form.assigned_driver_id ? Number(form.assigned_driver_id) : null
      };

      if (form.id) {
        await api.put(`/vehicles/${form.id}`, payload);
        toast({ title: 'Vehicle updated successfully', status: 'success', duration: 3000 });
      } else {
        await api.post('/vehicles', payload);
        toast({ title: 'Vehicle registered successfully', status: 'success', duration: 3000 });
      }
      addModal.onClose();
      fetchVehicles();
    } catch (err) {
      toast({ title: err.response?.data?.message || 'Error saving vehicle', status: 'error', duration: 4000 });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to deactivate/delete this vehicle?')) return;
    try {
      await api.delete(`/vehicles/${id}`);
      toast({ title: 'Vehicle deleted', status: 'info', duration: 3000 });
      fetchVehicles();
    } catch (err) {
      toast({ title: 'Delete failed', status: 'error', duration: 3000 });
    }
  };

  const handleViewDetails = async (v) => {
    setSelectedVehicle(v);
    try {
      const res = await api.get(`/vehicles/${v.id}/trips`);
      if (res.data.success) {
        setVehicleTrips(res.data.trips);
      }
    } catch (e) {
      setVehicleTrips([]);
    }
    detailModal.onOpen();
  };

  return (
    <VStack spacing={6} align="stretch">
      <Flex justify="space-between" align={{ base: 'start', md: 'center' }} direction={{ base: 'column', md: 'row' }} gap={4}>
        <Box>
          <Heading size="lg" fontWeight="black" color="gray.800">
            Fleet Vehicles & Assets
          </Heading>
          <Text color="gray.500" fontSize="sm">
            Manage organization trucks, vans, driver assignments, and odometer history
          </Text>
        </Box>

        {!isDriverRole && (
          <Button colorScheme="blue" leftIcon={<Plus size={18} />} onClick={handleOpenAdd} shadow="md">
            Add New Vehicle
          </Button>
        )}
      </Flex>

      {/* Filters Bar */}
      <HStack spacing={4} bg="white" p={4} borderRadius="xl" shadow="sm" borderWidth="1px" borderColor="gray.100">
        <HStack flex="1">
          <Search size={18} color="#A0AEC0" />
          <Input
            placeholder="Search vehicle number, registration, or model..."
            variant="unstyled"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </HStack>
        <Select w="200px" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All Statuses</option>
          <option value="Available">Available</option>
          <option value="On Trip">On Trip</option>
          <option value="Maintenance">Maintenance</option>
          <option value="Deactivated">Deactivated</option>
        </Select>
      </HStack>

      {/* Vehicle Data Table */}
      <Box bg="white" borderRadius="xl" shadow="sm" borderWidth="1px" borderColor="gray.100" overflow="hidden">
        {loading ? (
          <Center py={10}><Spinner size="lg" color="blue.500" /></Center>
        ) : (
          <Table variant="simple">
            <Thead bg="gray.50">
              <Tr>
                <Th>Vehicle #</Th>
                <Th>Reg #</Th>
                <Th>Type & Model</Th>
                <Th>Status</Th>
                <Th>Odometer</Th>
                <Th>Assigned Driver</Th>
                <Th textAlign="right">Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {vehicles.length === 0 ? (
                <Tr>
                  <Td colSpan={7} textAlign="center" py={8} color="gray.500">
                    No vehicles registered for this organization.
                  </Td>
                </Tr>
              ) : (
                vehicles.map((v) => (
                  <Tr key={v.id} _hover={{ bg: 'gray.50' }}>
                    <Td fontWeight="bold" color="blue.600">{v.vehicle_number}</Td>
                    <Td fontSize="sm" fontFamily="mono">{v.registration_number}</Td>
                    <Td>
                      <Text fontSize="sm" fontWeight="bold">{v.model}</Text>
                      <Text fontSize="xs" color="gray.500">{v.vehicle_type}</Text>
                    </Td>
                    <Td><StatusBadge status={v.status} /></Td>
                    <Td fontSize="sm" fontWeight="bold">{Number(v.total_distance || 0).toLocaleString()} km</Td>
                    <Td fontSize="xs" color="gray.700">
                      {v.assigned_driver_name ? v.assigned_driver_name : 'Unassigned'}
                    </Td>
                    <Td textAlign="right">
                      <HStack justify="flex-end" spacing={1}>
                        <IconButton icon={<Eye size={16} />} size="sm" variant="ghost" onClick={() => handleViewDetails(v)} aria-label="View Details" />
                        {!isDriverRole && (
                          <>
                            <IconButton icon={<Edit2 size={16} />} size="sm" variant="ghost" colorScheme="blue" onClick={() => handleOpenEdit(v)} aria-label="Edit" />
                            <IconButton icon={<Trash2 size={16} />} size="sm" variant="ghost" colorScheme="red" onClick={() => handleDelete(v.id)} aria-label="Delete" />
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

      {/* Modal: Add/Edit Vehicle */}
      <Modal isOpen={addModal.isOpen} onClose={addModal.onClose} size="lg">
        <ModalOverlay />
        <ModalContent borderRadius="xl">
          <form onSubmit={handleSave}>
            <ModalHeader>{form.id ? 'Edit Vehicle Configuration' : 'Add New Vehicle'}</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <VStack spacing={4}>
                <HStack w="100%">
                  <FormControl isRequired>
                    <FormLabel fontSize="xs" fontWeight="bold" uppercase>Vehicle Number</FormLabel>
                    <Input value={form.vehicle_number} onChange={(e) => setForm({ ...form, vehicle_number: e.target.value })} placeholder="TRK-101" />
                  </FormControl>
                  <FormControl isRequired>
                    <FormLabel fontSize="xs" fontWeight="bold" uppercase>Registration #</FormLabel>
                    <Input value={form.registration_number} onChange={(e) => setForm({ ...form, registration_number: e.target.value })} placeholder="REG-APEX-901" />
                  </FormControl>
                </HStack>
                <HStack w="100%">
                  <FormControl isRequired>
                    <FormLabel fontSize="xs" fontWeight="bold" uppercase>Vehicle Type</FormLabel>
                    <Select value={form.vehicle_type} onChange={(e) => setForm({ ...form, vehicle_type: e.target.value })}>
                      <option value="Truck">Truck</option>
                      <option value="Heavy Duty Truck">Heavy Duty Truck</option>
                      <option value="Cargo Van">Cargo Van</option>
                      <option value="Delivery Van">Delivery Van</option>
                      <option value="Electric Cargo">Electric Cargo</option>
                      <option value="Flatbed Truck">Flatbed Truck</option>
                    </Select>
                  </FormControl>
                  <FormControl isRequired>
                    <FormLabel fontSize="xs" fontWeight="bold" uppercase>Model & Year</FormLabel>
                    <Input value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })} placeholder="Volvo FH16 (2024)" />
                  </FormControl>
                </HStack>
                <HStack w="100%">
                  <FormControl>
                    <FormLabel fontSize="xs" fontWeight="bold" uppercase>Operational Status</FormLabel>
                    <Select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                      <option value="Available">Available</option>
                      <option value="On Trip">On Trip</option>
                      <option value="Maintenance">Maintenance</option>
                      <option value="Deactivated">Deactivated</option>
                    </Select>
                  </FormControl>
                  <FormControl>
                    <FormLabel fontSize="xs" fontWeight="bold" uppercase>Assigned Driver</FormLabel>
                    <Select value={form.assigned_driver_id} onChange={(e) => setForm({ ...form, assigned_driver_id: e.target.value })}>
                      <option value="">Unassigned</option>
                      {drivers.map(d => (
                        <option key={d.id} value={d.id}>{d.name} ({d.employee_id})</option>
                      ))}
                    </Select>
                  </FormControl>
                </HStack>
              </VStack>
            </ModalBody>
            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={addModal.onClose}>Cancel</Button>
              <Button colorScheme="blue" type="submit">Save Asset</Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>

      {/* Modal: View Vehicle Details & Trip History */}
      <Modal isOpen={detailModal.isOpen} onClose={detailModal.onClose} size="xl">
        <ModalOverlay />
        <ModalContent borderRadius="xl">
          <ModalHeader>Vehicle Telemetry & History</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            {selectedVehicle && (
              <VStack align="stretch" spacing={5}>
                <Box bg="blue.50" p={4} borderRadius="lg" border="1px solid" borderColor="blue.100">
                  <HStack justify="space-between">
                    <Box>
                      <Heading size="md" color="blue.900">{selectedVehicle.vehicle_number} — {selectedVehicle.model}</Heading>
                      <Text fontSize="xs" color="blue.700">Reg: {selectedVehicle.registration_number} • Type: {selectedVehicle.vehicle_type}</Text>
                    </Box>
                    <StatusBadge status={selectedVehicle.status} />
                  </HStack>
                </Box>

                <HStack justify="space-between" fontSize="sm">
                  <Text color="gray.600">Odometer: <Text as="span" fontWeight="bold">{selectedVehicle.total_distance} km</Text></Text>
                  <Text color="gray.600">Driver: <Text as="span" fontWeight="bold">{selectedVehicle.assigned_driver_name || 'None'}</Text></Text>
                </HStack>

                <Heading size="xs" textTransform="uppercase" color="gray.500" mt={2}>Recent Vehicle Trips ({vehicleTrips.length})</Heading>
                <Box maxH="200px" overflowY="auto">
                  <Table size="sm" variant="simple">
                    <Thead bg="gray.50">
                      <Tr><Th>Trip #</Th><Th>Driver</Th><Th>Route</Th><Th>Status</Th></Tr>
                    </Thead>
                    <Tbody>
                      {vehicleTrips.map(t => (
                        <Tr key={t.id}>
                          <Td fontWeight="bold" color="blue.600">{t.trip_number}</Td>
                          <Td>{t.driver_name}</Td>
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
