export interface User {
  username: string;
  name: string;
  phoneNo: string;
  gender: string;
  email: string;
  password: string;
}

export interface LoginBody {
  email: string;
  password: string;
}
