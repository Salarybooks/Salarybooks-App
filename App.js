import React, { useEffect } from 'react';
import {
  SafeAreaView,
  StatusBar,
  useColorScheme,
  Platform,
  PermissionsAndroid,
  Alert,
  BackHandler,
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SignUpScreen from './src/screens/SignUpScreen';
import Dashboard from './src/screens/DashboardScreen';
import Payslips from './src/screens/Payslip/Payslips';
import Expense from './src/screens/Expense';
import Document_vault from './src/screens/Document_vault/document_vault';
// import BankDetailsForm from './src/screens/BankDetailsForm';
import Personal_Details from './src/screens/Personal_Details';
import Address from './src/screens/Address';
// import AttendanceScreen from './src/screens/AttendanceScreen';
import Blank from './src/screens/AttendanceScreen/blank';
import Leaves from './src/screens/Leaves';
import Account from './src/screens/Account/Account';
import { ThemeProvider } from './src/screens/ThemeContext';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Advance from './src/screens/AdvanceScreen/Advance';
import ViewPayslipScreen from "./src/screens/Payslip/ViewPayslipScreen";
import AdvanceInstallmentScreen from './src/screens/AdvanceScreen/AdvanceInstallmentScreen';
import Leave_Management from './src/screens/Leave Management/Leave_Management';
import PersonalDetails from './src/screens/Account/Personal_Details';
import AddressDetails from './src/screens/Account/Address_Details';
import BankDetailsForm from './src/screens/Account/Bank_Details';
import HR_Details from './src/screens/Account/HR_Details';
import PFESICDetails from './src/screens/Account/PF_ESIC_Details'
import { navigationRef } from "./NavigationRef";
import "./src/theme/GlobalFont"
import messaging from '@react-native-firebase/messaging';
import axios from 'axios';
import { API_BASE_URL } from '@env';
import AsyncStorage from '@react-native-async-storage/async-storage';
import notifee, { AndroidImportance } from '@notifee/react-native';

Ionicons.loadFont();
const Stack = createNativeStackNavigator();

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  const syncTokenWithBackend = async (fcmToken) => {
    const employeeId = await AsyncStorage.getItem('employee_id'); // Assuming employee_id is the userId
    if (employeeId) {
      console.log('App: FCM Token:', fcmToken, 'employee_id:', employeeId);
    } else {
      console.log('App: FCM Token:', fcmToken, 'employee_id: Not found (user not logged in or data not set yet)');
    }
  };

  const fcmgetToken = async () => {
    const fcmToken = await messaging().getToken();
    if (fcmToken) syncTokenWithBackend(fcmToken);
  };

  const onDisplayNotification = async (remoteMessage) => {
    await notifee.displayNotification({
      title: remoteMessage.notification?.title || 'Notification Received',
      body: remoteMessage.notification?.body || '',
      android: {
        channelId: 'default',
        smallIcon: 'ic_launcher',
        pressAction: { id: 'default' },
        importance: AndroidImportance.HIGH,
      },
    });
  };

  const requestPermissionAndroid = async () => {
    if (Platform.OS === 'android') {
      // Create channel once
      await notifee.createChannel({
        id: 'default',
        name: 'Default Channel',
        importance: AndroidImportance.HIGH,
      });
      console.log('App: Notification channel created with ID:', channelId);
      if (Platform.Version >= 33) {
        await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS);
      }
      fcmgetToken();
    }
  };

  useEffect(() => {
    requestPermissionAndroid();

    // Handle foreground messages
    const unsubscribeOnMessage = messaging().onMessage(onDisplayNotification);

    // Handle token refresh
    const unsubscribeTokenRefresh = messaging().onTokenRefresh(syncTokenWithBackend);

    // Handle notification click when app is in background
    messaging().onNotificationOpenedApp(remoteMessage => {
      console.log('App: Notification caused app to open from background', remoteMessage);
    });

    // Check if app was opened from a killed state via notification
    messaging().getInitialNotification().then(remoteMessage => {
      if (remoteMessage) {
        console.log('App: Notification caused app to open from killed state', remoteMessage);
      }
    });

    return () => {
      unsubscribeOnMessage();
      unsubscribeTokenRefresh();
    };
  }, []);


useEffect(() => {
  const backAction = () => {
    const route = navigationRef.current?.getCurrentRoute();

    if (route?.name === "Dashboard") {
      BackHandler.exitApp();
      return true;
    }

    // navigationRef.current?.navigate("Dashboard");
    return false;
  };

  const backHandler = BackHandler.addEventListener(
    "hardwareBackPress",
    backAction
  );

  return () => backHandler.remove();
}, []);


  return (
    <ThemeProvider>
      <SafeAreaView style={{ flex: 1, backgroundColor: isDarkMode ? '#000' : '#fff' }}>
        <StatusBar
          barStyle={isDarkMode ? 'light-content' : 'dark-content'}
          backgroundColor={isDarkMode ? '#000' : '#fff'}
        />
        {/* <NavigationContainer> */}
        <NavigationContainer ref={navigationRef}>
          <Stack.Navigator initialRouteName="SignUpScreen" >
            <Stack.Screen name="SignUpScreen" component={SignUpScreen} options={{ headerShown: false }} />
            {/* <Stack.Screen name="AttendanceScreen" component={AttendanceScreen} options={{ headerShown: false }} /> */}
            <Stack.Screen name="Blank" component={Blank} options={{ headerShown: false }} />
            {/* <Stack.Screen name="BankDetailsForm" component={BankDetailsForm} options={{ headerShown: false }} /> */}
            <Stack.Screen name="Address" component={Address} options={{ headerShown: false }} />
            {/* <Stack.Screen name="Personal_Details" component={Personal_Details} options={{ headerShown: false }} /> */}
            {/* <Stack.Screen name="SignUp" component={SignUpScreen} options={{ headerShown: false }} /> */}
            <Stack.Screen name="Dashboard" component={Dashboard} options={{ headerShown: false }} />
            <Stack.Screen name="Payslips" component={Payslips} options={{ headerShown: false }} />
            <Stack.Screen name="Expense" component={Expense} options={{ headerShown: false }} />
            <Stack.Screen name="document_vault" component={Document_vault} options={{ headerShown: false }} />
            <Stack.Screen name="Leaves" component={Leaves} options={{ headerShown: false }} />
            <Stack.Screen name="Account" component={Account} options={{ headerShown: false }} />
            <Stack.Screen name="PersonalDetails" component={PersonalDetails} options={{ headerShown: false }} />
            <Stack.Screen name="AddressDetails" component={AddressDetails} options={{ headerShown: false }} />
            <Stack.Screen name="BankDetailsForm" component={BankDetailsForm} options={{ headerShown: false }} />
            <Stack.Screen name="HRDetails" component={HR_Details} options={{ headerShown: false }} />
            <Stack.Screen name="PFESICDetails" component={PFESICDetails} options={{ headerShown: false }} />
            <Stack.Screen name="Advance" component={Advance} options={{ headerShown: false }} />
            <Stack.Screen name="ViewPayslipScreen" component={ViewPayslipScreen} options={{ headerShown: true, title: "Payslip Details" }}/>
            <Stack.Screen name="AdvanceInstallmentScreen" component={AdvanceInstallmentScreen} options={{ headerShown: false }}/>
            <Stack.Screen name="Leave_Management" component={Leave_Management} options={{ headerShown: false }}/>
          </Stack.Navigator>
        </NavigationContainer>
      </SafeAreaView>
    </ThemeProvider>
  );
}

export default App;
