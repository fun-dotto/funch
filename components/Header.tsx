import Image from "next/image";
import { onAuthStateChanged, signInWithPopup, User } from "firebase/auth";
import { useEffect, useState } from "react";
import { FaGoogle, FaSignOutAlt } from "react-icons/fa";
import { auth, provider } from "../src/infrastructure/firebase";
import { Button } from "./ui/button";
import { IoIosArrowBack } from "react-icons/io";

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
            <Button
              variant="ghost"
              className="bg-[#eee] border-none text-[#990000] hover:bg-[#eee] hover:text-[#990000] font-medium text-[20px]"
              onClick={handleLogout}
            >
              <span className="flex items-center">
                <IoIosArrowBack />
                ログアウト
              </span>
            </Button>
          </div>
        ) : (
          <Button
            variant="ghost"
            className="bg-[#eee] border-none text-[#990000] hover:bg-[#eee] hover:text-[#990000] font-medium flex items-center"
            onClick={signInwithGoogle}
          >
            <FaGoogle className="mr-2" /> 未来大Googleアカウントでログイン
          </Button>
        )}
      </div>
    </header>
  );
}
