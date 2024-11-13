import { useEffect, useState } from "react";
import baseUrl from "../../api/baseUrl";

const GitMonthDetails = ({ id }) => {
  const token = localStorage.getItem("token");
  const [stMonth, setMonths] = useState([]);
  const [stMonthLoading, setLoading] = useState(false);
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await baseUrl.get(`api/month/monthinfo/${id}`, {
          headers: { token: token },
        });
        setMonths(response.data);
      } catch (error) {
        console.log("Error fetching data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);
  return [stMonth, stMonthLoading];
};

export default GitMonthDetails;
