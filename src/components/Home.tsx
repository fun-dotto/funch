// import React from "react";
import { onAuthStateChanged, signInWithPopup } from "firebase/auth";
import { useContext, useEffect } from "react";
import { FaGoogle } from "react-icons/fa";
import { Link } from "react-router-dom";
import { auth, provider } from "../infrastructure/firebase";
import { UserContext } from "./providers/FunchUser";

const Home = () => {
  const { user, setUser } = useContext(UserContext);

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
      await signInWithPopup(auth, provider).then((result) => {
        const user = result.user;
        if (!user.email?.endsWith("@fun.ac.jp")) {
          handleLogout();
          alert("fun.ac.jpのアカウントでログインしてください");
        }
      });
    } catch (error) {
      console.error(error);
    }
  };

  const today = new Date();
  return (
    <div className="view">
      {user ? (
        // ログインしている場合の表示
        <>
          <div>
            <p>{user.email} でログイン中</p>
            <button
              type="button"
              className="text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2"
              onClick={handleLogout}
            >
              ログアウト
            </button>
          </div>
          <div>
            <Link to={`/edit/${today.getFullYear()}/${today.getMonth() + 1}`}>
              <button
                type="button"
                className="text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2"
              >
                編集
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
};

export default Home;
