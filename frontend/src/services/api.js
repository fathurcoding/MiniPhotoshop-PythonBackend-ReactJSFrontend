import axios from 'axios';

const BASE_URL = 'http://localhost:8000';

export const uploadImage = async (file) => {
  return file;
};

// --- Enhancement & Edge ---

export const applyBrightness = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  const res = await axios.post(`${BASE_URL}/enhancement/brightness`, formData, { responseType: 'blob' });
  return res.data;
};

export const applyGrayscale = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  const res = await axios.post(`${BASE_URL}/enhancement/grayscale`, formData, { responseType: 'blob' });
  return res.data;
};

export const applySobel = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  const res = await axios.post(`${BASE_URL}/edge/sobel`, formData, { responseType: 'blob' });
  return res.data;
};

// --- Transform ---

export const applyResize = async (file, params) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('width', params.width);
  formData.append('height', params.height);
  formData.append('tx', params.tx || 0);
  formData.append('ty', params.ty || 0);
  const res = await axios.post(`${BASE_URL}/transform/resize`, formData, { responseType: 'blob' });
  return {
    blob: res.data,
    shiftX: Number(res.headers['x-shift-x']) || 0,
    shiftY: Number(res.headers['x-shift-y']) || 0
  };
};

export const applyRotate = async (file, params) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('degree', params.degree);
  const res = await axios.post(`${BASE_URL}/transform/rotate`, formData, { responseType: 'blob' });
  return {
    blob: res.data,
    shiftX: Number(res.headers['x-shift-x']) || 0,
    shiftY: Number(res.headers['x-shift-y']) || 0
  };
};

export const applyFlip = async (file, params) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('direction', params.dir); // 'h' or 'v'
  const res = await axios.post(`${BASE_URL}/transform/flip`, formData, { responseType: 'blob' });
  return res.data;
};

export const applyCrop = async (file, params) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('startX', params.startX);
  formData.append('startY', params.startY);
  formData.append('endX', params.endX);
  formData.append('endY', params.endY);
  const res = await axios.post(`${BASE_URL}/transform/crop`, formData, { responseType: 'blob' });
  return {
    blob: res.data,
    shiftX: Number(res.headers['x-shift-x']) || 0,
    shiftY: Number(res.headers['x-shift-y']) || 0
  };
};

export const applyTranslate = async (file, params) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('tx', params.tx);
  formData.append('ty', params.ty);
  const res = await axios.post(`${BASE_URL}/transform/translate`, formData, { responseType: 'blob' });
  return {
    blob: res.data,
    shiftX: Number(res.headers['x-shift-x']) || 0,
    shiftY: Number(res.headers['x-shift-y']) || 0
  };
};

// --- Analysis ---

export const getHistogram = async (file, mode = "grayscale") => {
  const formData = new FormData();
  formData.append('file', file);
  const res = await axios.post(`${BASE_URL}/analysis/histogram?mode=${mode}`, formData);
  return res.data;
};
