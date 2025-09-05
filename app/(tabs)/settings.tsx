import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  Settings as SettingsIcon,
  Clock,
  Info,
  Shield,
  Download,
  Bell,
  Navigation,
  MapPin,
  ChevronRight,
  Moon,
  Sun,
} from 'lucide-react-native';
import { useBaguioQuest } from '@/hooks/use-baguio-quest';

export default function SettingsScreen() {
  const { 
    settings, 
    updateSettings,
    clearCache,
    exportData,
    isDarkMode,
    toggleDarkMode,
  } = useBaguioQuest();

  const [codingEnabled, setCodingEnabled] = useState(settings.numberCodingEnabled);
  const [offlineMode, setOfflineMode] = useState(settings.offlineMode);
  const [notifications, setNotifications] = useState(settings.notifications);

  const handleCodingToggle = (value: boolean) => {
    setCodingEnabled(value);
    updateSettings({ numberCodingEnabled: value });
  };

  const handleOfflineToggle = (value: boolean) => {
    setOfflineMode(value);
    updateSettings({ offlineMode: value });
  };

  const handleNotificationsToggle = (value: boolean) => {
    setNotifications(value);
    updateSettings({ notifications: value });
  };

  const showCodingInfo = () => {
    Alert.alert(
      'Number Coding Information',
      'Default coding windows are based on current LGU regulations. You can override these settings if needed, but always follow official traffic signs and officers.\n\nCoding windows may change - check official announcements regularly.',
      [{ text: 'OK' }]
    );
  };

  const handleClearCache = () => {
    Alert.alert(
      'Clear Cache',
      'This will remove all cached map data and require re-downloading. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Clear', 
          style: 'destructive',
          onPress: () => {
            clearCache();
            Alert.alert('Cache Cleared', 'All cached data has been removed.');
          }
        },
      ]
    );
  };

  const handleExportData = async () => {
    try {
      await exportData();
      Alert.alert('Export Complete', 'Your data has been exported successfully.');
    } catch (error) {
      Alert.alert('Export Failed', 'Unable to export data. Please try again.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <SettingsIcon size={24} color="#2563eb" />
        <Text style={styles.headerTitle}>Settings</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Appearance Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Appearance</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              {isDarkMode ? (
                <Moon size={20} color="#6b7280" />
              ) : (
                <Sun size={20} color="#6b7280" />
              )}
              <View style={styles.settingText}>
                <Text style={styles.settingTitle}>Dark Mode</Text>
                <Text style={styles.settingDescription}>
                  Switch between light and dark themes
                </Text>
              </View>
            </View>
            <Switch
              value={isDarkMode}
              onValueChange={toggleDarkMode}
              trackColor={{ false: '#e5e7eb', true: '#93c5fd' }}
              thumbColor={isDarkMode ? '#2563eb' : '#f3f4f6'}
            />
          </View>
        </View>

        {/* Navigation Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Navigation</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Navigation size={20} color="#6b7280" />
              <View style={styles.settingText}>
                <Text style={styles.settingTitle}>Offline Mode</Text>
                <Text style={styles.settingDescription}>
                  Use cached maps when no internet connection
                </Text>
              </View>
            </View>
            <Switch
              value={offlineMode}
              onValueChange={handleOfflineToggle}
              trackColor={{ false: '#e5e7eb', true: '#93c5fd' }}
              thumbColor={offlineMode ? '#2563eb' : '#f3f4f6'}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Bell size={20} color="#6b7280" />
              <View style={styles.settingText}>
                <Text style={styles.settingTitle}>Navigation Alerts</Text>
                <Text style={styles.settingDescription}>
                  Get notified about traffic and road conditions
                </Text>
              </View>
            </View>
            <Switch
              value={notifications}
              onValueChange={handleNotificationsToggle}
              trackColor={{ false: '#e5e7eb', true: '#93c5fd' }}
              thumbColor={notifications ? '#2563eb' : '#f3f4f6'}
            />
          </View>
        </View>

        {/* Number Coding */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Number Coding</Text>
            <TouchableOpacity onPress={showCodingInfo}>
              <Info size={20} color="#6b7280" />
            </TouchableOpacity>
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Clock size={20} color="#6b7280" />
              <View style={styles.settingText}>
                <Text style={styles.settingTitle}>Enable Coding Alerts</Text>
                <Text style={styles.settingDescription}>
                  Get warnings about number coding restrictions
                </Text>
              </View>
            </View>
            <Switch
              value={codingEnabled}
              onValueChange={handleCodingToggle}
              trackColor={{ false: '#e5e7eb', true: '#93c5fd' }}
              thumbColor={codingEnabled ? '#2563eb' : '#f3f4f6'}
            />
          </View>

          {codingEnabled && (
            <View style={styles.codingDetails}>
              <Text style={styles.codingTitle}>Default Coding Windows</Text>
              <Text style={styles.codingNote}>
                ⚠️ These are default windows. Always check official LGU announcements for current regulations.
              </Text>
              
              <View style={styles.codingSchedule}>
                <View style={styles.codingDay}>
                  <Text style={styles.dayText}>Monday</Text>
                  <Text style={styles.timeText}>7:00 AM - 7:00 PM</Text>
                  <Text style={styles.plateText}>Ending in 1 & 2</Text>
                </View>
                <View style={styles.codingDay}>
                  <Text style={styles.dayText}>Tuesday</Text>
                  <Text style={styles.timeText}>7:00 AM - 7:00 PM</Text>
                  <Text style={styles.plateText}>Ending in 3 & 4</Text>
                </View>
                <View style={styles.codingDay}>
                  <Text style={styles.dayText}>Wednesday</Text>
                  <Text style={styles.timeText}>7:00 AM - 7:00 PM</Text>
                  <Text style={styles.plateText}>Ending in 5 & 6</Text>
                </View>
                <View style={styles.codingDay}>
                  <Text style={styles.dayText}>Thursday</Text>
                  <Text style={styles.timeText}>7:00 AM - 7:00 PM</Text>
                  <Text style={styles.plateText}>Ending in 7 & 8</Text>
                </View>
                <View style={styles.codingDay}>
                  <Text style={styles.dayText}>Friday</Text>
                  <Text style={styles.timeText}>7:00 AM - 7:00 PM</Text>
                  <Text style={styles.plateText}>Ending in 9 & 0</Text>
                </View>
              </View>

              <TouchableOpacity style={styles.customizeButton}>
                <Text style={styles.customizeButtonText}>Customize Windows</Text>
                <ChevronRight size={16} color="#2563eb" />
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Data & Storage */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data & Storage</Text>
          
          <TouchableOpacity style={styles.actionItem} onPress={handleClearCache}>
            <Download size={20} color="#6b7280" />
            <View style={styles.actionText}>
              <Text style={styles.actionTitle}>Clear Cache</Text>
              <Text style={styles.actionDescription}>
                Remove downloaded maps and cached data
              </Text>
            </View>
            <ChevronRight size={16} color="#6b7280" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionItem} onPress={handleExportData}>
            <Shield size={20} color="#6b7280" />
            <View style={styles.actionText}>
              <Text style={styles.actionTitle}>Export Data</Text>
              <Text style={styles.actionDescription}>
                Backup your saved places and settings
              </Text>
            </View>
            <ChevronRight size={16} color="#6b7280" />
          </TouchableOpacity>
        </View>

        {/* About */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          
          <View style={styles.aboutItem}>
            <MapPin size={20} color="#2563eb" />
            <View style={styles.aboutText}>
              <Text style={styles.aboutTitle}>BaguioQuest</Text>
              <Text style={styles.aboutVersion}>Version 1.0.0</Text>
              <Text style={styles.aboutDescription}>
                Navigate Baguio City with confidence. Main roads first, local rules explained.
              </Text>
            </View>
          </View>

          <View style={styles.disclaimer}>
            <Text style={styles.disclaimerTitle}>⚠️ Important Disclaimer</Text>
            <Text style={styles.disclaimerText}>
              BaguioQuest provides informational guidance only. Always follow official traffic signs, 
              signals, and law enforcement officers. Traffic rules and road conditions may change 
              without notice. Drive safely and responsibly.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1f2937',
    marginLeft: 12,
  },
  content: {
    flex: 1,
  },
  section: {
    backgroundColor: '#ffffff',
    marginTop: 8,
    paddingVertical: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingText: {
    marginLeft: 12,
    flex: 1,
  },
  settingTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1f2937',
  },
  settingDescription: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  codingDetails: {
    paddingHorizontal: 16,
    paddingTop: 16,
    backgroundColor: '#f8fafc',
  },
  codingTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  codingNote: {
    fontSize: 12,
    color: '#f59e0b',
    backgroundColor: '#fffbeb',
    padding: 8,
    borderRadius: 6,
    marginBottom: 16,
  },
  codingSchedule: {
    gap: 8,
    marginBottom: 16,
  },
  codingDay: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#ffffff',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  dayText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#1f2937',
    width: 70,
  },
  timeText: {
    fontSize: 12,
    color: '#6b7280',
    flex: 1,
    textAlign: 'center',
  },
  plateText: {
    fontSize: 12,
    color: '#ef4444',
    fontWeight: '500',
  },
  customizeButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#eff6ff',
    borderRadius: 8,
    marginBottom: 16,
  },
  customizeButtonText: {
    fontSize: 14,
    color: '#2563eb',
    fontWeight: '500',
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  actionText: {
    marginLeft: 12,
    flex: 1,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1f2937',
  },
  actionDescription: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  aboutItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  aboutText: {
    marginLeft: 12,
    flex: 1,
  },
  aboutTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  aboutVersion: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  aboutDescription: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 8,
    lineHeight: 16,
  },
  disclaimer: {
    margin: 16,
    padding: 16,
    backgroundColor: '#fef2f2',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  disclaimerTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#dc2626',
    marginBottom: 8,
  },
  disclaimerText: {
    fontSize: 12,
    color: '#7f1d1d',
    lineHeight: 16,
  },
});