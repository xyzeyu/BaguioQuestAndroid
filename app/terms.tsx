import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Shield, FileText, CheckCircle, ArrowRight } from 'lucide-react-native';
import { router } from 'expo-router';
import { useBaguioQuest } from '@/hooks/use-baguio-quest';

export default function TermsScreen() {
  const { acceptTerms } = useBaguioQuest();
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);

  const canContinue = acceptedTerms && acceptedPrivacy;

  const handleContinue = async () => {
    if (canContinue) {
      await acceptTerms();
      router.replace('/(tabs)/map');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Shield size={32} color="#2563eb" />
        <Text style={styles.headerTitle}>Terms & Privacy</Text>
        <Text style={styles.headerSubtitle}>
          Please review and accept our terms to continue
        </Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Terms of Service */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <FileText size={24} color="#2563eb" />
            <Text style={styles.sectionTitle}>Terms of Service</Text>
          </View>

          <View style={styles.termsContent}>
            <Text style={styles.termsText}>
              <Text style={styles.bold}>1. Acceptance of Terms{'\n'}</Text>
              By using BaguioQuest, you agree to these terms and conditions. This app provides navigation guidance for informational purposes only.
            </Text>

            <Text style={styles.termsText}>
              <Text style={styles.bold}>2. Navigation Disclaimer{'\n'}</Text>
              BaguioQuest provides route suggestions and traffic information as guidance only. Always follow official traffic signs, signals, and law enforcement officers. Road conditions and traffic rules may change without notice.
            </Text>

            <Text style={styles.termsText}>
              <Text style={styles.bold}>3. Number Coding Information{'\n'}</Text>
              Number coding schedules are provided for reference and may not reflect current regulations. Always verify with official LGU announcements and comply with current traffic ordinances.
            </Text>

            <Text style={styles.termsText}>
              <Text style={styles.bold}>4. User Responsibility{'\n'}</Text>
              You are responsible for safe driving practices. Do not use the app while driving. Pull over safely to interact with the app or use hands-free features only.
            </Text>

            <Text style={styles.termsText}>
              <Text style={styles.bold}>5. Limitation of Liability{'\n'}</Text>
              BaguioQuest and its developers are not liable for any damages, accidents, or violations resulting from app usage. Use at your own risk and discretion.
            </Text>
          </View>

          <View style={styles.acceptanceRow}>
            <Switch
              value={acceptedTerms}
              onValueChange={setAcceptedTerms}
              trackColor={{ false: '#e5e7eb', true: '#93c5fd' }}
              thumbColor={acceptedTerms ? '#2563eb' : '#f3f4f6'}
            />
            <Text style={styles.acceptanceText}>
              I have read and accept the Terms of Service
            </Text>
          </View>
        </View>

        {/* Privacy Policy */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Shield size={24} color="#10b981" />
            <Text style={styles.sectionTitle}>Privacy Policy</Text>
          </View>

          <View style={styles.termsContent}>
            <Text style={styles.termsText}>
              <Text style={styles.bold}>1. Information We Collect{'\n'}</Text>
              • Location data (GPS coordinates) for navigation purposes{'\n'}
              • App usage analytics to improve performance{'\n'}
              • Saved places and preferences (stored locally)
            </Text>

            <Text style={styles.termsText}>
              <Text style={styles.bold}>2. How We Use Your Information{'\n'}</Text>
              • Provide turn-by-turn navigation{'\n'}
              • Show nearby points of interest{'\n'}
              • Improve route suggestions{'\n'}
              • Enhance app functionality
            </Text>

            <Text style={styles.termsText}>
              <Text style={styles.bold}>3. Data Storage{'\n'}</Text>
              Most data is stored locally on your device. Location data is only transmitted when requesting routes or searching for places.
            </Text>

            <Text style={styles.termsText}>
              <Text style={styles.bold}>4. Data Sharing{'\n'}</Text>
              We do not sell or share your personal data with third parties. Anonymous usage statistics may be collected to improve the app.
            </Text>

            <Text style={styles.termsText}>
              <Text style={styles.bold}>5. Your Rights{'\n'}</Text>
              You can clear your data anytime through the app settings. Location permissions can be revoked through your device settings.
            </Text>
          </View>

          <View style={styles.acceptanceRow}>
            <Switch
              value={acceptedPrivacy}
              onValueChange={setAcceptedPrivacy}
              trackColor={{ false: '#e5e7eb', true: '#93c5fd' }}
              thumbColor={acceptedPrivacy ? '#10b981' : '#f3f4f6'}
            />
            <Text style={styles.acceptanceText}>
              I have read and accept the Privacy Policy
            </Text>
          </View>
        </View>

        {/* Important Notice */}
        <View style={styles.noticeSection}>
          <Text style={styles.noticeTitle}>⚠️ Important Safety Notice</Text>
          <Text style={styles.noticeText}>
            Always prioritize safety while driving. This app is a navigation aid, not a replacement for careful driving and adherence to traffic laws. When in doubt, follow official road signs and traffic officers.
          </Text>
        </View>
      </ScrollView>

      {/* Continue Button */}
      <View style={styles.bottomSection}>
        <TouchableOpacity 
          style={[
            styles.continueButton,
            canContinue ? styles.continueButtonEnabled : styles.continueButtonDisabled
          ]}
          onPress={handleContinue}
          disabled={!canContinue}
        >
          {canContinue ? (
            <CheckCircle size={20} color="#ffffff" />
          ) : (
            <ArrowRight size={20} color="#9ca3af" />
          )}
          <Text style={[
            styles.continueButtonText,
            canContinue ? styles.continueButtonTextEnabled : styles.continueButtonTextDisabled
          ]}>
            {canContinue ? 'Accept & Continue' : 'Please Accept Both Terms'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginTop: 12,
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
  content: {
    flex: 1,
  },
  section: {
    backgroundColor: '#ffffff',
    margin: 16,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1f2937',
    marginLeft: 12,
  },
  termsContent: {
    marginBottom: 20,
  },
  termsText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
    marginBottom: 16,
  },
  bold: {
    fontWeight: '600',
    color: '#1f2937',
  },
  acceptanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  acceptanceText: {
    fontSize: 14,
    color: '#374151',
    marginLeft: 12,
    flex: 1,
    fontWeight: '500',
  },
  noticeSection: {
    backgroundColor: '#fef2f2',
    margin: 16,
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  noticeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#dc2626',
    marginBottom: 12,
  },
  noticeText: {
    fontSize: 14,
    color: '#7f1d1d',
    lineHeight: 20,
  },
  bottomSection: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  continueButtonEnabled: {
    backgroundColor: '#2563eb',
  },
  continueButtonDisabled: {
    backgroundColor: '#f3f4f6',
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  continueButtonTextEnabled: {
    color: '#ffffff',
  },
  continueButtonTextDisabled: {
    color: '#9ca3af',
  },
});