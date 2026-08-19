import axios from "axios";
import { API_BASE_URL } from "@env";

export const APP_VERSION = "1.0.1";
export const ANDROID_PACKAGE_ID = "app.salarybooks";
export const PLAY_STORE_URL = `https://play.google.com/store/apps/details?id=${ANDROID_PACKAGE_ID}`;
export const PLAY_STORE_MARKET_URL = "https://play.google.com/store/search?q=salarybooks&c=apps&hl=en_IN";

export const normalizeVersion = (value) =>
  String(value || "")
    .trim()
    .replace(/^v/i, "");

export const getServerVersion = (data) => {
  const raw =
    data?.version ??
    data?.app_version ??
    data?.appVersion ??
    data?.data?.version ??
    data?.data?.app_version;
  return normalizeVersion(raw);
};

export const fetchServerAppVersion = async (token) => {
  const url = `${API_BASE_URL}employee/get-app-version`;
  const headers = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers["x-access-token"] = token;
  }

  console.log("backend URL", API_BASE_URL);
  console.log("get-app-version URL", url);
  console.log("get-app-version has token", !!token);

  const res = await axios.post(url, {}, { headers });

  console.log("backend response status", res.status);
  console.log("backend response", JSON.stringify(res.data, null, 2));
  return res.data;
};
