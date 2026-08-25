import React from 'react';
import { Box, Flex, Stat, StatLabel, StatNumber, StatHelpText, Icon } from '@chakra-ui/react';

export default function KpiCard({ title, value, helpText, icon, color = 'blue.500' }) {
  return (
    <Box bg="white" p={5} borderRadius="xl" shadow="sm" borderWidth="1px" borderColor="gray.100">
      <Flex align="center" justify="space-between">
        <Stat>
          <StatLabel color="gray.500" fontSize="xs" fontWeight="bold" textTransform="uppercase" letterSpacing="wide">
            {title}
          </StatLabel>
          <StatNumber fontSize="2xl" fontWeight="extrabold" color="gray.800" mt={1}>
            {value}
          </StatNumber>
          {helpText && (
            <StatHelpText fontSize="xs" color="gray.500" mb={0} mt={1}>
              {helpText}
            </StatHelpText>
          )}
        </Stat>
        {icon && (
          <Box p={3} bg={`${color.split('.')[0]}.50`} borderRadius="lg">
            <Icon as={icon} boxSize={6} color={color} />
          </Box>
        )}
      </Flex>
    </Box>
  );
}
