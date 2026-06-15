import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  PermissionsAndroid,
  Platform,
  Alert,
} from "react-native";

import MapView, { Marker } from "react-native-maps";
// import Geolocation from "react-native-geolocation-service";
// import Geolocation from "react-native-geolocation-service";
// import { PermissionsAndroid, Platform } from "react-native";
import Geolocation from '@react-native-community/geolocation';

import { launchCamera } from 'react-native-image-picker';
import { Image } from 'react-native';
import { ActivityIndicator } from "react-native";
import { API_BASE_URL } from "@env";
import axios from "axios";
import AsyncStorage from '@react-native-async-storage/async-storage';

const MarkAttendance = () => {
  const [inTime, setInTime] = useState("");
  const [outTime, setOutTime] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [faceImage, setFaceImage] = useState(null);
  const [faceImage2, setFaceImage2] = useState(null);
  const [loadingLocation, setLoadingLocation] = useState(false);


  navigator.geolocation = Geolocation;
  const officeLocation = { latitude: 22.5057, longitude: 88.3567 };

  // Function to calculate distance (in meters)
  const getDistance = (lat1, lon1, lat2, lon2) => {
    const toRad = (v) => (v * Math.PI) / 180;
    const R = 6371e3; // meters
    const φ1 = toRad(lat1);
    const φ2 = toRad(lat2);
    const Δφ = toRad(lat2 - lat1);
    const Δλ = toRad(lon2 - lon1);

    const a =
      Math.sin(Δφ / 2) ** 2 +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // distance in meters
  };


  //   const requestLocationPermission = async () => {
  //   if (Platform.OS === "android") {
  //     try {
  //       const fine = await PermissionsAndroid.request(
  //         PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
  //       );

  //       const coarse = await PermissionsAndroid.request(
  //         PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION
  //       );

  //       return fine === "granted" || coarse === "granted";
  //     } catch (e) {
  //       console.log("Permission error:", e);
  //       return false;
  //     }
  //   }
  //   return true;
  // };


  async function requestPermission() {
    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: "Location Permission",
            message: "App needs access to your GPS location",
            buttonNeutral: "Ask Me Later",
            buttonNegative: "Cancel",
            buttonPositive: "OK"
          }
        );

        return granted === PermissionsAndroid.RESULTS.GRANTED;
      }
    } catch (err) {
      console.warn(err);
    }
    return false;
  }

  //   const validateLocation = async () => {
  //     console.warn("1")
  //     try {
  //       const permission = await requestPermission();
  //       if (!permission) {
  //         Alert.alert("Permission Required", "Please enable location access.");
  //         return false;
  //       }
  // console.warn("2")
  //       return new Promise((resolve) => {
  //         Geolocation.getCurrentPosition(
  //           (pos) => {
  //             const { latitude, longitude } = pos.coords;
  //             const distance = getDistance(
  //               latitude,
  //               longitude,
  //               officeLocation.latitude,
  //               officeLocation.longitude
  //             );
  //             console.warn("3")
  //             console.log("✔ Current Location:", latitude, longitude);
  //             console.log("Distance:", distance);
  //             if (distance <= 100) {
  //               resolve(true);
  //             } else {
  //               Alert.alert(
  //                 "Outside Office Area",
  //                 "You must be within 100 meters of the office."
  //               );
  //               resolve(false);
  //             }
  //           },
  //           (error) => {
  //             console.error("Location error:", error);
  //             Alert.alert("Error", `Unable to fetch location: ${error.message}`);
  //             resolve(false);
  //           },
  //           { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
  //         );
  //       });
  //     } catch (error) {
  //       console.error("validateLocation failed:", error);
  //       Alert.alert("Error", "Something went wrong while checking location.");
  //       return false;
  //     }
  //   };


  async function getLocation() {
    const hasPermission = await requestPermission();
    if (!hasPermission) return false;

    setLoadingLocation(true);

    return new Promise((resolve) => {
      Geolocation.getCurrentPosition(
        (pos) => {
          // console.log("POSITION:", pos);

          setLatitude(pos.coords.latitude);
          setLongitude(pos.coords.longitude);

          setLoadingLocation(false);
          resolve({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          });
        },
        (error) => {
          // console.log("LOCATION ERROR:", error);
          Alert.alert("Error", error.message);

          setLoadingLocation(false);
          resolve(false); 
        },
        {
          enableHighAccuracy: true,
          timeout: 40000,
          maximumAge: 0,
        }
      );
    });
  }


  // const handleCheckIn = async () => {
  //   // const isInside = await validateLocation();
  //   const isInside = await getLocation();
  //   console.log("Date and time:", isInside);
  //   if (isInside) {
  //     const now = new Date().toLocaleTimeString([], {
  //       hour: "2-digit",
  //       minute: "2-digit",
  //     });
  //     setInTime(now);
  //     console.log("Date and time:", now);
  //   }
  // };

  // const handleCheckIn = async () => {

  //   const isInside = await getLocation();
  //   if (!isInside) return;

  //   // if (!faceImage) {
  //   //   Alert.alert("Face Required", "Please capture your face first.");
  //   //   return;
  //   // }
  //   const token = await AsyncStorage.getItem("authToken");

  //   console.log("API_BASE_URL", API_BASE_URL, "token", token);
  //   console.log("isInside", isInside);

  //   const now = new Date();
  //   const timeStr = now.toLocaleTimeString([], {
  //     hour: "2-digit",
  //     minute: "2-digit",
  //   });

  //   setInTime(timeStr);

  //   const payload = {
  //     attendance_month: now.getMonth(), // 0-11
  //     attendance_year: now.getFullYear(),
  //     register_type: "time",
  //     // emp_id: "021", // ← get from logged-in user
  //     login_time: timeStr,
  //     logout_time: "",
  //   };
  //   console.log("payload", payload);

  //   try {
  //     const response = await axios.post(`${API_BASE_URL}employee/add-time-attendance`, payload, {
  //       headers: {
  //         "Content-Type": "application/json",
  //         "x-access-token": token,
  //       },
  //     });

  //     if (response.data.status === "success") {
  //       Alert.alert("Success", "Check-in marked successfully");
  //     } else {
  //       Alert.alert("Error", response.data.message);
  //     }
  //   } catch (err) {
  //     console.log("API ERROR:", err);
  //     Alert.alert("Error", "Failed to mark attendance");
  //   }
  // };

  const handleCheckInCheckout = async () => {

    const isFaceMatched = await verifyFace();

    // if (!isFaceMatched) {
    //   Alert.alert("Face Mismatch", "Face verification failed");
    //   return;
    // }
    // if (isFaceMatched) {
    //   Alert.alert("Face Match", "Face verification failed");
    // }
    const location = await getLocation();

    if (!location) {
      setLoading(false);
      Alert.alert("Error", "Unable to fetch location");
      return;
    }
    const token = await AsyncStorage.getItem("authToken");
    if (!token) {
      Alert.alert("Error", "User not authenticated");
      return;
    }

    const now = new Date();

    const payload = {
      latitude: location.latitude.toString(),
      longitude: location.longitude.toString(),
      attendance_date: now.toISOString().split("T")[0],
      attendance_stat: 'P',
      login_time: now.toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }), // HH:mm:ss
    };

    // console.log("CHECK IN PAYLOAD:", payload);

    try {
      const response = await axios.post(
        `${API_BASE_URL}employee/check-in-check-out`,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
            "x-access-token": token, // or Authorization: Bearer token
          },
        }
      );

      if (response.data.status === "success") {

        const timeStr = now.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        });
        if (!inTime) {

          setInTime(timeStr);
        } else {

          setOutTime(timeStr);
        }
        Alert.alert("Success", response.data.message);
      } else {
        Alert.alert("Error", response.data.message);
      }
    } catch (error) {
      // console.log("API ERROR:", error);
      Alert.alert("Error", "Something went wrong");
    }
  };


  // const handleCheckOut = async () => {
  //   const isInside = await getLocation();
  //   if (isInside) {
  //     const now = new Date().toLocaleTimeString([], {
  //       hour: "2-digit",
  //       minute: "2-digit",
  //     });
  //     setOutTime(now);

  //   }
  // };

  const handleCheckOut = async () => {
    const isInside = await getLocation();
    if (!isInside) return;

    const now = new Date();
    const timeStr = now.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    setOutTime(timeStr);

    const payload = {
      attendance_month: now.getMonth(),
      attendance_year: now.getFullYear(),
      register_type: "time",
      emp_id: "021",
      login_time: inTime,
      logout_time: timeStr,
    };

    try {
      await axios.post(API_URL, payload, {
        headers: {
          Authorization: `Bearer YOUR_TOKEN_HERE`,
        },
      });
      Alert.alert("Success", "Check-out marked");
    } catch (e) {
      Alert.alert("Error", "Checkout failed");
    }
  };


  async function requestCameraPermission() {
    if (Platform.OS === "android") {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: "Camera Permission",
            message: "App needs camera access to capture your face.",
            buttonNegative: "Cancel",
            buttonPositive: "OK"
          }
        );

        return granted === PermissionsAndroid.RESULTS.GRANTED;

      } catch (err) {
        console.warn(err);
        return false;
      }
    }

    return true; // iOS auto grants
  }
  const handleFaceRecognition = async () => {
    const permission = await requestCameraPermission();

    if (!permission) {
      Alert.alert("Permission Denied", "Camera permission is required.");
      return;
    }

    openCamera();  
  };

  // const openCamera = async () => {
  //   const options = {
  //     mediaType: 'photo',
  //     saveToPhotos: false,
  //     includeBase64: true,
  //   };

  //   launchCamera(options, (response) => {
  //     if (response.didCancel) {
  //       console.log("User cancelled camera");
  //     } else if (response.errorMessage) {
  //       console.log("Camera Error: ", response.errorMessage);
  //       Alert.alert("Camera Error", response.errorMessage);
  //     } else {
  //       const photo = response.assets[0];
  //       setFaceImage(photo.uri);
  //       Alert.alert("Face Captured", "Your attendance photo is recorded.");
  //     }
  //   });
  // };


  const openCamera = async () => {
    const options = {
      mediaType: 'photo',
      includeBase64: true,
      saveToPhotos: false,
    };

    launchCamera(options, (response) => {
      if (!response.didCancel && !response.errorMessage) {
        const photo = response.assets[0];
        setFaceImage(photo.base64); // ✅ store base64
        setFaceImage2(photo.uri);
        Alert.alert("Face Captured");
      }
    });


  };


  const verifyFace = async () => {
    const attendenceimageUrl = await AsyncStorage.getItem("attendenceimageUrl");

    if (!attendenceimageUrl || !faceImage) {
      Alert.alert("Error", "Face data missing");
      return false;
    }

    try {
      const res = await axios.post(
        `${API_BASE_URL}employee/compare-face`,
        {
          registeredImageUrl: attendenceimageUrl,
          capturedImageBase64: faceImage,
        },
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      return res.data.match === true;
    } catch (err) {
      console.log("Face compare error", err);
      return false;
    }
  };


  //   const loadAttendanceImage = async () => {
  //   const attendenceimageUrl = await AsyncStorage.getItem("attendenceimageUrl");
  //   console.log("attendenceimageUrl", attendenceimageUrl);
  // };

  useEffect(() => {
    const imageUrl = AsyncStorage.getItem("attendenceimageUrl");
    console.log("attendenceimageUrl", imageUrl);
    // loadAttendanceImage();

    // setInTime("")
    // console.log("Intime",inTime);

  }, []);



  return (
    <View>


      {/* Section Title */}
      <Text style={styles.sectionTitle}>Mark Attendance</Text>

      {/* Map */}
      {/* <View style={styles.mapContainer}>
        <MapView
          style={{ width: "100%", height: 150 }}
          initialRegion={{
            latitude: officeLocation.latitude,
            longitude: officeLocation.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
        >
          <Marker
            coordinate={officeLocation}
            title="Vauras Advisory Services"
            description="Lake Gardens, Kolkata"
          />
        </MapView>
      </View> */}

      {/* Check Buttons */}
      <View style={styles.checkButtons}>
        <TouchableOpacity
          style={[styles.checkButton, styles.checkIn]}
          onPress={handleCheckInCheckout}
        >
          <Text style={styles.checkText}>CHECK IN</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.checkButton, styles.checkOut]}
          onPress={handleCheckInCheckout}
        >
          <Text style={styles.checkText}>CHECK OUT</Text>
        </TouchableOpacity>
      </View>

      {loadingLocation && (
        <View style={{ marginTop: 10, alignItems: "center" }}>
          <Text style={{ color: "#fff", marginBottom: 5 }}>Fetching Location...</Text>
          <ActivityIndicator size="large" color="#00FFB3" />
        </View>
      )}



      <View style={styles.timeRow}>
        <View style={styles.timeBox}>
          <Text style={styles.timeLabel}>latitude : {latitude}</Text>
        </View>
        <View style={styles.timeBox}>
          <Text style={styles.timeLabel}>longitude : {longitude}</Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.faceBtn}
        onPress={handleFaceRecognition}
      >
        <Text style={{ color: "#fff", fontWeight: "700" }}>Face Recognition</Text>
      </TouchableOpacity>

      {faceImage2 && (
        <View style={{ alignItems: "center", marginTop: 20 }}>
          <Text style={{ color: "#fff", marginBottom: 10 }}>Captured Face:</Text>
          <Image
            source={{ uri: faceImage2 }}
            style={{ width: 120, height: 120, borderRadius: 10 }}
          />
        </View>
      )}

      {/* Time Details */}
      <View style={styles.timeRow}>
        <View style={styles.timeBox}>
          <Text style={styles.timeLabel}>IN TIME : {inTime}</Text>
        </View>
        <View style={styles.timeBox}>
          <Text style={styles.timeLabel}>OUT TIME : {outTime}</Text>
        </View>
      </View>

      {/* Status */}
      <View style={styles.statusBox}>
        <Text style={styles.statusText}>
          Today's Status :{" "}
          {inTime !== "" ? `PRESENT at ${inTime}` : "Not Marked"}
        </Text>
      </View>
    </View>
  );

}

const styles = StyleSheet.create({

  sectionTitle: { color: "#fff", fontSize: 16, fontWeight: "700", marginBottom: 10 },
  mapContainer: {
    height: 150,
    marginHorizontal: 40,
    borderRadius: 10,
    overflow: "hidden",
    marginBottom: 15,
  },
  checkButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  checkButton: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: "center",
    marginHorizontal: 5,
  },
  checkIn: { backgroundColor: "#00916E" },
  checkOut: { backgroundColor: "#A4161A" },
  checkText: { color: "#fff", fontWeight: "700", fontSize: 15 },
  timeRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 10 },
  timeBox: {
    backgroundColor: "#1E2A47",
    padding: 10,
    borderRadius: 10,
    width: "48%",
    alignItems: "center",
  },
  timeLabel: { color: "#fff", fontSize: 13 },
  statusBox: {
    backgroundColor: "#1E2A47",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  statusText: { color: "#00FFB3", fontSize: 14, fontWeight: "600" },
  faceBtn: {
    backgroundColor: "#3B82F6",
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 8,
    marginTop: 10,
    alignItems: "center",
  },



});


export default MarkAttendance;