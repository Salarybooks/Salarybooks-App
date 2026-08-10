import React, { useCallback, useEffect, useState } from "react";
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
import { useNavigation, useRoute } from "@react-navigation/native";
import axios from "axios";
import { API_BASE_URL } from "@env";
const daysOfWeek = ["S", "M", "T", "W", "T", "F", "S"];



const Dashboard = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const [userData, setUserData] = useState(route.params?.userData || null);
  const [token, setToken] = useState(route.params?.token || null);
  const [empData, setEmpData] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [attendenceImageUrl, setAttendenceImageUrl] = useState(null);
  const [rights, setRights] = useState(null);
  const [present, setPresent] = useState(null);
  const [absent, setAbsent] = useState(null);
  const [presentDates, setPresentDates] = useState([]);
  const [absentDates, setAbsentDates] = useState([]);
  // Same permission logic as BottomNavigation (footer bar)
  const hasRights = rights && Object.keys(rights).length > 0;
  const hasPerm = (list, name) =>
    Array.isArray(list) && list.some((i) => String(i).toLowerCase() === String(name).toLowerCase());
  const canApplyAttendance = hasRights ? hasPerm(rights?.apply, "Attendance") : true;
  const [popupConfig, setPopupConfig] = useState({visible: false,type: "success", title: "",message: "",});

  const showPopup = (type, title, message) => {
    setPopupConfig({
      visible: true,
      type,
      title,
      message,
    });
  };

  const saveImageUrl = async (profilePic) => {
    const url = profilePic
      ? `${API_BASE_URL}${profilePic.replace(/\\/g, "/")}`
      : null;
    setImageUrl(url);
    if (url) await AsyncStorage.setItem("imageUrl", url);
  };

  const saveAttendenceImageUrl = async (profilePic) => {
    const url = profilePic
      ? `${API_BASE_URL}${profilePic.replace(/\\/g, "/")}`
      : null;
    setAttendenceImageUrl(url);
    if (url) await AsyncStorage.setItem("attendenceimageUrl", url);
  };

  const fetchemployeedata = async (authToken) => {
    if (!authToken) return null;
    try {
      const res = await axios.post(
        `${API_BASE_URL}employee/get-account`,
        { pageno: 1 },
        {
          headers: {
            "x-access-token": authToken,
            "Content-Type": "application/json",
          },
        }
      );

      if (res.data?.status === "success") {
        const employeeData = res.data.employee_data;
        await AsyncStorage.setItem("employee_id", employeeData[0].employee_details.employee_id);
        await AsyncStorage.setItem("employee_mongose_id", employeeData[0]._id);
        const bankDetails = employeeData[0]?.employee_details?.bank_details;

        if (bankDetails) {
          await AsyncStorage.setItem(
            "employee_bank_details",
            JSON.stringify(bankDetails)
          );
        }

        setEmpData(employeeData);
        saveImageUrl(employeeData?.[0]?.profile_pic);
        saveAttendenceImageUrl(employeeData?.[0]?.attendence_pic);

        const rightsData = employeeData?.[0]?.employee_details?.employment_hr_details?.emp_role_data?.rights;
        setRights(rightsData);
        if (rightsData) {
          AsyncStorage.setItem("rights", JSON.stringify(rightsData));
        }
        return employeeData;
      }

      // console.log("get-account failed:", res.data?.status, res.data?.message);
    } catch (error) {
      // console.log("get-account error:", error?.response?.data || error?.message || error);
    }
    return null;
  };

  const fetchattendencedata = async (authToken, currentUser, employeeData) => {
    if (!authToken || !currentUser?.emp_id) return;
    const now = new Date();
    try {
      const payload = {
        sys_emp_id: currentUser.sys_emp_id,
        emp_id: currentUser.emp_id,
        attendance_month: String(now.getMonth()),
        attendance_year: String(now.getFullYear()),
        register_type: employeeData?.[0]?.employee_details?.template_data?.attendance_temp_data?.register_type,
      };

      const res = await axios.post(
        `${API_BASE_URL}employee/employee-get-attendance-mobile`,
        payload,
        {
          headers: {
            "x-access-token": authToken,
            "Content-Type": "application/json",
          },
        }
      );
      if (res.data?.status === "success") {
        setPresent(res.data?.attendance_summary.present);
        setAbsent(res.data?.attendance_summary.leave);
        setPresentDates(res.data?.attendance_summary.present_date || []);
        setAbsentDates(res.data?.attendance_summary.absent_date || []);
      }
    } catch (error) {
      // console.log("attendance error:", error?.response?.data || error?.message || error);
          }
  };

  const loadDashboardData = useCallback(async () => {
    try {
      // Prefer login params, fallback to AsyncStorage
      let t = route.params?.token;
      let u = route.params?.userData;

      if (!t) t = await AsyncStorage.getItem("authToken");
      if (!u) {
        const raw = await AsyncStorage.getItem("userData");
        u = raw ? JSON.parse(raw) : null;
      }

      setToken(t);
      setUserData(u);

      if (!t) {
        // console.log("Dashboard: no token found");
        return;
      }

      const employeeData = await fetchemployeedata(t);
      await fetchattendencedata(t, u, employeeData);
    } catch (error) {
      // console.log("Dashboard load error:", error?.message || error);
    }
  }, [route.params?.token, route.params?.userData]);

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

  const screenAttendace = () => {
    if (!canApplyAttendance) {
      showPopup("error", "Permission Denied", "you don't have This functionality");
      return;
    }
    navigation.navigate("Blank", { title: "Attendance" });
  };

  // Load once after mount (delay = after login animation)
  useEffect(() => {
    const timer = setTimeout(() => {
      loadDashboardData();
    }, 400);
    return () => clearTimeout(timer);
  }, [loadDashboardData]);

  // Reload when returning via footer home
  useEffect(() => {
    const unsub = navigation.addListener("focus", () => {
      loadDashboardData();
    });
    return unsub;
  }, [navigation, loadDashboardData]);

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const totalDays = new Date(year, month + 1, 0).getDate();
  const presentDaySet = getDaySetFromDates(presentDates, year, month);
  const presentCount = presentDaySet.size;
  const progressValue = totalDays === 0 ? 0 : presentCount / totalDays;
  const attendancePercentage = Math.round(progressValue * 100);
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
                    progress={progressValue}
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

          <Reimbursement rights={rights} />
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
