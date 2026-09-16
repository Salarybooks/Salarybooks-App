import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    Dimensions,
    TouchableOpacity,
    ScrollView,
} from "react-native";
import LinearGradient from 'react-native-linear-gradient';
import { BarChart } from "react-native-gifted-charts";
import { PieChart } from "react-native-gifted-charts";
import { useNavigation } from '@react-navigation/native';
import LeaveManagement from '../Dashboardscreen/leave_balance'
import { API_BASE_URL } from "@env";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from "@react-navigation/native";
import { useCallback } from "react";
import axios from 'axios';
import StatusPopup from "../StatusPopup/StatusPopup";
const { width } = Dimensions.get("window");

function getReimbursementHeadLabel(item, heads = []) {
    if (!item) return "N/A";

    const populatedName =
        item.reimbursement_head?.head_name ||
        item.temp_head?.head_name ||
        item.head?.head_name ||
        (item.head_id && typeof item.head_id === "object"
            ? item.head_id.head_name
            : null);

    if (populatedName) return populatedName;

    const headId =
        (item.head_id && typeof item.head_id === "object"
            ? item.head_id._id ?? item.head_id.id
            : item.head_id) ||
        item.reimbursement_head_id ||
        item.reimbursement_head?._id ||
        item.head?._id;

    if (headId) {
        const match = heads.find(
            (h) => String(h._id) === String(headId) || String(h.id) === String(headId)
        );
        if (match?.head_name) return match.head_name;
        return String(headId);
    }

    return "N/A";
}

