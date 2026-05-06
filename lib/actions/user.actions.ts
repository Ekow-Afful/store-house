"use server";

import { ID, Query } from "node-appwrite";
import { createAdminClient, createSessionClient } from "../appwrite";
import { appwriteConfig } from "../appwrite/config";
import { parseStringify } from "../utils";
import { cookies } from "next/headers";
import { avatarPlaceholderUrl } from "@/constants";
import { redirect } from "next/navigation";

const getUserByEmail = async (email: string) => {
  const { databases } = await createAdminClient();

  const result = await databases.listDocuments(
    appwriteConfig.databaseId,
    appwriteConfig.usersCollectionId,
    [Query.equal("email", [email])]
  );

  return result.total > 0 ? result.documents[0] : null;
};

const handleError = (error: unknown, message: string) => {
  console.log(error, message);
  throw error;
};

/** Readable message from Appwrite / Node errors for the UI */
const toAppwriteUserMessage = (error: unknown): string => {
  if (error instanceof Error) {
    const err = error as Error & { response?: string };
    if (typeof err.response === "string" && err.response.length > 0) {
      try {
        const body = JSON.parse(err.response) as { message?: string };
        if (body?.message) return body.message;
      } catch {
        /* ignore */
      }
    }
    if (err.message) return err.message;
  }
  return "Something went wrong. Please try again.";
};

export type AuthEmailResult =
  | { ok: true; accountId: string }
  | { ok: false; message: string };

export const sendEmailOTP = async ({
  email,
  accountId,
}: {
  email: string;
  /** Existing Appwrite user id — required for login/resend so the OTP matches that account */
  accountId?: string;
}) => {
  const { account } = await createAdminClient();

  try {
    const token = await account.createEmailToken(accountId ?? ID.unique(), email);

    return token.userId;
  } catch (error) {
    handleError(error, "Failed to send email OTP");
  }
};

export const createAccount = async ({
  fullName,
  email,
}: {
  fullName: string;
  email: string;
}): Promise<AuthEmailResult> => {
  try {
    const existingUser = await getUserByEmail(email);

    const accountId = await sendEmailOTP({
      email,
      accountId: existingUser?.accountId,
    });
    if (!accountId) {
      return { ok: false, message: "Could not send verification email." };
    }

    if (!existingUser) {
      const { databases } = await createAdminClient();

      await databases.createDocument(
        appwriteConfig.databaseId,
        appwriteConfig.usersCollectionId,
        ID.unique(),
        {
          fullName,
          email,
          avatar: avatarPlaceholderUrl,
          accountId,
        }
      );
    }

    return { ok: true, accountId };
  } catch (error) {
    return { ok: false, message: toAppwriteUserMessage(error) };
  }
};

export const verifySecret = async ({
  accountId,
  password,
}: {
  accountId: string;
  password: string;
}) => {
  try {
    const { account } = await createAdminClient();

    const session = await account.createSession(accountId, password);

    (await cookies()).set("appwrite-session", session.secret, {
      path: "/",
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
    });

    return parseStringify({ sessionId: session.$id });
  } catch (error) {
    handleError(error, "Failed to verify OTP");
  }
};

export const getCurrentUser = async () => {
  const { databases, account } = await createSessionClient();

  const result = await account.get();

  const user = await databases.listDocuments(
    appwriteConfig.databaseId,
    appwriteConfig.usersCollectionId,
    [Query.equal("accountId", result.$id)]
  );

  if (user.total <= 0) return null;

  return parseStringify(user.documents[0]);
};

export const signOutUser = async () => {
  const { account } = await createSessionClient();

  try {
    await account.deleteSession("current");
    (await cookies()).delete("appwrite-session");
  } catch (error) {
    handleError(error, "Failed to sign out user");
  } finally {
    redirect("/sign-in");
  }
};

export const signInUser = async ({
  email,
}: {
  email: string;
}): Promise<AuthEmailResult> => {
  try {
    const existingUser = await getUserByEmail(email);

    if (!existingUser) {
      return {
        ok: false,
        message: "No account found for this email. Try signing up first.",
      };
    }

    await sendEmailOTP({
      email,
      accountId: existingUser.accountId,
    });

    return { ok: true, accountId: existingUser.accountId };
  } catch (error) {
    return { ok: false, message: toAppwriteUserMessage(error) };
  }
};
