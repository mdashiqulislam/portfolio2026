import type { Metadata } from "next";
import { Caveat, Inter, Instrument_Serif, Spline_Sans_Mono } from "next/font/google";
import "./globals.css";

const sans = Inter({
  variable: "--font-sans-src",
  subsets: ["latin"],
});

const mono = Spline_Sans_Mono({
  variable: "--font-mono-src",
  subsets: ["latin"],
  weight: ["500"],
});

// Stand-in for "Feature Deck" (a licensed trial face that can't be shipped).
// Closest free high-contrast display serif; swap this import to change it.
const display = Instrument_Serif({
  variable: "--font-display-src",
  subsets: ["latin"],
  weight: ["400"],
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
