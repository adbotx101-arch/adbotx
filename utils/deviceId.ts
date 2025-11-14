import { Platform } from 'react-native';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

const DEVICE_ID_KEY = 'adbotx_device_id';

export async function getDeviceId(): Promise<string> {
  // Try to get existing device ID from storage
  let deviceId = await AsyncStorage.getItem(DEVICE_ID_KEY);

  if (!deviceId) {
    // Generate a unique device ID based on platform
    if (Platform.OS === 'web') {
      // For web, use a combination of timestamp and random string
      deviceId = `web_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    } else {
      // For mobile, use expo constants or generate one
      deviceId = Constants.sessionId || `mobile_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    }

    // Store it for future use
    await AsyncStorage.setItem(DEVICE_ID_KEY, deviceId);
  }

  return deviceId;
}
