import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
  Switch,
  Dimensions,
  Modal
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../ThemeContext';
import BottomNavigation from '../BottomNavigation';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LinearGradient from 'react-native-linear-gradient';
import { useRoute } from "@react-navigation/native";
import Navbar from "../Dashboardscreen/navbar"
import GlobalFont from '../../theme/GlobalFont';
import axios from "axios";
import { API_BASE_URL } from "@env";
import PrivacyPolicy from '../Policy/PrivacyPolicy';
import TermsAndConditions from '../Policy/Terms&conditions';


const { width, height } = Dimensions.get("window");
const scale = width / 375;
const isSmallPhone = height < 700;
import StatusPopup from "../StatusPopup/StatusPopup";

const Account = ({ navigation }) => {
  const Navigation = useNavigation();
  const { isDarkMode, toggleDarkMode } = useTheme();
  const [showLogoutPopup, setShowLogoutPopup] = useState(false);
  const insets = useSafeAreaInsets();
  const [userData, setUserData] = useState(null);
  const [popupConfig, setPopupConfig] = useState({ visible: false, type: "success", title: "", message: "", });
  // const [bankData, setBankData] = useState(null);
  const [profilepic, setProfilepic] = useState(null);
  const [rights, setRights] = useState(false);
  const [employee_id, setemployee_id] = useState(null);
  const [accountData, setAccountData] = useState(null);
  const [updatedDetails, setUpdatedDetails] = useState(null);
  const [token, setToken] = useState(false);
  const [masterdata, setMasterdata] = useState(null);
  const [privacy, setPrivacy] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const themeColors = {
    background: isDarkMode ? '#000' : '#fff',
    card: isDarkMode ? '#1c1c1e' : '#f4f4f4',
    text: isDarkMode ? '#fff' : '#000',
    label: isDarkMode ? '#ccc' : '#555',
    border: isDarkMode ? '#333' : '#ddd',
    backgroundColor: isDarkMode ? '#444' : '#ccc',
    bcolor: isDarkMode ? '#111' : '#E8E8E8',
    colr: isDarkMode ? '#fff' : '#111',
  };

  const HorizontalLine = () => <View style={styles.line} />;
  useEffect(() => {
    const loadData = async () => {
      try {
        const userData = JSON.parse(await AsyncStorage.getItem("userData"));

        const t = await AsyncStorage.getItem("authToken");
        // const employeeBankDetails = JSON.parse(await AsyncStorage.getItem("employee_bank_details"));
        // console.log("userData", userData);
        // const storedBankDetails = await AsyncStorage.getItem("employee_bank_details");
        const profilepic = await AsyncStorage.getItem("imageUrl");
        setemployee_id(await AsyncStorage.getItem("employee_id"));
        // console.log("profilepicprofilepicprofilepicprofilepic", profilepic);
        setRights(JSON.parse(await AsyncStorage.getItem("rights")));
        setProfilepic(profilepic)
        // const bankDetails = storedBankDetails
        //   ? JSON.parse(storedBankDetails)
        //   : null;
        // setBankData(bankDetails)
        // console.log(bankDetails);
        if (userData) {
          // console.log(userData,"userData");
          setUserData(userData);
          AsyncStorage.setItem('emp_id', JSON.stringify(userData?.emp_id))
          setToken(t);

        }
      } catch (error) {
        // console.log("Error loading userData:", error);
        showPopup("error", "Error loading userData", error);

      }
    };

    loadData();
  }, []);
  useEffect(() => {
    if (token && employee_id) {
      fetchAccountDetails(token);
      fetchUpdatedDetails(token);
      fetchMasterDetails(token);
    }
  }, [token, employee_id])
  // const handleLogout = () => {
  //   Alert.alert('Logout', 'Do you want to logout?', [
  //     {
  //       text: 'Cancel',
  //       onPress: () => null,
  //       style: 'cancel',
  //     },
  //     {
  //       text: 'Yes',
  //       // onPress: () => {
  //       //   navigation.replace('SignUpScreen');
  //       // },
  //       onPress: confirmLogout, 
  //     },
  //   ]);
  // };
  const showPopup = (type, title, message) => {
    setPopupConfig({
      visible: true,
      type,
      title,
      message,
    });
  };

  const fetchAccountDetails = async (token) => {
    if (!token) return;

    try {
      const payload = {
        employee_id: employee_id
      };
      // console.log(API_BASE_URL, "API_BASE_URL");

      const response = await axios.post(
        `${API_BASE_URL}employee/fetch-account-details`,
        payload,
        {
          headers: {
            "x-access-token": token,
            "Content-Type": "application/json",
          },
        }
      );

      if (response?.data?.employee_det) {
        // console.log(response.data.employee_det, "response.data.employee_det");

        setAccountData(response.data.employee_det);
        // console.log(accountData, "accountData");

      }

    } catch (error) {
      // console.log(error.message);
      showPopup("error", "Error", error.message);

    }
  };
  // useEffect(() => {
  //   console.log("UPDATED accountData:", accountData);
  // }, [accountData]);
  const fetchMasterDetails = async (token) => {

    // console.log(token, "API_BASE_URL21");

    if (!token) return;

    try {
      const payload = {
        // employee_id:employee_id
      }
      const response = await axios.post(
        `${API_BASE_URL}employee/get-employee-master`,
        payload,
        {
          headers: {
            "x-access-token": token,
            "Content-Type": "application/json",
          },
        }
      );

      if (response) {
        // console.log(response.data, "masterdata");
        setMasterdata(response.data)
        // AsyncStorage.setItem('masterdata', JSON.stringify(response.data))

      }
    } catch (error) {
      console.log(error.message);
    }
  }

  // const fetchUpdatedDetails = async (token) => {
  //   // console.log(token,"fetchUpdatedDetails");

  //   try {
  //     const payload = {}
  //     const response = await axios.post(
  //       `${API_BASE_URL}employee/fetch-updated-details`,
  //       payload,
  //       {
  //         headers: {
  //           "x-access-token": token,
  //           "Content-Type": "application/json",
  //         },
  //       }
  //     );

  //     if (response) {

  //       // console.log(response.data,"response");
  //       // AsyncStorage.setItem('personal_det', JSON.stringify(response.data.employee_details))
  //       // AsyncStorage.setItem('emp_unapprove_address', JSON.stringify(response.data.employee_details.emp_address))
  //       // AsyncStorage.setItem('emp_unapprove_curr_address', JSON.stringify(response.data.employee_details.emp_curr_address))
  //       // AsyncStorage.setItem('emp_unapprove_bank_details', JSON.stringify(response.data.employee_details.bank_details))
  //       // AsyncStorage.setItem('emp_unapprove_pfesic_details', JSON.stringify(response.data.employee_details.pfesic_details))
  //       // console.log(response.data, "response");

  //       const employee = response?.data?.employee_details;
  //       console.log(response?.data?.employee_details, "employee");

  //       if (employee) {
  //         await AsyncStorage.setItem(
  //           'personal_det',
  //           JSON.stringify(employee)
  //         );
  //       } else {
  //         await AsyncStorage.removeItem('personal_det');
  //       }

  //       if (employee?.emp_address) {
  //         await AsyncStorage.setItem(
  //           'emp_unapprove_address',
  //           JSON.stringify(employee.emp_address)
  //         );
  //       } else {
  //         await AsyncStorage.removeItem('emp_unapprove_address');
  //       }

  //       if (employee?.emp_curr_address) {
  //         await AsyncStorage.setItem(
  //           'emp_unapprove_curr_address',
  //           JSON.stringify(employee.emp_curr_address)
  //         );
  //       } else {
  //         await AsyncStorage.removeItem('emp_unapprove_curr_address');
  //       }

  //       if (employee?.bank_details) {
  //         await AsyncStorage.setItem(
  //           'emp_unapprove_bank_details',
  //           JSON.stringify(employee.bank_details)
  //         );
  //       } else {
  //         await AsyncStorage.removeItem('emp_unapprove_bank_details');
  //       }

  //       if (employee?.pfesic_details) {
  //         await AsyncStorage.setItem(
  //           'emp_unapprove_pfesic_details',
  //           JSON.stringify(employee.pfesic_details)
  //         );
  //       } else {
  //         await AsyncStorage.removeItem('emp_unapprove_pfesic_details');
  //       }
  //     }
  //   } catch (error) {
  //     console.log(error.message);
  //   }
  // }
  const fetchUpdatedDetails = async (token) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}employee/fetch-updated-details`,
        {},
        {
          headers: {
            "x-access-token": token,
            "Content-Type": "application/json",
          },
        }
      );

      const employee = response?.data?.employee_details;

      // console.log(response, "response");

      if (employee) {
        setUpdatedDetails(employee);
      }

    } catch (error) {
      console.log(error.message);
    }
  };
  const handleLogout = () => {
    setShowLogoutPopup(true);
    // Alert.alert(
    //   'Logout',
    //   'Do you want to logout?',
    //   [
    //     {
    //       text: 'Cancel',
    //       style: 'cancel',
    //     },
    //     {
    //       text: 'Yes',
    //       onPress: confirmLogout,
    //     },
    //   ],
    //   { cancelable: true }
    // );
  };

  const RoutPage = (field) => {

    if (!accountData) {
      Alert.alert("Please wait", "Data is still loading...");
      return;
    }
    if (field == "Personal") {
      const commonParams = {
        accountData,
        updatedDetails
      };


      Navigation.navigate('PersonalDetails', commonParams)
    }
    if (field == "Address") {
      const commonParams = {
        employee_address: accountData?.emp_det?.emp_address,
        employee_curr_address: accountData?.emp_det?.emp_curr_address,
        emp_unapprove_address: updatedDetails?.emp_address,
        emp_unapprove_curr_address: updatedDetails?.emp_curr_address
      };
      Navigation.navigate('AddressDetails', commonParams)
    }
    if (field == "BankDetails") {
      const commonParams = {
        employee_bank_details: accountData?.emp_det?.bank_details,
        emp_unapprove_bank_details: updatedDetails?.bank_details
      };
      // console.log(updatedDetails?.bank_details,"commonParams");
      Navigation.navigate('BankDetailsForm', commonParams)
    }
    if (field == "HRDetails") {
      const commonParams = {
        masterdata: masterdata,
        employee_hr_details: accountData?.emp_det.employment_hr_details
      };
      // console.log(commonParams,"commonParams");

      Navigation.navigate('HRDetails', commonParams);
    }
    if (field == "PFESICDetails") {
      const commonParams = {
        employee_PF_ESIC_details: accountData?.emp_det?.pf_esic_details,
        emp_unapprove_pfesic_details: updatedDetails?.pfesic_details
      };
      console.log(commonParams, "commonParams");

      Navigation.navigate('PFESICDetails', commonParams)
    }
  }
  // const confirmLogout = async () => {
  //   try {
  //     await AsyncStorage.removeItem('authToken');
  //     await AsyncStorage.removeItem('userData');
  //     await AsyncStorage.clear();
  //     navigation.replace('SignUpScreen');
  //   } catch (error) {
  //     console.log('Logout error:', error);
  //   }
  // };
  const confirmLogout = async () => {
    try {
      setShowLogoutPopup(false);

      await AsyncStorage.removeItem("authToken");
      await AsyncStorage.removeItem("userData");
      await AsyncStorage.clear();

      navigation.replace("SignUpScreen");
    } catch (error) {
      console.log("Logout error:", error);
    }
  };
  const route = useRoute();
  const screenTitle = route.params?.title;
  return (
    <LinearGradient
      colors={["#000000ff", "#1c68beff"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      {/* <View
      style={[
        styles.container,
        {
          backgroundColor: themeColors.background,
          paddingTop: insets.top,
        },
      ]}
    > */}
      {/* Full Width Header */}
      <View style={styles.header}>
        <Image
          source={require("../../assets/Settings_nav.png")}
          style={styles.header_iconImage}
        />

        <Navbar title={screenTitle} />
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 80 }}>
        <View style={styles.contentPadding}>
          {/* Profile section */}
          {/* <LinearGradient
                      colors={["#0b132bff", "#173d68ff"]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.profileCard}
                    > */}
          <View style={styles.profileCard}>
            {/* <Image source={require('../assets/photo.jpg')} style={styles.avatar} /> */}
            <Image
              source={
                profilepic
                  ? { uri: profilepic }
                  : require("../../assets/user.png")
              }
              style={styles.profileImage}
            />
            {/* <TouchableOpacity style={styles.editIcon}>
              <Image
                source={require('../assets/settings.png')}
                style={{ width: 14, height: 14, tintColor: '#fff' }}
              />
            </TouchableOpacity>  */}
            <View style={styles.profileText}>
              <Text style={[GlobalFont.semiBold, styles.nameText, { color: "#fff" }]}>{userData?.emp_first_name}{"\n"}{userData?.emp_last_name}</Text>
              <Text style={[GlobalFont.CustomFont, styles.codeText, { color: "#fff" }]}>{userData?.emp_id}</Text>
              <Text style={[GlobalFont.CustomFont, styles.emailText, { color: "#fff" }]}>{userData?.email_id}</Text>

            </View>
          </View>

          <View style={styles.card1}>
            <View style={styles.infoRow}>
              <Image
                source={require("../../assets/registration.png")}
                style={styles.iconImage}
              />
              <Text style={[GlobalFont.CustomFont, styles.label, { color: "#fff" }]}>Personal Details</Text>
              <TouchableOpacity onPress={() => RoutPage('Personal')}>
                <Image
                  source={require("../../assets/edit.png")}
                  style={styles.iconImage}
                />
              </TouchableOpacity>
              {/* <Text style={[GlobalFont.CustomFont, styles.value, { color: "#fff" }]}>{userData?.email_id}</Text> */}
            </View>

            <View style={styles.infoRow}>
              <Image
                source={require("../../assets/home-address.png")}
                style={styles.iconImage}
              />
              <Text style={[GlobalFont.CustomFont, styles.label, { color: "#fff" }]}>Address</Text>
              <TouchableOpacity onPress={() => RoutPage('Address')}>
                <Image
                  source={require("../../assets/edit.png")}
                  style={styles.iconImage}
                />
              </TouchableOpacity>
              {/* <Text style={[GlobalFont.CustomFont, styles.value, { color: "#fff" }]}>{userData?.mobile_no}</Text> */}
            </View>
            {/* <View style={styles.infoRow}>
              <Text style={[GlobalFont.CustomFont, styles.label, { color: "#fff" }]}>PAN</Text>
              <Text style={[GlobalFont.CustomFont, styles.value, { color: "#fff" }]}>{userData?.pan_no}</Text>
            </View> */}
          </View>
          {/* </LinearGradient> */}
          {/* <LinearGradient
              colors={["#122441ff", "#0c3058ff"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.card}
          > */}
          <View style={styles.card}>
            {/* <Text style={[GlobalFont.CustomFont, styles.label_bank, { color: "#fff" }]}>Bank Details</Text> */}
            <View style={styles.infoRow1}>
              <Image
                source={require("../../assets/credit-card.png")}
                style={styles.iconImage}
              />
              <Text style={[GlobalFont.CustomFont, styles.label, { color: "#fff" }]}>Bank Details</Text>
              <TouchableOpacity onPress={() => RoutPage('BankDetails')}>
                <Image
                  source={require("../../assets/edit.png")}
                  style={styles.iconImage}
                />
              </TouchableOpacity>
              {/* <Text style={[styles.value, { color: "#fff" }]}>{bankData?.account_no ? `****${bankData.account_no.slice(-4)}` : ""}</Text> */}
            </View>
            <View style={styles.infoRow1}>
              <Image
                source={require("../../assets/credit-card.png")}
                style={styles.iconImage}
              />
              <Text style={[GlobalFont.CustomFont, styles.label, { color: "#fff" }]}>PF&ESI Details</Text>
              <TouchableOpacity onPress={() => RoutPage('PFESICDetails')}>
                <Image
                  source={require("../../assets/edit.png")}
                  style={styles.iconImage}
                />
              </TouchableOpacity>
              {/* <Text style={[styles.value, { color: "#fff" }]}>{bankData?.account_no ? `****${bankData.account_no.slice(-4)}` : ""}</Text> */}
            </View>
            <TouchableOpacity onPress={() => RoutPage('HRDetails')}>
              <View style={styles.infoRow2}>
                <Image
                  source={require("../../assets/employee.png")}
                  style={styles.iconImage}
                />

                <Text style={[GlobalFont.CustomFont, styles.label, { color: "#fff" }]}>HR Details</Text>

                {/* <Image   
                  source={require("../../assets/edit.png")}
                  style={styles.iconImage}
                /> */}

                {/* <Text style={[styles.value, { color: "#fff" }]}>{bankData?.account_no ? `****${bankData.account_no.slice(-4)}` : ""}</Text> */}
              </View>
            </TouchableOpacity>
          </View>
        </View>
        {/* </LinearGradient> */}
        {/* <LinearGradient
                      colors={["#000000ff", "#1c68beff"]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.card}
                    > */}
        <View style={styles.card}>
          <TouchableOpacity onPress={handleLogout}>
          <View style={styles.support}>
              <Text style={[GlobalFont.CustomFont, styles.value, { color: "#fff" }]}>LOGOUT</Text>
          </View>
          </TouchableOpacity>
          {/* </View> */}
          {/* </LinearGradient> */}
        </View>
        <TouchableOpacity
          style={styles.privacyLinkWrapper}
          onPress={() => setPrivacy(true)}
          activeOpacity={0.7}
        >
          <Image
                source={require('../../assets/icons8-lock-50.png')}
                style={styles.lockIcon}
                resizeMode="contain"
              />
          <Text style={[GlobalFont.CustomFont, styles.privacyLink]}>
            Privacy Policy
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.TermsLinkWrapper}
          onPress={() => setTermsAccepted(true)}
          activeOpacity={0.7}
        >
          <Image
                source={require('../../assets/terms-and-conditions.png')}
                style={styles.lockIcon}
                resizeMode="contain"
              />
          <Text style={[GlobalFont.CustomFont, styles.privacyLink]}>
            Terms and Conditions
          </Text>
        </TouchableOpacity>
        <View style={styles.copyrightWrapper}>
          <Text style={styles.Copyright}>Powered by Vauras Biztech Payroll LLP</Text>
          <Text style={styles.Copyright}>Copyright © 2026 Salarybooks.com</Text>
          <Text style={styles.Copyright}>Version 1.0.1</Text>
        </View>
        <Modal
                  visible={termsAccepted}
                  animationType="slide"
                  transparent={true}
                  onRequestClose={() => setTermsAccepted(false)}
                >
                  <View style={styles.overlay}>
                    <View style={styles.term_card}>
                      <TouchableOpacity
                        style={styles.dismissBtn}
                        onPress={() => setTermsAccepted(false)}
                      >
                        <Text style={styles.dismissText}>✖</Text>
                      </TouchableOpacity>
                      <Image
                        source={require('../../assets/logo.png')}
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
          visible={privacy}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setPrivacy(false)}
        >
          <View style={styles.privacyOverlay}>
            <View style={styles.privacyCard}>
              <TouchableOpacity
                style={styles.privacyDismissBtn}
                onPress={() => setPrivacy(false)}
              >
                <Text style={styles.Privacy}>✖</Text>
              </TouchableOpacity>
              <Image
                source={require('../../assets/logo.png')}
                style={styles.privacyLogo}
                resizeMode="contain"
              />
              <Text style={styles.privacyHeading}>Privacy Policy</Text>
              <View style={styles.privacyScrollWrapper}>
                <ScrollView
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={styles.privacyScrollContent}
                >
                  <PrivacyPolicy/>
                </ScrollView>
              </View>
            </View>
          </View>
        </Modal>
        {/* </View> */}
      </ScrollView>
      <StatusPopup
        visible={showLogoutPopup}
        type="info"
        title="Logout"
        message="Do you want to logout?"
        onClose={confirmLogout}
        showCancel={true}
        onCancel={() => setShowLogoutPopup(false)}
      />
      <BottomNavigation rights={rights} />
      {/* </View> */}
    </LinearGradient>
  );
};

export default Account;

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//   },
//   header: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     marginBottom: 16,
//   },
//   contentPadding: {
//     paddingHorizontal: 16,
//   },
//   fullWidthHeader: {
//     width: '100%',
//     alignItems: 'center',
//     justifyContent: 'center',
//     paddingVertical: 20,
//     elevation: 2,
//     marginBottom: 15,
//   },
//   title: {
//     fontSize: 18,
//     fontWeight: '600',
//   },
//   profileCard: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     padding: 14,
//     borderRadius: 12,
//     marginBottom: 16,
//     position: 'relative',
//   },
//   avatar: {
//     width: 60,
//     height: 60,
//     borderRadius: 30,
//   },
//   editIcon: {
//     position: 'absolute',
//     bottom: 12,
//     left: 48,
//     backgroundColor: '#004aad',
//     borderRadius: 12,
//     padding: 4,
//   },
//   profileText: {
//     marginLeft: 16,
//   },
//   nameText: {
//     fontSize: 17,
//     fontWeight: 'bold',
//     marginLeft: 100,
//     textAlign: 'right',
//   },
//   codeText: {
//     fontSize: 12,
//     marginTop: 4,
//     marginLeft: 163,
//   },
//   emailText: {
//     fontSize: 12,
//     marginTop: 4,
//     marginLeft: 125,
//   },
//   infoBlock: {
//     // borderWidth: 1,
//     borderRadius: 10,
//     padding: 12,
//     marginBottom: 12,
//   },
//   infoRow: {
//     backgroundColor:"#103a61ff",
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginBottom: 10,
//     padding:12,
//     borderRadius:12
//   },
//   label: {
//     fontSize: 14,
//     fontWeight: '500',
//   },
//   label_bank: {
//     fontSize: 14,
//     fontWeight: '500',
//     marginBottom:10
//   },
//   value: {
//     fontSize: 14,
//     fontWeight: '500',
//   },
//   card: {
//     padding: 12,
//     borderRadius: 15,
//     marginBottom: 12,
//   },
//   line: {
//     borderBottomColor: '#ccc',
//     borderBottomWidth: 1,
//     marginVertical: 10,
//   },
//   support:{
//      backgroundColor:"#103a61ff",
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginBottom: 10,
//     padding:12,
//     borderRadius:12
//   }
// });


const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 13,
  },

  header: {
    flexDirection: "row",
    width: "100%",
    marginBottom: 12,
    alignItems: "center",
    gap: 9
  },
  header_iconImage: {
    width: 35,
    padding: 16,
    height: 15,
    marginLeft: -5,
  },
  contentPadding: {
    margin: "auto",
    width: width * .93,
    marginBottom: 10
  },

  profileCard: {
    backgroundColor: "rgba(255,255,255,0.08)",
    flexDirection: "row",
    alignItems: "center",
    padding: 17 * scale,
    borderRadius: 12,
    marginBottom: 16 * scale,
    position: "relative",
  },

  profileImage: {
    width: 60 * scale,
    height: 60 * scale,
    borderRadius: 30 * scale,
  },

  editIcon: {
    position: "absolute",
    bottom: 10 * scale,
    left: 40 * scale,
    backgroundColor: "#004aad",
    borderRadius: 12,
    padding: 4 * scale,
  },

  profileText: {
    flex: 1,
    // marginLeft: 12,
    // justifyContent: "space-between",
    alignItems: "flex-end",
    // textAlign:"right"
    // margin:"auto",
    // marginLeft:105
  },

  nameText: {
    fontSize: 16,
    // fontWeight: "bold",
    textAlign: "right",
    flexWrap: "wrap",
    maxWidth: "100%",
  },

  codeText: {
    fontSize: 12,
    marginTop: 4,
    textAlign: "right",
    flexWrap: "wrap",
    maxWidth: "100%",
  },

  emailText: {
    fontSize: 12,
    marginTop: 4,
    textAlign: "right",
    flexWrap: "wrap",
    maxWidth: "100%",
  },


  infoBlock: {
    borderRadius: 10,
    padding: 12 * scale,
    marginBottom: 12 * scale,
  },

  infoRow: {
    backgroundColor: "rgba(255,255,255,0.1)",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10 * scale,
    paddingVertical: 10 * scale,
    paddingHorizontal: 12 * scale,
    borderRadius: 12,
  },
  iconImage: {
    width: 20,
    padding: 10,
    height: 0,
    marginLeft: 5,
    marginRight: 8
  },
  infoRow1: {
    backgroundColor: "rgba(255,255,255,0.1)",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10 * scale,
    paddingVertical: 10 * scale,
    paddingHorizontal: 12 * scale,
    borderRadius: 12,
  },
  infoRow2: {
    backgroundColor: "rgba(255,255,255,0.1)",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    // marginBottom: 10 * scale,
    paddingVertical: 10 * scale,
    paddingHorizontal: 12 * scale,
    borderRadius: 12,
  },

  label: {
    fontSize: 14 * scale,
    fontWeight: "500",
    flex: 1,
  },

  value: {
    fontSize: 14 * scale,
    fontWeight: "450",
    textAlign: "right",
    // flex: 1,
  },

  label_bank: {
    fontSize: 14 * scale,
    fontWeight: "500",
    marginBottom: 10 * scale,
  },

  card1: {
    backgroundColor: "rgba(255,255,255,0.08)",
    padding: 12 * scale,
    borderRadius: 15,
    marginBottom: 12 * scale,
    textAlign: "center",
    height: 113
  },
  card: {
    backgroundColor: "rgba(255,255,255,0.08)",
    padding: 12 * scale,
    borderRadius: 15,
    marginBottom: 12 * scale,
  },

  line: {
    borderBottomColor: "#ccc",
    borderBottomWidth: 1,
    marginVertical: 10 * scale,
  },

  support: {
    backgroundColor: "rgba(255,255,255,0.1)",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    // marginBottom: 10 * scale,
    paddingVertical: 12 * scale,
    borderRadius: 12,
  },
  privacyLinkWrapper: {
    alignItems: "center",
    display: "flex",
     flexDirection: "row",
     justifyContent: "center",
     marginTop: 30 * scale
  },
  TermsLinkWrapper:{
    alignItems: "center",
    display: "flex",
     flexDirection: "row",
     justifyContent: "center",
     marginTop: 5 * scale
  },
  privacyLink: {
    color: "#fff",
    fontSize: 14 * scale,
  },
  privacyOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.55)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  privacyCard: {
    backgroundColor: "#071f36",
    width: Math.min(width - 32, 460),
    maxHeight: height * 0.86,
    borderRadius: 16,
    paddingHorizontal: isSmallPhone ? 12 : 16,
    paddingTop: isSmallPhone ? 16 : 20,
    paddingBottom: isSmallPhone ? 14 : 20,
  },
  privacyDismissBtn: {
    position: "absolute",
    right: 14,
    top: 14,
    zIndex: 1,
  },
  privacyDismissText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
  privacyLogo: {
    width: Math.min(width * 0.42, 170),
    height: isSmallPhone ? 54 : 72,
    alignSelf: "center",
    marginBottom: isSmallPhone ? 8 : 12,
  },
  privacyHeading: {
    color: "#fff",
    fontSize: isSmallPhone ? 18 : 20,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: isSmallPhone ? 10 : 16,
    paddingHorizontal: 28,
  },
  privacyScrollWrapper: {
    maxHeight: height * (isSmallPhone ? 0.58 : 0.62),
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.4)",
    borderRadius: 12,
    paddingHorizontal: isSmallPhone ? 10 : 12,
    paddingVertical: isSmallPhone ? 8 : 12,
  },
  privacyScrollContent: {
    paddingBottom: 8,
  },
  privacyBodyText: {
    color: "#fff",
    fontSize: isSmallPhone ? 12 : 13,
    lineHeight: isSmallPhone ? 19 : 21,
  },
  lockIcon: {
    width: 16,
    height: 16,
    marginRight: 6,
    tintColor:"#fff"
  },
  Copyright: {  
    color: "#fff",
    fontSize: 10 * scale,
  },
  copyrightWrapper: {
    alignItems: "center",
    marginTop: 15 * scale,
    marginBottom: 25 * scale 
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
  },
  term_card: {
    width: '100%',
    maxHeight: height * 0.90,
    backgroundColor: '#071f36',
    borderRadius: 14,
    padding: 18,
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
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 14,
    paddingHorizontal: 28,
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
  Privacy: {
    color: '#d41c1c',
    fontSize: 18,
    fontWeight: 'bold',
    lineHeight: 20,
    fontFamily: 'Outfit-Bold',
  }
});
