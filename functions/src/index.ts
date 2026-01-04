/**
 * Availo Firebase Cloud Functions
 * TTN LoRaWAN Integration for Real-time Occupancy Tracking
 * 
 * Device: strathmore-sensor1 (ESP32-S3 + LoRaWAN)
 * Gateway: strathmore-gateway1 (SenseCap M2)
 * Network: TTN Community Edition (US915)
 */

import * as admin from "firebase-admin";
import { setGlobalOptions } from "firebase-functions";
import { onRequest } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";

// Initialize Firebase Admin
admin.initializeApp();

// Set global options for performance and cost control
setGlobalOptions({ 
  maxInstances: 10,
  region: "us-central1"
});

// Device to venue mapping - matches your specific setup
interface VenueInfo {
  id: string;
  venue_name: string;
  venue_type: string;
  max_capacity: number;
  location: string;
}

// Device to venue mapping - add new devices here
// TODO: Move this to Firestore for dynamic device management
const DEVICE_VENUE_MAP: Record<string, VenueInfo> = {
  'strathmore-sensor1': {
    id: 'strathmore-sensor1',
    venue_name: 'Strathmore Study Area',
    venue_type: 'study_area',
    max_capacity: 20,
    location: 'Building A, Floor 2'
  }
};

// TTN V3 webhook payload interface - supports all event types
interface TTNWebhookPayload {
  end_device_ids: {
    device_id: string;
    application_ids: {
      application_id: string;
    };
    dev_eui?: string;
    join_eui?: string;
    dev_addr?: string;
  };
  uplink_message?: {
    frm_payload?: string; // Base64 encoded raw payload
    decoded_payload?: {
      occupancy?: number;
      wifi_count?: number;
      ble_count?: number;
      battery?: number;
    };
    rx_metadata?: Array<{
      gateway_ids: {
        gateway_id: string;
      };
      rssi: number;
      snr: number;
    }>;
  };
  join_accept?: {
    session_key_id: string;
    received_at: string;
  };
  normalized_uplink?: {
    // Future support for normalized uplink format
    [key: string]: any;
  };
  received_at: string;
}

// Occupancy data structure
interface OccupancyData {
  occupancy: number;
  wifiDevices: number;
  bleDevices: number;
  battery: number | null;
}

