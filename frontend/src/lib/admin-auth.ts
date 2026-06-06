import { currentUser } from "@clerk/nextjs/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function requireAdmin() {
  const user = await currentUser();
  if (!user) {
    redirect("/login");
  }

  const email = user.emailAddresses[0]?.emailAddress;
  const adminEmails = process.env.ADMIN_EMAILS?.split(",").map((e) => e.trim()) || [];

  if (adminEmails.length > 0 && !adminEmails.includes(email)) {
    // Return false to let the layout render an "Access Denied" state
    return false;
  }

  return true;
}

export async function isSecondaryPasswordUnlocked() {
  if (!process.env.ADMIN_PASSWORD) return true; // if no password set, skip this check
  
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value;
  
  return token === process.env.ADMIN_PASSWORD;
}
