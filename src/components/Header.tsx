import Image from "next/image";
import { onAuthStateChanged, signInWithPopup, User } from "firebase/auth";
import { useEffect, useState } from "react";
import { FaGoogle } from "react-icons/fa";
import { auth, provider } from "../infrastructure/firebase";

export default function Header() {
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
  return (
    <header className="flex items-center justify-between p-4 bg-[#eee] border-b-[2px] border-[#990000] w-screen font-extrabold">
      <div className="flex items-center ml-8">
        <Image
          src="/favicon.ico"
          alt="Funch Logo"
          width={60}
          height={60}
          className="mr-2"
        />
        <span className="font-bold text-[32px] text-[#990000] ml-4">
          DottoFunch-メニューサイト
        </span>
      </div>
      <div className="mr-8">
        {user ? (
          <div className="flex items-center">
            <span className="text-sm text-gray-600 mr-4">{user.email}</span>
            <button
              type="button"
              className="text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 font-medium rounded-lg text-sm px-5 py-2.5"
              onClick={handleLogout}
            >
              ログアウト
            </button>
          </div>
        ) : (
          <button
            type="button"
            className="text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 font-medium rounded-lg text-sm px-5 py-2.5 flex items-center"
            onClick={signInwithGoogle}
          >
            <FaGoogle className="mr-2" /> 未来大Googleアカウントでログイン
          </button>
        )}
      </div>
    </header>
  );
}
