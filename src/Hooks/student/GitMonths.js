import { useEffect, useState } from "react";
import baseUrl from "../../api/baseUrl";

const GitMonthes = ({ id }) => {
  const token = localStorage.getItem("token");
  const [monthes, setLecture] = useState("");
  const [monthesLoading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await baseUrl.get(`api/month/teacher/${id}`, {
          headers: { token: token },
        });
        setLecture(response.data);
      } catch (error) {
        console.log("Error fetching data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);
  return [monthes, monthesLoading];
};

export default GitMonthes;
