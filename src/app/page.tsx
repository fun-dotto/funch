"use client";

import { onAuthStateChanged, User } from "firebase/auth";
import { useEffect, useState } from "react";
import { auth } from "../infrastructure/firebase";
import Header from "../../components/Header";
import Calendar from "@/components/Calendar";
import MonthMenu from "@/components/MonthMenu";

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);

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

  return (
    <div className="bg-[#eee] w-full h-screen flex flex-col">
      <Header />
      <main className="flex-1 ml-12 overflow-y-auto min-h-0">
        {user ? (
          <div className="space-y-6">
            <Calendar />
            <MonthMenu year={currentYear} month={currentMonth} />
          </div>
        ) : (
          <div>
            <p>ログインしてください</p>
          </div>
        )}
      </main>
    </div>
  );
}
