import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { ExternalLink, TrendingUp, CheckCircle, AlertCircle } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { getDeviceId } from '@/utils/deviceId';
import { Campaign } from '@/types/database';

export default function CampaignDashboard() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadCampaigns = async () => {
    try {
      const deviceId = await getDeviceId();
      const { data, error } = await supabase
        .from('campaigns')
        .select('*')
        .eq('device_id', deviceId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCampaigns(data || []);
    } catch (error) {
      console.error('Error loading campaigns:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadCampaigns();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadCampaigns();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return '#00ffcc';
      case 'running':
        return '#3b82f6';
      case 'failed':
        return '#ef4444';
      default:
        return '#666';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return CheckCircle;
      case 'running':
        return TrendingUp;
      case 'failed':
        return AlertCircle;
      default:
        return ExternalLink;
    }
  };

  const renderCampaign = ({ item }: { item: Campaign }) => {
    const StatusIcon = getStatusIcon(item.status);
    const statusColor = getStatusColor(item.status);

    return (
      <View style={styles.campaignCard}>
        <LinearGradient
          colors={['#1a1a1a', '#0f0f0f']}
          style={styles.cardGradient}>
          <View style={styles.cardHeader}>
            <View style={styles.statusBadge}>
              <StatusIcon size={14} color={statusColor} />
              <Text style={[styles.statusText, { color: statusColor }]}>
                {item.status.toUpperCase()}
              </Text>
            </View>
            <Text style={styles.tierBadge}>{item.tier}</Text>
          </View>

          <Text style={styles.siteUrl} numberOfLines={1}>
            {item.site}
          </Text>

          <View style={styles.keywordContainer}>
            {item.keywords.slice(0, 3).map((keyword, index) => (
              <View key={index} style={styles.keywordBadge}>
                <Text style={styles.keywordText} numberOfLines={1}>
                  {keyword}
                </Text>
              </View>
            ))}
            {item.keywords.length > 3 && (
              <Text style={styles.moreKeywords}>
                +{item.keywords.length - 3}
              </Text>
            )}
          </View>

          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{item.backlinks_created}</Text>
              <Text style={styles.statLabel}>Created</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{item.verified_links}</Text>
              <Text style={styles.statLabel}>Verified</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{item.index_status}</Text>
              <Text style={styles.statLabel}>Indexed</Text>
            </View>
          </View>

          <View style={styles.cardFooter}>
            <Text style={styles.targetText}>Target: {item.count} links</Text>
            <Text style={styles.frequencyText}>{item.frequency}</Text>
          </View>
        </LinearGradient>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#00ffcc" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0a0a0a', '#000000']}
        style={styles.background}>
        <View style={styles.header}>
          <Text style={styles.title}>AdBotX</Text>
          <Text style={styles.subtitle}>Smart SEO & Backlink Automation</Text>
        </View>

        {campaigns.length === 0 ? (
          <View style={styles.emptyState}>
            <ExternalLink size={64} color="#333" />
            <Text style={styles.emptyTitle}>No Campaigns Yet</Text>
            <Text style={styles.emptyText}>
              Tap "New Campaign" to create your first backlink automation
            </Text>
          </View>
        ) : (
          <FlatList
            data={campaigns}
            renderItem={renderCampaign}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor="#00ffcc"
              />
            }
          />
        )}
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
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0a0a0a',
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
  listContent: {
    padding: 16,
  },
  campaignCard: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  cardGradient: {
    padding: 16,
    borderWidth: 1,
    borderColor: '#1a1a1a',
    borderRadius: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#0a0a0a',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  tierBadge: {
    fontSize: 11,
    fontWeight: '600',
    color: '#00ffcc',
    backgroundColor: 'rgba(0, 255, 204, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    overflow: 'hidden',
  },
  siteUrl: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 12,
  },
  keywordContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  keywordBadge: {
    backgroundColor: '#1a1a1a',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    maxWidth: 120,
  },
  keywordText: {
    fontSize: 12,
    color: '#888',
  },
  moreKeywords: {
    fontSize: 12,
    color: '#666',
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#0a0a0a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#00ffcc',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    color: '#666',
    textTransform: 'uppercase',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#1a1a1a',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  targetText: {
    fontSize: 12,
    color: '#888',
  },
  frequencyText: {
    fontSize: 12,
    color: '#666',
    textTransform: 'capitalize',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    marginTop: 24,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
});
