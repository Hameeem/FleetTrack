import React, { useEffect, useRef, useState } from 'react';
import { Box, Text, Badge, VStack, HStack, Button } from '@chakra-ui/react';

export default function MapComponent({
  vehicles = [],
  activeTrips = [],
  geofences = [],
  selectedVehicleId = null,
  center = [37.774929, -122.419418],
  zoom = 12
}) {
  const mapContainerRef = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [useFallback, setUseFallback] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    // If Mapbox token is present, initialize Mapbox GL JS
    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    if (token && typeof window !== 'undefined' && !window.mapboxgl) {
      try {
        const mapboxgl = require('mapbox-gl');
        mapboxgl.accessToken = token;
      } catch (e) {
        setUseFallback(true);
      }
    }
  }, []);

  return (
    <Box pos="relative" w="100%" h="100%" borderRadius="xl" overflow="hidden" boxShadow="inner" bg="gray.900">
      {/* Simulation / Live Telematics Header Badge */}
      <Box pos="absolute" top={3} left={3} zIndex={5} bg="gray.900" color="white" px={3} py={1.5} borderRadius="md" boxShadow="lg" border="1px solid" borderColor="gray.700">
        <HStack spacing={2}>
          <Box w={2.5} h={2.5} borderRadius="full" bg="green.400" className="pulse-dot" />
          <Text fontSize="xs" fontWeight="bold">
            Simulated GPS Live Telematics
          </Text>
          <Badge colorScheme="blue" fontSize="3xs">Active</Badge>
        </HStack>
      </Box>

      {/* Interactive Map Visualizer */}
      <Box ref={mapContainerRef} w="100%" h="100%" minH="450px" bg="#1a202c" p={4} pos="relative">
        <Box
          pos="absolute"
          inset={0}
          bgGradient="radial(circle at center, gray.800 0%, gray.900 100%)"
          display="flex"
          flexDirection="column"
          justifyContent="center"
          align="center"
          p={6}
        >
          {/* Active Vehicles Visual Grid/Map Representation */}
          <VStack spacing={4} align="stretch" maxW="800px" mx="auto" w="100%" zIndex={2}>
            <Text color="gray.300" fontSize="sm" fontWeight="bold" textTransform="uppercase" letterSpacing="wider">
              Fleet Vehicle Locations & Active Routes ({vehicles.length} Vehicles, {activeTrips.length} Active Trips)
            </Text>

            {vehicles.length === 0 ? (
              <Text color="gray.500" fontSize="sm">No active vehicles reporting location.</Text>
            ) : (
              <VStack align="stretch" spacing={3} maxH="350px" overflowY="auto" pr={2}>
                {vehicles.map((v) => {
                  const currentTrip = activeTrips.find(t => t.vehicle_id === v.id);
                  const isSelected = v.id === selectedVehicleId;
                  return (
                    <Box
                      key={v.id}
                      p={3.5}
                      bg={isSelected ? 'gray.800' : 'gray.850'}
                      borderRadius="lg"
                      border="1px solid"
                      borderColor={isSelected ? 'blue.500' : 'gray.700'}
                      cursor="pointer"
                      onClick={() => setSelectedItem(v)}
                      _hover={{ borderColor: 'blue.400', bg: 'gray.800' }}
                    >
                      <HStack justify="space-between">
                        <HStack spacing={3}>
                          <Badge colorScheme={v.status === 'On Trip' ? 'blue' : v.status === 'Available' ? 'green' : 'orange'} px={2} py={1} borderRadius="md">
                            {v.status}
                          </Badge>
                          <Text color="white" fontWeight="bold" fontSize="sm">
                            {v.vehicle_number} — {v.model}
                          </Text>
                        </HStack>
                        <Text color="gray.400" fontSize="xs">
                          Lat: {Number(v.current_lat).toFixed(4)}, Lng: {Number(v.current_lng).toFixed(4)}
                        </Text>
                      </HStack>

                      {currentTrip && (
                        <Text color="blue.300" fontSize="xs" mt={2}>
                          Active Trip: {currentTrip.trip_number} ({currentTrip.origin_name} ➔ {currentTrip.destination_name})
                        </Text>
                      )}
                    </Box>
                  );
                })}
              </VStack>
            )}

            {/* Geofences Overview Bar */}
            {geofences.length > 0 && (
              <Box bg="gray.800" p={3} borderRadius="lg" border="1px solid" borderColor="gray.700">
                <Text fontSize="xs" color="gray.400" fontWeight="bold" uppercase mb={2}>
                  Monitored Geofenced Zones ({geofences.length})
                </Text>
                <HStack spacing={3} wrap="wrap">
                  {geofences.map(g => (
                    <Badge key={g.id} colorScheme="purple" variant="outline" px={2} py={1}>
                      {g.name} ({g.radius_meters}m)
                    </Badge>
                  ))}
                </HStack>
              </Box>
            )}
          </VStack>
        </Box>
      </Box>
    </Box>
  );
}
