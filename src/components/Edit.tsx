// import React from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import {
  FaCheck,
  FaChevronDown,
  FaChevronLeft,
  FaChevronRight,
  FaTrashAlt,
} from "react-icons/fa";
import { FC, ReactNode, useEffect, useState } from "react";
import {
  getCategoryMenu,
  importMenu,
  Menu,
  OriginalMenu,
} from "../repository/menu";
import {
  DndContext,
  DragOverlay,
  UniqueIdentifier,
  useDraggable,
  useDroppable,
} from "@dnd-kit/core";
// import * as wanakana from "wanakana";
import { auth, database } from "../infrastructure/firebase";
import {
  collection,
  doc,
  DocumentReference,
  getDoc,
  getDocs,
  orderBy,
  query,
  setDoc,
  Timestamp,
  where,
} from "firebase/firestore";
import { PriceModel } from "../repository/price";

const Edit = () => {
  const { year, month } = useParams();
  const [menuData, setMenuData] = useState(new Map<UniqueIdentifier, Menu[]>());
  const [originalMenuData, setOriginalMenuData] = useState(
    new Map<UniqueIdentifier, OriginalMenu[]>()
  );
  const [originalMenuList, setOriginalMenuList] = useState<OriginalMenu[]>([]);
  const [monthMenuData, setMonthMenuData] = useState<Menu[]>([]);
  const [monthOriginalMenuData, setMonthOriginalMenuData] = useState<
    OriginalMenu[]
  >([]);
  const [activeMenu, setActiveMenu] = useState<Menu | null>(null);
  const [activeOriginalMenu, setActiveOriginalMenu] =
    useState<OriginalMenu | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [allMenu, setAllMenu] = useState<Menu[]>([]);

  const user = auth.currentUser;
  if (user == null) {
    return <Navigate replace to="/" />;
  }

  let canView = true;
  let targetYear = 0;
  let targetMonth = -1;

  if (year == undefined || month == undefined) {
    canView = false;
  } else {
    targetYear = parseInt(year);
    targetMonth = parseInt(month);
    if (
      targetMonth <= 0 ||
      targetMonth > 12 ||
      targetYear < 2024 ||
      Number.isNaN(targetYear) ||
      Number.isNaN(targetMonth)
    ) {
      canView = false;
    }
  }
  if (!canView) {
    return <div>無効です</div>;
  }

  const targetDay = new Date(targetYear, targetMonth - 1);
  const monthStartDay = new Date(targetDay);
  monthStartDay.setDate(1);
  const monthEndDay = new Date(targetDay);
  monthEndDay.setMonth(targetDay.getMonth() + 1, 0);
  const nextMonth = new Date(targetDay);
  nextMonth.setMonth(targetDay.getMonth() + 1);
  const prevMonth = new Date(targetDay);
  prevMonth.setMonth(targetDay.getMonth() - 1);
  const dayOptions: Intl.DateTimeFormatOptions = {
    timeZone: "Asia/Tokyo",
    day: "numeric",
  };
  const dateOptions: Intl.DateTimeFormatOptions = {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "numeric",
    day: "numeric",
  };
  const yearJST = new Intl.DateTimeFormat("ja-JP", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
  }).format(monthStartDay);
  const monthJST = new Intl.DateTimeFormat("ja-JP", {
    timeZone: "Asia/Tokyo",
    month: "numeric",
  }).format(monthStartDay);
  const formatDateJST = (date: Date, m: boolean) => {
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      timeZone: "Asia/Tokyo",
    };
    const formatter = new Intl.DateTimeFormat("ja-JP", options);
    const parts = formatter.formatToParts(date);
    const year = parts.find((part) => part.type === "year")?.value;
    const month = parts.find((part) => part.type === "month")?.value;
    const day = parts.find((part) => part.type === "day")?.value;

    return m ? `${year}${month}` : `${year}${month}${day}`;
  };

  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const allMenuStorage = await importMenu();
      setAllMenu(() => allMenuStorage);
      let newOriginalMenuList: OriginalMenu[] = [];
      if (originalMenuList.length == 0) {
        const docPriceRef = query(
          collection(database, "funch_price"),
          orderBy("medium", "desc")
        );
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

        const docOriginalMenuRef = query(
          collection(database, "funch_original_menu")
        );
        const docOriginalMenuSnap = await getDocs(docOriginalMenuRef);
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
            newOriginalMenuList.push({
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
        setOriginalMenuList(() => newOriginalMenuList);
      } else {
        newOriginalMenuList = originalMenuList;
      }
      const docMonthRef = doc(
        database,
        "funch_month",
        formatDateJST(targetDay, true)
      );
      const docMonthSnap = await getDoc(docMonthRef);
      if (docMonthSnap.exists()) {
        const data = docMonthSnap.data();

        const menuCodes = data.menu != undefined ? (data.menu as number[]) : [];
        const menus = menuCodes
          .map((m: number) => {
            return allMenuStorage.find((menu) => menu.item_code == m);
          })
          .filter((m) => m != undefined) as Menu[];
        setMonthMenuData(() => menus);
        const originalMenuRefs =
          data.original_menu != undefined
            ? (data.original_menu as DocumentReference[])
            : [];
        const originalMenus = originalMenuRefs
          .map((ref) => {
            return newOriginalMenuList.find((m) => m.id == ref.id);
          })
          .filter((m) => m != undefined) as OriginalMenu[];
        setMonthOriginalMenuData(() => originalMenus);
      } else {
        const menuCodes = [
          10002, 12057, 12075, 17364, 17366, 17390, 17392, 7051, 7053, 7052,
          8001,
        ];
        const menus = menuCodes
          .map((m: number) => {
            return allMenuStorage.find((menu) => menu.item_code == m);
          })
          .filter((m) => m != undefined) as Menu[];
        setMonthMenuData(() => menus);
        setMonthOriginalMenuData(() => []);
      }
      const docRef = query(
        collection(database, "funch_day"),
        where("date", ">=", Timestamp.fromDate(monthStartDay)),
        where("date", "<=", Timestamp.fromDate(monthEndDay))
      );
      const docSnap = await getDocs(docRef);
      docSnap.forEach((doc) => {
        const data = doc.data();
        const date = new Date(data.date.seconds * 1000);
        const menuCodes = data.menu != undefined ? (data.menu as number[]) : [];
        const menus = menuCodes
          .map((m: number) => {
            return allMenuStorage.find((menu) => menu.item_code == m);
          })
          .filter((m) => m != undefined) as Menu[];

        setMenuData((prev) => {
          const newMenuData = new Map(prev);
          newMenuData.set(
            new Intl.DateTimeFormat("ja-JP", dateOptions).format(date),
            menus
          );
          return newMenuData;
        });
        const originalMenuRefs =
          data.original_menu != undefined
            ? (data.original_menu as DocumentReference[])
            : [];
        const originalMenus = originalMenuRefs
          .map((ref) => {
            return newOriginalMenuList.find((m) => m.id == ref.id);
          })
          .filter((m) => m != undefined) as OriginalMenu[];
        setOriginalMenuData((prev) => {
          const newMenuData = new Map(prev);
          newMenuData.set(
            new Intl.DateTimeFormat("ja-JP", dateOptions).format(date),
            originalMenus
          );
          return newMenuData;
        });
      });
      await new Promise((resolve) => setTimeout(resolve, 300));
      setLoading(false);
    };
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [year, month]);

  const calendar: Date[] = [];
  const calendarStartDate = new Date(monthStartDay);
  calendarStartDate.setDate(
    1 + monthStartDay.getDay() == 0 ? -6 : 1 - monthStartDay.getDay()
  );
  let i = 0;
  for (i = 0; i < 7 * 5; i++) {
    const pushDate = new Date(calendarStartDate);
    pushDate.setDate(pushDate.getDate() + i);
    if (pushDate.getDay() > 0 && pushDate.getDay() < 6) {
      calendar.push(pushDate);
    }
  }
  const checkDate = new Date(calendarStartDate);
  checkDate.setDate(checkDate.getDate() + i);
  if (checkDate <= monthEndDay) {
    for (; i < 7 * 6; i++) {
      const pushDate = new Date(calendarStartDate);
      pushDate.setDate(pushDate.getDate() + i);
      if (pushDate.getDay() > 0 && pushDate.getDay() < 6) {
        calendar.push(pushDate);
      }
    }
  }

  const categoryOptions = [
    { value: "1", label: "主菜" },
    { value: "2", label: "副菜" },
    { value: "9", label: "サラダ" },
    { value: "4", label: "丼物" },
    { value: "5", label: "カレー" },
    { value: "11", label: "麺類" },
    { value: "7", label: "ごはん" },
    { value: "8", label: "汁物" },
    { value: "10", label: "デザート" },
  ];
  const sortNumber = [1, 2, 9, 4, 5, 11, 7, 8, 10];

  const removeMenu = (date: string, item_code: number) => {
    setMenuData((prev) => {
      const newMenuData = new Map(prev);
      const dateMenu = newMenuData.get(date);
      if (dateMenu != undefined) {
        const newDateMenu = dateMenu.filter((m) => m.item_code != item_code);
        newMenuData.set(date, newDateMenu);
      }
      return newMenuData;
    });
  };

  const removeOriginalMenu = (date: string, id: string) => {
    setOriginalMenuData((prev) => {
      const newMenuData = new Map(prev);
      const dateMenu = newMenuData.get(date);
      if (dateMenu != undefined) {
        const newDateMenu = dateMenu.filter((m) => m.id != id);
        newMenuData.set(date, newDateMenu);
      }
      return newMenuData;
    });
  };

  const removeMonthMenu = (item_code: number) => {
    setMonthMenuData((prev) => {
      return prev.filter((m) => m.item_code != item_code);
    });
  };

  const removeOriginalMonthMenu = (id: string) => {
    setMonthOriginalMenuData((prev) => {
      return prev.filter((m) => m.id != id);
    });
  };

  const calendarWeekStr = ["月", "火", "水", "木", "金"];

  const menuSort = (a: Menu, b: Menu) => {
    const diff1 =
      sortNumber.indexOf(a.category) - sortNumber.indexOf(b.category);
    if (diff1 != 0) {
      return diff1;
    }
    // 軽量化のため、10文字までで比較
    // const diff2 = wanakana
    //   .toKana(a.display_name_roman.slice(0, 10))
    //   .localeCompare(wanakana.toKana(b.display_name_roman.slice(0, 10)), "ja");
    // if (diff2 != 0) {
    //   return diff2;
    // }
    return a.title.localeCompare(b.title, "ja");
  };

  const saveMenu = async () => {
    setSaving(true);
    setSaved(false);
    const keys: Set<UniqueIdentifier> = new Set([
      ...menuData.keys(),
      ...originalMenuData.keys(),
    ]);
    keys.forEach(async (key) => {
      const menuOneDayData = menuData.get(key);
      const originalMenuOneDayData = originalMenuData.get(key);
      const d = new Date(key);
      const id = formatDateJST(d, false);
      const setData = {
        date: Timestamp.fromDate(d),
        menu: new Array<number>(),
        original_menu: new Array<DocumentReference>(),
      };
      if (menuOneDayData != undefined) {
        setData.menu = menuOneDayData.map((m) => m.item_code);
      }
      if (originalMenuOneDayData != undefined) {
        setData.original_menu = originalMenuOneDayData.map((m) =>
          doc(database, "funch_original_menu", m.id)
        );
      }
      await setDoc(doc(database, "funch_day", id), setData);
    });

    const monthMenuItemCodes = monthMenuData.map((m) => m.item_code);
    const monthOriginalMenuIds = monthOriginalMenuData.map((m) =>
      doc(database, "funch_original_menu", m.id)
    );
    const id = formatDateJST(targetDay, true);
    await setDoc(doc(database, "funch_month", id), {
      year: targetYear,
      month: targetMonth,
      menu: monthMenuItemCodes,
      original_menu: monthOriginalMenuIds,
    });
    setSaving(false);
    setSaved(true);
    new Promise((resolve) => setTimeout(resolve, 3000)).then(() => {
      setSaved(false);
    });
  };

  return (
    <>
      <DndContext
        onDragStart={(event) => {
          const { active } = event;
          if (active == null) {
            return;
          }
          if (active.data.current != null) {
            if (active.data.current!.menu instanceof Menu) {
              setActiveMenu(() => active.data.current!.menu);
            } else {
              setActiveOriginalMenu(() => active.data.current!.menu);
            }
          }
        }}
        onDragEnd={(event) => {
          const { over } = event;
          if (over == null) {
            return;
          }
          if (activeMenu != null) {
            if (over.id == "month") {
              setMonthMenuData((prev) => {
                if (
                  prev.find((m) => m.item_code == activeMenu.item_code) ==
                  undefined
                ) {
                  const monthMenu = [...prev, activeMenu];
                  monthMenu.sort(menuSort);
                  return monthMenu;
                } else {
                  return prev;
                }
              });
            } else {
              setMenuData((prev) => {
                const date = over.id;
                const newMenuData = new Map(prev);
                const dateMenu = newMenuData.get(date);
                if (dateMenu != undefined) {
                  if (
                    dateMenu.find((m) => m.item_code == activeMenu.item_code) ==
                    undefined
                  ) {
                    dateMenu.push(activeMenu);
                    dateMenu.sort(menuSort);
                    newMenuData.set(date, dateMenu);
                  }
                } else {
                  newMenuData.set(date, [activeMenu]);
                }
                return newMenuData;
              });
            }
          } else if (activeOriginalMenu != null) {
            if (over.id == "month") {
              setMonthOriginalMenuData((prev) => {
                if (
                  prev.find((m) => m.id == activeOriginalMenu.id) == undefined
                ) {
                  const monthMenu = [...prev, activeOriginalMenu];
                  // monthMenu.sort(menuSort);
                  return monthMenu;
                } else {
                  return prev;
                }
              });
            } else {
              setOriginalMenuData((prev) => {
                const date = over.id;
                const newMenuData = new Map(prev);
                const dateMenu = newMenuData.get(date);
                if (dateMenu != undefined) {
                  if (
                    dateMenu.find((m) => m.id == activeOriginalMenu.id) ==
                    undefined
                  ) {
                    dateMenu.push(activeOriginalMenu);
                    // dateMenu.sort(menuSort);
                    newMenuData.set(date, dateMenu);
                  }
                } else {
                  newMenuData.set(date, [activeOriginalMenu]);
                }
                return newMenuData;
              });
            }
          }

          setActiveMenu(() => null);
        }}
      >
        <div className="sm:mr-96 z-10">
          <div className="flex justify-between">
            <h2>
              {yearJST}
              {monthJST}
            </h2>
            <div className="flex">
              <Link
                to={`/edit/${prevMonth.getFullYear()}/${
                  prevMonth.getMonth() + 1
                }`}
              >
                <div className="mx-2 flex items-center">
                  <FaChevronLeft />
                  前の月
                </div>
              </Link>
              <Link
                to={`/edit/${nextMonth.getFullYear()}/${
                  nextMonth.getMonth() + 1
                }`}
              >
                <div className="mx-2 flex items-center">
                  次の月
                  <FaChevronRight />
                </div>
              </Link>
            </div>
          </div>
          <div className="mt-4 text-right">
            <button
              type="button"
              className={` text-xl text-white rounded py-2 px-3 ${
                saving
                  ? "cursor-not-allowed bg-gray-500"
                  : "cursor-pointer bg-blue-500 hover:bg-blue-700"
              }`}
              onClick={saveMenu}
              disabled={saving}
            >
              保存する
            </button>
          </div>
          <div className="my-2 mx-auto">
            <div className="grid grid-cols-5 justify-items-stretch text-left gap-0.5">
              {calendarWeekStr.map((v) => (
                <div
                  className="w-full bg-gray-200 border-gray-300 rounded p-2 text-center"
                  key={v}
                >
                  {v}
                </div>
              ))}

              {calendar.map((v) => {
                const dateId = new Intl.DateTimeFormat(
                  "ja-JP",
                  dateOptions
                ).format(v);
                const oneDayMenuData = menuData.get(dateId);
                const oneDayOriginalMenuData = originalMenuData.get(dateId);
                return (
                  <div className="w-full bg-gray-300 border-gray-300 rounded">
                    {v >= monthStartDay && v <= monthEndDay && (
                      <Droppable date={v} id={dateId}>
                        {new Intl.DateTimeFormat("ja-JP", dayOptions).format(v)}
                        <div className="flex flex-col mt-4">
                          {oneDayMenuData &&
                            oneDayMenuData.map((m) =>
                              InMenu({
                                menu: m,
                                onClick: () => removeMenu(dateId, m.item_code),
                              })
                            )}
                          {oneDayOriginalMenuData &&
                            oneDayOriginalMenuData.map((m) =>
                              InMenu({
                                menu: m,
                                onClick: () => removeOriginalMenu(dateId, m.id),
                              })
                            )}
                        </div>
                      </Droppable>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="mt-12">
              <h3>{monthJST}の共通メニュー</h3>
              <div className="w-2/5">
                <Droppable date={targetDay} id="month">
                  <div className="flex flex-col mt-4">
                    {monthMenuData.map((m) =>
                      InMenu({
                        menu: m,
                        onClick: () => removeMonthMenu(m.item_code),
                      })
                    )}
                    {monthOriginalMenuData &&
                      monthOriginalMenuData.map((m) =>
                        InMenu({
                          menu: m,
                          onClick: () => removeOriginalMonthMenu(m.id),
                        })
                      )}
                  </div>
                </Droppable>
              </div>
            </div>
          </div>
        </div>
        <aside className="fixed top-0 right-0 w-96 h-screen bg-white overflow-x-hidden overflow-y-scroll z-10">
          {categoryOptions.map((c) => DraggableByCategory(c, allMenu))}
          {DraggableOriginal(originalMenuList)}
        </aside>
        <DragOverlay>
          {activeMenu && <DraggableBlockSource menu={activeMenu} />}
          {activeOriginalMenu && (
            <DraggableBlockSource menu={activeOriginalMenu} />
          )}
        </DragOverlay>
      </DndContext>
      {loading && (
        <div className="absolute w-screen h-screen top-0 left-0 bg-gray-500 bg-opacity-50 z-50">
          <div className="absolute w-screen h-screen grid items-center text-center text-2xl">
            loading...
          </div>
        </div>
      )}

      <div
        className={`absolute top-4 right-4 py-3 px-6 bg-gray-600 text-white rounded z-40 transition-opacity flex items-center ${
          !saved && "opacity-0"
        }`}
      >
        <FaCheck className="mr-2" />
        保存しました！
      </div>
    </>
  );
};

const InMenu = ({
  menu,
  onClick,
}: {
  menu: Menu | OriginalMenu;
  onClick: React.MouseEventHandler<SVGElement>;
}) => {
  return (
    <div className="flex justify-between items-center my-1">
      {menu instanceof Menu ? (
        <>
          <div>
            {menu.title}
            <span className="text-xs">¥{menu.price_medium}</span>
          </div>
        </>
      ) : (
        <>
          <div>
            FUN {menu.title}
            <span className="text-xs">¥{menu.price.medium}</span>
          </div>
        </>
      )}
      <FaTrashAlt
        className="cursor-pointer inline text-gray-500"
        onClick={onClick}
      />
    </div>
  );
};

const DraggableOriginal = (menu: OriginalMenu[]) => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <div
        className="mx-2 my-4 flex items-center cursor-pointer"
        onClick={() => setOpen((prev) => !prev)}
      >
        {open ? <FaChevronDown /> : <FaChevronRight />}
        未来大オリジナル
      </div>

      {open &&
        menu.map((m) => {
          return <Draggable id={m.id} menu={m} />;
        })}
    </>
  );
};

const DraggableByCategory = (
  {
    value,
    label,
  }: {
    value: string;
    label: string;
  },
  allMenu: Menu[]
) => {
  const category_code = Number(value);
  const menus = getCategoryMenu(allMenu, category_code);
  const [open, setOpen] = useState(false);
  return (
    <>
      <div
        className="mx-2 my-4 flex items-center cursor-pointer"
        onClick={() => setOpen((prev) => !prev)}
      >
        {open ? <FaChevronDown /> : <FaChevronRight />}
        {label}
      </div>

      {open &&
        menus.map((m) => {
          return <Draggable id={String(m.item_code)} menu={m} />;
        })}
    </>
  );
};

export default Edit;

type DraggableBlockSourceType = {
  isDragging?: boolean;
  menu: Menu | OriginalMenu;
};

export const DraggableBlockSource: FC<DraggableBlockSourceType> = ({
  isDragging,
  menu,
}) => {
  return (
    <div
      className={`z-30 p-2 my-1 mx-4 border rounded bg-white select-none w-fit ${
        isDragging ? "cursor-grabbing" : "cursor-grab"
      }`}
    >
      {menu instanceof Menu ? (
        <>
          {menu.title}
          <span className="text-xs">¥{menu.price_medium}</span>
        </>
      ) : (
        <>
          FUN {menu.title}
          <span className="text-xs">¥{menu.price.medium}</span>
        </>
      )}
    </div>
  );
};

type DraggableProps = {
  id: string;
  menu: Menu | OriginalMenu;
};

export const Draggable: FC<DraggableProps> = ({ id, menu }) => {
  // useDraggableを使って必要な値をもらう
  const { setNodeRef, listeners, attributes, isDragging } = useDraggable({
    id,
    data: { menu },
  });

  return (
    <div ref={setNodeRef} {...attributes} {...listeners} className="z-20 h-fit">
      <DraggableBlockSource isDragging={isDragging} menu={menu} />
    </div>
  );
};

type DroppableProp = {
  date: Date;
  children: ReactNode;
  id: string;
};

export const Droppable: FC<DroppableProp> = ({ date, children, id }) => {
  const { setNodeRef, isOver } = useDroppable({
    id,
    data: { date },
  });

  return (
    <div
      ref={setNodeRef}
      className={`w-full h-full min-h-24 p-2 border rounded ${
        isOver ? "bg-green-200" : "bg-gray-200"
      }`}
    >
      {children}
    </div>
  );
};
