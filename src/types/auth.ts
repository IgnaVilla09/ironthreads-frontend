export type AuthUser = {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
};

export type AuthSession = {
  user: AuthUser;
};
