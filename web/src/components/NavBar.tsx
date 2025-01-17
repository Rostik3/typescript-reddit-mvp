import React from "react";
import {Box, Button, Flex, Heading, Link} from "@chakra-ui/core";
import NextLink from "next/link";
import {useLogoutMutation, useMeQuery} from "../generated/graphql";
import {isServer} from "../utils/isServer";
import {useRouter} from 'next/router'

interface NavBarProps {}

export const NavBar: React.FC<NavBarProps> = ({}) => {
    const router = useRouter();
    const [{fetching: logoutFetching}, logout] = useLogoutMutation();
    const [{data, fetching}] = useMeQuery({
        pause: isServer(),
    });
    let body = null;

    // data is loading
    if (fetching) {
        // user not logged int
    } else if (!data?.me) {
        body = (
            <>
                <NextLink href='/login'>
                    <Link color='white' mr={2}>Login</Link>
                </NextLink>
                <NextLink href='/register'>
                    <Link color='white'>Register</Link>
                </NextLink>
            </>
        )
        // user is logged in
    } else {
        body = (
            <Flex align='center'>
                <NextLink href='/create-post'>
                    <Button as={Link} mr={4}>
                        Create Post
                    </Button>
                </NextLink>
                <Box mr={2} color='white'>{data.me.username}</Box>
                <Button
                    onClick={async () => {
                        await logout()
                        router.reload();
                    }}
                    isLoading={logoutFetching}
                    variant='link'
                    color='white'
                >
                    Logout
                </Button>
            </Flex>
        )
    }
    return (
        <Flex zIndex={1} position='sticky' top={0} bg='tomato' p={4}>
            <Flex flex={1} m='auto' maxW={800} align='center'>
            <NextLink href='/'>
                <Link color='white'>
                    <Heading>Reddit</Heading>
                </Link>
            </NextLink>
            <Box ml={'auto'}>
                { body }
            </Box>
            </Flex>
        </Flex>
    );
}