import React from "react";
import { Box, Image, Heading, Text, Button, Stack } from "@chakra-ui/react";
import { Link } from "react-router-dom";

const Card = ({
  type,
  title,
  description,
  item,
  href,
  img,
  subject,
  btnText,
  onClick,
}) => {
  return (
    <Box
      className='w-[300px] m-2'
      borderWidth='1px'
      borderRadius='lg'
      overflow='hidden'
      boxShadow='md'
      p={4}
      bg='white'
    >
      <Image
        src={img}
        alt='Card Image'
        borderRadius='md'
        mb={4}
        className='h-[250px] w-[%] m-auto'
      />
      <Stack spacing={3}>
        <div className='flex justify-between'>
          <h1 className='font-bold'>{title}</h1>
          <p className='font-bold'>{subject}</p>
        </div>
        <hr />
        <h1 className='font-bold'>{description}</h1>
        {type == "teacher-login" ? null : (
          <Link to={href ? href : null} className='w-[98%] m-auto'>
            <Button
              colorScheme='blue'
              variant='solid'
              className='w-[100%]'
              onClick={onClick ? onClick : null}
            >
              {btnText}
            </Button>
          </Link>
        )}
      </Stack>
    </Box>
  );
};

export default Card;
