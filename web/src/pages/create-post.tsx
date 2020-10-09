import React from "react";
import {Form, Formik} from "formik";
import {InputField} from "../components/InputField";
import {Box, Button} from "@chakra-ui/core";
import {useCreatePostMutation} from "../generated/graphql";
import {useRouter} from "next/router";
import {createUrqlClient} from "../utils/createUrqlClient";
import {withUrqlClient} from "next-urql";
import {Layout} from "../components/Layout";
import {useIsAuth} from "../utils/useIsAuth";

const CreatePost: React.FC<{}> = ({}) => {
    const router = useRouter();
    useIsAuth();
    const [, createPost] = useCreatePostMutation();
    return (
        <Layout variant="small">
            <Formik
                initialValues={{ title: '', text: '' }}
                onSubmit={async (values) => {
                    const { error } = await createPost({input: values})
                    if (!error) {
                        await router.push("/")
                    }
                    // alternative way if global handler doesnt work
                    // else {
                    //     await router.push("/login")
                    // }
                }}
            >
                {({ isSubmitting }) => (
                    <Form>
                        <InputField
                            name="title"
                            placeholder="title"
                            label="Title"
                        />
                        <Box mt={4}>
                            <InputField
                                textarea
                                name="text"
                                placeholder="text..."
                                label="Text"
                            />
                        </Box>
                        <Button mt={4} type="submit" isLoading={isSubmitting} variantColor="teal">
                            Create Post
                        </Button>
                    </Form>
                )}
            </Formik>
        </Layout>
    )
}

export default withUrqlClient(createUrqlClient)(CreatePost);