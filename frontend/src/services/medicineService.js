import api from "./api";

export const getMedicines = async () => {
  const response = await api.get("/medicines");
  return response.data;
};

export const createMedicine = async (data) => {
  const response = await api.post("/medicines", data);
  return response.data;
};
