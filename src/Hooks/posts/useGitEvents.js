import { useEffect, useState } from "react";
import baseUrl from "../../api/baseUrl";

const useGitEvents = () => {
  const token = localStorage.getItem("token");
  const [events, setevents] = useState("");
  const [eventsLoading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await baseUrl.get(
          `api/posts/status/notifications/events`,
          {
            headers: { token: token },
          }
        );
        setevents(response.data);
      } catch (error) {
        console.log("Error fetching data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);
  return [eventsLoading, events];
};

export default useGitEvents;