// Main TTN webhook handler - aligned with your cafetracker-application
export const processTTNWebhook = onRequest(async (request, response) => {
  try {
    logger.info("=== TTN Webhook Received ===");
    logger.info("Headers:", JSON.stringify(request.headers));
    logger.info("Body:", JSON.stringify(request.body));
    
    // Validate request method
    if (request.method !== 'POST') {
      logger.error('Invalid method:', request.method);
      response.status(405).send('Method Not Allowed');
      return;
    }
    
    const ttnData: TTNWebhookPayload = request.body;
    
    // Validate required TTN fields
    if (!ttnData.end_device_ids?.device_id) {
      logger.error('Missing device_id in TTN payload');
      response.status(400).send('Invalid TTN payload: missing device_id');
      return;
    }
    
    const deviceId = ttnData.end_device_ids.device_id;
    const applicationId = ttnData.end_device_ids.application_ids?.application_id;
    
    logger.info(`Processing data from device: ${deviceId}, application: ${applicationId}`);
    
    // Check for different TTN event types
    const uplinkMessage = ttnData.uplink_message;
    const joinAccept = ttnData.join_accept;
    const normalizedUplink = ttnData.normalized_uplink;
    
    // Handle non-uplink events gracefully (return 204 so TTN stays happy)
    if (!uplinkMessage) {
      if (joinAccept) {
        logger.info(`✅ Join accept from ${deviceId}:`, {
          sessionKeyId: joinAccept.session_key_id,
          receivedAt: joinAccept.received_at || ttnData.received_at
        });
        // Log successful device join for monitoring
        const db = admin.firestore();
        await db.collection('devices').doc(deviceId).set({
          last_join: admin.firestore.Timestamp.fromDate(new Date(joinAccept.received_at || ttnData.received_at)),
          session_key_id: joinAccept.session_key_id,
          status: 'joined',
          dev_addr: ttnData.end_device_ids.dev_addr
        }, { merge: true });
        
        response.status(204).send(); // TTN expects 2xx for successful processing
        return;
      } else if (normalizedUplink) {
        logger.info(`📡 Normalized uplink from ${deviceId} - processing...`);
        // Handle normalized uplink format if needed in the future
        response.status(204).send();
        return;
      } else {
        logger.info(`ℹ️ Non-uplink TTN event from ${deviceId}:`, Object.keys(ttnData));
        response.status(204).send(); // Always return success to prevent TTN retries
        return;
      }
    }
    
    // Validate device is registered (only for uplink processing)
    const venueInfo = DEVICE_VENUE_MAP[deviceId];
    if (!venueInfo) {
      logger.warn(`Unknown device: ${deviceId} - but acknowledging to TTN`);
      response.status(204).send(); // Don't cause TTN webhook failures
      return;
    }
    
    const rawPayload = uplinkMessage.frm_payload;
    const decodedPayload = uplinkMessage.decoded_payload;
    const receivedAt = ttnData.received_at;
    const rxMetadata = uplinkMessage.rx_metadata?.[0];
    
    logger.info(`Raw payload: ${rawPayload}`);
    logger.info(`Decoded payload:`, decodedPayload);
    
    // Decode occupancy data from payload
    const occupancyData = decodeAvailoPayload(rawPayload, decodedPayload, deviceId);
    
    // Prepare data for Firestore lounge_status collection (matches frontend)
    const loungeStatusData = {
      id: deviceId,
      current_occupancy: occupancyData.occupancy,
      max_capacity: venueInfo.max_capacity,
      last_updated: admin.firestore.Timestamp.fromDate(new Date(receivedAt || Date.now())),
      device_id: deviceId,
      wifi_devices: occupancyData.wifiDevices,
      ble_devices: occupancyData.bleDevices,
      venue_name: venueInfo.venue_name,
      venue_type: venueInfo.venue_type,
      // Optional technical data
      signal_strength: rxMetadata?.rssi || null,
      snr: rxMetadata?.snr || null,
      gateway_id: rxMetadata?.gateway_ids?.gateway_id || null,
      battery_level: occupancyData.battery || null
    };
    
    logger.info('Storing lounge status data:', loungeStatusData);
    
    const db = admin.firestore();
    
    // Store in Firestore lounge_status collection (matches existing frontend)
    await db.collection('lounge_status').doc(deviceId).set(loungeStatusData);
    
    // Update device registry for monitoring
    await db.collection('devices').doc(deviceId).set({
      ...venueInfo,
      last_seen: loungeStatusData.last_updated,
      status: 'online',
      signal_strength: loungeStatusData.signal_strength,
      battery_level: loungeStatusData.battery_level,
      total_messages: admin.firestore.FieldValue.increment(1)
    }, { merge: true });

    // PHASE 3A: Historical Data Recording
    // Validate timestamp - use current time if invalid
    let timestamp: Date;
    try {
      timestamp = receivedAt ? new Date(receivedAt) : new Date();
      if (isNaN(timestamp.getTime())) {
        logger.warn('Invalid received_at timestamp, using current time');
        timestamp = new Date();
      }
    } catch {
      timestamp = new Date();
    }
    const occupancyRate = occupancyData.occupancy / venueInfo.max_capacity;
    
    // Create historical occupancy record
    const historicalData = {
      // Core data from existing webhook
      timestamp: admin.firestore.Timestamp.fromDate(timestamp),
      device_id: deviceId,
      venue_name: venueInfo.venue_name,
      venue_type: venueInfo.venue_type,
      
      // Occupancy metrics
      current_occupancy: occupancyData.occupancy,
      max_capacity: venueInfo.max_capacity,
      occupancy_rate: occupancyRate,
      wifi_devices: occupancyData.wifiDevices,
      ble_devices: occupancyData.bleDevices,
      
      // Time analytics
      hour: timestamp.getHours(),
      day_of_week: timestamp.getDay(), // 0=Sunday, 6=Saturday
      date: timestamp.toISOString().split('T')[0], // "2025-07-31"
      month: timestamp.toISOString().slice(0, 7), // "2025-07"
      is_weekend: [0, 6].includes(timestamp.getDay()),
      
      // Sensor health from TTN metadata
      signal_strength: rxMetadata?.rssi || null,
      snr: rxMetadata?.snr || null,
      gateway_id: rxMetadata?.gateway_ids?.gateway_id || null,
      battery_level: occupancyData.battery || null
    };

    // Store historical record
    const historyDocId = `${timestamp.getTime()}_${deviceId}`;
    await db.collection('occupancy_history').doc(historyDocId).set(historicalData);
    
    // Update real-time daily aggregations
    await updateDailyAggregations(db, deviceId, occupancyData, venueInfo, timestamp, rxMetadata?.rssi || null);
    
    logger.info(`✅ Successfully processed data from ${venueInfo.venue_name}`);
    logger.info(`📊 Occupancy: ${occupancyData.occupancy}/${venueInfo.max_capacity} people (${Math.round(occupancyRate * 100)}%)`);
    logger.info(`📈 Historical data recorded for analytics`);
    
    // Return 204 (No Content) - TTN prefers this for successful webhook processing
    response.status(204).send();
    
  } catch (error) {
    logger.error('❌ Error processing TTN webhook:', error);

    // Return 500 on actual errors so TTN can retry
    // TTN will retry on 5xx errors which is appropriate for transient failures
    response.status(500).json({
      success: false,
      error: 'Internal processing error',
      timestamp: new Date().toISOString()
    });
  }
});

