import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useDispatch } from 'react-redux';
import { setAuthSuccess } from '../store/slices/authSlice';
import api from '../services/api';
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  FormControl,
  FormLabel,
  Input,
  Button,
  Alert,
  AlertIcon,
  HStack,
  Badge,
  Divider,
  Icon,
  SimpleGrid,
  useToast
} from '@chakra-ui/react';
import { Truck, ShieldCheck, Building2, User } from 'lucide-react';

export default function Login() {
  const router = useRouter();
  const dispatch = useDispatch();
  const toast = useToast();

  const [email, setEmail] = useState('admin@apexlogistics.com');
  const [password, setPassword] = useState('Password123!');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      const response = await api.post('/auth/login', { email, password });
      if (response.data.success) {
        dispatch(setAuthSuccess({
          user: response.data.user,
          token: response.data.token
        }));
        toast({
          title: `Welcome back, ${response.data.user.name}!`,
          description: `Logged in to ${response.data.user.organization_name} as ${response.data.user.role}`,
          status: 'success',
          duration: 4000,
          isClosable: true
        });
        router.push('/dashboard');
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const setDemoCredentials = (demoEmail, demoRole, orgName) => {
    setEmail(demoEmail);
    setPassword('Password123!');
    toast({
      title: `Selected ${demoRole} Demo Account`,
      description: `Loaded demo credentials for ${orgName}`,
      status: 'info',
      duration: 2000,
      isClosable: true
    });
  };

  return (
    <Container maxW="lg" py={12}>
      <VStack spacing={8} align="stretch">
        {/* Brand Banner */}
        <VStack spacing={2} textAlign="center">
          <Box p={4} bg="blue.600" borderRadius="2xl" shadow="md">
            <Truck size={36} color="white" />
          </Box>
          <Heading size="xl" fontWeight="black" color="gray.800">
            FleetTrack
          </Heading>
          <Text color="gray.500" fontSize="sm" fontWeight="medium">
            Multi-Tenant Fleet & Trip Management Platform
          </Text>
        </VStack>

        {/* Login Form Box */}
        <Box bg="white" p={8} borderRadius="2xl" shadow="xl" borderWidth="1px" borderColor="gray.100">
          <form onSubmit={handleLogin}>
            <VStack spacing={5} align="stretch">
              <Heading size="md" color="gray.800">
                Sign In to Your Workspace
              </Heading>

              {errorMsg && (
                <Alert status="error" borderRadius="md" fontSize="xs">
                  <AlertIcon />
                  {errorMsg}
                </Alert>
              )}

              <FormControl isRequired>
                <FormLabel fontSize="xs" fontWeight="bold" textTransform="uppercase" color="gray.600">
                  Email Address
                </FormLabel>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@apexlogistics.com"
                  size="lg"
                  borderRadius="lg"
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel fontSize="xs" fontWeight="bold" textTransform="uppercase" color="gray.600">
                  Password
                </FormLabel>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  size="lg"
                  borderRadius="lg"
                />
              </FormControl>

              <Button
                type="submit"
                colorScheme="blue"
                size="lg"
                fontSize="md"
                fontWeight="bold"
                isLoading={loading}
                borderRadius="lg"
                shadow="md"
                _hover={{ transform: 'translateY(-1px)', shadow: 'lg' }}
              >
                Sign In to Workspace
              </Button>
            </VStack>
          </form>

          <Divider my={6} />

          {/* Preset Demo Account Quick-Fill */}
          <VStack align="stretch" spacing={3}>
            <Text fontSize="xs" fontWeight="bold" uppercase color="gray.500" letterSpacing="wider">
              Quick Test Demo Accounts (Multi-Tenant)
            </Text>
            <SimpleGrid columns={2} spacing={2}>
              <Button
                size="xs"
                variant="outline"
                colorScheme="purple"
                onClick={() => setDemoCredentials('admin@apexlogistics.com', 'Admin', 'Apex Logistics')}
              >
                Apex Admin
              </Button>
              <Button
                size="xs"
                variant="outline"
                colorScheme="blue"
                onClick={() => setDemoCredentials('manager@apexlogistics.com', 'Manager', 'Apex Logistics')}
              >
                Apex Manager
              </Button>
              <Button
                size="xs"
                variant="outline"
                colorScheme="green"
                onClick={() => setDemoCredentials('john.miller@apexlogistics.com', 'Driver', 'Apex Logistics')}
              >
                Apex Driver
              </Button>
              <Button
                size="xs"
                variant="outline"
                colorScheme="teal"
                onClick={() => setDemoCredentials('admin@globalexpress.com', 'Admin', 'Global Express')}
              >
                Global Exp. Admin
              </Button>
            </SimpleGrid>
          </VStack>
        </Box>

        <HStack justify="center" spacing={2} fontSize="sm">
          <Text color="gray.500">Need a new organization workspace?</Text>
          <Link href="/register" passHref>
            <Text color="blue.600" fontWeight="bold" cursor="pointer">
              Register Organization
            </Text>
          </Link>
        </HStack>
      </VStack>
    </Container>
  );
}
