import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function GET() {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;

  if (!user || !pass) {
    return NextResponse.json({ error: "env vars missing", user: !!user, pass: !!pass });
  }

  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: { user, pass },
  });

  try {
    await transporter.verify();
    return NextResponse.json({ ok: true, user });
  } catch (err) {
    const e = err as Error & { code?: string; responseCode?: number; response?: string };
    return NextResponse.json({
      ok: false,
      user,
      code: e.code,
      responseCode: e.responseCode,
      message: e.message,
      response: e.response,
    });
  }
}
