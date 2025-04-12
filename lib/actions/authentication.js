"use server";

import { signIn } from "@/lib/auth/auth";
import User from "@/models/User";
import { parseServerActionError, parseServerActionResponse } from "@/lib/utils";
import connectDB from "@/lib/mongodb";
export async function signInAction(formData) {
  const email = formData.get("email");
  const password = formData.get("password");
  if (!email || !password) {
    return parseServerActionError({
      error: "Email and password are required",
      status: "ERROR",
      message: "Email and password are required",
    });
  }
  try {
    await connectDB();
    const user = await User.findOne({ email });
    if (!user) {
      return parseServerActionError({
        error: "User not found",
        status: "ERROR",
        message: "User not found",
      });
    }
    try {
      await signIn("credentials", {
        email,
        password,
        redirect: false,
      });
    } catch (error) {
      return parseServerActionError({
        error: "Invalid credentials",
        status: "ERROR",
        message: "Invalid credentials",
      });
    }
    return parseServerActionResponse({
      success: true,
      error: "",
      status: "SUCCESS",
      message: "User successfully logged in",
    });
  } catch (error) {
    return parseServerActionError({
      error: error.message,
      status: "ERROR",
      message: error.message,
    });
  }
}
