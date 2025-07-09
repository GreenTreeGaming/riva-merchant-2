// app/api/contact/route.ts

import { NextResponse } from "next/server";

export const runtime = "edge";

export async function POST(request: Request) {
  try {
    // 1) parse incoming multipart/form-data
    const form = await request.formData();

    // 2) forward it to Web3Forms
    const payload = new FormData();
    for (const [key, value] of form.entries()) {
      payload.append(key, value);
    }

    // your Web3Forms credentials
    payload.set("access_key", "f9f315cd-1a11-43fb-98ba-a83533ad1366");
    payload.set("subject", "New Merchant Application");
    payload.set("from_name", String(form.get("name") ?? ""));

    const res = await fetch("https://api.web3forms.com/submit", {
      method: "POST",
      body: payload,
    });

    const json = await res.json();
    if (json.success) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json(
        { success: false, message: json.message || "Submission failed" },
        { status: 500 }
      );
    }
  } catch (err) {
    console.error("🛑 API error:", err);
    return NextResponse.json(
      { success: false, message: "Network or parse error" },
      { status: 500 }
    );
  }
}