'use client'

import { onAuthStateChanged, signInWithPopup, User } from "firebase/auth";
import { useEffect, useState } from "react";
import { FaGoogle } from "react-icons/fa";
import Link from "next/link";
import { auth, provider } from "../src/infrastructure/firebase";

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

  const handleLogout = () => {
    auth.signOut();
    setUser(null);
  };

  const signInwithGoogle = async () => {
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error(error);
      alert("fun.ac.jpのアカウントでログインしてください");
    }
  };

  const today = new Date();
  
  return (
    <div className="view">
      <div>
        <Link href="/">ホーム</Link>
      </div>
      {user ? (
        // ログインしている場合の表示
        <>
          <div>
            <p>{user.email} でログイン中</p>
            <button
              type="button"
              className="text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-4"
              onClick={handleLogout}
            >
              ログアウト
            </button>
          </div>
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
          <button
            type="button"
            className="text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 flex items-center"
            onClick={signInwithGoogle}
          >
            <FaGoogle /> 未来大Googleアカウントでログイン
          </button>
        </div>
      )}
    </div>
  );
}