import axios from "axios";

const rawBaseUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const baseURL = rawBaseUrl.endsWith("/api")
  ? rawBaseUrl
  : rawBaseUrl.replace(/\/+$/, "") + "/api";

export default axios.create({
  baseURL,
});