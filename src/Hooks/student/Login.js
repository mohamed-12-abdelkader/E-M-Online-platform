import { useState } from "react";

import baseUrl from "../../api/baseUrl";
import { toast } from "react-toastify";

const studentLogin = () => {
  const [mail, setMail] = useState("");
  const [pass, setPass] = useState("");
  const [loading, setLoading] = useState(false);
  
  function generateString() {
    var chars =
      "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    var string = "";
    for (var i = 0; i < 30; i++) {
      var randomIndex = Math.floor(Math.random() * chars.length);
      string += chars[randomIndex];
    }
    return string;
  }

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

      if (!localStorage.getItem("ip")) {
        var generatedString = generateString(); // تأكد من تعريف الدالة generateString()
        localStorage.setItem("ip", generatedString); // استخدم generatedString بدلاً من generateString
      }

      const response = await baseUrl.post(`api/user/login`, {
        mail,
        pass,
        ip: localStorage.getItem("ip"),
      });

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
    
    loading,
  ];
};

export default studentLogin;