// Decode Availo sensor payload - handles current test data and future occupancy data
function decodeAvailoPayload(
  base64Payload?: string, 
  decodedPayload?: any, 
  deviceId?: string
): OccupancyData {
  logger.info(`Decoding payload for ${deviceId}:`, { base64Payload, decodedPayload });
  
  // If TTN provides decoded payload, use it (future enhancement)
  if (decodedPayload && typeof decodedPayload === 'object') {
    return {
      occupancy: decodedPayload.occupancy || 
                Math.max(0, Math.floor(((decodedPayload.wifi_count || 0) + (decodedPayload.ble_count || 0)) * 0.4)),
      wifiDevices: decodedPayload.wifi_count || 0,
      bleDevices: decodedPayload.ble_count || 0,
      battery: decodedPayload.battery || null
    };
  }
  
  // Handle raw payload (current situation with DEADBEEF test data)
  if (!base64Payload) {
    logger.warn('No payload data available');
    return { occupancy: 0, wifiDevices: 0, bleDevices: 0, battery: null };
  }
  
  try {
    const buffer = Buffer.from(base64Payload, 'base64');
    logger.info('Decoded buffer:', buffer.toString('hex').toUpperCase());
    
    // Handle current test payload "DEADBEEF"
    if (buffer.toString('hex').toUpperCase() === 'DEADBEEF') {
      logger.info('📡 Test payload detected - simulating occupancy data');
      // Simulate realistic occupancy for testing
      const simulatedOccupancy = Math.floor(Math.random() * 8) + 1; // 1-8 people
      return {
        occupancy: simulatedOccupancy,
        wifiDevices: simulatedOccupancy * 2, // Simulate WiFi devices
        bleDevices: Math.floor(simulatedOccupancy * 0.5), // Simulate BLE devices
        battery: 85 // Simulate battery level
      };
    }
    
    // Future: Handle real occupancy payload format
    // When ESP32 firmware is updated to send actual WiFi/BLE counts
    if (buffer.length >= 4) {
      const wifiCount = buffer[0];
      const bleCount = buffer[1];
      const battery = buffer[2];
      
      // Estimate occupancy from device counts (adjustable algorithm)
      const estimatedOccupancy = Math.max(0, Math.floor((wifiCount + bleCount * 0.5) * 0.4));
      
      return {
        occupancy: Math.min(estimatedOccupancy, DEVICE_VENUE_MAP[deviceId || '']?.max_capacity || 20),
        wifiDevices: wifiCount,
        bleDevices: bleCount,
        battery: battery > 0 ? battery : null
      };
    }
    
    // Fallback for single byte payload
    const deviceCount = buffer[0] || 0;
    return {
      occupancy: Math.max(0, Math.floor(deviceCount * 0.4)),
      wifiDevices: deviceCount,
      bleDevices: 0,
      battery: null
    };
    
  } catch (decodeError) {
    logger.error('Error decoding payload:', decodeError);
    return { occupancy: 0, wifiDevices: 0, bleDevices: 0, battery: null };
  }
}

