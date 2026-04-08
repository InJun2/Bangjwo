import axios, {
  AxiosResponse,
  AxiosError,
  InternalAxiosRequestConfig,
} from "axios";
import { StatusCodes } from "../constants/statusCodes";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000, //최대 대기 시간(10초)
  withCredentials: true, //쿠키를 포함한 요청을 보낼지 여부
});

// 요청시 Bearer 헤더 추가
const requestHandler = (config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem("accessToken");
  const isHeaderSettable =
    config.headers && typeof config.headers.set === "function";

  if (token && isHeaderSettable) {
    config.headers.set("Authorization", `Bearer ${token}`);
  }

  return config;
};

const requestErrorHandler = (error: any) => {
  return Promise.reject(error);
};

const responseHandler = (res: AxiosResponse) => {
  return res;
};

let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

const onRefreshed = (token: string) => {
  refreshSubscribers.forEach((callback) => callback(token));
  refreshSubscribers = [];
};

const addRefreshSubscriber = (callback: (token: string) => void) => {
  refreshSubscribers.push(callback);
};




const responseErrorHandler = async (err: AxiosError) => {
  const originalRequest = err.config as InternalAxiosRequestConfig & { _retry?: boolean };

  if (err.response) {
    if (err.response.status === StatusCodes.UNAUTHORIZED && originalRequest && !originalRequest._retry) {
      
      if (originalRequest.url === "/api/v1/reissue") {
        window.dispatchEvent(new CustomEvent("tokenExpired"));
        return Promise.reject(err);
      }

      if (isRefreshing) {
        return new Promise((resolve) => {
          addRefreshSubscriber((token: string) => {
            originalRequest.headers.set("Authorization", `Bearer ${token}`);
            resolve(axiosInstance(originalRequest));
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const res = await axiosInstance.post("/api/v1/reissue");
        const newAccessToken = res.data.accessToken;

        localStorage.setItem("accessToken", newAccessToken);

        onRefreshed(newAccessToken);

        originalRequest.headers.set("Authorization", `Bearer ${newAccessToken}`);
        return axiosInstance(originalRequest);
        
      } catch (refreshError) {
        window.dispatchEvent(new CustomEvent("tokenExpired"));
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    if (err.response.status === StatusCodes.NOT_FOUND) {
      console.error("에러: Not Found");
    } else if (err.response.status !== StatusCodes.UNAUTHORIZED) {
      console.error("기타 에러: ", err.response.status);
    }
  } else if (err.request) {
    console.error("서버로부터 응답을 받지 못하였습니다.", err.request);
  } else {
    console.error("요청 설정 중 오류가 발생했습니다.", err.message);
  }
  return Promise.reject(err);
};

axiosInstance.interceptors.request.use(requestHandler, requestErrorHandler);
axiosInstance.interceptors.response.use(responseHandler, responseErrorHandler);

export default axiosInstance;
