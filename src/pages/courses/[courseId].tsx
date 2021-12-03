import gql from "graphql-tag";
import { NextPage } from "next";
import { client } from "../services/graphql";

type CourseStudentsProps = {
  course?: {
    id: string;
    name: string;
    students?: {
      id: string;
      name: string;
      email: string;
    }[]
  }
}

const CourseStudents: NextPage<CourseStudentsProps> = ({ course }) => {
  if(!course) {
    return <p>Oh no!</p>
  }

  return (
    <>
      <h2>{course.name}</h2>

      <h3>Students</h3>

      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>E-mail</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {course.students?.map(student => (
            <tr key={student.id}>
              <td>{student.name}</td>
              <td>{student.email}</td>
              <td></td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  )
}

CourseStudents.getInitialProps = async (context) => {
  const { courseId } = context.query;

  try {
    const { data } = await client.query({
      query: gql`
        query course($id: String!){
          course(id: $id) {
            id
            name
            students {
              id
              name
              email
            }
          }
        }
      `,
      variables: {
        id: courseId,
      }
    })
  
    const { course } = data;

    return { course }
  } catch(error) {
    console.error(JSON.stringify(error));
  }

  return {};
}

export default CourseStudents;