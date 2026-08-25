import React from 'react';
import { Badge } from '@chakra-ui/react';

export default function StatusBadge({ status }) {
  let colorScheme = 'gray';

  switch (status?.toLowerCase()) {
    case 'active':
    case 'available':
    case 'completed':
    case 'resolved':
      colorScheme = 'green';
      break;
    case 'in progress':
    case 'on trip':
    case 'under review':
      colorScheme = 'blue';
      break;
    case 'assigned':
    case 'scheduled':
    case 'pending':
    case 'low':
      colorScheme = 'yellow';
      break;
    case 'maintenance':
    case 'medium':
      colorScheme = 'orange';
      break;
    case 'cancelled':
    case 'deactivated':
    case 'inactive':
    case 'high':
    case 'critical':
    case 'off duty':
      colorScheme = 'red';
      break;
    default:
      colorScheme = 'gray';
  }

  return (
    <Badge colorScheme={colorScheme} px={2.5} py={0.5} borderRadius="full" fontSize="xs" fontWeight="bold">
      {status}
    </Badge>
  );
}
