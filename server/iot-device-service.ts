/**
 * IoT Device Integration Service
 * 
 * Framework for medical IoT device data integration.
 * This is a placeholder implementation for device cloud API integration.
 * 
 * TODO: Integrate with device APIs (Fitbit, Apple Health, medical device manufacturers)
 * Supported device platforms:
 * - Fitbit Health API
 * - Apple HealthKit
 * - Google Fit
 * - Withings
 * - Omron Connect
 * - iHealth
 * - Medical device FHIR APIs
 */

interface DeviceReading {
  deviceId: string;
  deviceType: 'blood_pressure' | 'glucose' | 'heart_rate' | 'pulse_ox' | 'weight' | 'temperature';
  value: any;
  unit: string;
  timestamp: Date;
  source?: string;
}

interface AlertThreshold {
  deviceType: string;
  minValue?: number;
  maxValue?: number;
  criticalMin?: number;
  criticalMax?: number;
}

interface DeviceAlert {
  severity: 'normal' | 'warning' | 'critical';
  message: string;
  value: number;
  threshold: number;
}

export class IoTDeviceService {
  // Alert thresholds for different device types
  private readonly ALERT_THRESHOLDS: { [key: string]: AlertThreshold } = {
    blood_pressure: {
      criticalMin: 90,     // Systolic < 90 is critical
      minValue: 100,       // Systolic < 100 is warning
      maxValue: 140,       // Systolic > 140 is warning
      criticalMax: 180     // Systolic > 180 is critical
    },
    glucose: {
      criticalMin: 54,     // < 54 mg/dL is critical hypoglycemia
      minValue: 70,        // < 70 mg/dL is warning
      maxValue: 180,       // > 180 mg/dL is warning
      criticalMax: 250     // > 250 mg/dL is critical
    },
    heart_rate: {
      criticalMin: 40,     // < 40 bpm is critical bradycardia
      minValue: 60,        // < 60 bpm is warning
      maxValue: 100,       // > 100 bpm is warning
      criticalMax: 120     // > 120 bpm is critical tachycardia
    },
    pulse_ox: {
      criticalMin: 85,     // SpO2 < 85% is critical
      minValue: 90,        // SpO2 < 90% is warning
    },
    weight: {
      // Weight alerts based on rapid changes, not absolute values
      // Implement in checkWeightChange()
    },
    temperature: {
      criticalMin: 95.0,   // < 95°F is critical hypothermia
      minValue: 97.0,      // < 97°F is warning
      maxValue: 99.5,      // > 99.5°F is warning
      criticalMax: 103.0   // > 103°F is critical hyperthermia
    }
  };

  /**
   * Process and validate device reading
   * 
   * @param reading Device reading data
   * @returns Processed reading with validation status
   */
  processDeviceReading(reading: DeviceReading): {
    valid: boolean;
    processedValue: any;
    alert?: DeviceAlert;
    normalized: boolean;
  } {
    // Validate reading data
    if (!reading.deviceId || !reading.deviceType || reading.value === undefined) {
      return {
        valid: false,
        processedValue: null,
        normalized: false
      };
    }

    // Process based on device type
    let processedValue = reading.value;
    let alert: DeviceAlert | undefined;

    switch (reading.deviceType) {
      case 'blood_pressure':
        // Blood pressure reading typically has systolic and diastolic
        const bp = this.parseBloodPressure(reading.value);
        processedValue = bp;
        alert = this.checkAlertThresholds('blood_pressure', bp.systolic);
        break;

      case 'glucose':
        // Convert to mg/dL if needed
        processedValue = this.normalizeGlucose(reading.value, reading.unit);
        alert = this.checkAlertThresholds('glucose', processedValue);
        break;

      case 'heart_rate':
        processedValue = Number(reading.value);
        alert = this.checkAlertThresholds('heart_rate', processedValue);
        break;

      case 'pulse_ox':
        processedValue = Number(reading.value);
        alert = this.checkAlertThresholds('pulse_ox', processedValue);
        break;

      case 'weight':
        processedValue = this.normalizeWeight(reading.value, reading.unit);
        // Weight alerts are based on trends, not single readings
        break;

      case 'temperature':
        processedValue = this.normalizeTemperature(reading.value, reading.unit);
        alert = this.checkAlertThresholds('temperature', processedValue);
        break;
    }

    return {
      valid: true,
      processedValue,
      alert,
      normalized: true
    };
  }

