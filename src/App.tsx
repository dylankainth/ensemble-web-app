import { Routes, Route } from "react-router-dom";
import Layout from "@/components/Layout";
import SchedulePage from "@/pages/SchedulePage";
import MapPage from "@/pages/MapPage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route path="/" element={<SchedulePage />} />
        <Route path="/map" element={<MapPage />} />

      </Route>
    </Routes>)

}

export default App
