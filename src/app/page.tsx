"use client";

import { onAuthStateChanged, User } from "firebase/auth";
import { useEffect, useState } from "react";
import Link from "next/link";
import { auth } from "../infrastructure/firebase";
import Header from "../../components/Header";
import { YearMonthDisplay } from "../../components/date";

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

  const handleYearMonthChange = (year: number, month: number) => {
    console.log(`年月が変更されました: ${year}年${month}月`);
  };

  return (
    <div className="view">
      <Header />
      {user ? (
        // ログインしている場合の表示
        <div className="ml-8 mt-[60px]">
          <YearMonthDisplay 
            month={today.getMonth() + 1} 
            onYearMonthChange={handleYearMonthChange}
          />
        </div>
      ) : (
        // ログインしていない場合の表示
        <div>
          <p>ログインしてください</p>
        </div>
      )}
    </div>
  );
}
