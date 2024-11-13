const MonthHeader = ({ image, description, noflecture }) => (
  <div className="max-w-7xl mx-auto px-4 mt-[80px] mb-[80px] w-[90%] m-auto flex flex-col md:flex-row items-center justify-between py-8 bg-gray-100 rounded-lg shadow-lg">
    {/* قسم الصورة */}
    <div className="flex justify-center items-center w-full p-3 md:w--[350px] mb-6 md:mb-0">
      <img
        src={image}
        className="rounded-lg  h-[300px] md:h-[400px] mx-3 object-contain" // هنا التعديل
        alt="Image"
      />
    </div>
    {/* قسم المعلومات */}
    <div className="md:w-1/2 flex flex-col justify-center items-center space-y-4">
      <div className="flex items-center bg-yellow-500 shadow-md rounded-lg p-4 w-[250px]">
        <h1 className="text-xl font-bold text-white text-center w-full">
          {description}
        </h1>
      </div>
      <div className="flex items-center bg-red-500 shadow-md rounded-lg p-4 w-[300px] md:w-[250px]">
        <h1 className="text-xl font-bold text-white text-center w-full">
          عدد المحاضرات: {noflecture}
        </h1>
      </div>
    </div>
  </div>
);

export default MonthHeader;
