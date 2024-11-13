const NotFound = () => {
  return (
    <div
      className="mt-[100px] flex justify-center items-center"
      style={{ minHeight: "80vh" }}
    >
      <div>
        <div>
          <h1 className="big-font md:text-3xl"> ! 404 NOT FOUND </h1>
        </div>
        <p className=" h-2 bg-blue-400 my-3 w-[90%] m-auto  md:w-[430px]"></p>
        <h1 className="font-bold ">عذرا هذة الصفحة ليست موجودة على المنصة</h1>
      </div>
    </div>
  );
};

export default NotFound;
