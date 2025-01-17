import React, {useState} from "react";
import {NextPage} from "next";
import {Form, Formik} from "formik";
import {toErrorMap} from "../../utils/toErrorMap";
import {InputField} from "../../components/InputField";
import {Box, Button, Flex, Link} from "@chakra-ui/core";
import {Wrapper} from "../../components/Wrapper";
import {useChangePasswordMutation} from "../../generated/graphql";
import {useRouter} from "next/router";
import {createUrqlClient} from "../../utils/createUrqlClient";
import {withUrqlClient} from "next-urql";
import NextLink from "next/link"

export const ChangePassword: NextPage = () => {
    const router = useRouter();
    const [, changePassword] = useChangePasswordMutation();
    const [tokenError, setTokenError] = useState('');
    return (
        <Wrapper variant='small'>
            <Formik
                initialValues={{ newPassword: '' }}
                onSubmit={async (values, { setErrors }) => {
                    const response = await changePassword({
                        newPassword: values.newPassword,
                        token: typeof router.query.token === "string" ? router.query.token : "",
                    });
                    if (response.data?.changePassword.errors) {
                        const errorMap = toErrorMap(response.data.changePassword.errors);
                        if ('token' in errorMap) {
                            setTokenError(errorMap.token);
                        } else {
                            setErrors(errorMap)
                        }
                    } else if (response.data?.changePassword.user) {
                        await router.push('/');
                    }
                }}
            >
                {({ isSubmitting }) => (
                    <Form>
                            <InputField
                                name="newPassword"
                                placeholder="new password"
                                label="New Password"
                                type="password"
                            />
                        {tokenError ? (
                            <Flex>
                                <Box mr={2} style={{color: 'red'}}>{tokenError}</Box>
                                <NextLink href="/forgot-password">
                                    <Link>click here to get a new one</Link>
                                </NextLink>
                            </Flex>
                        ) : null}
                        <Button mt={4} type="submit" isLoading={isSubmitting} variantColor="teal">
                            change password
                        </Button>
                    </Form>
                )}
            </Formik>
        </Wrapper>
    )
}

export default withUrqlClient(createUrqlClient)(ChangePassword);