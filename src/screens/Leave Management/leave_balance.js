import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    Dimensions,
} from "react-native";
import { BarChart } from "react-native-gifted-charts";
import axios from "axios";
import { API_BASE_URL } from "@env";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { width } = Dimensions.get("window");

const Leave_Balance = () => {
    const [token, setToken] = useState(null);
    const [LeaveList, setLeaveList] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadToken = async () => {
            const t = await AsyncStorage.getItem("authToken");
            setToken(t);
        };
        loadToken();
    }, []);

    useEffect(() => {
        if (token) {
            fetch_leave_list(token);
        }
    }, [token]);

    const fetch_leave_list = async (token) => {

        try {
            const response = await axios.post(
                `${API_BASE_URL}employee/employee-leave-type-list`,
                {},
                {
                    headers: {
                        "x-access-token": token,
                        "Content-Type": "application/json",
                    },
                }
            );

            if (response.data?.status === "success") {
                console.log(response.data, "response.data");

                setLeaveList(response.data.leave_type || []);
            }
        } catch (error) {
            console.log("API Error:", error);
        } finally {
            setLoading(false);
        }
    };

    const getLeaveByCode = (code) => {
        return (
            LeaveList.find(item => item.abbreviation === code) || {
                available: 0,
                total_balance: 0,
            }
        );
    };

    // const buildStack = (item) => {
    //     // const consumed = item.consumed || 0;
    //     const available = item.available || 0;
    //     const total = item.total_balance || 0;
    //     // const remaining = total - consumed;

    //     return {
    //         label: item.leave_type_name.split(" ")[0], // Short label
    //         stacks: [
    //             { value: available, color: "#1FB6CF" }, // Blue
    //             { value: total, color: "#D9D9D9" } // Light gray
    //         ],
    //         total: total,
    //         available: available

    //     };

    // };
    const buildStack = (item) => {
        const available = item.available || 0;
        const total = item.total_balance || 0;
        const used = total - available; // remaining part

        return {
            label: item.leave_type_name.split(" ")[0],
            stacks: [
                { value: available, color: "#1FB6CF" }, // 🔵 bottom (remaining leave)
                { value: used, color: "#D9D9D9" }       // ⚪ top
            ],
            total: total,
            available: available
        };
    };


    // const limitedLeaves = LeaveList.slice(0, 3);

    // const stackData = limitedLeaves.map(buildStack);
    const stackData = LeaveList.map(item => ({
        label: item.abbreviation,

        stacks: [
            {
                value: item.available,
                color: '#4a92d4'
            },
            {
                value: item.total_balance - item.available,
                color: '#E0E0E0'
            }
        ],

        total: item.total_balance,

        topLabelComponent: () => (
            <Text style={{ color: 'white', fontSize: 14 }}>
                {item.total_balance}
            </Text>
        ),

        // barInnerComponent: () => (
        //     <Text style={{ color: 'black', fontSize: 14 }}>
        //         {item.available}
        //     </Text>
        // )
        barInnerComponent: () => (
            <View style={{ flex: 1, justifyContent: 'flex-end', alignItems: 'center' }}>
                <Text style={{ color: 'black', fontSize: 14 }}>
                    {item.available}
                </Text>
            </View>
        )
    }));

    const paid = getLeaveByCode("PVL");
    const casual = getLeaveByCode("CSL");
    const sick = getLeaveByCode("SKL");

    if (loading) {
        return <Text style={styles.loading}>Loading leave balance...</Text>;
    }

    if (!LeaveList.length) {
        return <Text style={styles.loading}>No leave data found</Text>;
    }
    const chartWidth = stackData.length * 50;

    return (
        <View>

            <View style={styles.barchart}>

            <View style={styles.container}>
    <View style={styles.barchart}>
        <BarChart
            stackData={stackData}
            height={120}
            width={chartWidth}
            barWidth={20}
            spacing={20}
            hideRules
            initialSpacing={20}
            endSpacing={0}
            maxValue={
                Math.max(...stackData.map(i => i.stacks[0].value + i.stacks[1].value)) + 5
            }
            noOfSections={6}
            isAnimated
            animationDuration={800}
            xAxisLabelTextStyle={styles.xLabel}
            yAxisTextStyle={styles.yLabel}
        />
    </View>
</View>

            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    // barchart
    number: {
        color: "#f8f4f4ff",
        fontSize: 12,
        left: -20
    },
    
    title2: {
        color: "#FFFFFF",
        fontSize: 14,
        fontWeight: "700",
        marginBottom: -10,
        textAlign: "center",
    },
    loading: {
        color: "#fff",
        margin: "auto",
        marginTop: 100,
        marginLeft: 55
    },
    topLabel: {
        color: "#FFFFFF",   // ✅ white (top total)
        fontSize: 16,
        fontWeight: "600",
        marginBottom: 4
    },
    insideLabel: {
        color: "#000000",   // ✅ black (bottom available)
        fontSize: 12,
        marginBottom: 4
    },
    xLabel: {
        color: "#E0E0E0",
        fontSize: 12,
        marginTop: 3
    },
    yLabel: {
        color: "#CFCFCF",
        fontSize: 12
    },
    container: {
    alignItems: 'center',   // 🔥 centers horizontally
    justifyContent: 'center',
},

barchart: {
    height: 170,
    justifyContent: 'center',
    alignItems: 'center',   // 🔥 centers chart inside
},

});

export default Leave_Balance;
