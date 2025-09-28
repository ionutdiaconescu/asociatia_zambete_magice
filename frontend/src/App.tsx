import "./App.css";
import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import { Suspense, lazy } from "react";
import Home from "./pages/Home"; // keep Home eagerly loaded (landing)
const Campaigns = lazy(() => import("./pages/Campaigns"));
const CampaignDetail = lazy(() => import("./pages/CampaignDetail"));
const About = lazy(() => import("./pages/About"));
const Contact = lazy(() => import("./pages/Contact"));
const DonateSuccess = lazy(() => import("./pages/DonateSuccess"));
const DonateCancel = lazy(() => import("./pages/DonateCancel"));
const Donate = lazy(() => import("./pages/Donate"));
const NotFound = lazy(() => import("./pages/NotFound"));

function App() {
  return (
    <Suspense
      fallback={
        <div
          className="py-24 px-4 text-center text-sm text-gray-600"
          aria-busy="true"
        >
          Se încarcă pagina...
        </div>
      }
    >
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="campaigns" element={<Campaigns />} />
          <Route path="campaigns/:slug" element={<CampaignDetail />} />
          <Route path="about" element={<About />} />
          <Route path="contact" element={<Contact />} />
          <Route path="donate" element={<Donate />} />
          <Route path="donate/success" element={<DonateSuccess />} />
          <Route path="donate/cancel" element={<DonateCancel />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </Suspense>
  );
}

export default App;
