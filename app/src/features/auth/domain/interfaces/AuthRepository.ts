export interface AuthRepository {
  login(email: string, password: string): Promise<LoginResult>;
  refreshToken(token: string): Promise<{ accessToken: string; refreshToken: string }>;
  me(): Promise<MeResult>;
}

export interface LoginResult {
  user: MeResult;
  accessToken: string;
  refreshToken: string;
}

export interface MeResult {
  userID: number;
  name: string;
  email: string;
  avatarURL: string | null;
  roleID: number;
  createdAt: string;
  updatedAt: string;
}
