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
  Select,
  Button,
  Alert,
  AlertIcon,
  HStack,
  useToast
} from '@chakra-ui/react';
import { Truck } from 'lucide-react';

export default function Register() {
  const router = useRouter();
  const dispatch = useDispatch();
  const toast = useToast();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'Admin',
    organization_name: '',
    organization_code: ''
  });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      const response = await api.post('/auth/register', formData);
      if (response.data.success) {
        dispatch(
          setAuthSuccess({
            user: response.data.user,
            token: response.data.token
          })
        );
        toast({
          title: 'Organization Registered!',
          description: `Created organization ${response.data.user.organization_name}`,
          status: 'success',
          duration: 4000,
          isClosable: true
        });
        router.push('/dashboard');
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Registration failed. Please verify details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxW="lg" py={10}>
      <VStack spacing={6} align="stretch">
        <VStack spacing={2} textAlign="center">
          <Box p={3} bg="blue.600" borderRadius="xl" shadow="md">
            <Truck size={30} color="white" />
          </Box>
          <Heading size="lg" fontWeight="black" color="gray.800">
            Register Organization
          </Heading>
          <Text color="gray.500" fontSize="sm">
            Set up multi-tenant fleet management workspace
          </Text>
        </VStack>

        <Box bg="white" p={8} borderRadius="2xl" shadow="xl" borderWidth="1px" borderColor="gray.100">
          <form onSubmit={handleRegister}>
            <VStack spacing={4} align="stretch">
              {errorMsg && (
                <Alert status="error" borderRadius="md" fontSize="xs">
                  <AlertIcon />
                  {errorMsg}
                </Alert>
              )}

              <FormControl isRequired>
                <FormLabel fontSize="xs" fontWeight="bold" textTransform="uppercase" color="gray.600">
                  Organization Name
                </FormLabel>
                <Input
                  name="organization_name"
                  value={formData.organization_name}
                  onChange={handleChange}
                  placeholder="e.g. Apex Logistics Inc."
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel fontSize="xs" fontWeight="bold" textTransform="uppercase" color="gray.600">
                  Organization Unique Code (3-10 Chars)
                </FormLabel>
                <Input
                  name="organization_code"
                  value={formData.organization_code}
                  onChange={handleChange}
                  placeholder="e.g. APEXLOG"
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel fontSize="xs" fontWeight="bold" textTransform="uppercase" color="gray.600">
                  Admin Full Name
                </FormLabel>
                <Input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="John Doe"
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel fontSize="xs" fontWeight="bold" textTransform="uppercase" color="gray.600">
                  Work Email Address
                </FormLabel>
                <Input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="admin@company.com"
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel fontSize="xs" fontWeight="bold" textTransform="uppercase" color="gray.600">
                  Password
                </FormLabel>
                <Input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="At least 6 characters"
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel fontSize="xs" fontWeight="bold" textTransform="uppercase" color="gray.600">
                  Initial Role
                </FormLabel>
                <Select name="role" value={formData.role} onChange={handleChange}>
                  <option value="Admin">Admin (Full Control)</option>
                  <option value="Manager">Manager (Operations)</option>
                  <option value="Driver">Driver (Trips & Forms)</option>
                </Select>
              </FormControl>

              <Button
                type="submit"
                colorScheme="blue"
                size="lg"
                mt={2}
                isLoading={loading}
                borderRadius="lg"
              >
                Create Workspace
              </Button>
            </VStack>
          </form>
        </Box>

        <HStack justify="center" spacing={2} fontSize="sm">
          <Text color="gray.500">Already registered?</Text>
          <Link href="/login" passHref>
            <Text color="blue.600" fontWeight="bold" cursor="pointer">
              Sign In
            </Text>
          </Link>
        </HStack>
      </VStack>
    </Container>
  );
}
