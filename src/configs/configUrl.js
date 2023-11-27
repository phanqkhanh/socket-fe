import axios from 'axios';
// import { tokenServices } from './tokenServices';

export const axiosInstance = axios.create({
  baseURL: 'http://localhost:8080',
  headers: {
    'x-api-key': 'V3D0uyF6n15yV2emTmNPF57T545ksjZr5e55ng5f',
  },
});

axiosInstance.interceptors.request.use(
  function (config) {
    // Do something before request is sent
    const idToken = localStorage.getItem('idToken');
    if (idToken) {
      config.headers['Authorization'] = idToken;
    }
    return config;
  },
  function (error) {
    // Do something with request error
    return Promise.reject(error);
  },
);

// Add a response interceptor
axiosInstance.interceptors.response.use(
  function (response) {
    // Any status code that lie within the range of 2xx cause this function to trigger
    // Do something with response data
    return response;
  },
  async function (error) {
    const originalConfig = error.config;
    // Any status codes that falls outside the range of 2xx cause this function to trigger
    // Do something with response error

    // refresh token
    if (error.response.status === 401 && !originalConfig._retry) {
      originalConfig._retry = true;

      try {
        const rs = await axiosInstance.post('/user/refresh-token', {
          refreshToken: tokenServices.getLocalRefreshToken(),
        });

        const { idToken } = rs.data;
        tokenServices.updateLocalAccessToken(idToken);

        return axiosInstance(originalConfig);
      } catch (_error) {
        return Promise.reject(_error);
      }
    }
    return Promise.reject(error);
  },
);
export const tokenServices = {
  getLocalAccessToken: () => {
    let idToken = localStorage.getItem('idToken');
    if (idToken) {
      return JSON.parse(idToken);
    }
  },
  getLocalRefreshToken: () => {
    let refreshToken = localStorage.getItem('refreshToken');
    if (refreshToken) {
      return JSON.parse(refreshToken);
    }
  },
  updateLocalAccessToken: (token) => {
    let idToken = localStorage.getItem('idToken');
    if (idToken) {
      idToken = JSON.parse(idToken);
      idToken = token;
    }
    localStorage.setItem('idToken', JSON.stringify(idToken));
  },
};