// Health check endpoint for monitoring
export const healthCheck = onRequest((request, response) => {
  const healthData = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'Availo TTN-Firebase Integration',
    version: '1.0.0',
    registered_devices: Object.keys(DEVICE_VENUE_MAP),
    firestore_collections: ['lounge_status', 'devices']
  };
  
  logger.info('Health check requested:', healthData);
  response.json(healthData);
});

// PHASE 3A: Real-time Daily Aggregations Function
async function updateDailyAggregations(
  db: admin.firestore.Firestore,
  deviceId: string,
  occupancyData: OccupancyData,
  venueInfo: VenueInfo,
  timestamp: Date,
  signalStrength: number | null
) {
  try {
    const dateStr = timestamp.toISOString().split('T')[0]; // "2025-07-31"
    const hour = timestamp.getHours();
    const docId = `${dateStr}_${deviceId}`;
    const occupancyRate = occupancyData.occupancy / venueInfo.max_capacity;
    
    logger.info(`📊 Updating daily aggregations for ${dateStr}, hour ${hour}`);
    
    // Get existing daily analytics document
    const dailyRef = db.collection('daily_analytics').doc(docId);
    const dailyDoc = await dailyRef.get();
    
    if (!dailyDoc.exists) {
      // Create new daily analytics document
      const newDailyData = {
        date: dateStr,
        device_id: deviceId,
        venue_name: venueInfo.venue_name,
        
        // Initialize statistics
        occupancy_stats: {
          avg_occupancy: occupancyData.occupancy,
          avg_occupancy_rate: occupancyRate,
          max_occupancy: occupancyData.occupancy,
          min_occupancy: occupancyData.occupancy,
          peak_hour: hour,
          total_readings: 1
        },
        
        // Initialize usage patterns
        usage_patterns: {
          busy_hours: occupancyRate > 0.5 ? [hour] : [],
          quiet_hours: occupancyRate < 0.2 ? [hour] : [],
          rush_periods: []
        },
        
        // Initialize hourly data
        hourly_data: {
          [hour.toString()]: {
            avg_occupancy: occupancyData.occupancy,
            max_occupancy: occupancyData.occupancy,
            readings_count: 1,
            avg_wifi_devices: occupancyData.wifiDevices,
            avg_ble_devices: occupancyData.bleDevices
          }
        },
        
        // Initialize study efficiency
        study_efficiency: {
          utilization_rate: occupancyRate,
          optimal_hours: occupancyRate > 0.2 && occupancyRate < 0.7 ? [hour] : [],
          overcrowded_periods: occupancyRate > 0.8 ? [hour] : []
        },
        
        // Sensor health
        sensor_health: {
          uptime_percentage: 100,
          avg_signal_strength: signalStrength || -75,
          battery_status: (occupancyData.battery || 85) > 20 ? "good" : "warning",
          data_quality_score: 100
        },
        
        created_at: admin.firestore.Timestamp.fromDate(timestamp),
        last_updated: admin.firestore.Timestamp.fromDate(timestamp)
      };
      
      await dailyRef.set(newDailyData);
      logger.info(`✅ Created new daily analytics for ${dateStr}`);
      
    } else {
      // Update existing daily analytics
      const existingData = dailyDoc.data();
      const currentReadings = existingData?.occupancy_stats?.total_readings || 0;
      const newReadings = currentReadings + 1;

      // Calculate running averages
      const currentAvgOccupancy = existingData?.occupancy_stats?.avg_occupancy || 0;
      const newAvgOccupancy = ((currentAvgOccupancy * currentReadings) + occupancyData.occupancy) / newReadings;

      const currentAvgRate = existingData?.occupancy_stats?.avg_occupancy_rate || 0;
      const newAvgRate = ((currentAvgRate * currentReadings) + occupancyRate) / newReadings;

      // Check if this hour's data exists
      const hourKey = hour.toString();
      const existingHourData = existingData?.hourly_data?.[hourKey];

      // Build update object
      const updateData: Record<string, unknown> = {
        [`occupancy_stats.avg_occupancy`]: newAvgOccupancy,
        [`occupancy_stats.avg_occupancy_rate`]: newAvgRate,
        [`occupancy_stats.max_occupancy`]: Math.max(
          existingData?.occupancy_stats?.max_occupancy || 0,
          occupancyData.occupancy
        ),
        [`occupancy_stats.min_occupancy`]: Math.min(
          existingData?.occupancy_stats?.min_occupancy ?? occupancyData.occupancy,
          occupancyData.occupancy
        ),
        [`occupancy_stats.total_readings`]: newReadings,
        last_updated: admin.firestore.Timestamp.fromDate(timestamp)
      };

      // Initialize or update hourly data
      if (!existingHourData) {
        // Initialize this hour's data
        updateData[`hourly_data.${hourKey}`] = {
          avg_occupancy: occupancyData.occupancy,
          max_occupancy: occupancyData.occupancy,
          readings_count: 1,
          avg_wifi_devices: occupancyData.wifiDevices,
          avg_ble_devices: occupancyData.bleDevices
        };
      } else {
        // Update existing hour data
        updateData[`hourly_data.${hourKey}.readings_count`] = admin.firestore.FieldValue.increment(1);
        updateData[`hourly_data.${hourKey}.max_occupancy`] = Math.max(
          existingHourData.max_occupancy || 0,
          occupancyData.occupancy
        );
      }

      // Update peak hour if this reading is higher
      if (occupancyData.occupancy > (existingData?.occupancy_stats?.max_occupancy || 0)) {
        updateData[`occupancy_stats.peak_hour`] = hour;
      }

      // Update busy/quiet hours arrays if needed
      const busyHours: number[] = existingData?.usage_patterns?.busy_hours || [];
      const quietHours: number[] = existingData?.usage_patterns?.quiet_hours || [];

      if (occupancyRate > 0.5 && !busyHours.includes(hour)) {
        updateData[`usage_patterns.busy_hours`] = admin.firestore.FieldValue.arrayUnion(hour);
      }
      if (occupancyRate < 0.2 && !quietHours.includes(hour)) {
        updateData[`usage_patterns.quiet_hours`] = admin.firestore.FieldValue.arrayUnion(hour);
      }

      await dailyRef.update(updateData);
      logger.info(`✅ Updated daily analytics for ${dateStr} (${newReadings} total readings)`);
    }
    
  } catch (error) {
    logger.error('❌ Error updating daily aggregations:', error);
    // Don't throw - continue processing even if aggregation fails
  }
}

// Get device configuration (useful for debugging)
export const getDeviceConfig = onRequest((request, response) => {
  const deviceId = request.query.device as string;
  
  if (deviceId) {
    const config = DEVICE_VENUE_MAP[deviceId];
    if (config) {
      response.json({ success: true, device: deviceId, config });
    } else {
      response.status(404).json({ success: false, error: `Device ${deviceId} not found` });
    }
  } else {
    response.json({ 
      success: true, 
      registered_devices: DEVICE_VENUE_MAP 
    });
  }
});

// Legacy function for backward compatibility
export const getLoungeOccupancy = onRequest(async (request, response) => {
  try {
    const db = admin.firestore();
    const snapshot = await db.collection('lounge_status').get();
    
    const lounges = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    response.json({ lounges });
  } catch (error) {
    logger.error('Error getting lounge occupancy:', error);
    response.status(500).send('Internal Server Error');
  }
});
