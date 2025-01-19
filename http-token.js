import axios from "axios";

const baseURL =
  import.meta.env.MODE === "development"
    ? import.meta.env.VITE_API_URL_LOCAL // URL local para desenvolvimento
    : import.meta.env.VITE_API_URL;

export default axios.create({
  baseURL: baseURL,
  headers: {
    "Content-type": "application/json",
    "X-AGENDA": import.meta.env.VITE_X_AGENDA
  }
});
