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
import { Plus, Search, Play, CheckCircle, XCircle, Eye, Navigation, MapPin } from 'lucide-react';

export default function Trips() {
  const toast = useToast();
  const { user } = useSelector((state) => state.auth);
  const isDriverRole = user?.role === 'Driver';

  const [trips, setTrips] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modals
  const createModal = useDisclosure();
  const detailModal = useDisclosure();
  const [selectedTrip, setSelectedTrip] = useState(null);

  const [form, setForm] = useState({
    driver_id: '',
    vehicle_id: '',
    origin_name: 'SF Main Hub & Warehouse',
    origin_lat: 37.774929,
    origin_lng: -122.419418,
    destination_name: 'Port of Oakland Terminal',
    destination_lat: 37.804363,
    destination_lng: -122.271111,
    scheduled_start: new Date().toISOString().slice(0, 16),
    scheduled_end: new Date(Date.now() + 7200000).toISOString().slice(0, 16),
    distance_km: 18.5,
    notes: ''
  });

  const fetchTrips = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;

      const res = await api.get('/trips', { params });
      if (res.data.success) {
        setTrips(res.data.trips);
      }
    } catch (err) {
      toast({ title: 'Failed to fetch trips', status: 'error', duration: 3000 });
    } finally {
      setLoading(false);
    }
  };

  const fetchResources = async () => {
    try {
      const [dRes, vRes] = await Promise.all([api.get('/drivers'), api.get('/vehicles')]);
      if (dRes.data.success) setDrivers(dRes.data.drivers);
      if (vRes.data.success) setVehicles(vRes.data.vehicles);
    } catch (e) {}
  };

  useEffect(() => {
    fetchTrips();
    fetchResources();
    const interval = setInterval(fetchTrips, 5000);
    return () => clearInterval(interval);
  }, [search, statusFilter]);

  const handleOpenCreate = () => {
    setForm({
      driver_id: drivers.length > 0 ? drivers[0].id : '',
      vehicle_id: vehicles.length > 0 ? vehicles[0].id : '',
      origin_name: 'SF Main Hub & Warehouse',
      origin_lat: 37.774929,
      origin_lng: -122.419418,
      destination_name: 'Port of Oakland Terminal',
      destination_lat: 37.804363,
      destination_lng: -122.271111,
      scheduled_start: new Date().toISOString().slice(0, 16),
      scheduled_end: new Date(Date.now() + 7200000).toISOString().slice(0, 16),
      distance_km: 18.5,
      notes: 'Standard logistics dispatch'
    });
    createModal.onOpen();
  };

  const handleCreateTrip = async (e) => {
    e.preventDefault();
    try {
      await api.post('/trips', {
        ...form,
        driver_id: Number(form.driver_id),
        vehicle_id: Number(form.vehicle_id),
        distance_km: Number(form.distance_km)
      });
      toast({ title: 'Trip dispatched successfully!', status: 'success', duration: 3000 });
      createModal.onClose();
      fetchTrips();
    } catch (err) {
      toast({ title: err.response?.data?.message || 'Error creating trip', status: 'error', duration: 4000 });
    }
  };

  const handleStartTrip = async (id) => {
    try {
      await api.post(`/trips/${id}/start`);
      toast({ title: 'Trip started! Simulated GPS tracking engaged.', status: 'info', duration: 4000 });
      fetchTrips();
    } catch (err) {
      toast({ title: err.response?.data?.message || 'Failed to start trip', status: 'error', duration: 3000 });
    }
  };

  const handleCompleteTrip = async (id) => {
    try {
      await api.post(`/trips/${id}/complete`);
      toast({ title: 'Trip marked as Completed!', status: 'success', duration: 3000 });
      fetchTrips();
    } catch (err) {
      toast({ title: err.response?.data?.message || 'Failed to complete trip', status: 'error', duration: 3000 });
    }
  };

  const handleCancelTrip = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this trip?')) return;
    try {
      await api.post(`/trips/${id}/cancel`);
      toast({ title: 'Trip cancelled', status: 'warning', duration: 3000 });
      fetchTrips();
    } catch (err) {
      toast({ title: 'Failed to cancel trip', status: 'error', duration: 3000 });
    }
  };

  const handleViewDetails = async (trip) => {
    try {
      const res = await api.get(`/trips/${trip.id}`);
      if (res.data.success) {
        setSelectedTrip(res.data.trip);
      }
    } catch (e) {
      setSelectedTrip(trip);
    }
    detailModal.onOpen();
  };

  return (
    <VStack spacing={6} align="stretch">
      <Flex justify="space-between" align={{ base: 'start', md: 'center' }} direction={{ base: 'column', md: 'row' }} gap={4}>
        <Box>
          <Heading size="lg" fontWeight="black" color="gray.800">
            Trip Lifecycle & Route Management
          </Heading>
          <Text color="gray.500" fontSize="sm">
            Create, assign drivers, track simulated GPS movement, and log trip history
          </Text>
        </Box>

        {!isDriverRole && (
          <Button colorScheme="blue" leftIcon={<Plus size={18} />} onClick={handleOpenCreate} shadow="md">
            Create & Assign Trip
          </Button>
        )}
      </Flex>

      {/* Filters Bar */}
      <HStack spacing={4} bg="white" p={4} borderRadius="xl" shadow="sm" borderWidth="1px" borderColor="gray.100">
        <HStack flex="1">
          <Search size={18} color="#A0AEC0" />
          <Input
            placeholder="Search trip number, origin, destination, driver, or vehicle..."
            variant="unstyled"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </HStack>
        <Select w="200px" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All Statuses</option>
          <option value="Scheduled">Scheduled</option>
          <option value="Assigned">Assigned</option>
          <option value="In Progress">In Progress</option>
          <option value="Completed">Completed</option>
          <option value="Cancelled">Cancelled</option>
        </Select>
      </HStack>

      {/* Trips Table */}
      <Box bg="white" borderRadius="xl" shadow="sm" borderWidth="1px" borderColor="gray.100" overflow="hidden">
        {loading ? (
          <Center py={10}><Spinner size="lg" color="blue.500" /></Center>
        ) : (
          <Table variant="simple">
            <Thead bg="gray.50">
              <Tr>
                <Th>Trip #</Th>
                <Th>Driver</Th>
                <Th>Vehicle</Th>
                <Th>Origin</Th>
                <Th>Destination</Th>
                <Th>Status</Th>
                <Th textAlign="right">Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {trips.length === 0 ? (
                <Tr>
                  <Td colSpan={7} textAlign="center" py={8} color="gray.500">
                    No trips logged for this organization.
                  </Td>
                </Tr>
              ) : (
                trips.map((t) => (
                  <Tr key={t.id} _hover={{ bg: 'gray.50' }}>
                    <Td fontWeight="bold" color="blue.600">{t.trip_number}</Td>
                    <Td>{t.driver_name}</Td>
                    <Td fontSize="xs" fontWeight="bold">{t.vehicle_number}</Td>
                    <Td fontSize="xs" color="gray.700">{t.origin_name}</Td>
                    <Td fontSize="xs" color="gray.700">{t.destination_name}</Td>
                    <Td><StatusBadge status={t.status} /></Td>
                    <Td textAlign="right">
                      <HStack justify="flex-end" spacing={1}>
                        {['Scheduled', 'Assigned'].includes(t.status) && (
                          <IconButton icon={<Play size={16} />} size="sm" colorScheme="green" variant="outline" onClick={() => handleStartTrip(t.id)} aria-label="Start Trip" title="Start Trip" />
                        )}
                        {t.status === 'In Progress' && (
                          <IconButton icon={<CheckCircle size={16} />} size="sm" colorScheme="blue" variant="solid" onClick={() => handleCompleteTrip(t.id)} aria-label="Complete Trip" title="Complete Trip" />
                        )}
                        {!isDriverRole && ['Scheduled', 'Assigned', 'In Progress'].includes(t.status) && (
                          <IconButton icon={<XCircle size={16} />} size="sm" colorScheme="red" variant="ghost" onClick={() => handleCancelTrip(t.id)} aria-label="Cancel Trip" title="Cancel Trip" />
                        )}
                        <IconButton icon={<Eye size={16} />} size="sm" variant="ghost" onClick={() => handleViewDetails(t)} aria-label="View Route" />
                      </HStack>
                    </Td>
                  </Tr>
                ))
              )}
            </Tbody>
          </Table>
        )}
      </Box>

      {/* Modal: Create Trip */}
      <Modal isOpen={createModal.isOpen} onClose={createModal.onClose} size="lg">
        <ModalOverlay />
        <ModalContent borderRadius="xl">
          <form onSubmit={handleCreateTrip}>
            <ModalHeader>Dispatch New Trip</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <VStack spacing={4}>
                <HStack w="100%">
                  <FormControl isRequired>
                    <FormLabel fontSize="xs" fontWeight="bold" uppercase>Select Driver</FormLabel>
                    <Select value={form.driver_id} onChange={(e) => setForm({ ...form, driver_id: e.target.value })}>
                      {drivers.map(d => (
                        <option key={d.id} value={d.id}>{d.name} ({d.employee_id})</option>
                      ))}
                    </Select>
                  </FormControl>
                  <FormControl isRequired>
                    <FormLabel fontSize="xs" fontWeight="bold" uppercase>Select Vehicle</FormLabel>
                    <Select value={form.vehicle_id} onChange={(e) => setForm({ ...form, vehicle_id: e.target.value })}>
                      {vehicles.map(v => (
                        <option key={v.id} value={v.id}>{v.vehicle_number} ({v.model})</option>
                      ))}
                    </Select>
                  </FormControl>
                </HStack>
                <HStack w="100%">
                  <FormControl isRequired>
                    <FormLabel fontSize="xs" fontWeight="bold" uppercase>Origin Address / Hub</FormLabel>
                    <Input value={form.origin_name} onChange={(e) => setForm({ ...form, origin_name: e.target.value })} />
                  </FormControl>
                  <FormControl isRequired>
                    <FormLabel fontSize="xs" fontWeight="bold" uppercase>Destination Address</FormLabel>
                    <Input value={form.destination_name} onChange={(e) => setForm({ ...form, destination_name: e.target.value })} />
                  </FormControl>
                </HStack>
                <HStack w="100%">
                  <FormControl isRequired>
                    <FormLabel fontSize="xs" fontWeight="bold" uppercase>Scheduled Start</FormLabel>
                    <Input type="datetime-local" value={form.scheduled_start} onChange={(e) => setForm({ ...form, scheduled_start: e.target.value })} />
                  </FormControl>
                  <FormControl isRequired>
                    <FormLabel fontSize="xs" fontWeight="bold" uppercase>Scheduled End</FormLabel>
                    <Input type="datetime-local" value={form.scheduled_end} onChange={(e) => setForm({ ...form, scheduled_end: e.target.value })} />
                  </FormControl>
                </HStack>
                <FormControl>
                  <FormLabel fontSize="xs" fontWeight="bold" uppercase>Distance (km)</FormLabel>
                  <Input type="number" step="0.1" value={form.distance_km} onChange={(e) => setForm({ ...form, distance_km: e.target.value })} />
                </FormControl>
                <FormControl>
                  <FormLabel fontSize="xs" fontWeight="bold" uppercase>Trip Notes</FormLabel>
                  <Input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Priority cargo transfer" />
                </FormControl>
              </VStack>
            </ModalBody>
            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={createModal.onClose}>Cancel</Button>
              <Button colorScheme="blue" type="submit">Dispatch Trip</Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>

      {/* Modal: View Trip Details & Route */}
      <Modal isOpen={detailModal.isOpen} onClose={detailModal.onClose} size="lg">
        <ModalOverlay />
        <ModalContent borderRadius="xl">
          <ModalHeader>Trip Route & Telemetry</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            {selectedTrip && (
              <VStack align="stretch" spacing={4}>
                <Box bg="blue.50" p={4} borderRadius="lg">
                  <HStack justify="space-between">
                    <Box>
                      <Heading size="md" color="blue.900">{selectedTrip.trip_number}</Heading>
                      <Text fontSize="xs" color="blue.700">Driver: {selectedTrip.driver_name} • Vehicle: {selectedTrip.vehicle_number}</Text>
                    </Box>
                    <StatusBadge status={selectedTrip.status} />
                  </HStack>
                </Box>
                <Box bg="gray.50" p={4} borderRadius="lg" border="1px solid" borderColor="gray.200">
                  <VStack align="stretch" spacing={2} fontSize="sm">
                    <HStack><MapPin size={16} color="#3182CE" /><Text fontWeight="bold">Origin:</Text><Text>{selectedTrip.origin_name}</Text></HStack>
                    <HStack><MapPin size={16} color="#E53E3E" /><Text fontWeight="bold">Destination:</Text><Text>{selectedTrip.destination_name}</Text></HStack>
                    <Text color="gray.600">Scheduled: {new Date(selectedTrip.scheduled_start).toLocaleString()}</Text>
                    {selectedTrip.actual_start && <Text color="blue.600">Actual Start: {new Date(selectedTrip.actual_start).toLocaleString()}</Text>}
                    <Text color="gray.600">Total Route Distance: <Text as="span" fontWeight="bold">{selectedTrip.distance_km} km</Text></Text>
                  </VStack>
                </Box>
              </VStack>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </VStack>
  );
}
