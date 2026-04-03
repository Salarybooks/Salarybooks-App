import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import LinearGradient from 'react-native-linear-gradient';
import * as Progress from "react-native-progress";
import BottomNavigation from './BottomNavigation';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Reimbursement from "./Dashboardscreen/Dashboard_Reimbursement";
import Advance from "./Dashboardscreen/Dashboard_Advance";
import { BackHandler, ToastAndroid } from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import StatusPopup from "./StatusPopup/StatusPopup";
// import { useFocusEffect } from "@react-navigation/native";
import axios from "axios";
import { API_BASE_URL } from "@env";
import { useNavigation } from '@react-navigation/native';
const daysOfWeek = ["S", "M", "T", "W", "T", "F", "S"];



const Dashboard = () => {
  const navigation = useNavigation();
  const [userData, setUserData] = useState(null);
  const [token, setToken] = useState(null);
  const [empData, setEmpData] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [attendenceImageUrl, setAttendenceImageUrl] = useState(null);
  const [rights, setRights] = useState(null);
  const [present, setPresent] = useState(null);
  const [absent, setAbsent] = useState(null);
  const [presentDates, setPresentDates] = useState([]);
  const [absentDates, setAbsentDates] = useState([]);
  const canApplyAttendance = rights?.apply?.includes("Attendance");
  const [popupConfig, setPopupConfig] = useState({visible: false,type: "success", title: "",message: "",});
  
  const loadToken = async () => {
    const t = await AsyncStorage.getItem("authToken");
    setToken(t);
    // console.log("TOKEN LOADED:", t);
  };

  const showPopup = (type, title, message) => {
    setPopupConfig({
      visible: true,
      type,
      title,
      message,
    });
  };

  const fetchemployeedata = async () => {
    if (!token) return;
    try {
      const payload = {
        pageno: 1,
      };
      const res = await axios.post(`${API_BASE_URL}employee/get-account`,
        payload,
        {
          headers: {
            "x-access-token": token,
            "Content-Type": "application/json",
          },
        });

      if (res.data?.status === "success") {
        const employeeData = res.data.employee_data;
        // console.log("API_BASE_URL",API_BASE_URL);
        // console.log("employeeData",employeeData[0].employee_details.employee_id,"API_BASE_URL",API_BASE_URL);
        await AsyncStorage.setItem("employee_id", employeeData[0].employee_details.employee_id);
        await AsyncStorage.setItem("employee_mongose_id", employeeData[0]._id);
        // await AsyncStorage.setItem("employee_bank_details", employeeData[0]?.employee_details?.bank_details);
        const bankDetails = employeeData[0]?.employee_details?.bank_details;

        if (bankDetails) {
          await AsyncStorage.setItem(
            "employee_bank_details",
            JSON.stringify(bankDetails)
          );
        }
        // console.log("employeeData", employeeData, "API_BASE_URL", API_BASE_URL);
        // console.log("bankDetails", bankDetails);

        setEmpData(employeeData);

        const profilePic = employeeData?.[0]?.profile_pic;
        // console.log("profilePic",profilePic);
        
        saveImageUrl(profilePic);
        const attendencePic = employeeData?.[0]?.attendence_pic;
        saveAttendenceImageUrl(attendencePic);
        // console.log("employeeData",employeeData);
        
        const rightsData = employeeData?.[0]?.employee_details?.employment_hr_details?.emp_role_data?.rights;
        // console.log("rightsData", rightsData);

        setRights(rightsData);
        AsyncStorage.setItem('rights',JSON.stringify(rightsData))
      }

    } catch (error) {
      // console.log("Advance list error:", error);
    }
  };

  const saveImageUrl = async (profilePic) => {
    const url = profilePic
      ? `${API_BASE_URL}${profilePic.replace(/\\/g, "/")}`
      : null;

    setImageUrl(url);
    console.log("urlurl",url);
    
    await AsyncStorage.setItem("imageUrl", url);
  };
  const saveAttendenceImageUrl = async (profilePic) => {
    const url = profilePic
      ? `${API_BASE_URL}${profilePic.replace(/\\/g, "/")}`
      : null;

    setAttendenceImageUrl(url);
    await AsyncStorage.setItem("attendenceimageUrl", url);
  };

  const fetchattendencedata = async () => {
    if (!token) return;
    const now = new Date();
    try {
      const payload = {
        // pageno: 1,
        sys_emp_id: userData.sys_emp_id,
        emp_id: userData.emp_id,
        attendance_month: String(now.getMonth()),
        attendance_year: String(now.getFullYear()),
        register_type: empData?.[0].employee_details?.template_data?.attendance_temp_data?.register_type,
      };
      // console.log("payload1234", payload);

      const res = await axios.post(`${API_BASE_URL}employee/employee-get-attendance-mobile`,
        payload,
        {
          headers: {
            "x-access-token": token,
            "Content-Type": "application/json",
          },
        });
      if (res.data?.status === "success") {
        // console.log("res.data", res.data);

        setPresent(res.data?.attendance_summary.present)
        setAbsent(res.data?.attendance_summary.leave)
        setPresentDates(res.data?.attendance_summary.present_date || []);
        setAbsentDates(res.data?.attendance_summary.absent_date || []);
      }

    } catch (error) {
      // console.log("Advance list error:", error);
    }
  };

  const getDaySetFromDates = (dates, year, month) => {
    return new Set(
      dates
        .map(d => {
          const dateObj = new Date(d);
          if (
            dateObj.getFullYear() === year &&
            dateObj.getMonth() === month
          ) {
            return dateObj.getDate();
          }
          return null;
        })
        .filter(Boolean)
    );
  };

  const screenAttendace=()=>{
    // console.log("tree");
    
    if (!canApplyAttendance) {
      showPopup("error", "Permission Denied", "you don't have This functionality");
      return;
    }
    navigation.navigate("Blank", { title: "Attendance" });
  }

  useEffect(() => {
    const loadData = async () => {
      try {
        const userData = JSON.parse(await AsyncStorage.getItem("userData"));
        setUserData(userData);
        // console.log(userData, "userData1234", API_BASE_URL);
      } catch (error) {
        console.log("Error loading userData:", error);
      }
    };

    loadData();
    loadToken();

    fetchemployeedata();
    fetchattendencedata();
  }, [token, imageUrl]);

  const attendancePercentage =
  present + absent === 0
    ? 0
    : Math.round((present / (present + absent)) * 100);

  return (

    <LinearGradient
      colors={["#000000ff", "#1c68beff"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ flex: 1 }}
    >
      <SafeAreaView style={{ flex: 1 }}>



        <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 50 }}>
          {/* Header */}
          <View style={styles.headerRow}>
            <Image
              source={
                imageUrl
                  ? { uri: imageUrl }
                  : require("../assets/user.png")
              }
              style={styles.profileImage}
            />
            <Text style={styles.greeting}>Hello, {userData ? `${userData.emp_first_name} ${userData.emp_last_name}` : "User"}</Text>
          </View>

          <LinearGradient
            colors={["#0B132B", "#173d68ff"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.attendanceCard}
          >


            <View style={styles.calendarSection}>

              <Text style={styles.monthText}>
                {new Date().toLocaleString("default", { month: "long" })}{" "}
                {new Date().getFullYear()}
              </Text>


              <View style={styles.calendarGrid}>
                {daysOfWeek.map((d, i) => (
                  <Text key={i} style={styles.dayHeader}>
                    {d}
                  </Text>
                ))}

                {(() => {
                  const now = new Date();
                  const year = now.getFullYear();
                  const month = now.getMonth();
                  const totalDays = new Date(year, month + 1, 0).getDate();
                  const firstDay = new Date(year, month, 1).getDay();
                  const presentDaySet = getDaySetFromDates(presentDates, year, month);
                  const absentDaySet = getDaySetFromDates(absentDates, year, month);
                  const calendarCells = [];


                  for (let i = 0; i < firstDay; i++) {
                    calendarCells.push(
                      <View
                        key={`empty-${i}`}
                        style={[styles.dayBox, { backgroundColor: "transparent" }]}
                      />
                    );
                  }


                  for (let day = 1; day <= totalDays; day++) {
                    const date = new Date(year, month, day);
                    const isSunday = date.getDay() === 0;

                    // const isPresent = [1, 3, 5, 7, 9, 11, 13, 15].includes(day);
                    // const isAbsent = [2, 10].includes(day);
                    // const isLate = [6, 14, 21].includes(day);
                    const isPresent = presentDaySet.has(day);
                    const isAbsent = absentDaySet.has(day);
                    let bgColor = "#1C2541";
                    if (isPresent) bgColor = "#8fb8f5ff";
                    if (isAbsent) bgColor = "#fcb2b9ff";
                    // if (isLate) bgColor = "#F4A261";
                    if (isSunday) bgColor = "#ffffff";

                    const textColor = isSunday ? "#000" : "#fff";

                    calendarCells.push(
                      <View
                        key={day}
                        style={[styles.dayBox, { backgroundColor: bgColor }]}
                      >
                        <Text style={[styles.dayText, { color: textColor }]}>{day}</Text>
                      </View>
                    );
                  }


                  const remainder = calendarCells.length % 7;
                  if (remainder !== 0) {
                    for (let i = 0; i < 7 - remainder; i++) {
                      calendarCells.push(
                        <View
                          key={`end-empty-${i}`}
                          style={[styles.dayBox, { backgroundColor: "transparent" }]}
                        />
                      );
                    }
                  }

                  return calendarCells;
                })()}
              </View>
            </View>



            {/* Progress and Stats */}
            <View style={styles.attendanceStats}>
              <Text style={styles.sectionTitle}>Attendance Log</Text>

              <View style={styles.statsRow}>

                <View style={{ position: "relative", alignItems: "center", justifyContent: "center", marginLeft: -30 }}>
                  <Progress.Circle
                    size={70}
                    progress={0.88}
                    color="#22b0dbff"
                    thickness={8}
                    borderWidth={0}
                    unfilledColor="#000000ff"
                    strokeCap="round"
                    showsText={false} // hide default text
                  />

                  <Text style={{ position: "absolute", color: "#ffffff", fontSize: 14, fontWeight: "600" }}>
                    {attendancePercentage}%
                  </Text>
                </View>

                <View style={styles.stats}>
                  <View style={styles.present_box}>
                    <Text style={styles.color}></Text>
                    <Text style={styles.present}>Present: {present}</Text>
                  </View>
                  <View style={styles.present_box}>
                    <Text style={styles.color_absent}></Text>
                    <Text style={styles.absent}>Absent: {absent}</Text>
                    {/* <Text style={styles.late}>Late: 04</Text> */}
                  </View>
                </View>
              </View>

              <TouchableOpacity style={styles.markBtn} onPress={screenAttendace}>
                <Text style={styles.markBtnText}>Mark Attendance</Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>

          <Reimbursement />
          <Advance rights={rights} />
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
        <BottomNavigation rights={rights}/>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({


  container: {
    flex: 1,
    padding: 5,
  },
  greeting: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "600",
    marginBottom: 10,
    fontFamily:"Outfit-Regular"
  },
  card: {
    backgroundColor: "#1C2541",
    borderRadius: 20,
    padding: 15,
    marginBottom: 15,
    alignItems: "center",
  },
  subText: {
    color: "#aaa",
    fontSize: 13,
    marginTop: 8,
    fontFamily:"Outfit-Regular"
  },
  advanceText: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    paddingHorizontal: 10,
    marginTop: 10,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  gridItem: {
    width: "48%",
    backgroundColor: "#3A506B",
    paddingVertical: 20,
    borderRadius: 15,
    alignItems: "center",
    marginBottom: 10,
  },
  gridText: {
    color: "#fff",
    fontWeight: "600",
  },

  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },

  profileImage: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    marginRight: 10,
    borderWidth: 2,
    borderColor: "#1E90FF",
  },

  // greeting: {
  //   color: "#fff",
  //   fontSize: 22,
  //   fontWeight: "600",
  // },

  attendanceCard: {
    flexDirection: "row",
    backgroundColor: "#1C2541",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 5,
    marginBottom: 8,
    alignItems: 'flex-start',
    gap: 16,
    height: 170
  },

  calendarSection: {
    width: '50%',
  },

  monthText: {
    color: "#fff",
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 10,
    marginTop: 5,
    fontFamily:"Outfit-Regular"
  },

  calendarGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    width: "100%",
  },

  dayHeader: {
    color: "#936b87",
    width: "14.28%",
    textAlign: "center",
    fontSize: 8,
    fontWeight: "600",
    marginBottom: 4,
  },

  dayBox: {
    width: "14.28%",
    aspectRatio: 1,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 3,
    marginBottom: 2,
  },
  dayText: {
    fontSize: 9,
    fontWeight: "500",
  },
  attendanceStats: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-start",
    paddingTop: 0,
    width: "50%",
    marginTop: 5
  },

  sectionTitle: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 16,
    textAlign: "left",
    letterSpacing: 0.3,
    fontFamily:"Outfit-Regular"
  },

  statsRow: {
    flexDirection: "column",
    alignItems: "right",
    // justifyContent: "center",
    width: "120%",
    marginBottom: 20,
    marginLeft: -40
  },

  stats: {
    width: "100%",
    marginTop: -56,
    // margin:"auto",
    alignItems: "flex-end",
    // textAlign:"right"
    // paddingRight: 0,
    marginLeft: 8
  },
  present_box: {
    display: "flex",
    flexDirection: "row",
    gap: 3
  },
  color: {
    marginTop: 4,
    backgroundColor: "#8fb8f5ff",
    width: 10,
    height: 10
  },
  color_absent: {
    marginTop: 4,
    backgroundColor: "#fcb2b9ff",
    width: 10,
    height: 10
  },
  present: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "400",
    marginBottom: 6,
    textAlign: "right",
    fontFamily:"Outfit-Regular"
  },

  absent: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "400",
    marginBottom: 6,
    textAlign: "right",
    fontFamily:"Outfit-Regular"
  },

  late: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "400",
    textAlign: "right",
    marginRight: 16
  },

  markBtn: {
    width: "110%",
    backgroundColor: "#1565c0",
    paddingVertical: 7,
    paddingHorizontal: 18,
    borderRadius: 18,
    alignItems: "center",
    marginTop: 0,
  },

  markBtnText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
    fontFamily:"Outfit-Regular"
  },

});
export default Dashboard;
