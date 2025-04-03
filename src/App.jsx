import { useEffect } from "react";
import "./App.css";
import AppRouter from "./Routes/Routes";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";
import { PostsProvider } from "./Hooks/posts/PostsContext.jsx";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

function App() {
  useEffect(() => {
    const handleBeforeUnload = (event) => {
      event.preventDefault();
      event.returnValue = "هل أنت متأكد أنك تريد مغادرة الصفحة؟"; // رسالة تحذيرية
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  return (
    <>
      <QueryClientProvider client={queryClient}>
        <PostsProvider>
          <AppRouter />
          <ToastContainer />
        </PostsProvider>
      </QueryClientProvider>
    </>
  );
}

export default App;
