import api from "./api";

export const getTransfers = async () => {
  const response = await api.get("/transfers");
  return response.data;
};

export const createTransfer = async (data) => {
  const response = await api.post("/transfers", data);
  return response.data;
};

export const completeTransfer = async (id) => {
  const response = await api.put(`/transfers/${id}/complete`);
  return response.data;
};

export const getBatchTransfers = async (batchId) => {
  const response = await api.get(`/transfers/batch/${batchId}`);
  return response.data;
};

export const getReceivers = async () => {
  const response = await api.get("/transfers/receivers");
  return response.data;
};
