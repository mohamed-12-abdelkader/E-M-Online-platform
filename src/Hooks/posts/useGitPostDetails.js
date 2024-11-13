import { useEffect, useState } from "react";
import baseUrl from "../../api/baseUrl";

const useGitPostDetails = ({ id }) => {
  const token = localStorage.getItem("token");
  const [postDetails, setpostDetails] = useState("");
  const [postDetailsLoading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await baseUrl.get(`api/posts/${id}`, {
          headers: { token: token },
        });
        setpostDetails(response.data);
      } catch (error) {
        console.log("Error fetching data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);
  return [postDetailsLoading, postDetails];
};

export default useGitPostDetails;
