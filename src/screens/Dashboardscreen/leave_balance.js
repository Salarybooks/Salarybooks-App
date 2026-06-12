// import React from "react";
// import {
//     View,
//     Text,
//     StyleSheet,
//     Dimensions,
//     TouchableOpacity,
//     ScrollView,
// } from "react-native";
// import { BarChart } from "react-native-gifted-charts";
// const { width } = Dimensions.get("window");
// const Leave_Balance = () => {
//     return (
//         <View style={styles.barchart}>
//             <BarChart
//                 stackData={[
//                     {
//                         label: "Paid",
//                         stacks: [
//                             { value: 7, color: "#4FC3F7" },
//                         ],
//                     },
//                     {
//                         label: "",
//                         stacks: [
//                             { value: 10, color: "#000000" },
//                         ],
//                     },
//                     {
//                         label: "Casual",
//                         stacks: [
//                             { value: 6, color: "#4FC3F7" },
//                         ],
//                     },
//                     {
//                         label: "",
//                         stacks: [
//                             { value: 9, color: "#000000" },
//                         ],
//                     },
//                     {
//                         label: "Sick",
//                         stacks: [
//                             { value: 4, color: "#4FC3F7" },
//                         ],
//                     },
//                     {
//                         label: "",
//                         stacks: [
//                             { value: 11, color: "#000000" },
//                         ],
//                     },
//                 ]}
//                 horizontal
//                 height={110}
//                 width={width * 0.38}
//                 barWidth={16}
//                 spacing={3}


//                 maxValue={14}
//                 noOfSections={7}
//                 stepValue={2}

//                 hideRules
//                 yAxisThickness={0}
//                 xAxisThickness={0}
//                 showValuesAsTopLabel
//                 topLabelComponent={(item) => {
//                     const total =item.value
//                         // item.stacks.reduce((sum, s) => sum + s.value, 0);
//                     return (
//                         <Text style={styles.number}>
//                             {total}
//                         </Text>
//                     );
//                 }}
//                 xAxisLabelTextStyle={{
//                     color: "#AFC3D6",
//                     fontSize: 9,
//                     left: 0
//                 }}

//                 labelTextStyle={{
//                     color: "#FFFFFF",
//                     fontSize: 12,
//                     width: 48,
//                     textAlign: "right",
//                     marginRight: 8,
//                 }}

//                 yAxisTextStyle={{
//                     color: "#AFC3D6",
//                     fontSize: 10,
//                 }}

//                 isAnimated
//                 animationDuration={700}
//             />

//         </View>
//     );
// }
// const styles = StyleSheet.create({

//     number:{
//          color: "#f8f4f4ff", 
//          fontSize: 12,
//           left: -20
//          }
// })
// export default Leave_Balance;

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
                // console.log(response.data, "response.data");

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


    const limitedLeaves = LeaveList.slice(0, 3);

    // const stackData = limitedLeaves.map(buildStack);
    const stackData = limitedLeaves.map(item => ({
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
            <Text style={{ color: 'white', fontSize: 8 }}>
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
                <Text style={{ color: 'black', fontSize: 7.5, fontWeight: 'bold', }}>
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
    const chartWidth = stackData.length * 70;

    return (
        <View>

            <View style={styles.barchart}>

                <BarChart
                    stackData={stackData}
                    height={120}
                    width={chartWidth}
                    barWidth={20}
                    spacing={19}
                    hideRules={true}
                    initialSpacing={3}   
                    endSpacing={0} 

                    // maxValue={Math.max(...stackData.map(i => i.total)) + 5}
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
    );
};

const styles = StyleSheet.create({
    // barchart
    number: {
        color: "#f8f4f4ff",
        fontSize: 12,
        left: -20
    },
    barchart: {
        width: "70%",
        alignItems: "left",
        justifyContent: "left",
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
    }

});

export default Leave_Balance;
