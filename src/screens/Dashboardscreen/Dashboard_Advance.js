import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    Dimensions,
    TouchableOpacity,
    Alert,
} from "react-native";
import { useNavigation } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import { useFocusEffect } from "@react-navigation/native";
import { useCallback } from "react";
import { API_BASE_URL } from "@env";
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import StatusPopup from "../StatusPopup/StatusPopup";
const { width } = Dimensions.get("window");

const Advance = ({ rights }) => {
    const navigation = useNavigation();
    const [token, setToken] = useState(null);
    const [advanceList, setAdvanceList] = useState([]);
    const [totalAdvanceAmount, setTotalAdvanceAmount] = useState(0);
    const [totalOutstanding, setTotalOutstanding] = useState(0);
    const [percentage, setPercentage] = useState(0);
    const [progress, setProgress] = useState(0);
    const [popupConfig, setPopupConfig] = useState({visible: false,type: "success", title: "",message: "",});
    // console.log("rights22", rights);

    // if (!rights) return null;
    const canApplyAttendance = rights?.apply?.includes("Attendance");
    const canApplyleave = rights?.apply?.includes("leave");
    const canApplyvault = rights?.apply?.includes("documents vault");
    const canApplypayslip = rights?.view?.includes("payslip");
    const canApplyadvance = rights?.apply?.includes("advance");
    const canApplyreimburdement = rights?.apply?.includes("reimbursement");
    // console.log("canApplyAttendance", canApplyAttendance);
    useEffect(() => {
        const loadToken = async () => {
            const t = await AsyncStorage.getItem("authToken");
            setToken(t);
        };
        loadToken();
    }, []);

    useEffect(() => {
        if (token) {
            fetchAdvanceList();
        }
    }, [token]);


    const showPopup = (type, title, message) => {
    setPopupConfig({
      visible: true,
      type,
      title,
      message,
    });
  };


    const handlePress = (item) => {

        if (item === "Attendance Management") {
            if (!canApplyAttendance) {
                showPopup("error", "Permission Denied", "you don't have This functionality");
                // Alert.alert(
                //     "Permission Denied",
                //     "you don't have This functionality"
                // );
                return;
            }
            // navigation.navigate("AttendanceScreen", { title: "Attendance" });
            navigation.navigate("Blank", { title: "Attendance" });
        }
        else if (item === "Payslips") {
            if(!canApplypayslip){
                showPopup("error", "Permission Denied", "you don't have This functionality");
                return;
            }
            navigation.navigate("Payslips", { title: item });
        }
        else if (item === "Expense Management") {
            if (!canApplyreimburdement) {
                 showPopup("error", "Permission Denied", "you don't have This functionality");
                // Alert.alert(
                //     "Permission Denied",
                //     "you don't have This functionality"
                // );
                return;
            }
            navigation.navigate("Expense", { title: item });
        }
        else if (item === "Advance Management") {
            if (!canApplyadvance) {
                 showPopup("error", "Permission Denied", "you don't have This functionality");
                // Alert.alert(
                //     "Permission Denied",
                //     "you don't have This functionality"
                // );
                return;
            }
            navigation.navigate("Advance", { title: item });
        }
        else if (item === "Document Vault") {
            if(!canApplyvault){
                showPopup("error", "Permission Denied", "you don't have This functionality");
                return;
            }
            navigation.navigate("document_vault", { title: item });
        }
        else if (item === "Leave Management") {
            if (!canApplyleave) {
                 showPopup("error", "Permission Denied", "you don't have This functionality");
                // Alert.alert(
                //     "Permission Denied",
                //     "you don't have This functionality"
                // );
                return;
            }
            navigation.navigate("Leave_Management", { title: item });
        }
    }




    const fetchAdvanceList = async () => {
        // console.log("Advancepage", token)
        if (!token) return;
        console.log("Advancepage1")
        try {
            // const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiNjhhODBjZTVkN2M1ZDkwMDFiYWMzOWE0IiwidXNlcl9lbWFpbCI6IiIsImNvcnBvcmF0ZV9pZCI6IlZCTCIsInVzZXJpZCI6IlRFU1QwMjEiLCJmaXJzdF9uYW1lIjoiU3VqaXRhIiwibGFzdF9uYW1lIjoia3VtYXIgRGFzIiwidXNlcl90eXBlIjoiZW1wbG95ZWUiLCJpYXQiOjE3NjE4MDI5NzIsImV4cCI6MTc5MzMzODk3Mn0.SNqI6EjWD_yi9MRwaFsE1lfgRbsn_twKxW0cTw5rvsg";
            const payload = {
                pageno: 1,
            };
            const res = await axios.post(`${API_BASE_URL}employee/employee-get-advance-list`,
                payload,
                {
                    headers: {
                        "x-access-token": token,
                        "Content-Type": "application/json",
                    },
                });

            if (res.data?.status === "success") {

                // setAdvanceList(res.data.advance_data.docs || []);
                const docs = res.data.advance_data.docs || [];
                setAdvanceList(docs);
                const totalAdvance = docs.reduce(
                    (sum, item) => sum + (Number(item.advance_amount) || 0),
                    0
                );
                const totalOutstanding = docs.reduce(
                    (sum, item) => sum + (Number(item.advance_outstanding) || 0),
                    0
                );

                // setTotalAdvanceAmount(totalAdvance);
                // setTotalOutstanding(totalOutstanding);
                const percent =
                    totalAdvance > 0
                        ? Math.round((totalOutstanding / totalAdvance) * 100)
                        : 0;

                const prog = percent / 100;

                setPercentage(percent);
                setProgress(prog);

                await AsyncStorage.setItem("percentage", JSON.stringify(percent));
                await AsyncStorage.setItem("progress", JSON.stringify(prog));
                // console.log("res.data.advance_data.docs1", JSON.stringify(percent));
                // console.log("res.data.advance_data.docs1", JSON.stringify(prog));

            }
        } catch (error) {
            console.log("Advance list error:", error);
        }
    };

    // const percentage =
    //     totalAdvanceAmount > 0
    //         ? Math.round((totalOutstanding / totalAdvanceAmount) * 100)
    //         : 0;

    // const progress = percentage / 100;



    return (
        <View>
            <LinearGradient
                colors={["#122441ff", "#0c3058ff"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.card}
            >
                <View style={styles.advance_card}>
                    <Text style={styles.sectionTitle}>Advance</Text>

                    <View style={styles.progressRow}>
                        <View style={styles.progressBarContainer}>
                            <View style={styles.progressBarBackground}>
                                <View
                                    style={[
                                        styles.progressBarFill,
                                        { width: `${progress * 100}%` }
                                    ]}
                                />
                            </View>
                        </View>

                        {/* Percentage */}
                        <Text style={styles.percentage}>{percentage}%</Text>
                    </View>
                </View>
                <View style={styles.advanceText}>
                    <View style={styles.amountItem}>
                        <Text style={styles.label}>Remaining</Text>
                        <Text style={styles.labelRight}>Total</Text>
                    </View>
                    <View style={styles.amountItemRight}>
                        <Text style={styles.amount}>₹{totalOutstanding}</Text>
                        <Text style={styles.amountRight}>₹{totalAdvanceAmount}</Text>
                    </View>
                </View>


            </LinearGradient>

            <LinearGradient
                colors={["#122441ff", "#143f70ff"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.card2}
            >
                <View style={styles.grid}>
                    {["Attendance Management", "Advance Management", "Document Vault", "Payslips", "Expense Management", "Leave Management"].map(
                        (item, index) => (
                            <TouchableOpacity key={index} style={styles.gridItem} onPress={() => handlePress(item)}>
                                <Text style={styles.gridText}>{item}</Text>
                            </TouchableOpacity>
                        )
                    )}
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
            </LinearGradient>
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        flex: 1,
        backgroundColor: "#1C2541",
        borderRadius: 20,
        padding: 15,
        marginBottom: 50,
        marginTop: -35,
        flexDirection: "row",
        paddingVertical: 1
    },
    card2: {
        flex: 1,
        backgroundColor: "#1C2541",
        borderRadius: 20,
        padding: 15,
        marginBottom: 50,
        marginTop: -35,
        flexDirection: "row",

    },
    advance_card: {
        marginTop: 5,
        flexDirection: "column"
    },
    sectionTitle: {
        color: "#fff",
        fontSize: 12,
        fontWeight: "400",
        alignSelf: "flex-start",
        marginBottom: 4,
        marginTop: 7,
        fontFamily:"Outfit-Bold"
    },
    progressRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 16,
        width: width * 0.54
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
        textAlign: "right",
        right: 30,
        fontFamily:"Outfit-Regular"
    },
    advanceText: {
        top: -8,
        // marginLeft:-30,
        right: 18,
        backgroundColor: "#144770ff",
        borderRadius: 15,
        marginTop: 15,
        flexDirection: "row",
        justifyContent: "space-between",
        width: "48%",
        paddingVertical: 10
    },
    amountItem: {
        // flex: 1,
        flexDirection: "column",
        left: 10
    },
    amountItemRight: {
        // flex: 1,
        // alignItems: "flex-end",
        // marginRight:60,
        justifyContent: "flex-start",
        right: 7

    },
    label: {
        color: "#fff",
        fontSize: 13,
        marginBottom: 2,
        fontFamily:"Outfit-Regular"
    },
    labelRight: {
        color: "#fff",
        fontSize: 13,
        marginBottom: 2,
        textAlign: "left",
        fontFamily:"Outfit-Regular"
    },
    amount: {
        color: "#ffffff",
        fontSize: 14,
        fontWeight: "500",
        textAlign: "right",
        fontFamily:"Outfit-Regular"
    },
    amountRight: {
        color: "#ffffff",
        fontSize: 14,
        fontWeight: "500",
        textAlign: "right",
        fontFamily:"Outfit-Regular"
    },
    grid: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
    },
    gridItem: {
        width: "48%",
        backgroundColor: "#144770ff",
        paddingVertical: 15,
        borderRadius: 15,
        alignItems: "center",
        marginBottom: 10,
    },
    gridText: {
        color: "#fff",
        fontWeight: "600",
        fontSize: 12,
        fontFamily:"Outfit-Regular"
    },
});

export default Advance;