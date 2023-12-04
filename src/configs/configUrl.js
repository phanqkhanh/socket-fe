import axios from 'axios';
import { API_URL } from './constant';
// import { tokenServices } from './tokenServices';

let refreshSubscribers = [];
const onAccessTokenFetched = (accessToken) => {
  refreshSubscribers.forEach((callback) => callback(accessToken));
  refreshSubscribers = [];
};

const addSubscriber = (callback) => {
  refreshSubscribers.push(callback);
};

export const axiosInstance = axios.create({
  baseURL: API_URL,
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

let isRefreshing = false;

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
    if (error.response?.status === 401) {
      if (!isRefreshing) {
        isRefreshing = true;
        try {
          const rs = await axiosInstance.post('/auth/refresh-token', {
            refreshToken: localStorage.getItem('refreshToken'),
          });
          const { idToken } = rs.data;
          localStorage.setItem('idToken', idToken);
          onAccessTokenFetched(idToken);
          originalConfig.headers.Authorization = idToken

          return axiosInstance(originalConfig);
        } catch (_error) {
          return Promise.reject(_error);
        } finally {
          isRefreshing = false;
        }
      } else {
        return new Promise((resolve) => {
          addSubscriber((idToken) => {
            originalConfig.headers.Authorization = idToken
            resolve(axiosInstance(originalConfig));
          });
        });
      }
    }
    return Promise.reject(error);
  },
);