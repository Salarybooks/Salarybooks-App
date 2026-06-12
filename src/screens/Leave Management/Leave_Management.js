import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  TextInput,
  ScrollView,
  Modal,
  Image,
  Alert,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import LinearGradient from "react-native-linear-gradient";
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from "react-native-vector-icons/Ionicons";
// import { PieChart } from "react-native-svg-charts";
// import { G, Line } from "react-native-svg";
import * as Progress from "react-native-progress";
import { Picker } from '@react-native-picker/picker';
import BottomNavigation from "../BottomNavigation";
// import LeaveManagement from "../Dashboardscreen/leave_balance";
import LeaveManagement from "./leave_balance";
import DatePicker from 'react-native-date-picker';
import axios from "axios";
import { API_BASE_URL } from "@env";
import { useRoute } from "@react-navigation/native";
import Navbar from "../Dashboardscreen/navbar"
import StatusPopup from "../StatusPopup/StatusPopup";
const { width } = Dimensions.get('window');
import GlobalFont from "../../theme/GlobalFont";
// import { useEffect } from "react";
export default function LeaveManagementScreen() {
  const [modalVisible, setModalVisible] = useState(false);
  const [leaveType, setLeaveType] = useState("");
  const [fromDate, setFromDate] = useState(new Date());
  const [toDate, setToDate] = useState(new Date());
  const [openFromDate, setOpenFromDate] = useState(false);
  const [openToDate, setOpenToDate] = useState(false);
  const [noOfDays, setNoOfDays] = useState("");
  const [remainingLeaves, setRemainingLeaves] = useState("");
  const [reason, setReason] = useState("");
  const [token, setToken] = useState(null);
  const [LeaveList, setLeaveList] = useState(null);
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [userData, setuserData] = useState(null);
  const [Leavedata, setLeavedata] = useState(null);
  const [employee_id, setemployee_id] = useState(null);
  const [loading, setloading] = useState(false);
  const [popupConfig, setPopupConfig] = useState({ visible: false, type: "success", title: "", message: "", });


  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const currentDate = new Date();

  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth());
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
  const [showMonthDropdown, setShowMonthDropdown] = useState(false);
  const [showYearDropdown, setShowYearDropdown] = useState(false);
  const [rights,setRights]=useState(false);
  // useEffect(() => {
  //   const loadToken = async () => {
  //     const t = await AsyncStorage.getItem("authToken");
  //     setToken(t);
  //     console.log("TOKEN LOADED:", t);
  //   };
  //   loadToken();
  // }, []);
  useEffect(() => {
    const loadTokenAndFetch = async () => {
      const t = await AsyncStorage.getItem("authToken");
      const stored = await AsyncStorage.getItem("userData");
      setemployee_id(await AsyncStorage.getItem("employee_id"));

      setRights( JSON.parse(await AsyncStorage.getItem("rights")))
      if (stored) {
        const parsedUser = JSON.parse(stored);
        setuserData(parsedUser);
        // console.log(setuserData,'id');
        // console.log(employee_id,"employee_id");
      }
      setToken(t);
      console.log("TOKEN LOADED:", t);
      
      // fetch_applied_leave_data();
      // if (t) {
      //   fetch_leave_list(t);
      // }
    };

    loadTokenAndFetch();
  }, []);

  useEffect(() => {
    if (userData && userData.emp_id && token) {
      fetch_applied_leave_data();
      fetch_leave_list(token);
    }
  }, [userData, token]);


  const pieData = [
    {
      value: 53,
      svg: { fill: "#2bbaf5" },
      key: "progress",
    },
    {
      value: 47,
      svg: { fill: "#1c2a4e" },
      key: "remaining",
    },
  ];

  // useEffect(() => {
  //   const days = calculateDays(fromDate, toDate);
  //   const RemainingLeaves = LeaveList.leave_type[0].available - days;
  //   if (days !== "") {
  //     setNoOfDays(String(days));
  //     setRemainingLeaves(String(RemainingLeaves));
  //   }
  // }, [fromDate, toDate]);


  useEffect(() => {
    if (!LeaveList || !LeaveList.leave_type || !selectedLeave) return;

    const days = calculateDays(fromDate, toDate);
    if (days !== "") {
      setNoOfDays(String(days));
      setRemainingLeaves(
        String(selectedLeave.available - days)
      );
    }
  }, [fromDate, toDate, selectedLeave, LeaveList]);


  const calculateDays = (from, to) => {
    if (!from || !to) return "";

    const start = new Date(from);
    const end = new Date(to);

    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);

    const diffTime = end - start;
    const diffDays = diffTime / (1000 * 60 * 60 * 24);

    return diffDays >= 0 ? diffDays + 1 : "";
  };





  const fetch_leave_list = async (token) => {
    

    if (!token) return;
    // console.log(API_BASE_URL, "API_BASE_URL11");

    try {
      const payload = {}
      const response = await axios.post(
        `${API_BASE_URL}employee/employee-leave-type-list`,
        payload,
        {
          headers: {
            "x-access-token": token,
            "Content-Type": "application/json",
          },
        }
      );

      // console.log("API Response:", response.data);
      if (response.data.status === "success") {
        setLeaveList(response.data);
        // await AsyncStorage.setItem('Leavelist',response.data)
        setRemainingLeaves(response.data?.leave_type[0]?.available);
      } else {
        showPopup("error", "Error", "Unable to load payslip data");
        // Alert.alert("Error", "Unable to load payslip data");
      }
    } catch (error) {
      console.log("API Error:", error);
      showPopup("error", "API Error", error.message);
      // Alert.alert("API Error", error.message);
    }
  }

  const formatDate = (date) => {
    if (!date) return "Select Date";
    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) return "Select Date";
    const day = String(parsedDate.getDate()).padStart(2, '0');
    const month = String(parsedDate.getMonth() + 1).padStart(2, '0');
    const year = parsedDate.getFullYear();
    return `${day}-${month}-${year}`;
  };
  // const handleSubmit = async () => {
  //   console.log(LeaveList.leave_type[0].available, "LeaveList");

  //   if (!token) return;
  //   try {
  //     const formData = new FormData();
  //     formData.append("leave_head", LeaveList.leave_type[0].abbreviation);
  //     formData.append("from_date", fromDate.toISOString());
  //     formData.append("to_date", toDate.toISOString());
  //     formData.append("no_of_days", noOfDays);
  //     formData.append("remaining_leaves", remainingLeaves);
  //     formData.append("reason", reason);
  //     formData.append("available", LeaveList.leave_type[0].available);

  //     const response = await axios.post(`${API_BASE_URL}employee/employee-leave-request`,
  //       formData,
  //       {
  //         headers: {
  //           "x-access-token": token,
  //           "Content-Type": "multipart/form-data",
  //         },
  //       }
  //     );
  //     const data = response.data;

  //     console.log("API Response:", data);

  //     if (data.status === "success") {
  //       Alert.alert("Success", "Advance request submitted");
  //       // fetchAdvanceList();
  //       setModalVisible(false);
  //     } else {
  //       Alert.alert("Error", data.message || "Something went wrong");
  //     }
  //   } catch (err) {
  //     console.log(err);
  //     Alert.alert("Error", "Failed to submit Leave request");
  //   }
  // }

  const formatDateRange = (from, to) => {
    const options = { month: "short", day: "2-digit" };

    const fromDate = new Date(from).toLocaleDateString("en-US", options);
    const toDate = new Date(to).toLocaleDateString("en-US", options);

    return `${fromDate} - ${toDate}`;
  };
  const showPopup = (type, title, message) => {
    setPopupConfig({
      visible: true,
      type,
      title,
      message,
    });
  };

  const handleSubmit = async () => {
    // console.log("LOG");
    // console.log( rights);
    if (!token || !selectedLeave) {
      showPopup("error", "Error", "Please select leave type");
      // Alert.alert("Error", "Please select leave type");
      return;
    }

    try {


      const formData = new FormData();
      formData.append("leave_head", selectedLeave.abbreviation);
      formData.append("employee_id", employee_id);
      formData.append("from_date", fromDate.toISOString());
      formData.append("to_date", toDate.toISOString());
      formData.append("no_of_days", noOfDays);
      formData.append("leave_temp_head_id", selectedLeave.leave_temp_head_id);
      formData.append("remaining_leaves", remainingLeaves);
      formData.append("emp_reason", reason);
      formData.append("available", selectedLeave.available);
      formData.append("leave_approval_status", "pending");
      console.log(formData,"formData");
      
      const response = await axios.post(
        `${API_BASE_URL}employee/employee-leave-request`,
        formData,
        {
          headers: {
            "x-access-token": token,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      // console.log("1");

      if (response.data.status === "success") {
        // Alert.alert("Success", "Leave request submitted");
        showPopup("success", "Success", "Leave request submitted");
        setModalVisible(false);
        fetch_applied_leave_data();
      } else {
        console.log("true");
        
        showPopup("error", "Error", response.data.message);
        // Alert.alert("Error", response.data.message);
      }
    } catch (err) {
      // console.log(err,"err");
      showPopup("error", "Error", "Failed to submit Leave request");
      // Alert.alert("Error", "Failed to submit Leave request");
    }
  };


  const fetch_applied_leave_data = async () => {

    setloading(true);
    try {
      const response = await axios.post(
        `${API_BASE_URL}employee/fetch_applied_leave_data`,
        { employee_id: String(userData.emp_id) },
        { headers: { "x-access-token": token } }
      );

      if (response.data.success) {
        setLeavedata(response.data.data)
        // console.log(response.data.data, "response.data1");

      }
    } catch (error) {
      console.log("Fetch Docs Error:", error.response?.data || error);
    } finally {
      setloading(false);
    }
  }

  // const filteredStatusData = Leavedata?.filter(item => {
  //   const fromDate = new Date(item.leave_from_date);

  //   return (
  //     fromDate.getMonth() === selectedMonth &&
  //     fromDate.getFullYear() === selectedYear
  //   );
  // });

  // const filteredStatusData = Leavedata?.filter(item => {
  //   const leaveStart = new Date(item.leave_from_date);
  //   const leaveEnd = new Date(item.leave_to_date);

  //   // start of selected month
  //   const monthStart = new Date(selectedYear, selectedMonth, 1);
  //   monthStart.setHours(0, 0, 0, 0);

  //   // end of selected month
  //   const monthEnd = new Date(selectedYear, selectedMonth + 1, 0);
  //   monthEnd.setHours(23, 59, 59, 999);

  //   return leaveStart <= monthEnd && leaveEnd >= monthStart;
  // });
  const filteredStatusData = Leavedata?.filter(item => {
  const leaveStart = new Date(item.leave_from_date);
  const leaveEnd = new Date(item.leave_to_date);

  // today's start (ignore time)
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // start of selected month
  const monthStart = new Date(selectedYear, selectedMonth, 1);
  monthStart.setHours(0, 0, 0, 0);

  // end of selected month
  const monthEnd = new Date(selectedYear, selectedMonth + 1, 0);
  monthEnd.setHours(23, 59, 59, 999);

  return (
    leaveEnd >= today &&
    leaveStart <= monthEnd &&
    leaveEnd >= monthStart
  );
});



  const route = useRoute();
  const screenTitle = route.params?.title;
  const getUsedLeavePercentage = () => {
    const leaveStats = LeaveList?.leave_type || [];

    const totalBalance = leaveStats.reduce(
      (sum, item) => sum + Number(item.total_balance || 0),
      0
    );

    const totalAvailable = leaveStats.reduce(
      (sum, item) => sum + Number(item.available || 0),
      0
    );

    if (totalBalance === 0) return 0;
    console.log(Math.round(
      ((totalBalance - totalAvailable) / totalBalance) * 100
    ), "total");

    return Math.round(
      ((totalBalance - totalAvailable) / totalBalance) * 100
    );
  };
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  // const historyData = Leavedata?.filter(item => {
  //   const toDate = new Date(item.leave_to_date);
  //   toDate.setHours(0, 0, 0, 0);

  //   return (
  //     toDate < today &&
  //     item.leave_approval_status !== "pending"
  //   );
  // });
const today1 = new Date();
today1.setHours(0, 0, 0, 0);

const monthStart = new Date(selectedYear, selectedMonth, 1);
monthStart.setHours(0, 0, 0, 0);

const monthEnd = new Date(selectedYear, selectedMonth + 1, 0);
monthEnd.setHours(23, 59, 59, 999);

const historyData = Leavedata?.filter(item => {
  const leaveStart = new Date(item.leave_from_date);
  const leaveEnd = new Date(item.leave_to_date);

  leaveStart.setHours(0, 0, 0, 0);
  leaveEnd.setHours(0, 0, 0, 0);

return (
   
    leaveEnd < today &&

  
    leaveEnd.getMonth() === selectedMonth &&
    leaveEnd.getFullYear() === selectedYear &&

    item.leave_approval_status !== "pending"
  );
});


  // console.log(historyData,"historyData");
// const leaveStatusData = Leavedata?.filter(item => {
//   const fromDate = new Date(item.leave_from_date);
//   const toDate = new Date(item.leave_to_date);

//   return (
//     fromDate.getMonth() === selectedMonth &&
//     fromDate.getFullYear() === selectedYear &&
//     toDate >= today
//   );
// });
// const leaveStatusData = Leavedata?.filter(item => {
//   const fromDate = new Date(item.leave_from_date);
//   fromDate.setHours(0, 0, 0, 0);

//   return fromDate >= today;
// });


//   const statusData = Leavedata?.filter(item => {
//     const toDate = new Date(item.leave_to_date);
//     toDate.setHours(0, 0, 0, 0);

//     return (
//       item.leave_approval_status === "pending" ||
//       ((item.leave_approval_status === "approved" || item.leave_approval_status === "rejected" || item.leave_approval_status === "cancelled") && toDate >= today)
//     );
//   });



  return (
    <LinearGradient
      colors={["#000000ff", "#1c68beff"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <ScrollView nestedScrollEnabled contentContainerStyle={styles.scrollContainer}>

        {/* Header */}
        <View style={styles.header}>
          <Image
            source={require("../../assets/Leave_Management.png")}
            style={styles.header_iconImage}
          />
          <Navbar title={screenTitle} />
        </View>

        {/* Month Selector */}
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

        <View style={styles.filterContainer}>
          <View style={styles.dropdownRow}>

            {/* Month Dropdown */}
            <TouchableOpacity
              style={styles.dropdown}
              onPress={() => {
                setShowMonthDropdown(!showMonthDropdown);
                setShowYearDropdown(false);
              }}
            >
              <Text style={styles.dropdownText}>{months[selectedMonth]}</Text>
              <Icon name="chevron-down" color="#fff" />
            </TouchableOpacity>

            {/* Year Dropdown */}
            <TouchableOpacity
              style={styles.dropdown}
              onPress={() => {
                setShowYearDropdown(!showYearDropdown);
                setShowMonthDropdown(false);
              }}
            >
              <Text style={styles.dropdownText}>{selectedYear}</Text>
              <Icon name="chevron-down" color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        <Modal
          transparent
          visible={showMonthDropdown}
          animationType="fade"
          onRequestClose={() => setShowMonthDropdown(false)}
        >
          <View style={styles.monthDropdownModal}>
            <TouchableOpacity
              activeOpacity={1}
              style={styles.monthDropdownBackdrop}
              onPress={() => setShowMonthDropdown(false)}
            />
            <View style={[styles.dropdownBox, styles.monthDropdownModalBox]}>
              <ScrollView
                persistentScrollbar
                showsVerticalScrollIndicator
                style={styles.monthDropdownScroll}
                contentContainerStyle={styles.monthDropdownContent}
              >
                {months.map((month, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.dropdownOption}
                    onPress={() => {
                      setSelectedMonth(index);
                      setShowMonthDropdown(false);
                    }}
                  >
                    <Text style={styles.dropdownText}>{month}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        </Modal>

        <Modal
          transparent
          visible={showYearDropdown}
          animationType="fade"
          onRequestClose={() => setShowYearDropdown(false)}
        >
          <View style={styles.monthDropdownModal}>
            <TouchableOpacity
              activeOpacity={1}
              style={styles.monthDropdownBackdrop}
              onPress={() => setShowYearDropdown(false)}
            />
            <View style={[styles.dropdownBox, styles.yearDropdownModalBox]}>
              <ScrollView
                persistentScrollbar
                showsVerticalScrollIndicator
                style={styles.yearDropdownScroll}
                contentContainerStyle={styles.monthDropdownContent}
              >
                {Array.from(
                  { length: 10 },
                  (_, index) => new Date().getFullYear() - index
                ).map(year => (
                  <TouchableOpacity
                    key={year}
                    style={styles.dropdownOption}
                    onPress={() => {
                      setSelectedYear(year);
                      setShowYearDropdown(false);
                    }}
                  >
                    <Text style={styles.dropdownText}>{year}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        </Modal>



        <LinearGradient
          colors={["#07162cff", "#23568fff"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.card}
        >

          {/* Header */}
          <View style={styles.cardHeader}>
            <Text style={[GlobalFont.semiBold, styles.cardTitle]}>Leave Summary</Text>

            <TouchableOpacity
              style={styles.leaveButton}
              onPress={() => setModalVisible(true)}
            >
              <Text style={[GlobalFont.CustomFont, styles.leaveBtnText]}>+ Leave Request</Text>
            </TouchableOpacity>
          </View>

          {/* Body */}
          <View style={styles.summaryRow}>
            {/* Circular Progress */}
            {/* <View style={styles.circleWrap}>

              <Progress.Circle
                size={78}
                progress={getUsedLeavePercentage() / 100}
                color="#4FC3F7"
                thickness={9}
                borderWidth={0}
                unfilledColor="#18384A"
                strokeCap="round"
              />
              <Text style={[GlobalFont.CustomFont, styles.circleText]}>{getUsedLeavePercentage()}%</Text>
            </View> */}

            {/* Bars + counts */}
            <View style={styles.barSection}>


              <View style={styles.barchart}>
                <LeaveManagement />
              </View>


              <View style={styles.leaveList}>
                {LeaveList?.leave_type?.map((item) => (
                  <View style={styles.leaveCountRow} key={item._id}>
                    <Text style={[GlobalFont.CustomFont, styles.leaveCountText]}>
                      {item.abbreviation}
                    </Text>

                    <Text style={[GlobalFont.CustomFont, styles.leaveCountValue]}>
                      {item.available} left
                    </Text>
                  </View>
                ))}
              </View>

            </View>
          </View>

        </LinearGradient>
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
              >
                <View style={styles.modalHeader}>
                  <Text style={[GlobalFont.semiBold, styles.modalTitle]}>Enter the following details</Text>
                  <TouchableOpacity onPress={() => setModalVisible(false)}>
                    <Text style={styles.closeBtn}>✖</Text>
                  </TouchableOpacity>
                </View>

                <ScrollView
                  style={styles.formContainer}
                  contentContainerStyle={styles.formContent}
                  showsVerticalScrollIndicator={false}
                >


                  <View style={[styles.rowContainer, styles.leaveTypeWrapper]}>
                    <Text style={[GlobalFont.semiBold, styles.labelRow]}>Select Leave Type:</Text>

                    <TouchableOpacity
                      style={styles.customSelect}
                      activeOpacity={0.7}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                      onPress={() => {
                        setDropdownOpen(prev => !prev);
                        setOpenFromDate(false);
                        setOpenToDate(false);
                      }}
                    >
                      <Text style={[GlobalFont.CustomFont, styles.selectedText]}>
                        {selectedLeave?.abbreviation || "Select Leave Type"}
                      </Text>
                    </TouchableOpacity>

                    {dropdownOpen && (
                      <View style={styles.leaveTypeDropdownContainerInline}>
                        <ScrollView
                          style={styles.leaveTypeDropdownScroll}
                          persistentScrollbar
                          showsVerticalScrollIndicator={true}
                          nestedScrollEnabled={true}
                          contentContainerStyle={styles.leaveTypeDropdownContent}
                        >
                          {LeaveList?.leave_type?.map((item) => (
                            <TouchableOpacity
                              key={item._id}
                              style={styles.leaveTypeOption}
                              activeOpacity={0.7}
                              onPress={() => {
                                setSelectedLeave(item);
                                setLeaveType(item.leave_temp_head_id);
                                setRemainingLeaves(item.available);
                                setDropdownOpen(false);
                                setOpenFromDate(false);
                                setOpenToDate(false);
                                if (!fromDate || isNaN(new Date(fromDate).getTime())) {
                                  setFromDate(new Date());
                                }
                                if (!toDate || isNaN(new Date(toDate).getTime())) {
                                  setToDate(new Date());
                                }
                              }}
                            >
                              <Text style={[GlobalFont.CustomFont, styles.dropdownAbbr]}>{item.abbreviation}</Text>
                              <Text style={[GlobalFont.CustomFont, styles.dropdownValue]}>
                                {item.available}/{item.quota}
                              </Text>
                            </TouchableOpacity>
                          ))}
                        </ScrollView>
                      </View>
                    )}
                  </View>

                  <View style={styles.dateRow}>
                    <View style={styles.dateInputContainer}>
                      <Text style={[GlobalFont.CustomFont, styles.labelColumn]}>From:</Text>
                      <TouchableOpacity
                        style={styles.dateInput}
                        onPress={() => setOpenFromDate(true)}
                      >
                        <Text style={[GlobalFont.CustomFont, styles.dateTextDisplay]}>
                          {fromDate ? formatDate(fromDate) : "Select Date"}
                        </Text>
                        <Text style={styles.calendarIcon}>📅</Text>
                      </TouchableOpacity>
                    </View>

                    <View style={styles.dateInputContainer}>
                      <Text style={[GlobalFont.CustomFont, styles.labelColumn]}>To:</Text>
                      <TouchableOpacity
                        style={styles.dateInput}
                        onPress={() => setOpenToDate(true)}
                      >
                        <Text style={[GlobalFont.CustomFont, styles.dateTextDisplay]}>
                          {toDate ? formatDate(toDate) : "Select Date"}
                        </Text>
                        <Text style={styles.calendarIcon}>📅</Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  <DatePicker
                    modal
                    mode="date"
                    open={openFromDate}
                    date={fromDate}
                    onConfirm={(date) => {
                      setOpenFromDate(false);
                      setFromDate(date);
                    }}
                    onCancel={() => {
                      setOpenFromDate(false);
                    }}
                    theme="dark"
                  />

                  <DatePicker
                    modal
                    mode="date"
                    open={openToDate}
                    date={toDate}
                    minimumDate={fromDate}
                    onConfirm={(date) => {
                      setOpenToDate(false);
                      setToDate(date);
                    }}
                    onCancel={() => setOpenToDate(false)}
                    theme="dark"
                  />


                  <View style={styles.rowContainer}>
                    <Text style={[GlobalFont.CustomFont, styles.labelRow]}>No. of Days:</Text>
                    <TextInput
                      style={[GlobalFont.CustomFont, styles.inputRow1, styles.disabledInput]}
                      value={noOfDays}
                      editable={false}
                      selectTextOnFocus={false}
                    />
                  </View>

                  <View style={styles.rowContainer}>
                    <Text style={[GlobalFont.CustomFont, styles.labelRow]}>Remaining Leaves:</Text>
                    <TextInput
                      style={[GlobalFont.CustomFont, styles.inputRow, styles.disabledInput]}
                      value={String(remainingLeaves)}
                      editable={false}
                      selectTextOnFocus={false}
                    />
                  </View>

                  <View style={styles.reasonContainer}>
                    <Text style={[GlobalFont.CustomFont, styles.labelColumn]}>Reason:</Text>
                    <TextInput
                      style={[GlobalFont.CustomFont, styles.textArea]}
                      placeholder=""
                      placeholderTextColor="#6B7280"
                      multiline
                      numberOfLines={4}
                      value={reason}
                      onChangeText={setReason}
                    />
                  </View>

                  <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
                    <Text style={[GlobalFont.CustomFont, styles.submitButtonText]}>Submit</Text>
                  </TouchableOpacity>
                </ScrollView>
              </LinearGradient>
            </View>
          </Modal>

        </View>

        <Text style={[GlobalFont.bold, styles.sectionTitle]}>Leave Status</Text>

        {loading && (
          <View style={styles.loaderOverlay}>
            <ActivityIndicator size="large" color="#fff" />
            <Text style={[GlobalFont.CustomFont, { color: "white", marginTop: 5, margin: "auto" }]}>Loading...</Text>
          </View>
        )}
        {/* {!loading && statusData?.length === 0 && (
          <View style={styles.centerBox}>
            <Text style={[GlobalFont.CustomFont, styles.noDataText]}>No status found</Text>
          </View>
        )} */}
        {!loading && filteredStatusData?.length === 0 && (
          <View style={styles.centerBox}>
            <Text style={[GlobalFont.CustomFont, styles.noDataText]}>
              No leave data found for selected month
            </Text>
          </View>
        )}


        {/* {!loading && statusData?.map(item => ( */}
        {!loading && filteredStatusData?.map(item => (

          <LinearGradient
            colors={["#173e58ff", "#285879ff"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.upcomingCard}
            key={item._id}
          >
            <LinearGradient
              colors={["#1c4968ff", "#2b678fff"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.status_card}
            >
              <Text style={[GlobalFont.CustomFont, styles.upcomingDate]}>
                {formatDateRange(item.leave_from_date, item.leave_to_date)}
              </Text>

              <View style={styles.leave_head}>
                <Text style={[GlobalFont.CustomFont, styles.upcomingStatusText]}>
                  {item.leave_temp_head}
                </Text>
              </View>

              <View style={styles.upcomingStatusBox}>
                <Text
                  style={[GlobalFont.CustomFont,
                  styles.upcomingStatusText,
                  {
                    color:
                      item.leave_approval_status === "approved"
                        ? "#08d319ff"
                        : item.leave_approval_status === "rejected"
                          ? "#d11a2a"
                          : "#e8ec00ff",
                  },
                  ]}
                >
                  {item.leave_approval_status?.charAt(0).toUpperCase() +
                    item.leave_approval_status?.slice(1)}
                </Text>
              </View>
            </LinearGradient>
          </LinearGradient>
        ))}




        <Text style={[GlobalFont.bold, styles.sectionTitle]}>Leave History</Text>

        {historyData?.length > 0 ? (
          historyData.map(item => (
            <LinearGradient
              colors={["#173e58ff", "#285879ff"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.upcomingCard_status}
              key={item._id}
            >
              <LinearGradient
                colors={["#1c4968ff", "#2b678fff"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.status_card}
              >
                <Text style={[GlobalFont.CustomFont, styles.upcomingDate]}>
                  {formatDateRange(item.leave_from_date, item.leave_to_date)}
                </Text>

                <View style={styles.leave_head}>
                  <Text style={[GlobalFont.CustomFont, styles.upcomingStatusText]}>
                    {item.leave_temp_head}
                  </Text>
                </View>

                <View style={styles.upcomingStatusBox}>
                  <Text
                    style={[GlobalFont.CustomFont,
                    styles.upcomingStatusText,
                    {
                      color:
                        item.leave_approval_status === "approved"
                          ? "#08d319ff"
                          : item.leave_approval_status === "rejected"
                            ? "#d11a2a"
                            : "#e8ec00ff",
                    },
                    ]}
                  >
                    {item.leave_approval_status?.charAt(0).toUpperCase() +
                      item.leave_approval_status?.slice(1)}
                  </Text>
                </View>
              </LinearGradient>
            </LinearGradient>
          ))
        ) : (
          <Text style={[GlobalFont.CustomFont, styles.noDataText]}>No history found</Text>
        )}

       



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
}


const BarItem = ({ label, value, total, color }) => {
  const widthPercent = (value / total) * 100;
  return (
    <View style={{ marginBottom: 12 }}>
      <Text style={styles.barLabel}>{label}</Text>
      <View style={styles.barBackground}>
        <View style={[styles.barFill, { width: `${widthPercent}%`, backgroundColor: color }]} />
      </View>
    </View>
  );
};



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
    gap: 5
  },
  header_iconImage: {
    width: 35,
    padding: 20,
    height: 20,
    marginLeft: -5,
  },
  // headerText: {
  //   color: "#fff",
  //   fontSize: 22,
  //   fontWeight: "600",
  // },
  // icons: {
  //   flexDirection: "row",
  // },
  scrollContainer: {
    // padding: 5,
    top: 15,
    paddingBottom: 100,
  },

  selectorBox: {
    backgroundColor: "#1c2a4e",
    padding: 12,
    width: "48%",
    borderRadius: 12,
  },
  selectorText: {
    color: "#fff",
    fontSize: 16,
  },

  // card: {
  //   backgroundColor: "#1b2d4f",
  //   padding: 15,
  //   borderRadius: 16,
  //   marginBottom: 25,
  // },
  // cardHeader: {
  //   flexDirection: "row",
  //   justifyContent: "space-between",
  //   marginBottom: 12,
  // },
  // cardTitle: {
  //   color: "#fff",
  //   fontSize: 18,
  //   fontWeight: "600",
  // },

  // leaveButton: {
  //   backgroundColor: "#d0d7dd",
  //   paddingVertical: 6,
  //   paddingHorizontal: 14,
  //   borderRadius: 10,
  // },
  // leaveBtnText: {
  //   color: "#1b2d4f",
  //   fontWeight: "600",
  // },

  // summaryRow: {
  //   flexDirection: "row",
  //   alignItems: "center",
  // },

  pieContainer: {
    justifyContent: "center",
    alignItems: "center",
    width: 130,
    height: 130,
  },
  pieCenter: {
    position: "absolute",
  },
  pieCenterText: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "700",
  },

  barLabel: {
    color: "#fff",
    marginBottom: 4,
    fontSize: 14,
  },
  barBackground: {
    width: "100%",
    height: 10,
    backgroundColor: "#243b63",
    borderRadius: 10,
  },
  barFill: {
    height: 10,
    borderRadius: 10,
  },

  leaveCountValue: {
    color: "#0f1411ff",
  },

  sectionTitle: {
    color: "#fff",
    fontSize: 15,
    // fontWeight: "600",
    marginBottom: 8,
  },
  centerBox: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.08)",
    paddingVertical: 15,
    paddingHorizontal: 14,
    borderRadius: 12,
    marginTop: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    rowGap:10,
    marginBottom:20,
    height: 50,
  },


  noDataText: {
    color: "#ccc",
    fontSize: 15,
    margin: "auto",
    // marginBottom: 60
  },

  upcomingCard_status: {
    padding: 10,
    borderRadius: 15,
    marginBottom: 8,
    backgroundColor: "#194a7ea2",
  },
  upcomingCard: {
    padding: 10,
    borderRadius: 15,
    marginBottom: 8,
    backgroundColor: "#194a7ea2",
  },
  status_card: {
    width: "100%",
    backgroundColor: "#0b3863ff",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 10,
    borderRadius: 12,
    marginLeft: 0,
  },
  upcomingDate: {
    color: "#fff",
    fontSize: 13,
    flexShrink: 1,
    marginRight: 8,
    maxWidth: "52%",
    textAlign: "left",
  },
  leave_head: {
    backgroundColor: "#2c4e64ff",
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 8,
    minWidth: 60,
    justifyContent: "center",
    alignItems: "center",
  },
  upcomingStatusBox: {
    backgroundColor: "#2c4f70ff",
    minHeight: 30,
    minWidth: 80,
    paddingHorizontal: 8,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  upcomingStatusText: {
    color: "#fff",
    fontWeight: "600",
    textAlign: "center",
    textAlignVertical: "center",
  },

  historyCard: {
    backgroundColor: "#1b2d4f",
    padding: 16,
    borderRadius: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  historyDate: {
    color: "#fff",
    fontSize: 16,
  },
  historyStatusBox: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  historyStatusText: {
    color: "#fff",
    fontWeight: "600",
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 12,
  },
  modalContainer: {
    width: "100%",
    maxWidth: 420,
    maxHeight: "88%",
    borderRadius: 12,
    padding: 16,
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
  },
  modalTitle: {
    flex: 1,
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginRight: 12,
  },
  closeBtn: {
    color: "#FF4444",
    fontSize: 18,
    fontWeight: "bold",
  },
  formContainer: {
    flexGrow: 0,
  },
  formContent: {
    paddingTop: 5,
    paddingBottom: 10,
  },

  rowContainer: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    marginBottom: 15,
    rowGap: 8,
  },
  labelRow: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "500",
    width: "100%",
  },
  inputRow1: {
    width: "100%",
    backgroundColor: "#072c52ff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 12,
    minHeight: 40,
    color: "#fff",
    fontSize: 13,

  },
  inputRow: {
    width: "100%",
    backgroundColor: "#072c52ff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 12,
    minHeight: 40,
    color: "#fff",
    fontSize: 13,
  },

  labelColumn: {
    color: "#fff",
    fontSize: 14,
    marginBottom: 8,
    fontWeight: "500",
  },


  pickerContainer: {
    flex: 1,
    backgroundColor: "#5BA3C7",
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    height: 40,
    justifyContent: "center",
  },
  picker: {
    color: "#fff",
    height: 50,
  },

  dateRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    flexWrap: "wrap",
    columnGap: 10,
    rowGap: 12,
    marginBottom: 15,
  },
  dateInputContainer: {
    flexGrow: 1,
    flexBasis: "47%",
    minWidth: 130,
  },
  dateInput: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#5BA3C7",
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 12,
    height: 40,
  },
  dateTextDisplay: {
    flex: 1,
    color: "#fff",
    fontSize: 13,
  },
  dateText: {
    flex: 1,
    color: "#fff",
    fontSize: 13,
  },
  calendarIcon: {
    fontSize: 16,
    marginLeft: 8,
  },

  reasonContainer: {
    marginTop: -5,
    marginBottom: 10,
  },
  textArea: {
    backgroundColor: "#072c52ff",
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 12,
    paddingVertical: 10,
    height: 80,
    color: "#fff",
    fontSize: 13,
    textAlignVertical: "top",
  },

  submitButton: {
    backgroundColor: "#5BA3C7",
    borderRadius: 25,
    paddingVertical: 5,
    alignItems: "center",
    marginTop: 10,
    marginBottom: 20,
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 1,
  },
  customSelect: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    borderWidth: 1,
    borderColor: "#3b82f6",
    borderRadius: 8,
    padding: 12,
    minHeight: 44,
  },

  selectedText: {
    color: "#fff",
    fontSize: 14,
    flex: 1,
  },

  dropdownOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    paddingHorizontal: 20,
  },

  dropdownBox: {
    backgroundColor: "#0B1E3A",
    borderRadius: 10,
    overflow: "hidden",
    zIndex: 50,
    elevation: 12,
  },

  filterContainer: {
    position: "relative",
    zIndex: 50,
    elevation: 12,
    marginBottom: 10,
  },

  monthDropdownBox: {
    position: "absolute",
    top: 48,
    left: 0,
    width: "48%",
    height: 264,
  },

  monthDropdownModal: {
    flex: 1,
  },

  monthDropdownBackdrop: {
    ...StyleSheet.absoluteFillObject,
  },

  monthDropdownModalBox: {
    position: "absolute",
    top: 122,
    left: 13,
    width: "45%",
    height: 264,
  },

  monthDropdownScroll: {
    height: 264,
  },

  yearDropdownModalBox: {
    position: "absolute",
    top: 122,
    right: 13,
    width: "45%",
    height: 264,
  },

  yearDropdownScroll: {
    height: 264,
  },

  monthDropdownContent: {
    paddingVertical: 6,
  },

  yearDropdownBox: {
    position: "absolute",
    top: 48,
    right: 0,
    width: "48%",
  },

  dropdownOption: {
    paddingVertical: 10,
    paddingHorizontal: 12,
  },

  // dropdownRow: {
  //   flexDirection: "row",
  //   justifyContent: "space-between",
  //   padding: 12,
  //   borderBottomWidth: 0.5,
  //   borderBottomColor: "#334155",
  // },

  dropdownAbbr: {
    color: "#fff",
    fontWeight: "600",
    width: "30%",
  },

  // dropdownAQ: {
  //   color: "#94a3b8",
  //   width: "20%",
  //   textAlign: "center",
  // },

  dropdownValue: {
    color: "#22c55e",
    width: "30%",
    textAlign: "right",
  },
  dropdownBoxInline: {
    position: "absolute",
    top: 76,
    left: 0,
    right: 0,
    backgroundColor: "#0B2A44",
    borderRadius: 10,
    paddingVertical: 6,
    zIndex: 999,
    elevation: 6,
  },

  dropdownRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    // marginTop: 10,
    marginBottom: 0
  },
  leaveTypeDropdownBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    padding: 20,
  },
  leaveTypeDropdownContainer: {
    backgroundColor: "#0B2A44",
    borderRadius: 12,
    maxHeight: "60%",
    paddingVertical: 8,
    overflow: "hidden",
  },
  leaveTypeDropdownContainerInline: {
    position: "absolute",
    top: 60,
    left: 0,
    right: 0,
    backgroundColor: "#0B2A44",
    borderRadius: 12,
    maxHeight: 240,
    overflow: "hidden",
    zIndex: 999,
    elevation: 10,
  },
  leaveTypeDropdownScroll: {
    maxHeight: 240,
  },
  leaveTypeDropdownContent: {
    paddingVertical: 8,
  },
  leaveTypeOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.08)",
  },
  leaveTypeWrapper: {
    position: "relative",
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
    fontFamily: "Outfit-Regular"
  },

  // dropdownRow: {
  //   flexDirection: "row",
  //   justifyContent: "space-between",
  //   paddingVertical: 12,
  //   paddingHorizontal: 14,
  //   borderBottomWidth: 0.5,
  //   borderBottomColor: "#1f3b57",
  // },

  dropdownAbbr: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "600",
  },

  dropdownValue: {
    color: "#7dd3fc",
    fontSize: 13,
    fontWeight: "500",
  },

  // customSelect: {
  //   borderWidth: 1,
  //   borderColor: "#1f3b57",
  //   borderRadius: 8,
  //   paddingVertical: 12,
  //   paddingHorizontal: 14,
  //   marginTop: 6,
  //   backgroundColor: "#0B2A44",
  // },

  card: {
    backgroundColor: "#0E2A3B",
    borderRadius: 22,
    padding: 16,
    marginBottom: 20,
    // paddingVertical:-10
  },

  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },

  cardTitle: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },

  leaveButton: {
    backgroundColor: "#2A3F50",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },

  leaveBtnText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "500",
  },

  summaryRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  circleWrap: {
    width: 90,
    alignItems: "center",
    justifyContent: "center",
    marginTop: -105
  },

  circleText: {
    position: "absolute",
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },

  barSection: {
    flex: 1,
    paddingLeft: 10,
    gap: 20
  },

  barRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },

  barLabel: {
    width: 50,
    color: "#B5C7D3",
    fontSize: 11,
  },

  barTrack: {
    flex: 1,
    height: 8,
    backgroundColor: "#18384A",
    borderRadius: 6,
    overflow: "hidden",
    marginHorizontal: 6,
  },

  barFill: {
    height: "100%",
    backgroundColor: "#4FC3F7",
    borderRadius: 6,
  },

  barValue: {
    width: 18,
    color: "#FFFFFF",
    fontSize: 11,
    textAlign: "right",
  },
  barchart: {

    marginTop: -0,
    marginLeft: -70,
    // margin: -20,
    height: 170,
    paddingVertical: -20
  },
  leaveList: {
    marginTop: 30,
    marginLeft: -20,
    backgroundColor: "#194a7ea2",
    borderRadius: 17,
    paddingVertical: 10,
    marginTop: "auto",
  },

  leaveCountRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    gap: 150,
    marginTop: 2,
    // marginLeft: -60
  },

  leaveCountText: {
    color: "#DCE6ED",
    fontSize: 12,
    // marginLeft:-60
  },

  leaveCountValue: {
    color: "#3BE37B",
    fontSize: 12,
    fontWeight: "600",
    // marginRight:-20
  },

  yearHeader: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#173e58",
    marginTop: 16,
    marginBottom: 8,
  },

  monthHeader: {
    fontSize: 15,
    fontWeight: "600",
    color: "#285879",
    marginBottom: 8,
    marginLeft: 4,
  },

});