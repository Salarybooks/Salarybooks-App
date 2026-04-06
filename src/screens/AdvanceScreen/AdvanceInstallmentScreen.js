import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from "react-native";
import LinearGradient from "react-native-linear-gradient";
import BottomNavigation from "../BottomNavigation";

export default function InstallmentHistoryScreen({ route }) {
  const data = route?.params?.data;
  console.log(data, "data");

  // progress percentage
  const pct = data.advance_amount
    ? (data.advance_recovered / data.advance_amount) * 100
    : 0;

  return (
    <LinearGradient
      colors={["#062945", "#0A355A", "#0E4A7A"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ flex: 1 }}
    >
      <ScrollView style={styles.container}>

        {/* Title */}
        <Text style={styles.heading}>Installment History</Text>

        {/* Card */}
        <View style={styles.card}>

          {/* Percentage */}
          <Text style={styles.percent}>{Math.round(pct)}%</Text>

          {/* Progress Bar */}
          <View style={styles.progressBG}>
            <View
              style={[
                styles.progressFill,
                { width: `${pct}%` },
              ]}
            />
          </View>

          {/* Amount Row */}
          <View style={styles.row}>
            <View>
              <Text style={styles.amount}>₹{data.advance_amount}</Text>
              <Text style={styles.small}>Total Advance</Text>
            </View>
            <View>
              <Text style={styles.amount}>₹{data.advance_outstanding}</Text>
              <Text style={styles.small}>Remaining</Text>
            </View>
          </View>

          {/* EMI Box */}
          <View style={styles.emiBox}>
            <Text style={styles.emiText}>
              EMI : ₹{(data.advance_amount / data.no_of_instalments).toFixed(2)} / month
            </Text>
          </View>

          {/* TABLE HEADER */}
          <View style={styles.tableHeader}>
            <Text style={styles.th}>S No.</Text>
            <Text style={styles.th}>Month</Text>
            <Text style={styles.th}>Year</Text>
            <Text style={styles.th2}>Recovery From</Text>
            <Text style={styles.th}>Amt</Text>
            <Text style={styles.th}>Status</Text>
          </View>

          {/* TABLE ROWS */}
          {data.instalment_history?.map((row, index) => (
            <View key={index} style={styles.tableRow}>
              <Text style={styles.td}>{`${index + 1}.`}</Text>
              <Text style={styles.td}>{monthName(row.instalment_month)}</Text>
              <Text style={styles.td}>{row.instalment_year}</Text>
              {/* <Text style={styles.td2}>{row.recovery_from}</Text> */}
              <Text style={styles.td2}>
                {row.recovery_from === "incentive"
                  ? "Incentive"
                  : row.recovery_from === "gross_earning"
                    ? "Gross Earning"
                    : row.recovery_from === "bonus"
                      ? "Bonus"
                      : row.recovery_from}
              </Text>
              <Text style={styles.td}>{row.advance_amount}</Text>
              <Text
                style={[
                  styles.status,
                  row.payment_status === "paid"
                    ? styles.statusPaid
                    : styles.statusPending,
                ]}
              >
                {row.payment_status === "paid" ? "Paid" : "Pending"}
              </Text>
            </View>
          ))}

        </View>
      </ScrollView>
      <BottomNavigation />
    </LinearGradient>
  );
}

// Month function
function monthName(monthNo) {
  return [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sept",
    "Oct",
    "Nov",
    "Dec",
  ][monthNo];
}

// Styles
const styles = StyleSheet.create({
  container: { padding: 20 },
  heading: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 10,
  },
  card: {
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: 15,
    padding: 15,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
  },
  percent: {
    color: "#fff",
    fontSize: 26,
    fontWeight: "700",
    marginBottom: 5,
  },
  progressBG: {
    width: "100%",
    height: 10,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 5,
    marginBottom: 15,
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#29ABE2",
    borderRadius: 5,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  amount: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  small: {
    color: "#9EC2D8",
    fontSize: 12,
  },
  emiBox: {
    backgroundColor: "rgba(255,255,255,0.08)",
    padding: 10,
    borderRadius: 8,
    marginBottom: 15,
  },
  emiText: { color: "#AED2E9", fontSize: 14 },

  tableHeader: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.2)",
    paddingBottom: 6,
    marginBottom: 6,
  },
  th: { flex: 1, color: "#AED2E9", fontSize: 12, fontWeight: "600" },
  th2: { flex: 1.4, color: "#AED2E9", fontSize: 12, fontWeight: "600" },

  tableRow: {
    flexDirection: "row",
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.08)",
  },

  td: { flex: 1, color: "#fff", fontSize: 13 },
  td2: { flex: 1.4, color: "#fff", fontSize: 13 },

  status: {
    flex: 1,
    paddingVertical: 2,
    paddingHorizontal: 5,
    textAlign: "center",
    borderRadius: 5,
    fontSize: 12,
    fontWeight: "600",
  },
  statusPaid: {
    backgroundColor: "rgba(0,200,100,0.2)",
    color: "#00C864",
  },
  statusPending: {
    backgroundColor: "rgba(255,180,0,0.2)",
    color: "#FFB400",
  },
});
