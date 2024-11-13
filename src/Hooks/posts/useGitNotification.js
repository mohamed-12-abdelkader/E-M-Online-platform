import { useEffect, useState } from "react";
import baseUrl from "../../api/baseUrl";

const useGitNotification = () => {
  const token = localStorage.getItem("token");
  const [notifications, setnotifications] = useState("");
  const [notificationsLoading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await baseUrl.get(`api/posts/status/notifications`, {
          headers: { token: token },
        });
        setnotifications(response.data);
      } catch (error) {
        console.log("Error fetching data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);
  return [notificationsLoading, notifications];
};

export default useGitNotification;
