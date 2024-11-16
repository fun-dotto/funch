import { useEffect, useState } from "react";
import { auth, database } from "../infrastructure/firebase";
import { Navigate } from "react-router-dom";
import {
  query,
  collection,
  getDocs,
  doc,
  updateDoc,
  orderBy,
} from "firebase/firestore";
import { PriceModel } from "../repository/price";
import { OriginalMenu, OriginalMenuNull } from "../repository/menu";
import Select, { StylesConfig } from "react-select";
import { FaEdit, FaSave } from "react-icons/fa";
import { MdClose } from "react-icons/md";
import React from "react";

type Option = {
  value: string;
  label: string;
};

const Original = () => {
  const [loading, setLoading] = useState(true);
  const [priceList, setPriceList] = useState<PriceModel[]>([]);
  const [originalMenuList, setOriginalMenuList] = useState<OriginalMenu[]>([]);
  const [priceSelectOptions, setPriceSelectOptions] = useState<Option[]>([]);
  const [editId, setEditId] = useState<string | null>(null);
  const [editMenu, setEditMenu] = useState<OriginalMenuNull | null>(null);
  const user = auth.currentUser;
  if (user == null) {
    return <Navigate replace to="/" />;
  }
  const categoryOptions: Option[] = [
    { value: "1", label: "主菜" },
    // { value: "2", label: "副菜" },
    // { value: "9", label: "サラダ" },
    { value: "4", label: "丼物" },
    { value: "5", label: "カレー" },
    { value: "11", label: "麺類" },
    // { value: "7", label: "ごはん" },
    // { value: "8", label: "汁物" },
    // { value: "10", label: "デザート" },
  ];

  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    const fetchData = async () => {
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
      setPriceList(() => newPriceList);
      setPriceSelectOptions(() =>
        newPriceList.map((price) => {
          let l = "中:" + price.medium + "円";
          if (price.large != undefined) {
            l += " 大:" + price.large + "円";
          }
          if (price.small != undefined) {
            l += " 小:" + price.small + "円";
          }
          return { value: price.id, label: l };
        })
      );
      const docOriginalMenuRef = query(
        collection(database, "funch_original_menu")
      );
      const docOriginalMenuSnap = await getDocs(docOriginalMenuRef);
      const newOriginalMenuList: OriginalMenu[] = [];
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
      await new Promise((resolve) => setTimeout(resolve, 300));
      setLoading(() => false);
    };
    fetchData();
  }, []);

  const getCategoryOption = (category_code: number | undefined) => {
    if (category_code == undefined) {
      return undefined;
    }
    return categoryOptions.find(
      (category) => category.value === category_code.toString()
    );
  };

  const getPriceOptions = (category_code: number | undefined) => {
    if (category_code == undefined) {
      return undefined;
    }
    const categoryPriceList = priceListOnCategory(category_code);
    if (categoryPriceList.length == 0) {
      return undefined;
    }

    return categoryPriceList.map((price) => {
      let l = "中:" + price.medium + "円";
      if (price.large != undefined) {
        l += " 大:" + price.large + "円";
      }
      if (price.small != undefined) {
        l += " 小:" + price.small + "円";
      }
      return { value: price.id, label: l };
    });
  };

  const priceListOnCategory = (category: number) => {
    return priceList.filter((price) => {
      return price.categories.includes(category);
    });
  };

  const getPriceOption = (priceId: string | undefined) => {
    if (priceId == undefined) {
      return undefined;
    }
    return priceSelectOptions.find((price) => price.value == priceId);
  };

  const onEdit = (menuId: string) => {
    const editTargetMenu = originalMenuList.find((menu) => menu.id === menuId);
    if (editTargetMenu == null) {
      return;
    }
    setEditId(() => menuId);
    setEditMenu(() => ({ ...editTargetMenu }));
  };

  const onCanceled = () => {
    setEditId(() => null);
    setEditMenu(() => null);
  };

  const onChange = (data: object) => {
    setEditMenu((prev) => {
      if (prev == null) {
        return null;
      }
      const n = { ...prev, ...data };
      console.log(n);
      return n;
    });
  };

  const onPriceChange = (newValue: unknown) => {
    try {
      const option = newValue as Option;
      const price =
        priceList.find((price) => price.id === option.value) ?? null;
      onChange({ price: price });
    } catch {
      onChange({ price: null });
    }
  };

  const onSave = async () => {
    if (editMenu != null) {
      if (
        editMenu.title == "" ||
        editMenu.price == undefined ||
        editMenu.category == undefined
      ) {
        return;
      }
      if (editMenu.id != undefined) {
        const editRef = doc(database, "funch_original_menu", editMenu.id);
        const priceRef = doc(database, "funch_price", editMenu.price.id);
        await updateDoc(editRef, {
          title: editMenu.title,
          price: priceRef,
          large: editMenu.large,
          small: editMenu.small,
          category: editMenu.category,
        });
        const newMenu: OriginalMenu = {
          id: editMenu.id,
          title: editMenu.title,
          price: editMenu.price,
          image: editMenu.image,
          large: editMenu.large,
          small: editMenu.small,
          category: editMenu.category,
        };
        setOriginalMenuList((prev) =>
          prev.map((menu) => {
            if (menu.id === editMenu.id) {
              return newMenu;
            }
            return menu;
          })
        );
      }
      setEditId(() => null);
      setEditMenu(() => null);
    }
  };

  const customSelectStyles: StylesConfig = {
    valueContainer: (provided) => ({
      ...provided,
      padding: "0 6px",
      fontSize: "0.875rem",
    }),
    input: (provided) => ({
      ...provided,
      margin: "0px",
    }),
    indicatorSeparator: () => ({
      display: "none",
    }),
    menu: (provided) => ({
      ...provided,
      fontSize: "0.875rem",
    }),
    dropdownIndicator: (provided) => ({
      ...provided,
      padding: "8px 0",
    }),
    option: (provided) => ({
      ...provided,
      paddingTop: "4px",
      paddingBottom: "4px",
    }),
  };

  return (
    <>
      <div className="mb-10">未来大オリジナルメニュー 編集・追加</div>
      <div className="grid grid-cols-9 items-center max-w-7xl [&>*]:h-9 [&>*]:grid [&>*]:items-center [&>*]:justify-items-start">
        <div className="col-span-2 font-bold">タイトル</div>
        <div className="font-bold">カテゴリー</div>
        <div className="col-span-2 font-bold">価格</div>
        <div className="font-bold">大</div>
        <div className="font-bold">小</div>
        <div className="font-bold">画像</div>
        <div></div>
        {originalMenuList.map((menu) => (
          <React.Fragment key={menu.id}>
            {editId === menu.id ? (
              <>
                <div className="col-span-2">
                  <input
                    type="text"
                    className="w-11/12 py-1.5 px-0.5 rounded border border-gray-300"
                    name=""
                    id=""
                    value={editMenu?.title}
                    onChange={(e) => {
                      onChange({ title: e.target.value });
                    }}
                  />
                </div>
                <div>
                  <Select
                    options={categoryOptions}
                    defaultValue={getCategoryOption(editMenu?.category)}
                    className="w-3/4"
                    styles={customSelectStyles}
                    onChange={(newValue: unknown) => {
                      try {
                        const option = newValue as Option;
                        onChange({ category: Number(option.value) });
                      } catch {
                        onChange({ category: null });
                      }
                    }}
                  />
                </div>
                <div className="col-span-2">
                  <Select
                    options={getPriceOptions(editMenu?.category)}
                    defaultValue={getPriceOption(editMenu?.price?.id)}
                    className="w-3/4"
                    styles={customSelectStyles}
                    onChange={onPriceChange}
                  />
                </div>
                <div>
                  <input
                    type="checkbox"
                    name=""
                    id=""
                    checked={editMenu?.large}
                    onChange={(e) => {
                      onChange({ large: e.target.checked });
                    }}
                  />
                </div>
                <div>
                  <input
                    type="checkbox"
                    name=""
                    id=""
                    checked={editMenu?.small}
                    onChange={(e) => {
                      onChange({ small: e.target.checked });
                    }}
                  />
                </div>
                <div>{editMenu?.image == "" ? "-" : editMenu?.image}</div>
              </>
            ) : (
              <>
                <div className="col-span-2">{menu.title}</div>
                <div>{getCategoryOption(menu.category)?.label}</div>
                <div className="col-span-2">
                  {getPriceOption(menu.price.id)?.label}
                </div>
                <div>{menu.large ? `あり` : `なし`}</div>
                <div>{menu.small ? `あり` : `なし`}</div>
                <div>{menu.image == "" ? "-" : menu.image}</div>
              </>
            )}
            <div className="grid grid-cols-2 gap-4">
              {editId === menu.id && (
                <>
                  <FaSave className="cursor-pointer" onClick={onSave} />
                  <MdClose
                    onClick={() => onCanceled()}
                    className="cursor-pointer"
                  />
                </>
              )}
              {editId === null && (
                <FaEdit
                  onClick={() => onEdit(menu.id)}
                  className="cursor-pointer"
                />
              )}
            </div>
          </React.Fragment>
        ))}
      </div>
      {loading && (
        <div className="absolute w-screen h-screen top-0 left-0 bg-gray-500 bg-opacity-50 z-50">
          <div className="absolute w-screen h-screen grid items-center text-center text-2xl">
            loading...
          </div>
        </div>
      )}
    </>
  );
};

export default Original;
