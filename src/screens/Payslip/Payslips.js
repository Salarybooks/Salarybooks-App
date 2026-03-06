import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Image,
  Alert,
  Dimensions
} from "react-native";
import Pdf from "react-native-pdf";
import LinearGradient from "react-native-linear-gradient";
import { useNavigation } from '@react-navigation/native';
import Icon from "react-native-vector-icons/Ionicons";
import { SafeAreaView } from "react-native-safe-area-context";
import BottomNavigation from "../BottomNavigation";
import ModalSelector from "react-native-modal-selector";
import axios from "axios";
import RNBlobUtil from "react-native-blob-util";
import AsyncStorage from '@react-native-async-storage/async-storage';
import Navbar from "../Dashboardscreen/navbar";
import { useRoute } from "@react-navigation/native";
import { API_BASE_URL } from "@env";
import { PermissionsAndroid, Platform } from "react-native";
const { width } = Dimensions.get("window");
import StatusPopup from "../StatusPopup/StatusPopup";
import GlobalFont from "../../theme/GlobalFont";
const PayslipScreen = () => {

  const currentDate = new Date();
  const currentMonthIndex = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  const months = [
    { key: 0, label: "January" },
    { key: 1, label: "February" },
    { key: 2, label: "March" },
    { key: 3, label: "April" },
    { key: 4, label: "May" },
    { key: 5, label: "June" },
    { key: 6, label: "July" },
    { key: 7, label: "August" },
    { key: 8, label: "September" },
    { key: 9, label: "October" },
    { key: 10, label: "November" },
    { key: 11, label: "December" },
  ];

  const years = Array.from({ length: 7 }, (_, i) => ({
    key: i,
    label: `${2020 + i}`,
  }));

  const [selectedMonth, setSelectedMonth] = useState(months[currentMonthIndex].label);
  const [rights,setRights]=useState(false);
  const [selectedYear, setSelectedYear] = useState(String(currentYear));
  const [payslipData, setPayslipData] = useState(null);
  const [token, setToken] = useState(null);
  const navigation = useNavigation();
  const [popupConfig, setPopupConfig] = useState({visible: false,type: "success", title: "",message: "",});
  const [modalVisible, setModalVisible] = useState(false);
  const [pdfUrl, setPdfUrl] = useState(null);
  useEffect(() => {
    const loadToken = async () => {
      const t = await AsyncStorage.getItem("authToken");
      setToken(t);
      setRights( JSON.parse(await AsyncStorage.getItem("rights")))
      console.log("TOKEN LOADED:", t);
    };
    loadToken();
  }, []);

  const monthsToShow = useMemo(() => {
    if (Number(selectedYear) === currentYear) {
      return months.slice(0, currentMonthIndex + 1);
    }
    return months;
  }, [selectedYear]);

  useEffect(() => {
    const allowed = monthsToShow.map((m) => m.label);
    if (!allowed.includes(selectedMonth)) {
      setSelectedMonth(allowed[allowed.length - 1]);
    }
  }, [monthsToShow]);

  const availableMonths = useMemo(() => {
  if (!payslipData?.master_data?.docs) return [];

  const monthSet = new Set(
    payslipData.master_data.docs.map(item => item.wage_month)
  );

  return months.filter(month => monthSet.has(month.key));
}, [payslipData]);

   const showPopup = (type, title, message) => {
    setPopupConfig({
      visible: true,
      type,
      title,
      message,
    });
  };
  const fetchPayslips = async () => {
    if (!token) return;

    try {
      const payload = {
        pageno: 1,
        perpage: 10,
        wage_year: selectedYear,
        row_checked_all: true,
        checked_row_ids: "[]",
        unchecked_row_ids: "[]",
      };

      console.log("Calling API for:", selectedMonth, selectedYear);

      const response = await axios.post(
        `${API_BASE_URL}employee/get-generated-payslip-data`,
        payload,
        {
          headers: {
            "x-access-token": token,
            "Content-Type": "application/json",
          },
        }
      );
      console.log("API Response:", response.data);

      if (response.data.status === "success") {
        setPayslipData(response.data);
      } else {
        showPopup("error", "Error", "Unable to load payslip data");
      }
    } catch (error) {
      showPopup("error", "API Error", error.message);
    }
  };

  useEffect(() => {
    fetchPayslips();
  }, [selectedMonth, selectedYear, token]);



  const requestStoragePermission = async () => {
    if (Platform.OS !== "android") return true;

    if (Platform.Version >= 30) {
      return true;
    }

    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        {
          title: "Storage Permission",
          message: "App needs access to storage to download payslip",
          buttonNeutral: "Ask Me Later",
          buttonNegative: "Cancel",
          buttonPositive: "OK",
        }
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
      console.warn(err);
      return false;
    }
  };

 
  const viewPayslipInOverlay = async (monthKey, year) => {
    console.log(monthKey,year,"year");
    
  if (!payslipData) {
    showPopup("error", "Error", "Payslip data not loaded");
    return;
  }

  const matched = payslipData.master_data.docs.find(
    item => item.wage_month === monthKey
  );

  if (!matched) {
    showPopup("error", "Error", "Payslip not found");
    return;
  }

  try {
    const res = await axios.post(
      `${API_BASE_URL}employee/download-payslip-data`,
      {
        row_checked_all: false,
        pageno: 1,
        perpage: 1,
        wage_month: monthKey,
        wage_year: parseInt(year),
        checked_row_ids: JSON.stringify([matched._id]),
        unchecked_row_ids: "[]",
        type: "view",
      },
      {
        headers: { "x-access-token": token },
      }
    );
    console.log(res.data,"res.data");
    
    if (!res.data?.file_url) {
      showPopup("error", "Error", "Payslip not available");
      return;
    }

    const finalUrl =
      API_BASE_URL.replace(/\/$/, "") + res.data.file_url;

    setPdfUrl(finalUrl);
    setModalVisible(true);
  } catch (err) {
    showPopup("error", "View Failed", err.message);
  }
};

  const download_payslip = async (monthKey, year) => {

    console.log("API_BASE_URL", monthKey,year);
    if (!payslipData) {
      showPopup("error", "Error", "Payslip data not loaded");
      // Alert.alert("Error", "Payslip data not loaded");
      return;
    }

    const hasPermission = await requestStoragePermission();
    if (!hasPermission) {
      showPopup("error", "Permission Denied", "Storage permission is required");
      // Alert.alert("Permission Denied", "Storage permission is required");
      return;
    }

    

    const docs = payslipData.master_data.docs;
    const matched = docs.find((item) => item.wage_month === monthKey);
    if (!matched) {
      showPopup("error", "Error", "No payslip found for this month");
      // Alert.alert("Error", "No payslip found for this month");
      return;
    }
    const emp_id = await AsyncStorage.getItem("employee_mongose_id");
    // console.log("emp_id", emp_id);

    const payload = {
      row_checked_all: false,
      pageno: 1,
      perpage: 20,
      wage_month: monthKey,
      wage_year: parseInt(year),
      // checked_row_ids: JSON.stringify([matched._id]),
      // checked_row_ids: emp_id,
      checked_row_ids: JSON.stringify([matched._id]),
      unchecked_row_ids: "[]",
      type: "download",
    };

    console.log("payload", payload);

    // try {
    //   const { fs, config } = RNBlobUtil;

    //   const downloadPath =
    //     fs.dirs.DownloadDir + `/payslip_${monthKey}_${year}.pdf`;

    //   // await config({
    //   //   fileCache: true,
    //   //   appendExt: "pdf",
    //   //   path: downloadPath,
    //   //   addAndroidDownloads: {
    //   //     useDownloadManager: true,
    //   //     notification: true,
    //   //     path: downloadPath,
    //   //     description: "Payslip downloaded",
    //   //     mime: "application/pdf",
    //   //     mediaScannable: true,
    //   //   },
    //   // }).fetch(
    //   //   "POST",
    //   //   `${API_BASE_URL}employee/download-payslip-data`,
    //   //   {
    //   //     "Content-Type": "application/json",
    //   //     "x-access-token": token,
    //   //   },
    //   //   JSON.stringify(payload)
    //   // );


    //   const res = await axios.post(
    //     `${API_BASE_URL}employee/download-payslip-data`,
    //     payload,
    //     {
    //       headers: {
    //         "x-access-token": token,
    //       },
    //     }
    //   );
    //   console.log("payslipDatapayslipData", res.data);

    //   if (!res.data?.file_url) {

    //     showPopup("error", "Error", "Payslip not found");
    //     // Alert.alert("Error", "Payslip not found");
    //     return;
    //   }

    //   // const fileUrl = res.data.file_url;
    //   // const fileUrl = normalizeUrl(API_BASE_URL, matched.pdf_link);
    //   // const fileUrl =API_BASE_URL.replace(/\/$/, "") +matched.pdf_link;
    //   const fileUrl =
    //     API_BASE_URL.replace(/\/$/, "") +
    //     res.data.file_url;
    //   console.log("fileUrl", fileUrl, res.data.file_url, API_BASE_URL);


    //   await RNBlobUtil.config({
    //     fileCache: true,
    //     appendExt: "pdf",
    //     addAndroidDownloads: {
    //       useDownloadManager: true,
    //       notification: true,
    //       path: downloadPath,
    //       mime: "application/pdf",
    //       description: "Payslip downloaded",
    //       mediaScannable: true,
    //     },
    //   }).fetch("GET", fileUrl);
    //   // Alert.alert(
    //   //   "Success",
    //   //   "Payslip downloaded to Downloads folder 📂"
    //   // );
    // } catch (err) {
    //   // console.log("Download Error:", err);
    //   showPopup("error","Download Failed", err.message);
    //   // Alert.alert("Download Failed", err.message);
    // }
    try {
  const { fs } = RNBlobUtil;

  const downloadPath =
    fs.dirs.DownloadDir + `/payslip_${monthKey}_${year}.pdf`;

  const res = await axios.post(
    `${API_BASE_URL}employee/download-payslip-data`,
    payload,
    {
      headers: {
        "x-access-token": token,
      },
      responseType: "arraybuffer",
    }
  );

  const base64Data = RNBlobUtil.base64.encode(
    String.fromCharCode(...new Uint8Array(res.data))
  );

  await RNBlobUtil.fs.writeFile(downloadPath, base64Data, "base64");

  showPopup("success", "Success", "Payslip downloaded successfully");

} catch (err) {
  showPopup("error","Download Failed", err.message);
}
  };


  // const view_payslip = (monthKey, year) => {
  //   if (!payslipData) {
  //     showPopup("error","Error", "Payslip data not loaded");
  //     // Alert.alert("Error", "Payslip data not loaded");
  //     return;
  //   }

  //   const docs = payslipData.master_data.docs;

  //   let matched = docs.find((item) => item.wage_month === monthKey);

  //   if (!matched) {
  //     showPopup("error","Error", "No payslip found for this month");
  //     // Alert.alert("Error", "No payslip found for this month");
  //     return;
  //   }

  //   navigation.navigate("ViewPayslipScreen", { data: matched });
  // };
  const route = useRoute();
  const screenTitle = route.params?.title;
  return (
    <LinearGradient
      colors={["#000000ff", "#1c68beff"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ flex: 1 }}
    >
      <SafeAreaView style={styles.container}>


      {/* Header */}
      {/* <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Icon name="logo-usd" size={24} color="#fff" />
          <Text style={styles.headerTitle}>Payslips</Text>
        </View>
        <View style={styles.headerIcons}>
          <Icon name="search-outline" size={22} color="#fff" style={styles.icon} />
          <Icon name="notifications-outline" size={22} color="#fff" />
        </View>
      </View> */}
       <View style={styles.header}>
          <Image
              source={require("../../assets/Paysilp.png")}
              style={styles.header_iconImage}
            />
          <Navbar title={screenTitle} />
       </View>
      {/* Filters */}
      <View style={styles.filterContainer}>

          <ModalSelector
            data={years}
            initValue="Select Year"
            onChange={(option) => setSelectedYear(option.label)}
          >
            <TouchableOpacity style={styles.filterButton}>
              <Text style={[GlobalFont.CustomFont,styles.filterText]}>{selectedYear}</Text>
              <Icon name="chevron-down-outline" size={18} color="#ccc" />
            </TouchableOpacity>
          </ModalSelector>

        </View>


        <ScrollView showsVerticalScrollIndicator={false}>
          
        <View style={styles.card}>
          {availableMonths.length === 0 ? (
            // <View style={styles.card_inner}>
            <Text style={[GlobalFont.CustomFont,styles.noDataText]}>
              No payslips available for {selectedYear}
            </Text>
            // </View>
          ) : (
            
            availableMonths.map((month) => (
              <TouchableOpacity
                key={month.key}
                onPress={() => setSelectedMonth(month.label)}
              >
                <View style={styles.card_inner}>
                  <Text style={[GlobalFont.CustomFont,styles.monthText]}>{month.label}</Text>

                  <View style={styles.actionIcons}>
                    <TouchableOpacity
                      onPress={() => viewPayslipInOverlay(month.key, selectedYear)}
                    >
                      <Image
                        source={require("../../assets/view_white.png")}
                        style={styles.iconImage}
                      />
                    </TouchableOpacity>

                    <View>

                      <Modal
                        visible={modalVisible}
                        transparent
                        animationType="fade"
                        onRequestClose={() => setModalVisible(false)}
                      >
                        <View style={styles.overlay}>
                          {/* <LinearGradient
                            colors={["#00213F", "#002C56"]}
                            style={styles.modalContainer}
                          > */}
                            <View style={styles.pdfContainer}>
                              <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>Payslip Preview</Text>
                                <TouchableOpacity onPress={() => setModalVisible(false)}>
                                  <Text style={styles.closeBtn}>✖</Text>
                                </TouchableOpacity>
                              </View>

                              {pdfUrl && (
                                <Pdf
                                  source={{ uri: pdfUrl }}
                                  style={styles.pdf}
                                  trustAllCerts={false}
                                />
                              )}
                            </View>
                          {/* </LinearGradient> */}
                        </View>
                      </Modal>

                    </View>
                    <TouchableOpacity
                      onPress={() => download_payslip(month.key, selectedYear)}
                    >
                      <Image
                        source={require("../../assets/download_white.png")}
                        style={styles.iconImage}
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableOpacity>
            ))
          )}
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

      </SafeAreaView>
    </LinearGradient>
  );
};

