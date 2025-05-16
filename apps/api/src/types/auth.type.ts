export interface RegisterRequestBody {
  username: string;
  password: string;
}

export interface LoginRequestBody extends RegisterRequestBody {}
