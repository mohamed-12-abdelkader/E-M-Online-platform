import { useEffect, useState } from "react";
import baseUrl from "../../api/baseUrl";

const GitMyLecture = () => {
  const token = localStorage.getItem("token");
  const [myLecture, setMyLecture] = useState("");
  const [myLectureLoading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await baseUrl.get("api/user/mylecture", {
          headers: { token: token },
        });
        setMyLecture(response.data);
      } catch (error) {
        console.log("Error fetching data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);
  return [myLectureLoading, myLecture];
};

export default GitMyLecture;
