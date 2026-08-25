const db = require('../config/db');

async function getDashboardSummary(req, res, next) {
  try {
    const orgId = req.organizationId;

    // Counts
    const vehiclesCount = await db('vehicles').where('organization_id', orgId).count('id as count').first();
    const activeVehiclesCount = await db('vehicles').where('organization_id', orgId).andWhere('status', 'On Trip').count('id as count').first();
    const availableVehiclesCount = await db('vehicles').where('organization_id', orgId).andWhere('status', 'Available').count('id as count').first();
    
    const driversCount = await db('drivers').where('organization_id', orgId).count('id as count').first();
    
    const tripsTotalCount = await db('trips').where('organization_id', orgId).count('id as count').first();
    const activeTripsCount = await db('trips').where('organization_id', orgId).andWhere('status', 'In Progress').count('id as count').first();
    const completedTripsCount = await db('trips').where('organization_id', orgId).andWhere('status', 'Completed').count('id as count').first();
    const cancelledTripsCount = await db('trips').where('organization_id', orgId).andWhere('status', 'Cancelled').count('id as count').first();
    
    const incidentsCount = await db('incidents').where('organization_id', orgId).count('id as count').first();
    
    const distanceSum = await db('vehicles').where('organization_id', orgId).sum('total_distance as total').first();

    const totalV = Number(vehiclesCount ? (vehiclesCount.count || vehiclesCount['count(*)'] || 0) : 0);
    const activeV = Number(activeVehiclesCount ? (activeVehiclesCount.count || activeVehiclesCount['count(*)'] || 0) : 0);
    const utilizationRate = totalV > 0 ? Math.round((activeV / totalV) * 100) : 0;

    // Chart Data 1: Trips Status Distribution
    const statusDistribution = [
      { name: 'Completed', value: Number(completedTripsCount ? (completedTripsCount.count || completedTripsCount['count(*)'] || 0) : 0), color: '#38A169' },
      { name: 'In Progress', value: Number(activeTripsCount ? (activeTripsCount.count || activeTripsCount['count(*)'] || 0) : 0), color: '#3182CE' },
      { name: 'Scheduled / Assigned', value: Math.max(0, Number(tripsTotalCount ? (tripsTotalCount.count || tripsTotalCount['count(*)'] || 0) : 0) - (Number(completedTripsCount ? (completedTripsCount.count || completedTripsCount['count(*)'] || 0) : 0) + Number(activeTripsCount ? (activeTripsCount.count || activeTripsCount['count(*)'] || 0) : 0) + Number(cancelledTripsCount ? (cancelledTripsCount.count || cancelledTripsCount['count(*)'] || 0) : 0))), color: '#DD6B20' },
      { name: 'Cancelled', value: Number(cancelledTripsCount ? (cancelledTripsCount.count || cancelledTripsCount['count(*)'] || 0) : 0), color: '#E53E3E' }
    ];

    // Chart Data 2: Distance & Trips Trend (Simulated 7-day timeline + real totals)
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const tripsOverTime = days.map((day, idx) => ({
      day,
      completed: 3 + (idx % 3),
      cancelled: idx === 2 || idx === 5 ? 1 : 0,
      distance: 120 + idx * 45
    }));

    // Chart Data 3: Vehicle Utilization by Type
    const vehiclesByType = await db('vehicles')
      .where('organization_id', orgId)
      .select('vehicle_type')
      .count('id as count')
      .groupBy('vehicle_type');

    // Chart Data 4: Driver Activity Leaderboard
    const driverActivity = await db('drivers')
      .leftJoin('trips', 'drivers.id', 'trips.driver_id')
      .select('drivers.id', 'drivers.name', 'drivers.status')
      .count('trips.id as trip_count')
      .where('drivers.organization_id', orgId)
      .groupBy('drivers.id', 'drivers.name', 'drivers.status')
      .orderBy('trip_count', 'desc')
      .limit(5);

    // Recent trips table snippet
    const recentTrips = await db('trips')
      .join('drivers', 'trips.driver_id', 'drivers.id')
      .join('vehicles', 'trips.vehicle_id', 'vehicles.id')
      .select('trips.*', 'drivers.name as driver_name', 'vehicles.vehicle_number')
      .where('trips.organization_id', orgId)
      .orderBy('trips.created_at', 'desc')
      .limit(5);

    return res.json({
      success: true,
      summary: {
        total_vehicles: totalV,
        active_vehicles: activeV,
        available_vehicles: Number(availableVehiclesCount ? (availableVehiclesCount.count || availableVehiclesCount['count(*)'] || 0) : 0),
        total_drivers: Number(driversCount ? (driversCount.count || driversCount['count(*)'] || 0) : 0),
        total_trips: Number(tripsTotalCount ? (tripsTotalCount.count || tripsTotalCount['count(*)'] || 0) : 0),
        active_trips: Number(activeTripsCount ? (activeTripsCount.count || activeTripsCount['count(*)'] || 0) : 0),
        completed_trips: Number(completedTripsCount ? (completedTripsCount.count || completedTripsCount['count(*)'] || 0) : 0),
        cancelled_trips: Number(cancelledTripsCount ? (cancelledTripsCount.count || cancelledTripsCount['count(*)'] || 0) : 0),
        safety_incidents: Number(incidentsCount ? (incidentsCount.count || incidentsCount['count(*)'] || 0) : 0),
        total_distance_km: Math.round(Number(distanceSum ? (distanceSum.total || 0) : 0)),
        utilization_rate: utilizationRate
      },
      charts: {
        statusDistribution,
        tripsOverTime,
        vehiclesByType: vehiclesByType.map(v => ({ type: v.vehicle_type, count: Number(v.count || v['count(*)'] || 0) })),
        driverActivity: driverActivity.map(d => ({ name: d.name, trips: Number(d.trip_count || d['trip_count'] || 0), status: d.status }))
      },
      recentTrips
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getDashboardSummary
};
