import type { Metadata } from "next";
import Script from "next/script";
import { ReactNode } from "react";
import "tailwindcss/tailwind.css";

const title = "app.abandon.ai";
const description = "AbandonAI Applications";

export const metadata: Metadata = {
  title,
  description,
  viewport:
    "width=device-width, viewport-fit=cover, initial-scale=1, shrink-to-fit=no,minimum-scale=1.0,maximum-scale=1.0,user-scalable=no",
  applicationName: "abandon.ai",
  themeColor: "#fff",
  openGraph: {
    images: "/favicon.svg",
    title,
    description,
  },
  twitter: {
    title,
    description,
    card: "summary_large_image",
    creator: "@abandonai",
  },
  manifest: "/manifest.json",
  appleWebApp: {
    title: "abandon.ai",
  },
};

export default function RootLayout(props: { children: ReactNode }) {
  return (
    <html lang="en">
      <body style={{ backgroundColor: "#121212" }}>
        <Script
          src={"https://www.googletagmanager.com/gtag/js?id=G-HT9Q8GW970"}
        />
        <Script async src={"https://js.stripe.com/v3/pricing-table.js"} />
        <Script id="google-tag-manager" strategy="afterInteractive">
          {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                
                gtag('config', 'G-HT9Q8GW970');
              `}
        </Script>
        <div className={"h-screen"}>{props.children}</div>
      </body>
    </html>
  );
}
