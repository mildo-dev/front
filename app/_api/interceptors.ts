import type { AxiosError, InternalAxiosRequestConfig } from 'axios';

import { PATH } from '@/app/_constants/path';
import { ACCESS_TOKEN_KEY, HTTP_STATUS_CODE } from '@/app/_constants/api';
import { HTTPError } from '@/app/_api/HTTPError';

export interface ErrorResponseData {
  statusCode?: number;
  message?: string;
  code?: number;
}

// Axios 요청 전에 토큰을 확인하고 설정하는 인터셉터 함수
export const checkAndSetToken = (config: InternalAxiosRequestConfig) => {
  // useAuth가 false이거나, headers가 없거나, 이미 Authorization 헤더가 있으면 설정 건너뜀
  if (!config.useAuth || !config.headers || config.headers.Authorization) return config;

  // localStorage에서 액세스 토큰 가져옴
  const authStorage = localStorage.getItem(ACCESS_TOKEN_KEY);

  if (!authStorage) {
    window.location.href = PATH.LOGIN;
    throw new Error('Auth storage not found');
  }

  const { state } = JSON.parse(authStorage);
  const accessToken = state?.access_token;

  // 토큰이 없으면 루트 페이지로 리다이렉트하고 에러 발생
  if (!accessToken) {
    window.location.href = PATH.LOGIN;
    throw new Error('토큰이 유효하지 않습니다.');
  }

  // 요청 헤더에 Bearer 토큰 추가
  config.headers.Authorization = `Bearer ${accessToken}`;

  return config;
};

// 토큰 관련 에러를 처리하는 함수
export const handleTokenError = async (error: AxiosError<ErrorResponseData>) => {
  const originalRequest = error.config;

  // 응답이나 원본 요청이 없으면 에러 발생
  if (!error.response || !originalRequest) throw new Error('에러가 발생했습니다.');

  /*
    const { data, status } = error.response;
  
    // 엑세스 토큰이 만료된 경우
    if (status === HTTP_STATUS_CODE.BAD_REQUEST && data.code === ERROR_CODE.EXPIRED_ACCESS_TOKEN) {
      // 새로운 토큰을 요청
      const { accessToken } = await postNewToken();
      // 새 토큰으로 헤더 업데이트
      originalRequest.headers.Authorization = `Bearer ${accessToken}`;
      // localStorage에 새 토큰 저장
      localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  
      // 원래 요청을 새 토큰으로 재시도
      return axiosInstance(originalRequest);
    }
  
    // 다양한 토큰 관련 에러 처리 (무효한 토큰, 만료된 리프레시 토큰 등)
    if (
      status === HTTP_STATUS_CODE.BAD_REQUEST &&
      (data.code === ERROR_CODE.INVALID_ACCESS_TOKEN ||
        data.code === ERROR_CODE.INVALID_REFRESH_TOKEN ||
        data.code === ERROR_CODE.EXPIRED_REFRESH_TOKEN ||
        data.code === ERROR_CODE.INVALID_TOKEN_VALIDATE ||
        data.code === ERROR_CODE.NULL_REFRESH_TOKEN ||
        data.code === ERROR_CODE.UNEXPECTED_TOKEN_ERROR ||
        data.code === ERROR_CODE.UNAUTHORIZED ||
        data.code === ERROR_CODE.INVALID_ACCESS_TOKEN)
    ) {
      // 토큰을 삭제하고 에러 발생
      localStorage.removeItem(ACCESS_TOKEN_KEY);
  
      throw new HTTPError(status, data.message, data.code);
    }
    */

  // 그 외의 에러는 그대로 전파
  throw error;
};

export const handleAPIError = (error: AxiosError<ErrorResponseData>) => {
  if (!error.response) {
    console.error('No response received:', error);
    return Promise.reject(error); // 네트워크 문제는 그대로 반환
  }

  const { status, data } = error.response;

  // 404: 기본 값 반환
  if (status === HTTP_STATUS_CODE.NOT_FOUND) {
    console.warn('404 Not Found:', data.message);
    return { data: null }; // 기본 응답 구조를 반환
  }

  // 500번대 에러
  if (status >= HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR) {
    alert('서버 에러가 발생했습니다. 잠시 후 다시 시도해주세요.');
    throw new HTTPError(status, data.message);
  }

  // 그 외 상태 코드
  throw new HTTPError(status, data.message, data.code);
};
