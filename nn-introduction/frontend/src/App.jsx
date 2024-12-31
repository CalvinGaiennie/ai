import { BrowserRouter, Routes, Route } from "react-router-dom";
import PreviewTestImages from "./pages/PreviewTestImages";
import Home from "./pages/home";
import TestPerceptron from "./pages/TestPerceptron";
import Nav from "./components/Nav";

function App() {
  return (
    <BrowserRouter>
      <Nav />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/PreviewTestImages" element={<PreviewTestImages />} />
        <Route path="/TestPerceptron" element={<TestPerceptron />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
