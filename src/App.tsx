import { Routes, Route } from "react-router-dom";
import Layout from "@/components/Layout";
import SchedulePage from "@/pages/SchedulePage";
import MapPage from "@/pages/MapPage";
import BadgePage from "@/pages/BadgePage";
import PlaygroundPage from "@/pages/TonkPlayground";
import MetaPage from "@/pages/MetaPage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route path="/" element={<SchedulePage />} />
        <Route path="/map" element={<MapPage />} />
        <Route path="/badge" element={<BadgePage />} />
        <Route path="/tonk-playground" element={<PlaygroundPage />} />
        <Route path="/meta" element={<MetaPage />} />
      </Route>
    </Routes>)

}

export default App
