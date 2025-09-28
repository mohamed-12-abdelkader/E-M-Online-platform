import { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";

const ProtectedRoute = ({ auth, children }) => {
  const [redirected, setRedirected] = useState(false);
  const location = useLocation();

  useEffect(() => {
    let timer;
    if (!auth && !redirected) {
      timer = setTimeout(() => {
        setRedirected(true);
      }, 100); // زمن التأخير بالميللي ثواني (هنا 2 ثانية)
    }

    return () => clearTimeout(timer);
  }, [auth, redirected]);

  return redirected ? (
    <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname + location.search + location.hash)}`} replace />
  ) : children ? (
    children
  ) : (
    <Outlet />
  );
};

export default ProtectedRoute;
