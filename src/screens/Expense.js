import React, { useState, useEffect } from "react";
import axios from 'axios';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Modal,
  TextInput,
  Alert,
   Dimensions,
  ScrollView,
} from "react-native";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LinearGradient from "react-native-linear-gradient";
import Icon from "react-native-vector-icons/Ionicons";
import BottomNavigation from "./BottomNavigation";
import { Picker } from "@react-native-picker/picker";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Image } from "react-native";
import { launchImageLibrary } from "react-native-image-picker";
import { API_BASE_URL } from "@env";
import { useRoute } from "@react-navigation/native";
import Navbar from "./Dashboardscreen/navbar";
import { NativeModules } from "react-native";
import StatusPopup from "./StatusPopup/StatusPopup";
import GlobalFont from "../theme/GlobalFont";
const { PdfPicker } = NativeModules;
const { width } = Dimensions.get('window');
const Expense = () => {
  const insets = useSafeAreaInsets();
  const [claimsData, setClaimsData] = useState([]);
  const [activeTab, setActiveTab] = useState("status");
  const [modalVisible, setModalVisible] = useState(false);
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  const [loading, setLoading] = useState(true);
  const [headId, setHeadId] = useState('');
  const [amount, setAmount] = useState('');
  const [remark, setRemark] = useState('');
  const [token, setToken] = useState(null);
  const [employee_id, setEmployee_id] = useState(null);
  const [file, setFile] = useState(false);
  const [rights,setRights]=useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [popupConfig, setPopupConfig] = useState({visible: false,type: "success", title: "",message: "",});
  const MAX_SINGLE_FILE_KB = 200;
  useEffect(() => {
    const loadToken = async () => {
      const t = await AsyncStorage.getItem("authToken");
      const employee_id=await AsyncStorage.getItem("employee_id");
      setRights( JSON.parse(await AsyncStorage.getItem("rights")))
      setToken(t);
      if(employee_id){
      setEmployee_id(employee_id);
      }
      // console.log("TOKEN LOADED:", t);
    };
    loadToken();
  }, []);
 

  const showPopup = (type, title, message) => {
    setPopupConfig({
      visible: true,
      type,
      title,
      message,
    });
  };
  const pickDocument = async () => {
    // console.log(field,"field");

    try {
      const file = await PdfPicker.pickFile();
       if (!file) return;
      const fileSizeKB = file.size / 1024;
      
            if (fileSizeKB > MAX_SINGLE_FILE_KB) {
              Alert.alert(
                "File Too Large",
                `File must be less than ${MAX_SINGLE_FILE_KB} KB`
              );
              return;
            }
      let extractedName = "Unknown File";
      if (file.uri) {
        const parts = file.uri.split("/");
        extractedName = parts[parts.length - 1];
      }
      const fileObj = {
        name: extractedName,
        uri: file.uri,
        type: file.type,
        size: file.size,
      };
      setFile(fileObj);

    } catch (error) {
      showPopup("error", "File picking cancelled or failed", error);
      // console.log("File picking cancelled or failed", error);
    }
  };





  const formatDate = (isoString) => {
    const date = new Date(isoString);
    const options = { month: "short", day: "2-digit" };
    return date.toLocaleDateString("en-US", options);
  };

  const capitalize = (str) => {
    if (!str) return "";
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  };



  useEffect(() => {
    fetchClaimsData();
  }, [token]);

  const fetchClaimsData = async () => {
    // console.log("Expense", token)
    if (!token) return;
    try {
      // const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiNjhhODBjZTVkN2M1ZDkwMDFiYWMzOWE0IiwidXNlcl9lbWFpbCI6IiIsImNvcnBvcmF0ZV9pZCI6IlZCTCIsInVzZXJpZCI6IlRFU1QwMjEiLCJmaXJzdF9uYW1lIjoiU3VqaXRhIiwibGFzdF9uYW1lIjoia3VtYXIgRGFzIiwidXNlcl90eXBlIjoiZW1wbG95ZWUiLCJpYXQiOjE3NjE4MDI5NzIsImV4cCI6MTc5MzMzODk3Mn0.SNqI6EjWD_yi9MRwaFsE1lfgRbsn_twKxW0cTw5rvsg";
      // const token =  getToken();
      // Alert.alert("token",token);
      const payload = {
        pageno: 1,
        type: 'reimbursement',
      };
      const response = await axios.post(
        `${API_BASE_URL}employee/get-extra-earning`,
        payload,
        {
          headers: {
            "x-access-token": token,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.status === "success") {
        const docs = response.data.data.docs || [];
        // Alert.alert("apisuccess");
        // transform data to match your UI
        // console.log("docsexpense",docs
        // );
        
        const formattedData = docs.map((item) => ({
          id: item._id,
          date: formatDate(item.created_at),
          type: item.head_id || "N/A",
          amount: `${item.amount}`,
          status: capitalize(item.status),
           wage_month: item.wage_month,
          wage_year: item.wage_year,
        }));

        setClaimsData(formattedData);
      } else {
        showPopup("error", "Error", response.data.message || "Failed to load data");
      }
    } catch (error) {
      if (error.response) {
        showPopup("error", "Server Error", JSON.stringify(error.response.data));
      } else if (error.request) {
        showPopup("error", "Network Error", "No response from backend.");
      } else {
        showPopup("error", "Error", error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      if (!token) {
        showPopup("error", "Error", "Token not found");
        return;
      }
      // console.log(employee_id,"employee_id");
      
      const formData = new FormData();
      formData.append("employee_id",employee_id)
      formData.append("head_id", headId);
      formData.append("amount", amount);
      formData.append("remark", remark);
      formData.append("wage_month", month);
      formData.append("wage_year", year);
      formData.append("type", "reimbursement");
      
      if (file) {
         formData.append("expense_document", {
        uri: file.uri,
        name: file.name,
        type: file.type || "application/octet-stream",
      });
      }

      const response = await axios.post(
        `${API_BASE_URL}employee/add-extra-earning-data`,
        formData,
        {
          headers: {
            "x-access-token": token,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      // console.log("API Response:", response.data);

      if (response.data.status === "success") {
        showPopup("success", "Success", response.data.message);
        setModalVisible(false);
        setHeadId('');
        setAmount('');
        setRemark('');
        setFile('');
        setMonth("");
        setYear("");
        fetchClaimsData();
      } else {
        showPopup("error", "Error", response.data.message);
      }

    } catch (error) {
      showPopup("error", "Upload Failed",  error.message);
    }
  };
  const route = useRoute();
  const screenTitle = route.params?.title;
  const toggleExpand = (id) => {
  setExpandedId(prev => (prev === id ? null : id));
};
  return (
    <LinearGradient
      colors={["#000000ff", "#1c68beff"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
    <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
       <View style={styles.header}>
         <Image
             source={require("../assets/Expance_Management.png")}
             style={styles.header_iconImage}
           />
          <Navbar title={screenTitle} />
        </View>


     

   
      {/* {activeTab === "previous" && (
        <>

          <View style={styles.sectionHeader}>
            <Text style={[GlobalFont.semiBold,styles.sectionTitle]}>Previous Claims</Text>
          
            <TouchableOpacity
              style={styles.newClaimBtn}
              onPress={() => setModalVisible(true)}
            >
              <Text style={[GlobalFont.semiBold,styles.newClaimText]}>File New Claim</Text>
            </TouchableOpacity>
          </View>


        
          {loading ? (
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
              <Text style={[GlobalFont.CustomFont]}>Loading...</Text>
            </View>
          ) : claimsData.length === 0 ? (
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
              <Text style={[GlobalFont.CustomFont]}>No claims found</Text>
            </View>
          ) : (
            <ScrollView style={styles.list}>
              {claimsData.map((item) => (
                <View key={item.id} style={styles.expenseCard}>
                  <Text style={[GlobalFont.CustomFont,styles.expenseTitle]}>{item.type}</Text>

                  <View style={styles.amountTag}>
                    <Text style={[GlobalFont.semiBold,styles.amountText]}>₹ {item.amount}</Text>
                  </View>

               
                </View>
              ))}
            </ScrollView>
          )}
        </>
      )} */}
      {activeTab === "status" && (
        <>
          <View style={styles.sectionHeader}>
            {/* <Text style={[GlobalFont.semiBold,styles.sectionTitle]}>Previous Claims</Text> */}
            {/* <TouchableOpacity style={styles.newClaimBtn}>
              <Text style={styles.newClaimText}>File New Claim</Text>
            </TouchableOpacity> */}
            <TouchableOpacity
              style={styles.newClaimBtn}
              onPress={() => setModalVisible(true)}
            >
              <Text style={[GlobalFont.semiBold,styles.newClaimText]}>File New Claim</Text>
            </TouchableOpacity>
          </View>
           <View style={styles.tabContainer}>
        {/* <TouchableOpacity
          style={[styles.tab, activeTab === "previous" && styles.activeTab]}
          onPress={() => setActiveTab("previous")}
        >
          <Text
            style={
              [GlobalFont.CustomFont,
              activeTab === "previous"
                ? styles.activeTabText
                : styles.inactiveTabText
            ]}
          >
            Previous Claims
          </Text>
        </TouchableOpacity> */}

        <TouchableOpacity
          style={[styles.tab, activeTab === "status" && styles.activeTab]}
          onPress={() => setActiveTab("status")}
        >
          <Text
            style={
              [GlobalFont.CustomFont,
              activeTab === "status"
                ? styles.activeTabText
                : styles.inactiveTabText
            ]}
            
          >
            Claim Status
          </Text>
        </TouchableOpacity>
      </View>
          {/* <ScrollView style={styles.list}>
            {claimsData.map((item, index) => (
              <View key={index} style={styles.expenseCard}>
                <Text style={styles.expenseTitle}>{item.type}</Text>
                <View style={styles.amountTag}>
                  <Text style={styles.amountText}>₹ {item.amount}</Text>
                </View>
              </View>
            ))}
          </ScrollView> */}
          {loading ? (
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
              <Text style={[GlobalFont.CustomFont]}>Loading...</Text>
            </View>
          ) : claimsData.length === 0 ? (
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
              <Text style={[GlobalFont.CustomFont]}>No claims found</Text>
            </View>
          ) : (
            <ScrollView style={styles.list}>
                    {claimsData.map((item) => {
                      const isExpanded = expandedId === item.id;

                      return (
                        <View key={item.id} style={styles.expenseCard}>

                          <TouchableOpacity
                            style={styles.cardHeaderRow}
                            onPress={() => toggleExpand(item.id)}
                            activeOpacity={0.8}
                          >
                            <Text style={[GlobalFont.semiBold, styles.idText]}>
                              {item.type}
                            </Text>
                            <View style={styles.amountTag}>
                            <Text style={styles.amountCenter}>
                              ₹ {item.amount}
                            </Text>
                            </View>
                            <Icon
                              name={isExpanded ? "chevron-up" : "chevron-down"}
                              size={20}
                              color="#ccc"
                            />
                          </TouchableOpacity>

                          {isExpanded && (
                            <View style={styles.expandSection}>
                              <View style={styles.rowItem}>
                                <Text style={styles.label}>Wage Month</Text>
                                <Text style={styles.value}>
                                  {monthName(Number(item.wage_month))} {item.wage_year}
                                </Text>
                              </View>

                              <View style={styles.rowItem}>
                                <Text style={styles.label}>Applied Date</Text>
                                <Text style={styles.value}>{item.date}</Text>
                              </View>

                              <View style={styles.rowItem}>
                                <Text style={styles.label}>Status</Text>
                                <Text
                                  style={[
                                    styles.value,
                                    {
                                      color:
                                        item.status?.toLowerCase() === "active"
                                          ? "#4ADE80"   
                                          : item.status?.toLowerCase() === "rejected"
                                            ? "#fa7171"   
                                            : "#FACC15",  
                                    },
                                  ]}
                                >
                                  {item.status?.toLowerCase() === "active"
                                    ? "Approved"
                                    : item.status}
                                </Text>
                              </View>
                            </View>
                          )}
                        </View>
                      );
                    })}
            </ScrollView>
          )}


        </>
      )}
      <View>
        <Modal
          visible={modalVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.overlay}>
            <LinearGradient
              colors={["#00213F", "#002C56"]}
              style={styles.modalContainer}
            ><ScrollView style={styles.formContainer}>
              <View style={styles.modalHeader}>
                <Text style={[GlobalFont.semiBold,styles.modalTitle]}>Enter the following details</Text>
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                  <Text style={styles.closeBtn}>✖</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.formContainer}>
                
                <TextInput
                  placeholder="Head ID"
                  value={headId}
                  onChangeText={setHeadId}
                  style={[GlobalFont.CustomFont,{ borderWidth: 1, marginBottom: 10, padding: 8, color: "#fff", borderColor: "#fff" }]}
                  placeholderTextColor="#fff"
                    />
                    <TextInput
                      placeholder="Amount"
                      value={amount}
                      // onChangeText={setAmount}
                      onChangeText={(text) => {
                        const numericText = text.replace(/[^0-9.]/g, "");
                        setAmount(numericText);
                      }}
                      keyboardType="decimal-pad"
                      style={[GlobalFont.CustomFont, { borderWidth: 1, marginBottom: 10, padding: 8, color: "#fff", borderColor: "#fff" }]}
                      placeholderTextColor="#fff"
                />
                <TextInput
                  placeholder="Reason"
                  value={remark}
                  onChangeText={setRemark}
                  style={[GlobalFont.CustomFont,{ borderWidth: 1, marginBottom: 10, padding: 8, color: "#fff", borderColor: "#fff" }]}
                  placeholderTextColor="#fff"
                />
                <View style={styles.row}>
                  <View style={styles.halfPicker}>
                    <Text style={[GlobalFont.CustomFont,styles.label]}>Month:</Text>
                    <Picker
                      selectedValue={month}
                      onValueChange={setMonth}
                      style={styles.picker}
                      dropdownIconColor="#fff"
                    >
                      <Picker.Item label="Select" value="" />
                      <Picker.Item label="Jan" value="0" />
                      <Picker.Item label="Feb" value="1" />
                      <Picker.Item label="Mar" value="2" />
                      <Picker.Item label="Apr" value="3" />
                      <Picker.Item label="May" value="4" />
                      <Picker.Item label="June" value="5" />
                      <Picker.Item label="July" value="6" />
                      <Picker.Item label="Aug" value="7" />
                      <Picker.Item label="Sep" value="8" />
                      <Picker.Item label="Oct" value="9" />
                      <Picker.Item label="Nov" value="10" />
                      <Picker.Item label="Dec" value="11" />
                    </Picker>
                  </View>
                  <View style={styles.halfPicker}>
                    <Text style={[GlobalFont.CustomFont,styles.label]}>Year:</Text>
                    <Picker
                      selectedValue={year}
                      onValueChange={setYear}
                      style={styles.picker}
                      dropdownIconColor="#fff"
                    >
                      <Picker.Item label="Select" value="" />
                      <Picker.Item label="2024" value="2024" />
                      <Picker.Item label="2025" value="2025" />
                      <Picker.Item label="2026" value="2026" />
                      <Picker.Item label="2027" value="2027" />
                    </Picker>
                  </View>



                </View>
                <Text style={[GlobalFont.semiBold,styles.label1]}>Upload Image:</Text>
                
                    {/* <View style={styles.imageUploadContainer}>
                  <Text style={[GlobalFont.CustomFont,{ color: "#ccc", marginBottom: 10 }]}>
                    {image ? image.name : "No file selected"}
                  </Text>

                  <TouchableOpacity style={styles.uploadBtn} onPress={pickDocument}>
                    <Text style={[GlobalFont.bold,styles.uploadBtnText]}>Choose Image</Text>
                  </TouchableOpacity>
                </View> */}
                    <View style={styles.imageUploadContainer}>
                      {file ? (
                        <Image
                          source={{ uri: file.uri }}
                          style={{ width: "100%", height: 150, resizeMode: "contain", marginBottom: 10 }}
                        />
                      ) : (
                        <Text style={[GlobalFont.CustomFont, { color: "#ccc", marginBottom: 10 }]}>
                          No file selected
                        </Text>
                      )}

                      <TouchableOpacity style={styles.uploadBtn} onPress={pickDocument}>
                        <Text style={[GlobalFont.bold, styles.uploadBtnText]}>Choose Image</Text>
                      </TouchableOpacity>
                    </View>
                <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
                  <Text style={[GlobalFont.CustomFont,styles.submitText]}>Submit</Text>
                </TouchableOpacity>
              </View>
              </ScrollView>
            </LinearGradient>
          </View>
        </Modal>
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
      </SafeAreaView>
      <BottomNavigation rights={rights}/>
    </LinearGradient>
  );
};
function monthName(monthNo) {
  const months = [
    "Jan","Feb","Mar","Apr","May","Jun",
    "Jul","Aug","Sep","Oct","Nov","Dec"
  ];

  const index = Number(monthNo); // convert safely

  return months[index] || "";
}
export default Expense;

// const styles = StyleSheet.create({
//     container: {
//     flex: 1,
//     padding: 15,
//   },
//   header: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     // marginBottom: 10,
//     marginLeft:-18
//   },
//   headerLeft: {
//     flexDirection: "row",
//     alignItems: "center",
//   },
//   headerText: {
//     color: "#fff",
//     fontSize: 18,
//     fontWeight: "600",
//     marginLeft: 8,
//   },
//   headerRight: {
//     flexDirection: "row",
//     alignItems: "center",
//   },
//   icon: {
//     marginRight: 16,
//   },
//   notificationWrapper: {
//     position: "relative",
//   },
//   notificationDot: {
//     position: "absolute",
//     top: -3,
//     right: -3,
//     width: 8,
//     height: 8,
//     backgroundColor: "red",
//     borderRadius: 4,
//   },
//   tabContainer: {
//     flexDirection: "row",
//     marginTop: 25,
//     backgroundColor: "rgba(255,255,255,0.1)",
//     borderRadius: 15,
//     padding: 4,
//     width:340,
//     marginLeft:-20
//   },
//   tab: {
//     flex: 1,
//     paddingVertical: 10,
//     borderRadius: 12,
//     alignItems: "center",
//   },
//   activeTab: {
//     backgroundColor: "#0D213A",
//   },
//   activeTabText: {
//     color: "#fff",
//     fontWeight: "500",
//   },
//   inactiveTabText: {
//     color: "#bbb",
//   },
//   sectionHeader: {
//     marginTop: 25,
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//   },
//   sectionTitle: {
//     color: "#fff",
//     fontSize: 15,
//     fontWeight: "600",
//     marginLeft:-10
//   },
//   newClaimBtn: {
//     backgroundColor: "rgba(255,255,255,0.2)",
//     borderRadius: 12,
//     paddingHorizontal: 16,
//     paddingVertical: 6,
//     left:20
//   },
//   newClaimText: {
//     color: "#fff",
//     fontWeight: "500",
//   },
//   list: {
//     marginTop: 15,
//   },
//   expenseCard: {
//     backgroundColor: "rgba(255,255,255,0.1)",
//     borderRadius: 14,
//     flexDirection: "row",
//     justifyContent: "space-between",
//     padding: 16,
//     marginBottom: 10,
//   },
//   expenseTitle: {
//     color: "#fff",
//     fontSize: 15,
//     fontWeight: "500",
//   },
//   amountTag: {
//     backgroundColor: "rgba(255,255,255,0.1)",
//     borderRadius: 8,
//     paddingHorizontal: 12,
//     paddingVertical: 4,
//   },
//   amountText: {
//     color: "#fff",
//     fontWeight: "600",
//   },

//   formContainer: {
//     maxHeight: "75%",
//   },
//   overlay: {
//     flex: 1,
//     backgroundColor: "rgba(0,0,0,0.6)",
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   modalContainer: {
//     width: "90%",
//     borderRadius: 20,
//     padding: 20,
//     maxHeight: "85%",
//   },
//   modalHeader: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     // marginBottom: 10,
//     borderBottomWidth: 1,
//     borderBottomColor: "#fff",
//     paddingBottom: 8,
//   },
//   modalTitle: {
//     color: "#fff",
//     fontSize: 16,
//     fontWeight: "600",
//   },
//   closeBtn: {
//     color: "red",
//     fontSize: 20,
//     fontWeight: "bold",
//   },
//   label: {
//     color: "#fff",
//     marginTop: 10,
//     marginBottom: 4,
//   },
//   input: {
//     backgroundColor: "rgba(255,255,255,0.1)",
//     borderRadius: 10,
//     padding: 10,
//     color: "#fff",
//     marginLeft: "-20px"
//   },
//   picker: {
//     backgroundColor: "rgba(255,255,255,0.1)",
//     color: "#fff",
//     height: 50,
//     // borderRadius: 10,
//     // marginBottom: 10,
//   },
//   row: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//   },
//   halfPicker: {
//     flex: 0.48,
//   },
//   submitBtn: {
//     backgroundColor: "#3B82F6",
//     borderRadius: 10,
//     paddingVertical: 10,
//     marginTop: 20,
//   },
//   submitText: {
//     color: "#fff",
//     textAlign: "center",
//     fontWeight: "bold",
//   },

//   imageUploadContainer: {
//     alignItems: "center",
//     marginVertical: 15,
//   },

//   uploadBtn: {
//     backgroundColor: "#004B8D",
//     paddingVertical: 10,
//     paddingHorizontal: 20,
//     borderRadius: 10,
//   },

//   uploadBtnText: {
//     color: "#fff",
//     fontSize: 14,
//     fontWeight: "bold",
//   },


// });
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding:7
    // paddingHorizontal: 16,
  },

   header: {
    flexDirection:"row",
    width: "100%",
    marginBottom: 12,
    alignItems:"center",
    gap:5
  },
   header_iconImage: {
    width: 35,
    padding:20,
    height: 20,
    marginLeft: -5,
  },

  tabContainer: {
    flexDirection: "row",
    marginTop: 20,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 15,
    padding: 4,
    width: "100%",
    margin:"auto"
  },

  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: "center",
  },

  activeTab: {
    backgroundColor: "#0D213A",
  },

  activeTabText: {
    color: "#fff",
    fontWeight: "500",
  },

  inactiveTabText: {
    color: "#bbb",
  },

  sectionHeader: {
    marginTop: 20,
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    // margin:"auto"
  },

  sectionTitle: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
  },

  newClaimBtn: {
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 6,
    
  },

  newClaimText: {
    color: "#fff",
    fontWeight: "500",
  },

  list: {
    marginTop: 15,
    flexGrow: 1,
  },

  // expenseCard: {
  //   backgroundColor: "rgba(255,255,255,0.1)",
  //   borderRadius: 14,
  //   flexDirection: "row",
  //   justifyContent: "space-between",
  //   alignItems: "center",
  //   padding: 14,
  //   gap:7,
  //   marginBottom: 10,
  // },

  expenseTitle: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "500",
    flex: 1,
    marginRight: 10,
  },

  amountTag: {
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },

  amountText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 13,
  },

  dateText: {
    color: "#ccc",
    fontSize: 12,
    marginTop: 4,
  },

  statusText: {
    color: "#fff",
    fontSize: 12,
    marginTop: 2,
  },

  /* ---------- MODAL ---------- */

  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },

  modalContainer: {
    width: "100%",
    borderRadius: 20,
    padding: 20,
    maxHeight: "90%",
  },

  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#fff",
    paddingBottom: 8,
    marginBottom: 10,
  },

  modalTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    flex: 1,
  },

  closeBtn: {
    color: "red",
    fontSize: 20,
    fontWeight: "bold",
    marginLeft: 10,
  },

  formContainer: {
    flexGrow: 1,
  },

  label1: {
    color: "#fff",
    marginTop: 10,
    marginBottom: 4,
    fontSize: 15,
  },

  picker: {
    backgroundColor: "rgba(255,255,255,0.1)",
    color: "#fff",
    height: 48,
    borderRadius: 8,
  },

  row: {
    flexDirection: "row",
    gap: 10,
  },

  halfPicker: {
    flex: 1,
  },

  submitBtn: {
    backgroundColor: "#3B82F6",
    borderRadius: 10,
    paddingVertical: 12,
    marginTop: 20,
  },

  submitText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 14,
  },

  imageUploadContainer: {
    alignItems: "center",
    marginVertical: 15,
  },

  uploadBtn: {
    backgroundColor: "#004B8D",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  },

  uploadBtnText: {
    color: "#fff",
    fontSize: 15,
    // fontWeight: "bold",
  },
  expenseCard: {
  backgroundColor: "rgba(255,255,255,0.08)",
  borderRadius: 16,
  marginBottom: 12,
  overflow: "hidden",
},

/* HEADER ROW */
cardHeaderRow: {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  padding: 16,
},

idText: {
  color: "#fff",
  fontSize: 14,
  flex: 1,
},

amountCenter: {
  color: "#fff",
  fontSize: 14,
  fontWeight: "600",
  textAlign: "center",
  flex: 1,
},

/* EXPAND SECTION */
expandSection: {
  borderTopWidth: 1,
  borderTopColor: "rgba(255,255,255,0.1)",
  padding: 12,
  backgroundColor: "rgba(255,255,255,0.03)",
},

rowItem: {
  flexDirection: "row",
  justifyContent: "space-between",
  marginBottom: 6,
},

label: {
  color: "#aaa",
  fontSize: 12,
},

value: {
  color: "#fff",
  fontSize: 13,
  fontWeight: "500",
},
});
