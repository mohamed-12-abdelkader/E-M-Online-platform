import { useState } from "react";
import baseUrl from "../../api/baseUrl";
import { toast } from "react-toastify";

const BuyLecture = () => {
  const token = localStorage.getItem("token");
  const [buyLoading, setBuyLoading] = useState(false);

  const buyLecture = async (id) => {
    try {
      setBuyLoading(true);
      await baseUrl.put(
        `api/user/buylecture`,
        { l_id: id },
        {
          headers: {
            token: token,
          },
        }
      );

      toast.success("تم  شراء المحاضرة  بنجاح ");

      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch (error) {
      console.error("Error deleting teacher:", error);
      if (error.response.data.msg == "Insufficient funds") {
        toast.error(" رصيدك غير كافى لشراء هذة المحاضرة  ");
      }
    } finally {
      setBuyLoading(false);
    }
  };

  const buyMonth = async (id) => {
    try {
      setBuyLoading(true);
      await baseUrl.put(
        `api/user/buymonth`,
        { m_id: id },
        {
          headers: {
            token: token,
          },
        }
      );

      toast.success("تم  شراء المحاضرة  بنجاح ");

      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch (error) {
      console.error("Error deleting teacher:", error);
      if (error.response.data.msg == "Insufficient funds") {
        toast.error(" رصيدك غير كافى لشراء هذة المحاضرة  ");
      }
    } finally {
      setBuyLoading(false);
    }
  };

  return [buyLoading, buyLecture, buyMonth];
};

export default BuyLecture;
