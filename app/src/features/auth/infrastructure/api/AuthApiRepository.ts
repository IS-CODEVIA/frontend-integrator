import { gqlClient } from "@/app/src/core/api/graphql-client";
import type { AuthRepository, LoginResult, MeResult } from "../../domain/interfaces/AuthRepository";

interface GqlResponse<T> {
  [key: string]: T;
}

export class AuthApiRepository implements AuthRepository {
  async login(email: string, password: string): Promise<LoginResult> {
    const data = await gqlClient().request<GqlResponse<LoginResult>>(
      `mutation ($input: LoginInput!) {
        login(input: $input) {
          user { userID name email avatarURL roleID createdAt updatedAt }
          accessToken
          refreshToken
        }
      }`,
      { input: { email, password } },
    );
    return data.login;
  }

  async refreshToken(token: string): Promise<{ accessToken: string; refreshToken: string }> {
    const data = await gqlClient().request<GqlResponse<{ accessToken: string; refreshToken: string }>>(
      `mutation ($refreshToken: String!) {
        refreshToken(refreshToken: $refreshToken) {
          accessToken
          refreshToken
        }
      }`,
      { refreshToken: token },
    );
    return data.refreshToken;
  }

  async me(): Promise<MeResult> {
    const data = await gqlClient().request<GqlResponse<MeResult>>(
      `query { me { userID name email avatarURL roleID createdAt updatedAt } }`,
    );
    return data.me;
  }
}
