import api from "./api";

export const getBatches = async () => {
  const response = await api.get("/batches");
  return response.data;
};

export const createBatch = async (data) => {
  const response = await api.post("/batches", data);
  return response.data;
};

export const verifyBatch = async (id) => {
  const response = await api.get(`/batches/${id}/verify`);
  return response.data;
};

export const getBatchQR = async (id) => {
  const response = await api.get(`/batches/${id}/qr`);
  return response.data;
};

export const recallBatch = async (id) => {
  const response = await api.put(`/batches/${id}/recall`);
  return response.data;
};

export const restoreBatch = async (id) => {
  const response = await api.put(`/batches/${id}/restore`);
  return response.data;
};

export const getMedicinePassport = async (id) => {
  const response = await api.get(`/batches/${id}/passport`);
  return response.data;
};

export const updateLifecycle = async (id, lifecycleState) => {
  const response = await api.put(`/batches/${id}/lifecycle`, { lifecycleState });
  return response.data;
};
