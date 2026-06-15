import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Dimensions,
  ScrollView,
  Modal,
  Alert
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import CheckBox from '@react-native-community/checkbox';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import StatusPopup from './StatusPopup/StatusPopup';
const { width, height } = Dimensions.get('window');
import { API_BASE_URL } from "@env";
import PrivacyPolicy from './Policy/PrivacyPolicy';
import TermsAndConditions from './Policy/Terms&conditions';

const SignUpScreen = () => {
  const navigation = useNavigation();

  const [corporateId, setCorporateId] = useState('');
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [userData, setUserData] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [popupConfig, setPopupConfig] = useState({ visible: false, type: "success", title: "", message: "", });
  const [showTerms, setShowTerms] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  //   const handleSignIn = async () => {

  // try{  
  //       // const url = 'https://api.vauras.cloud/api/employee_signin';
  //       const url = 'https://back.finalpayroll.in/employee_signin';
  //       navigation.navigate('Dashboard'); 
  //       const data = { corporate_id: corporateId, userid: userId, password };
  //       const response = await axios.post(url, data, {
  //         headers: { 'Content-Type': 'application/json' },
  //       });

  //       if (response.data.status === 'success') {
  //         navigation.navigate('Dashboard');
  //       }
  //     } catch (error) {
  //       console.error('Login Failed:', error.response?.data || error.message);
  //     }
  //   };


  useEffect(() => {
    const checkLogin = async () => {
      // const storagerememberMe = await AsyncStorage.getItem('rememberMe');
      // console.log("storagerememberMe when fetch", storagerememberMe);

      try {
        const storedRememberMe = await AsyncStorage.getItem('rememberMe');
        const rememberstorage = JSON.parse(storedRememberMe);
        // console.log("rememberMe fetched:", rememberstorage);
        if (rememberstorage) {
          const token = await AsyncStorage.getItem('authToken');
          const user = await AsyncStorage.getItem('userData');

          if (token && user) {
            navigation.replace('Dashboard');
          }
        }
        else {
          await AsyncStorage.removeItem('authToken');
          await AsyncStorage.removeItem('userData');
          await AsyncStorage.clear();
        }
      } catch (error) {
        // console.log('Auto login check failed', error);
        showPopup("error", "Auto login check failed", error );

      }
      finally {
        setCheckingAuth(false);
      }
    };

    checkLogin();
  }, [rememberMe]);

  const showPopup = (type, title, message) => {
    setPopupConfig({
      visible: true,
      type,
      title,
      message,
    });
  };
  const handleSignIn = async () => {
    try {
      await AsyncStorage.setItem('rememberMe', JSON.stringify(rememberMe));
      // const url = 'https://back.finalpayroll.in/employee_signin';
      const url = `${API_BASE_URL}employee_signin`;
      // const url = 'http://10.0.2.2:8080/employee_signin';
      const data = { corporate_id: corporateId, userid: userId, password };
      // const data = { "corporate_id": "VBL", "userid": "TEST062",  "password":"souravHalder@123"};
      // console.log(url, "url");

      const response = await axios.post(url, data, {
        headers: { 'Content-Type': 'application/json' },
      });
      // navigation.navigate('Dashboard');
      if (response.data.status === 'success') {
        const token = response.data.token;
        const user = response.data.user;

        // console.log(token, "token");

        await AsyncStorage.setItem('authToken', token);
        await AsyncStorage.setItem('userData', JSON.stringify(user));
        if (user) {
          setUserData(user);
        }
        // Alert.alert("token", token );
        // console.log('Token saved:', token);
        // console.log('User saved:', user);

        navigation.navigate('Dashboard');
      } else {
        showPopup("error", response.data.message, "Login failed");
        // Alert.alert(response.data.message || 'Login failed');
      }
    } catch (error) {
      showPopup("error", error.message, "'Something went wrong. Please try again.'");
      // console.error('Login Failed:', error.response?.data || error.message);
      // Alert.alert('Something went wrong. Please try again.');
    }
  };

  const handleForgotPassword = async () => {
    // console.log("Forgotpasseword");

    showPopup("error", "Forgot Password", "Please contact your HR for credentials");
  }
  // const handleRememberMe = async () => {
  //   setRememberMe(!rememberMe);
  //   await AsyncStorage.setItem('rememberMe', rememberMe);
  //   console.log("storagerememberMe save",rememberMe);

  // }

  const handleRememberMe = async (newValue) => {
    setRememberMe(newValue);
    await AsyncStorage.setItem('rememberMe', JSON.stringify(newValue));
    // console.log("rememberMe saved:", newValue);
  };



  if (checkingAuth) {
    return (
      <LinearGradient
        colors={["#000000ff", "#1c68beff"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ flex: 1 }}
      >
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', opacity: 1 }}>
          <Image source={require('../assets/Salarybooks_Fav_logo.png')} style={{
            width: width * 0.5,
            height: height * 0.4, resizeMode: 'contain'
          }} />
        </View>
        {/* <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: '#ffffffff' }}>Page Loading ...</Text>
        </View> */}
      </LinearGradient>
    );
  }


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

          <Text style={styles.welcomeText}>Welcome Back! Please sign in.</Text>

          <View style={styles.inputCard}>
            <TextInput
              style={styles.input}
              placeholder="Enter Corporate ID"
              placeholderTextColor="#cfd8dc"
              value={corporateId}
              onChangeText={setCorporateId}
            />
            <TextInput
              style={styles.input}
              placeholder="Enter User ID"
              placeholderTextColor="#cfd8dc"
              value={userId}
              onChangeText={setUserId}
            />
            <TextInput
              style={styles.input}
              placeholder="Enter Your Password"
              placeholderTextColor="#cfd8dc"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />

            <View style={styles.checkboxContainer}>
              <CheckBox
                value={rememberMe}
                onValueChange={handleRememberMe}
                tintColors={{ true: '#007bff', false: '#aaa' }}
              />
              <Text style={styles.checkboxLabel}>Remember Me</Text>
            </View>
            <TouchableOpacity style={styles.signInButton} onPress={handleSignIn}>
              <Text style={styles.signInText}>Sign In ➜</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity onPress={handleForgotPassword}>
            <Text style={styles.forgotText}>Forget Password?</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.termsconditionsprivacyContainer}>
          <Text style={styles.termsconditionsprivacyContainerText}>
            By logging in and using salarybooks, you agree to and accept our{' '}
          </Text>
          <TouchableOpacity onPress={() => setShowTerms(true)} activeOpacity={0.7}>
            <Text style={styles.termsLink}>Privacy Policy</Text>
          </TouchableOpacity>
          <Text style={styles.termsconditionsprivacyContainerText}> and </Text>
          <TouchableOpacity onPress={() => setTermsAccepted(true)} activeOpacity={0.7}>
            <Text style={styles.termsLink}>terms and conditions</Text>
          </TouchableOpacity>
          <Text style={styles.termsconditionsprivacyContainerText}>.</Text>
        </View>

        <Modal
          visible={termsAccepted}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setTermsAccepted(false)}
        >
          <View style={styles.overlay}>
            <View style={styles.card}>
              <TouchableOpacity
                style={styles.dismissBtn}
                onPress={() => setTermsAccepted(false)}
              >
                <Text style={styles.dismissText}>x</Text>
              </TouchableOpacity>
              <Image
                source={require('../assets/logo.png')}
                style={styles.modalOverlayLogo}
                resizeMode="contain"
              />
              <Text style={styles.heading}>Terms and conditions</Text>
              <View style={styles.scrollWrapper}>
                <ScrollView
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={styles.termsScrollContent}
                >
                  {/* <Text style={styles.bodyText}>
                    This document is an electronic record in terms of Information Technology Act, 2000 and all other applicable laws for the time being in force. This electronic record is generated by a computer system and does not require any physical or digital signatures. This document is published in accordance with the provisions of Rule 3 (1) of the Information Technology (Intermediaries guidelines) Rules, 2011 that require publishing the rules and regulations, privacy policy and Terms of Use for access or usage of the SALARYBOOKS Platform. This Terms of Service Agreement is made and entered into by and between you, as a User, and Vauras Biztech LLP doing business as SALARYBOOKS, and its subsidiaries and affiliates. This Agreement contains the terms and conditions that govern the use of SALARYBOOKS's all-in-one HR platform. By clicking the applicable button to indicate acceptance of this Agreement, or by accessing or using the Platform, User agrees to be bound by the Agreement.
                  </Text> */}
                 <TermsAndConditions/> 
                </ScrollView>
              </View>
            </View>
          </View>
        </Modal>
        <Modal
          visible={showTerms}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowTerms(false)}
        >
          <View style={styles.overlay}>
            <View style={styles.card}>
              <TouchableOpacity
                style={styles.dismissBtn}
                onPress={() => setShowTerms(false)}
              >
                <Text style={styles.dismissText}>x</Text>
              </TouchableOpacity>
              <Image
                source={require('../assets/logo.png')}
                style={styles.modalOverlayLogo}
                resizeMode="contain"
              />
              <Text style={styles.heading}>Privacy Policy</Text>
              <View style={styles.scrollWrapper}>
                <ScrollView
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={styles.termsScrollContent}
                >
                  <PrivacyPolicy/>
                </ScrollView>
              </View>
            </View>
          </View>
        </Modal>


        <StatusPopup
          visible={popupConfig.visible}
          type={popupConfig.type}
          title={popupConfig.title}
          message={popupConfig.message}
          onClose={() =>
            setPopupConfig(prev => ({ ...prev, visible: false }))
          }
        />
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradientBackground: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    // paddingVertical: 40,
  },
  container: {
    alignItems: 'center',
    width: '85%',
    marginTop:50
  },
  logo: {
    width: width * 0.6,
    height: height * 0.1,
    marginBottom: 20,
  },
  welcomeText: {
    color: '#fff',
    fontSize: 14,
    marginBottom: 10,
  },
  inputCard: {
    width: '100%',
    // backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 16,
    padding: 20,
    // borderColor: '#1e88e5',
    // borderWidth: 1,
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
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
  checkboxLabel: {
    marginLeft: 8,
    color: '#fff',
    fontSize: 14,
    flexShrink: 1,
  },
  termsLink: {
    color: '#7D99FF',
    fontSize: 10,
  },
  requiredStar: {
    color: 'red',
  },
  signInButton: {
    backgroundColor: '#00508B',
    borderRadius: 10,
    paddingVertical: 12,
    marginTop: 5,
    alignItems: 'center',
  },
  signInText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    fontFamily: 'Outfit-Bold',
  },
  disabledButton: {
    backgroundColor: '#6d7f8f',
    opacity: 0.7,
  },
  disabledButtonText: {
    color: '#d8e1e8',
  },
  forgotText: {
    marginTop: 10,
    fontWeight: 'bold',
    fontSize: 14,
    color: '#fff',
    textDecorationLine: 'underline',
    fontFamily: 'Outfit-Bold',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
  },
  card: {
    width: '100%',
    maxHeight: height * 0.90,
    backgroundColor: '#071f36',
    borderRadius: 14,
    padding: 18,
    fontFamily: 'Outfit-Bold',
  },
  dismissBtn: {
    position: 'absolute',
    right: 14,
    top: 14,
    zIndex: 1,
  },
  dismissText: {
    color: '#d41c1c',
    fontSize: 18,
    fontWeight: 'bold',
    lineHeight: 20,
    fontFamily: 'Outfit-Bold',
  },
  modalOverlayLogo: {
    width: Math.min(width * 0.42, 170),
    height: 70,
    alignSelf: 'center',
    marginBottom: 10,
  },
  heading: {
    color: '#fff',
    fontSize: 20,
    textAlign: 'center',
    marginBottom: 14,
    paddingHorizontal: 28,
    fontFamily: 'Outfit-Bold',
  },
  scrollWrapper: {
    maxHeight: height * 0.58,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  termsScrollContent: {
    paddingBottom: 8,
  },
  bodyText: {
    color: '#fff',
    fontSize: 13,
    lineHeight: 21,
    fontFamily: 'Outfit-Bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalBox: {
    width: '100%',
    backgroundColor: '#0A3158',
    borderRadius: 14,
    padding: 20,
    alignItems: 'center',
  },
  termLogo: {
    width: Math.min(width * 0.42, 160),
    height: 62,
    marginBottom: 12,
  },
  termsBox: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  modalText: {
    color: 'white',
    fontSize: 13,
    lineHeight: 20,
    textAlign: 'center',
    fontFamily: 'Outfit-Bold',
  },
  submitBtn: {
    backgroundColor: '#00508B',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 18,
    alignItems: 'center',
  },
  submitText: {
    color: '#fff',
    fontWeight: 'bold',
    fontFamily: 'Outfit-Bold',
  },
  termsconditionsprivacyContainer: {
    marginTop: 20,
    marginBottom: 30,
    paddingHorizontal: 20,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
  },
  termsconditionsprivacyContainerText:{
    color: '#fff',
    fontSize: 10,
    lineHeight: 18,
    textAlign: 'center',
    fontFamily: 'Outfit-Bold',
  }
});

export default SignUpScreen;
