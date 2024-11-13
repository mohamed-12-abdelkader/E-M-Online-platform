import { ListItem, UnorderedList } from "@chakra-ui/react";
import { Zoom, Fade } from "react-awesome-reveal";
const SectionThree = () => {
  return (
    <div className="my-[70px]">
      <div className="w-[90%] m-auto md:flex justify-between">
        <div className="">
          <div className="flex justify-center">
            <h1 className="fonts font-bold text-xl"> ماذا نقدم للمدرس ؟</h1>
          </div>

          <div className="mt-[50px]">
            <UnorderedList>
              <Zoom>
                <ListItem className="font-bold m-1">
                  التحكم الكامل فى المنصة وادارة المحاضرات
                </ListItem>
                <ListItem className="font-bold m-1">
                  انشاء مجموعات دراسية لطلبة السنتر
                </ListItem>
                <ListItem className="font-bold m-1">
                  توفر المنصة التدريب للمدرسين مما يطور من مهاراتهم للقيام
                  بعملية التعليم عن بعد.
                </ListItem>
                <ListItem className="font-bold m-1">
                  دعم فنى خلال ال 24 ساعة
                </ListItem>
              </Zoom>
            </UnorderedList>
          </div>
        </div>

        <div>
          <Fade>
            <img src="vector2-480x291.png" className="h-[250px]" />
          </Fade>
        </div>
      </div>
    </div>
  );
};

export default SectionThree;
