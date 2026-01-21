import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";

const StatusPopup = ({
  visible,
  type = "success", 
  title,
  message,
  onClose,
  onCancel,
  showCancel = false,
}) => {
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 6,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const iconConfig = {
    success: { name: "checkmark-circle", color: "#22C55E" },
    error: { name: "close-circle", color: "#EF4444" },
    info: { name: "information-circle", color: "#3B82F6" },
  };

  return (
    <Modal transparent visible={visible} animationType="none">
      <View style={styles.overlay}>
        <Animated.View
          style={[
            styles.container,
            {
              opacity: opacityAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <View  style={styles.close}>
          <Icon
            name={iconConfig[type].name}
            size={60}
            color={iconConfig[type].color}
          />
          {showCancel && (
            <TouchableOpacity
              onPress={onCancel}
            >
               <Text style={styles.closeBtn}>✖</Text>
            </TouchableOpacity>
          )}
          </View>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>
          
          <TouchableOpacity style={styles.button} onPress={onClose}>
            <Text style={styles.buttonText}>OK</Text>
          </TouchableOpacity>
          
        </Animated.View>
      </View>
    </Modal>
  );
};

export default StatusPopup;
const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    width: "80%",
    backgroundColor: "#1b4363",
    borderRadius: 20,
    padding: 25,
    alignItems: "center",
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    marginTop: 10,
    color: "#fff",
  },
  message: {
    fontSize: 14,
    color: "#fff",
    textAlign: "center",
    marginVertical: 10,
  },
  close:{
    display:"flex",
    flexDirection:"row",
    justifyContent:"center"
  },
  closeBtn: {
    color: "#FF4444",
    fontSize: 18,
    fontWeight: "bold",
    right:-80,
    marginTop:-10
  },
  button: {
    marginTop: 15,
    backgroundColor: "#2563EB",
    paddingHorizontal: 30,
    paddingVertical: 10,
    borderRadius: 12,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
  },
});
