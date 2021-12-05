import { 
  Container, 
  Heading, 
  Button, 
  Text,
  Tabs,
  Tab,
  TabPanels,
  TabPanel,
  TabList,
  SimpleGrid,
} from '@chakra-ui/react'
import gql from 'graphql-tag'
import type { NextPage } from 'next'
import Router from 'next/router';
import { useEffect, useState } from 'react'
import CourseItem from '../components/CourseItem'
import { client } from '../services/graphql'
import { getCurrentUserData } from '../utils/user'

type Course = {
  id: string
  name: string
}

type HomeProps = {
  courses?: Course[];
}


// without using Auth or token for now
const mockStudent = {
  id: 'ef18b012-cd56-466c-ab06-6e002d575f9c'
}

const Home: NextPage<HomeProps> = ({ courses = [] }) => {
  const [myCourses, setMyCourses] = useState<Course[]>([]);

  useEffect(() => {
    const userData = getCurrentUserData();

    if(!userData) {
      Router.push('/login');
      return;
    }

    client.query({
      query: gql`
        query myCourses {
          courses: myCourses {
            id
            name
          }
        }
      `,
      context: {
        headers: {
          authorization: `Bearer ${userData.token}`
        }
      }
    }).then(({ data }) => {
      setMyCourses(data.courses || []);
    }).catch((error: any) => {
      console.error(JSON.stringify(error));
    })
  }, [])

  const handleSelectCourse = async (course: Course) => {
    try {
      await client.mutate({
        mutation: gql`
          mutation updateStudent($data: UpdateStudentInput!) {
            updateStudent(data: $data) {
              id
              name
              email
            }
          }
        `,
        variables: {
          data: {
            id: mockStudent.id,
            courses: [course.id]
          }
        },
      })

      setMyCourses([...myCourses, course])
    } catch(error) {
      console.error(JSON.stringify(error));
    }
  }

  const handleRemoveCourse = async (course: Course) => {
    try {
      await client.mutate({
        mutation: gql`
          mutation removeStudentCourse($data: RemoveStudentCourseInput!) {
            removeStudentCourse(data: $data) {
              id
            }
          }
        `,
        variables: {
          data: {
            studentId: mockStudent.id,
            courseId: course.id,
          }
        },
      })

      setMyCourses(myCourses.filter(myCourse => myCourse.id !== course.id))
    } catch(error) {
      console.error(JSON.stringify(error));
    }
  }

  return (
    <Container>
      <Heading as="h1">University</Heading>

      <Tabs mt={3}>
        <TabList>
          <Tab>Courses</Tab>
          <Tab>My Courses</Tab>
        </TabList>

        <TabPanels>
          <TabPanel>
            <SimpleGrid columns={3} spacing={10}>
              {courses?.map(course => (
                <CourseItem key={course.id} course={course}>
                  {!myCourses.some(myCourse => myCourse.id === course.id) ? (
                    <Button mt={5} onClick={() => handleSelectCourse(course)}>Select</Button>
                  ) : (
                    <Text>You already select this course</Text>
                  )}
                </CourseItem>
              ))}
            </SimpleGrid>
          </TabPanel>
          <TabPanel>
            <SimpleGrid columns={3} spacing={10}>
              {myCourses?.map(course => (
                <CourseItem key={course.id} course={course}>
                    <Button mt={5} onClick={() => handleRemoveCourse(course)}>Remove</Button>
                </CourseItem>
              ))}
            </SimpleGrid>
          </TabPanel>
        </TabPanels>
      </Tabs>


    </Container>
  )
}

Home.getInitialProps = async () => {
  try {
    const { data } = await client.query({
      query: gql`
        query {
          courses {
            id
            name
          }
        }
      `
    })

    const { courses } = data;

    return { courses }
  } catch(error: any) {
    console.error(JSON.stringify(error))
  }

  return {};
}



export default Home
