"use client";

import { onAuthStateChanged, User } from "firebase/auth";
import { useEffect, useState } from "react";
import { auth, database } from "../infrastructure/firebase";
import Header from "../../components/Header";
import { YearMonthDisplay } from "../../components/Date";
import Calendar from "@/components/Calendar";
import {
  collection,
  DocumentReference,
  getDocs,
  query,
  Timestamp,
  where,
} from "firebase/firestore";
import { importMenu, Menu, OriginalMenu } from "../repository/menu";
import { PriceModel } from "../repository/price";
import { UniqueIdentifier } from "@dnd-kit/core";

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);
  const [menuData, setMenuData] = useState(new Map<UniqueIdentifier, Menu[]>());
  const [originalMenuData, setOriginalMenuData] = useState(
    new Map<UniqueIdentifier, OriginalMenu[]>()
  );
  const [loading, setLoading] = useState(false);

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

  useEffect(() => {
    const fetchMenuData = async () => {
      if (!user) return;

      setLoading(true);
      const targetDay = new Date(currentYear, currentMonth - 1);
      const monthStartDay = new Date(targetDay);
      monthStartDay.setDate(1);
      const monthEndDay = new Date(targetDay);
      monthEndDay.setMonth(targetDay.getMonth() + 1, 0);

      const dateOptions: Intl.DateTimeFormatOptions = {
        timeZone: "Asia/Tokyo",
        year: "numeric",
        month: "numeric",
        day: "numeric",
      };

      try {
        const allMenuStorage = await importMenu();

        // 価格データを取得
        const docPriceRef = collection(database, "funch_price");
        const docPriceSnap = await getDocs(docPriceRef);
        const newPriceList: PriceModel[] = [];
        docPriceSnap.forEach((doc) => {
          const data = doc.data();
          const id = doc.id;
          const small = data.small;
          const medium = data.medium;
          const large = data.large;
          const categories = data.categories as number[];
          newPriceList.push({ id, small, medium, large, categories });
        });

        // オリジナルメニューを取得
        const docOriginalMenuRef = collection(database, "funch_original_menu");
        const docOriginalMenuSnap = await getDocs(docOriginalMenuRef);
        const originalMenuList: OriginalMenu[] = [];
        docOriginalMenuSnap.forEach((doc) => {
          const data = doc.data();
          const id = doc.id;
          const title = data.title;
          const priceId = data.price.id;
          const price = newPriceList.find((price) => price.id === priceId);
          const image = data.image;
          const large = data.large;
          const small = data.small;
          const category = data.category;
          if (price != null) {
            originalMenuList.push({
              id: id,
              title: title,
              price: price,
              image: image,
              large: large,
              small: small,
              category: category,
            });
          }
        });

        // 日別メニューデータを取得
        const docRef = query(
          collection(database, "funch_day"),
          where("date", ">=", Timestamp.fromDate(monthStartDay)),
          where("date", "<=", Timestamp.fromDate(monthEndDay))
        );
        const docSnap = await getDocs(docRef);

        const newMenuData = new Map<UniqueIdentifier, Menu[]>();
        const newOriginalMenuData = new Map<UniqueIdentifier, OriginalMenu[]>();

        docSnap.forEach((doc) => {
          const data = doc.data();
          const date = new Date(data.date.seconds * 1000);
          const dateId = new Intl.DateTimeFormat("ja-JP", dateOptions).format(
            date
          );

          // 通常メニュー
          const menuCodes =
            data.menu != undefined ? (data.menu as number[]) : [];
          const menus = menuCodes
            .map((m: number) => {
              return allMenuStorage.find((menu) => menu.item_code == m);
            })
            .filter((m) => m != undefined) as Menu[];
          newMenuData.set(dateId, menus);

          // オリジナルメニュー
          const originalMenuRefs =
            data.original_menu != undefined
              ? (data.original_menu as DocumentReference[])
              : [];
          const originalMenus = originalMenuRefs
            .map((ref) => {
              return originalMenuList.find((m) => m.id == ref.id);
            })
            .filter((m) => m != undefined) as OriginalMenu[];
          newOriginalMenuData.set(dateId, originalMenus);
        });

        setMenuData(newMenuData);
        setOriginalMenuData(newOriginalMenuData);
      } catch (error) {
        console.error("メニューデータの取得に失敗しました:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMenuData();
  }, [user, currentYear, currentMonth]);

  const handleYearMonthChange = (year: number, month: number) => {
    setCurrentYear(year);
    setCurrentMonth(month);
  };

  return (
    <div className="view bg-[#eee] min-h-full min-w-full">
      <Header />
      {user ? (
        // ログインしている場合の表示
        <div className="ml-4 md:ml-8 mt-12 md:mt-[60px]">
          <YearMonthDisplay
            year={currentYear}
            month={currentMonth}
            onYearMonthChange={handleYearMonthChange}
          />
          <Calendar
            year={currentYear}
            month={currentMonth}
            renderDay={(_, dateId) => {
              const oneDayMenuData = menuData.get(dateId);
              const oneDayOriginalMenuData = originalMenuData.get(dateId);
              return (
                <div className="flex flex-col mt-2">
                  {oneDayMenuData &&
                    oneDayMenuData.map((m) => (
                      <div
                        key={m.item_code}
                        className="flex justify-between items-center my-1 text-xs"
                      >
                        <div>{m.title}</div>
                      </div>
                    ))}
                  {oneDayOriginalMenuData &&
                    oneDayOriginalMenuData.map((m) => (
                      <div
                        key={m.id}
                        className="flex justify-between items-center my-1 text-xs"
                      >
                        <div>FUN {m.title}</div>
                      </div>
                    ))}
                </div>
              );
            }}
          />
          {loading && (
            <div className="absolute w-screen h-screen top-0 left-0 bg-gray-500 bg-opacity-50 z-50">
              <div className="absolute w-screen h-screen grid items-center text-center text-2xl">
                loading...
              </div>
            </div>
          )}
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
