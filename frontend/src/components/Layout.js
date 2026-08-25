import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSelector } from 'react-redux';
import { Box, Flex, Spinner, Center, Text } from '@chakra-ui/react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

export default function Layout({ children }) {
  const router = useRouter();
  const { isAuthenticated, loading } = useSelector((state) => state.auth);

  useEffect(() => {
    if (!isAuthenticated && !['/login', '/register'].includes(router.pathname)) {
      router.push('/login');
    }
  }, [isAuthenticated, router.pathname]);

  if (['/login', '/register'].includes(router.pathname)) {
    return <Box minH="100vh" bg="gray.50">{children}</Box>;
  }

  if (!isAuthenticated) {
    return (
      <Center h="100vh" bg="gray.50">
        <Spinner size="xl" color="blue.500" thickness="4px" />
      </Center>
    );
  }

  return (
    <Flex minH="100vh" bg="gray.50">
      <Sidebar />
      <Box flex="1" ml={{ base: 0, md: '250px' }} w={{ base: '100%', md: 'calc(100% - 250px)' }}>
        <Navbar />
        <Box as="main" p={6}>
          {children}
        </Box>
      </Box>
    </Flex>
  );
}
