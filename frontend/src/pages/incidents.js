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
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Switch,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  Textarea,
  Flex
} from '@chakra-ui/react';
import { Plus, ShieldAlert, FileCheck2, CheckCircle2, XCircle } from 'lucide-react';

export default function Incidents() {
  const toast = useToast();
  const { user } = useSelector((state) => state.auth);

  const [incidents, setIncidents] = useState([]);
  const [inspections, setInspections] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const incidentModal = useDisclosure();
  const inspectionModal = useDisclosure();

  // Form states
  const [incidentForm, setIncidentForm] = useState({
    vehicle_id: '',
    incident_type: 'Traffic Congestion Delay',
    description: '',
    location_name: '',
    severity: 'Medium'
  });

  const [inspectionForm, setInspectionForm] = useState({
    vehicle_id: '',
    brakes_passed: true,
    tires_passed: true,
    lights_passed: true,
    fuel_level: 90,
    damage_reported: false,
    notes: 'Pre-trip checklist verified.'
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [incRes, insRes, vRes] = await Promise.all([
        api.get('/incidents/incidents'),
        api.get('/incidents/inspections'),
        api.get('/vehicles')
      ]);
      if (incRes.data.success) setIncidents(incRes.data.incidents);
      if (insRes.data.success) setInspections(insRes.data.inspections);
      if (vRes.data.success) setVehicles(vRes.data.vehicles);
    } catch (err) {
      toast({ title: 'Failed to fetch operational forms data', status: 'error', duration: 3000 });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenIncident = () => {
    setIncidentForm({
      vehicle_id: vehicles.length > 0 ? vehicles[0].id : '',
      incident_type: 'Engine Warning Light',
      description: 'Check engine light triggered during transport.',
      location_name: 'Highway I-80 Mile Marker 42',
      severity: 'Medium'
    });
    incidentModal.onOpen();
  };

  const handleOpenInspection = () => {
    setInspectionForm({
      vehicle_id: vehicles.length > 0 ? vehicles[0].id : '',
      brakes_passed: true,
      tires_passed: true,
      lights_passed: true,
      fuel_level: 95,
      damage_reported: false,
      notes: 'Pre-trip inspection passed all safety checks.'
    });
    inspectionModal.onOpen();
  };

  const handleSubmitIncident = async (e) => {
    e.preventDefault();
    try {
      await api.post('/incidents/incidents', {
        ...incidentForm,
        vehicle_id: Number(incidentForm.vehicle_id)
      });
      toast({ title: 'Incident report submitted!', status: 'warning', duration: 3000 });
      incidentModal.onClose();
      fetchData();
    } catch (err) {
      toast({ title: err.response?.data?.message || 'Error submitting incident', status: 'error', duration: 4000 });
    }
  };

  const handleSubmitInspection = async (e) => {
    e.preventDefault();
    try {
      await api.post('/incidents/inspections', {
        ...inspectionForm,
        vehicle_id: Number(inspectionForm.vehicle_id)
      });
      toast({ title: 'Vehicle inspection report saved!', status: 'success', duration: 3000 });
      inspectionModal.onClose();
      fetchData();
    } catch (err) {
      toast({ title: err.response?.data?.message || 'Error saving inspection', status: 'error', duration: 4000 });
    }
  };

  return (
    <VStack spacing={6} align="stretch">
      <Flex justify="space-between" align={{ base: 'start', md: 'center' }} direction={{ base: 'column', md: 'row' }} gap={4}>
        <Box>
          <Heading size="lg" fontWeight="black" color="gray.800">
            Operational Forms & Incident Reporting
          </Heading>
          <Text color="gray.500" fontSize="sm">
            Vehicle pre-trip safety checklists and safety incident logs
          </Text>
        </Box>

        <HStack spacing={3}>
          <Button colorScheme="green" leftIcon={<FileCheck2 size={18} />} onClick={handleOpenInspection}>
            New Inspection Form
          </Button>
          <Button colorScheme="orange" leftIcon={<ShieldAlert size={18} />} onClick={handleOpenIncident}>
            Report Incident
          </Button>
        </HStack>
      </Flex>

      {/* Tabs */}
      <Tabs variant="enclosed" colorScheme="blue">
        <TabList bg="white" p={2} borderRadius="xl" border="1px solid" borderColor="gray.100">
          <Tab fontWeight="bold" fontSize="sm"><ShieldAlert size={16} style={{ marginRight: '6px' }} /> Safety Incident Reports ({incidents.length})</Tab>
          <Tab fontWeight="bold" fontSize="sm"><FileCheck2 size={16} style={{ marginRight: '6px' }} /> Pre-Trip Vehicle Inspections ({inspections.length})</Tab>
        </TabList>

        <TabPanels mt={4}>
          {/* Panel 1: Incident Reports */}
          <TabPanel p={0}>
            <Box bg="white" borderRadius="xl" shadow="sm" borderWidth="1px" borderColor="gray.100" overflow="hidden">
              <Table variant="simple">
                <Thead bg="gray.50">
                  <Tr>
                    <Th>Incident Type</Th>
                    <Th>Driver</Th>
                    <Th>Vehicle</Th>
                    <Th>Location</Th>
                    <Th>Severity</Th>
                    <Th>Logged Date</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {incidents.length === 0 ? (
                    <Tr><Td colSpan={6} textAlign="center" py={8} color="gray.500">No safety incidents logged.</Td></Tr>
                  ) : (
                    incidents.map((inc) => (
                      <Tr key={inc.id} _hover={{ bg: 'gray.50' }}>
                        <Td>
                          <Text fontWeight="bold" color="gray.800">{inc.incident_type}</Text>
                          <Text fontSize="xs" color="gray.500" maxW="280px" isTruncated>{inc.description}</Text>
                        </Td>
                        <Td fontSize="sm">{inc.driver_name}</Td>
                        <Td fontSize="xs" fontWeight="bold">{inc.vehicle_number}</Td>
                        <Td fontSize="xs" color="gray.600">{inc.location_name}</Td>
                        <Td><StatusBadge status={inc.severity} /></Td>
                        <Td fontSize="xs" color="gray.500">{new Date(inc.created_at).toLocaleString()}</Td>
                      </Tr>
                    ))
                  )}
                </Tbody>
              </Table>
            </Box>
          </TabPanel>

          {/* Panel 2: Pre-Trip Inspections */}
          <TabPanel p={0}>
            <Box bg="white" borderRadius="xl" shadow="sm" borderWidth="1px" borderColor="gray.100" overflow="hidden">
              <Table variant="simple">
                <Thead bg="gray.50">
                  <Tr>
                    <Th>Inspection ID</Th>
                    <Th>Driver</Th>
                    <Th>Vehicle</Th>
                    <Th>Brakes</Th>
                    <Th>Tires</Th>
                    <Th>Lights</Th>
                    <Th>Fuel Level</Th>
                    <Th>Damage</Th>
                    <Th>Date</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {inspections.length === 0 ? (
                    <Tr><Td colSpan={9} textAlign="center" py={8} color="gray.500">No vehicle inspections logged.</Td></Tr>
                  ) : (
                    inspections.map((ins) => (
                      <Tr key={ins.id} _hover={{ bg: 'gray.50' }}>
                        <Td fontWeight="bold" color="blue.600">INSP-00{ins.id}</Td>
                        <Td fontSize="sm">{ins.driver_name}</Td>
                        <Td fontSize="xs" fontWeight="bold">{ins.vehicle_number}</Td>
                        <Td>{ins.brakes_passed ? <Badge colorScheme="green">PASS</Badge> : <Badge colorScheme="red">FAIL</Badge>}</Td>
                        <Td>{ins.tires_passed ? <Badge colorScheme="green">PASS</Badge> : <Badge colorScheme="red">FAIL</Badge>}</Td>
                        <Td>{ins.lights_passed ? <Badge colorScheme="green">PASS</Badge> : <Badge colorScheme="red">FAIL</Badge>}</Td>
                        <Td fontWeight="bold" color="cyan.600">{ins.fuel_level}%</Td>
                        <Td>{ins.damage_reported ? <Badge colorScheme="red">YES</Badge> : <Badge colorScheme="gray">NO</Badge>}</Td>
                        <Td fontSize="xs" color="gray.500">{new Date(ins.created_at).toLocaleDateString()}</Td>
                      </Tr>
                    ))
                  )}
                </Tbody>
              </Table>
            </Box>
          </TabPanel>
        </TabPanels>
      </Tabs>

      {/* Modal 1: Submit Incident Report */}
      <Modal isOpen={incidentModal.isOpen} onClose={incidentModal.onClose} size="lg">
        <ModalOverlay />
        <ModalContent borderRadius="xl">
          <form onSubmit={handleSubmitIncident}>
            <ModalHeader>Submit Incident Report</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <VStack spacing={4}>
                <FormControl isRequired>
                  <FormLabel fontSize="xs" fontWeight="bold" uppercase>Select Vehicle</FormLabel>
                  <Select value={incidentForm.vehicle_id} onChange={(e) => setIncidentForm({ ...incidentForm, vehicle_id: e.target.value })}>
                    {vehicles.map(v => (
                      <option key={v.id} value={v.id}>{v.vehicle_number} ({v.model})</option>
                    ))}
                  </Select>
                </FormControl>
                <HStack w="100%">
                  <FormControl isRequired>
                    <FormLabel fontSize="xs" fontWeight="bold" uppercase>Incident Type</FormLabel>
                    <Select value={incidentForm.incident_type} onChange={(e) => setIncidentForm({ ...incidentForm, incident_type: e.target.value })}>
                      <option value="Traffic Congestion Delay">Traffic Congestion Delay</option>
                      <option value="Engine Warning Light">Engine Warning Light</option>
                      <option value="Flat Tire">Flat Tire</option>
                      <option value="Severe Weather Delay">Severe Weather Delay</option>
                      <option value="Minor Collision">Minor Collision</option>
                    </Select>
                  </FormControl>
                  <FormControl isRequired>
                    <FormLabel fontSize="xs" fontWeight="bold" uppercase>Severity</FormLabel>
                    <Select value={incidentForm.severity} onChange={(e) => setIncidentForm({ ...incidentForm, severity: e.target.value })}>
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                      <option value="Critical">Critical</option>
                    </Select>
                  </FormControl>
                </HStack>
                <FormControl isRequired>
                  <FormLabel fontSize="xs" fontWeight="bold" uppercase>Location Name / GPS Landmark</FormLabel>
                  <Input value={incidentForm.location_name} onChange={(e) => setIncidentForm({ ...incidentForm, location_name: e.target.value })} placeholder="Bay Bridge Toll Plaza" />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel fontSize="xs" fontWeight="bold" uppercase>Detailed Description</FormLabel>
                  <Textarea value={incidentForm.description} onChange={(e) => setIncidentForm({ ...incidentForm, description: e.target.value })} placeholder="Explain what occurred..." />
                </FormControl>
              </VStack>
            </ModalBody>
            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={incidentModal.onClose}>Cancel</Button>
              <Button colorScheme="orange" type="submit">Submit Incident</Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>

      {/* Modal 2: Submit Vehicle Inspection */}
      <Modal isOpen={inspectionModal.isOpen} onClose={inspectionModal.onClose} size="lg">
        <ModalOverlay />
        <ModalContent borderRadius="xl">
          <form onSubmit={handleSubmitInspection}>
            <ModalHeader>Pre-Trip Vehicle Inspection Checklist</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <VStack spacing={4} align="stretch">
                <FormControl isRequired>
                  <FormLabel fontSize="xs" fontWeight="bold" uppercase>Select Vehicle</FormLabel>
                  <Select value={inspectionForm.vehicle_id} onChange={(e) => setInspectionForm({ ...inspectionForm, vehicle_id: e.target.value })}>
                    {vehicles.map(v => (
                      <option key={v.id} value={v.id}>{v.vehicle_number} ({v.model})</option>
                    ))}
                  </Select>
                </FormControl>

                <HStack justify="space-between" bg="gray.50" p={3} borderRadius="lg">
                  <Text fontSize="sm" fontWeight="bold">Brakes Inspection Passed?</Text>
                  <Switch isChecked={inspectionForm.brakes_passed} onChange={(e) => setInspectionForm({ ...inspectionForm, brakes_passed: e.target.checked })} colorScheme="green" />
                </HStack>

                <HStack justify="space-between" bg="gray.50" p={3} borderRadius="lg">
                  <Text fontSize="sm" fontWeight="bold">Tires & Pressure Checked?</Text>
                  <Switch isChecked={inspectionForm.tires_passed} onChange={(e) => setInspectionForm({ ...inspectionForm, tires_passed: e.target.checked })} colorScheme="green" />
                </HStack>

                <HStack justify="space-between" bg="gray.50" p={3} borderRadius="lg">
                  <Text fontSize="sm" fontWeight="bold">Headlights & Signals Working?</Text>
                  <Switch isChecked={inspectionForm.lights_passed} onChange={(e) => setInspectionForm({ ...inspectionForm, lights_passed: e.target.checked })} colorScheme="green" />
                </HStack>

                <FormControl>
                  <FormLabel fontSize="xs" fontWeight="bold" uppercase>Fuel Level ({inspectionForm.fuel_level}%)</FormLabel>
                  <Slider value={inspectionForm.fuel_level} onChange={(val) => setInspectionForm({ ...inspectionForm, fuel_level: val })}>
                    <SliderTrack bg="cyan.100"><SliderFilledTrack bg="cyan.500" /></SliderTrack>
                    <SliderThumb boxSize={4} />
                  </Slider>
                </FormControl>

                <HStack justify="space-between" bg="red.50" p={3} borderRadius="lg">
                  <Text fontSize="sm" fontWeight="bold" color="red.800">Any Pre-existing Damage Observed?</Text>
                  <Switch isChecked={inspectionForm.damage_reported} onChange={(e) => setInspectionForm({ ...inspectionForm, damage_reported: e.target.checked })} colorScheme="red" />
                </HStack>

                <FormControl>
                  <FormLabel fontSize="xs" fontWeight="bold" uppercase>Inspection Notes</FormLabel>
                  <Input value={inspectionForm.notes} onChange={(e) => setInspectionForm({ ...inspectionForm, notes: e.target.value })} />
                </FormControl>
              </VStack>
            </ModalBody>
            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={inspectionModal.onClose}>Cancel</Button>
              <Button colorScheme="green" type="submit">Complete Checklist</Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>
    </VStack>
  );
}
