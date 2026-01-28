import React, { useEffect , useState} from 'react';
import { View, Text, ScrollView, StyleSheet,Image } from 'react-native';
import { useRoute } from "@react-navigation/native";
import LinearGradient from 'react-native-linear-gradient';
import Navbar from '../Dashboardscreen/navbar';
import BottomNavigation from '../BottomNavigation';
import AsyncStorage from '@react-native-async-storage/async-storage';
export default function Blank() {
  const route = useRoute();
  const screenTitle = route.params?.title;
  const [rights,setRights]=useState(false);
  useEffect(()=>{
    const loadtoken=async()=>{
      setRights( JSON.parse(await AsyncStorage.getItem("rights")));
      
    }
    loadtoken();
  }, [])
  
  return (
    <LinearGradient
      colors={["#000000ff", "#1c68beff"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Header */}
        <View style={styles.header}>
          <Image
              source={require("../../assets/Attendance_Managemant.png")}
              style={styles.header_iconImage}
            />
          <Navbar title={screenTitle} />
        </View>

        {/* Center Text */}
        <View style={styles.middle_text}>
          <Text style={styles.middleText}>
            We are Developing this page...
          </Text>
        </View>
      </ScrollView>
      <BottomNavigation rights={rights}/>
    </LinearGradient>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
  },
    header: {
    flexDirection:"row",
    width: "100%",
    marginBottom: 12,
    alignItems:"center",
    gap:5
  },
    header_iconImage: {
    width: 40,
    padding:21,
    height: 20,
    marginLeft: -7,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 60,
  },
  middle_text: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  middleText: {
    color: "#fff",
    fontSize: 16,
    opacity: 0.8,
  },
});
