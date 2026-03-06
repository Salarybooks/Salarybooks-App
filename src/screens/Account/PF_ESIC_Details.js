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
const { width } = Dimensions.get('window');
import { API_BASE_URL } from "@env";

const PF_ESIC_Details = () => {
    const [pfesic, setPfEsic] = useState(null);
    const [unapprovePfesic, setunapprovePfesic] = useState(null);
    const [token, setToken] = useState(null);
    const [employee_id, setemployee_id] = useState(null);
    const [empid, SetEmpId] = useState(true);
    const [userData, setUserData] = useState(true);
    const [PfEsicDetailsStatus, setPfEsicDetailsStatus] = useState(null);
    const [rejectedRemark, setrejectedRemark] = useState(null);
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
    }, [pfesic]);

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
                    ...editableFields
                };
                formData.append(
                    'pfesic_details',
                    JSON.stringify(pfesicPayload)
                );
            }

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
                Alert.alert('Success', 'Details sent for approval');
            }
        } catch (e) {
            console.log('Submit error:', e.message);
        }
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
                            PfEsicDetailsStatus === 'reject'
                                ? styles.rejectedBox
                                : styles.pendingBox
                        ]}
                    >
                        <Text style={styles.notificationTitle}>
                            {PfEsicDetailsStatus === 'reject'
                                ? 'Details Rejected'
                                : ' Details Approved'}
                        </Text>

                        {PfEsicDetailsStatus === 'reject' && (
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
                        <TextInput
                            style={styles.input}
                            value={form.exit_date}
                            editable={!pfesic?.pre_er_details?.exit_date}
                            onChangeText={t => setForm(p => ({ ...p, exit_date: t }))}
                        />
                    </View>

                    <View style={styles.row}>
                        <Text style={styles.label}>Last Drawn Gross</Text>
                        <TextInput
                            style={styles.input}
                            keyboardType="numeric"
                            value={form.last_drawn_gross}
                            editable={!pfesic?.pre_er_details?.last_drawn_gross}
                            onChangeText={t => setForm(p => ({ ...p, last_drawn_gross: t }))}
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
                            keyboardType="numeric"
                            value={form.contact_no}
                            editable={!pfesic?.pre_er_details?.contact_no}
                            onChangeText={t => setForm(p => ({ ...p, contact_no: t }))}
                        />
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
                        <TextInput
                            style={styles.input}
                            value={form.membership_date_pf}
                            editable={!pfesic?.curr_er_epfo_details?.membership_date}
                            onChangeText={t => setForm(p => ({ ...p, membership_date_pf: t }))}
                        />
                    </View>

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
                        <TextInput
                            style={styles.input}
                            value={form.membership_date_esic}
                            editable={!pfesic?.curr_er_esic_details?.membership_date}
                            onChangeText={t => setForm(p => ({ ...p, membership_date_esic: t }))}
                        />
                    </View>

                    <TouchableOpacity style={styles.button} onPress={onSubmit}>
                        <Text style={styles.buttonText}>UPDATE</Text>
                    </TouchableOpacity>

                </View>

            </ScrollView>
            <BottomNavigation />
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
        backgroundColor: '#fff4e5',
        borderLeftWidth: 5,
        borderLeftColor: '#ff9500',
    },

    notificationTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 5,
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