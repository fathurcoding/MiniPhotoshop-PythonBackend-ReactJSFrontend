import axios from 'axios';

const BASE_URL = 'http://localhost:8000';

export const uploadImage = async (file) => {
  return file;
};

// --- 2. Image Enhancement ---

export const applyBrightness = async (file, value) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('value', value); // Kirim nilai slider brightness ke backend
  const res = await axios.post(`${BASE_URL}/enhancement/brightness`, formData, { responseType: 'blob' });
  return res.data;
};

export const applyContrast = async (file, value) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('value', value); // Kirim nilai slider contrast ke backend
  const res = await axios.post(`${BASE_URL}/enhancement/contrast`, formData, { responseType: 'blob' });
  return res.data;
};

export const applyHistogramEq = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  const res = await axios.post(`${BASE_URL}/enhancement/histogram_eq`, formData, { responseType: 'blob' });
  return res.data;
};

export const applySharpen = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  const res = await axios.post(`${BASE_URL}/enhancement/sharpen`, formData, { responseType: 'blob' });
  return res.data;
};

export const applySmoothing = async (file, kernelSize) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('kernel_size', kernelSize); // Kirim parameter ukuran blur
  const res = await axios.post(`${BASE_URL}/enhancement/smoothing`, formData, { responseType: 'blob' });
  return res.data;
};

export const applyThreshold = async (file, params) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('threshold_value', params.value);
  formData.append('method', params.method || 'manual');
  const res = await axios.post(`${BASE_URL}/enhancement/threshold`, formData, { responseType: 'blob' });
  return res.data;
};

// --- 4. Image Restoration (Filtering) ---

export const applyGaussianBlur = async (file, kernelSize, sigma = 1.0) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('kernel_size', kernelSize);
  formData.append('sigma', sigma);
  const res = await axios.post(`${BASE_URL}/filtering/gaussian`, formData, { responseType: 'blob' });
  return res.data;
};

export const applyMedianFilter = async (file, kernelSize) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('kernel_size', kernelSize);
  const res = await axios.post(`${BASE_URL}/filtering/median`, formData, { responseType: 'blob' });
  return res.data;
};

export const applyNoiseRemoval = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  const res = await axios.post(`${BASE_URL}/filtering/noise_removal`, formData, { responseType: 'blob' });
  return res.data;
};

// --- 5. Edge Processing ---

export const applyEdge = async (file, params) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('method', params.method);
  if (params.threshold1) formData.append('threshold1', params.threshold1);
  if (params.threshold2) formData.append('threshold2', params.threshold2);
  if (params.ksize) formData.append('ksize', params.ksize);
  if (params.sigma) formData.append('sigma', params.sigma);
  const res = await axios.post(`${BASE_URL}/edge/apply`, formData, { responseType: 'blob' });
  return res.data;
};

export const applyErosion = async (file, params) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('kernel_size', params.kernelSize || 3);
  formData.append('shape', params.shape || 'rect');
  formData.append('iterations', params.iterations || 1);
  const res = await axios.post(`${BASE_URL}/morphology/erosion`, formData, { responseType: 'blob' });
  return res.data;
};

export const applyDilation = async (file, params) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('kernel_size', params.kernelSize || 3);
  formData.append('shape', params.shape || 'rect');
  formData.append('iterations', params.iterations || 1);
  const res = await axios.post(`${BASE_URL}/morphology/dilation`, formData, { responseType: 'blob' });
  return res.data;
};

// --- 6. Color Processing & Analysis ---

export const applyGrayscale = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  
  const res = await axios.post(`${BASE_URL}/analysis/grayscale`, formData, { responseType: 'blob' });
  return res.data;
};

export const applyChannelSplit = async (file, channel) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('channel', channel); // 'R', 'G', atau 'B'
  const res = await axios.post(`${BASE_URL}/analysis/channel_split`, formData, { responseType: 'blob' });
  return res.data;
};

export const applyColorAdjustment = async (file, hueShift, saturationScale) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('hue_shift', hueShift);
  formData.append('saturation_scale', saturationScale);
  const res = await axios.post(`${BASE_URL}/analysis/color_adjustment`, formData, { responseType: 'blob' });
  return res.data;
};

export const getHistogram = async (file, mode = "grayscale") => {
  const formData = new FormData();
  formData.append('file', file);
  const res = await axios.post(`${BASE_URL}/analysis/histogram?mode=${mode}`, formData, { responseType: 'blob' });
  return res.data;
};

// --- Geometric Transform ---

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

// --- Compression ---

export const applyCompression = async (file, params) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('method', params.method);
  if (params.quality) {
    formData.append('quality', params.quality);
  }
  
  const res = await axios.post(`${BASE_URL}/compression/apply`, formData, { 
    responseType: 'blob' 
  });
  
  return {
    blob: res.data,
    originalSize: parseInt(res.headers['x-original-size'], 10) || 0,
    compressedSize: parseInt(res.headers['x-compressed-size'], 10) || 0,
    compressionRatio: parseFloat(res.headers['x-compression-ratio']) || 0
  };
};

// --- Segmentation ---

export const applySegmentThreshold = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  const res = await axios.post(`${BASE_URL}/segmentation/threshold`, formData, { responseType: 'blob' });
  return res.data;
};

export const applySegmentEdge = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  const res = await axios.post(`${BASE_URL}/segmentation/edge`, formData, { responseType: 'blob' });
  return res.data;
};

export const applySegmentRegion = async (file, params) => {
  const formData = new FormData();
  formData.append('file', file);
  if (params.k) {
    formData.append('k', params.k);
  }
  const res = await axios.post(`${BASE_URL}/segmentation/region`, formData, { responseType: 'blob' });
  return res.data;
};