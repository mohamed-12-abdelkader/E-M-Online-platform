import { Link, useParams } from "react-router-dom";
import GitGroup from "../../Hooks/groups/GitGroup";
import { Skeleton, Stack } from "@chakra-ui/react";
import ScrollToTop from "../../components/scollToTop/ScrollToTop";
import { GoArrowLeft } from "react-icons/go";
const Groups = () => {
  const { id } = useParams();
  const [groupsLoading, groups] = GitGroup({ id: id });

  if (groupsLoading) {
    return (
      <Stack className="w-[90%] m-auto my-9">
        <div className="flex justify-center mt-5">
          <div className="ribbon2">
            <h1 className="font-bold m-4 text-white text-center">
              {id == 1
                ? "مجموعات الصف الاول الثانوى "
                : id == 2
                ? "مجموعات الصف الثانى الثانوى  "
                : id == 3
                ? "مجموعات الصف الثالث اثانوى "
                : ""}
            </h1>
          </div>
        </div>
        <Skeleton height="20px" className="mt-5" />
        <Skeleton height="20px" />
        <Skeleton height="20px" />
        <Skeleton height="20px" />
        <Skeleton height="20px" />
      </Stack>
    );
  }
  return (
    <div className="m-4">
      <div className="flex justify-center">
        <div className="ribbon2">
          <h1 className="font-bold m-4 text-white text-center">
            {id == 1
              ? "مجموعات الصف الاول الثانوى "
              : id == 2
              ? "مجموعات الصف الثانى الثانوى  "
              : id == 3
              ? "مجموعات الصف الثالث اثانوى "
              : ""}
          </h1>
        </div>
      </div>
      <div>
        {groups.length > 0 ? (
          <div className="my-[30px] flex flex-wrap justify-center">
            {groups.map((group) => (
              <Link key={group.id} to={`/group/${group.id}`}>
                <div className="h-[50px] w-[250px] p-3 bg-white border shadow my-5 flex justify-center mx-2">
                  <h1 className="font-bold text-black">{group.group_name}</h1>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="w-[90] m-auto h-[70px] border shadow flex justify-center items-center my-9">
            <h1 className="font-bold flex">
              لا يوجد مجموعات فى هذا الصف{" "}
              <GoArrowLeft className="m-1 text-xl text-red-500" />
              <Link to={"/admin/create_group"}>
                <span className="text-red-500"> انشئ مجموعة الان </span>
              </Link>
            </h1>
          </div>
        )}
      </div>
      <ScrollToTop />
    </div>
  );
};

export default Groups;
