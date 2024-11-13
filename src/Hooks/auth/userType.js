import { useEffect, useState } from "react";

const UserType = () => {
  const [userData, setUserData] = useState(
    JSON.parse(localStorage.getItem("user"))
  );
  const [isAdmin, setIsAdmin] = useState();
  const [isTeacher, setIsTeacher] = useState();
  const [student, setStudent] = useState();

  useEffect(() => {
    if (userData != null) {
      if (userData.role === "teacher") {
        setIsAdmin(false);
        setStudent(false);
        setIsTeacher(true);
      } else if (userData.role === "admin") {
        setIsAdmin(true);
        setIsTeacher(false);
        setStudent(false);
      } else {
        setIsAdmin(false);
        setIsTeacher(false);
        setStudent(true);
      }
    }
  }, []);
  return [userData, isAdmin, isTeacher, student];
};

export default UserType;
