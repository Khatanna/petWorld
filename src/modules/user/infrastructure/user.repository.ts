import { db } from "@/app/config/firebase";
import {
  equalTo,
  get,
  orderByChild,
  query,
  ref,
  set,
  update,
} from "firebase/database";
import type { User, UserFirebase } from "../domain/user.model";

const mapUserFromFirebase = (key: string, user: UserFirebase): User => {
  return {
    ...user,
    id: key,
  };
};

const toggleOwner = (tenantId: string) => async (userId: string) => {
  const userRef = ref(db, `users/${userId}`);
  const snapshot = await get(userRef);

  if (!snapshot.exists()) {
    throw new Error("User not found");
  }

  const userData: UserFirebase = snapshot.val();

  if (userData.tenantId !== tenantId) {
    throw new Error("Unauthorized");
  }

  await update(userRef, {
    owner: !userData.owner,
  });
};

const toggleAllowed = (tenantId: string) => async (userId: string) => {
  const userRef = ref(db, `users/${userId}`);
  const snapshot = await get(userRef);

  if (!snapshot.exists()) {
    throw new Error("User not found");
  }

  const userData: UserFirebase = snapshot.val();

  if (userData.tenantId !== tenantId) {
    throw new Error("Unauthorized");
  }

  await update(userRef, {
    allowed: !userData.allowed,
  });
};

const asignTenantId = (tenantId: string) => async (userId: string) => {
  const userRef = ref(db, `users/${userId}`);
  await update(userRef, {
    allowed: true,
    tenantId,
  });
};

const getUsers = (tenantId: string) => async () => {
  const root = ref(db, `users`);
  const snapshot = await get(root);

  if (snapshot.exists()) {
    return Object.entries<UserFirebase>(snapshot.val())
      .map(([key, val]) => mapUserFromFirebase(key, val))
      .filter((user) => user.tenantId === tenantId || user.tenantId === "");
  } else {
    return [];
  }
};

const getAvatarUrl = (tenantId: string) => async (userId: string) => {
  const root = ref(db, `users`);
  const userQuery = query(root, orderByChild("email"), equalTo(userId));
  const snapshot = await get(userQuery);

  if (snapshot.exists()) {
    const users = snapshot.val() as Record<string, UserFirebase>;
    const user = Object.entries(users).find(
      ([key, u]) => u.tenantId === tenantId && key === userId,
    )?.[1];

    if (user) {
      return user.photoUrl || "";
    } else {
      throw new Error("User not found or unauthorized");
    }
  } else {
    throw new Error("User not found");
  }
};

export const createUser = async (key: string, user: UserFirebase) => {
  const userRef = ref(db, `users/${key}`);

  await set(userRef, user);
};

export const getUserByEmail = async (email: string) => {
  const root = ref(db, `users`);
  const userQuery = query(root, orderByChild("email"), equalTo(email));
  const snapshot = await get(userQuery);

  if (snapshot.exists()) {
    const users = snapshot.val() as Record<string, UserFirebase>;
    const user = Object.entries(users).find(([_, u]) => u.email === email);

    if (user) {
      return {
        ...user[1],
        uid: user[0],
      };
    } else {
      return null;
    }
  } else {
    return null;
  }
};

export const UserRepository = (tenantId: string) => ({
  getUsers: getUsers(tenantId),
  toggleOwner: toggleOwner(tenantId),
  toggleAllowed: toggleAllowed(tenantId),
  getAvatarUrl: getAvatarUrl(tenantId),
  asignTenantId: asignTenantId(tenantId),
});
