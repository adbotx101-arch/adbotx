import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Share,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Webhook,
  Save,
  Download,
  Trash2,
  Info,
  Share2,
} from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '@/lib/supabase';
import { getDeviceId } from '@/utils/deviceId';

const DEFAULT_N8N_URL_KEY = 'default_n8n_url';

export default function Settings() {
  const [defaultN8nUrl, setDefaultN8nUrl] = useState('');
  const [deviceId, setDeviceId] = useState('');
  const [campaignCount, setCampaignCount] = useState(0);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const url = await AsyncStorage.getItem(DEFAULT_N8N_URL_KEY);
    if (url) setDefaultN8nUrl(url);

    const id = await getDeviceId();
    setDeviceId(id);

    const { count } = await supabase
      .from('campaigns')
      .select('*', { count: 'exact', head: true })
      .eq('device_id', id);

    setCampaignCount(count || 0);
  };

  const saveDefaultUrl = async () => {
    try {
      await AsyncStorage.setItem(DEFAULT_N8N_URL_KEY, defaultN8nUrl);
      Alert.alert('Saved', 'Default n8n webhook URL has been saved');
    } catch (error) {
      Alert.alert('Error', 'Failed to save settings');
    }
  };

  const exportData = async () => {
    try {
      const id = await getDeviceId();
      const { data, error } = await supabase
        .from('campaigns')
        .select('*')
        .eq('device_id', id);

      if (error) throw error;

      const jsonData = JSON.stringify(data, null, 2);

      if (Share.share) {
        await Share.share({
          message: jsonData,
          title: 'AdBotX Campaign Data',
        });
      } else {
        Alert.alert(
          'Export Data',
          'Copy the data below:',
          [{ text: 'OK' }]
        );
        console.log(jsonData);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to export data');
    }
  };

  const resetApp = () => {
    Alert.alert(
      'Reset App',
      'This will delete all your campaigns and settings. This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            try {
              const id = await getDeviceId();
              await supabase
                .from('campaigns')
                .delete()
                .eq('device_id', id);

              await AsyncStorage.removeItem(DEFAULT_N8N_URL_KEY);

              setDefaultN8nUrl('');
              setCampaignCount(0);

              Alert.alert('Success', 'App has been reset');
            } catch (error) {
              Alert.alert('Error', 'Failed to reset app');
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0a0a0a', '#000000']}
        style={styles.background}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <Text style={styles.title}>Settings</Text>
            <Text style={styles.subtitle}>Manage your app preferences</Text>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Webhook size={20} color="#00ffcc" />
              <Text style={styles.sectionTitle}>Default Webhook</Text>
            </View>
            <Text style={styles.sectionDescription}>
              Set a default n8n webhook URL to use for all campaigns
            </Text>
            <TextInput
              style={styles.input}
              placeholder="https://your-n8n-instance.com/webhook/..."
              placeholderTextColor="#444"
              value={defaultN8nUrl}
              onChangeText={setDefaultN8nUrl}
              autoCapitalize="none"
              keyboardType="url"
            />
            <TouchableOpacity style={styles.button} onPress={saveDefaultUrl}>
              <LinearGradient
                colors={['#00ffcc', '#00cc99']}
                style={styles.buttonGradient}>
                <Save size={18} color="#000" />
                <Text style={styles.buttonText}>Save Default URL</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Info size={20} color="#00ffcc" />
              <Text style={styles.sectionTitle}>App Information</Text>
            </View>
            <View style={styles.infoCard}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Device ID</Text>
                <Text style={styles.infoValue} numberOfLines={1}>
                  {deviceId.substring(0, 20)}...
                </Text>
              </View>
              <View style={styles.infoDivider} />
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Total Campaigns</Text>
                <Text style={styles.infoValue}>{campaignCount}</Text>
              </View>
              <View style={styles.infoDivider} />
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Version</Text>
                <Text style={styles.infoValue}>1.0.0</Text>
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Download size={20} color="#00ffcc" />
              <Text style={styles.sectionTitle}>Data Management</Text>
            </View>
            <TouchableOpacity
              style={styles.outlineButton}
              onPress={exportData}>
              <Share2 size={18} color="#00ffcc" />
              <Text style={styles.outlineButtonText}>Export Campaign Data</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.section}>
            <TouchableOpacity
              style={styles.dangerButton}
              onPress={resetApp}>
              <Trash2 size={18} color="#ef4444" />
              <Text style={styles.dangerButtonText}>Reset App</Text>
            </TouchableOpacity>
            <Text style={styles.dangerText}>
              This will permanently delete all your campaigns and settings
            </Text>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>AdBotX</Text>
            <Text style={styles.footerSubtext}>
              Smart SEO & Backlink Automation
            </Text>
          </View>
        </ScrollView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#00ffcc',
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  sectionDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
    lineHeight: 20,
  },
  input: {
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#2a2a2a',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#fff',
    marginBottom: 12,
  },
  button: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 16,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
  },
  outlineButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(0, 255, 204, 0.1)',
    borderWidth: 1,
    borderColor: '#00ffcc',
    borderRadius: 12,
    padding: 16,
  },
  outlineButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#00ffcc',
  },
  dangerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: '#ef4444',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  dangerButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ef4444',
  },
  dangerText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    lineHeight: 18,
  },
  infoCard: {
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#2a2a2a',
    borderRadius: 12,
    padding: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: '#888',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    maxWidth: 200,
  },
  infoDivider: {
    height: 1,
    backgroundColor: '#2a2a2a',
  },
  footer: {
    alignItems: 'center',
    paddingTop: 32,
    paddingBottom: 16,
  },
  footerText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#00ffcc',
    letterSpacing: 1,
  },
  footerSubtext: {
    fontSize: 12,
    color: '#444',
    marginTop: 4,
  },
});
