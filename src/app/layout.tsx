import type { Metadata } from "next";
import "./globals.css";
import { security } from "@/lib/functions/seculity";
import AuthUser from "@/components/auth/AuthUser";
import Header from "@/components/Header";

export const metadata: Metadata = {
  title: "Next-SMS",
  description: "Two-factor authentication via SMS using vonage",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  //ログイン判定
  const {result,data} = await security();
 
  return (
    <html lang="ja">
      <body className="container mx-auto">
        <Header loginUser={data}/>
        <div>
          {!result ?(<>
            <AuthUser/>
          </>):(<>
            {children}
          </>)}
        </div>
      </body>
    </html>
  );
}
