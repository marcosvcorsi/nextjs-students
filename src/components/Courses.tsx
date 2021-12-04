import type { NextPage } from 'next'
import {
  Heading,
  Container,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Button,
  Modal,
  ModalOverlay,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
  FormLabel,
  IconButton,
  Icon,
  useToast
} from '@chakra-ui/react';
import { useDisclosure } from '@chakra-ui/hooks'
import { AddIcon, EditIcon } from '@chakra-ui/icons'
import gql from 'graphql-tag'
import { client } from '../services/graphql'
import { FormEvent, useEffect, useState } from 'react';

type Course = {
  id: string;
  name: string;
}

const Courses = () => {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const toast = useToast()

  const [course, setCourse] = useState<Partial<Course> | null>(null)
  const [courses, setCourses] = useState<Course[]>([]);

  useEffect(() => {
    client.query({
      query: gql`
        query {
          courses {
            id
            name
          }
        }
      `
    }).then(({ data }) => {
      setCourses(data.courses);
    }).catch(error => {
      console.error(JSON.stringify(error));
    });
  }, [])

  const openCourseModal = (course?: Course) => {
    setCourse(course ? course : { name: '' });

    onOpen();
  }

  const handleSaveCourse = async (event: FormEvent) => {
    event.preventDefault();

    try {
      if(!course) {
        return;
      }

      const { data } = await saveCourse(course);

      toast({
        title: 'Success',
        description: 'Course was save successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      })

      const { course: savedCourse } = data;

      const newCourses = [...courses];

      const existingCourseIndex = newCourses
        .findIndex(course => course.id === savedCourse.id);

      if(existingCourseIndex !== -1) {
        newCourses[existingCourseIndex] = savedCourse;
      } else {
        newCourses.push(savedCourse);
      }

      setCourses(newCourses)
      setCourse(null);
      onClose();
    } catch(error: any) {
      console.error(JSON.stringify(error));

      toast({
        title: 'Ops something is wrong',
        description: error.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    }
  }

  const saveCourse = async (course: Partial<Course>) => {
    const variables = {
      data: {
        name: course.name,
      }
    };

    if(course.id) {
      Object.assign(variables.data, { id: course.id })

      return client.mutate({
        mutation: gql`
          mutation updateCourse($data: UpdateCourseInput!) {
            course: updateCourse(data: $data) {
              id
              name
            }
          }
        `,
        variables,
      })
    }

    return client.mutate({
      mutation: gql`
        mutation createCourse($data: CreateCourseInput!) {
          course: createCourse(data: $data) {
            id
            name
          }
        }
      `,
      variables,
    }) 
  }

  return (
    <Container>
      <Table variant="simple">
        <Thead>
          <Tr>
            <Th>Name</Th>
            <Th>Actions</Th>
          </Tr>
        </Thead>
        <Tbody>
          {courses.map(course => (
            <Tr key={course.id}>
              <Td>{course.name}</Td>
              <Td>
                <IconButton
                  aria-label="Edit Course" 
                  icon={<EditIcon />}
                  onClick={() => openCourseModal(course)}
                />
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>

      <Button 
        leftIcon={<AddIcon />} 
        colorScheme='teal' 
        onClick={() => openCourseModal()}
        mt={3}
      >
        Create a course
      </Button>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Course</ModalHeader>
          <ModalCloseButton />

          <ModalBody>
            <form id="form-course" onSubmit={handleSaveCourse}>
              <FormLabel htmlFor='name'>Name</FormLabel>
              <Input
                id='name'
                placeholder='Please enter a name'
                value={course?.name || ''}
                onChange={(event) => setCourse({ ...course, name: event.target.value })}
              />
            </form>
          </ModalBody>

          <ModalFooter>
            <Button colorScheme='blue' mr={3} type="submit" form="form-course">Save</Button>

            <Button variant='ghost' onClick={onClose}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Container>
  )
}

export default Courses