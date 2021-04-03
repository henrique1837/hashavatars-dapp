import { ReactNode } from 'react';
import {
  Box,
  Flex,
  Avatar,
  HStack,
  IconButton,
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  Image,
  useDisclosure,
  useColorModeValue,
  Stack,
} from '@chakra-ui/react';
import {Link} from 'react-router-dom';
import { HamburgerIcon, CloseIcon } from '@chakra-ui/icons';
import { ColorModeSwitcher } from "../ColorModeSwitcher"



const NavLink = (props) => (
  <>
  <Link
    px={2}
    py={1}
    rounded={'md'}
    _hover={{
      textDecoration: 'none',
      bg: useColorModeValue('gray.200', 'gray.700'),
    }}
    href={`/home`}
    to={`/home`}>
    Informations
  </Link>
  <Link
    px={2}
    py={1}
    rounded={'md'}
    _hover={{
      textDecoration: 'none',
      bg: useColorModeValue('gray.200', 'gray.700'),
    }}
    href={`/created-avatars`}
    to={`/created-avatars`}>
    Generate Avatar
  </Link>
  <Link
    px={2}
    py={1}
    rounded={'md'}
    _hover={{
      textDecoration: 'none',
      bg: useColorModeValue('gray.200', 'gray.700'),
    }}
    href={`/owned-avatars`}
    to={`/owned-avatars`}>
    Avatars Owned
  </Link>
  <Link
    px={2}
    py={1}
    rounded={'md'}
    _hover={{
      textDecoration: 'none',
      bg: useColorModeValue('gray.200', 'gray.700'),
    }}
    href={`/all-avatars`}
    to={`/all-avatars`}>
    All Avatars
  </Link>
  </>
);

export default function Simple() {
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <>
      <Box bg={useColorModeValue('gray.100', 'gray.900')} px={4}>
        <Flex h={16} alignItems={'center'} justifyContent={'space-between'}>
          <IconButton
            size={'md'}
            icon={isOpen ? <CloseIcon /> : <HamburgerIcon />}
            aria-label={'Open Menu'}
            display={{ md: !isOpen ? 'none' : 'inherit' }}
            onClick={isOpen ? onClose : onOpen}
          />
          <HStack spacing={8} alignItems={'center'}>
            <Box>
              <Avatar
                size={'sm'}
                src={
                  'https://ipfs.io/ipfs/QmeVRmVLPqUNZUKERq14uXPYbyRoUN7UE8Sha2Q4rT6oyF'
                }
                as={Link}
                to="/home"
              />
              {'  '} <Link to="/home">The HashAvatars</Link>
            </Box>
          </HStack>
          <Flex alignItems={'center'}>
            <Menu>
              <HStack
                as={'nav'}
                spacing={4}
                display={{ base: 'none', md: 'flex' }}>
                <NavLink />
                <a
                  px={2}
                  py={1}
                  rounded={'md'}
                  _hover={{
                    textDecoration: 'none',
                    bg: useColorModeValue('gray.200', 'gray.700'),
                  }}
                  href="https://t.me/thehashavatars"

                  target="_blank"
                  >
                  <Image boxSize="20px" src="data:image/png;base64,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"/>

                </a>
                <a
                  px={2}
                  py={1}
                  rounded={'md'}
                  _hover={{
                    textDecoration: 'none',
                    bg: useColorModeValue('gray.200', 'gray.700'),
                  }}
                  href="https://github.com/henrique1837/cryptoavatars-dapp"

                  target="_blank"
                  >
                  <img boxSize="20px" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAABmJLR0QA/wD/AP+gvaeTAAABeklEQVRIidXUPU8VURSF4YeLgIQES0JhQSeQGPA3mChfkQgVhR1/g4QQNVJaameorCy0sLO2JRAQOoNKTEhosJJLMTO5w+YMM5eOlZzcj73Wu+ec2TncdvXU1HvxFMuYxv088xvf8Rmf8P8mzZ9gH+2adYi5bsA9WMd5A3ixzrGp/kTARhfguDbq4HMh8AgL2E7AfmAJD8L/M1XwO7LzLJv78togpvLPQTzEvbzWGzJ7pdwlLSaecqxuyxhJ5BaKYqtkXArBA9k41ulUdlxlRRbYCU/xvAG80LOQ3U6Z/gbTcBcNhkP2pCiUj6i/C2BUnP+7qQY/g6ly3BKaDb+PU6Ytl7d5hPEG8An8CtmPKWNqTP/hVQ6JmsTr3BNzL1IN+nQutzV8KQXeJvwfEuC2bLQHqrY7L7u4zjCKr/iTf0/tINVgpQpe6GVufFPjayXg7+rgdK7rNnbx7RpvGf5edp811mOdd3Jdg2MVL7WJWq7OeFmrGLop/HboAtvUneYxMJW3AAAAAElFTkSuQmCC"/>
                </a>
                <ColorModeSwitcher justifySelf="flex-end" />
              </HStack>
            </Menu>
          </Flex>
        </Flex>
        {isOpen ? (
          <Box pb={4}>
            <Stack as={'nav'} spacing={4}>
              <NavLink />
            </Stack>
          </Box>
        ) : null}
      </Box>
    </>
  );
}
