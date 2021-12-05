import { Button } from "@chakra-ui/button";
import { Input, InputGroup, InputRightElement } from "@chakra-ui/input";
import { Center, Heading, Stack } from "@chakra-ui/layout";
import { useToast } from "@chakra-ui/toast";
import gql from "graphql-tag";
import { NextPage } from "next";
import Router from "next/router";
import { FormEvent, useState } from "react";
import { client } from "../services/graphql";
import { setCurrentUserData } from "../utils/user";

type PasswordInputProps = {
  value: string | undefined;
  onChange: (value: string) => void;
}

function PasswordInput({ value, onChange }: PasswordInputProps) {
  const [show, setShow] = useState(false)
  const handleClick = () => setShow(!show)

  return (
    <InputGroup size='md'>
      <Input
        pr='4.5rem'
        type={show ? 'text' : 'password'}
        placeholder='Enter password'
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
      <InputRightElement width='4.5rem'>
        <Button h='1.75rem' size='sm' onClick={handleClick}>
          {show ? 'Hide' : 'Show'}
        </Button>
      </InputRightElement>
    </InputGroup>
  )
}

const Login: NextPage = () => {
  const toast = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (event: FormEvent) => {
    event.preventDefault();

    try {
      const { data } = await client.mutate({
        mutation: gql`
          mutation login($data: AuthInput!) {
            auth: login(data: $data) {
              token,
              student {
                id
                name
              }
            }
          }
        `,
        variables: {
          data: {
            email,
            password
          }
        }
      })

      const { auth } = data;

      setCurrentUserData(auth);
      
      Router.push("/");
    } catch(error: any) {
      console.error(JSON.stringify(error));

      toast({
        title: 'Error',
        description: error.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    }
  }

  return (
    <Center w="100vw" height="100vh">
      <Stack>
        <Heading as='h4' size='md'>
          University - Login
        </Heading>

        <form onSubmit={handleLogin}>
          <Input 
            pr='4.5rem' 
            placeholder="Enter your e-mail"
            type="email" 
            mt={3} 
            mb={3}
            value={email}
            onChange={(event) => setEmail(event.target.value)} 
          />
          <PasswordInput value={password} onChange={setPassword}/>

          <Button type="submit">Sign in</Button>
        </form>
      </Stack>
    </Center>
  )
}

export default Login;