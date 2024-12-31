import ScrollToTop from "../../components/scollToTop/ScrollToTop";
import Lectures from "../../components/lecture/Lectures";

const MyLecture = () => {
  return (
    <div className='mt-[] mb-[50px]' style={{ minHeight: "60vh" }}>
      <div className='p-1'>
        <Lectures />
      </div>
      <ScrollToTop />
    </div>
  );
};

export default MyLecture;