  /**
   * Check if reading is outside normal thresholds
   * 
   * @param deviceType Type of device
   * @param value Reading value
   * @returns Alert if value is out of range
   */
  checkAlertThresholds(deviceType: string, value: number): DeviceAlert | undefined {
    const thresholds = this.ALERT_THRESHOLDS[deviceType];
    if (!thresholds) return undefined;

    // Check critical thresholds first
    if (thresholds.criticalMin !== undefined && value < thresholds.criticalMin) {
      return {
        severity: 'critical',
        message: `Critical low ${deviceType} reading`,
        value,
        threshold: thresholds.criticalMin
      };
    }

    if (thresholds.criticalMax !== undefined && value > thresholds.criticalMax) {
      return {
        severity: 'critical',
        message: `Critical high ${deviceType} reading`,
        value,
        threshold: thresholds.criticalMax
      };
    }

    // Check warning thresholds
    if (thresholds.minValue !== undefined && value < thresholds.minValue) {
      return {
        severity: 'warning',
        message: `Low ${deviceType} reading`,
        value,
        threshold: thresholds.minValue
      };
    }

    if (thresholds.maxValue !== undefined && value > thresholds.maxValue) {
      return {
        severity: 'warning',
        message: `High ${deviceType} reading`,
        value,
        threshold: thresholds.maxValue
      };
    }

    return undefined;
  }

  /**
   * Sync device data from cloud platform
   * 
   * TODO: Implement actual API integration for:
   * - Fitbit: https://dev.fitbit.com/build/reference/web-api/
   * - Apple HealthKit: Cloud sync via FHIR
   * - Google Fit: https://developers.google.com/fit
   * - Withings: https://developer.withings.com/
   * 
   * @param deviceId Device identifier
   * @param platform Device platform (fitbit, apple_health, etc.)
   * @returns Synced readings
   */
  async syncDeviceData(deviceId: string, platform: string = 'fitbit'): Promise<DeviceReading[]> {
    // TODO: Implement actual API calls
    // Example for Fitbit:
    // const response = await fetch(`https://api.fitbit.com/1/user/-/activities/heart/date/today/1d.json`, {
    //   headers: {
    //     'Authorization': `Bearer ${process.env.FITBIT_ACCESS_TOKEN}`
    //   }
    // });

    await new Promise(resolve => setTimeout(resolve, 500));

    // Mock synced data
    const mockReadings: DeviceReading[] = [
      {
        deviceId,
        deviceType: 'heart_rate',
        value: 72,
        unit: 'bpm',
        timestamp: new Date(Date.now() - 3600000), // 1 hour ago
        source: platform
      },
      {
        deviceId,
        deviceType: 'blood_pressure',
        value: { systolic: 120, diastolic: 80 },
        unit: 'mmHg',
        timestamp: new Date(Date.now() - 7200000), // 2 hours ago
        source: platform
      }
    ];

    console.log(`[IoT] Synced ${mockReadings.length} readings from ${platform}`);

    return mockReadings;
  }

  /**
   * Register new IoT device for patient
   * 
   * @param patientId Patient ID
   * @param deviceInfo Device information
   */
  async registerDevice(patientId: string, deviceInfo: {
    deviceId: string;
    deviceType: string;
    manufacturer: string;
    model: string;
    platform?: string;
  }): Promise<{
    registered: boolean;
    authorizationUrl?: string;
  }> {
    // TODO: Implement OAuth flow for device authorization
    // Different platforms have different OAuth flows

    console.log(`[IoT] Registered device ${deviceInfo.deviceId} for patient ${patientId}`);

    return {
      registered: true,
      authorizationUrl: `https://oauth.example.com/authorize?device=${deviceInfo.deviceId}`
    };
  }

  // Helper methods for data normalization

  private parseBloodPressure(value: any): { systolic: number; diastolic: number } {
    if (typeof value === 'object' && value.systolic && value.diastolic) {
      return value;
    }
    // Parse from string like "120/80"
    if (typeof value === 'string') {
      const [systolic, diastolic] = value.split('/').map(Number);
      return { systolic, diastolic };
    }
    return { systolic: 0, diastolic: 0 };
  }

  private normalizeGlucose(value: number, unit: string): number {
    // Convert mmol/L to mg/dL if needed
    if (unit.toLowerCase() === 'mmol/l') {
      return value * 18.0182; // Conversion factor
    }
    return value;
  }

  private normalizeWeight(value: number, unit: string): number {
    // Convert to kg if needed
    if (unit.toLowerCase() === 'lbs' || unit.toLowerCase() === 'lb') {
      return value * 0.453592;
    }
    return value;
  }

  private normalizeTemperature(value: number, unit: string): number {
    // Convert to Fahrenheit if needed
    if (unit.toLowerCase() === 'c' || unit.toLowerCase() === 'celsius') {
      return (value * 9/5) + 32;
    }
    return value;
  }
}

export const iotDeviceService = new IoTDeviceService();
