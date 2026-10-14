import { storageService } from '@/services/storage.service';

const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

export const tokenService = {
  getAccessToken: () => storageService.get(ACCESS_TOKEN_KEY),
  getRefreshToken: () => storageService.get(REFRESH_TOKEN_KEY),
  setTokens: (accessToken, refreshToken) => {
    storageService.set(ACCESS_TOKEN_KEY, accessToken);
    storageService.set(REFRESH_TOKEN_KEY, refreshToken);
  },
  clearTokens: () => {
    storageService.remove(ACCESS_TOKEN_KEY);
    storageService.remove(REFRESH_TOKEN_KEY);
  },
};