const Reimbursement = () => {
    const navigation = useNavigation();
    const [token, setToken] = useState(null);
    const [claimsData, setClaimsData] = useState([]);
    const [approved, setApproved] = useState(0);
    const [pending, setPending] = useState(0);
    const [rejected, setRejected] = useState(0);
    const [latestClaim, setLatestClaim] = useState(null);
    const [reimbursementHeads, setReimbursementHeads] = useState([]);
    const [rights, setRights] = useState(null);
    const canApplyleave = rights?.apply?.includes("leave");
    const [popupConfig, setPopupConfig] = useState({ visible: false, type: "success", title: "", message: "", });
    const canApplyreimburdement = rights?.apply?.includes("reimbursement");

    useEffect(() => {
        const loadToken = async () => {
            const t = await AsyncStorage.getItem("authToken");
            setToken(t);
            setRights(JSON.parse(await AsyncStorage.getItem("rights")))
            // console.log("TOKEN LOADEDaa:", t);
        };
        loadToken();
    }, []);

    useFocusEffect(
        useCallback(() => {
            if (token) {
                fetchClaimsData();
                fetchReimbursementHeads();
            }
        }, [token])
    );

    const showPopup = (type, title, message) => {
        setPopupConfig({
            visible: true,
            type,
            title,
            message,
        });
    };
    const screenLeave = () => {

        if (!canApplyleave) {
            showPopup("error", "Permission Denied", "you don't have This functionality");
            return;
        }
        navigation.navigate("Leave_Management", { title: "Leave Management" });
    }
    const screenExpence = () => {

        if (!canApplyreimburdement) {
            showPopup("error", "Permission Denied", "you don't have This functionality");
            return;
        }
        navigation.navigate('Expense', { title: "Expense Management" });
    }
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
                // console.log("docsexpense", docs);

                // const formattedData = docs.map((item) => ({
                //     id: item._id,
                //     date: formatDate(item.created_at),
                //     type: item.head_id || "N/A",
                //     amount: `${item.amount}`,
                //     status: capitalize(item.status),
                // }));

                // setClaimsData(formattedData);
                setLatestClaim(docs[0]);
                let approvedCount = 0;
                let pendingCount = 0;
                let rejectedCount = 0;

                docs.forEach(item => {
                    if (item.status === "active") approvedCount++;
                    else if (item.status === "pending") pendingCount++;
                    else if (item.status === "rejected") rejectedCount++;
                });

                setApproved(approvedCount);
                setPending(pendingCount);
                setRejected(rejectedCount);

                // console.log("latestClaim", latestClaim);

                setClaimsData(docs);
            } else {
                Alert.alert("Error", response.data.message || "Failed to load data");
            }
        } catch (error) {
            Alert.alert("Error", token);
            console.error("API Error:", error);
            if (error.response) {
                Alert.alert("Server Error", JSON.stringify(error.response.data));
            } else if (error.request) {
                Alert.alert("Network Error", "No response from backend.");
            } else {
                Alert.alert("Error", error.message);
            }
        }
    };

    const fetchReimbursementHeads = async () => {
        if (!token) return;
        try {
            const response = await axios.post(
                `${API_BASE_URL}employee/get-reimbursement-head`,
                {},
                {
                    headers: {
                        "x-access-token": token,
                        "Content-Type": "application/json",
                    },
                }
            );

            if (response.data.status === "success") {
                const heads = Array.isArray(response.data.temp_head)
                    ? response.data.temp_head
                    : Array.isArray(response.data.data)
                        ? response.data.data
                        : Array.isArray(response.data.data?.temp_head)
                            ? response.data.data.temp_head
                            : [];
                setReimbursementHeads(heads);
            }
        } catch (error) {
            console.error("Reimbursement heads error:", error);
        }
    };

    // const approved = 5;
    // const pending = 2;
    // const rejected = 2;

    const total = approved + pending + rejected;

    const data = [
        { value: approved, color: "#37abe0ff", text: "Approved" },
        { value: pending, color: "#F76C6C", text: "Pending" },
        { value: rejected, color: "#5E29F0", text: "Rejected" },
    ];

    return (
        <View >

            <View style={styles.row}>
                <LinearGradient
                    colors={["#07162cff", "#23568fff"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.card}
                >

                    <Text style={styles.title}>Reimbursement</Text>

                    <View style={styles.chartRow}>
                        <View style={styles.circleContainer}>
                            <PieChart
                                donut
                                radius={30}
                                innerRadius={15}
                                data={data}
                                backgroundColor="#0b244bff"
                            // centerLabelComponent={() => (
                            //     <Text style={{ color: "#fff", fontSize: 12, fontWeight: "600" }}>
                            //         {Math.round((approved / total) * 100)}%
                            //     </Text>
                            // )}
                            />
                        </View>

                        <View style={{ marginLeft: 20 }}>
                            <Text style={styles.subText}>
                                Approved: <Text style={[styles.value, { color: "#37abe0ff" }]}>{approved}</Text>
                            </Text>
                            <Text style={styles.subText}>
                                Pending: <Text style={[styles.value, { color: "#F76C6C" }]}>{pending}</Text>
                            </Text>
                            <Text style={styles.subText}>
                                Rejected: <Text style={[styles.value, { color: "#5E29F0" }]}>{rejected}</Text>
                            </Text>
                        </View>
                    </View>



                    <View style={styles.latestClaims}>
                        <Text style={styles.latestTitle}>Latest Claims</Text>
                        {latestClaim ? (
                            <View style={styles.claimRow}>
                                <Text style={styles.claimType} numberOfLines={1} ellipsizeMode="tail">
                                    {getReimbursementHeadLabel(latestClaim, reimbursementHeads)}
                                </Text>
                                <Text style={styles.claimAmount}>₹{latestClaim?.amount || 0}</Text>
                            </View>
                        ) : (
                            <Text style={{ color: "#9AA5C4", fontSize: 11, textAlign: "center", fontFamily: "Outfit-Regular" }}>
                                No claims available
                            </Text>
                        )}
                    </View>

                    {/* <TouchableOpacity style={styles.button}>
                            <Text style={styles.buttonText}>Apply Claim</Text>
                        </TouchableOpacity> */}

                    <TouchableOpacity
                        style={styles.button}
                        // onPress={() => navigation.navigate('Expense',{ title: "Expense Management" }) }
                        onPress={screenExpence}
                    >
                        <Text style={styles.buttonText}>Apply Claim</Text>
                    </TouchableOpacity>

                </LinearGradient>

                <LinearGradient
                    colors={["#0e264bff", "#23568fff"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.card2}
                >

                    <Text style={styles.title2}>Leave Balance</Text>
                    <View style={styles.barchart}>
                        <LeaveManagement />
                    </View>
                    <TouchableOpacity
                        style={styles.button2}
                        // onPress={() => navigation.navigate('Leave_Management',{ title: "Leave Management" })}
                        onPress={screenLeave}
                    >
                        <Text style={styles.buttonText2}>Apply Leave</Text>
                    </TouchableOpacity>

                </LinearGradient>
                <StatusPopup
                    visible={popupConfig.visible}
                    type={popupConfig.type}
                    title={popupConfig.title}
                    message={popupConfig.message}
                    onClose={() =>
                        setPopupConfig(prev => ({ ...prev, visible: false }))
                    }
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    row: {
        flexDirection: "row",
        justifyContent: "space-between",
        //  transform: [{ scaleY: .65 }],
    },
    card: {
        flex: 1,
        width: width * 0.48,
        backgroundColor: "#1C2541",
        borderRadius: 20,
        padding: 10,
        marginHorizontal: 5,
        marginVertical: 5,
        marginBottom: 50,
        marginLeft: -1,
    },
    title: {
        color: "#FFFFFF",
        fontSize: 14,
        // fontWeight: "700",
        marginBottom: 10,
        textAlign: "center",
        fontFamily: "Outfit-Bold"
    },
    chartRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 15,
    },
    circleContainer: {
        position: "relative",
        justifyContent: "center",
        alignItems: "center",
    },

    subText: {
        color: "#9AA5C4",
        fontSize: 11,
        marginVertical: 2,
        fontFamily: "Outfit-Regular"
    },
    value: {
        color: "#FFFFFF",
        fontWeight: "600",
        fontFamily: "Outfit-Regular"
    },
    latestClaims: {
        marginTop: 6,
        backgroundColor: "#2d3b55ff",
        padding: 6,
        borderRadius: 12,
    },
    latestTitle: {
        color: "#FFFFFF",
        fontSize: 11,
        marginBottom: 5,
        marginTop: -2,
        textAlign: "center",
        fontFamily: "Outfit-Regular"
    },
    claimRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    claimType: {
        color: "#9AA5C4",
        fontSize: 11,
        fontFamily: "Outfit-Regular",
        flex: 1,
        marginRight: 8,
    },
    claimAmount: {
        color: "#FFFFFF",
        fontSize: 11,
        fontWeight: "600",
        fontFamily: "Outfit-Regular",
        flexShrink: 0,
    },
    button: {
        backgroundColor: "#005C99",
        borderRadius: 15,
        paddingVertical: 6,
        marginTop: 19,
        alignItems: "center",
    },
    buttonText: {
        color: "#FFFFFF",
        fontSize: 11,
        fontWeight: "600",
        fontFamily: "Outfit-Regular"
    },


    card2: {
        width: width * 0.48,
        backgroundColor: "#1C2541",
        borderRadius: 20,
        padding: 10,
        marginHorizontal: 1,
        marginVertical: 5,
        marginBottom: 50,
        marginLeft: 1,
    },

    title2: {
        color: "#FFFFFF",
        fontSize: 14,
        // fontWeight: "700",
        marginBottom: 10,
        textAlign: "center",
        fontFamily: "Outfit-Bold"
    },
    //     barchart: {
    //     marginTop: -29, marginLeft: -40, margin: -20,
    // },
    barchart: {
        width: "90%",
         alignItems: "flex-start",
        justifyContent: "left",
         overflow: "hidden",
    },

    button2: {
        backgroundColor: "#005C99",
        borderRadius: 15,
        paddingVertical: 6,
        alignItems: "center",
        marginTop: "auto",
    },

    buttonText2: {
        color: "#FFFFFF",
        fontSize: 11,
        fontWeight: "600",
        fontFamily: "Outfit-Regular"
    },

});

export default Reimbursement;
