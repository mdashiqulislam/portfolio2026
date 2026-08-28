"use client";

import Cal, { getCalApi } from "@calcom/embed-react";
import { useEffect } from "react";

/**
 * The live Cal.com inline embed that replaces the frame's static
 * `Screenshot 2026-07-05 at 6.09.28 PM 1` placeholder (`40003959:2064`,
 * 1280 × 602, radius 8). The screenshot shows Cal.com's own dark month view,
 * so the embed is configured to render exactly that; the widget then keeps
 * its real, current availability instead of the mock's July 2026.
 */
export default function CalBooking() {
  useEffect(() => {
    (async () => {
      const cal = await getCalApi({ namespace: "30min" });
      cal("ui", {
        theme: "dark",
        hideEventTypeDetails: false,
        layout: "month_view",
      });
    })();
  }, []);

  return (
    <Cal
      namespace="30min"
      calLink="md-ashiqul-islam-1k4l0w/30min"
      config={{ layout: "month_view", theme: "dark" }}
      style={{ width: "100%", height: "100%", overflow: "auto" }}
    />
  );
}
