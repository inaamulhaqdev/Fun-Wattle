import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { router } from 'expo-router';
import { getAuth } from 'firebase/auth';
import { firestore } from '../config/firebase';
import { updateDoc, doc } from 'firebase/firestore';
import { useRegistration } from '../context/RegistrationContext';

const MembershipPage = () => {

  const { userType } = useRegistration();

  const handleSubscription = async (type: 'free_trial' | 'paid') => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (user) {
      if (type === 'free_trial') {
        // TODO: Save membership type (free), start and end date to postgres db
      } else if (type === 'paid') {
        // TODO: Save membership type (paid) and start date to postgres db
      }

      router.push({
        pathname: '/profile-creation',
        params: { userType: userType } // Might do this differently with postgres....
      });
    } else {
      Alert.alert('No user is currently logged in.');
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.content}>
        {/* Header */}
        <Text style={styles.welcomeText}>
          Thank you for signing up to FunWattle.
        </Text>

        <Text style={styles.subtitleText}>
          You can now choose either a free trial or a paid subscription:
        </Text>

        {/* Free Trial Card */}
        <View style={styles.planCard}>
          <Text style={styles.planTitle}>Free 7-day trial</Text>

          <View style={styles.featuresList}>
            <Text style={styles.featureItem}>
              • Get a sneak peek into our content with limited access to the library
            </Text>
            <Text style={styles.featureItem}>
              • Explore our sample learning paths at your own pace.
            </Text>
            <Text style={styles.featureItem}>
              • Preview our character experiences
            </Text>
            <Text style={styles.featureItem}>
              • Earn badges from our sample learning paths.
            </Text>
            <Text style={styles.featureItem}>
              • Parents can see a limited progress report.
            </Text>
            <Text style={styles.featureItem}>
              • At the end of your trial, receive a special discount code to unlock full progress reports, 100+ learning units, and more
            </Text>
          </View>

          <TouchableOpacity style={styles.trialButton} onPress={() => handleSubscription('free_trial')}>
            <Text style={styles.trialButtonText}>Start free 7-day trial</Text>
          </TouchableOpacity>
        </View>

        {/* Paid Subscription Card */}
        <View style={styles.planCard}>
          <Text style={styles.planTitle}>Paid Subscription</Text>

          <View style={styles.featuresList}>
            <Text style={styles.featureItem}>
              • Unlock 100+ learning units and guided adaptive paths
            </Text>
            <Text style={styles.featureItem}>
              • Get tailored support from our AI Therapist
            </Text>
            <Text style={styles.featureItem}>
              • Access full therapist tools: chat, assignments, and progress reviews
            </Text>
            <Text style={styles.featureItem}>
              • Invite your own therapist to join and collaborate
            </Text>
            <Text style={styles.featureItem}>
              • Explore the complete character library for personalized experiences
            </Text>
            <Text style={styles.featureItem}>
              • Earn a wide range of badges & certificates to celebrate milestones
            </Text>
            <Text style={styles.featureItem}>
              • Parents receive detailed progress reports and in-depth analytics
            </Text>
          </View>

          <TouchableOpacity style={styles.paidButton} onPress={() => handleSubscription('paid')}>
            <Text style={styles.paidButtonText}>Pay $30/month</Text>
          </TouchableOpacity>
        </View>

        {/* Bottom padding */}
        <View style={styles.bottomPadding} />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    padding: 20,
    paddingTop: 60,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 20,
    lineHeight: 32,
  },
  subtitleText: {
    fontSize: 18,
    color: '#000',
    marginBottom: 30,
    lineHeight: 24,
  },
  planCard: {
    borderWidth: 2,
    borderColor: '#000',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    backgroundColor: '#fff',
  },
  planTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 20,
    textAlign: 'center',
  },
  featuresList: {
    marginBottom: 25,
  },
  featureItem: {
    fontSize: 14,
    color: '#000',
    lineHeight: 20,
    marginBottom: 8,
  },
  trialButton: {
    backgroundColor: '#000',
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  trialButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  paidButton: {
    backgroundColor: '#000',
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  paidButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  bottomPadding: {
    height: 40,
  },
});

export default MembershipPage;