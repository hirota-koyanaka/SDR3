import type { Metadata } from "next";
import { Noto_Sans_JP, Inter } from "next/font/google";
import "./globals.css";
import { ToasterProvider } from "@/components/providers/ToasterProvider";
import { AuthProvider } from "@/contexts/AuthContext";
import { NotificationProvider } from "@/contexts/NotificationContext";

const notoSansJP = Noto_Sans_JP({
  variable: "--font-noto-sans-jp",
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "里山ドッグラン管理システム",
  description: "愛媛県今治市の自然豊かなドッグラン施設 - 愛犬と一緒に楽しい時間を過ごしませんか？",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body
        className={`${notoSansJP.variable} ${inter.variable} font-noto-sans-jp antialiased`}
      >
        <AuthProvider>
          <NotificationProvider>
            <ToasterProvider />
            {children}
          </NotificationProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
