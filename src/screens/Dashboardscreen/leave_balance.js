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
                console.log(response.data,"response.data");
                
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
                consumed: 0,
                total_balance: 0,
            }
        );
    };

    const paid = getLeaveByCode("PVL");
    const casual = getLeaveByCode("CSL");
    const sick = getLeaveByCode("SKL");

    if (loading) {
        return <Text style={styles.loading}>Loading leave balance...</Text>;
    }

    if (!LeaveList.length) {
        return <Text style={styles.loading}>No leave data found</Text>;
    }
    
    return (    
        <View>
            
        {/* <Text style={styles.title2}>Leave Balance</Text> */}
        <View style={styles.barchart}>
            <BarChart
                stackData={[
                    {
                        label: "Paid",
                        stacks: [{ value: paid.consumed, color: "#4FC3F7" }],
                    },
                    {
                        label: "",
                        stacks: [{
                            value: paid.total_balance,
                            color: "#000000",
                        }],
                    },
                    {
                        label: "Casual",
                        stacks: [{ value: casual.consumed, color: "#4FC3F7" }],
                    },
                    {
                        label: "",
                        stacks: [{
                            value: casual.total_balance,
                            color: "#000000",
                        }],
                    },
                    {
                        label: "Sick",
                        stacks: [{ value: sick.consumed, color: "#4FC3F7" }],
                    },
                    {
                        label: "",
                        stacks: [{
                            value: sick.total_balance ,
                            color: "#000000",
                        }],
                    },
                ]}
                horizontal
                height={110}
                width={width * 0.38}
                barWidth={16}
                spacing={3}


                maxValue={18}
                noOfSections={7}
                stepValue={2}

                hideRules
                yAxisThickness={0}
                xAxisThickness={0}
                showValuesAsTopLabel
                topLabelComponent={(item) => {
                    const total = item.value
                    return (
                        <Text style={styles.number}>
                            {total}
                        </Text>
                    );
                }}
                xAxisLabelTextStyle={{
                    color: "#AFC3D6",
                    fontSize: 9,
                    left: 0,
                    marginLeft: -3,
                    fontFamily:"Outfit-Regular"
                }}

                labelTextStyle={{
                    color: "#FFFFFF",
                    fontSize: 12,
                    width: 48,
                    textAlign: "right",
                    marginRight: 4,
                    fontFamily:"Outfit-Regular"
                }}
                topLabelTextStyle={{
                     color: "#FFFFFF",
                     fontFamily:"Outfit-Regular"
                }}
                formatYLabel={(value) => Math.round(value).toString()}
                yAxisTextStyle={{
                    color: "#FFFFFF",
                    fontSize: 10,
                    fontFamily:"Outfit-Regular",
                    
                }}

                isAnimated
                animationDuration={700}
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
    title2: {
        color: "#FFFFFF",
        fontSize: 14,
        fontWeight: "700",
        marginBottom: -10,
        textAlign: "center",
    },
    loading:{
        color:"#fff",
        margin:"auto",
        marginTop:100,
        marginLeft:55
    }
});

export default Leave_Balance;
