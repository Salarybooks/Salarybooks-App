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
  Dimensions
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from './ThemeContext';
import BottomNavigation from './BottomNavigation';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LinearGradient from 'react-native-linear-gradient';
import { useRoute } from "@react-navigation/native";
import Navbar from "./Dashboardscreen/navbar"
import GlobalFont from '../theme/GlobalFont';
const { width } = Dimensions.get("window");
const scale = width / 375;
import StatusPopup from "./StatusPopup/StatusPopup";

const Settings = ({ navigation }) => {
  const { isDarkMode, toggleDarkMode } = useTheme();
  const [showLogoutPopup, setShowLogoutPopup] = useState(false);
  const insets = useSafeAreaInsets();
  const [userData, setUserData] = useState(null);
  const [popupConfig, setPopupConfig] = useState({visible: false,type: "success", title: "",message: "",});
  const [bankData, setBankData] = useState(null);
  const [profilepic, setProfilepic] = useState(null);
  const [rights,setRights]=useState(false);
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
        // const employeeBankDetails = JSON.parse(await AsyncStorage.getItem("employee_bank_details"));
        // console.log("userData", userData);
        const storedBankDetails = await AsyncStorage.getItem("employee_bank_details");
        const profilepic = await AsyncStorage.getItem("imageUrl");
        console.log("profilepicprofilepicprofilepicprofilepic", profilepic);
        setRights( JSON.parse(await AsyncStorage.getItem("rights")));
        setProfilepic(profilepic)
        const bankDetails = storedBankDetails
          ? JSON.parse(storedBankDetails)
          : null;
        setBankData(bankDetails)
        // console.log(bankDetails);
        if (userData) {
          // console.log(userData,"userData");
          setUserData(userData);
        }
      } catch (error) {
        console.log("Error loading userData:", error);
      }
    };

    loadData();
  }, [profilepic]);
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
          source={require("../assets/Settings_nav.png")}
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
                  : require("../assets/photo.jpg")
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
              <Text style={[GlobalFont.semiBold,styles.nameText, { color: "#fff" }]}>{userData?.emp_first_name}{"\n"}{userData?.emp_last_name}</Text>
              <Text style={[GlobalFont.CustomFont,styles.codeText, { color: "#fff" }]}>{userData?.emp_id}</Text>
              <Text style={[GlobalFont.CustomFont,styles.emailText, { color: "#fff" }]}>{userData?.email_id}</Text>

            </View>
          </View>

          <View style={styles.card1}>
            <View style={styles.infoRow}>
              <Text style={[GlobalFont.CustomFont,styles.label, { color: "#fff" }]}>E-mail</Text>
              <Text style={[GlobalFont.CustomFont,styles.value, { color: "#fff"}]}>{userData?.email_id}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={[GlobalFont.CustomFont,styles.label, { color: "#fff" }]}>Phone</Text>
              <Text style={[GlobalFont.CustomFont,styles.value, { color: "#fff" }]}>{userData?.mobile_no}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={[GlobalFont.CustomFont,styles.label, { color: "#fff"}]}>PAN</Text>
              <Text style={[GlobalFont.CustomFont,styles.value, { color: "#fff" }]}>{userData?.pan_no}</Text>
            </View>
          </View>
          {/* </LinearGradient> */}
          {/* <LinearGradient
              colors={["#122441ff", "#0c3058ff"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.card}
          > */}
          <View style={styles.card}>
            <Text style={[GlobalFont.CustomFont,styles.label_bank, { color:  "#fff"  }]}>Bank Accounts</Text>
            <View style={styles.infoRow1}>
              <Text style={[styles.value, { color: "#fff" }]}>{bankData?.bank_name}</Text>
              <Text style={[styles.value, { color: "#fff" }]}>{bankData?.account_no? `****${bankData.account_no.slice(-4)}`: ""}</Text>
            </View>
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
            <View style={styles.support}>
            <TouchableOpacity onPress={handleLogout}>
              <Text style={[GlobalFont.CustomFont,styles.value, { color: "#fff"  }]}>LOGOUT</Text>
            </TouchableOpacity>
            </View>
            {/* </View> */}
            {/* </LinearGradient> */}
          </View>
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
      <BottomNavigation rights={rights}/>
      {/* </View> */}
    </LinearGradient>
  );
};

export default Settings;

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
  infoRow1: {
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
    textAlign:"center",
    height: 158
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
});