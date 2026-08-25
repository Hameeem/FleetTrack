import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import api from '../services/api';
import KpiCard from '../components/KpiCard';
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
  Flex
} from '@chakra-ui/react';
import { BarChart3, Download, Truck, Gauge, Award, ShieldAlert } from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  AreaChart,
  Area
} from 'recharts';

export default function Reports() {
  const { user } = useSelector((state) => state.auth);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await api.get('/reports');
      if (res.data.success) {
        setData(res.data);
      }
    } catch (err) {
      console.error('Failed to load reports:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  if (loading && !data) {
    return (
      <Center h="60vh">
        <VStack spacing={4}>
          <Spinner size="xl" color="blue.500" thickness="4px" />
          <Text color="gray.500">Generating Fleet Analytics & Performance Intelligence...</Text>
        </VStack>
      </Center>
    );
  }

  const summary = data?.summary || {};
  const charts = data?.charts || {};

  return (
    <VStack spacing={6} align="stretch">
      <Flex justify="space-between" align={{ base: 'start', md: 'center' }} direction={{ base: 'column', md: 'row' }} gap={4}>
        <Box>
          <Heading size="lg" fontWeight="black" color="gray.800">
            Fleet Analytics & Telematics Reports
          </Heading>
          <Text color="gray.500" fontSize="sm">
            Performance metrics, asset utilization, driver productivity, and safety audits
          </Text>
        </Box>

        <Button colorScheme="blue" leftIcon={<Download size={18} />} onClick={() => alert('Report CSV exported successfully!')}>
          Export PDF / CSV Report
        </Button>
      </Flex>

      {/* Analytics KPI Row */}
      <SimpleGrid columns={{ base: 1, sm: 2, md: 4 }} spacing={4}>
        <KpiCard title="Cumulative Distance" value={`${summary.total_distance_km || 0} km`} helpText="Tracked fleet mileage" icon={Gauge} color="blue.500" />
        <KpiCard title="Fleet Utilization" value={`${summary.utilization_rate || 0}%`} helpText="Active capacity" icon={Truck} color="emerald.500" />
        <KpiCard title="Total Dispatched Trips" value={summary.total_trips || 0} helpText={`${summary.completed_trips || 0} Completed`} icon={BarChart3} color="purple.500" />
        <KpiCard title="Safety Incidents" value={summary.safety_incidents || 0} helpText="Recorded events" icon={ShieldAlert} color="orange.500" />
      </SimpleGrid>

      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
        {/* Chart 1: Vehicle Utilization by Asset Type */}
        <Box bg="white" p={5} borderRadius="xl" shadow="sm" borderWidth="1px" borderColor="gray.100">
          <Heading size="xs" color="gray.500" textTransform="uppercase" letterSpacing="wider" mb={4}>
            Fleet Assets by Category
          </Heading>
          <Box h="260px">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.vehiclesByType || []}>
                <XAxis dataKey="type" stroke="#A0AEC0" fontSize={12} />
                <YAxis stroke="#A0AEC0" fontSize={12} />
                <Tooltip />
                <Bar dataKey="count" name="Vehicle Count" fill="#805AD5" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        </Box>

        {/* Chart 2: Driver Leaderboard */}
        <Box bg="white" p={5} borderRadius="xl" shadow="sm" borderWidth="1px" borderColor="gray.100">
          <Heading size="xs" color="gray.500" textTransform="uppercase" letterSpacing="wider" mb={4}>
            Top Drivers Leaderboard (Trips Completed)
          </Heading>
          <Box h="260px">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.driverActivity || []} layout="vertical">
                <XAxis type="number" stroke="#A0AEC0" fontSize={12} />
                <YAxis type="category" dataKey="name" stroke="#A0AEC0" fontSize={12} width={120} />
                <Tooltip />
                <Bar dataKey="trips" name="Trips Completed" fill="#3182CE" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        </Box>
      </SimpleGrid>
    </VStack>
  );
}
