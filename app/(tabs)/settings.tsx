// app/settings.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch, ScrollView, Alert, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useBaguioQuest } from '@/hooks/use-baguio-quest';

const LOGO_URL =
  'https://firebasestorage.googleapis.com/v0/b/pinepoint-28ca9.firebasestorage.app/o/BaguioQuest%2Flogo%20no%20bg.png?alt=media&token=4591f271-579f-44ca-9d50-21e4165ad1cc';

export default function SettingsScreen() {
  const { settings, updateSettings, clearCache, exportData, isDarkMode, toggleDarkMode } = useBaguioQuest();
  const styles = createStyles(isDarkMode);

  const [codingEnabled, setCodingEnabled] = useState(settings.numberCodingEnabled);
  const [offlineMode, setOfflineMode] = useState(settings.offlineMode);
  const [notifications, setNotifications] = useState(settings.notifications);

  const handleCodingToggle = (v: boolean) => {
    setCodingEnabled(v);
    updateSettings({ numberCodingEnabled: v });
  };
  const handleOfflineToggle = (v: boolean) => {
    setOfflineMode(v);
    updateSettings({ offlineMode: v });
  };
  const handleNotificationsToggle = (v: boolean) => {
    setNotifications(v);
    updateSettings({ notifications: v });
  };

  const showCodingInfo = () => {
    Alert.alert(
      'Number Coding Information',
      'Default windows are based on current LGU regulations. Always follow official traffic signs and officers.',
      [{ text: 'OK' }]
    );
  };

  const handleClearCache = () => {
    Alert.alert('Clear Cache', 'Remove all cached data?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Clear',
        style: 'destructive',
        onPress: () => {
          clearCache();
          Alert.alert('Cache Cleared', 'All cached data has been removed.');
        },
      },
    ]);
  };

  const handleExportData = async () => {
    try {
      await exportData();
      Alert.alert('Export Complete', 'Your data has been exported successfully.');
    } catch {
      Alert.alert('Export Failed', 'Unable to export data. Please try again.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Image source={{ uri: LOGO_URL }} style={styles.logo} />
        <Text style={styles.headerTitle}>Settings</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Appearance */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Appearance</Text>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Ionicons name={isDarkMode ? 'moon' : 'sunny'} size={20} color="#6b7280" />
              <View style={styles.settingText}>
                <Text style={styles.settingTitle}>Dark Mode</Text>
                <Text style={styles.settingDescription}>Switch between light and dark themes</Text>
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

        {/* Navigation */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Navigation</Text>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Ionicons name="navigate-outline" size={20} color="#6b7280" />
              <View style={styles.settingText}>
                <Text style={styles.settingTitle}>Offline Mode</Text>
                <Text style={styles.settingDescription}>Use cached data when offline</Text>
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
              <Ionicons name="notifications-outline" size={20} color="#6b7280" />
              <View style={styles.settingText}>
                <Text style={styles.settingTitle}>Navigation Alerts</Text>
                <Text style={styles.settingDescription}>Traffic and road condition notifications</Text>
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
              <Ionicons name="information-circle-outline" size={20} color="#6b7280" />
            </TouchableOpacity>
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Ionicons name="time-outline" size={20} color="#6b7280" />
              <View style={styles.settingText}>
                <Text style={styles.settingTitle}>Enable Coding Alerts</Text>
                <Text style={styles.settingDescription}>Get warnings about coding restrictions</Text>
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
                ⚠️ Defaults only. Always check official LGU announcements.
              </Text>

              <View style={styles.codingSchedule}>
                {[
                  { day: 'Monday', plate: '1 & 2' },
                  { day: 'Tuesday', plate: '3 & 4' },
                  { day: 'Wednesday', plate: '5 & 6' },
                  { day: 'Thursday', plate: '7 & 8' },
                  { day: 'Friday', plate: '9 & 0' },
                ].map((d) => (
                  <View key={d.day} style={styles.codingDay}>
                    <Text style={styles.dayText}>{d.day}</Text>
                    <Text style={styles.timeText}>7:00 AM - 7:00 PM</Text>
                    <Text style={styles.plateText}>Ending in {d.plate}</Text>
                  </View>
                ))}
              </View>

              <TouchableOpacity style={styles.customizeButton}>
                <Text style={styles.customizeButtonText}>Customize Windows</Text>
                <Ionicons name="chevron-forward" size={16} color="#2563eb" />
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Data & Storage */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data & Storage</Text>

          <TouchableOpacity style={styles.actionItem} onPress={handleClearCache}>
            <Ionicons name="download-outline" size={20} color="#6b7280" />
            <View style={styles.actionText}>
              <Text style={styles.actionTitle}>Clear Cache</Text>
              <Text style={styles.actionDescription}>Remove downloaded data</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#6b7280" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionItem} onPress={handleExportData}>
            <Ionicons name="shield-checkmark-outline" size={20} color="#6b7280" />
            <View style={styles.actionText}>
              <Text style={styles.actionTitle}>Export Data</Text>
              <Text style={styles.actionDescription}>Backup saved places & settings</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#6b7280" />
          </TouchableOpacity>
        </View>

        {/* About */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>

          <View style={styles.aboutItem}>
            <Ionicons name="location-sharp" size={20} color="#2563eb" />
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
              Informational guidance only. Always follow official signs and officers. Conditions may change without notice.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (dark: boolean) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: dark ? '#000' : '#f8fafc' },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
      backgroundColor: dark ? '#000' : '#fff',
      borderBottomWidth: 1,
      borderBottomColor: dark ? '#1f1f1f' : '#e5e7eb',
    },
    logo: { width: 24, height: 24, marginRight: 8 },
    headerTitle: { fontSize: 20, fontWeight: '600', color: dark ? '#fff' : '#1f2937' },
    content: { flex: 1 },
    section: { backgroundColor: dark ? '#000' : '#fff', marginTop: 8, paddingVertical: 16 },
    sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 16,
      marginBottom: 12,
    },
    sectionTitle: { fontSize: 16, fontWeight: '600', color: dark ? '#fff' : '#1f2937', paddingHorizontal: 16, marginBottom: 12 },
    settingItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: dark ? '#1f1f1f' : '#f3f4f6',
    },
    settingInfo: { flexDirection: 'row', alignItems: 'center', flex: 1 },
    settingText: { marginLeft: 12, flex: 1 },
    settingTitle: { fontSize: 14, fontWeight: '500', color: dark ? '#fff' : '#1f2937' },
    settingDescription: { fontSize: 12, color: dark ? '#9ca3af' : '#6b7280', marginTop: 2 },
    codingDetails: { paddingHorizontal: 16, paddingTop: 16, backgroundColor: dark ? '#050505' : '#f8fafc' },
    codingTitle: { fontSize: 14, fontWeight: '600', color: dark ? '#fff' : '#1f2937', marginBottom: 8 },
    codingNote: { fontSize: 12, color: '#f59e0b', backgroundColor: '#fffbeb', padding: 8, borderRadius: 6, marginBottom: 16 },
    codingSchedule: { gap: 8, marginBottom: 16 },
    codingDay: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 8,
      paddingHorizontal: 12,
      backgroundColor: dark ? '#000' : '#fff',
      borderRadius: 6,
      borderWidth: 1,
      borderColor: dark ? '#1f1f1f' : '#e5e7eb',
    },
    dayText: { fontSize: 12, fontWeight: '500', color: dark ? '#fff' : '#1f2937', width: 70 },
    timeText: { fontSize: 12, color: dark ? '#9ca3af' : '#6b7280', flex: 1, textAlign: 'center' },
    plateText: { fontSize: 12, color: '#ef4444', fontWeight: '500' },
    customizeButton: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 12,
      paddingHorizontal: 16,
      backgroundColor: dark ? '#0b2a6f' : '#eff6ff',
      borderRadius: 8,
      marginBottom: 16,
    },
    customizeButtonText: { fontSize: 14, color: '#2563eb', fontWeight: '500' },
    actionItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: dark ? '#1f1f1f' : '#f3f4f6',
    },
    actionText: { marginLeft: 12, flex: 1 },
    actionTitle: { fontSize: 14, fontWeight: '500', color: dark ? '#fff' : '#1f2937' },
    actionDescription: { fontSize: 12, color: dark ? '#9ca3af' : '#6b7280', marginTop: 2 },
    aboutItem: { flexDirection: 'row', alignItems: 'flex-start', paddingHorizontal: 16, paddingVertical: 12 },
    aboutText: { marginLeft: 12, flex: 1 },
    aboutTitle: { fontSize: 16, fontWeight: '600', color: dark ? '#fff' : '#1f2937' },
    aboutVersion: { fontSize: 12, color: dark ? '#9ca3af' : '#6b7280', marginTop: 2 },
    aboutDescription: { fontSize: 12, color: dark ? '#9ca3af' : '#6b7280', marginTop: 8, lineHeight: 16 },
    disclaimer: { margin: 16, padding: 16, backgroundColor: '#fef2f2', borderRadius: 8, borderWidth: 1, borderColor: '#fecaca' },
    disclaimerTitle: { fontSize: 14, fontWeight: '600', color: '#dc2626', marginBottom: 8 },
    disclaimerText: { fontSize: 12, color: '#7f1d1d', lineHeight: 16 },
  });
