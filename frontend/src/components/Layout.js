import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSelector } from 'react-redux';
import { Box, Flex, Spinner, Center } from '@chakra-ui/react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

export default function Layout({ children }) {
  const router = useRouter();
  const { isAuthenticated } = useSelector((state) => state.auth);

  const cleanPath = router.pathname.toLowerCase();
  const isAuthPage = cleanPath.includes('/login') || cleanPath.includes('/register');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('fleettrack_token');
      if (!token && !isAuthPage) {
        router.push('/login');
      }
    }
  }, [isAuthenticated, isAuthPage, router]);

  if (isAuthPage) {
    return <Box minH="100vh" bg="gray.50">{children}</Box>;
  }

  // If not authenticated in Redux and no token in localStorage, show login layout fallback immediately
  if (!isAuthenticated && typeof window !== 'undefined' && !localStorage.getItem('fleettrack_token')) {
    return <Box minH="100vh" bg="gray.50">{children}</Box>;
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
