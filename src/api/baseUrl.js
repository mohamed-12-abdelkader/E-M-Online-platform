import axios from "axios";

const baseUrl = axios.create({
  baseURL: "http://localhost:4004/",
});

export default baseUrl;
