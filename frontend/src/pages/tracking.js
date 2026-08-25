import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import api from '../services/api';
import { setLiveTracking } from '../store/slices/fleetSlice';
import MapComponent from '../components/MapComponent';
import StatusBadge from '../components/StatusBadge';
import {
  Box,
  Heading,
  Text,
  SimpleGrid,
  VStack,
  HStack,
  Badge,
  Spinner,
  Center,
  Button,
  Flex
} from '@chakra-ui/react';
import { Radio, Truck, MapPin, Activity, ShieldCheck } from 'lucide-react';

export default function Tracking() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedVehicleId, setSelectedVehicleId] = useState(null);

  const fetchTracking = async () => {
    try {
      const res = await api.get('/tracking');
      if (res.data.success) {
        setData(res.data);
        dispatch(setLiveTracking(res.data));
      }
    } catch (err) {
      console.error('Error fetching live tracking:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTracking();
    const interval = setInterval(fetchTracking, 3000);
    return () => clearInterval(interval);
  }, []);

  if (loading && !data) {
    return (
      <Center h="60vh">
        <VStack spacing={4}>
          <Spinner size="xl" color="blue.500" thickness="4px" />
          <Text color="gray.500">Connecting to Simulated GPS Telemetry Stream...</Text>
        </VStack>
      </Center>
    );
  }

  const vehicles = data?.vehicles || [];
  const activeTrips = data?.activeTrips || [];
  const geofences = data?.geofences || [];
  const recentEvents = data?.recentEvents || [];

  return (
    <VStack spacing={6} align="stretch">
      <Flex justify="space-between" align={{ base: 'start', md: 'center' }} direction={{ base: 'column', md: 'row' }} gap={4}>
        <Box>
          <Heading size="lg" fontWeight="black" color="gray.800">
            Live Fleet Map & Simulated GPS Tracking
          </Heading>
          <Text color="gray.500" fontSize="sm">
            Real-time vehicle position telemetry, route waypoints, and geofence alerts
          </Text>
        </Box>

        <HStack bg="green.50" px={3} py={1.5} borderRadius="full" border="1px solid" borderColor="green.200">
          <Box w={2.5} h={2.5} bg="green.500" borderRadius="full" className="pulse-dot" />
          <Text fontSize="xs" fontWeight="bold" color="green.800">
            Live Stream (3s Interval)
          </Text>
        </HStack>
      </Flex>

      <SimpleGrid columns={{ base: 1, lg: 3 }} spacing={6}>
        {/* Map Column (Spans 2) */}
        <Box gridColumn={{ lg: 'span 2' }} h="550px">
          <MapComponent
            vehicles={vehicles}
            activeTrips={activeTrips}
            geofences={geofences}
            selectedVehicleId={selectedVehicleId}
          />
        </Box>

        {/* Live Telematics Sidebar */}
        <VStack align="stretch" spacing={4} h="550px" overflowY="auto">
          {/* Active Vehicles List */}
          <Box bg="white" p={4} borderRadius="xl" shadow="sm" borderWidth="1px" borderColor="gray.100">
            <Heading size="xs" color="gray.500" textTransform="uppercase" letterSpacing="wider" mb={3}>
              Active Fleet Status ({vehicles.length})
            </Heading>
            <VStack align="stretch" spacing={2.5} maxH="240px" overflowY="auto">
              {vehicles.map((v) => (
                <Box
                  key={v.id}
                  p={3}
                  bg={v.id === selectedVehicleId ? 'blue.50' : 'gray.50'}
                  borderRadius="lg"
                  border="1px solid"
                  borderColor={v.id === selectedVehicleId ? 'blue.400' : 'gray.200'}
                  cursor="pointer"
                  onClick={() => setSelectedVehicleId(v.id)}
                  _hover={{ bg: 'blue.50', borderColor: 'blue.300' }}
                >
                  <HStack justify="space-between">
                    <Text fontWeight="bold" fontSize="sm" color="gray.800">
                      {v.vehicle_number}
                    </Text>
                    <StatusBadge status={v.status} />
                  </HStack>
                  <Text fontSize="xs" color="gray.500">
                    Model: {v.model} • Driver: {v.driver_name || 'None'}
                  </Text>
                  <Text fontSize="2xs" color="gray.400" mt={1}>
                    GPS: {Number(v.current_lat).toFixed(4)}, {Number(v.current_lng).toFixed(4)}
                  </Text>
                </Box>
              ))}
            </VStack>
          </Box>

          {/* Recent Geofence Alerts Feed */}
          <Box bg="white" p={4} borderRadius="xl" shadow="sm" borderWidth="1px" borderColor="gray.100" flex="1">
            <Heading size="xs" color="gray.500" textTransform="uppercase" letterSpacing="wider" mb={3}>
              Recent Geofence Events ({recentEvents.length})
            </Heading>
            <VStack align="stretch" spacing={2} maxH="200px" overflowY="auto">
              {recentEvents.length === 0 ? (
                <Text fontSize="xs" color="gray.500">No recent geofence events logged.</Text>
              ) : (
                recentEvents.map((ev) => (
                  <Box key={ev.id} p={2.5} bg="purple.50" borderRadius="md" borderLeft="3px solid" borderColor="purple.500">
                    <HStack justify="space-between">
                      <Badge colorScheme={ev.event_type === 'ENTER' ? 'green' : 'orange'} fontSize="3xs">
                        {ev.event_type}
                      </Badge>
                      <Text fontSize="3xs" color="gray.500">
                        {new Date(ev.timestamp).toLocaleTimeString()}
                      </Text>
                    </HStack>
                    <Text fontSize="xs" fontWeight="semibold" color="purple.900" mt={1}>
                      {ev.message}
                    </Text>
                  </Box>
                ))
              )}
            </VStack>
          </Box>
        </VStack>
      </SimpleGrid>
    </VStack>
  );
}
