import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Alert,
  Image,
  Linking
} from 'react-native';
import FileViewer from 'react-native-file-viewer';
import axios from "axios";
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LinearGradient from 'react-native-linear-gradient';
import BottomNavigation from '../BottomNavigation';
import DatePicker from 'react-native-date-picker';
import StatusPopup from '../StatusPopup/StatusPopup';

import { NativeModules } from "react-native";
const { PdfPicker } = NativeModules;
const { width } = Dimensions.get('window');
import { API_BASE_URL } from "@env";
const PersonalDetails = ({ route }) => {
  const [openDob, setOpenDob] = useState(false);
  const [Dob, setDob] = useState(new Date());
  const [token, setToken] = useState(null);
  const [employee_id, setemployee_id] = useState(null);
  const [userData, setUserData] = useState(null);
  const [openMarriageDate, setOpenMarriageDate] = useState(false);
  const [marriageDate, setMarriageDate] = useState(new Date());
  const [openPassportFrom, setOpenPassportFrom] = useState(false);
  const [openPassportTo, setOpenPassportTo] = useState(false);
  const [EmployeeDet, setEmployeeDet] = useState(null);
  const [fetchDetails, setFetchDetails] = useState(null);
  const [PersonalDetailsStatus, setPersonalDetailsStatus] = useState(null);
  const [rejectedRemark, setrejectedRemark] = useState(null);
  const isHydratedRef = useRef(false);
  const [passportFromDate, setPassportFromDate] = useState(new Date());
  const [passportToDate, setPassportToDate] = useState(new Date());
  const [employee_vault, setEmployee_Vault] = useState(0);
  const [alreadyUploadedSize, setAlreadyUploadedSize] = useState(0);
  const [mobileError, setMobileError] = useState('');
  const [emergencyError, setEmergencyError] = useState('');
  const [alternateError, setAlternateError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [panError, setPanError] = useState('');
  const [aadharError, setAadharError] = useState('');
  const [rights, setRights] = useState(false);
  const [updateButton, setupdateButton] = useState(false);
  const [popupConfig, setPopupConfig] = useState({ visible: false, type: "success", title: "", message: "", });
  const MAX_SINGLE_FILE_KB = 200;
  
  const [form, setForm] = useState({
    employee_id: '',
    emp_id: '',
    emp_first_name: '',
    emp_last_name: '',
    mobile_no: '',
    emp_dob: '',
    sex: '',
    emp_father_name: '',
    email_id: '',
    alternate_mob_no: '',
    emergency_contact_no: '',
    emergency_contact_name: '',
    aadhar_no: '',
    pan_no: '',
    passport_no: '',
    passport_val_form: '',
    passport_val_to: '',
    nationality: '',
    physical_disability: '',
    blood_group: '',
    marital_status: '',
    marriage_date: '',
    domicile: '',
    height: '',
    religion: '',
  });


  const PERSONAL_FIELDS = [
    'emp_first_name',
    'emp_last_name',
    'mobile_no',
    'emp_dob',
    'sex',
    'emp_father_name',
    'email_id',
    'alternate_mob_no',
    'emergency_contact_no',
    'emergency_contact_name',
    'aadhar_no',
    'pan_no',
    'passport_no',
    'passport_val_form',
    'passport_val_to',
    'nationality',
    'physical_disability',
    'blood_group',
    'marital_status',
    'marriage_date',
    'domicile',
    'height',
    'religion',
  ];

  const IMAGE_FIELDS = {
    emp_aadhaar_image: true,
    emp_pan_image: true,
    emp_passport_image: true,
    additional_id_image: true,
    profile_image: true,
    attendence_image: true,
  };
  const IMAGE_FIELDS_new = {
    emp_aadhaar_image: true,
    emp_pan_image: true,
    emp_passport_image: true,
    additional_id_image: true,
    profile_pic: true,
    attendence_pic: true,
  };
  useEffect(() => {
  const loadTokenAndFetch = async () => {
    const t = await AsyncStorage.getItem("authToken");
    const userData = JSON.parse(await AsyncStorage.getItem("userData"));
    const employee_det = route?.params?.accountData;
  const personal_det = route?.params?.updatedDetails;
  
    
    // const employee_det = JSON.parse(await AsyncStorage.getItem("employee_det"));
    // const personal_det = JSON.parse(await AsyncStorage.getItem("personal_det"));
    setemployee_id(await AsyncStorage.getItem("employee_id"));
    if (t && employee_det ) {
      setToken(t);
      setUserData(userData);
      setEmployeeDet(employee_det);
      setFetchDetails(personal_det);
      setupdateButton(personal_det.personal_details_status)
      setEmployee_Vault(employee_det.employee_vault || 0);
      setAlreadyUploadedSize(employee_det.total_file_size || 0);
      setRights(JSON.parse(await AsyncStorage.getItem("rights")));
   
    }
      // console.log(personal_det,"personal_det");
      // console.log(fetchDetails,"fetchDetails");
    if (personal_det && personal_det?.personal_details_status) {
      // console.log(personal_det.personal_details_status, "personal_det.personal_details_submit_status");
      // console.log(personal_det, "personal_det.personal_details");
      
      // console.log(fetchDetails,"fetchDetails");

      setPersonalDetailsStatus(personal_det?.personal_details_status);


      if (personal_det?.rejected_remark) {
        setrejectedRemark(personal_det?.rejected_remark);
      }
    }
  };

   loadTokenAndFetch();

    
  }, []);

  // useEffect(() => {
  //   console.log("EmployeeDet",EmployeeDet);
  //   console.log("fetchDetails",fetchDetails);
    
  // }, [EmployeeDet,fetchDetails])


  useEffect(() => {
    if (EmployeeDet) {
      if (!EmployeeDet) return;
      setForm(prev => ({
        ...prev,
        employee_id: employee_id || '',
        emp_id: userData?.emp_id || '',

        emp_first_name:
          fetchDetails?.emp_first_name || EmployeeDet.emp_first_name || '',

        emp_last_name:
          fetchDetails?.emp_last_name || EmployeeDet.emp_last_name || '',

        mobile_no:
          fetchDetails?.mobile_no || EmployeeDet.mobile_no || '',

        emp_dob:
          formatDOB(fetchDetails?.emp_dob || EmployeeDet.emp_dob) || '',
        // fetchDetails?.emp_dob || EmployeeDet.emp_dob.split('T')[0] || '',

        sex:
          fetchDetails?.sex || EmployeeDet.sex || '',

        emp_father_name:
          fetchDetails?.emp_father_name || EmployeeDet.emp_father_name || '',

        email_id:
          fetchDetails?.email_id || EmployeeDet.email_id || '',

        alternate_mob_no:
          fetchDetails?.alternate_mob_no || EmployeeDet.alternate_mob_no || '',

        emergency_contact_no:
          fetchDetails?.emergency_contact_no ||
          EmployeeDet.emergency_contact_no ||
          '',

        emergency_contact_name:
          fetchDetails?.emergency_contact_name ||
          EmployeeDet.emergency_contact_name ||
          '',

        aadhar_no:
          fetchDetails?.aadhar_no || EmployeeDet.aadhar_no || '',

        pan_no:
          fetchDetails?.pan_no || EmployeeDet.pan_no || '',

        passport_no:
          fetchDetails?.passport_no || EmployeeDet.passport_no || '',

        passport_val_form:
          fetchDetails?.passport_val_form ||
          EmployeeDet.passport_val_form ||
          '',

        passport_val_to:
          fetchDetails?.passport_val_to ||
          EmployeeDet.passport_val_to ||
          '',

        nationality:
          fetchDetails?.nationality || EmployeeDet.nationality || '',

        physical_disability:
          fetchDetails?.physical_disability ||
          EmployeeDet.physical_disability ||
          '',

        blood_group:
          fetchDetails?.blood_group || EmployeeDet?.blood_group || '',

        marital_status:
          fetchDetails?.marital_status || EmployeeDet?.marital_status || '',

        marriage_date:
          formatDOB(fetchDetails?.marriage_date || EmployeeDet?.marriage_date) || '',

        domicile:
          fetchDetails?.domicile || EmployeeDet?.domicile || '',

        height:
          fetchDetails?.height || EmployeeDet?.height || '',

        religion:
          fetchDetails?.religion || EmployeeDet?.religion || '',
      }));

    }
    isHydratedRef.current = true;
  }, [EmployeeDet,fetchDetails]);

  const [uploads, setUploads] = useState({
    emp_aadhaar_image: null,
    emp_pan_image: null,
    emp_passport_image: null,
    additional_id_image: null,
    profile_image: null,
    attendence_image: null,
  });

    
  const showPopup = (type, title, message) => {
    setPopupConfig({
      visible: true,
      type,
      title,
      message,
    });
  };

  const formatDOB = (dateString) => {
    if (!dateString) return '';

    const date = new Date(dateString);

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();

    return `${day}-${month}-${year}`;
  };

  const onChange = (key, value) =>
    setForm(prev => ({ ...prev, [key]: value }));

  const getSelectedFilesSizeKB = () => {
    let totalBytes = 0;

    Object.values(uploads).forEach(file => {
      if (file?.size) {
        totalBytes += file.size;
      }
    });

    return totalBytes / 1024; // convert to KB
  };
  // const pickFile = async (key) => {
  //   // console.log("pickFile");

  //   try {
  //     // console.log("pickFile");
  //     const file = await PdfPicker.pickFile();
  //     // console.log(file,"file");

  //     if (!file) return;

  //     const fileObj = {
  //       name: file.name || file.fileName || 'Selected File',
  //       uri: file.uri,
  //       type: file.type,
  //       size: file.size,
  //     };
  //     // console.log(fileObj,"fileObj");

  //     setUploads(prev => ({
  //       ...prev,
  //       [key]: fileObj,
  //     }));
  //   } catch (err) {
  //     console.log('File pick cancelled or failed', err);
  //   }
  // };
  const pickFile = async (key) => {

    try {
      const file = await PdfPicker.pickFile();
      if (!file) return;

      const fileSizeKB = file.size / 1024;

      if (fileSizeKB > MAX_SINGLE_FILE_KB) {
        // Alert.alert(
        //   "File Too Large",
        //   `Each file must be less than ${MAX_SINGLE_FILE_KB} KB`
        // );
        showPopup("error", "File Too Large", `Each file must be less than ${MAX_SINGLE_FILE_KB} KB`);

        return;
      }

      const fileObj = {
        name: file.name || file.fileName || "Selected File",
        uri: file.uri,
        type: file.type,
        size: file.size,
      };
      // console.log(file.size,"file.size");

      setUploads(prev => ({
        ...prev,
        [key]: fileObj,
      }));

    } catch (err) {
      console.log("File pick cancelled or failed", err);
    }
  };
 const convertToYMD = (dateString) => {
    if (!dateString) return '';

    // If already YYYY-MM-DD, return directly
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      return dateString;
    }

    const [day, month, year] = dateString.split('-');

    if (!day || !month || !year) return '';

    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  };

  const convertToISO = (dateString) => {
    if (!dateString) return '';

    if (dateString.includes('T')) {
      return dateString;
    }

    const [day, month, year] = dateString.split('-');

    const date = new Date(
      Date.UTC(
        Number(year),
        Number(month) - 1,
        Number(day)
      )
    );

    return date.toISOString();
  };


  const onSubmit = async () => {
    // console.log(alreadyUploadedSize, "alreadyUploadedSize")
    try {
      //   const selectedFilesSizeKB = getSelectedFilesSizeKB();
      //    console.log(selectedFilesSizeKB,"selectedFilesSizeKB")
      // const totalUsed = alreadyUploadedSize + selectedFilesSizeKB;
      //   console.log(totalUsed,"totalUsed")
      //   console.log(employee_vault-totalUsed,"remaining")
      // if (totalUsed > employee_vault) {
      //   Alert.alert(
      //     "Storage Limit Exceeded",
      //     `Only ${(employee_vault - alreadyUploadedSize).toFixed(2)} KB remaining`
      //   );
      //   return;
      // }

      // console.log(totalUsed,"totalUsed")
      const formData = new FormData();
      const currentDate = new Date();

      const month = currentDate.getMonth(); 
      const year = currentDate.getFullYear();
      // formData.append("total_file_size", totalUsed);
      formData.append('employee_id', employee_id);
      formData.append('emp_id', userData.emp_id);
      formData.append('corporate_id', userData?.corporate_id);
      formData.append('wage_month', month);
      formData.append('wage_year', year);
      formData.append('personal_details_status', 'pending');
      formData.append('personal_details_submit_status', 'inactive');


      PERSONAL_FIELDS.forEach(field => {
        const oldValue =
          EmployeeDet?.[field]?.value ?? EmployeeDet?.[field] ?? '';

        const newValue = form?.[field] ?? '';

        if (String(oldValue).trim() === String(newValue).trim()) return;

        if (field === 'marriage_date' && newValue) {
          formData.append(field, convertToISO(newValue));
        } else if (field === 'emp_dob' && newValue) {
          formData.append(field, convertToISO(newValue));
        } else if (field === 'passport_val_form' && newValue) {
          formData.append(field, convertToYMD(newValue));
        }
        else if (field === 'passport_val_to' && newValue) {
          formData.append(field, convertToYMD(newValue));
        } else {
          // console.log(field,newValue,"field","newValue");
          
          formData.append(field, newValue);
        }
      });
      Object.keys(IMAGE_FIELDS).forEach(key => {
        const newImage = uploads[key];
        if (!newImage) return;

        formData.append(key, {
          uri: newImage.uri,
          name: newImage.name,
          type: newImage.type,
        });
      });
      console.log(formData,"formData")
      console.log(API_BASE_URL,"API_BASE_URL")

      if (formData._parts.length <= 2) {
        // Alert.alert('No Changes', 'Nothing to update');
        showPopup("error", "No Changes", "Nothing to update");

        return;
      }

      const response = await axios.post(
        `${API_BASE_URL}employee/request-update-employee-personal-details`,
        formData,
        {
          headers: {
            'x-access-token': token,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      if (response?.data?.status === 'success') {
        setPersonalDetailsStatus('pending');
        // await loadTokenAndFetch(); 
        // Alert.alert('Success', 'Details sent for approval');
        showPopup("success", "Success", "Details sent for approval");

      }
    } catch (error) {
      console.log(error.message);
    }
  };

  // const isAnyFieldEmptyFromAPI = () => {
  //   if (!EmployeeDet && !fetchDetails) return false;

  //   return PERSONAL_FIELDS.some(field => {
  //     const value =
  //       fetchDetails?.[field] ?? EmployeeDet?.[field];

  //     return !value || String(value).trim() === '';
  //   });
  // };

  const isAnyFieldEmptyFromAPI = () => {
  if (!EmployeeDet && !fetchDetails) return false;

  const isPersonalEmpty = PERSONAL_FIELDS.some(field => {
    const value =
      fetchDetails?.[field] ?? EmployeeDet?.[field];

    return !value || String(value).trim() === '';
  });

  const isImageEmpty = Object.keys(IMAGE_FIELDS_new).some(field => {
    const value =
      fetchDetails?.[field] ?? EmployeeDet?.[field];
  return !value;
  });

  return isPersonalEmpty || isImageEmpty;
};
  const formatDate = (date) => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };
  const isApproved = (field) => {
    return EmployeeDet?.[field] !== null &&
      EmployeeDet?.[field] !== undefined &&
      String(EmployeeDet?.[field]).trim() !== '';
  };

  const isAadharImageUploaded = !!EmployeeDet?.emp_aadhaar_image;
  const isPanImageUploaded = !!EmployeeDet?.emp_pan_image;
const isPassportImageUploaded = !!EmployeeDet?.emp_passport_image;
const isAdditionalIdUploaded = !!EmployeeDet?.additional_id_image;
const isProfileUploaded = !!EmployeeDet?.profile_pic;
const isAttendanceUploaded = !!EmployeeDet?.attendence_pic;

  return (
    <LinearGradient
      colors={['#000000ff', '#1c68beff']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        <View style={styles.header}>
          <Image
            source={require("../../assets/registration.png")}
            style={styles.header_iconImage}
          />
          <Text style={styles.title}>Personal Details</Text>
        </View>

        {PersonalDetailsStatus && (
          <View
            style={[
              styles.notificationBox,
              PersonalDetailsStatus === 'rejected'
                ? styles.rejectedBox
                : PersonalDetailsStatus === 'pending'
                  ? styles.pendingBox
                  : PersonalDetailsStatus === 'approved'
                    ? styles.approvedBox
                    : null
            ]}
          >
            <Text style={styles.notificationTitle}>
              {PersonalDetailsStatus === 'rejected'
                ? 'Details Rejected'
                : PersonalDetailsStatus === 'pending'
                  ? 'Details Pending for Approval'
                  : PersonalDetailsStatus === 'approved'
                    ? 'Details Approved'
                    : ''}
            </Text>

            {PersonalDetailsStatus === 'rejected' && (
              <Text style={styles.remarkText}>
                Remark: {rejectedRemark}
              </Text>
            )}
          </View>
        )}

        <Label text="Employee First Name *" />
        <Input
          value={form.emp_first_name}
          onChangeText={v => onChange('emp_first_name', v)}
          editable={!isApproved('emp_first_name')}
        />

        <Label text="Employee Last Name" />
        <Input
          value={form.emp_last_name}
          onChangeText={v => onChange('emp_last_name', v)}
          editable={!isApproved('emp_last_name')}
        />

        <Label text="Mobile *" />

        <Input
          value={form.mobile_no}
          keyboardType="number-pad"
          maxLength={10}
          onChangeText={(v) => {
            const cleaned = v.replace(/[^0-9]/g, '');

            onChange('mobile_no', cleaned);

            if (cleaned.length > 10) {
              setMobileError('Enter a valid contact number');
            } else {
              setMobileError('');
            }
          }}
          editable={!isApproved('mobile_no')}
        />
        {mobileError ? (
          <Text style={{ color: 'red', fontSize: 12, marginTop: 4 }}>
            {mobileError}
          </Text>
        ) : null}
        <Label text="Date of Birth *" />
        <TouchableOpacity
          style={styles.dateInput}
          disabled={isApproved('emp_dob')}
          onPress={() => setOpenDob(true)}
        >
          <Text style={styles.dateTextDisplay}>
            {form.emp_dob ? form.emp_dob : 'Select Date'}
          </Text>
          <Text style={styles.calendarIcon}>📅</Text>
        </TouchableOpacity>

        <DatePicker
          modal
          mode="date"
          open={openDob}
          date={Dob}
          onConfirm={(date) => {
            setOpenDob(false);
            setDob(date);
            onChange('emp_dob', formatDate(date));
          }}
          onCancel={() => setOpenDob(false)}
          theme="dark"
        />

        <Label text="Gender *" />
        <PickerWrapper>
          <Picker
            selectedValue={form.sex}
            enabled={!isApproved('sex')}
            onValueChange={v => onChange('sex', v)}
          >
            <Picker.Item label="Select Gender" value="" />
            <Picker.Item label="Male" value="m" />
            <Picker.Item label="Female" value="f" />
            <Picker.Item label="Transgender" value="t" />
            <Picker.Item label="Other" value="o" />
          </Picker>
        </PickerWrapper>

        <Label text="Father's Name" />
        <Input
          value={form.emp_father_name}
          onChangeText={v => onChange('emp_father_name', v)}
          editable={!isApproved('emp_father_name')}
        />

        <Label text="Email ID" />
        <Input
          value={form.email_id}
          keyboardType="email-address"
          autoCapitalize="none"
          onChangeText={(v) => {
            onChange('email_id', v);

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

            if (v.length > 0 && !emailRegex.test(v)) {
              setEmailError('Enter a valid email address');
            } else {
              setEmailError('');
            }
          }}
          editable={!isApproved('email_id')}
        />
        {emailError ? (
          <Text style={{ color: 'red', fontSize: 12, marginTop: 4 }}>
            {emailError}
          </Text>
        ) : null}
        <Label text="Alternate Mobile" />
        <Input
          value={form.alternate_mob_no}
          keyboardType="number-pad"
          maxLength={10}
          onChangeText={(v) => {
            const cleaned = v.replace(/[^0-9]/g, '');

            onChange('alternate_mob_no', cleaned);

            if (cleaned.length > 0 && cleaned.length < 10) {
              setAlternateError('Enter a valid contact number');
            } else {
              setAlternateError('');
            }
          }}
          editable={!isApproved('alternate_mob_no')}
        />
        {alternateError ? (
          <Text style={{ color: 'red', fontSize: 12, marginTop: 4 }}>
            {alternateError}
          </Text>
        ) : null}
        <Label text="Emergency Contact Number" />
        <Input
          value={form.emergency_contact_no}
          keyboardType="number-pad"
          maxLength={10}
          onChangeText={(v) => {
            const cleaned = v.replace(/[^0-9]/g, '');

            onChange('emergency_contact_no', cleaned);

            if (cleaned.length < 10) {
              setEmergencyError('Enter a valid contact number');
            } else {
              setEmergencyError('');
            }
          }}
          editable={!isApproved('emergency_contact_no')}
        />
        {emergencyError ? (
          <Text style={{ color: 'red', fontSize: 12, marginTop: 4 }}>
            {emergencyError}
          </Text>
        ) : null}

        <Label text="Emergency Contact Name" />
        <Input
          value={form.emergency_contact_name}
          onChangeText={v => onChange('emergency_contact_name', v)}
          editable={!isApproved('emergency_contact_name')}
        />

        <Label text="Aadhar Card Number" />
        <Input
          value={form.aadhar_no}
          keyboardType="number-pad"
          maxLength={12}
          onChangeText={(v) => {
            const cleaned = v.replace(/[^0-9]/g, '');

            onChange('aadhar_no', cleaned);

            if (cleaned.length > 0 && cleaned.length < 12) {
              setAadharError('Aadhaar must be 12 digits');
            } else if (cleaned.length === 12) {
              if (/^[01]/.test(cleaned)) {
                setAadharError('Invalid Aadhaar number');
              } else {
                setAadharError('');
              }
            } else {
              setAadharError('');
            }
          }}
          editable={!isApproved('aadhar_no')}
        />
        {aadharError ? (
          <Text style={{ color: 'red', fontSize: 12, marginTop: 4 }}>
            {aadharError}
          </Text>
        ) : null}

        <Label text="PAN Card Number" />
        <Input
          value={form.pan_no}
          autoCapitalize="characters"
          maxLength={10}
          onChangeText={(v) => {
            const value = v.toUpperCase();

            onChange('pan_no', value);

            const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;

            if (value.length > 0 && !panRegex.test(value)) {
              setPanError('Enter a valid PAN (ABCDE1234F)');
            } else {
              setPanError('');
            }
          }}
          editable={!isApproved('pan_no')}
        />
        {panError ? (
          <Text style={{ color: 'red', fontSize: 12, marginTop: 4 }}>
            {panError}
          </Text>
        ) : null}
        <Label text="Passport Number" />
        <Input
          value={form.passport_no}
          autoCapitalize="characters"
          onChangeText={v => onChange('passport_no', v)}
          editable={!isApproved('passport_no')}
        />
        {form.passport_no?.trim() !== '' && (
          <>
            <Label text="Passport Valid From" />
            <TouchableOpacity
              style={styles.dateInput}
              disabled={isApproved('passport_val_form')}
              onPress={() => setOpenPassportFrom(true)}
            >
              <Text style={styles.dateTextDisplay}>
                {form.passport_val_form || 'Select Date'}
              </Text>
              <Text style={styles.calendarIcon}>📅</Text>
            </TouchableOpacity>

            <DatePicker
              modal
              mode="date"
              open={openPassportFrom}
              date={passportFromDate}
              onConfirm={date => {
                setOpenPassportFrom(false);
                setPassportFromDate(date);
                onChange('passport_val_form', formatDate(date));
              }}
              onCancel={() => setOpenPassportFrom(false)}
              theme="dark"
            />

            <Label text="Passport Valid To" />
            <TouchableOpacity
              style={styles.dateInput}
              disabled={isApproved('passport_val_to')}
              onPress={() => setOpenPassportTo(true)}
            >
              <Text style={styles.dateTextDisplay}>
                {form.passport_val_to || 'Select Date'}
              </Text>
              <Text style={styles.calendarIcon}>📅</Text>
            </TouchableOpacity>

            <DatePicker
              modal
              mode="date"
              open={openPassportTo}
              date={passportToDate}
              onConfirm={date => {
                setOpenPassportTo(false);
                setPassportToDate(date);
                onChange('passport_val_to', formatDate(date));
              }}
              onCancel={() => setOpenPassportTo(false)}
              theme="dark"
            />
          </>
        )}

        <Label text="Nationality" />
        <Input
          value={form.nationality}
          onChangeText={v => onChange('nationality', v)}
          editable={!isApproved('nationality')}
        />

        <Label text="Physical Disability" />
        <PickerWrapper>
          <Picker
            selectedValue={form.physical_disability}
            enabled={!isApproved('physical_disability')}
            onValueChange={v => onChange('physical_disability', v)}
          >
            <Picker.Item label="Select" value="" />
            <Picker.Item label="No" value="no" />
            <Picker.Item label="Yes" value="yes" />
          </Picker>
        </PickerWrapper>

        <Label text="Blood Group" />
        <PickerWrapper>
          <Picker
            selectedValue={form.blood_group}
            enabled={!isApproved('blood_group')}
            onValueChange={v => onChange('blood_group', v)}
          >
            <Picker.Item label="Select Blood Group" value="" />
            <Picker.Item label="O+" value="O+" />
            <Picker.Item label="O-" value="O-" />
            <Picker.Item label="A+" value="A+" />
            <Picker.Item label="A-" value="A-" />
            <Picker.Item label="B+" value="B+" />
            <Picker.Item label="B-" value="B-" />
            <Picker.Item label="AB+" value="AB+" />
            <Picker.Item label="AB-" value="AB-" />
          </Picker>
        </PickerWrapper>

        <Label text="Marital Status" />
        <PickerWrapper>
          <Picker
            selectedValue={form.marital_status}
            // enabled={!isApproved('marital_status')}
            onValueChange={v => onChange('marital_status', v)}
          >
            <Picker.Item label="Select Marital Status" value="" />
            <Picker.Item label="Un-Married" value="unmarried" />
            <Picker.Item label="Married" value="married" />
            <Picker.Item label="Divorced" value="divorced" />
            <Picker.Item label="Separated" value="separated" />
            <Picker.Item label="Widowed" value="widowed" />
          </Picker>
        </PickerWrapper>
        {form.marital_status === 'married' && (
          <>
            <Label text="Date of Marriage" />

            <TouchableOpacity
              style={styles.dateInput}
              disabled={isApproved('marriage_date')}
              onPress={() => setOpenMarriageDate(true)}
            >
              <Text style={styles.dateTextDisplay}>
                {form.marriage_date
                  ? form.marriage_date
                  : 'Select Date'}
              </Text>
              <Text style={styles.calendarIcon}>📅</Text>
            </TouchableOpacity>

            <DatePicker
              modal
              mode="date"
              open={openMarriageDate}
              date={marriageDate}
              onConfirm={(date) => {
                setOpenMarriageDate(false);
                setMarriageDate(date);
                onChange(
                  'marriage_date',
                  formatDate(date)
                );
              }}
              onCancel={() => setOpenMarriageDate(false)}
              theme="dark"
            />
          </>
        )}

        <Label text="Domicile" />
        <Input
          value={form.domicile}
          onChangeText={v => onChange('domicile', v)}
          editable={!isApproved('domicile')}
        />

        <Label text="Height" />
        <Input
          value={form.height}
          keyboardType="characters"
          onChangeText={v => onChange('height', v)}
          editable={!isApproved('height')}
        />

        <Label text="Religion" />
        <PickerWrapper>
          <Picker
            selectedValue={form.religion}
            // enabled={!isApproved('religion')}
            onValueChange={v => onChange('religion', v)}
          >
            <Picker.Item label="Select Religion" value="" />
            <Picker.Item label="Hindu" value="hindu" />
            <Picker.Item label="Muslim" value="muslim" />
            <Picker.Item label="Christian" value="christian" />
            <Picker.Item label="Jewish" value="jewish" />
            <Picker.Item label="Buddhist" value="buddhist" />
            <Picker.Item label="Sikh" value="sikh" />
            <Picker.Item label="No Religion" value="no_religion" />
          </Picker>
        </PickerWrapper>
        <View style={styles.uploadBoxall}>
          {/* {form.aadhar_no?.trim() !== '' && ( */}
            {/* <UploadBox
              label="Aadhar Card Image"
              file={uploads.emp_aadhaar_image}
              onPress={() => pickFile('emp_aadhaar_image')}
            />
          )} */}
          {form.aadhar_no?.trim() !== '' && (
            <UploadBox
              label="Aadhar Card Image"
              file={uploads.emp_aadhaar_image}
              onPress={() => {
                if (!isAadharImageUploaded) {
                  pickFile('emp_aadhaar_image');
                }
              }}
              disabled={isAadharImageUploaded}
            />
          )}
          {/* {form.pan_no?.trim() !== '' && (
            <UploadBox
              label="PAN Card Image "
              file={uploads.emp_pan_image}
              onPress={() => pickFile('emp_pan_image')}
            />
          )} */}
          {form.pan_no?.trim() !== '' && (
            <UploadBox
              label="PAN Card Image"
              file={uploads.emp_pan_image}
              onPress={() => {
                if (!isPanImageUploaded) {
                  pickFile('emp_pan_image');
                }
              }}
              disabled={isPanImageUploaded}
            />
          )}
          {/* {form.passport_no?.trim() !== '' && (
            <UploadBox
              label="Passport Image "
              file={uploads.emp_passport_image}
              onPress={() => pickFile('emp_passport_image')}
            />
          )} */}
          {form.passport_no?.trim() !== '' && (
            <UploadBox
              label="Passport Image"
              file={uploads.emp_passport_image}
              onPress={() => {
                if (!isPassportImageUploaded) {
                  pickFile('emp_passport_image');
                }
              }}
              disabled={isPassportImageUploaded}
            />
          )}

          {/* <UploadBox
            label="Additional ID"
            file={uploads.additional_id_image}
            onPress={() => pickFile('additional_id_image')}
          /> */}
          <UploadBox
            label="Additional ID"
            file={uploads.additional_id_image}
            onPress={() => {
              if (!isAdditionalIdUploaded) {
                pickFile('additional_id_image');
              }
            }}
            disabled={isAdditionalIdUploaded}
          />

          {/* <UploadBox
            label="Profile Image"
            file={uploads.profile_image}
            onPress={() => pickFile('profile_image')}
          /> */}
          <UploadBox
            label="Profile Image"
            file={uploads.profile_image}
            onPress={() => {
              if (!isProfileUploaded) {
                pickFile('profile_image');
              }
            }}
            disabled={isProfileUploaded}
          />

          {/* <UploadBox
            label="Attendance Image"
            file={uploads.attendence_image}
            onPress={() => pickFile('attendence_image')}
          /> */}
          <UploadBox
            label="Attendance Image"
            file={uploads.attendence_image}
            onPress={() => {
              if (!isAttendanceUploaded) {
                pickFile('attendence_image');
              }
            }}
            disabled={isAttendanceUploaded}
          />
        </View>
        {/* {PersonalDetailsStatus !== 'pending' && ( */}
        {(updateButton !== "approved" || isAnyFieldEmptyFromAPI()) && (
          <TouchableOpacity style={styles.button} onPress={onSubmit}>
            <Text style={styles.buttonText}>Update</Text>
          </TouchableOpacity>
        )}
        {/* )} */}
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
      <BottomNavigation rights={rights} />
    </LinearGradient>
  );
};

export default PersonalDetails;



const Label = ({ text }) => <Text style={styles.label}>{text}</Text>;

const Input = props => (
  <TextInput {...props} style={styles.input} placeholderTextColor="#999" />
);

const PickerWrapper = ({ children }) => (
  <View style={styles.pickerWrapper}>{children}</View>
);

// const UploadBox = ({ label, file, onPress }) => (
//   <View>
//     <Text style={styles.label}>{label}</Text>
//     <View style={styles.uploadBox}>
//       <TouchableOpacity onPress={onPress}>
//         <Text style={styles.chooseText}>Choose file</Text>
//       </TouchableOpacity>
//       <Text style={styles.fileText}>
//         {file ? file.name : 'No file chosen'}
//       </Text>
//     </View>
//   </View>
// );
// const UploadBox = ({ label, file, onPress }) => {
//   return (
//     <View style={styles.uploadBox}>
//       <Text style={styles.uploadLabel}>{label}</Text>

//       {!file ? (
//         /* No file → Pick file */
//         <TouchableOpacity onPress={onPress} style={styles.uploadButton}>
//           <Text style={styles.uploadText}>Select File</Text>
//         </TouchableOpacity>
//       ) : (
//         /* File exists → View file OR change file */
//         <View style={styles.fileRow}>
//           <TouchableOpacity onPress={() => openDocument(file)}>
//             <Text style={styles.fileName} numberOfLines={1}>
//               📄 {file.name}
//             </Text>
//           </TouchableOpacity>

//           <TouchableOpacity onPress={onPress}>
//             <Text style={styles.changeText}>Change</Text>
//           </TouchableOpacity>
//         </View>
//       )}
//     </View>
//   );
// };

const UploadBox = ({ label, file, onPress, disabled }) => {
  return (
    <View style={styles.uploadBox}>
      <Text style={styles.uploadLabel}>{label}</Text>

      {!file ? (
        <TouchableOpacity
          onPress={onPress}
          disabled={disabled}
          style={[
            styles.uploadButton,
            disabled && { opacity: 0.5 }
          ]}
        >
          <Text style={styles.uploadText}>
            {disabled ? 'Already Uploaded' : 'Select File'}
          </Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.fileRow}>
          <TouchableOpacity onPress={() => openDocument(file)}>
            <Text style={styles.fileName} numberOfLines={1}>
              📄 {file.name}
            </Text>
          </TouchableOpacity>

          {!disabled && (
            <TouchableOpacity onPress={onPress}>
              <Text style={styles.changeText}>Change</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
};


const openDocument = async (file) => {
  try {
    if (!file?.uri) {
      // Alert.alert('Error', 'File not found');
       showPopup("error", "Error", "File not found");
      return;
    }

    await FileViewer.open(file.uri, {
      showOpenWithDialog: true,
    });
  } catch (error) {
    // console.log('File open error:', error);
    // Alert.alert('Error', 'Unable to open this file');
    showPopup("error", "Error", "Unable to open this file");

  }
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 13 },
  scrollContainer: { top: 15 },
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
    marginTop: 15
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
    backgroundColor: '#fff',
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
    color:"#000"
  },

  remarkText: {
    fontSize: 14,
    color: '#333',
  },
  label: {
    color: '#fff',
    marginBottom: 6,
    marginTop: 12,
  },

  input: {
    backgroundColor: '#d1d1d1',
    borderRadius: 6,
    padding: 12,
    color: '#000',
  },

  pickerWrapper: {
    backgroundColor: '#d1d1d1',
    borderRadius: 6,
  },
  dateInput: {
    flexDirection: "row",
    justifyContent: 'left',
    alignItems: "center",
    backgroundColor: "#5BA3C7",
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 12,
    height: 40,
  },
  dateTextDisplay: {
    color: "#fff"
  },
  calendarIcon: {
    fontSize: 16,
    marginLeft: 25
  },
  uploadBox: {
    backgroundColor: '#d1d1d1',
    padding: 14,
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

  chooseText: {
    backgroundColor: '#bdbdbd',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    color: '#000',
  },

  fileText: {
    color: '#555',
    flex: 1,
  },

  button: {
    backgroundColor: '#d62b6e',
    padding: 14,
    width: width * 0.25,
    borderRadius: 30,
    alignItems: 'center',
    marginTop: 30,
    marginBottom: 80,
  },
  uploadBoxall: {
    marginBottom: 70
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },

  uploadBox: {
    marginVertical: 10,
  },

  uploadLabel: {
    color: '#fff',
    marginBottom: 6,
    fontSize: 14,
  },

  uploadButton: {
    backgroundColor: '#ffffff22',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },

  uploadText: {
    color: '#fff',
  },

  fileRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#ffffff22',
    padding: 12,
    borderRadius: 8,
  },

  fileName: {
    color: '#00e0ff',
    maxWidth: '70%',
  },

  changeText: {
    color: '#ffcc00',
    fontWeight: '600',
  },
});
