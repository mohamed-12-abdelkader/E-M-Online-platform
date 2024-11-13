import { useEffect, useState } from "react";
import baseUrl from "../../api/baseUrl";

const GitGroup = ({ id }) => {
  const token = localStorage.getItem("token");
  const [groups, setGroups] = useState("");
  const [groupsLoading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await baseUrl.get(`api/groups/filter/${id}`, {
          headers: { token: token },
        });
        setGroups(response.data);
      } catch (error) {
        console.log("Error fetching data");
        console.log(error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);
  return [groupsLoading, groups];
};

export default GitGroup;
