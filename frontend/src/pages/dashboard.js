import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import api from '../services/api';
import { setSummary } from '../store/slices/fleetSlice';
import KpiCard from '../components/KpiCard';
import StatusBadge from '../components/StatusBadge';
import {
  Box,
  Heading,
  Text,
  SimpleGrid,
  VStack,
  HStack,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Spinner,
  Center,
  Button,
  Icon,
  Flex
} from '@chakra-ui/react';
import {
  Truck,
  Users,
  Navigation,
  CheckCircle2,
  XCircle,
  ShieldAlert,
  Gauge,
  Activity,
  ArrowUpRight,
  Radio
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts';

export default function Dashboard() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await api.get('/reports');
      if (res.data.success) {
        setData(res.data);
        dispatch(setSummary(res.data.summary));
      }
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
    const interval = setInterval(fetchDashboard, 5000);
    return () => clearInterval(interval);
  }, []);

  if (loading && !data) {
    return (
      <Center h="60vh">
        <VStack spacing={4}>
          <Spinner size="xl" color="blue.500" thickness="4px" />
          <Text color="gray.500">Loading Fleet Telematics & Analytics...</Text>
        </VStack>
      </Center>
    );
  }

  const summary = data?.summary || {};
  const charts = data?.charts || {};
  const recentTrips = data?.recentTrips || [];

  return (
    <VStack spacing={6} align="stretch">
      {/* Header Banner */}
      <Flex justify="space-between" align={{ base: 'start', md: 'center' }} direction={{ base: 'column', md: 'row' }} gap={4}>
        <Box>
          <Heading size="lg" fontWeight="black" color="gray.800">
            Fleet Operations Overview
          </Heading>
          <Text color="gray.500" fontSize="sm">
            Live telemetry, active trips, safety alerts, and tenant metrics for <Text as="span" fontWeight="bold" color="blue.600">{user?.organization_name}</Text>
          </Text>
        </Box>

        <HStack spacing={3}>
          <HStack bg="green.50" color="green.700" px={3} py={1.5} borderRadius="full" border="1px solid" borderColor="green.200">
            <Box w={2.5} h={2.5} bg="green.500" borderRadius="full" className="pulse-dot" />
            <Text fontSize="xs" fontWeight="bold">GPS Simulation Active</Text>
          </HStack>
          <Button size="sm" colorScheme="blue" leftIcon={<Radio size={16} />} onClick={fetchDashboard}>
            Refresh
          </Button>
        </HStack>
      </Flex>

      {/* 9 KPI Summary Cards */}
      <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 5 }} spacing={4}>
        <KpiCard
          title="Total Vehicles"
          value={summary.total_vehicles || 0}
          helpText={`${summary.available_vehicles || 0} Available`}
          icon={Truck}
          color="blue.500"
        />
        <KpiCard
          title="Active Vehicles"
          value={summary.active_vehicles || 0}
          helpText="Currently on trip"
          icon={Activity}
          color="teal.500"
        />
        <KpiCard
          title="Total Drivers"
          value={summary.total_drivers || 0}
          helpText="Assigned in org"
          icon={Users}
          color="purple.500"
        />
        <KpiCard
          title="Active Trips"
          value={summary.active_trips || 0}
          helpText="In Progress (GPS Tracking)"
          icon={Navigation}
          color="indigo.500"
        />
        <KpiCard
          title="Completed Trips"
          value={summary.completed_trips || 0}
          helpText="Successfully delivered"
          icon={CheckCircle2}
          color="green.500"
        />
        <KpiCard
          title="Cancelled Trips"
          value={summary.cancelled_trips || 0}
          helpText="Aborted / Refunded"
          icon={XCircle}
          color="red.500"
        />
        <KpiCard
          title="Safety Events"
          value={summary.safety_incidents || 0}
          helpText="Incidents reported"
          icon={ShieldAlert}
          color="orange.500"
        />
        <KpiCard
          title="Total Distance"
          value={`${summary.total_distance_km || 0} km`}
          helpText="Cumulative distance"
          icon={Gauge}
          color="cyan.500"
        />
        <KpiCard
          title="Utilization Rate"
          value={`${summary.utilization_rate || 0}%`}
          helpText="Active fleet capacity"
          icon={ArrowUpRight}
          color="emerald.500"
        />
      </SimpleGrid>

      {/* Analytics Charts Grid */}
      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
        {/* Chart 1: Trips Over Time & Distance */}
        <Box bg="white" p={5} borderRadius="xl" shadow="sm" borderWidth="1px" borderColor="gray.100">
          <Heading size="xs" color="gray.500" textTransform="uppercase" letterSpacing="wider" mb={4}>
            Trips & Distance Travelled Trend
          </Heading>
          <Box h="260px">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={charts.tripsOverTime || []}>
                <XAxis dataKey="day" stroke="#A0AEC0" fontSize={12} />
                <YAxis stroke="#A0AEC0" fontSize={12} />
                <Tooltip />
                <Area type="monotone" dataKey="distance" name="Distance (km)" stroke="#3182CE" fill="#EBF8FF" strokeWidth={2} />
                <Bar dataKey="completed" name="Completed Trips" fill="#38A169" radius={[4, 4, 0, 0]} />
              </AreaChart>
            </ResponsiveContainer>
          </Box>
        </Box>

        {/* Chart 2: Trip Status Distribution */}
        <Box bg="white" p={5} borderRadius="xl" shadow="sm" borderWidth="1px" borderColor="gray.100">
          <Heading size="xs" color="gray.500" textTransform="uppercase" letterSpacing="wider" mb={4}>
            Trip Status Distribution
          </Heading>
          <Box h="260px">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={charts.statusDistribution || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {(charts.statusDistribution || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Box>
        </Box>
      </SimpleGrid>

      {/* Recent Trips Table */}
      <Box bg="white" borderRadius="xl" shadow="sm" borderWidth="1px" borderColor="gray.100" overflow="hidden">
        <Box p={5} borderBottomWidth="1px" borderColor="gray.100">
          <Heading size="sm" color="gray.800">
            Recent Trip Dispatch Log
          </Heading>
        </Box>
        <Table variant="simple" size="sm">
          <Thead bg="gray.50">
            <Tr>
              <Th>Trip #</Th>
              <Th>Driver</Th>
              <Th>Vehicle</Th>
              <Th>Origin</Th>
              <Th>Destination</Th>
              <Th>Status</Th>
            </Tr>
          </Thead>
          <Tbody>
            {recentTrips.length === 0 ? (
              <Tr>
                <Td colSpan={6} textAlign="center" color="gray.500" py={6}>
                  No recent trips logged for this organization.
                </Td>
              </Tr>
            ) : (
              recentTrips.map((t) => (
                <Tr key={t.id} _hover={{ bg: 'gray.50' }}>
                  <Td fontWeight="bold" color="blue.600">{t.trip_number}</Td>
                  <Td>{t.driver_name}</Td>
                  <Td>{t.vehicle_number}</Td>
                  <Td fontSize="xs" color="gray.600">{t.origin_name}</Td>
                  <Td fontSize="xs" color="gray.600">{t.destination_name}</Td>
                  <Td><StatusBadge status={t.status} /></Td>
                </Tr>
              ))
            )}
          </Tbody>
        </Table>
      </Box>
    </VStack>
  );
}
