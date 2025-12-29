import { db } from "@/app/config/firebase";
import {
  equalTo,
  get,
  orderByChild,
  query,
  ref,
  update,
} from "firebase/database";
import type { User, UserFirebase } from "../domain/user.model";

const mapUserFromFirebase = (user: UserFirebase): User => {
  return {
    ...user,
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

const getUsers = (tenantId: string) => async () => {
  const root = ref(db, `users`);
  const usersQuery = query(root, orderByChild("tenantId"), equalTo(tenantId));
  const snapshot = await get(usersQuery);

  if (snapshot.exists()) {
    return Object.values<UserFirebase>(snapshot.val()).map((val) =>
      mapUserFromFirebase(val),
    );
  } else {
    return [];
  }
};

const getAvatarUrl = (tenantId: string) => async (userId: string) => {
  const root = ref(db, `users`);
  const userQuery = query(root, orderByChild("id"), equalTo(userId));
  const snapshot = await get(userQuery);

  if (snapshot.exists()) {
    const users = snapshot.val() as Record<string, UserFirebase>;
    const user = Object.values(users).find(
      (u) => u.id === userId && u.tenantId === tenantId,
    );
    if (user) {
      return user.photoUrl || "";
    } else {
      throw new Error("User not found or unauthorized");
    }
  } else {
    throw new Error("User not found");
  }
};

export const UserRepository = (tenantId: string) => ({
  getUsers: getUsers(tenantId),
  toggleOwner: toggleOwner(tenantId),
  toggleAllowed: toggleAllowed(tenantId),
  getAvatarUrl: getAvatarUrl(tenantId),
});
