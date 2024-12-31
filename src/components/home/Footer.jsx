import React from "react";
import { FaFacebook, FaYoutube, FaTiktok } from "react-icons/fa";
const Footer = () => {
  return (
    <div className='h-[300px] w-[100%] bg-[#03a9f5] flex flex-col justify-center items-center text-white'>
      {/* الجملة التعليمية */}
      <h1 className='text-2xl font-bold mb-4'>
        مرحبًا بك في مجتمع <span className='text-[#ff5722]'>E-M Online</span>{" "}
        التعليمي، حيث يبدأ طريقك نحو النجاح!
      </h1>

      {/* روابط وسائل التواصل الاجتماعي */}
      <div className='flex   '>
        <a
          href='https://www.facebook.com/profile.php?id=61556280021487&mibextid=kFxxJD'
          target='_blank'
          rel='noopener noreferrer'
          className='text-3xl hover:text-gray-200 mx-2'
        >
          <FaFacebook />
        </a>
        <a
          href='https://youtube.com/@mostafaghost9046?si=JNjXytRrD92TuzR_'
          target='_blank'
          rel='noopener noreferrer'
          className='text-3xl hover:text-gray-200 mx-2'
        >
          <FaYoutube />
        </a>
        <a
          href='https://www.tiktok.com/@e_m_online?_r=1&_d=ei334d9a1m0bii&sec_uid=MS4wLjABAAAAMgxPqNhKqZUBi01sBnm0qBC5mjF4k6Sm1GbYSfe95JajVy5U4smD5Uh21-GwaUzO&share_author_id=6678574675599049733&sharer_language=ar&source=h5_m&u_code=d5h7mii3hiaj8g&timestamp=1735542055&user_id=6678574675599049733&sec_user_id=MS4wLjABAAAAMgxPqNhKqZUBi01sBnm0qBC5mjF4k6Sm1GbYSfe95JajVy5U4smD5Uh21-GwaUzO&utm_source=copy&utm_campaign=client_share&utm_medium=android&share_iid=7453963791228897030&share_link_id=7e54a0d9-9ec3-47be-9815-fe84927dd0e3&share_app_id=1233&ugbiz_name=ACCOUNT&social_share_type=5&enable_checksum=1'
          target='_blank'
          rel='noopener noreferrer'
          className='text-3xl hover:text-gray-200'
        >
          <FaTiktok />
        </a>
      </div>
    </div>
  );
};

export default Footer;
