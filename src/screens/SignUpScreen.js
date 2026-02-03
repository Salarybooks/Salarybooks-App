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

const SignUpScreen = () => {
  const navigation = useNavigation();

  const [corporateId, setCorporateId] = useState('');
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [userData, setUserData] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [popupConfig, setPopupConfig] = useState({ visible: false, type: "success", title: "", message: "", });
  
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
        console.log("rememberMe fetched:", rememberstorage);
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
        console.log('Auto login check failed', error);
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
      console.log(url,"url");
      
      const response = await axios.post(url, data, {
        headers: { 'Content-Type': 'application/json' },
      });
      // navigation.navigate('Dashboard');
      if (response.data.status === 'success') {
        const token = response.data.token;
        const user = response.data.user;

        console.log(token, "token");

        await AsyncStorage.setItem('authToken', token);
        await AsyncStorage.setItem('userData', JSON.stringify(user));
        if (user) {
          setUserData(user);
        }
        // Alert.alert("token", token );
        console.log('Token saved:', token);
        console.log('User saved:', user);

        navigation.navigate('Dashboard');
      } else {
        showPopup("error", response.data.message, "Login failed");
        // Alert.alert(response.data.message || 'Login failed');
      }
    } catch (error) {
      showPopup("error",  error.message, "'Something went wrong. Please try again.'");
      // console.error('Login Failed:', error.response?.data || error.message);
      // Alert.alert('Something went wrong. Please try again.');
    }
  };

  const handleForgotPassword = async () =>{
    // console.log("Forgotpasseword");
    
    showPopup("error",  "Forgot Password", "Please contact your HR for credentials");
  }
  // const handleRememberMe = async () => {
  //   setRememberMe(!rememberMe);
  //   await AsyncStorage.setItem('rememberMe', rememberMe);
  //   console.log("storagerememberMe save",rememberMe);

  // }

  const handleRememberMe = async (newValue) => {
    setRememberMe(newValue);
    await AsyncStorage.setItem('rememberMe', JSON.stringify(newValue));
    console.log("rememberMe saved:", newValue);
  };



  if (checkingAuth) {
    return (
      <LinearGradient
        colors={["#000000ff", "#1c68beff"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ flex: 1 }}
      >
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: '#ffffffff' }}>Loading...</Text>
        </View>
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
    paddingVertical: 40,
  },
  container: {
    alignItems: 'center',
    width: '85%',
  },
  logo: {
    width: width * 0.6,
    height: height * 0.1,
    marginBottom: 30,
  },
  welcomeText: {
    color: '#fff',
    fontSize: 14,
    marginBottom: 20,
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
  },
  signInButton: {
    backgroundColor: '#00508B',
    borderRadius: 10,
    paddingVertical: 12,
    marginTop: 20,
    alignItems: 'center',
  },
  signInText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  forgotText: {
    marginTop: 20,
    fontWeight: 'bold',
    fontSize: 14,
    color: '#fff',
    textDecorationLine: 'underline',
  },
});

export default SignUpScreen;
