import axios from "axios";

const baseUrl = axios.create({
  baseURL: "https://api.e-monline.online/"
});

export default baseUrl;