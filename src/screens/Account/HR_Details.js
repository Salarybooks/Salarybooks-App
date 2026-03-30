import React, { useState,useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  Switch,
  Dimensions,
  Image
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import BottomNavigation from '../BottomNavigation';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

const HR_Details = () => {
  const [selfService, setSelfService] = useState(true);
  const [empid, SetEmpId] = useState(true);
  const [hrDetails, setHrDetails] = useState(null);
  const [employee_id, setemployee_id] = useState(null);
  const [masterdata, SetMasterData] = useState(null);
  const [token,setToken] = useState(null);
  const [rights, setRights] = useState(false);
  const [form, setForm] = useState({
    department: '',
    designation: '',
    branch: '',
    date_of_join: '',
    hod: '',
    client: '',
    emp_type: '',
    pension_applicable: '',
    emp_id: '',
    gross_salary: '',
  });

  // const selectedDepartment = masterdata?.masters?.department?.find(
  //       d => d._id === hrDetails.department
  //     );
  // const selectedDesignation = masterdata?.masters?.designation?.find(
  //       d => d._id === hrDetails.designation
  //     );
  // const selectedBranch = masterdata?.masters?.branch?.company_branch?.find(
  //       d => d._id === hrDetails.branch
  //     );
  // const selectedHod = masterdata?.masters?.hod?.find(
  //       d => d._id === hrDetails.hod
  //     );
  // const selectedClient = masterdata?.masters?.clients?.find(
  //       d => d._id === hrDetails.client
  //     );
  useEffect(() => {
    const loadTokenAndFetch = async () => {
      const t = await AsyncStorage.getItem("authToken");
      const emp_id = await AsyncStorage.getItem("emp_id");
      const employee_hr_details = JSON.parse(await AsyncStorage.getItem("employee_hr_details"));
      const masterdata = JSON.parse(await AsyncStorage.getItem("masterdata"));
      //   const userData = JSON.parse(await AsyncStorage.getItem("userData"));
      console.log("setHrDetails==true", employee_hr_details);
      
      setemployee_id(await AsyncStorage.getItem("employee_id"));
      if (t && employee_hr_details) {
        setToken(t);
        setHrDetails(employee_hr_details);
        SetEmpId(emp_id);
        SetMasterData(masterdata);
        // console.log("employee_id==true",masterdata);
        setRights(JSON.parse(await AsyncStorage.getItem("rights")));

      }

    };

    loadTokenAndFetch();
    // fetchUpdatedDetails(token);
  }, [token]);

  // useEffect(() => {
  //   // console.log(hrDetails.gross_salary,"hrDetails");
    
  //   if (!hrDetails || !employee_id) return;
  //   console.log(hrDetails.branch_name, "hrDetails");
  //   setForm(prev => ({
  //     ...prev,
  //     employee_id,
  //   //   emp_id: userData.emp_id || '',
  //     department:selectedDepartment?.department_name || '',
  //     designation: selectedDesignation?.designation_name  || '',
  //     branch: selectedBranch?.branch_name || '',
  //     date_of_join:hrDetails?.date_of_join?.split('T')[0] || '',
  //     hod: (selectedHod?.first_name + " " + selectedHod.last_name) || '',
  //     client: selectedClient?.client_name || '',
  //     emp_type: hrDetails?.emp_type || '',
  //     pension_applicable: hrDetails?.pension_applicable || '',
  //     emp_id: empid || '',
  //     gross_salary: String(hrDetails?.gross_salary || ''),
  //   }));
  // }, [hrDetails, employee_id]);
  useEffect(() => {
  if (!hrDetails || !employee_id || !masterdata) return;

  const selectedDepartment = masterdata?.masters?.department?.find(
    d => d._id === hrDetails.department
  );

  const selectedDesignation = masterdata?.masters?.designation?.find(
    d => d._id === hrDetails.designation
  );

  const selectedBranch = masterdata?.masters?.branch?.company_branch?.find(
    d => d._id === hrDetails.branch
  );

  const selectedHod = masterdata?.masters?.hod?.find(
    d => d._id === hrDetails.hod
  );

  const selectedClient = masterdata?.masters?.clients?.find(
    d => d._id === hrDetails.client
  );

  setForm(prev => ({
    ...prev,
    employee_id,
    department: selectedDepartment?.department_name || '',
    designation: selectedDesignation?.designation_name || '',
    branch: selectedBranch?.branch_name || '',
    date_of_join: hrDetails?.date_of_join?.split('T')[0] || '',
    hod: selectedHod
      ? `${selectedHod.first_name} ${selectedHod.last_name}`
      : '',
    client: selectedClient?.client_name || '',
    emp_type: hrDetails?.emp_type || '',
    pension_applicable: hrDetails?.pension_applicable || '',
    emp_id: empid || '',
    gross_salary: String(hrDetails?.gross_salary || ''),
  }));
}, [hrDetails, employee_id, masterdata]);
  const onChange = (key, value) =>
    setForm(prev => ({ ...prev, [key]: value }));

  return (
    <LinearGradient
          colors={['#000000ff', '#1c68beff']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.container}
        >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
                  <Image
                    source={require('../../assets/employee.png')}
                    style={styles.headerIcon}
                  />
                  <Text style={styles.title}>HR Details</Text>
                </View>
        <View style={styles.row}>
          <Text style={styles.label}>DEPARTMENT</Text>
          <TextInput
            style={styles.input}
            value={form.department}
            onChangeText={t => onChange('department', t)}
            editable={false}
          />
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>DESIGNATION</Text>
          <TextInput
            style={styles.input}
            value={form.designation}
            onChangeText={t => onChange('designation', t)}
            editable={false}
          />
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>BRANCH</Text>
          <TextInput
            style={styles.input}
            value={form.branch}
            onChangeText={t => onChange('branch', t)}
            editable={false}
          />
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>DATE OF JOIN</Text>
          <TextInput
            style={styles.input}
            value={form.date_of_join}
            onChangeText={t => onChange('date_of_join', t)}
            editable={false}
          />
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>HOD</Text>
          <TextInput
            style={styles.input}
            value={form.hod}
            onChangeText={t => onChange('hod', t)}
            editable={false}
          />
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>CLIENT</Text>
          <TextInput
            style={styles.input}
            value={form.client}
            onChangeText={t => onChange('client', t)}
            editable={false}
          />
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>EMPLOYMENT TYPE</Text>
          <TextInput
            style={styles.input}
            value={form.emp_type}
            onChangeText={t => onChange('emp_type', t)}
            editable={false}
          />
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>PENSION APPLICABLE</Text>
          <TextInput
            style={styles.input}
            value={form.pension_applicable}
            onChangeText={t => onChange('pension_applicable', t)}
            editable={false}
          />
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>USER ID</Text>
          <TextInput
            style={[styles.input, styles.disabledInput]}
            value={form.emp_id}
            editable={false}
          />
        </View>

        

        {/* <View style={styles.rowLast}> */}
       <View style={styles.rowLast}>
          <Text style={styles.label}>GROSS SALARY</Text>
          <TextInput
            style={styles.input}
            //  keyboardType="numeric"
            value={form.gross_salary}
            onChangeText={t => onChange('gross_salary', t)}
            editable={false}
          />
        </View>

      </ScrollView>

      <BottomNavigation rights={rights}/>
    </LinearGradient>
  );
};

export default HR_Details;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 13 },
  scrollContainer: { top: 15 },
   header: {
    flexDirection:"row",
    width: "100%",
    alignItems:"center",
    gap:5,
     marginBottom: 20,
  },  
//   scroll: { padding: 16, paddingBottom: 90 },

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

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },

  rowLast:{
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 120,
  },

  label: {
    width: width * 0.45,
    color: '#cfd8ff',
    fontSize: 12,
  },

  input: {
    width: width * 0.45,
    backgroundColor: '#d1d1d1',
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 6,
    color: '#000',
    fontSize: 13,
  },

  disabledInput: {
    backgroundColor: '#eceeef',
    color: '#666',
  },

  switchBox: {
    width: width * 0.45,
    alignItems: 'flex-start',
  },
});