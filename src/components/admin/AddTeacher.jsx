import { Input, Select, Checkbox, Button, Spinner } from "@chakra-ui/react";
import useAddTeacher from "../../Hooks/admin/AddTeacher";

const AddTeacher = () => {
  const [
    name,
    setName,
    onImageChange,

    img,
    mail,
    setMail,
    pass,
    setPass,

    setSubject,
    description,
    setDescription,

    facebook,
    setFacebook,
    tele,
    setTele,
    handleCheckboxChange,
    handleSubmit,
    loading,
  ] = useAddTeacher();

  return (
    <div>
      <div>
        <h1 className='text-center font-bold text-xl '>اضافة مدرس جديد</h1>
      </div>
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
            {" "}
            اختر صورة <span style={{ color: "red" }}> المدرس </span>
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
          onChange={onImageChange}
        />
      </div>
      <div className='my-3'>
        <h1 className='my-2 font-bold'> اسم المدرس </h1>
        <Input
          placeholder='اسم المدرس '
          size='lg'
          value={name}
          onChange={(e) => {
            setName(e.target.value);
          }}
        />
      </div>
      <div className='my-3'>
        <h1 className='my-2 font-bold'> ايميل المدرس </h1>
        <Input
          placeholder='ايميل المدرس '
          size='lg'
          value={mail}
          onChange={(e) => {
            setMail(e.target.value);
          }}
        />
      </div>
      <div className='my-3'>
        <h1 className='my-2 font-bold'> كلمة سر المدرس </h1>
        <Input
          placeholder='كلمة سر المدرس '
          size='lg'
          value={pass}
          onChange={(e) => {
            setPass(e.target.value);
          }}
        />
      </div>

      <div className='my-3'>
        <h1 className='my-2 font-bold'> وصف للمدرس </h1>
        <Input
          placeholder='وصف للمدرس  '
          size='lg'
          value={description}
          onChange={(e) => {
            setDescription(e.target.value);
          }}
        />
      </div>
      <div className=' md:flex flex-wrap'>
        <div className='m-3'>
          <h1 className='my-2 font-bold'> تليجرام المدرس </h1>
          <Input
            placeholder='تليجرام المدرس '
            size='lg'
            value={tele}
            onChange={(e) => {
              setTele(e.target.value);
            }}
          />
        </div>
        <div className='m-3'>
          <h1 className='my-2 font-bold'> فيس المدرس </h1>
          <Input
            placeholder='فيس المدرس '
            size='lg'
            value={facebook}
            onChange={(e) => {
              setFacebook(e.target.value);
            }}
          />
        </div>
        <div className='my-3'>
          <h1 className='my-2 font-bold'> يوتيوب المدرس </h1>
          <Input placeholder='يوتيوب المدرس ' size='lg' />
        </div>
      </div>
      <div>
        <h1 className='my-2 font-bold'>اختر مادة المدرس</h1>
        <Select
          placeholder='اختر مادة المدرس '
          size='lg'
          style={{ direction: "ltr" }}
          onChange={(e) => {
            setSubject(e.target.value);
          }}
        >
          <option value={"لغة عربية "}>لغة عربية </option>
          <option value={"English"}>لغة انجليزية </option>
          <option value={"French"}>لغة فرنسية </option>
          <option value={"فيزياء "}>فيزياء</option>
          <option value={"كيمياء "}>كيمياء</option>
          <option value={"احياء "}>احياء </option>
          <option value={"جيولوجيا "}>جيولوجيا </option>
          <option value={"تاريخ"}>تاريخ </option>
          <option value={"جغرفيا  "}>جغرافيا </option>
          <option value={" فلسفة ومنطق   "}>فلسفة </option>
          <option value={"علم نفس واجتماع  "}>علم نفس </option>
          <option value={"رياضيات  "}> رياضيات </option>
        </Select>
      </div>
      <div>
        <h1 className='my-2 font-bold'>اختر صفوف المدرس </h1>
        <div className='flex flex-wrap'>
          <Checkbox
            value={1}
            className='m-3'
            onChange={() => handleCheckboxChange(1)}
          >
            الصف الاول الثانوى
          </Checkbox>
          <Checkbox
            value={2}
            className='m-3'
            onChange={() => handleCheckboxChange(2)}
          >
            الصف الثانى الثانوى
          </Checkbox>
          <Checkbox
            value={3}
            className='m-3'
            onChange={() => handleCheckboxChange(3)}
          >
            الصف الثالث الثانوى
          </Checkbox>
          <Checkbox
            value={4}
            className='m-3'
            onChange={() => handleCheckboxChange(4)}
          >
            الصف الاول الاعدادى
          </Checkbox>
          <Checkbox
            value={5}
            className='m-3'
            onChange={() => handleCheckboxChange(5)}
          >
            الصف الثانى الاعدادى
          </Checkbox>
          <Checkbox
            value={6}
            className='m-3'
            onChange={() => handleCheckboxChange(6)}
          >
            الصف الثالث الاعدادى
          </Checkbox>
          <Checkbox
            value={7}
            className='m-3'
            onChange={() => handleCheckboxChange(7)}
          >
            كورسات اخرى
          </Checkbox>
        </div>
      </div>

      <div className='text-center mt-3'>
        <Button colorScheme='blue' onClick={handleSubmit}>
          {loading ? <Spinner /> : "  اضافة المدرس"}
        </Button>
      </div>
    </div>
  );
};

export default AddTeacher;
