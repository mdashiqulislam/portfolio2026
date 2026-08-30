import type { Metadata } from "next";
import { Caveat, Inter, Spline_Sans_Mono } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";

// Figma sets the body copy in `Inter Display`. That is Inter's display optical
// size, so requesting the `opsz` axis (and leaving `font-optical-sizing: auto`)
// gets the real thing rather than the text cut stretched to 24px.
const sans = Inter({
  variable: "--font-sans-src",
  subsets: ["latin"],
  axes: ["opsz"],
});

const mono = Spline_Sans_Mono({
  variable: "--font-mono-src",
  subsets: ["latin"],
  weight: ["500"],
});

// The face Figma actually uses, self-hosted from the trial the designer
// supplied, so the display type matches the frames exactly rather than through
// a stand-in. Two things to know about this file:
//   - It is the *trial* cut. Before this goes public it needs a real webfont
//     licence from Commercial Type; the file swaps in at the same path.
//   - The trial carries only 74 codepoints (A–Z a–z 0–9 . , ' " ! ? -). The one
//     character the site needs and it lacks is `&`, in the Work heading, which
//     falls through to the next face in `--font-display`.
const display = localFont({
  src: "./fonts/feature-deck-regular.woff2",
  variable: "--font-display-src",
  weight: "400",
  style: "normal",
  display: "swap",
  // Feature Deck is a serif, so size-adjust the fallback off Times rather than
  // next/font's Arial default — that is also what `--font-display` falls to.
  adjustFontFallback: "Times New Roman",
});

// The footer's handwritten "Hire Your Next!" note — the face Figma actually uses.
const script = Caveat({
  variable: "--font-script-src",
  subsets: ["latin"],
  weight: ["400"],
});

export const metadata: Metadata = {
  title: "Md Ashiqul Islam — Helping Businesses to Scale Faster",
  description:
    "Websites, AI products, brands, and system built for clarity, scales and impact.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${sans.variable} ${mono.variable} ${display.variable} ${script.variable} h-full antialiased`}
    >
      <body className="bg-ink min-h-full flex flex-col">{children}</body>
    </html>
  );
}
