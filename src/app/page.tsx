"use client";

import { onAuthStateChanged, User } from "firebase/auth";
import { useEffect, useState } from "react";
import Link from "next/link";
import { auth } from "../infrastructure/firebase";
import Header from "../components/Header";

export default function Home() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, [setUser]);

  const today = new Date();

  return (
    <div className="view">
      <Header />
      {user ? (
        // ログインしている場合の表示
        <>
          <div>
            <Link href={`/edit/${today.getFullYear()}/${today.getMonth() + 1}`}>
              <button
                type="button"
                className="text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-4"
              >
                編集
              </button>
            </Link>
          </div>
          <div>
            <Link href="/original">
              <button
                type="button"
                className="text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-4"
              >
                未来大 オリジナルメニュー 編集・追加
              </button>
            </Link>
          </div>
          <div>
            <Link href="/price">
              <button
                type="button"
                className="text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-4"
              >
                価格変更
              </button>
            </Link>
          </div>
        </>
      ) : (
        // ログインしていない場合の表示
        <div>
          <p>ログインしてください</p>
        </div>
      )}
    </div>
  );
}
