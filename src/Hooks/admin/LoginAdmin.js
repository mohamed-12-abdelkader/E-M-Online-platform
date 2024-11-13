import { useState } from "react";

import baseUrl from "../../api/baseUrl";
import { toast } from "react-toastify";

const LoginAdmin = () => {
  const [mail, setMail] = useState("");
  const [pass, setPass] = useState("");
  const [loading, setLoading] = useState(false);
  const [userType, setUserType] = useState("user"); // افتراضياً نوع المستخدم عادي

  const mailChange = (e) => {
    setMail(e.target.value);
  };

  const passChange = (e) => {
    setPass(e.target.value);
  };

  const handleLogin = async (e) => {
    if (!mail || !pass) {
      toast.warn("يجب ادخال جميع البيانات ");
    }
    e.preventDefault();

    try {
      setLoading(true);

      const response = await baseUrl.post(`api/admin/login`, { mail, pass });

      // هنا يمكنك إضافة المنطق الخاص بعملية تسجيل الدخول

      localStorage.setItem("token", response.data.token);
      localStorage.setItem(
        "user",
        JSON.stringify(response.data.Data || response.data.data)
      );

      // يمكنك إظهار رسالة نجاح باستخدام toast
      console.log(response);
      toast.success("تم تسجيل الدخول بنجاح");
      setTimeout(() => {
        window.location.href = "/";
      }, 500);
    } catch (error) {
      // يمكنك إظهار رسالة خطأ باستخدام toast
      toast.error("بيانات المستخدم غير صحيحة ");

      if (error.response.data.msg == "You must login from the same device") {
        toast.error("لقد تجاوزت الحد المسموح لك من الاجهزة ");
        return;
      } else if (error.response.data.msg == " Invalid username or password") {
        toast.error("بيانات المستخدم غير صحيحة ");
        return;
      }
    } finally {
      setLoading(false);
      setMail("");
      setPass("");
    }
  };

  return [
    handleLogin,
    passChange,
    mailChange,
    mail,
    pass,
    userType,
    setUserType,
    loading,
  ];
};

export default LoginAdmin;
