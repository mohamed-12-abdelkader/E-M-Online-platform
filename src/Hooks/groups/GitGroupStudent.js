import { useEffect, useState } from "react";
import baseUrl from "../../api/baseUrl";

const GitGroupStudent = ({ id }) => {
  const token = localStorage.getItem("token");
  const [students, setStudents] = useState("");
  const [studentLoading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await baseUrl.get(`api/groups/${id}`, {
          headers: { token: token },
        });
        setStudents(response.data);
      } catch (error) {
        console.log("Error fetching data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);
  return [studentLoading, students];
};

export default GitGroupStudent;
