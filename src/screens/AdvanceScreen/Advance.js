import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Image,
  Alert,
  ScrollView,
  Dimensions,
  ActivityIndicator
} from "react-native";
import { useRoute } from "@react-navigation/native";
import Navbar from "../Dashboardscreen/navbar"
import Icon from "react-native-vector-icons/Ionicons";
import LinearGradient from "react-native-linear-gradient";
import BottomNavigation from "../BottomNavigation";
import { Picker } from "@react-native-picker/picker";
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from "axios";
import { API_BASE_URL } from "@env";
import { useNavigation } from '@react-navigation/native';
import { NativeModules } from "react-native";
const { PdfPicker } = NativeModules;
const { width } = Dimensions.get("window");
import StatusPopup from "../StatusPopup/StatusPopup";
import GlobalFont from "../../theme/GlobalFont";
const AdvanceManagement =() => {
  const progress = 0.75;
  const navigation = useNavigation();
  const [modalVisible, setModalVisible] = useState(false);
  const [advanceAmount, setAdvanceAmount] = useState("");
  const [recoveryFrom, setRecoveryFrom] = useState("");
  const [installments, setInstallments] = useState("03");
  const [frequency, setFrequency] = useState("");
  const [month, setMonth] = useState("September");
  const [year, setYear] = useState("2025");
  const [reason, setReason] = useState("");
  const [advanceList, setAdvanceList] = useState([]);
  const [token, setToken] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState(false);
  const [percentage, setPercentage] = useState(0);
  const [prog, setProgress] = useState(0);
  const [popupConfig, setPopupConfig] = useState({visible: false,type: "success", title: "",message: "",});
  const [rights,setRights]=useState(false);
  useEffect(() => {
    const loadToken = async () => {
      const t = await AsyncStorage.getItem("authToken");
     
      setToken(t);
       const storedProgress =await AsyncStorage.getItem("progress");
      const storedpercentage =await AsyncStorage.getItem("percentage");
      const Progress = storedProgress? JSON.parse(storedProgress): 0;
      const percentage = storedpercentage? JSON.parse(storedpercentage): 0;
      setPercentage(percentage);
      setProgress(Progress);
      setRights( JSON.parse(await AsyncStorage.getItem("rights")))
      console.log("TOKEN LOADED:", t);
    };
    loadToken();
  }, []);

  const fetchAdvanceList = async () => {
    // console.log("Advancepage", token)
    if (!token) return;
    console.log("Advancepage1")
    try {
      // const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiNjhhODBjZTVkN2M1ZDkwMDFiYWMzOWE0IiwidXNlcl9lbWFpbCI6IiIsImNvcnBvcmF0ZV9pZCI6IlZCTCIsInVzZXJpZCI6IlRFU1QwMjEiLCJmaXJzdF9uYW1lIjoiU3VqaXRhIiwibGFzdF9uYW1lIjoia3VtYXIgRGFzIiwidXNlcl90eXBlIjoiZW1wbG95ZWUiLCJpYXQiOjE3NjE4MDI5NzIsImV4cCI6MTc5MzMzODk3Mn0.SNqI6EjWD_yi9MRwaFsE1lfgRbsn_twKxW0cTw5rvsg";
      const payload = {
        pageno: 1,
      };
      // const res = await axios.post("http://10.0.2.2:8080/employee/employee-get-advance-list",
      const res = await axios.post(`${API_BASE_URL}employee/employee-get-advance-list`,
        payload,
        {
          headers: {
            "x-access-token": token,
            "Content-Type": "application/json",
          },
        });

      if (res.data?.status === "success") {
        console.log(res.data,"res.data");
        
        setAdvanceList(res.data.advance_data.docs || []);
      }
    } catch (error) {
      console.log("Advance list error:", error);
    }
  };


  useEffect(() => {
    fetchAdvanceList();
  }, [token]);

  const currentAdvance = advanceList.length > 0 ? advanceList[0] : null;

  const pickDocument = async () => {
    // console.log(field,"field");

    try {
      const file = await PdfPicker.pickFile();
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
      console.log("File picking cancelled or failed", error);
    }
  };

  const showPopup = (type, title, message) => {
    setPopupConfig({
      visible: true,
      type,
      title,
      message,
    });
  };

  const submitAdvanceRequest = async () => {
    if (!token) return;
    try {
      if (!advanceAmount || !installments || !frequency || !month || !year || !recoveryFrom) {
        showPopup("error", "Error", "Please fill all required fields.");
        // Alert.alert("Error", "Please fill all required fields.");
        return;
      }
      const monthMap = {
        January: 1, February: 2, March: 3, April: 4,
        May: 5, June: 6, July: 7, August: 8,
        September: 9, October: 10, November: 11, December: 12,
      };

      const startMonthNum = monthMap[month];


      const emi = Number(advanceAmount) / Number(installments);

      let instalment_history = [];
      let currentMonth = startMonthNum;
      let currentYear = Number(year);

      for (let i = 0; i < Number(installments); i++) {
        instalment_history.push({
          advance_amount: emi.toFixed(2),
          instalment_month: currentMonth,
          instalment_year: currentYear,
          payment_status: "pending",
          recovery_from: recoveryFrom,
          // balance_amount: emi.toFixed(2),

        });

        currentMonth++;
        if (currentMonth > 12) {
          currentMonth = 1;
          currentYear++;
        }
      }


      // const payload = {
      //   advance_amount: advanceAmount,
      //   advance_outstanding: advanceAmount,
      //   no_of_instalments: installments,
      //   recovery_frequency: frequency,
      //   recovery_from: recoveryFrom,
      //   payment_start_month: startMonthNum.toString(),
      //   payment_start_year: year,
      //   upload_file:file,
      //   instalment_history,
      //   remarks: reason || "",
      // };
      // console.log(API_BASE_URL,"API_BASE_URL");

      // console.log("Payload =>", payload, "token", token);
      const formData = new FormData();

      formData.append("advance_amount", advanceAmount);
      formData.append("advance_outstanding", advanceAmount);
      formData.append("no_of_instalments", installments);
      formData.append("recovery_frequency", frequency);
      formData.append("recovery_from", recoveryFrom);
      formData.append("payment_start_month", startMonthNum.toString());
      formData.append("payment_start_year", year);
      formData.append("remarks", reason || "");
      formData.append(
        "instalment_history",
        JSON.stringify(instalment_history)
      );

      if (file) {
        formData.append("upload_file", {
          uri: file.uri,
          name: file.name,
          type: file.type,
        });
      }
      // console.log(formData,"formdata");

      // const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiNjhhODBjZTVkN2M1ZDkwMDFiYWMzOWE0IiwidXNlcl9lbWFpbCI6IiIsImNvcnBvcmF0ZV9pZCI6IlZCTCIsInVzZXJpZCI6IlRFU1QwMjEiLCJmaXJzdF9uYW1lIjoiU3VqaXRhIiwibGFzdF9uYW1lIjoia3VtYXIgRGFzIiwidXNlcl90eXBlIjoiZW1wbG95ZWUiLCJpYXQiOjE3NjE4MDI5NzIsImV4cCI6MTc5MzMzODk3Mn0.SNqI6EjWD_yi9MRwaFsE1lfgRbsn_twKxW0cTw5rvsg";
      const response = await axios.post(`${API_BASE_URL}employee/employee-advance-request`,
        formData,
        {
          headers: {
            "x-access-token": token,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      // const data = await response.json();
      const data = response.data;

      console.log("API Response for advance:", data);

      if (data.status === "success") {
        showPopup("success", "Success",  "Advance request submitted");
        // Alert.alert("Success", "Advance request submitted");
        fetchAdvanceList();
        setModalVisible(false);
      } else {
        showPopup("error", "Error",  data.message || "Something went wrong");
        // Alert.alert("Error", data.message || "Something went wrong");
      }

    } catch (err) {
      // console.log(err);
       showPopup("error", "Error",  "Failed to submit advance request");
      // Alert.alert("Error", "Failed to submit advance request");
    }
  };
  const isFutureDate = (date) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const targetDate = new Date(date);
  targetDate.setHours(0, 0, 0, 0);

  return targetDate > today;
};


  const route = useRoute();
  const screenTitle = route.params?.title;
  const upcomingList = advanceList.filter(item =>
  isFutureDate(item.created_at)
);

  return (
    <LinearGradient
                colors={["#000000ff", "#1c68beff"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.container}
              >
      <ScrollView contentContainerStyle={styles.scrollContainer}>

        <View style={styles.header}>
          <Image
              source={require("../../assets/Advance_management.png")}
              style={styles.header_iconImage}
            />
          <Navbar title={screenTitle} />
        </View>
        {/* <View style={styles.dropdownRow}>
          <TouchableOpacity style={styles.dropdown}>
            <Text style={styles.dropdownText}>September</Text>
            <Icon name="chevron-down" color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.dropdown}>
            <Text style={styles.dropdownText}>2025</Text>
            <Icon name="chevron-down" color="#fff" />
          </TouchableOpacity>
        </View> */}

        <View style={styles.overviewHeader}>
          <Text style={styles.sectionTitle}>Advance Overview</Text>
          <View style={styles.container1}>
            <TouchableOpacity
              style={styles.addBtn}
              onPress={() => setModalVisible(true)}
            >
              <Text style={styles.addBtnText}>+ Advance Request</Text>
            </TouchableOpacity>


            <Modal visible={modalVisible} transparent animationType="fade">
              <View style={styles.overlay}>
                <View style={styles.modalBox}>
                <ScrollView style={styles.formContainer}>
                  <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>Enter the following details</Text>
                    <TouchableOpacity onPress={() => setModalVisible(false)}>
                      <Text style={styles.closeBtn}>✖</Text>
                    </TouchableOpacity>
                  </View>

                  <View style={styles.field}>
                    <Text style={styles.label}>Advance Amount :</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Enter amount"
                      placeholderTextColor="#ccc"
                      keyboardType="numeric"
                      value={advanceAmount}
                      onChangeText={setAdvanceAmount}
                    />
                  </View>

                  <View style={styles.field}>
                    <Text style={styles.label}>Recovery From :</Text>
                    <View style={styles.pickerWrapper}>
                      <Picker
                        selectedValue={recoveryFrom}
                        onValueChange={setRecoveryFrom}
                        dropdownIconColor="#fff"
                        style={styles.picker}
                      >
                        <Picker.Item label="Select One" value="" style={styles.options}/>
                        <Picker.Item label="Annual Earning" value="salary" style={styles.options}/>
                        <Picker.Item label="Reimbursement" value="reimbursement" style={styles.options}/>
                        <Picker.Item label="Incentive" value="incentive" style={styles.options}/>
                        <Picker.Item label="Gross Earning" value="gross_earning" style={styles.options}/>
                        <Picker.Item label="Bonus" value="bonus" style={styles.options}/>

                      </Picker>
                    </View>
                  </View>

                  <View style={styles.field}>
                    <Text style={styles.label}>No. of Installments :</Text>
                    <TextInput
                      style={styles.input}
                      keyboardType="numeric"
                      value={installments}
                      onChangeText={setInstallments}
                    />
                  </View>

                  <View style={styles.field}>
                    <Text style={styles.label}>Recovery Frequency :</Text>
                    <View style={styles.pickerWrapper}>
                      <Picker
                        selectedValue={frequency}
                        onValueChange={setFrequency}
                        dropdownIconColor="#fff"
                        style={styles.picker}
                      >
                        <Picker.Item label="Select One" value="" />
                        <Picker.Item label="Monthly" value="monthly" />
                        <Picker.Item label="Quaterly" value="quaterly" />
                        <Picker.Item label="Half Yearly" value="halfYearly" />
                        <Picker.Item label="Annually" value="annually" />

                      </Picker>
                    </View>
                  </View>


                  <View style={styles.row}>
                    <View style={styles.column}>
                      <Text style={styles.label}>Month :</Text>
                      <View style={styles.pickerWrapper}>
                        <Picker
                          selectedValue={month}
                          onValueChange={setMonth}
                          dropdownIconColor="#fff"
                          style={styles.picker}
                        >
                          <Picker.Item label="September" value="September" />
                          <Picker.Item label="October" value="October" />
                          <Picker.Item label="November" value="November" />
                        </Picker>
                      </View>
                    </View>

                    <View style={styles.column}>
                      <Text style={styles.label}>Year :</Text>
                      <View style={styles.pickerWrapper}>
                        <Picker
                          selectedValue={year}
                          onValueChange={setYear}
                          dropdownIconColor="#fff"
                          style={styles.picker}
                        >
                          <Picker.Item label="2025" value="2025" />
                          <Picker.Item label="2026" value="2026" />
                        </Picker>
                      </View>
                    </View>
                  </View>
                  <View style={styles.titleRow}>
                    <Text style={styles.sectionTitle}>Uploaded Document</Text>

                    <TouchableOpacity style={styles.uploadBtn} onPress={() => pickDocument()}>
                      <Text style={[GlobalFont.CustomFont,styles.uploadText]}>Upload File</Text>
                    </TouchableOpacity>
                  </View>
                  {uploading && (
                    <View style={styles.loaderOverlay}>
                      <ActivityIndicator size="large" color="#fff" />
                      <Text style={{ color: "white", marginTop: 5 }}>Uploading...</Text>
                    </View>
                  )}
                  <View style={styles.field}>
                    <Text style={styles.label}>Reason :</Text>
                    <TextInput
                      style={[styles.input, { height: 80, textAlignVertical: "top" }]}
                      multiline
                      placeholder="Enter reason"
                      placeholderTextColor="#ccc"
                      value={reason}
                      onChangeText={setReason}
                    />
                  </View>


                  <TouchableOpacity
                    style={styles.submitBtn}
                    onPress={() => {
                      setModalVisible(false);
                      submitAdvanceRequest();
                    }}
                  >
                    <Text style={[GlobalFont.semiBold,styles.submitText]}>Submit</Text>
                  </TouchableOpacity>
                  </ScrollView>
                </View>
              </View>
            </Modal>
          </View>
        </View>
        <View style={styles.overviewBox}>
          <Text style={styles.percentage}>{percentage}%</Text>
          <View style={styles.progressRow}>
            
            <View style={styles.progressBarContainer}>
              <View style={styles.progressBarBackground}>
                <View
                  style={[
                    styles.progressBarFill,
                    { width: `${prog * 100}%` }
                  ]}
                />
              </View>
            </View>

            
          </View>
          <View style={[styles.progressFill, {
            width: currentAdvance ? `${(currentAdvance.advance_recovered / currentAdvance.advance_amount) * 100}%` : "0%"
          }]} />

          <View style={styles.amountRow}>
            <Text style={[GlobalFont.CustomFont,styles.amountLabel1]}>
              ₹{currentAdvance?.advance_amount || 0}{"\n"}
              <Text style={[GlobalFont.CustomFont,styles.amountSub]}>Total Advance</Text>
            </Text>

            <Text style={styles.amountLabel2}>
              ₹{currentAdvance?.advance_outstanding || 0}{"\n"}
              <Text style={[GlobalFont.CustomFont,styles.amountSub]}>Remaining</Text>
            </Text>
          </View>


          <Text style={[GlobalFont.CustomFont,styles.emiText]}>
            EMI: ₹
            {currentAdvance ? (currentAdvance.advance_amount / currentAdvance.no_of_instalments).toFixed(2) : "0.00"}
            / month
          </Text>

        </View>


        <View style={styles.section1}>
          <Text style={styles.sectionTitle1}>Upcoming Deduction</Text>
            {upcomingList.length === 0 && (
                <Text style={styles.noDataText}>No data found</Text>
              )}
          {upcomingList.map((item) => (
            <TouchableOpacity
              key={item._id}
              onPress={() => navigation.navigate("AdvanceInstallmentScreen", { data: item })}
              style={styles.card}
            >
             
              <View style={styles.card_inner}>
              <Text style={[GlobalFont.CustomFont,styles.cardDate]}>
                {new Date(item.created_at).toDateString().slice(4, 10)}
              </Text>
              
              <View style={styles.cardRight}>
                <Text style={[GlobalFont.CustomFont,styles.cardAmount]}>₹{item.advance_amount}</Text>
                <Text
                  style={[GlobalFont.CustomFont,
                    styles.status,
                    { color: item.status === "active" ? "#FF4D4D" : "#2ECC71" },
                  ]}
                >
                  {item.status}
                </Text>
              </View>
              </View>
           
            </TouchableOpacity>
          ))}
        </View>


        <View style={styles.section}>
          <Text style={styles.sectionTitle1}>Advance History</Text>

          {advanceList.map((item) => (
            <TouchableOpacity
              key={item._id}
              onPress={() => navigation.navigate("AdvanceInstallmentScreen", { data: item })}
              style={styles.card}
            >
              <View style={styles.card_inner}>
              <Text style={[GlobalFont.CustomFont,styles.cardDate]}>
                {new Date(item.created_at).toDateString().slice(4, 10)}
              </Text>
              
              <View style={styles.cardRight}>
                <Text style={[GlobalFont.CustomFont,styles.cardAmount]}>₹{item.advance_amount}</Text>
                <Text
                  style={[GlobalFont.CustomFont,
                    styles.status,
                    { color: item.status === "active" ? "#FF4D4D" : "#2ECC71" },
                  ]}
                >
                  {item.status}
                </Text>
              </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>


      </ScrollView>
      <StatusPopup
          visible={popupConfig.visible}
          type={popupConfig.type}
          title={popupConfig.title}
          message={popupConfig.message}
          onClose={() =>
            setPopupConfig(prev => ({ ...prev, visible: false }))
          }
        />
      <BottomNavigation rights={rights}/>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 13,
  },
  scrollContainer: {
    // padding: 5,
    top: 15,
    paddingBottom: 60,
  },
  header: {
    flexDirection:"row",
    width: "100%",
    marginBottom: 12,
    alignItems:"center",
    gap:5
  },
    header_iconImage: {
    width: 40,
    padding:21,
    height: 20,
    marginLeft: -7,
  },
  // headerIcons: {
  //   flexDirection: "row",
  //   alignItems: "center",
  // },
  // icon: {
  //   marginRight: 15,
  // },
  // title: {
  //   color: "#fff",
  //   fontSize: 20,
  //   fontWeight: "700",
  // },
  dropdownRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  dropdown: {
    backgroundColor: "rgba(255,255,255,0.1)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 10,
    padding: 12,
    width: "48%",
  },
  dropdownText: {
    color: "#fff",
    fontSize: 16,
    fontFamily:"Outfit-Regular"
  },
  overviewBox: {
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 12,
    padding: 16,
    // marginTop:0,
  },
  overviewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    margin:"auto"
  },
     progressRow: {
      // display:"flex",
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 16,
        width: width *.85
    },
    progressBarContainer: {
        flex: 1,
        marginRight: 16,
    },
    progressBarBackground: {
        width: "100%",
        height: 8,
        backgroundColor: "#0a1929",
        borderRadius: 4,
        overflow: "hidden",
    },
    progressBarFill: {
        height: "100%",
        backgroundColor: "#00d9ff",
        borderRadius: 4,
    },
    percentage: {
        color: "#ffffff",
        fontSize: 15,
        fontWeight: "500",
        minWidth: 50,
        textAlign: "left",
        marginBottom:10
        // right: 30
    },
  addBtn: {
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 6,
    textAlign:"center",
    left: 20
  },
  // addBtnText: {
  //   color: "#fff",
  //   fontWeight: "600",
  //   textAlign: "right"
  // },
  progressText: {
    color: "#fff",
    fontSize: 16,
    marginTop: 16,
  },
  progressBar: {
    backgroundColor: "#1C2C40",
    borderRadius: 10,
    height: 8,
    marginVertical: 8,
  },
  progressFill: {
    backgroundColor: "#00D1FF",
    height: 8,
    borderRadius: 10,
  },
  amountRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: -7,
  },
  amountLabel1: {
    textAlign:"left",
    color: "#fff",
    // fontWeight: "700",
    fontFamily:"Outfit-SemiBold",
    fontSize: 14,
  },
  amountLabel2: {
    textAlign:"right",
    color: "#fff",
    // fontWeight: "700",
    fontFamily:"Outfit-SemiBold",
    fontSize: 14,
  },
  amountSub: {
    color: "#B0C4DE",
    fontSize: 12,
    fontWeight: "400",
  },
  emiText: {
    backgroundColor: "rgba(255,255,255,0.1)",
    color: "#fff",
    borderRadius: 8,
    padding: 8,
    textAlign: "left",
    marginTop: 10,
  },
  section1: {
    marginTop: 10,
  },
  section: {
    marginTop: 10,
    marginBottom:40
  },
  sectionTitle: {
    color: "#fff",
    fontSize: 16,
    // fontWeight: "700",
    // marginBottom: 10,
    fontFamily:"Outfit-SemiBold"
    
  },
  sectionTitle1: {
    color: "#fff",
    fontSize: 16,
    // fontWeight: "700",
    fontFamily:"Outfit-SemiBold",
    marginBottom: 10,
  },
  noDataText: {
  color: "#9CA3AF",
  textAlign: "center",
  marginTop: 10,
  fontSize: 14,
  },

  card: {
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 10,
    padding: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 5,
  },
  card_inner:{
    backgroundColor:"rgba(255,255,255,0.1)",
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding:8,
    // marginLeft:4,
     alignItems: "center",
    borderRadius:8,
    width:width * .885
  },
  cardDate: {
    color: "#fff",
    fontSize: 14,
    marginLeft:5
  },
  cardAmount1: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
  },
  cardAmount: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  cardRight: {
    // alignItems: "flex-end",
    flexDirection:"row",
    justifyContent: "space-between",
    gap:10,
    backgroundColor: "#2c4f70ff",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    // marginLeft: 10,
    width: width*.45
  },
  status: {
    fontSize: 13,
    // marginTop: 3,
    
  },

  container1: { flex: 1, padding: 20 },
  // addBtn: {
  //   backgroundColor: "#3a8fff",
  //   borderRadius: 10,
  //   alignSelf: "flex-end",
  //   paddingVertical: 8,
  //   paddingHorizontal: 16,
  // },
  addBtnText: { color: "#fff",fontFamily:"Outfit-SemiBold"},
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.6)",
    marginBottom:10
  },
  modalBox: {
    width: "90%",
    backgroundColor: "#09345f",
    borderRadius: 10,
    padding: 14,
    // paddingBottom:-10
    // marginBottom:10
  },
  // header: {
  //   flexDirection: "row",
  //   justifyContent: "space-between",
  //   alignItems: "center",
  //   marginBottom: 10,
  // },
  headerTitle: { color: "#fff", fontSize: 16, fontWeight: "600" },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.2)",
    marginBottom: 15,
  },
  modalTitle: {
    color: "#fff",
    fontSize: 16,
    // fontWeight: "600",
    fontFamily:"Outfit-SemiBold"
  },
  closeBtn: {
    color: "#FF4444",
    fontSize: 18,
    fontWeight: "bold",
    fontFamily:"Outfit-SemiBold"
  },
  formContainer: {
    paddingTop: 5,
  },
  field: { marginVertical: 5 },
  label: { color: "#fff", marginBottom: 4,fontFamily:"Outfit-Regular" },
  input: {
    backgroundColor: "#205686",
    borderRadius: 6,
    paddingHorizontal: 10,
    color: "#fff",
    fontFamily:"",
    fontFamily:"Outfit-Regular" 
  },
  pickerWrapper: {
    backgroundColor: "#205686",
    borderRadius: 6,
  },
  picker: { color: "#fff", height: 52 },
  row: { flexDirection: "row", justifyContent: "space-between" },
  column: { flex: 0.48 },
  submitBtn: {
    backgroundColor: "#7faaf9",
    borderRadius: 6,
    alignItems: "center",
    marginTop: 10,
    paddingVertical: 10,
    marginBottom:10
  },
  submitText: { color: "#001f3f"},
  titleRow: {
    marginTop: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    zIndex: 40,
    elevation: 4,
  },
  // sectionTitle: { 
  //   color: "#fff",
  //   fontSize: 16,
  //   fontWeight: "700" ,
  //   marginBottom:10
  // },
  uploadBtn: {
    backgroundColor: "#3c6ca3",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  uploadText: { color: "#fff", fontSize: 13, fontWeight: "600" },

});

export default AdvanceManagement;
