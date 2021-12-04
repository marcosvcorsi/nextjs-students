import { 
  Container, 
  Heading,
  Table,
  Thead,
  Th,
  Tbody,
  Tr,
  Td,
  IconButton,
  Button,
  Modal,
  ModalOverlay,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  FormLabel,
  Input,
  useToast
} from "@chakra-ui/react";
import { EditIcon, AddIcon } from '@chakra-ui/icons';
import gql from "graphql-tag";
import { useDisclosure } from '@chakra-ui/hooks'
import { FormEvent, useEffect, useState } from "react";
import { client } from "../services/graphql";

type Student = {
  id: string;
  name: string;
  email: string;
}

const Students = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [student, setStudent] = useState<Partial<Student> | null>(null);
  
  const { isOpen, onOpen, onClose } = useDisclosure()
  const toast = useToast()

  useEffect(() => {
    client.query({
      query: gql`
        query students {
          students {
            id
            name
            email
          }
        }
      `
    }).then(({ data }) => {
      setStudents(data.students);
    }).catch((error) => {
      console.error(JSON.stringify(error))
    })
  }, [])

  const openStudentModal = (student?: Student) => {
    setStudent(student ? student : { name: '', email: '' });

    onOpen();
  }

  const handleSaveStudent = async (event: FormEvent) => {
    event.preventDefault();

    try {
      if(!student) {
        return;
      }

      const { data } = await saveStudent(student);

      toast({
        title: 'Success',
        description: 'Student was save successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      })

      const { student: savedStudent } = data;

      const newStudents = [...students];

      const existingCourseIndex = newStudents
        .findIndex(student => student.id === savedStudent.id);

      if(existingCourseIndex !== -1) {
        newStudents[existingCourseIndex] = savedStudent;
      } else {
        newStudents.push(savedStudent);
      }

      setStudents(newStudents)
      setStudent(null);
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

  const saveStudent = async (student: Partial<Student>) => {
    const variables = {
      data: {
        name: student.name,
        email: student.email,
      }
    };

    if(student.id) {
      Object.assign(variables.data, { id: student.id })

      return client.mutate({
        mutation: gql`
          mutation updateStudent($data: UpdateStudentInput!) {
            student: updateStudent(data: $data) {
              id
              name
              email
            }
          }
        `,
        variables,
      })
    }

    return client.mutate({
      mutation: gql`
        mutation createStudent($data: CreateStudentInput!) {
          student: createStudent(data: $data) {
            id
            name
            email
          }
        }
      `,
      variables,
    }) 
  }


  return (
    <Container>
      <Table>
        <Thead>
          <Tr>
            <Th>Name</Th>
            <Th>E-mail</Th>
            <Th>Actions</Th>
          </Tr>
        </Thead>
        <Tbody>
          {students?.map(student => (
            <Tr key={student.id}>
              <Td>{student.name}</Td>
              <Td>{student.email}</Td>
              <Td>
                <IconButton
                  aria-label="Edit Course" 
                  icon={<EditIcon />}
                  onClick={() => openStudentModal(student)}
                />
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>

      <Button 
        leftIcon={<AddIcon />} 
        colorScheme='teal' 
        onClick={() => openStudentModal()}
        mt={3}
      >
        Create a student
      </Button>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Student</ModalHeader>
          <ModalCloseButton />

          <ModalBody>
            <form id="form-student" onSubmit={handleSaveStudent}>
              <FormLabel htmlFor='name'>Name</FormLabel>
              <Input
                id='name'
                placeholder='Please enter a name'
                value={student?.name || ''}
                onChange={(event) => setStudent({ ...student, name: event.target.value })}
              />

              <FormLabel htmlFor='email'>E-mail</FormLabel>
              <Input
                id='email'
                type="email"
                placeholder='Please enter a e-mail'
                value={student?.email || ''}
                onChange={(event) => setStudent({ ...student, email: event.target.value })}
              />
            </form>
          </ModalBody>

          <ModalFooter>
            <Button colorScheme='blue' mr={3} type="submit" form="form-student">Save</Button>

            <Button variant='ghost' onClick={onClose}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Container>
  )
}

export default Students;