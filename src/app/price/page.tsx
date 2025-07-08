"use client";

import { redirect } from "next/navigation";
import { auth, database } from "../../infrastructure/firebase";
import { useEffect, useState } from "react";
import {
  collection,
  deleteField,
  doc,
  getDocs,
  orderBy,
  query,
  updateDoc,
} from "firebase/firestore";
import { FaEdit, FaSave } from "react-icons/fa";
import { MdClose } from "react-icons/md";
import { PriceModel } from "../../repository/price";
import React from "react";

export default function Price() {
  const [loading, setLoading] = useState(true);
  const [priceList, setPriceList] = useState<PriceModel[]>([]);
  const [editId, setEditId] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState<PriceModel | null>(null);
  const user = auth.currentUser;
  if (user == null) {
    redirect("/");
  }

  useEffect(() => {
    const fetchData = async () => {
      const docRef = query(
        collection(database, "funch_price"),
        orderBy("medium", "desc")
      );
      const docSnap = await getDocs(docRef);
      const newPriceList: PriceModel[] = [];
      docSnap.forEach((doc) => {
        const data = doc.data();
        const id = doc.id;
        const small = data.small;
        const medium = data.medium;
        const large = data.large;
        const categories = data.categories as number[];
        newPriceList.push({ id, small, medium, large, categories });
      });
      setPriceList(() => newPriceList);
      await new Promise((resolve) => setTimeout(resolve, 300));
      setLoading(() => false);
    };
    fetchData();
  }, []);

  const onEdit = (price: PriceModel) => {
    setEditId(price.id);
    setEditPrice({ ...price });
  };

  const onCanceled = () => {
    setEditId(null);
  };

  const onSave = async () => {
    if (editPrice != null) {
      const editRef = doc(database, "funch_price", editPrice.id);
      const s = editPrice.small;
      const l = editPrice.large;
      await updateDoc(editRef, {
        small: s == 0 || s == undefined ? deleteField() : s,
        medium: editPrice.medium,
        large: l == 0 || l == undefined ? deleteField() : l,
      });
      editPrice.small = s == 0 || s == undefined ? undefined : s;
      editPrice.large = l == 0 || l == undefined ? undefined : l;
      setPriceList((prev) =>
        prev.map((price) => {
          if (price.id === editPrice.id) {
            return { ...editPrice };
          }
          return price;
        })
      );
      setEditId(() => null);
      setEditPrice(() => null);
    }
  };
  const priceListOnCategory = (categories: number[]) => {
    return priceList.filter((price) => {
      return price.categories.some((category) => categories.includes(category));
    });
  };
  const priceCategory = [
    { categories: [1], name: "主菜" },
    { categories: [4, 5], name: "丼物・カレー" },
    { categories: [11], name: "麺類" },
  ];

  return (
    <>
      <div className="mb-8">価格変更</div>
      {priceCategory.map((category) => {
        return (
          <React.Fragment key={category.name}>
            <h2 className="mt-4">{category.name}</h2>
            <div className="flex flex-col w-80">
              <div className="grid grid-cols-4 items-center gap-1 p-2">
                <div className="w-16">小</div>
                <div className="w-16">中</div>
                <div className="w-16">大</div>
                <div className="w-16"></div>
              </div>
              {priceListOnCategory(category.categories).map((price) => {
                return (
                  <div
                    key={price.id}
                    className="grid grid-cols-4 items-center gap-1 p-2"
                  >
                    <div className="w-16">
                      {editId === price.id ? (
                        <input
                          type="number"
                          min={0}
                          value={editPrice?.small}
                          className="w-14"
                          onChange={(e) => {
                            if (editPrice != null)
                              setEditPrice((prev) => {
                                if (prev == null) return prev;
                                return {
                                  ...prev,
                                  small: Number(e.target.value),
                                };
                              });
                          }}
                        />
                      ) : (
                        price.small
                      )}
                    </div>
                    <div className="w-16">
                      {editId === price.id ? (
                        <input
                          type="number"
                          min={0}
                          value={editPrice?.medium}
                          className="w-14"
                          onChange={(e) => {
                            if (editPrice != null)
                              setEditPrice((prev) => {
                                if (prev == null) return prev;
                                return {
                                  ...prev,
                                  medium: Number(e.target.value),
                                };
                              });
                          }}
                        />
                      ) : (
                        price.medium
                      )}
                    </div>
                    <div className="w-16">
                      {editId === price.id ? (
                        <input
                          type="number"
                          min={0}
                          value={editPrice?.large}
                          className="w-14"
                          onChange={(e) => {
                            if (editPrice != null)
                              setEditPrice((prev) => {
                                if (prev == null) return prev;
                                return {
                                  ...prev,
                                  large: Number(e.target.value),
                                };
                              });
                          }}
                        />
                      ) : (
                        price.large
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-12">
                      {editId === price.id && (
                        <>
                          <FaSave
                            className="cursor-pointer"
                            onClick={async () => onSave()}
                          />
                          <MdClose
                            onClick={() => onCanceled()}
                            className="cursor-pointer"
                          />
                        </>
                      )}
                      {editId == null && (
                        <FaEdit
                          onClick={() => onEdit(price)}
                          className="cursor-pointer"
                        />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </React.Fragment>
        );
      })}

      {loading && (
        <div className="absolute w-screen h-screen top-0 left-0 bg-gray-500 bg-opacity-50 z-50">
          <div className="absolute w-screen h-screen grid items-center text-center text-2xl">
            loading...
          </div>
        </div>
      )}
    </>
  );
}
