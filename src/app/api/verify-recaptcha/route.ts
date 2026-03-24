import { NextRequest, NextResponse } from "next/server";
import { createLogger } from "@/lib/logger";

const log = createLogger("api:recaptcha");
const SECRET_KEY = process.env.RECAPTCHA_SECRET_KEY || "";
const SCORE_THRESHOLD = 0.5;

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json({ success: false, error: "No token" }, { status: 400 });
    }

    if (!SECRET_KEY) {
      // No secret key configured — skip verification (dev mode)
      return NextResponse.json({ success: true, score: 1 });
    }

    const response = await fetch("https://www.google.com/recaptcha/api/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        secret: SECRET_KEY,
        response: token,
      }),
    });

    const data = await response.json();

    if (!data.success || data.score < SCORE_THRESHOLD) {
      log.warn("recaptcha verification failed", undefined, { score: data.score, success: data.success });
      return NextResponse.json(
        { success: false, score: data.score, error: "Failed verification" },
        { status: 403 }
      );
    }

    return NextResponse.json({ success: true, score: data.score });
  } catch (err) {
    log.error("recaptcha verification error", err);
    return NextResponse.json({ success: false, error: "Verification error" }, { status: 500 });
  }
}
