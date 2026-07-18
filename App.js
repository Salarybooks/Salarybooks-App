import React from 'react';
import { SafeAreaView, StatusBar, useColorScheme } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SignUpScreen from './src/screens/SignUpScreen';
import ForgotPasswordScreen from './src/screens/ForgotPasswordScreen';
import Dashboard from './src/screens/DashboardScreen';
import Payslips from './src/screens/Payslip/Payslips';
import Expense from './src/screens/Expense';
import Document_vault from './src/screens/Document_vault/document_vault';
// import AttendanceScreen from './src/screens/AttendanceScreen';
import Blank from './src/screens/AttendanceScreen/blank';
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
Ionicons.loadFont();
const Stack = createNativeStackNavigator();
import { BackHandler } from "react-native";
import { useEffect } from "react";
import { navigationRef } from "./NavigationRef";
import "./src/theme/GlobalFont"

function App() {
  const isDarkMode = useColorScheme() === 'dark';

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
            <Stack.Screen name="ForgotPasswordScreen" component={ForgotPasswordScreen} options={{ headerShown: false }} />
            {/* <Stack.Screen name="AttendanceScreen" component={AttendanceScreen} options={{ headerShown: false }} /> */}
            <Stack.Screen name="Blank" component={Blank} options={{ headerShown: false }} />
            {/* <Stack.Screen name="SignUp" component={SignUpScreen} options={{ headerShown: false }} /> */}
            <Stack.Screen name="Dashboard" component={Dashboard} options={{ headerShown: false }} />
            <Stack.Screen name="Payslips" component={Payslips} options={{ headerShown: false }} />
            <Stack.Screen name="Expense" component={Expense} options={{ headerShown: false }} />
            <Stack.Screen name="document_vault" component={Document_vault} options={{ headerShown: false }} />
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
