import React from "react";
import { Box, Skeleton, VStack, Text, Center, Button } from "@chakra-ui/react";
import CompCard from "../../components/competitions/CompCard";
import useGitComps from "../../Hooks/student/competition/useGitComps";
import { CoursesCard } from "../../ui/card/CoursesCard";

const CompetitionSkeleton = () => {
  return (
    <Box
      w='280px'
      h='400px'
      m='4'
      p='4'
      bg='white'
      borderRadius='md'
      boxShadow='md'
    >
      {/* صورة مكان الكارد */}
      <Skeleton height='200px' borderRadius='md' />
      {/* النصوص */}
      <VStack align='start' spacing='4' mt='4'>
        <Skeleton height='20px' width='60%' />
        <Skeleton height='16px' width='80%' />
        <Skeleton height='16px' width='40%' />
      </VStack>
    </Box>
  );
};

const Competitions = () => {
  const [compsLoading, comps, refetchComps] = useGitComps();
  console.log(comps);
  return (
    <div className='w-[90%] m-auto'>
      <div className='text-center mt-[50px]'>
        <h1 className='text-xl font-bold'>المسابقات المتاحة </h1>
      </div>
      <Box
        display='flex'
        justifyContent='center'
        w='95%'
        mx='auto'
        my='50px'
        mb='120px'
      >
        <Box display='flex' flexWrap='wrap' justifyContent='start'>
          {compsLoading ? (
            Array.from({ length: 6 }).map((_, index) => (
              <CompetitionSkeleton key={index} />
            ))
          ) : comps?.data?.length > 0 ? (
            comps.data.map((comp, idx) => (
              <CoursesCard
                type={"comp"}
                lectre={comp}
                key={comp.id || idx}
                href={`/competition/${comp.id}`}
              />
            ))
          ) : (
            <p>لا توجد بيانات لعرضها.</p>
          )}
        </Box>
      </Box>
    </div>
  );
};

export default Competitions;
