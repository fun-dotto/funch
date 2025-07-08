import "./App.css";
import { BrowserRouter, Route, Routes, Link } from "react-router-dom";
import Home from "./components/Home";
import Edit from "./components/Edit";
import Original from "./components/Original";
import Price from "./components/Price";

function App() {
  return (
    <>
      <BrowserRouter>
        <div>
          <Link to="/">ホーム</Link>
        </div>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/edit/:year/:month" element={<Edit />}></Route>
          <Route path="/original" element={<Original />}></Route>
          <Route path="/price" element={<Price />}></Route>
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
