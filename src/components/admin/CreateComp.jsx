import React from "react";
import img from "../../img/th.jpeg";
import { Button, Input } from "@chakra-ui/react";
import { Select } from "@chakra-ui/react";
import useCreateComp from "../../Hooks/comp/useCreateComp";

const CreateComp = () => {
  const [
    handleImagesChange,
    handleSubmit,
    loading,
    grad_id,
    setgrad_id,
    type,
    settype,
    name,
    setname,
    description,
    setdescription,
    start_at,
    setstart_at,
    end_at,
    setend_at,
  ] = useCreateComp();

  return (
    <form
      className='w-[90%] m-auto mt-[50px]'
      onSubmit={handleSubmit} // ربط زر الإرسال بالـ handleSubmit
    >
      {/* رفع الصور */}
      <div style={{ margin: "10px 0", width: "100%" }}>
        <label
          style={{
            width: "100%",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
          htmlFor='upload-photo'
        >
          <h5 className='font-bold'>
            اختر صورة <span style={{ color: "red" }}>المدرس</span>
          </h5>
          <img
            src={img}
            style={{ height: "150px", width: "150px", cursor: "pointer" }}
          />
        </label>
        <input
          type='file'
          name='photo'
          id='upload-photo'
          style={{ display: "none" }}
          multiple
          onChange={(e) => handleImagesChange(Array.from(e.target.files))} // تمرير الصور
        />
      </div>

      {/* اختيار الصف */}
      <h1 className='my-2 font-bold'>اختر صف المسابقة</h1>
      <Select
        placeholder='اختر الصف'
        dir='ltr'
        value={grad_id}
        onChange={(e) => setgrad_id(e.target.value)} // تحديث grad_id
      >
        <option value='1'>الصف الاول الثانوي</option>
        <option value='2'>الصف الثاني الثانوي</option>
        <option value='3'>الصف الثالث الثانوي</option>
      </Select>

      {/* نوع المسابقة */}
      <h1 className='my-2 font-bold'>نوع المسابقة</h1>
      <Input
        placeholder='نوع المسابقة'
        size='lg'
        value={type}
        onChange={(e) => settype(e.target.value)} // تحديث type
      />

      {/* اسم المسابقة */}
      <h1 className='my-2 font-bold'>اسم المسابقة</h1>
      <Input
        placeholder='اسم المسابقة'
        size='lg'
        value={name}
        onChange={(e) => setname(e.target.value)} // تحديث name
      />

      {/* وصف المسابقة */}
      <h1 className='my-2 font-bold'>وصف المسابقة</h1>
      <Input
        placeholder='وصف المسابقة'
        size='lg'
        value={description}
        onChange={(e) => setdescription(e.target.value)} // تحديث description
      />

      {/* تاريخ البدء */}
      <h1 className='my-2 font-bold'>تاريخ البدء</h1>
      <Input
        placeholder='تاريخ البدء'
        size='lg'
        value={start_at}
        onChange={(e) => setstart_at(e.target.value)} // تحديث start_at
      />

      {/* تاريخ الانتهاء */}
      <h1 className='my-2 font-bold'>تاريخ الانتهاء</h1>
      <Input
        placeholder='تاريخ الانتهاء'
        size='lg'
        value={end_at}
        onChange={(e) => setend_at(e.target.value)} // تحديث end_at
      />

      {/* زر الإرسال */}
      <div className='my-4 text-center'>
        <Button colorScheme='blue' type='submit' isLoading={loading}>
          انشاء المسابقة
        </Button>
      </div>
    </form>
  );
};

export default CreateComp;
