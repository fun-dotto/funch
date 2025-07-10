import "./globals.css";
import { Inter, Noto_Sans_JP } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });
const notesans = Noto_Sans_JP({ subsets: ["latin"] });

export const metadata = {
  title: "Funch",
  description: "Menu management system",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body
        className={`${inter.className} ${notesans.className}`}
        style={{ color: "#3C373C" }}
      >
        {children}
      </body>
    </html>
  );
}
