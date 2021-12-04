import { Box } from '@chakra-ui/react'

type CourseItemProps = {
  children?: React.ReactNode;
  course: {
    id: string,
    name: string
  }
}

export const CourseItem = ({ course, children }: CourseItemProps) => {
  return (
    <Box mt={5}>
      <Box bg='tomato' w='100%' h={100} p={4} color='white' />

      <Box
        mt='1'
        fontWeight='semibold'
        as='h4'
        lineHeight='tight'
        isTruncated
      >
        {course.name}
      </Box>

      {children}
    </Box>
    )
}

export default CourseItem;