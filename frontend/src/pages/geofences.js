import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import api from '../services/api';
import {
  Box,
  Heading,
  Text,
  Button,
  Input,
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
  SimpleGrid,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  Switch,
  Flex
} from '@chakra-ui/react';
import { Plus, Trash2, MapPin, ShieldAlert, Radio } from 'lucide-react';

export default function Geofences() {
  const toast = useToast();
  const { user } = useSelector((state) => state.auth);
  const isDriverRole = user?.role === 'Driver';

  const [geofences, setGeofences] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const addModal = useDisclosure();

  const [form, setForm] = useState({
    name: '',
    center_lat: 37.774929,
    center_lng: -122.419418,
    radius_meters: 800,
    is_active: true
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [gRes, eRes] = await Promise.all([api.get('/geofences'), api.get('/geofences/events')]);
      if (gRes.data.success) setGeofences(gRes.data.geofences);
      if (eRes.data.success) setEvents(eRes.data.events);
    } catch (err) {
      toast({ title: 'Failed to load geofencing data', status: 'error', duration: 3000 });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleOpenAdd = () => {
    setForm({
      name: 'Oakland Logistics Yard Zone',
      center_lat: 37.804363,
      center_lng: -122.271111,
      radius_meters: 1000,
      is_active: true
    });
    addModal.onOpen();
  };

  const handleCreateGeofence = async (e) => {
    e.preventDefault();
    try {
      await api.post('/geofences', {
        ...form,
        center_lat: Number(form.center_lat),
        center_lng: Number(form.center_lng),
        radius_meters: Number(form.radius_meters)
      });
      toast({ title: 'Geofenced zone created!', status: 'success', duration: 3000 });
      addModal.onClose();
      fetchData();
    } catch (err) {
      toast({ title: err.response?.data?.message || 'Error creating zone', status: 'error', duration: 4000 });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this geofence zone?')) return;
    try {
      await api.delete(`/geofences/${id}`);
      toast({ title: 'Geofence zone deleted', status: 'info', duration: 3000 });
      fetchData();
    } catch (err) {
      toast({ title: 'Delete failed', status: 'error', duration: 3000 });
    }
  };

  return (
    <VStack spacing={6} align="stretch">
      <Flex justify="space-between" align={{ base: 'start', md: 'center' }} direction={{ base: 'column', md: 'row' }} gap={4}>
        <Box>
          <Heading size="lg" fontWeight="black" color="gray.800">
            Geofencing & Boundary Alerts
          </Heading>
          <Text color="gray.500" fontSize="sm">
            Define spatial boundaries around depots, warehouses, terminals, and monitor automated enter/exit events
          </Text>
        </Box>

        {!isDriverRole && (
          <Button colorScheme="purple" leftIcon={<Plus size={18} />} onClick={handleOpenAdd} shadow="md">
            Create Geofence Zone
          </Button>
        )}
      </Flex>

      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
        {/* Geofence Zones List */}
        <Box bg="white" borderRadius="xl" shadow="sm" borderWidth="1px" borderColor="gray.100" overflow="hidden">
          <Box p={5} borderBottomWidth="1px" borderColor="gray.100">
            <Heading size="sm" color="gray.800">Configured Geofenced Zones ({geofences.length})</Heading>
          </Box>
          {loading ? (
            <Center py={8}><Spinner color="purple.500" /></Center>
          ) : (
            <Table variant="simple" size="sm">
              <Thead bg="gray.50">
                <Tr><Th>Zone Name</Th><Th>Center Lat/Lng</Th><Th>Radius</Th><Th textAlign="right">Action</Th></Tr>
              </Thead>
              <Tbody>
                {geofences.map(g => (
                  <Tr key={g.id} _hover={{ bg: 'gray.50' }}>
                    <Td fontWeight="bold" color="purple.700">{g.name}</Td>
                    <Td fontSize="xs" color="gray.600">{Number(g.center_lat).toFixed(4)}, {Number(g.center_lng).toFixed(4)}</Td>
                    <Td><Badge colorScheme="purple">{g.radius_meters}m</Badge></Td>
                    <Td textAlign="right">
                      {!isDriverRole && (
                        <IconButton icon={<Trash2 size={16} />} size="sm" colorScheme="red" variant="ghost" onClick={() => handleDelete(g.id)} aria-label="Delete Zone" />
                      )}
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          )}
        </Box>

        {/* Live Geofence Event Feed */}
        <Box bg="white" borderRadius="xl" shadow="sm" borderWidth="1px" borderColor="gray.100" p={5}>
          <Heading size="sm" color="gray.800" mb={4}>Live Geofence Entry & Exit Log ({events.length})</Heading>
          <VStack align="stretch" spacing={3} maxH="400px" overflowY="auto">
            {events.length === 0 ? (
              <Text fontSize="xs" color="gray.500" py={6} textAlign="center">No geofence events logged yet.</Text>
            ) : (
              events.map(e => (
                <Box key={e.id} p={3} bg="purple.50" borderRadius="lg" borderLeft="4px solid" borderColor={e.event_type === 'ENTER' ? 'green.500' : 'orange.500'}>
                  <HStack justify="space-between">
                    <Badge colorScheme={e.event_type === 'ENTER' ? 'green' : 'orange'} fontSize="2xs">
                      {e.event_type}
                    </Badge>
                    <Text fontSize="3xs" color="gray.500">{new Date(e.timestamp).toLocaleString()}</Text>
                  </HStack>
                  <Text fontSize="xs" fontWeight="bold" color="purple.900" mt={1}>{e.message}</Text>
                  <Text fontSize="3xs" color="gray.600">Vehicle: {e.vehicle_number} ({e.vehicle_model})</Text>
                </Box>
              ))
            )}
          </VStack>
        </Box>
      </SimpleGrid>

      {/* Modal: Create Geofence Zone */}
      <Modal isOpen={addModal.isOpen} onClose={addModal.onClose} size="md">
        <ModalOverlay />
        <ModalContent borderRadius="xl">
          <form onSubmit={handleCreateGeofence}>
            <ModalHeader>Create Geofenced Zone</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <VStack spacing={4}>
                <FormControl isRequired>
                  <FormLabel fontSize="xs" fontWeight="bold" uppercase>Zone Name</FormLabel>
                  <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. SFO Cargo Terminal Zone" />
                </FormControl>

                <HStack w="100%">
                  <FormControl isRequired>
                    <FormLabel fontSize="xs" fontWeight="bold" uppercase>Center Latitude</FormLabel>
                    <Input type="number" step="0.000001" value={form.center_lat} onChange={(e) => setForm({ ...form, center_lat: e.target.value })} />
                  </FormControl>
                  <FormControl isRequired>
                    <FormLabel fontSize="xs" fontWeight="bold" uppercase>Center Longitude</FormLabel>
                    <Input type="number" step="0.000001" value={form.center_lng} onChange={(e) => setForm({ ...form, center_lng: e.target.value })} />
                  </FormControl>
                </HStack>

                <FormControl isRequired>
                  <FormLabel fontSize="xs" fontWeight="bold" uppercase>Geofence Radius ({form.radius_meters} meters)</FormLabel>
                  <Slider value={form.radius_meters} min={100} max={5000} step={100} onChange={(val) => setForm({ ...form, radius_meters: val })}>
                    <SliderTrack bg="purple.100"><SliderFilledTrack bg="purple.500" /></SliderTrack>
                    <SliderThumb boxSize={5} />
                  </Slider>
                </FormControl>
              </VStack>
            </ModalBody>
            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={addModal.onClose}>Cancel</Button>
              <Button colorScheme="purple" type="submit">Deploy Zone</Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>
    </VStack>
  );
}
