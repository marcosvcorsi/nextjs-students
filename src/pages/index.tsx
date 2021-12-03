import gql from 'graphql-tag'
import type { NextPage } from 'next'
import Link from 'next/link';
import { client } from './services/graphql'

type HomeProps = {
  courses: {
    id: string;
    name: string;
  }[]
}

const Home: NextPage<HomeProps> = ({ courses }) => {
  return (
    <>
      <header>
        <h1>University</h1>
      </header>
      <main>
        <h3>Courses</h3>

        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {courses.map(course => (
              <tr key={course.id}>
                <td>{course.name}</td>
                <td>
                  <Link href={`/courses/${course.id}`}>
                    <a>Students</a>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </main>
    </>
  )
}

Home.getInitialProps = async () => {
  const { data } = await client.query({
    query: gql`
      query {
        courses {
          id
          name
        }
      }
    `
  });

  const { courses } = data;

  return { courses };
}

export default Home
