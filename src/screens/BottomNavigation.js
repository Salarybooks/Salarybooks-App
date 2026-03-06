import React, { useRef , useState} from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Animated,
  PanResponder,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from './ThemeContext';
import GlobalFont from '../theme/GlobalFont';
import StatusPopup from './StatusPopup/StatusPopup';
const { width } = Dimensions.get('window');

const BottomNavigation = ({ rights }) => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { isDarkMode } = useTheme();
  const translateY = useRef(new Animated.Value(0)).current;
  const [popupConfig, setPopupConfig] = useState({visible: false,type: "success", title: "",message: "",});
  

  const canApplyAttendance = rights?.apply?.includes("Attendance");
  const canApplyleave = rights?.apply?.includes("leave");
  const canApplypayslip = rights?.view?.includes("payslip");
  const canApplyreimburdement = rights?.apply?.includes("reimbursement");

  const handleHomePress = () => {
    navigation.navigate('Dashboard');
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        translateY.setOffset(translateY._value);
        translateY.setValue(0);
      },
      onPanResponderMove: (_, gestureState) => {
        translateY.setValue(gestureState.dy);
      },
      onPanResponderRelease: (_, gestureState) => {
        translateY.flattenOffset();
        if (gestureState.dy < -40) {
          handleHomePress();
        }
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
        }).start();
      },
    })
  ).current;

  const navItems = [
    { label: 'Expenses', icon: require('../assets/expenses.png'), screen: 'Expense',title:"Expense Management", permission:canApplyreimburdement},
    { label: 'Leaves', icon: require('../assets/leaves.png'), screen: 'Leave_Management',title:"Leave Management", permission:canApplyleave },
    { label: 'Payslips', icon: require('../assets/payslips.png'), screen: 'Payslips',title:"Payslips" ,permission:canApplypayslip},
    { label: 'Check In', icon: require('../assets/checkin.png'), screen: 'Blank',title:"Attendance Management",permission:canApplyAttendance },
    { label: 'Account', icon: require('../assets/settings.png'), screen: 'Account',title:"My Account",permission:true },
  ];

  const showPopup = (type, title, message) => {
    setPopupConfig({
      visible: true,
      type,
      title,
      message,
    });
  };

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom || 10 }]}>
      {/* Bottom Nav Items */}
      <View style={[styles.bottomNav, { backgroundColor: isDarkMode ? '#1c1c1c' : '#092338ff' }]}>
        {navItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.navItem}
            onPress={() => {
              if (!item.permission) {
                showPopup("error", "Permission Denied", "you don't have This functionality");
                return;
              }

              navigation.navigate(item.screen, { title: item.title });
            }}
          >
            <Image
              source={item.icon}
              style={[
                styles.navIconImage,
                { tintColor: isDarkMode ? '#ececec' : '#ffffffff' }
              ]}
            />
            <Text style={[GlobalFont.CustomFont,styles.navLabel, { color: isDarkMode ? '#ececec' : '#ffffffff' }]}>
              {item.label}
            </Text>
          </TouchableOpacity>
        ))}
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
      {/* Home Button */}
      <Animated.View
        style={[
          styles.homeButtonContainer,
          {
            transform: [{ translateY }],
          },
        ]}
        {...panResponder.panHandlers}
      >
        <TouchableOpacity onPress={handleHomePress}>
          <View style={[styles.homeButton, { backgroundColor: isDarkMode ? '#1c1c1c' : '#092338ff' }]}>
            <Image
              source={require('../assets/home_main.png')}
              style={[
                styles.homeIcon,
                { tintColor: isDarkMode ? '#ececec' : '#ffffffff' }
              ]}
            />
          </View>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

export default BottomNavigation;

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    width: '100%',
    height: 60,
    paddingTop: 10,
    borderTopWidth: 0.5,
    borderColor: '#333',
    zIndex: 2,
    // top:-10
  },
  navItem: {
    marginTop:-8,
    alignItems: 'center',
    width: width / 5,
  },
  navIconImage: {
    width: 22,
    height: 22,
    marginBottom: 4,
    resizeMode: 'contain',
  },
  navLabel: {
    fontSize: 11,
  },
  homeButtonContainer: {
    position: 'absolute',
    top: -25,
    zIndex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  homeButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  homeIcon: {
    width: 26,
    height: 26,
    resizeMode: 'contain',
    marginTop: -30
  },
});