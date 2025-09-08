// app/terms.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { useBaguioQuest } from '@/hooks/use-baguio-quest';

export default function TermsScreen() {
  const { acceptTerms, isDarkMode } = useBaguioQuest();
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);
  const canContinue = acceptedTerms && acceptedPrivacy;
  const styles = createStyles(isDarkMode);

  const handleContinue = async () => {
    if (!canContinue) return;
    await acceptTerms();
    router.replace('/(tabs)/map');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="shield-checkmark" size={32} color="#2563eb" />
        <Text style={styles.headerTitle}>Terms & Privacy</Text>
        <Text style={styles.headerSubtitle}>Please review and accept our terms to continue</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="document-text-outline" size={24} color="#2563eb" />
            <Text style={styles.sectionTitle}>Terms of Service</Text>
          </View>

          <View style={styles.termsContent}>
            <Text style={styles.termsText}>
              <Text style={styles.bold}>1. Acceptance of Terms{'\n'}</Text>
              By using BaguioQuest, you agree to these terms. This app provides navigation guidance for informational purposes only.
            </Text>

            <Text style={styles.termsText}>
              <Text style={styles.bold}>2. Navigation Disclaimer{'\n'}</Text>
              Always follow official traffic signs and officers. Road conditions and traffic rules may change without notice.
            </Text>

            <Text style={styles.termsText}>
              <Text style={styles.bold}>3. Number Coding Information{'\n'}</Text>
              Schedules are for reference and may not reflect current regulations. Verify with LGU announcements.
            </Text>

            <Text style={styles.termsText}>
              <Text style={styles.bold}>4. User Responsibility{'\n'}</Text>
              Do not use the app while driving. Use hands-free or pull over safely.
            </Text>

            <Text style={styles.termsText}>
              <Text style={styles.bold}>5. Limitation of Liability{'\n'}</Text>
              The developers are not liable for any damages or violations resulting from app usage.
            </Text>
          </View>

          <View style={styles.acceptanceRow}>
            <Switch value={acceptedTerms} onValueChange={setAcceptedTerms} trackColor={{ false: '#e5e7eb', true: '#93c5fd' }} thumbColor={acceptedTerms ? '#2563eb' : '#f3f4f6'} />
            <Text style={styles.acceptanceText}>I accept the Terms of Service</Text>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="lock-closed-outline" size={24} color="#10b981" />
            <Text style={styles.sectionTitle}>Privacy Policy</Text>
          </View>

          <View style={styles.termsContent}>
            <Text style={styles.termsText}>
              <Text style={styles.bold}>1. Information We Collect{'\n'}</Text>
              • Location data for navigation{'\n'}• App usage analytics{'\n'}• Saved places and preferences (local)
            </Text>

            <Text style={styles.termsText}>
              <Text style={styles.bold}>2. How We Use Your Information{'\n'}</Text>
              • Navigation and nearby POIs{'\n'}• Improve routes and functionality
            </Text>

            <Text style={styles.termsText}>
              <Text style={styles.bold}>3. Data Storage{'\n'}</Text>
              Mostly stored locally. Location is transmitted only when requesting routes/searches.
            </Text>

            <Text style={styles.termsText}>
              <Text style={styles.bold}>4. Data Sharing{'\n'}</Text>
              We do not sell/share personal data. Anonymous usage may be collected to improve the app.
            </Text>

            <Text style={styles.termsText}>
              <Text style={styles.bold}>5. Your Rights{'\n'}</Text>
              You can clear data in settings. Permissions can be revoked in device settings.
            </Text>
          </View>

          <View style={styles.acceptanceRow}>
            <Switch value={acceptedPrivacy} onValueChange={setAcceptedPrivacy} trackColor={{ false: '#e5e7eb', true: '#93c5fd' }} thumbColor={acceptedPrivacy ? '#10b981' : '#f3f4f6'} />
            <Text style={styles.acceptanceText}>I accept the Privacy Policy</Text>
          </View>
        </View>

        <View style={styles.noticeSection}>
          <Text style={styles.noticeTitle}>⚠️ Important Safety Notice</Text>
          <Text style={styles.noticeText}>
            This app is a navigation aid. Always follow road laws and officials. When in doubt, follow official signs.
          </Text>
        </View>
      </ScrollView>

      <View style={styles.bottomSection}>
        <TouchableOpacity
          style={[styles.continueButton, canContinue ? styles.continueButtonEnabled : styles.continueButtonDisabled]}
          onPress={handleContinue}
          disabled={!canContinue}
        >
          <Ionicons name={canContinue ? 'checkmark-circle' : 'arrow-forward'} size={20} color={canContinue ? '#fff' : '#9ca3af'} />
          <Text style={[styles.continueButtonText, canContinue ? styles.continueButtonTextEnabled : styles.continueButtonTextDisabled]}>
            {canContinue ? 'Accept & Continue' : 'Please Accept Both Terms'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const createStyles = (dark: boolean) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: dark ? '#000' : '#f8fafc' },
    header: { alignItems: 'center', padding: 24, backgroundColor: dark ? '#000' : '#ffffff', borderBottomWidth: 1, borderBottomColor: dark ? '#1f1f1f' : '#e5e7eb' },
    headerTitle: { fontSize: 24, fontWeight: 'bold', color: dark ? '#fff' : '#1f2937', marginTop: 12, marginBottom: 8 },
    headerSubtitle: { fontSize: 16, color: dark ? '#9ca3af' : '#6b7280', textAlign: 'center' },
    content: { flex: 1 },
    section: { backgroundColor: dark ? '#000' : '#ffffff', margin: 16, borderRadius: 12, padding: 20, borderWidth: 1, borderColor: dark ? '#1f1f1f' : 'rgba(0,0,0,0.05)' },
    sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
    sectionTitle: { fontSize: 20, fontWeight: '600', color: dark ? '#fff' : '#1f2937', marginLeft: 12 },
    termsContent: { marginBottom: 20 },
    termsText: { fontSize: 14, color: dark ? '#d1d5db' : '#374151', lineHeight: 20, marginBottom: 16 },
    bold: { fontWeight: '600', color: dark ? '#fff' : '#1f2937' },
    acceptanceRow: { flexDirection: 'row', alignItems: 'center', paddingTop: 16, borderTopWidth: 1, borderTopColor: dark ? '#1f1f1f' : '#f3f4f6' },
    acceptanceText: { fontSize: 14, color: dark ? '#d1d5db' : '#374151', marginLeft: 12, flex: 1, fontWeight: '500' },
    noticeSection: { backgroundColor: '#fef2f2', margin: 16, borderRadius: 12, padding: 20, borderWidth: 1, borderColor: '#fecaca' },
    noticeTitle: { fontSize: 16, fontWeight: '600', color: '#dc2626', marginBottom: 12 },
    noticeText: { fontSize: 14, color: '#7f1d1d', lineHeight: 20 },
    bottomSection: { backgroundColor: dark ? '#000' : '#ffffff', padding: 20, borderTopWidth: 1, borderTopColor: dark ? '#1f1f1f' : '#e5e7eb' },
    continueButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16, borderRadius: 12, gap: 8 },
    continueButtonEnabled: { backgroundColor: '#2563eb' },
    continueButtonDisabled: { backgroundColor: dark ? '#0a0a0a' : '#f3f4f6' },
    continueButtonText: { fontSize: 16, fontWeight: '600' },
    continueButtonTextEnabled: { color: '#ffffff' },
    continueButtonTextDisabled: { color: '#9ca3af' },
  });