export default PayslipScreen;


const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 15,
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
    padding:17,
    height: 20,
    marginLeft: -5,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 8,
  },
  headerIcons: {
    flexDirection: "row",
    alignItems: "center",
  },
  icon: {
    marginRight: 12,
  },

  filterContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  filterButton: {
    backgroundColor: "rgba(255,255,255,0.1)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 10,
    padding: 12,
    width: "70%",
  },
  filterText: {
    fontSize: 14,
    color: "#fff",
  },
   card: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.08)",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 12,
    marginTop: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    rowGap:10,
    marginBottom:90
  },
    card_inner:{
    backgroundColor:"rgba(255,255,255,0.1)",
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding:6,
    // marginLeft:4,
    // margin:"auto",
     alignItems: "center",
    borderRadius:8,
    // marginBottom:10,
    height:50,
    width:width * .87
  },
  monthCard: {
    backgroundColor: "#123456",
    borderRadius: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  monthText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
    marginLeft:8
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  pdfContainer: {
    width: "95%",
    height: "85%",
    backgroundColor: "#002C56",
    borderRadius: 12,
    overflow: "hidden",
  },

  pdf: {
    textAlign:"center",
    margin:"auto",
    flex: 1,
    width: "90%",
    backgroundColor: "#fff",
    marginBottom:20,
    borderRadius:20,
  },

  modalTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginLeft:10
  },

  modalContainer: {
    width: "90%",
    maxHeight: "85%",
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.2)",
    marginBottom: 15,
    marginTop:10
  },
  closeBtn: {
    color: "#FF4444",
    fontSize: 18,
    fontWeight: "bold",
    marginRight:20
  },
  iconImage: {
    width: 25,
    height: 23,
    marginLeft: 10,
  },
  actionIcons: {
    flexDirection: "row",
    alignItems: "center",
    marginRight:10
  },
  noDataText: {
  color: "#ccc",
  textAlign: "center",
  // marginTop: 30,
  fontSize: 14,
  paddingVertical:20
},

});
