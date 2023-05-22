export interface UserLoginResponse {
  user: {
    email: string;
    token: string;
    username: string;
    bio: string;
    image: string | null;
  };
}

export interface UserProfileResponse {
  profile?: {
    username?: string;
    bio?: string | null;
    image?: string | null;
    following?: boolean;
  } | null;
}
