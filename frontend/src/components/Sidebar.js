import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useSelector } from 'react-redux';
import {
  Box,
  VStack,
  HStack,
  Text,
  Icon,
  Badge,
  Divider,
  Flex
} from '@chakra-ui/react';
import {
  LayoutDashboard,
  MapPin,
  Truck,
  Users,
  Navigation,
  ShieldAlert,
  BarChart3,
  FileCheck2,
  Radio
} from 'lucide-react';

export default function Sidebar() {
  const router = useRouter();
  const { user } = useSelector((state) => state.auth);

  const role = user?.role || 'Driver';

  const menuItems = [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard', roles: ['Admin', 'Manager', 'Driver'] },
    { label: 'Live Tracking', icon: Radio, path: '/tracking', roles: ['Admin', 'Manager', 'Driver'] },
    { label: 'Vehicles', icon: Truck, path: '/vehicles', roles: ['Admin', 'Manager'] },
    { label: 'Drivers', icon: Users, path: '/drivers', roles: ['Admin', 'Manager'] },
    { label: 'Trips', icon: Navigation, path: '/trips', roles: ['Admin', 'Manager', 'Driver'] },
    { label: 'Geofencing', icon: MapPin, path: '/geofences', roles: ['Admin', 'Manager'] },
    { label: 'Incidents & Inspections', icon: FileCheck2, path: '/incidents', roles: ['Admin', 'Manager', 'Driver'] },
    { label: 'Fleet Analytics', icon: BarChart3, path: '/reports', roles: ['Admin', 'Manager'] }
  ];

  const filteredItems = menuItems.filter(item => item.roles.includes(role));

  return (
    <Box
      w={{ base: 'full', md: '250px' }}
      bg="gray.900"
      color="white"
      minH="100vh"
      p={4}
      pos="fixed"
      left={0}
      top={0}
      zIndex={10}
      boxShadow="xl"
    >
      {/* Brand Header */}
      <Flex align="center" gap={3} px={2} py={4} mb={2}>
        <Box p={2} bg="blue.600" borderRadius="lg">
          <Truck size={22} color="white" />
        </Box>
        <Box>
          <Text fontSize="lg" fontWeight="black" letterSpacing="wide" color="white">
            FleetTrack
          </Text>
          <Text fontSize="xs" color="gray.400" fontWeight="medium">
            Multi-Tenant Fleet Platform
          </Text>
        </Box>
      </Flex>

      {/* Organization Badge */}
      {user?.organization_name && (
        <Box bg="gray.800" p={3} borderRadius="lg" mb={6} borderLeft="4px solid" borderColor="blue.500">
          <Text fontSize="xs" color="gray.400" uppercase fontWeight="bold">
            Tenant Organization
          </Text>
          <Text fontSize="sm" fontWeight="bold" color="white" isTruncated>
            {user.organization_name}
          </Text>
        </Box>
      )}

      <Divider borderColor="gray.800" mb={4} />

      {/* Menu Navigation Links */}
      <VStack align="stretch" spacing={1}>
        {filteredItems.map((item) => {
          const isActive = router.pathname === item.path;
          return (
            <Link key={item.path} href={item.path} passHref>
              <HStack
                px={3}
                py={2.5}
                borderRadius="md"
                cursor="pointer"
                bg={isActive ? 'blue.600' : 'transparent'}
                color={isActive ? 'white' : 'gray.300'}
                _hover={{ bg: isActive ? 'blue.600' : 'gray.800', color: 'white' }}
                transition="all 0.15s ease"
              >
                <Icon as={item.icon} boxSize={5} boxColor={isActive ? 'white' : 'gray.400'} />
                <Text fontSize="sm" fontWeight={isActive ? 'bold' : 'medium'}>
                  {item.label}
                </Text>
              </HStack>
            </Link>
          );
        })}
      </VStack>

      {/* User Role Footer */}
      <Box pos="absolute" bottom={4} left={4} right={4} p={3} bg="gray.800" borderRadius="lg">
        <Flex justify="space-between" align="center">
          <Box>
            <Text fontSize="xs" color="gray.400">Current Role</Text>
            <Text fontSize="xs" fontWeight="bold" color="white">{role}</Text>
          </Box>
          <Badge colorScheme={role === 'Admin' ? 'purple' : role === 'Manager' ? 'blue' : 'green'} fontSize="2xs">
            {role}
          </Badge>
        </Flex>
      </Box>
    </Box>
  );
}
