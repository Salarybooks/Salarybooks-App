import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Dimensions,
  ScrollView,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import { API_BASE_URL } from "@env";
import StatusPopup from './StatusPopup/StatusPopup';

const { width, height } = Dimensions.get('window');

const ForgotPasswordScreen = () => {
  const navigation = useNavigation();
  const [corporateId, setCorporateId] = useState('');
  const [userId, setUserId] = useState('');
  const [loading, setLoading] = useState(false);
  const [shouldNavigate, setShouldNavigate] = useState(false);
  const [popupConfig, setPopupConfig] = useState({
    visible: false,
    type: 'success',
    title: '',
    message: '',
  });

  const showPopup = (type, title, message) => {
    setPopupConfig({ visible: true, type, title, message });
  };

  const handleResetRequest = async () => {
    if (!corporateId.trim() || !userId.trim()) {
      showPopup('error', 'Validation Error', 'Please enter both Corporate ID and User ID.');
      return;
    }

    setLoading(true);
    try {
      // Check user type — only employee gets further processing
      const typeUrl = `${API_BASE_URL}public/check-usertype`;
      const typeRes = await axios.post(typeUrl, {
        corporate_id: corporateId.trim(),
        userid: userId.trim(),
      }, { headers: { 'Content-Type': 'application/json' } });

      const userStatus = typeRes.data.userStatus;
      if (!userStatus) {
        showPopup('error', 'User Not Found', 'Please check your Corporate ID and User ID.');
        setLoading(false);
        return;
      }

      if (userStatus !== 'employee') {
        showPopup('error', 'User Not Found', 'Please check your Corporate ID and User ID.');
        setLoading(false);
        return;
      }

      // Employee — proceed with forgot password
      const resetUrl = `${API_BASE_URL}public/find-company-by-corporateId`;
      const response = await axios.post(resetUrl, {
        corporate_id: corporateId.trim(),
        userid: userId.trim(),
      }, { headers: { 'Content-Type': 'application/json' } });

      if (response.data.status === 'success') {
        setShouldNavigate(true);
        showPopup('success', 'Success', response.data.message);
      } else {
        showPopup('error', 'Failed', response.data.message || 'Request failed.');
      }
    } catch (error) {
      const errMsg = error.response?.data?.message || error.message || 'Something went wrong. Please try again.';
      showPopup('error', 'Error', errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={["#000000ff", "#1c68beff"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ flex: 1 }}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.container}>
       

          <Image
            source={require('../assets/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />

          <Text style={styles.heading}>Forgot Password</Text>
          <Text style={styles.subtitle}>
            Enter your Corporate ID and User ID to receive a password reset link.
          </Text>

          <View style={styles.inputCard}>
            <TextInput
              style={styles.input}
              placeholder="Enter Corporate ID"
              placeholderTextColor="#cfd8dc"
              value={corporateId}
              onChangeText={setCorporateId}
              autoCapitalize="characters"
            />
            <TextInput
              style={styles.input}
              placeholder="Enter User ID"
              placeholderTextColor="#cfd8dc"
              value={userId}
              onChangeText={setUserId}
            />

            <TouchableOpacity
              style={[styles.submitBtn, loading && styles.disabledBtn]}
              onPress={handleResetRequest}
              disabled={loading}
            >
              <Text style={styles.submitText}>
                {loading ? 'Sending...' : 'Send Reset Link'}
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.signInLink}>Back to Sign In</Text>
          </TouchableOpacity>
    
        </View>
      </ScrollView>

      <StatusPopup
        visible={popupConfig.visible}
        type={popupConfig.type}
        title={popupConfig.title}
        message={popupConfig.message}
        onClose={() => {
          setPopupConfig(prev => ({ ...prev, visible: false }));
          if (shouldNavigate) {
            navigation.navigate('SignUpScreen');
          }
        }}
      />
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    alignItems: 'center',
    width: '85%',
  },
  logo: {
    width: width * 0.6,
    height: height * 0.1,
    marginBottom: 86,
  },
  heading: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
    fontFamily: 'Outfit-Bold',
  },
  subtitle: {
    color: '#b0bec5',
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 18,
    fontFamily: 'Outfit-Bold',
  },
  inputCard: {
    width: '100%',
    borderRadius: 16,
    padding: 20,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderWidth: 1,
    borderColor: '#ffffffff',
    borderRadius: 12,
    padding: 12,
    marginVertical: 8,
    color: '#fff',
    fontSize: 14,
  },
  submitBtn: {
    backgroundColor: '#00508B',
    borderRadius: 10,
    paddingVertical: 12,
    marginTop: 16,
    alignItems: 'center',
  },
  disabledBtn: {
    opacity: 0.6,
  },
  submitText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    fontFamily: 'Outfit-Bold',
  },
  signInLink: {
    marginTop: 20,
    color: '#fff',
    fontSize: 14,
    textDecorationLine: 'underline',
    fontFamily: 'Outfit-Bold',
  },
});

export default ForgotPasswordScreen;
