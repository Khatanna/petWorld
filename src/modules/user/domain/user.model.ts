export type User = {
  allowed: boolean;
  email: string;
  id: string;
  name: string;
  owner: boolean;
  photoUrl: string;
  tenantId: string;
};

export type UserFirebase = {
  name: string;
  email: string;
  photoUrl: string;
  owner: boolean;
  allowed: boolean;
  tenantId: string;
};
