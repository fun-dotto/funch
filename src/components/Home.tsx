// import React from "react";
import { Link } from "react-router-dom";

const Home = () => {
  const today = new Date();
  return (
    <div>
      <div>
        <Link to="/login">
          <button className="text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2">
            ログイン
          </button>
        </Link>
      </div>
      <div>
        <Link to={`/edit/${today.getFullYear()}/${today.getMonth() + 1}`}>
          編集
        </Link>
      </div>
    </div>
  );
};

export default Home;
