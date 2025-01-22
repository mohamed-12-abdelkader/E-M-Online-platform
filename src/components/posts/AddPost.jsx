import { useState } from "react";
import { Button, FormControl, Input, Spinner } from "@chakra-ui/react";
import { IoSend } from "react-icons/io5";
import img from "../../img/Ivw7nhRtXyo (1).png";
import { toast } from "react-toastify";
import baseUrl from "../../api/baseUrl";
import useAddPost from "../../Hooks/posts/useAddPost";

const MultipleImageInput = ({ onImagesChange }) => {
  const [images, setImages] = useState([]);

  const handleImageChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setImages(selectedFiles);
    onImagesChange(selectedFiles); // Pass images to parent component
  };

  return (
    <>
      <div style={{ margin: "10px 0" }}>
        <label
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
          htmlFor='upload-photo'
        >
          <img
            src={img}
            alt='Upload'
            style={{ height: "30px", width: "30px", cursor: "pointer" }}
            className='my-4 mx-2'
          />
        </label>
        <input
          type='file'
          name='photo'
          id='upload-photo'
          multiple
          onChange={handleImageChange}
          style={{ display: "none" }}
        />

        {/* Display selected image previews */}
        <div className='my-4'>
          {images.length > 0 && (
            <div>
              <h3 className='font-semibold'>الصور المختارة:</h3>
              <div className='flex flex-wrap'>
                {images.map((image, index) => (
                  <img
                    key={index}
                    src={URL.createObjectURL(image)}
                    alt={`Selected ${index}`}
                    className='m-2'
                    style={{
                      width: "50px",
                      height: "50px",
                      borderRadius: "5px",
                    }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

const AddPost = () => {
  const [handleImagesChange, handleSubmit, loading, content, setContent] =
    useAddPost();
  const user = JSON.parse(localStorage.getItem("user"));
  console.log(user);
  return (
    <div className='my-5 md:px-5'>
      <div className='flex md:w-[85%] m-auto'>
        {/* MultipleImageInput Component */}
        <MultipleImageInput onImagesChange={handleImagesChange} />

        <FormControl mt='4' className='mx-2'>
          <textarea
            value={content}
            onChange={(e) => {
              setContent(e.target.value);
              e.target.style.height = "auto"; // إعادة التعيين لتجنب زيادة الطول المتكررة
              e.target.style.height = `${e.target.scrollHeight}px`; // ضبط الارتفاع بناءً على النص
            }}
            placeholder='اكتب سؤالك ...........'
            className='w-full p-2 rounded-lg border border-gray-300'
            style={{
              borderRadius: "20px",
              resize: "none", // منع المستخدم من تغيير الحجم يدويًا
              overflowY: "auto", // إضافة التمرير العمودي عند الحاجة
              height: "50px", // ارتفاع ابتدائي
              maxHeight: "200px", // الحد الأقصى للارتفاع
            }}
          />
        </FormControl>

        <Button
          colorScheme='blue'
          ml={3}
          className='my-6 mx-2'
          onClick={handleSubmit}
          isDisabled={!content || loading}
        >
          {loading ? <Spinner /> : <IoSend />}
        </Button>
      </div>
      {user.role == null ? (
        <div className='text-center'>
          <h1 className='text-xl font-bold '>كود الطالب :{user.id}</h1>
        </div>
      ) : null}
    </div>
  );
};

export default AddPost;
