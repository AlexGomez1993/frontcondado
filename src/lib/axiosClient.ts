import axios, { AxiosInstance } from 'axios';

import { authClient } from './auth/client';

const axiosClient: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('custom-auth-token');

    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      console.log('Token no válido o sesión expirada. Realizar logout.');
      alert('Token no válido o sesión expirada. Realizar logout.');
      const userString = localStorage.getItem('user');

      if(userString){
        var user = JSON.parse(userString);
      }
      await authClient.signOut();
      if(user.rol_id==1 || user.rol_id==3){
        window.location.href = '/auth/sign-in';
      }else{
        window.location.href = '/auth/sign-in-client';
      }        
      
    }
    return Promise.reject(error);
  }
);

export default axiosClient;
