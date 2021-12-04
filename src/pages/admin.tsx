import { Container, Tabs, TabList, Tab, TabPanel, TabPanels, Heading } from '@chakra-ui/react'
import type { NextPage } from 'next'
import Courses from '../components/Courses'
import Students from '../components/Students'

const Admin: NextPage = () => {
  return (
    <Container>
      <Heading as="h1">University Panel</Heading>

      <Tabs mt={3}>
        <TabList>
          <Tab>Courses</Tab>
          <Tab>Students</Tab>
        </TabList>

        <TabPanels>
          <TabPanel>
            <Courses />
          </TabPanel>
          <TabPanel>
            <Students />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Container>
  )
}



export default Admin
