import React, { useEffect } from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { ChakraProvider } from "@chakra-ui/react";
import { BrowserRouter as Router, useLocation } from "react-router-dom";
import Footer from "./components/Footer/Footer.jsx";
import "react-toastify/dist/ReactToastify.css";
import WhatsButton from "./components/whatsButton/WhatsButton.jsx";
import SidebarWithHeader from "./components/navbar/Navbar.jsx";
import BottomNavItems from "./components/Footer/BottomNavItems.jsx";
import UserType from "./Hooks/auth/userType.js";

const RootContent = () => {
  // Get the current location to determine the current path
  const location = useLocation();
  const [userData, isAdmin, isTeacher, student] = UserType();

  useEffect(() => {
    const overlay = document.getElementById("overlay");

    const onVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        overlay.style.display = "block";
      } else {
        overlay.style.display = "none";
      }
    };

    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, []);

  // Only display the SidebarWithHeader if the current path is not '/landing'
  const showSidebar = location.pathname !== "/landing";
  const hasUser = Boolean(userData);
  const showBottomNav = userData && location.pathname.toLowerCase() !== "/teacherchat";

  return (
    <>
      <div id="overlay" className="overlay"></div>
      {showSidebar && <SidebarWithHeader />}
      <App />
      <WhatsButton />
      {showBottomNav && <BottomNavItems />}
    </>
  );
};

const Root = () => (
  <React.StrictMode>
    <ChakraProvider>
      <Router>
        <RootContent />
      </Router>
    </ChakraProvider>
  </React.StrictMode>
);

ReactDOM.createRoot(document.getElementById("root")).render(<Root />);
