import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    ScrollView,
    Switch,
    Image,
    Dimensions,
    TouchableOpacity,
    Alert
} from 'react-native';
import axios from "axios";
import LinearGradient from 'react-native-linear-gradient';
import BottomNavigation from '../BottomNavigation';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DatePicker from 'react-native-date-picker';
const { width } = Dimensions.get('window');
import { API_BASE_URL } from "@env";
import StatusPopup from '../StatusPopup/StatusPopup';

const PF_ESIC_Details = () => {
    const [pfesic, setPfEsic] = useState(null);
    const [unapprovePfesic, setunapprovePfesic] = useState(null);
    const [token, setToken] = useState(null);
    const [employee_id, setemployee_id] = useState(null);
    const [empid, SetEmpId] = useState(true);
    const [userData, setUserData] = useState(true);
    const [PfEsicDetailsStatus, setPfEsicDetailsStatus] = useState(null);
    const [rejectedRemark, setrejectedRemark] = useState(null);
    const [openExitDate, setOpenExitDate] = useState(false);
    const [exitDate, setExitDate] = useState(new Date());
    const [contactError, setContactError] = useState('');
    const [openMembershipDate, setOpenMembershipDate] = useState(false);
    const [membershipDate, setMembershipDate] = useState(new Date());
    const [openEsicDate, setOpenEsicDate] = useState(false);
    const [esicDate, setEsicDate] = useState(new Date());
    const [rights, setRights] = useState(false);
    const [updateButton, setUpdateButton] = useState(false);
    const [popupConfig, setPopupConfig] = useState({ visible: false, type: "success", title: "", message: "", });
    
    const [form, setForm] = useState({
        pre_er_pf: '',
        er_name: '',
        exit_date: '',
        last_drawn_gross: '',
        last_designation: '',
        reporting_to: '',
        contact_no: '',

        uan_no: '',
        esic_no: '',
        last_member_id: '',
        ip_dispensary: '',
        last_ro: '',
        family_dispensary: '',

        current_uan: '',
        current_ip_esic: '',
        current_member_id: '',
        current_ip_dispensary: '',
        current_ro: '',
        current_family_dispensary: '',
        membership_date_pf: '',
        membership_date_esic: '',
    });

    useEffect(() => {
        const loadData = async () => {
            const t = await AsyncStorage.getItem("authToken");
            const emp_id = await AsyncStorage.getItem("emp_id");
            const userData = JSON.parse(await AsyncStorage.getItem("userData"));
            const emp_unapprove_pfesic_details = JSON.parse(await AsyncStorage.getItem("emp_unapprove_pfesic_details"));
            const data = JSON.parse(
                await AsyncStorage.getItem("employee_PF_ESIC_details")
            );
            setemployee_id(await AsyncStorage.getItem("employee_id"));
            SetEmpId(emp_id);

            if (t && data) {
                setToken(t);
                setUserData(userData);
                setPfEsic(data);
                setunapprovePfesic(emp_unapprove_pfesic_details)
                setUpdateButton(emp_unapprove_pfesic_details.pfesic_details_submit_status)
                setRights(JSON.parse(await AsyncStorage.getItem("rights")));

            }
            if (emp_unapprove_pfesic_details.pfesic_details_status) {
                setPfEsicDetailsStatus(emp_unapprove_pfesic_details.pfesic_details_status);
                if (emp_unapprove_pfesic_details.rejected_remark) {
                    setrejectedRemark(emp_unapprove_pfesic_details.rejected_remark);
                }
            }
         
            
        };

        loadData();
    }, []);
    //    console.log(pfesic,unapprovePfesic,"pfesic","unapprovePfesic");
    useEffect(() => {
        if (!pfesic) return;

        setForm(prev => ({
            ...prev,
            pre_er_pf: pfesic.pre_er_pf === 'yes',

            er_name: pfesic?.pre_er_details?.er_name || unapprovePfesic?.er_name || '',
            exit_date: pfesic?.pre_er_details?.exit_date || unapprovePfesic?.exit_date || '',
            last_drawn_gross: pfesic?.pre_er_details?.last_drawn_gross || unapprovePfesic?.last_drawn_gross || '',
            last_designation: pfesic?.pre_er_details?.last_designation || unapprovePfesic?.last_designation || '',
            reporting_to: pfesic?.pre_er_details?.reporting_to || unapprovePfesic?.reporting_to || '',
            contact_no: pfesic?.pre_er_details?.contact_no || unapprovePfesic?.contact_no || '',

            uan_no: pfesic?.pre_er_epfo_details?.uan_no || unapprovePfesic?.uan_no || '',
            esic_no: pfesic?.pre_er_esic_details?.esic_no || unapprovePfesic?.esic_no || '',
            last_member_id: pfesic?.pre_er_epfo_details?.last_member_id || unapprovePfesic?.last_member_id || '',
            ip_dispensary: pfesic?.pre_er_esic_details?.ip_dispensary || unapprovePfesic?.ip_dispensary || '',
            last_ro: pfesic?.pre_er_epfo_details?.last_ro || unapprovePfesic?.last_ro || '',
            family_dispensary: pfesic?.pre_er_esic_details?.family_dispensary || unapprovePfesic?.family_dispensary || '',

            current_uan: pfesic?.curr_er_epfo_details?.uan_no || unapprovePfesic?.current_uan || '',
            current_ip_esic: pfesic?.curr_er_esic_details?.esic_no || unapprovePfesic?.current_ip_esic || '',
            current_member_id: pfesic?.curr_er_epfo_details?.last_member_id || unapprovePfesic?.current_member_id || '',
            current_ip_dispensary: pfesic?.curr_er_esic_details?.ip_dispensary || unapprovePfesic?.current_ip_dispensary || '',
            current_ro: pfesic?.curr_er_epfo_details?.last_ro || unapprovePfesic?.current_ro || '',
            current_family_dispensary: pfesic?.curr_er_esic_details?.family_dispensary || unapprovePfesic?.current_family_dispensary || '',
            membership_date_pf: pfesic?.curr_er_epfo_details?.membership_date || unapprovePfesic?.membership_date_pf || '',
            membership_date_esic: pfesic?.curr_er_esic_details?.membership_date || unapprovePfesic?.membership_date_esic || '',
        }));
    }, [pfesic,unapprovePfesic]);
      
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
            formData.append('personal_details_status', 'pending');
            // send switch value only if editable
            if (!pfesic) {
                formData.append('pre_er_pf', form.pre_er_pf ? 'yes' : 'no');
            }

            const keyMap = {
                er_name: { section: 'pre_er_details', key: 'er_name' },
                exit_date: { section: 'pre_er_details', key: 'exit_date' },
                last_drawn_gross: { section: 'pre_er_details', key: 'last_drawn_gross' },
                last_designation: { section: 'pre_er_details', key: 'last_designation' },
                reporting_to: { section: 'pre_er_details', key: 'reporting_to' },
                contact_no: { section: 'pre_er_details', key: 'contact_no' },

                uan_no: { section: 'pre_er_epfo_details', key: 'uan_no' },
                last_member_id: { section: 'pre_er_epfo_details', key: 'last_member_id' },
                last_ro: { section: 'pre_er_epfo_details', key: 'last_ro' },

                esic_no: { section: 'pre_er_esic_details', key: 'esic_no' },
                ip_dispensary: { section: 'pre_er_esic_details', key: 'ip_dispensary' },
                family_dispensary: { section: 'pre_er_esic_details', key: 'family_dispensary' },

                current_uan: { section: 'curr_er_epfo_details', key: 'uan_no' },
                current_member_id: { section: 'curr_er_epfo_details', key: 'last_member_id' },
                current_ro: { section: 'curr_er_epfo_details', key: 'last_ro' },
                membership_date_pf: { section: 'curr_er_epfo_details', key: 'membership_date' },

                current_ip_esic: { section: 'curr_er_esic_details', key: 'esic_no' },
                current_ip_dispensary: { section: 'curr_er_esic_details', key: 'ip_dispensary' },
                current_family_dispensary: { section: 'curr_er_esic_details', key: 'family_dispensary' },
                membership_date_esic: { section: 'curr_er_esic_details', key: 'membership_date' },
            };

            const isEditable = (formKey) => {
                const map = keyMap[formKey];
                if (!map) return false;

                return !pfesic?.[map.section]?.[map.key];
            };

            let editableFields = {
                pre_er_details: {},
                pre_er_epfo_details: {},
                pre_er_esic_details: {},
                curr_er_epfo_details: {},
                curr_er_esic_details: {}
            };

            Object.keys(keyMap).forEach(formKey => {
                const map = keyMap[formKey];

                const oldValue =
                    pfesic?.[map.section]?.[map.key] ?? '';

                const newValue = form[formKey] ?? '';
                
                if (String(oldValue).trim() !== String(newValue).trim()) {
                    editableFields[map.section][map.key] = newValue;
                }
            });

            Object.keys(editableFields).forEach(section => {
                if (Object.keys(editableFields[section]).length === 0) {
                    delete editableFields[section];
                }
            });
            if (Object.keys(editableFields).length > 0) {
                const pfesicPayload = {
                    pfesic_details_status: 'pending',
                    pfesic_details_submit_status: 'inactive',
                    ...editableFields
                };
                formData.append(
                    'pfesic_details',
                    JSON.stringify(pfesicPayload)
                );
            }
            // console.log(formData,"formDatanew");
            
            const response = await axios.post(
                `${API_BASE_URL}employee/request-update-pfesic-details`,
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
        } catch (e) {
            console.log('Submit error:', e.message);
        }
    };
     const formatDate = (date) => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };
    const isAnyFieldMissing = () => {
        const requiredFields = [
            'er_name',
            'exit_date',
            'last_drawn_gross',
            'last_designation',
            'contact_no',

            'uan_no',
            'last_member_id',
            'last_ro',

            'esic_no',
            'ip_dispensary',
            'family_dispensary',

            'current_uan',
            'current_member_id',
            'current_ro',
            'membership_date_pf',

            'current_ip_esic',
            'current_ip_dispensary',
            'current_family_dispensary',
            'membership_date_esic'
        ];

        const getValue = (field) => {
            const keyMap = {
                er_name: ['pre_er_details', 'er_name'],
                exit_date: ['pre_er_details', 'exit_date'],
                last_drawn_gross: ['pre_er_details', 'last_drawn_gross'],
                last_designation: ['pre_er_details', 'last_designation'],
                reporting_to: ['pre_er_details', 'reporting_to'],
                contact_no: ['pre_er_details', 'contact_no'],

                uan_no: ['pre_er_epfo_details', 'uan_no'],
                last_member_id: ['pre_er_epfo_details', 'last_member_id'],
                last_ro: ['pre_er_epfo_details', 'last_ro'],

                esic_no: ['pre_er_esic_details', 'esic_no'],
                ip_dispensary: ['pre_er_esic_details', 'ip_dispensary'],
                family_dispensary: ['pre_er_esic_details', 'family_dispensary'],

                current_uan: ['curr_er_epfo_details', 'uan_no'],
                current_member_id: ['curr_er_epfo_details', 'last_member_id'],
                current_ro: ['curr_er_epfo_details', 'last_ro'],
                membership_date_pf: ['curr_er_epfo_details', 'membership_date'],

                current_ip_esic: ['curr_er_esic_details', 'esic_no'],
                current_ip_dispensary: ['curr_er_esic_details', 'ip_dispensary'],
                current_family_dispensary: ['curr_er_esic_details', 'family_dispensary'],
                membership_date_esic: ['curr_er_esic_details', 'membership_date'],
            };

            const [section, key] = keyMap[field] || [];

            return (
                pfesic?.[section]?.[key] ??
                unapprovePfesic?.[field]
            );
        };

        return requiredFields.some(field => {
            const value = getValue(field);
            return !value || String(value).trim() === '';
        });
    };
    return (
        <LinearGradient
            colors={['#000000ff', '#1c68beff']}
            style={styles.container}
        >
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <View style={styles.header}>
                    <Image
                        source={require("../../assets/credit-card.png")}
                        style={styles.headerIcon}
                    />
                    <Text style={styles.title}>PF&ESIC Details</Text>
                </View>
                {PfEsicDetailsStatus && (
                    <View
                        style={[
                            styles.notificationBox,
                            PfEsicDetailsStatus === 'rejected'
                                ? styles.rejectedBox
                                : PfEsicDetailsStatus === 'pending'
                                    ? styles.pendingBox
                                    : PfEsicDetailsStatus === 'approved'
                                        ? styles.approvedBox
                                        : null
                        ]}
                    >
                        <Text style={styles.notificationTitle}>
                            {PfEsicDetailsStatus === 'rejected'
                                ? 'Details Rejected'
                                : PfEsicDetailsStatus === 'pending'
                                    ? 'Details Pending for Approval'
                                    : PfEsicDetailsStatus === 'approved'
                                        ? 'Details Approved'
                                        : ''}
                        </Text>

                        {PfEsicDetailsStatus === 'rejected' && (
                            <Text style={styles.remarkText}>
                                Remark: {rejectedRemark}
                            </Text>
                        )}
                    </View>
                )}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Previous Employment</Text>
                    {/* <Switch
                        value={form.pre_er_pf}
                        disabled={!!pfesic}
                        thumbColor="#fff"
                        trackColor={{ true: '#4caf50', false: '#777' }}
                    /> */}
                </View>

                {/* {form.pre_er_pf && ( */}
                <View style={styles.card}>

                    <View style={styles.row}>
                        <Text style={styles.label}>Name of Prev Employer</Text>
                        <TextInput
                            style={styles.input}
                            value={form.er_name}
                            editable={!pfesic?.pre_er_details?.er_name}
                            onChangeText={t => setForm(p => ({ ...p, er_name: t }))}
                        />
                    </View>

                    <View style={styles.row}>
                        <Text style={styles.label}>Exit Date</Text>

                        <TouchableOpacity
                            style={styles.dateInput}
                            disabled={!!pfesic?.pre_er_details?.exit_date}
                            onPress={() => setOpenExitDate(true)}
                        >
                            <Text style={styles.dateTextDisplay}>
                                {form.exit_date ? form.exit_date : 'Select Date'}
                            </Text>
                            <Text style={styles.calendarIcon}>📅</Text>
                        </TouchableOpacity>
                    </View>

                    <DatePicker
                        modal
                        mode="date"
                        open={openExitDate}
                        date={exitDate}
                        onConfirm={(date) => {
                            setOpenExitDate(false);
                            setExitDate(date);

                            // format to dd-mm-yyyy
                            const formatted = formatDate(date);

                            setForm(prev => ({
                                ...prev,
                                exit_date: formatted
                            }));
                        }}
                        onCancel={() => setOpenExitDate(false)}
                        theme="dark"
                    />

                    <View style={styles.row}>
                        <Text style={styles.label}>Last Drawn Gross</Text>

                        <TextInput
                            style={styles.input}
                            keyboardType="numeric"
                            value={form.last_drawn_gross}
                            editable={!pfesic?.pre_er_details?.last_drawn_gross}
                            onChangeText={(t) => {
                                const cleaned = t.replace(/[^0-9]/g, ''); // ✅ allow only digits

                                setForm(p => ({
                                    ...p,
                                    last_drawn_gross: cleaned
                                }));
                            }}
                        />
                    </View>

                    <View style={styles.row}>
                        <Text style={styles.label}>Last Designation</Text>
                        <TextInput
                            style={styles.input}
                            value={form.last_designation}
                            editable={!pfesic?.pre_er_details?.last_designation}
                            onChangeText={t => setForm(p => ({ ...p, last_designation: t }))}
                        />
                    </View>

                    <View style={styles.row}>
                        <Text style={styles.label}>Reporting To</Text>
                        <TextInput
                            style={styles.input}
                            value={form.reporting_to}
                            editable={!pfesic?.pre_er_details?.reporting_to}
                            onChangeText={t => setForm(p => ({ ...p, reporting_to: t }))}
                        />
                    </View>

                    <View style={styles.row}>
                        <Text style={styles.label}>Contact No</Text>

                        <TextInput
                            style={styles.input}
                            keyboardType="number-pad"
                            maxLength={10}
                            value={form.contact_no}
                            editable={!pfesic?.pre_er_details?.contact_no}
                            onChangeText={(t) => {
                                const cleaned = t.replace(/[^0-9]/g, ''); // only digits

                                setForm(p => ({
                                    ...p,
                                    contact_no: cleaned
                                }));

                                // validation
                                if (cleaned.length > 10) {
                                    setContactError('Enter a valid contact number');
                                } else if (cleaned.length > 0 && cleaned.length < 10) {
                                    setContactError('Contact number must be 10 digits');
                                } else {
                                    setContactError('');
                                }
                            }}
                        />

                        {contactError ? (
                            <Text style={{ color: 'red', fontSize: 12, marginTop: 4 }}>
                                {contactError}
                            </Text>
                        ) : null}
                    </View>

                    <Text style={styles.subTitle}>EPFO Details</Text>

                    <View style={styles.row}>
                        <Text style={styles.label}>UAN No</Text>
                        <TextInput
                            style={styles.input}
                            value={form.uan_no}
                            editable={!pfesic?.pre_er_epfo_details?.uan_no}
                            onChangeText={t => setForm(p => ({ ...p, uan_no: t }))}
                        />
                    </View>

                    <View style={styles.row}>
                        <Text style={styles.label}>Last Member ID</Text>
                        <TextInput
                            style={styles.input}
                            value={form.last_member_id}
                            editable={!pfesic?.pre_er_epfo_details?.last_member_id}
                            onChangeText={t => setForm(p => ({ ...p, last_member_id: t }))}
                        />
                    </View>

                    <View style={styles.row}>
                        <Text style={styles.label}>Last RO</Text>
                        <TextInput
                            style={styles.input}
                            value={form.last_ro}
                            editable={!pfesic?.pre_er_epfo_details?.last_ro}
                            onChangeText={t => setForm(p => ({ ...p, last_ro: t }))}
                        />
                    </View>

                    <Text style={styles.subTitle}>ESIC Details</Text>

                    <View style={styles.row}>
                        <Text style={styles.label}>ESIC No</Text>
                        <TextInput
                            style={styles.input}
                            value={form.esic_no}
                            editable={!pfesic?.pre_er_esic_details?.esic_no}
                            onChangeText={t => setForm(p => ({ ...p, esic_no: t }))}
                        />
                    </View>

                    <View style={styles.row}>
                        <Text style={styles.label}>IP Dispensary</Text>
                        <TextInput
                            style={styles.input}
                            value={form.ip_dispensary}
                            editable={!pfesic?.pre_er_esic_details?.ip_dispensary}
                            onChangeText={t => setForm(p => ({ ...p, ip_dispensary: t }))}
                        />
                    </View>

                    <View style={styles.row}>
                        <Text style={styles.label}>Family Dispensary</Text>
                        <TextInput
                            style={styles.input}
                            value={form.family_dispensary}
                            editable={!pfesic?.pre_er_esic_details?.family_dispensary}
                            onChangeText={t => setForm(p => ({ ...p, family_dispensary: t }))}
                        />
                    </View>

                </View>
                {/* )} */}

                {/* CURRENT EMPLOYER */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Current Employer</Text>
                </View>

                <View style={styles.card}>

                    <Text style={styles.subTitle}>EPFO Details</Text>

                    <View style={styles.row}>
                        <Text style={styles.label}>UAN No</Text>
                        <TextInput
                            style={styles.input}
                            value={form.current_uan}
                            editable={!pfesic?.curr_er_epfo_details?.uan_no}
                            onChangeText={t => setForm(p => ({ ...p, current_uan: t }))}
                        />
                    </View>

                    <View style={styles.row}>
                        <Text style={styles.label}>Member ID</Text>
                        <TextInput
                            style={styles.input}
                            value={form.current_member_id}
                            editable={!pfesic?.curr_er_epfo_details?.last_member_id}
                            onChangeText={t => setForm(p => ({ ...p, current_member_id: t }))}
                        />
                    </View>

                    <View style={styles.row}>
                        <Text style={styles.label}>Last RO</Text>
                        <TextInput
                            style={styles.input}
                            value={form.current_ro}
                            editable={!pfesic?.curr_er_epfo_details?.last_ro}
                            onChangeText={t => setForm(p => ({ ...p, current_ro: t }))}
                        />
                    </View>

                    <View style={styles.row}>
                        <Text style={styles.label}>Membership Date (PF)</Text>

                        <TouchableOpacity
                            style={styles.dateInput}
                            disabled={!!pfesic?.curr_er_epfo_details?.membership_date}
                            onPress={() => setOpenMembershipDate(true)}
                        >
                            <Text style={styles.dateTextDisplay}>
                                {form.membership_date_pf || 'Select Date'}
                            </Text>

                            <Text style={styles.calendarIcon}>📅</Text>
                        </TouchableOpacity>
                    </View>
                    <DatePicker
                        modal
                        mode="date"
                        open={openMembershipDate}
                        date={membershipDate}
                        onConfirm={(date) => {
                            setOpenMembershipDate(false);
                            setMembershipDate(date);

                            const formatted = formatDate(date); 

                            setForm(p => ({
                                ...p,
                                membership_date_pf: formatted
                            }));
                        }}
                        onCancel={() => setOpenMembershipDate(false)}
                        theme="dark"
                    />
                    <Text style={styles.subTitle}>ESIC Details</Text>

                    <View style={styles.row}>
                        <Text style={styles.label}>ESIC No</Text>
                        <TextInput
                            style={styles.input}
                            value={form.current_ip_esic}
                            editable={!pfesic?.curr_er_esic_details?.esic_no}
                            onChangeText={t => setForm(p => ({ ...p, current_ip_esic: t }))}
                        />
                    </View>

                    <View style={styles.row}>
                        <Text style={styles.label}>IP Dispensary</Text>
                        <TextInput
                            style={styles.input}
                            value={form.current_ip_dispensary}
                            editable={!pfesic?.curr_er_esic_details?.ip_dispensary}
                            onChangeText={t => setForm(p => ({ ...p, current_ip_dispensary: t }))}
                        />
                    </View>

                    <View style={styles.row}>
                        <Text style={styles.label}>Family Dispensary</Text>
                        <TextInput
                            style={styles.input}
                            value={form.current_family_dispensary}
                            editable={!pfesic?.curr_er_esic_details?.family_dispensary}
                            onChangeText={t => setForm(p => ({ ...p, current_family_dispensary: t }))}
                        />
                    </View>

                    <View style={styles.row}>
                        <Text style={styles.label}>Membership Date (ESIC)</Text>

                        <TouchableOpacity
                            style={styles.dateInput}
                            disabled={!!pfesic?.curr_er_esic_details?.membership_date}
                            onPress={() => setOpenEsicDate(true)}
                        >
                            <Text style={styles.dateTextDisplay}>
                                {form.membership_date_esic || 'Select Date'}
                            </Text>

                            <Text style={styles.calendarIcon}>📅</Text>
                        </TouchableOpacity>
                    </View>
                    <DatePicker
                        modal
                        mode="date"
                        open={openEsicDate}
                        date={esicDate}
                        onConfirm={(date) => {
                            setOpenEsicDate(false);
                            setEsicDate(date);

                            const formatted = formatDate(date); 

                            setForm(p => ({
                                ...p,
                                membership_date_esic: formatted
                            }));
                        }}
                        onCancel={() => setOpenEsicDate(false)}
                        theme="dark"
/>
                    {(updateButton !== "approved" || isAnyFieldMissing())  && (
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
            <BottomNavigation rights={rights}/>
        </LinearGradient>
    );
};

export default PF_ESIC_Details;

const styles = StyleSheet.create({
    container: { flex: 1 },

    scrollContainer: {
        padding: 14,
        paddingBottom: 90,
    },

    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
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
    sectionHeader: {
        backgroundColor: '#2f343a',
        padding: 12,
        borderRadius: 6,
        marginTop: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },

    sectionTitle: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },

    card: {
        // backgroundColor: '#e6e6e6',
        borderRadius: 6,
        padding: 12,
        marginTop: 10,
    },

    row: {
        marginBottom: 10,
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
    label: {
        fontSize: 12,
        color: '#fff',
        marginBottom: 4,
    },

    input: {
        backgroundColor: '#fff',
        borderRadius: 5,
        padding: 10,
        color: '#000',
        fontSize: 14,
    },

    subTitle: {
        marginTop: 14,
        marginBottom: 6,
        fontSize: 13,
        fontWeight: '600',
        color: '#1c68be',
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
});