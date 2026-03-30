import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  SafeAreaView,
  Linking,
  Modal,
  TextInput,
  Image,
  ActivityIndicator,
  TouchableWithoutFeedback,
  Alert
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LinearGradient from "react-native-linear-gradient";
import Navbar from '../Dashboardscreen/navbar';
import BottomNavigation from '../BottomNavigation';
import { useRoute } from "@react-navigation/native";
import { NativeModules } from "react-native";
// import RNFetchBlob from "rn-fetch-blob";
import ReactNativeBlobUtil from 'react-native-blob-util';
const { PdfPicker } = NativeModules;
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import Pdf from "react-native-pdf";
import axios from "axios";
import RNFS from "react-native-fs";
import { API_BASE_URL } from "@env";
const { width } = Dimensions.get("window");
import StatusPopup from "../StatusPopup/StatusPopup";
// import pdf_icon from '../../assets/pdf_icon'
import GlobalFont from '../../theme/GlobalFont';
const DocumentVaultScreen = () => {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState("Personal");
  const navigation = useNavigation();
  const [popupConfig, setPopupConfig] = useState({ visible: false, type: "success", title: "", message: "", });
  const MAX_SINGLE_FILE_KB = 200;
  const [uploadedFiles, setUploadedFiles] = useState({
    documents: [],
    other_documents: []
  });
  const [menuIndex, setMenuIndex] = useState(null);
  const [file, setFile] = useState(null);
  const [employeeVault, setEmployeeVault] = useState(0);
  const [alreadyUploadedSize, setAlreadyUploadedSize] = useState(0);
  const [renameModalVisible, setRenameModalVisible] = useState(false);
  const [renameText, setRenameText] = useState("");
  const [renameIndex, setRenameIndex] = useState(null);

  const [modalVisible, setModalVisible] = useState(false);
  const [token, setToken] = useState(null);
  const [userData, setuserData] = useState(null);

  const [selectedFile, setSelectedFile] = useState(null);
  const [isPDF, setIsPDF] = useState(false);

  const [uploading, setUploading] = useState(false);
  const [rights, setRights] = useState(false);

  useEffect(() => {
    const loadToken = async () => {
      try {
        const token = await AsyncStorage.getItem("authToken");
        const stored = await AsyncStorage.getItem("userData");
        const employee_vault = JSON.parse(await AsyncStorage.getItem("employee_vault"));
        const total_file_size = JSON.parse(await AsyncStorage.getItem("total_file_size"));
        // console.log("TOKEN LOADED:", token);

        if (stored) {
          const parsedUser = JSON.parse(stored);

          setToken(token);
          setuserData(parsedUser);
          setRights(JSON.parse(await AsyncStorage.getItem("rights")))
          fetchUploadedDocs(parsedUser._id, token);
          setEmployeeVault(employee_vault || 0);
          setAlreadyUploadedSize(total_file_size || 0);
        }
      } catch (error) {
        console.log("ERROR reading storage:", error);
      }
    };

    loadToken();
  }, []);
  // console.log(uploadedFiles, "uploadedFiles");

  const showPopup = (type, title, message) => {
    setPopupConfig({
      visible: true,
      type,
      title,
      message,
    });
  };
  const getRemainingSizeKB = () => {
    const selectedSizeKB = file?.size ? file.size / 1024 : 0;

    const remaining =
      employeeVault - (alreadyUploadedSize + selectedSizeKB);

    return remaining > 0 ? remaining : 0;
  };
  const pickDocument = async () => {
    try {
      const file = await PdfPicker.pickFile();
      if (!file) return;

      const fileSizeKB = file.size / 1024;
      const remainingSizeKB = getRemainingSizeKB();
      // console.log(remainingSizeKB,"remainingSizeKB");
      
      if (fileSizeKB > MAX_SINGLE_FILE_KB) {
        Alert.alert(
          "File Too Large",
          `File must be less than ${MAX_SINGLE_FILE_KB} KB`
        );
        return;
      }
  
      if (fileSizeKB > remainingSizeKB) {
        Alert.alert(
          "Storage Limit Exceeded",
          `Only ${remainingSizeKB.toFixed(2)} KB remaining`
        );
        return;
      }
      const currentList = uploadedFiles.other_documents || [];
      const extractedName = `Document_${currentList.length + 1}`;

      const fileObj = {
        name: extractedName,
        uri: file.uri,
        type: file.type,
        size: file.size,
      };
      setFile(fileObj);
      setUploadedFiles(prev => ({
        ...prev,
        other_documents: [...(prev.other_documents || []), fileObj]
      }));

      if (token) {
        uploadFileToServer(fileObj, "Others");
      } else {
        console.log("TOKEN NOT READY!");
      }

    } catch (error) {
      console.log("File picking cancelled or failed", error);
    }
  };


  // const pickDocument = async (field) => {
  //   try {
  //     const file = await PdfPicker.pickFile();

  //     const key = field === "Personal" ? "documents" : "other_documents";
  //     const currentList = uploadedFiles[key] || [];

  //     const newCustomName = `Document ${currentList.length + 1}`;
  //     console.log(newCustomName,"newCustomName");

  //     const fileObj = {
  //       shownName: newCustomName,
  //       uri: file.uri,
  //       type: file.type,
  //       size: file.size,
  //     };
  //     console.log(fileObj,"fileObj");
  //     setUploadedFiles(prev => ({
  //       ...prev,
  //       [key]: [...currentList, fileObj]
  //     }));


  //     if (token) {
  //       uploadFileToServer(
  //         {
  //           ...fileObj,
  //           name: newCustomName.replace(/\s+/g, "_") + ".pdf"
  //         },
  //         field
  //       );
  //     }

  //   } catch (error) {
  //     console.log("File picking cancelled or failed", error);
  //   }
  // };




  const uploadFileToServer = async (file, field) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("employee_id", userData._id);
      formData.append('emp_id', userData.emp_id);
      formData.append('corporate_id', userData?.corporate_id);

      // Fix: use the correct field key your API expects
      formData.append("other_documents", {
        uri: file.uri,
        name: file.name,
        type: file.type || "application/octet-stream",
      });

      // console.log(formData, "formData");

      const response = await axios.post(
        `${API_BASE_URL}employee/upload-employee-documents`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            "x-access-token": token,
          },
        }
      );

      // console.log("Upload Result:", response.data); 

      if (response.data.status) {
        fetchUploadedDocs(userData._id, token);
      } else {
        showPopup("error", "Error", response.data.message || "Upload Failed");
      }
    } catch (err) {
      console.log("UPLOAD ERROR:", err.response?.data || err.message || err); // don't silence errors!
      showPopup("error", "Error", "Upload Failed");
    } finally {
      setUploading(false);
    }
  };

  const fetchUploadedDocs = async (employeeId, token) => {
    // console.log(employeeId, "employeeId", token, "token");

    try {
      const response = await axios.post(
        `${API_BASE_URL}employee/get-employee-documents`,
        { employee_id: employeeId },
        { headers: { "x-access-token": token } }
      );

      console.log("Fetched Docs:", response.data);

      if (response.data.success) {

        const othersObj = response.data.documents.other_documents || {};

        const othersArray = Object.values(othersObj);
        // console.log(othersArray,"othersArray")
        setUploadedFiles({
          documents: response.data.documents || [],
          other_documents: othersArray,
        });
        // console.log(uploadedFiles,"uploadedFiles");
        
      }
    } catch (error) {
      console.log("Fetch Docs Error:", error.response?.data || error);
    }
  };


  const buildFileUri = (filePath) => {
    return `${API_BASE_URL}${filePath.replace(/\\/g, "/")}`;
  };
  const getMimeType = (uri) => {
    if (!uri) return "application/octet-stream";

    const ext = uri.split(".").pop().toLowerCase();

    switch (ext) {
      case "pdf":
        return "application/pdf";

      case "png":
        return "image/png";

      case "jpg":
      case "jpeg":
        return "image/jpeg";

      case "txt":
        return "text/plain";

      case "doc":
        return "application/msword";

      case "docx":
        return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

      case "xls":
        return "application/vnd.ms-excel";

      case "xlsx":
        return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

      case "ppt":
        return "application/vnd.ms-powerpoint";

      case "pptx":
        return "application/vnd.openxmlformats-officedocument.presentationml.presentation";

      case "csv":
        return "text/csv";

      case "zip":
        return "application/zip";

      case "rar":
        return "application/vnd.rar";

      default:
        return "application/octet-stream";
    }
  };

  // const getMimeType = (uri) => {
  //   const ext = uri.split(".").pop().toLowerCase();
  //   switch (ext) {
  //     case "pdf": return "application/pdf";
  //     case "png": return "image/png";
  //     case "jpg":
  //     case "jpeg":
  //       return "image/jpeg";
  //     case "doc":
  //       return "application/msword";

  //     case "docx":
  //       return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
  //     default:
  //       return "application/octet-stream";
  //   }
  // };




  // const downloadFile = async (remoteFileUrl, fileName) => {
  //   try {
  //     remoteFileUrl = buildFileUri(remoteFileUrl);
  //     const fileUrl = remoteFileUrl.replace(/\\/g, "/");

  //     const downloadDir = ReactNativeBlobUtil.fs.dirs.DownloadDir;
  //     const localPath = `${downloadDir}/${fileName || ("doc_" + Date.now())}`;

  //     console.log("Downloading to:", localPath);

  //     const res = await ReactNativeBlobUtil.config({
  //       addAndroidDownloads: {
  //         useDownloadManager: true,
  //         notification: true,
  //         path: localPath,
  //         title: "Downloading Document",
  //         mime: getMimeType(fileUrl),
  //       },
  //     }).fetch("GET", fileUrl);

  //     console.log("Downloaded File Path:", res.path());
  //     // alert("Download Completed!");
  //   } catch (e) {
  //     console.log("Download error:", e);
  //     alert("Download Failed");
  //   }
  // };

  const downloadFile = async (remoteFileUrl, fileName) => {
    try {
      remoteFileUrl = buildFileUri(remoteFileUrl);
      const fileUrl = remoteFileUrl.replace(/\\/g, "/");

      const downloadDir = ReactNativeBlobUtil.fs.dirs.DownloadDir;

      let safeName = fileName;

      if (!safeName || !safeName.includes(".")) {

        const matchExt = fileUrl.split(".").pop();

        if (matchExt && matchExt.length <= 4) {
          safeName = (fileName || ("doc_" + Date.now())) + "." + matchExt;
        } else {
          safeName = (fileName || ("doc_" + Date.now())) + ".pdf";
        }
      }

      const localPath = `${downloadDir}/${safeName}`;

      // console.log("Downloading to:", localPath);

      const res = await ReactNativeBlobUtil.config({
        addAndroidDownloads: {
          useDownloadManager: true,
          notification: true,
          path: localPath,
          title: "Downloading Document",
          mime: getMimeType(localPath),
        },
      }).fetch("GET", fileUrl);

      // console.log("Downloaded File Path:", res.path());
    } catch (e) {
      // console.log("Download error:", e);
      showPopup("error", "Error", "Download Failed");
      // alert("Download Failed");
    }
  };

  const renameFile = async () => {
    // if (!renameText.trim()) return;
    console.log(renameText,"renameText");
    
    try {
      const selectedArray = activeTab === "Personal" ? "documents" : "other_documents";
      const doc = uploadedFiles[selectedArray][renameIndex];

      const document_id = doc._id || doc.id;
      console.log(document_id,"document_id");
      if (!document_id) {
        showPopup("error", "Error", "Unable to rename: document id missing.");
        // alert("Unable to rename: document id missing.");
        setRenameModalVisible(false);
        return;
      }

      const response = await axios.post(
        `${API_BASE_URL}employee/rename-employee-document`,
        {
          employee_id: userData._id,
          document_id: document_id,
          new_name: renameText,
          field: activeTab === "Personal" ? "Personal" : "Others"
        },
        {
          headers: { "x-access-token": token }
        }
      );

      if (response.data.success) {
        setUploadedFiles(prev => {
          const updated = { ...prev };
          const arrCopy = [...(updated[selectedArray] || [])];
          arrCopy[renameIndex] = { ...arrCopy[renameIndex], file_name: renameText };
          updated[selectedArray] = arrCopy;
          return updated;
        });

        // alert("Renamed Successfully!");
      } else {
        showPopup("error", "Error", response.data.message || "Rename Failed");
        // alert(response.data.message || "Rename Failed");
      }
    } catch (error) {
      // console.log("Rename Error:", error.response?.data || error);
      showPopup("error", "Error", "Rename Failed");
      // alert("Rename Failed");
    }

    setRenameModalVisible(false);
  };



  const deleteDocument = async (docId, index, field) => {
    console.log(docId, "docId", userData._id, "userData._id");

    try {
      const response = await axios.post(
        `${API_BASE_URL}employee/delete-employee-document`,
        {
          employee_id: userData._id,
          document_id: docId,
          field: field
        },
        {
          headers: {
            "x-access-token": token
          }
        }
      );

      // console.log("Delete Response:", response.data);

      if (response.data.success) {
        // alert("Deleted Successfully!");

        setUploadedFiles(prev => {
          if (activeTab === "Personal") {
            return {
              ...prev,
              documents: prev.documents.filter((_, i) => i !== index)
            };
          } else {
            return {
              ...prev,
              other_documents: prev.other_documents.filter((_, i) => i !== index)
            };
          }
        });
      } else {
        showPopup("error", "Error", "Delete Failed");
        // alert("Delete Failed");
      }

    } catch (error) {
      console.log("Delete Error:", error.response?.data || error);
    }
  };



  const route = useRoute();
  const screenTitle = route.params?.title;


  return (
    
  <View style={{ flex: 1 }}>
    <LinearGradient
      colors={["#000000ff", "#1c68beff"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ flex: 1 }}
    >
      <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>

        <View style={styles.header}>
          <Image
            source={require("../../assets/document_vault.png")}
            style={styles.header_iconImage}
          />
          <Navbar title={screenTitle} />
        </View>

        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === "Personal" && styles.activeTab]}
            onPress={() => setActiveTab("Personal")}
          >
            <Text
              style={[GlobalFont.CustomFont,
              activeTab === "Personal"
                ? styles.activeTabText
                : styles.inactiveTabText
              ]}
            >
              Official
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === "Others" && styles.activeTab]}
            onPress={() => setActiveTab("Others")}
          >
            <Text
              style={[GlobalFont.CustomFont,
              activeTab === "Others"
                ? styles.activeTabText
                : styles.inactiveTabText
              ]}
            >
              Others
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.fileScroll}
          contentContainerStyle={styles.fileScrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="always"
        >
          {activeTab === "Personal" &&
            uploadedFiles?.documents?.files &&
            Object.values(uploadedFiles.documents.files).length > 0 && (
              <View style={styles.card}>
                {Object.values(uploadedFiles.documents.files).map((file, index) => (
                  <View
                    key={index}
                    style={[
                      styles.card_inner,
                      menuIndex === index && { zIndex: 9999, elevation: 9999 }  
                    ]}
                  >
                    <TouchableOpacity
                      activeOpacity={0.8}
                      onPress={() => {
                        if (menuIndex === index) return;
                        const uri = buildFileUri(file.file_path);
                        setSelectedFile({ ...file, uri });
                        setIsPDF(file.file_type === "application/pdf");
                        setModalVisible(true);
                      }}
                      style={styles.cardLeft}
                    >
                      <Image
                        source={require("../../assets/pdf_icon.png")}
                        style={styles.iconImage}
                      />
                      <Text style={[GlobalFont.CustomFont, styles.cardTitle]}>
                        {file.file_name || file.folder_name}
                      </Text>
                    </TouchableOpacity>

                    <View style={styles.menuWrapper}>
                      <TouchableOpacity
                        onPress={() => setMenuIndex(menuIndex === index ? null : index)}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        style={styles.menuButton}
                      >
                        <Text style={styles.menuDots}>⋮</Text>
                      </TouchableOpacity>

                      {menuIndex === index && (
                        <View style={styles.dropdown}>
                          <TouchableOpacity
                            style={styles.dropdownItem}
                            activeOpacity={0.7}
                            onPress={() => {
                              downloadFile(file.file_path, file.file_name);
                              setMenuIndex(null);
                            }}
                          >
                            <Image
                              source={require("../../assets/DownloadVault.png")}
                              style={styles.downloadIcon}
                            />
                            <Text style={[GlobalFont.CustomFont, styles.dropdownText]}>
                              Download
                            </Text>
                          </TouchableOpacity>

                          {/* <TouchableOpacity
                            style={styles.dropdownItem}
                            activeOpacity={0.7}
                            onPress={() => {
                              setRenameIndex(index);
                              setRenameText(file.file_name);
                              setRenameModalVisible(true);
                              setMenuIndex(null);
                            }}
                          >
                            <Image
                              source={require("../../assets/RenameVault.png")}
                              style={styles.downloadIcon}
                            />
                            <Text style={[GlobalFont.CustomFont, styles.dropdownText]}>
                              Rename
                            </Text>
                          </TouchableOpacity>

                          <TouchableOpacity
                            style={styles.dropdownItem}
                            activeOpacity={0.7}
                            onPress={() => {
                              deleteDocument(file._id || file.id, index, "Personal");
                              setMenuIndex(null);
                            }}
                          >
                            <Image
                              source={require("../../assets/DeleteVault.png")}
                              style={styles.downloadIcon}
                            />
                            <Text style={[GlobalFont.CustomFont, styles.dropdownText]}>
                              Delete
                            </Text>
                          </TouchableOpacity> */}
                        </View>
                      )}
                    </View>
                  </View>
                ))}
              </View>
            )}

          {activeTab === "Others" && (
            <>
              <View style={styles.titleRow}>
                <Text style={[GlobalFont.bold, styles.sectionTitle]}>
                  Uploaded PDFs
                </Text>

                <TouchableOpacity
                  style={styles.uploadBtn}
                  onPress={() => pickDocument()}
                >
                  <Text style={[GlobalFont.CustomFont, styles.uploadText]}>
                    Upload File
                  </Text>
                </TouchableOpacity>
              </View>

              {uploading && (
                <View style={styles.loaderOverlay}>
                  <ActivityIndicator size="large" color="#fff" />
                  <Text style={[GlobalFont.CustomFont, { color: "white", marginTop: 5 }]}>
                    Uploading...
                  </Text>
                </View>
              )}

                {uploadedFiles?.other_documents?.length > 0 && (
                  <View style={styles.card}>
                    {uploadedFiles.other_documents.map((file, index) => (
                      <View
                        key={index}
                        style={[
                          styles.card_inner,
                          menuIndex === index && { zIndex: 9999, elevation: 9999 }
                        ]}
                      >
                       <TouchableOpacity
                      activeOpacity={0.8}
                        onPress={() => {
                          if (menuIndex === index) return;   
                          const uri = buildFileUri(file.file_path);
                          setSelectedFile({ ...file, uri });
                          setIsPDF(file.file_type === "application/pdf");
                          setModalVisible(true);
                        }}
                      style={styles.cardLeft}
                    >
                        <Image
                          source={require("../../assets/pdf_others.png")}
                          style={styles.iconImage_others}
                        />
                        <Text style={[GlobalFont.CustomFont, styles.cardTitle]}>{file.file_name}</Text>
                      </TouchableOpacity>
                      
                      <View style={styles.menuWrapper}>
                        <TouchableOpacity
                          onPress={() => setMenuIndex(menuIndex === index ? null : index)}
                          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                          style={styles.menuButton}
                        >
                          <Text style={styles.menuDots}>⋮</Text>
                        </TouchableOpacity>

                          {menuIndex === index && (
                            <TouchableWithoutFeedback>
                              <View style={styles.dropdown}>

                                <TouchableOpacity
                                  style={styles.dropdownItem}
                                  onPress={() => {
                                    downloadFile(file.file_path, file.file_name);
                                    setMenuIndex(null);
                                  }}
                                >
                                  <Image source={require("../../assets/DownloadVault.png")} style={styles.downloadIcon} />
                                  <Text style={styles.dropdownText}>Download</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                  style={styles.dropdownItem}
                                  onPress={() => {
                                    setRenameIndex(index);
                                    setRenameText(file.file_name);
                                    setRenameModalVisible(true);
                                    setMenuIndex(null);
                                  }}
                                >
                                  <Image source={require("../../assets/RenameVault.png")} style={styles.downloadIcon} />
                                  <Text style={styles.dropdownText}>Rename</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                  style={styles.dropdownItem}
                                  onPress={() => {
                                    deleteDocument(file._id, index, "Others");
                                    setMenuIndex(null);
                                  }}
                                >
                                  <Image source={require("../../assets/DeleteVault.png")} style={styles.downloadIcon} />
                                  <Text style={styles.dropdownText}>Delete</Text>
                                </TouchableOpacity>

                              </View>
                            </TouchableWithoutFeedback>
                          )}
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </>
          )}
          <View style={{ height: 140 }} />
        </ScrollView>

        <Modal
          visible={modalVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.overlay}>
            <LinearGradient colors={["#00213F", "#002C56"]} style={styles.modalContainer}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{selectedFile?.file_name}</Text>
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                  <Text style={styles.closeBtn}>✖</Text>
                </TouchableOpacity>
              </View>

              <View style={{ height: 450, marginTop: 10 }}>
                {!selectedFile ? (
                  <Text style={[GlobalFont.CustomFont, { color: "#fff" }]}>No File Available</Text>
                ) : isPDF ? (
                  <Pdf
                    source={{ uri: selectedFile.uri }}
                    trustAllCerts={false}
                    style={{ width: "100%", height: "100%", borderRadius: 12 }}
                    onError={err => console.log("PDF Error:", err)}
                  />
                ) : (
                  <Image
                    source={{ uri: selectedFile.uri }}
                    style={{ width: "100%", height: "100%", resizeMode: "contain" }}
                  />
                )}
              </View>
            </LinearGradient>
          </View>
        </Modal>

        <Modal transparent={true} visible={renameModalVisible} animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalBox}>
              <Text style={[GlobalFont.CustomFont, styles.modalTitle]}>Rename File</Text>

              <TextInput
                value={renameText}
                onChangeText={setRenameText}
                style={styles.input}
                placeholder="Enter new name"
                placeholderTextColor="#ccc"
              />

              <View style={styles.modalBtns}>
                <TouchableOpacity style={styles.cancelBtn} onPress={() => setRenameModalVisible(false)}>
                  <Text style={[GlobalFont.CustomFont, styles.cancelText]}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.saveBtn} onPress={renameFile}>
                  <Text style={[GlobalFont.CustomFont, styles.saveText]}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        <StatusPopup
          visible={popupConfig.visible}
          type={popupConfig.type}
          title={popupConfig.title}
          message={popupConfig.message}
          onClose={() =>
            setPopupConfig(prev => ({ ...prev, visible: false }))
          }
        />
      </SafeAreaView>
      <BottomNavigation rights={rights} />
    </LinearGradient>
  </View>
);

};

export default DocumentVaultScreen;

const styles = StyleSheet.create({
  gradient: { flex: 1 },

  container: {
    flex: 1,
    paddingHorizontal: 13,
  },

  header: {
    flexDirection: "row",
    width: "100%",
    marginBottom: 12,
    alignItems: "center",
    gap: 5,
  },

  header_iconImage: {
    width: 35,
    height: 20,
    marginLeft: -5,
  },

  loaderOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    // backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 100,
  },


  tabContainer: {
    flexDirection: "row",
    marginTop: 12,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 15,
    padding: 4,
    width: "100%",
  },

  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: "center",
  },

  activeTab: {
    backgroundColor: "#0D213A",
  },

  activeTabText: {
    color: "#fff",
    fontWeight: "500",
  },

  inactiveTabText: {
    color: "#bbb",
  },


  titleRow: {
    marginTop: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  sectionTitle: {
    color: "#fff",
    fontSize: 15,
  },

  uploadBtn: {
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },

  uploadText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
  },


  fileScroll: {
    flex: 1,
    marginTop: 8,
  },

  fileScrollContent: {
    paddingBottom: 40,
  },


  card: {
  alignItems: "center",
  backgroundColor: "#1E3A5F",
  paddingVertical: 8,
  paddingHorizontal: 14,
  borderRadius: 12,
  marginTop: 12,
  borderWidth: 1,
  borderColor: "rgba(255,255,255,0.1)",
  rowGap: 10,

  overflow: "visible",   // ✅ VERY IMPORTANT FIX
},

  card_inner: {
  backgroundColor: "#2A4D73",
  flexDirection: "row",
  justifyContent: "space-between",
  padding: 6,
  alignItems: "center",
  borderRadius: 8,
  height: 50,
  width: width * 0.87,

  overflow: "visible",   // ✅ IMPORTANT
  zIndex: 1,
},
  cardLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },

  iconImage: {
    width: 35,
    height: 20,
    marginLeft: 5,
  },

  iconImage_others: {
    width: 35,
    height: 20,
    marginLeft: 5,
  },

  cardTitle: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
    flexShrink: 1,
    marginLeft: 10,
  },


  menuWrapper: {
    position: "relative",
    zIndex: 9999, 
    elevation: 9999,
  },

  menuButton: {
    padding: 8,
  },

  menuDots: {
    color: "#fff",
    fontSize: 22,
  },


  dropdown: {
  position: "absolute",
  top: 40,
  right: 0,
  backgroundColor: "#2c2c3e",
  borderRadius: 8,
  width: 140,

  zIndex: 99999,     // ✅ MAX
  elevation: 99999,  // ✅ ANDROID FIX

  overflow: "visible",
},
  dropdownItem: {
    flexDirection: "row",
    paddingVertical: 12,
    paddingHorizontal: 12,
    gap: 10,
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.1)",
  },

  dropdownText: {
    color: "#fff",
    fontSize: 14,
  },

  downloadIcon: {
    width: 18,
    height: 18,
    resizeMode: "contain",
  },


  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },

  modalContainer: {
    width: "92%",
    borderRadius: 20,
    padding: 16,
    maxHeight: "85%",
  },

  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#fff",
    paddingBottom: 8,
  },

  modalTitle: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
    flex: 1,
  },

  closeBtn: {
    color: "red",
    fontSize: 20,
    fontWeight: "bold",
    marginLeft: 10,
  },


  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.6)",
  },

  modalBox: {
    width: "85%",
    backgroundColor: "#1c1c2b",
    padding: 20,
    borderRadius: 12,
  },

  modalBtns: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
  },

  cancelBtn: {
    backgroundColor: "#ca4f4f",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 6,
  },

  saveBtn: {
    backgroundColor: "#1c68be",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 6,
  },

  saveText: {
    color: "#fff",
    fontWeight: "600",
  },

  cancelText: {
    color: "#fff",
    fontSize: 15,
  },

  input: {
    backgroundColor: "#303045",
    color: "#fff",
    padding: 10,
    borderRadius: 8,
    marginBottom: 15,
  },
});