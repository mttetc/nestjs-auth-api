export interface LoginResponseDto {
  access_token: string;
  user: {
    id: number;
    email: string;
  };
}
