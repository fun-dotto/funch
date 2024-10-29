// import React from "react";

import { FaGoogle } from "react-icons/fa";
import { auth, provider } from "../infrastructure/firebase";
import { signInWithPopup } from "firebase/auth";

const Login = () => {
  const signInwithGoogle = async () => {
    try {
      await signInWithPopup(auth, provider); // FirebaseのsignInWithPopupメソッドを使用してGoogleアカウントでのサインインを試行
      // handleClose(); // モーダルを閉じる
    } catch (error) {
      console.error(error); // エラーをコンソールに出力
    }
  };

  return (
    <div className="view">
      <FaGoogle onClick={signInwithGoogle} />
    </div>
  );
};

export default Login;
