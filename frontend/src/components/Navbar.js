import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/router';
import { logout } from '../store/slices/authSlice';
import {
  Flex,
  Box,
  Text,
  Button,
  Avatar,
  HStack,
  Badge,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider
} from '@chakra-ui/react';
import { LogOut, User, Building2 } from 'lucide-react';

export default function Navbar() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { user } = useSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    router.push('/login');
  };

  return (
    <Flex
      as="header"
      bg="white"
      h="64px"
      px={6}
      align="center"
      justify="space-between"
      borderBottomWidth="1px"
      borderColor="gray.200"
      pos="sticky"
      top={0}
      zIndex={5}
      boxShadow="sm"
    >
      <Box>
        <Text fontSize="lg" fontWeight="bold" color="gray.800">
          Fleet Operations Console
        </Text>
        <Text fontSize="2xs" color="gray.500">
          Real-time Telematics & SaaS Multi-Tenant Platform
        </Text>
      </Box>

      <HStack spacing={4}>
        {/* Tenant Organization Tag */}
        {user?.organization_name && (
          <HStack bg="gray.100" px={3} py={1.5} borderRadius="full">
            <Building2 size={14} color="#4A5568" />
            <Text fontSize="xs" fontWeight="semibold" color="gray.700">
              {user.organization_name}
            </Text>
          </HStack>
        )}

        {/* User Profile Menu */}
        <Menu>
          <MenuButton as={Button} variant="ghost" p={1} borderRadius="full">
            <HStack spacing={2}>
              <Avatar size="sm" name={user?.name || 'User'} bg="blue.600" color="white" />
              <Box textAlign="left" display={{ base: 'none', md: 'block' }}>
                <Text fontSize="xs" fontWeight="bold" color="gray.800" leading="none">
                  {user?.name || 'Account'}
                </Text>
                <Badge fontSize="3xs" colorScheme={user?.role === 'Admin' ? 'purple' : user?.role === 'Manager' ? 'blue' : 'green'}>
                  {user?.role || 'User'}
                </Badge>
              </Box>
            </HStack>
          </MenuButton>
          <MenuList shadow="lg" borderRadius="lg" p={2}>
            <Box px={3} py={2}>
              <Text fontSize="xs" color="gray.500">Signed in as</Text>
              <Text fontSize="sm" fontWeight="bold" color="gray.800">{user?.email}</Text>
              <Text fontSize="xs" color="blue.600" fontWeight="medium">{user?.organization_name}</Text>
            </Box>
            <MenuDivider />
            <MenuItem icon={<LogOut size={16} />} color="red.600" fontWeight="semibold" onClick={handleLogout}>
              Logout
            </MenuItem>
          </MenuList>
        </Menu>
      </HStack>
    </Flex>
  );
}
