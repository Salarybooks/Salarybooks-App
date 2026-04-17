import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Image,
  Alert
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import LinearGradient from 'react-native-linear-gradient';
import BottomNavigation from '../BottomNavigation';
import AsyncStorage from '@react-native-async-storage/async-storage';
const { width } = Dimensions.get('window');
import axios from "axios";
import { API_BASE_URL } from "@env";
import StatusPopup from '../StatusPopup/StatusPopup';


const AddressForm = () => {
  const [isDifferent, setIsDifferent] = useState('no');
  const [token, setToken] = useState(null);
  const [address, setAddress] = useState(null);
  const [curaddress, setCurAddress] = useState(null);
  const [unApproveAddress, setUnApproveAddress] = useState(null);
  const [curUnApproveAddress, setCurUnApproveAddress] = useState(null);
  const [addressDetailsStatus, setAddressDetailsStatus] = useState(null);
  const [rejectedRemark, setrejectedRemark] = useState(null);
  const [userData, setUserData] = useState(null);
  const isHydratedRef = useRef(false);
  const [employee_id, setemployee_id] = useState(null);
  const [pincodeError, setPincodeError] = useState('');
  const [currPincodeError, setCurrPincodeError] = useState('');
  const [rights, setRights] = useState(false);
  const [updateButton, setUpdateButton] = useState(false);
  const [popupConfig, setPopupConfig] = useState({ visible: false, type: "success", title: "", message: "", });
  
  const [form, setForm] = useState({
    resident_no: '',
    residential_name: '',
    road: '',
    locality: '',
    city: '',
    district: '',
    state: '',
    pincode: '',
    country: '',
    diff_current_add: '',
    curr_resident_no: '',
    curr_residential_name: '',
    curr_road: '',
    curr_locality: '',
    curr_city: '',
    curr_district: '',
    curr_state: '',
    curr_pincode: '',
    curr_country: '',
  });
  useEffect(() => {
    const loadTokenAndFetch = async () => {
      const t = await AsyncStorage.getItem("authToken");
      const userData = JSON.parse(await AsyncStorage.getItem("userData"));
      const employee_address = JSON.parse(await AsyncStorage.getItem("employee_address"));
      const employee_curr_address = JSON.parse(await AsyncStorage.getItem("employee_curr_address"));
      const emp_unapprove_address = JSON.parse(await AsyncStorage.getItem("emp_unapprove_address"));
      const emp_unapprove_curr_address = JSON.parse(await AsyncStorage.getItem("emp_unapprove_curr_address"));
      setemployee_id(await AsyncStorage.getItem("employee_id"));
        
      if (true) {

        setToken(t);
        setUserData(userData);
        // console.log(employee_address,"employee_address");

        setAddress(employee_address);
        setUpdateButton(emp_unapprove_address.address_details_status);
        setCurAddress(employee_curr_address);
        setUnApproveAddress(emp_unapprove_address);
        setCurUnApproveAddress(emp_unapprove_curr_address);
        setRights(JSON.parse(await AsyncStorage.getItem("rights")));

        if (emp_unapprove_address.address_details_status) {
          setAddressDetailsStatus(emp_unapprove_address.address_details_status);
          if (emp_unapprove_address.rejected_remark) {
            setrejectedRemark(emp_unapprove_address.rejected_remark);
          }
        }
      }

    };

    loadTokenAndFetch();
    // fetchUpdatedDetails(token);
  }, [token]);

 console.log(address,"address");  
 console.log(curaddress,"curaddress");  
 console.log(unApproveAddress,"unApproveAddress");  
 console.log(curUnApproveAddress,"curUnApproveAddress");  
 console.log(updateButton,"updateButton");  
  useEffect(() => {
    console.log(address, "null", curaddress);

    if (address && curaddress) {
      if (!address && !curaddress) return;
      setForm(prev => ({
        ...prev,
        employee_id: employee_id || '',
        emp_id: userData?.emp_id || '',
        resident_no: unApproveAddress?.resident_no || address.resident_no || '',
        residential_name: unApproveAddress?.residential_name || address.residential_name || '',
        road: unApproveAddress?.road || address.road || '',
        locality: unApproveAddress?.locality || address.locality || '',
        city: unApproveAddress?.city || address.city || '',
        district: unApproveAddress?.district || address.district || '',
        state: unApproveAddress?.state || address.state || '',
        pincode: unApproveAddress?.pincode || address.pincode || '',
        country: unApproveAddress?.country || address.country || '',
        diff_current_add: unApproveAddress?.diff_current_add || address.diff_current_add || '',
        curr_resident_no: curUnApproveAddress?.curr_resident_no || curaddress.resident_no || '',
        curr_residential_name: curUnApproveAddress?.curr_residential_name || curaddress.residential_name || '',
        curr_road: curUnApproveAddress?.curr_road || curaddress.road || '',
        curr_locality: curUnApproveAddress?.curr_locality || curaddress.locality || '',
        curr_city: curUnApproveAddress?.curr_city || curaddress.city || '',
        curr_district: curUnApproveAddress?.curr_district || curaddress.district || '',
        curr_state: curUnApproveAddress?.curr_state || curaddress.state || '',
        curr_pincode: curUnApproveAddress?.curr_pincode || curaddress.pincode || '',
        curr_country: curUnApproveAddress?.curr_country || curaddress.country || '',
      }));

      if (!isHydratedRef.current) {
        setIsDifferent(
          unApproveAddress?.diff_current_add || address?.diff_current_add || 'no'
        );
        isHydratedRef.current = true;
      }

    }
    // isHydratedRef.current = true;
  }, [address, curaddress]);


  const ADDRESS_FIELDS = [
    'resident_no',
    'residential_name',
    'road',
    'locality',
    'city',
    'district',
    'state',
    'pincode',
    'country',
    'diff_current_add',
  ];

  const CURRENT_ADDRESS_FIELDS = [
    'curr_resident_no',
    'curr_residential_name',
    'curr_road',
    'curr_locality',
    'curr_city',
    'curr_district',
    'curr_state',
    'curr_pincode',
    'curr_country',
  ];
  
  const showPopup = (type, title, message) => {
    setPopupConfig({
      visible: true,
      type,
      title,
      message,
    });
  };

  const onSubmit = async () => {
    try {
      const formData = new FormData();

      formData.append('employee_id', employee_id);
      formData.append('emp_id', userData.emp_id);

      const empAddressPayload = {};

      ADDRESS_FIELDS.forEach(field => {
        const oldValue = address?.[field] ?? '';
        const newValue = form?.[field] ?? '';
        if (field === "diff_current_add") {
          empAddressPayload[field] = newValue;
          return;
        }
        if (String(oldValue).trim() === String(newValue).trim()) return;

        empAddressPayload[field] = newValue;
      });

      if (Object.keys(empAddressPayload).length > 0) {
        const addressPayload = {
          address_details_status: 'pending',
          address_details_submit_status: 'inactive',
          ...empAddressPayload
        };
        formData.append(
          'emp_address',
          JSON.stringify(addressPayload)
        );
      }

      const empCurrAddressPayload = {};

      if (form.diff_current_add === 'yes') {
      CURRENT_ADDRESS_FIELDS.forEach(field => {
        const apiField = field.replace('curr_', '');
        const oldValue = curaddress?.[apiField] ?? '';
        const newValue = form?.[field] ?? ''; 

        if (String(oldValue).trim() === String(newValue).trim()) return;

        empCurrAddressPayload[field] = newValue;
      });
      }

      if (Object.keys(empCurrAddressPayload).length > 0) {
        formData.append(
          'emp_curr_address',
          JSON.stringify(empCurrAddressPayload)
        );
      }

      // if (
      //   Object.keys(empAddressPayload).length > 0 ||
      //   Object.keys(empCurrAddressPayload).length > 0
      // ) {
      //   formData.append('status', 'pending');
      // }

      if (formData._parts.length <= 2) {
        // Alert.alert('No Changes', 'Nothing to update');
        showPopup("error", "No Changes", "Nothing to update");
        return;
      }

      console.log(formData, "formatdata");

      const response = await axios.post(
        `${API_BASE_URL}employee/request-update-employee-address-details`,
        formData,
        {
          headers: {
            'x-access-token': token,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      if (response?.data?.status === 'success') {
        // Alert.alert('Success', 'Address details sent for approval');
        showPopup("success", "Success", "Address details sent for approval");
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  const isAnyAddressMissing = () => {
  if (!address && !curaddress) return false;

  const isPermanentMissing = ADDRESS_FIELDS.some(field => {
    const value =
      address?.[field] ?? unApproveAddress?.[field];

    return !value || String(value).trim() === '';
  });

  let isCurrentMissing = false;

  // if (
  //   (address?.diff_current_add ?? unApproveAddress?.diff_current_add) === 'yes'
  // ) {
    isCurrentMissing = CURRENT_ADDRESS_FIELDS.some(field => {
      const apiField = field.replace('curr_', '');

      const value =
        curaddress?.[apiField] ?? curUnApproveAddress?.[field];

      return !value || String(value).trim() === '';
    });
  // }

  return isPermanentMissing || isCurrentMissing;
};

  return (
    <LinearGradient
      colors={['#000000ff', '#1c68beff']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.containerall}>
        <View style={styles.header}>
          <Image
            source={require('../../assets/home-address.png')}
            style={styles.header_iconImage}
          />
          <Text style={styles.title}>Address Details</Text>
        </View>
        {addressDetailsStatus && (
          <View
             style={[
              styles.notificationBox,
              addressDetailsStatus  === 'rejected'
                ? styles.rejectedBox
                : addressDetailsStatus  === 'pending'
                  ? styles.pendingBox
                  : addressDetailsStatus  === 'approved'
                    ? styles.approvedBox
                    : null
            ]}
          >
            <Text style={styles.notificationTitle}>
              {addressDetailsStatus === 'rejected'
                ? 'Details Rejected'
                : addressDetailsStatus === 'pending'
                  ? 'Details Pending for Approval'
                  : addressDetailsStatus === 'approved'
                    ? 'Details Approved'
                    : ''}
            </Text>

            {addressDetailsStatus === 'rejected' && (
              <Text style={styles.remarkText}>
                Remark: {rejectedRemark}
              </Text>
            )}
          </View>
        )}
        <Text style={styles.label}>Residence No</Text>
        <TextInput
          style={styles.input}
          value={form.resident_no}
          editable={!address?.resident_no}
          onChangeText={text =>
            setForm(prev => ({ ...prev, resident_no: text }))
          }
        />

        <Text style={styles.label}>Residence Name</Text>
        <TextInput
          style={styles.input}
          value={form.residential_name}
          editable={!address?.residential_name}
          onChangeText={text =>
            setForm(prev => ({ ...prev, residential_name: text }))
          }
        />

        <Text style={styles.label}>Road / Street</Text>
        <TextInput
          style={styles.input}
          value={form.road}
          editable={!address?.road}
          onChangeText={text =>
            setForm(prev => ({ ...prev, road: text }))
          }
        />

        <Text style={styles.label}>Locality / Area</Text>
        <TextInput
          style={styles.input}
          value={form.locality}
          editable={!address?.locality}
          onChangeText={text =>
            setForm(prev => ({ ...prev, locality: text }))
          }
        />

        <Text style={styles.label}>City / Town</Text>
        <TextInput
          style={styles.input}
          value={form.city}
          editable={!address?.city}
          onChangeText={text =>
            setForm(prev => ({ ...prev, city: text }))
          }
        />

        <Text style={styles.label}>District</Text>
        <TextInput
          style={styles.input}
          value={form.district}
          editable={!address?.district}
          onChangeText={text =>
            setForm(prev => ({ ...prev, district: text }))
          }
        />

        <Text style={styles.label}>State</Text>
        <View style={styles.pickerWrapper}>
          <Picker
            selectedValue={form.state}
            // editable={!address?.state}
             enabled={!address?.state}
            onValueChange={value =>
              setForm(prev => ({ ...prev, state: value }))
            }
          >
              <Picker.Item label="Please select a state" value="" />
            <Picker.Item label="Andhra Pradesh" value="Andhra Pradesh" />
              <Picker.Item label="Arunachal Pradesh" value="Arunachal Pradesh" />
              <Picker.Item label="Assam" value="Assam" />
              <Picker.Item label="Bihar" value="Bihar" />
              <Picker.Item label="Chhattisgarh" value="Chhattisgarh" />
              <Picker.Item label="Goa" value="Goa" />
              <Picker.Item label="Gujarat" value="Gujarat" />
              <Picker.Item label="Haryana" value="Haryana" />
              <Picker.Item label="Himachal Pradesh" value="Himachal Pradesh" />
              <Picker.Item label="Jharkhand" value="Jharkhand" />
              <Picker.Item label="Karnataka" value="Karnataka" />
              <Picker.Item label="Kerala" value="Kerala" />
              <Picker.Item label="Madhya Pradesh" value="Madhya Pradesh" />
              <Picker.Item label="Maharashtra" value="Maharashtra" />
              <Picker.Item label="Manipur" value="Manipur" />
              <Picker.Item label="Meghalaya" value="Meghalaya" />
              <Picker.Item label="Mizoram" value="Mizoram" />
              <Picker.Item label="Nagaland" value="Nagaland" />
              <Picker.Item label="Odisha" value="Odisha" />
              <Picker.Item label="Punjab" value="Punjab" />
              <Picker.Item label="Rajasthan" value="Rajasthan" />
              <Picker.Item label="Sikkim" value="Sikkim" />
              <Picker.Item label="Tamil Nadu" value="Tamil Nadu" />
              <Picker.Item label="Telangana" value="Telangana" />
              <Picker.Item label="Tripura" value="Tripura" />
              <Picker.Item label="Uttar Pradesh" value="Uttar Pradesh" />
              <Picker.Item label="Uttarakhand" value="Uttarakhand" />
              <Picker.Item label="West Bengal" value="West Bengal" />
          </Picker>
        </View>

        <Text style={styles.label}>Pincode</Text>

        <TextInput
          style={styles.input}
          keyboardType="numeric"
          maxLength={6}
          value={form.pincode}
          editable={!address?.pincode}
          onChangeText={(text) => {
            const cleaned = text.replace(/[^0-9]/g, '');

            setForm(prev => ({ ...prev, pincode: cleaned }));

            if (cleaned.length > 0 && cleaned.length < 6) {
              setPincodeError('Pincode must be 6 digits');
            } else if (cleaned.length === 6) {
              if (/^0/.test(cleaned)) {
                setPincodeError('Invalid pincode');
              } else {
                setPincodeError('');
              }
            } else {
              setPincodeError('');
            }
          }}
        />
        {pincodeError ? (
          <Text style={{ color: 'red', fontSize: 12, marginTop: 4 }}>
            {pincodeError}
          </Text>
        ) : null}
        <Text style={styles.label}>Country</Text>
        <TextInput
          style={styles.input}
          value={form.country}
          editable={!address?.country}
          onChangeText={text =>
            setForm(prev => ({ ...prev, country: text }))
          }
        />

        <Text style={styles.label}>
          Is current residential address different from the above?
        </Text>

        <View style={styles.radioGroup}>
          <TouchableOpacity
            style={styles.radioOption}
            onPress={() => {
              setIsDifferent('yes');
              setForm(prev => ({ ...prev, diff_current_add: 'yes' }));
            }}
          >
            <View
              style={[
                styles.radioCircle,
                isDifferent === 'yes' && styles.radioSelected,
              ]}
            />
            <Text style={styles.radioText}>Yes</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.radioOption}
            onPress={() => {
              setIsDifferent('no');
              setForm(prev => ({ ...prev, diff_current_add: 'no' }));
            }}
          >
            <View
              style={[
                styles.radioCircle,
                isDifferent === 'no' && styles.radioSelected,
              ]}
            />
            <Text style={styles.radioText}>No</Text>
          </TouchableOpacity>
        </View>

        {/* CURRENT ADDRESS */}
        {isDifferent === 'yes' && (
          <>
            <Text style={styles.label}>Current Residence No</Text>
            <TextInput
              style={styles.input}
              value={form.curr_resident_no}
              editable={!curaddress?.resident_no}
              onChangeText={text =>
                setForm(prev => ({ ...prev, curr_resident_no: text }))
              }
            />

            <Text style={styles.label}>Current Residence Name</Text>
            <TextInput
              style={styles.input}
              value={form.curr_residential_name}
              editable={!curaddress?.residential_name}
              onChangeText={text =>
                setForm(prev => ({ ...prev, curr_residential_name: text }))
              }
            />

            <Text style={styles.label}>Current Road / Street</Text>
            <TextInput
              style={styles.input}
              value={form.curr_road}
              editable={!curaddress?.road}
              onChangeText={text =>
                setForm(prev => ({ ...prev, curr_road: text }))
              }
            />

            <Text style={styles.label}>Current Locality / Area</Text>
            <TextInput
              style={styles.input}
              value={form.curr_locality}
              editable={!curaddress?.locality}
              onChangeText={text =>
                setForm(prev => ({ ...prev, curr_locality: text }))
              }
            />

            <Text style={styles.label}>Current City / Town</Text>
            <TextInput
              style={styles.input}
              value={form.curr_city}
              editable={!curaddress?.city}
              onChangeText={text =>
                setForm(prev => ({ ...prev, curr_city: text }))
              }
            />

            <Text style={styles.label}>Current District</Text>
            <TextInput
              style={styles.input}
              value={form.curr_district}
              editable={!curaddress?.district}
              onChangeText={text =>
                setForm(prev => ({ ...prev, curr_district: text }))
              }
            />

            <Text style={styles.label}>Current State</Text>
            <TextInput
              style={styles.input}
              value={form.curr_state}
              editable={!curaddress?.state}
              onChangeText={value =>
                setForm(prev => ({ ...prev, curr_state: value }))
              }
            />


            <Text style={styles.label}>Current Pincode</Text>

            <TextInput
              style={[
                styles.input,
                currPincodeError && { borderColor: 'red' } 
              ]}
              keyboardType="numeric"
              maxLength={6}
              value={form.curr_pincode}
              editable={!curaddress?.pincode}
              onChangeText={(text) => {
                const cleaned = text.replace(/[^0-9]/g, '');

                setForm(prev => ({ ...prev, curr_pincode: cleaned }));

                if (cleaned.length > 0 && cleaned.length < 6) {
                  setCurrPincodeError('Pincode must be 6 digits');
                } else if (cleaned.length === 6) {
                  if (/^0/.test(cleaned)) {
                    setCurrPincodeError('Invalid pincode');
                  } else {
                    setCurrPincodeError('');
                  }
                } else {
                  setCurrPincodeError('');
                }
              }}
            />
            {currPincodeError ? (
              <Text style={{ color: 'red', fontSize: 12, marginTop: 4 }}>
                {currPincodeError}
              </Text>
            ) : null}
            <Text style={styles.label}>Current Country</Text>
            <TextInput
              style={styles.input}
              value={form.curr_country}
              editable={!curaddress?.country}
              onChangeText={text =>
                setForm(prev => ({ ...prev, curr_country: text }))
              }
            />
          </>
        )}
        </View>
        {(updateButton !== "approved" || isAnyAddressMissing()) && (
                  <TouchableOpacity style={styles.button} onPress={onSubmit}>
                    <Text style={styles.buttonText}>Update</Text>
                  </TouchableOpacity>
                )}
      </ScrollView>
       <StatusPopup
        visible={popupConfig.visible}
        type={popupConfig.type}
        title={popupConfig.title}
        message={popupConfig.message}
        onClose={() =>
          setPopupConfig(prev => ({ ...prev, visible: false }))
        }
      />
      <BottomNavigation rights={rights}/>
    </LinearGradient>
  );
};

export default AddressForm;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 13 },
  scrollContainer: {
    top: 15
  },
  containerall:{
    marginBottom:100
  },
  header: {
    flexDirection: "row",
    width: "100%",
    // marginBottom: 12,
    alignItems: "center",
    gap: 5
  },
  header_iconImage: {
    width: 30,
    padding: 15,
    height: 20,
    marginLeft: 2,
  },
  title: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    marginTop: 15,
    marginLeft: 5
  },
  notificationBox: {
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
  },

  rejectedBox: {
    backgroundColor: '#ffe6e6',
    borderLeftWidth: 5,
    borderLeftColor: '#ff3b30',
  },

  pendingBox: {
    backgroundColor: '#fff4e5',
    borderLeftWidth: 5,
    borderLeftColor: '#eefa46',
  },
  approvedBox: {
    backgroundColor: '#d4edda',
    borderLeftWidth: 5,
    borderColor: '#28a745',
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    color: "#000"

  },

  remarkText: {
    fontSize: 14,
    color: '#333',
  },
  label: {
    fontSize: 13,
    color: '#fff',
    marginBottom: 6,
    marginTop: 12,
    fontWeight: '500',
  },
  input: {
    placeholderTextColor: "#999",
    backgroundColor: '#d1d1d1',
    borderRadius: 6,
    padding: 12,
    color: '#000',
  },
  pickerWrapper: {
    backgroundColor: '#d1d1d1',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 6,
  },
  radioGroup: {
    flexDirection: 'row',
    marginTop: 10,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  radioCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: '#ffffff',
    marginRight: 6,
  },
  radioSelected: {
    backgroundColor: '#2563eb',
  },
  radioText: {
    color: "#fff",
    fontSize: 14,
  },
  button: {
    backgroundColor: '#d62b6e',
    padding: 14,
    width: width * 0.25,
    borderRadius: 30,
    alignItems: 'center',
    marginTop: 30,
    marginBottom: 130,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },
});
