import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Rocket, Link2, Tag, Layers, Hash, Clock, Webhook } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { getDeviceId } from '@/utils/deviceId';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const DEFAULT_N8N_URL_KEY = 'default_n8n_url';

export default function NewCampaign() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    site: '',
    keywords: '',
    tier: 'Tier 1',
    count: '10',
    frequency: 'manual',
    n8n_url: '',
  });

  useState(() => {
    AsyncStorage.getItem(DEFAULT_N8N_URL_KEY).then((url) => {
      if (url) {
        setFormData((prev) => ({ ...prev, n8n_url: url }));
      }
    });
  });

  const triggerN8nWorkflow = async (campaignId: string) => {
    try {
      const response = await fetch(formData.n8n_url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          campaign_id: campaignId,
          site: formData.site,
          keywords: formData.keywords.split(',').map((k) => k.trim()),
          tier: formData.tier,
          count: parseInt(formData.count),
          frequency: formData.frequency,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to trigger n8n workflow');
      }

      await supabase
        .from('campaigns')
        .update({
          status: 'running',
          last_run: new Date().toISOString(),
        })
        .eq('id', campaignId);

      return true;
    } catch (error) {
      console.error('Error triggering n8n:', error);
      await supabase
        .from('campaigns')
        .update({ status: 'failed' })
        .eq('id', campaignId);
      return false;
    }
  };

  const handleSubmit = async () => {
    if (!formData.site || !formData.keywords || !formData.n8n_url) {
      Alert.alert('Missing Fields', 'Please fill in all required fields');
      return;
    }

    if (!formData.site.startsWith('http')) {
      Alert.alert('Invalid URL', 'Website URL must start with http:// or https://');
      return;
    }

    setLoading(true);

    try {
      const deviceId = await getDeviceId();
      const keywordsArray = formData.keywords.split(',').map((k) => k.trim());

      const { data, error } = await supabase
        .from('campaigns')
        .insert({
          site: formData.site,
          keywords: keywordsArray,
          tier: formData.tier,
          count: parseInt(formData.count),
          frequency: formData.frequency,
          n8n_url: formData.n8n_url,
          device_id: deviceId,
          status: 'pending',
        })
        .select()
        .single();

      if (error) throw error;

      const success = await triggerN8nWorkflow(data.id);

      if (success) {
        setFormData({
          site: '',
          keywords: '',
          tier: 'Tier 1',
          count: '10',
          frequency: 'manual',
          n8n_url: formData.n8n_url,
        });

        Alert.alert(
          'Campaign Started',
          'Your backlink campaign has been created and is now running!',
          [
            {
              text: 'View Campaigns',
              onPress: () => router.push('/(tabs)'),
            },
          ]
        );
      } else {
        Alert.alert(
          'Workflow Error',
          'Campaign created but failed to trigger n8n workflow. Please check your webhook URL.'
        );
      }
    } catch (error) {
      console.error('Error creating campaign:', error);
      Alert.alert('Error', 'Failed to create campaign. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0a0a0a', '#000000']}
        style={styles.background}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Text style={styles.title}>New Campaign</Text>
            <Text style={styles.subtitle}>
              Create a new backlink automation campaign
            </Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <View style={styles.labelContainer}>
                <Link2 size={16} color="#00ffcc" />
                <Text style={styles.label}>Website URL</Text>
              </View>
              <TextInput
                style={styles.input}
                placeholder="https://example.com"
                placeholderTextColor="#444"
                value={formData.site}
                onChangeText={(text) =>
                  setFormData({ ...formData, site: text })
                }
                autoCapitalize="none"
                keyboardType="url"
              />
            </View>

            <View style={styles.inputGroup}>
              <View style={styles.labelContainer}>
                <Tag size={16} color="#00ffcc" />
                <Text style={styles.label}>Keywords (comma-separated)</Text>
              </View>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="seo automation, ai backlinks, link building"
                placeholderTextColor="#444"
                value={formData.keywords}
                onChangeText={(text) =>
                  setFormData({ ...formData, keywords: text })
                }
                multiline
                numberOfLines={3}
              />
            </View>

            <View style={styles.inputGroup}>
              <View style={styles.labelContainer}>
                <Layers size={16} color="#00ffcc" />
                <Text style={styles.label}>Backlink Tier</Text>
              </View>
              <View style={styles.tierContainer}>
                <TouchableOpacity
                  style={[
                    styles.tierButton,
                    formData.tier === 'Tier 1' && styles.tierButtonActive,
                  ]}
                  onPress={() => setFormData({ ...formData, tier: 'Tier 1' })}>
                  <Text
                    style={[
                      styles.tierText,
                      formData.tier === 'Tier 1' && styles.tierTextActive,
                    ]}>
                    Tier 1
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.tierButton,
                    formData.tier === 'Tier 2' && styles.tierButtonActive,
                  ]}
                  onPress={() => setFormData({ ...formData, tier: 'Tier 2' })}>
                  <Text
                    style={[
                      styles.tierText,
                      formData.tier === 'Tier 2' && styles.tierTextActive,
                    ]}>
                    Tier 2
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <View style={styles.labelContainer}>
                <Hash size={16} color="#00ffcc" />
                <Text style={styles.label}>Number of Backlinks</Text>
              </View>
              <TextInput
                style={styles.input}
                placeholder="10"
                placeholderTextColor="#444"
                value={formData.count}
                onChangeText={(text) =>
                  setFormData({ ...formData, count: text })
                }
                keyboardType="number-pad"
              />
            </View>

            <View style={styles.inputGroup}>
              <View style={styles.labelContainer}>
                <Clock size={16} color="#00ffcc" />
                <Text style={styles.label}>Frequency</Text>
              </View>
              <View style={styles.frequencyContainer}>
                {['manual', 'daily', 'weekly'].map((freq) => (
                  <TouchableOpacity
                    key={freq}
                    style={[
                      styles.frequencyButton,
                      formData.frequency === freq &&
                        styles.frequencyButtonActive,
                    ]}
                    onPress={() =>
                      setFormData({ ...formData, frequency: freq })
                    }>
                    <Text
                      style={[
                        styles.frequencyText,
                        formData.frequency === freq &&
                          styles.frequencyTextActive,
                      ]}>
                      {freq.charAt(0).toUpperCase() + freq.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <View style={styles.labelContainer}>
                <Webhook size={16} color="#00ffcc" />
                <Text style={styles.label}>n8n Webhook URL</Text>
              </View>
              <TextInput
                style={styles.input}
                placeholder="https://your-n8n-instance.com/webhook/..."
                placeholderTextColor="#444"
                value={formData.n8n_url}
                onChangeText={(text) =>
                  setFormData({ ...formData, n8n_url: text })
                }
                autoCapitalize="none"
                keyboardType="url"
              />
            </View>

            <TouchableOpacity
              style={[styles.submitButton, loading && styles.submitButtonDisabled]}
              onPress={handleSubmit}
              disabled={loading}>
              <LinearGradient
                colors={['#00ffcc', '#00cc99']}
                style={styles.submitGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}>
                {loading ? (
                  <ActivityIndicator color="#000" />
                ) : (
                  <>
                    <Rocket size={20} color="#000" />
                    <Text style={styles.submitText}>Start Campaign</Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
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
  form: {
    paddingHorizontal: 20,
  },
  inputGroup: {
    marginBottom: 24,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  input: {
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#2a2a2a',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#fff',
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  tierContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  tierButton: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#2a2a2a',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  tierButtonActive: {
    backgroundColor: 'rgba(0, 255, 204, 0.1)',
    borderColor: '#00ffcc',
  },
  tierText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  tierTextActive: {
    color: '#00ffcc',
  },
  frequencyContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  frequencyButton: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#2a2a2a',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  frequencyButtonActive: {
    backgroundColor: 'rgba(0, 255, 204, 0.1)',
    borderColor: '#00ffcc',
  },
  frequencyText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  frequencyTextActive: {
    color: '#00ffcc',
  },
  submitButton: {
    marginTop: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 18,
  },
  submitText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
  },
});
