import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Dimensions,
  Alert
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import LinearGradient from 'react-native-linear-gradient';
import BottomNavigation from '../BottomNavigation';
import { NativeModules } from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from "axios";
import StatusPopup from '../StatusPopup/StatusPopup';

import { API_BASE_URL } from "@env";

const { PdfPicker } = NativeModules;
const { width } = Dimensions.get('window');

const BankDetailsForm = ({route}) => {
  const [file, setFile] = useState(null);
  const [token, setToken] = useState(null);
  const [userData, setUserData] = useState(null);
  const [bankDetails, setBankDetails] = useState(null);
  const [unapproveBankDetails, setUnapproveBankDetails] = useState(null);
  const [BankDetailsStatus, setBankDetailsStatus] = useState(null);
  const [rejectedRemark, setrejectedRemark] = useState(null);
  const [employee_vault, setEmployeeVault] = useState(0);
  const [rights, setRights] = useState(false);
  const [alreadyUploadedSize, setAlreadyUploadedSize] = useState(0);
  const MAX_SINGLE_FILE_KB = 200;
  const [popupConfig, setPopupConfig] = useState({ visible: false, type: "success", title: "", message: "", });
  const [employee_id, setemployee_id] = useState(null);
  const [updateButton, setUpdateButton] = useState(false);
  const [form, setForm] = useState({
    bank_name: '',
    branch_name: '',
    branch_address: '',
    branch_pin: '',
    account_no: '',
    re_account_no: '',
    account_type: '',
    ifsc_code: '',
    micr_no: '',
    cancel_cheque: '',
  });


  useEffect(() => {
    const loadTokenAndFetch = async () => {
      const t = await AsyncStorage.getItem("authToken");
      const userData = JSON.parse(await AsyncStorage.getItem("userData"));
      // const employee_bank_details = JSON.parse(await AsyncStorage.getItem("employee_bank_details"));
      // const emp_unapprove_bank_details = JSON.parse(await AsyncStorage.getItem("emp_unapprove_bank_details"));
      const employee_bank_details = route?.params?.employee_bank_details;
      const emp_unapprove_bank_details = route?.params?.emp_unapprove_bank_details;
      const employee_vault = JSON.parse(await AsyncStorage.getItem("employee_vault"));
      const total_file_size = JSON.parse(await AsyncStorage.getItem("total_file_size"));
      setemployee_id(await AsyncStorage.getItem("employee_id"));
      console.log(route,"employee_bank_details");
      
      if (t) {
        setToken(t);
        setUserData(userData);
        setBankDetails(employee_bank_details)
        setUnapproveBankDetails(emp_unapprove_bank_details)
        setUpdateButton(emp_unapprove_bank_details.bank_details_status)
        setEmployeeVault(employee_vault || 0);
        setAlreadyUploadedSize(total_file_size || 0);
        setRights(JSON.parse(await AsyncStorage.getItem("rights")));
         setForm(prev => ({
        ...prev,
        employee_id,
        emp_id: userData?.emp_id || '',
        bank_name: employee_bank_details?.bank_name || emp_unapprove_bank_details?.bank_name || '',
        branch_name: employee_bank_details?.branch_name || emp_unapprove_bank_details?.branch_name || '',
        branch_address: employee_bank_details?.branch_address || emp_unapprove_bank_details?.branch_address || '',
        branch_pin: employee_bank_details?.branch_pin || emp_unapprove_bank_details?.branch_pin || '',
        account_no: employee_bank_details?.account_no || emp_unapprove_bank_details?.account_no || '',
        account_type: employee_bank_details?.account_type || emp_unapprove_bank_details?.account_type || '',
        ifsc_code: employee_bank_details?.ifsc_code || emp_unapprove_bank_details?.ifsc_code || '',
        micr_no: employee_bank_details?.micr_no || emp_unapprove_bank_details?.micr_no || '',
      }));
      }
      if (emp_unapprove_bank_details.bank_details_status) {
        setBankDetailsStatus(emp_unapprove_bank_details.bank_details_status);
        if (emp_unapprove_bank_details.rejected_remark) {
          setrejectedRemark(emp_unapprove_bank_details.rejected_remark);
        }
      }
    };

    loadTokenAndFetch();
    // fetchUpdatedDetails(token);
  }, [token]);

  // useEffect(() => {
  //   console.log(bankDetails, "bankDEtails");
  //   // console.log(userData.corporate_id, "userData");

  //   if (!bankDetails || !userData || !employee_id) return;
  //   console.log(bankDetails.branch_name, "bankDetails");
  //   setForm(prev => ({
  //     ...prev,
  //     employee_id,
  //     emp_id: userData.emp_id || '',
  //     bank_name: bankDetails?.bank_name || unapproveBankDetails?.bank_name || '',
  //     branch_name: bankDetails?.branch_name || unapproveBankDetails?.branch_name || '',
  //     branch_address: bankDetails?.branch_address || unapproveBankDetails?.branch_address || '',
  //     branch_pin: bankDetails?.branch_pin || unapproveBankDetails?.branch_pin || '',
  //     account_no: bankDetails?.account_no || unapproveBankDetails?.account_no || '',
  //     account_type: bankDetails?.account_type || unapproveBankDetails?.account_type || '',
  //     ifsc_code: bankDetails?.ifsc_code || unapproveBankDetails?.ifsc_code || '',
  //     micr_no: bankDetails?.micr_no || unapproveBankDetails?.micr_no || '',
  //   }));
  // }, [bankDetails, userData, employee_id]);



  const Bank_Fields = [
    'bank_name',
    'branch_name',
    'branch_address',
    'branch_pin',
    'account_no',
    'account_type',
    'ifsc_code',
    'micr_no',
    'cancel_cheque'
  ];

  const getRemainingSizeKB = () => {
    const selectedSizeKB = file?.size ? file.size / 1024 : 0;
    // console.log(alreadyUploadedSize, "alreadyUploadedSize");
    // console.log(alreadyUploadedSize + selectedSizeKB, "alreadyUploadedSize + selectedSizeKB");

    const remaining =
      employee_vault - (alreadyUploadedSize + selectedSizeKB);

    return remaining > 0 ? remaining : 0;
  };

  // const pickFile = async () => {
  //   try {
  //     const picked = await PdfPicker.pickFile();
  //     if (!picked) return;

  //     const fileObj = {
  //       name: picked.name || picked.fileName || 'cancel_cheque.pdf',
  //       uri: picked.uri,
  //       type: picked.type || 'application/pdf',
  //     };
  //     // console.log(fileObj,"fileObj");

  //     setFile(fileObj);
  //   } catch (err) {
  //     console.log('File pick cancelled', err);
  //   }
  // };

  const showPopup = (type, title, message) => {
    setPopupConfig({
      visible: true,
      type,
      title,
      message,
    });
  };
  const pickFile = async () => {
    try {
      const picked = await PdfPicker.pickFile();
      if (!picked) return;

      const fileSizeKB = picked.size / 1024;

      // console.log(remainingSizeKB,"remainingSizeKB");

      if (fileSizeKB > MAX_SINGLE_FILE_KB) {
        // Alert.alert(
        //   "File Too Large",
        //   `File must be less than ${MAX_SINGLE_FILE_KB} KB`
        // );
        showPopup("error", "File Too Large", `File must be less than ${MAX_SINGLE_FILE_KB} KB`);
        return;
      }

      // if (fileSizeKB > remainingSizeKB) {
      //   Alert.alert(
      //     "Storage Limit Exceeded",
      //     `Only ${remainingSizeKB.toFixed(2)} KB remaining`
      //   );
      //   return;
      // }

      const fileObj = {
        name: picked.name || picked.fileName || 'cancel_cheque.pdf',
        uri: picked.uri,
        type: picked.type || 'application/pdf',
        size: picked.size,
      };

      setFile(fileObj);

    } catch (err) {
      console.log('File pick cancelled', err);
    }
  };
  const onSubmit = async () => {
    // console.log(alreadyUploadedSize, "alreadyUploadedSize");
    if(!bankDetails?.account_no ){
    if (form.account_no != form.re_account_no) {
      // Alert.alert('Error', 'Account No. not match');
      showPopup("error", "Error", "Account No. not match");
      return;
    }
  }
  
    try {
      const selectedFilesSizeKB = getRemainingSizeKB();
      // console.log(selectedFilesSizeKB, "selectedFilesSizeKB")
      const totalUsed = alreadyUploadedSize + selectedFilesSizeKB;
      // console.log(totalUsed, "totalUsed")
      // console.log(employee_vault - totalUsed, "remaining")
      if (totalUsed > employee_vault) {
        // Alert.alert(
        //   "Storage Limit Exceeded",
        //   `Only ${(employee_vault - alreadyUploadedSize).toFixed(2)} KB remaining`
        // );
        showPopup("error", "Storage Limit Exceeded", `Only ${(employee_vault - alreadyUploadedSize).toFixed(2)} KB remaining`);
        return;
      }
      const formData = new FormData();

      formData.append('employee_id', employee_id);
      formData.append('emp_id', userData.emp_id);
      formData.append('corporate_id', userData?.corporate_id);
      // formData.append('bank_details_status', 'pending');
      const bank_details = {};
      Bank_Fields.forEach(field => {
        const oldValue =
          bankDetails?.[field]?.value ?? bankDetails?.[field] ?? '';

        const newValue = form?.[field] ?? '';

        if (String(oldValue).trim() === String(newValue).trim()) return;
        bank_details[field] = newValue
        // formData.append(field, newValue);
      });

      if (Object.keys(bank_details).length > 0) {
        const bankPayload = {
          bank_details_status: 'pending',
          bank_details_submit_status: 'inactive',
          ...bank_details
        };
        formData.append(
          'bank_details',
          JSON.stringify(bankPayload)
        );
      }
      if (file) {
        formData.append('cancel_cheque', {
          uri: file.uri,
          name: file.name,
          type: file.type,
        });
      }
      console.log(formData, "formData");

      const response = await axios.post(
        `${API_BASE_URL}employee/request-update-employee-bank-details`,
        formData,
        {
          headers: {
            'x-access-token': token,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      if (response?.data?.status === 'success') {
        // Alert.alert('Success', 'Details sent for approval');
        showPopup("success", "Success", "Details sent for approval");

      }
    } catch (error) {
      console.log(error.message);
    }
  }
  const isAnyFieldMissing = () => {
    const requiredFields = [
      'bank_name',
      'branch_name',
      'branch_address',
      'branch_pin',
      'account_no',
      'account_type',
      'ifsc_code',
      'micr_no',
      
    ];

    // return requiredFields.some(field => {
    //   const value =
    //     bankDetails?.[field] ??
    //     unapproveBankDetails?.[field];

    //   return !value || String(value).trim() === '';
    // });
    const isTextMissing = requiredFields.some(field => {
      const value =
        bankDetails?.[field] ??
        unapproveBankDetails?.[field];

      return !value || String(value).trim() === '';
    });

    const cancelChequeValue =
      bankDetails?.cancel_cheque || unapproveBankDetails?.cancel_cheque;

    const isCancelChequeMissing =
      (!cancelChequeValue || cancelChequeValue === '') && !file;

    return isTextMissing || isCancelChequeMissing;

  };


  const cancelChequeValue =
  bankDetails?.cancel_cheque || unapproveBankDetails?.cancel_cheque;

const isChequeUploaded =
  cancelChequeValue !== null &&
  cancelChequeValue !== undefined &&
  cancelChequeValue !== '';

  
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
              source={require('../../assets/credit-card.png')}
              style={styles.headerIcon}
            />
            <Text style={styles.title}>Employee Bank Details</Text>
          </View>
          {BankDetailsStatus && (
            <View
              style={[
                styles.notificationBox,
                BankDetailsStatus === 'rejected'
                  ? styles.rejectedBox
                  : BankDetailsStatus === 'pending'
                    ? styles.pendingBox
                    : BankDetailsStatus === 'approved'
                      ? styles.approvedBox
                      : null
              ]}
            >
              <Text style={styles.notificationTitle}>
                {BankDetailsStatus === 'rejected'
                  ? 'Details Rejected'
                  : BankDetailsStatus === 'pending'
                    ? 'Details Pending for Approval'
                    : BankDetailsStatus === 'approved'
                      ? 'Details Approved'
                      : ''}
              </Text>

              {BankDetailsStatus === 'rejected' && (
                <Text style={styles.remarkText}>
                  Remark: {rejectedRemark}
                </Text>
              )}
            </View>
          )}
          <Text style={styles.label}>Bank Name</Text>
          <TextInput
            style={styles.input}
            value={form.bank_name}
            editable={!bankDetails?.bank_name}
            onChangeText={t => setForm(p => ({ ...p, bank_name: t }))}
          />

          <Text style={styles.label}>Branch</Text>
          <TextInput
            style={styles.input}
            value={form.branch_name}
            editable={!bankDetails?.branch_name}
            onChangeText={t => setForm(p => ({ ...p, branch_name: t }))}
          />

          <Text style={styles.label}>Branch Address</Text>
          <TextInput
            style={styles.input}
            value={form.branch_address}
            editable={!bankDetails?.branch_address}
            onChangeText={t => setForm(p => ({ ...p, branch_address: t }))}
          />

          <Text style={styles.label}>Bank PIN</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={form.branch_pin}
             editable={!bankDetails?.branch_pin}
            onChangeText={t => setForm(p => ({ ...p, branch_pin: t }))}
          />

          <Text style={styles.label}>A/C No</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={form.account_no}
             editable={!bankDetails?.account_no}
            onChangeText={t => setForm(p => ({ ...p, account_no: t }))}
          />

          {!bankDetails?.account_no && (
            <>
              <Text style={styles.label}>Re-enter A/C No</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={form.re_account_no}
                onChangeText={t => setForm(p => ({ ...p, re_account_no: t }))}
              />

            </>
          )}


          <Text style={styles.label}>A/C Type</Text>
          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={form.account_type}
               enabled={!bankDetails?.account_type}
                // value={form.account_type}
              onValueChange={v =>
                setForm(p => ({ ...p, account_type: v }))
              }
            >
              <Picker.Item label="Choose Account Type" value="" />
              <Picker.Item label="Savings Account" value="saving" />
              <Picker.Item label="Current Account" value="current" />
            </Picker>
          </View>

          <Text style={styles.label}>IFSC Code</Text>
          <TextInput
            style={styles.input}
             editable={!bankDetails?.ifsc_code}
            value={form.ifsc_code}
            onChangeText={t => setForm(p => ({ ...p, ifsc_code: t }))}
          />

          <Text style={styles.label}>MICR No</Text>
          <TextInput
            style={styles.input}
            value={form.micr_no}
            editable={!bankDetails?.micr_no}
            onChangeText={t => setForm(p => ({ ...p, micr_no: t }))}
          />

          {/* <Text style={styles.label}>Upload Cheque / Passbook</Text>
          <View style={styles.uploadBox}>
            <TouchableOpacity onPress={pickFile}>
              <Text style={styles.chooseText}>Choose file</Text>
            </TouchableOpacity>
            <Text style={styles.fileText}>
              {file ? file.name : 'No file chosen'}
            </Text>
          </View> */}
          <Text style={styles.label}>Upload Cheque / Passbook</Text>
          <UploadBox
            // label="Upload Cheque / Passbook"
            file={
              file
                ? file
                : isChequeUploaded
                  ? { name: 'Uploaded File' }
                  : null
            }
            onPress={pickFile}
            disabled={isChequeUploaded}
          />

          {(updateButton !== "approved" || isAnyFieldMissing()) && (
            <TouchableOpacity style={styles.button} onPress={onSubmit}>
              <Text style={styles.buttonText}>Update</Text>
            </TouchableOpacity>
          )}
        </View>
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

const UploadBox = ({ label, file, onPress, disabled }) => {
  return (
    <View style={styles.uploadBox}>
      <Text style={styles.uploadLabel}>{label}</Text>

      {!file ? (
        /* No file → Pick file */
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
        /* File exists → show file */
        <View style={styles.fileRow}>
          <Text style={styles.fileName} numberOfLines={1}>
            📄 {file.name || 'Uploaded File'}
          </Text>

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

export default BankDetailsForm;
const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContainer: { padding: 16, paddingBottom: 80 },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  containerall: {
    marginBottom: 100
  },
  headerIcon: {
    width: 28,
    height: 28,
    marginRight: 10,
    tintColor: '#fff',
  },
  title: {
    fontSize: 18,
    color: '#fff',
    fontWeight: '600',
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
    color: '#cfd8ff',
    marginTop: 12,
    marginBottom: 4,
    fontSize: 13,
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
    borderRadius: 6,
  },

  uploadBtn: {
    backgroundColor: '#fff',
    height: 44,
    justifyContent: 'center',
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  uploadText: {
    color: '#555',
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

  buttonText: {
    color: '#fff',
    fontWeight: '600',
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
    color: '#db1717',
    flex: 1,
  },
});