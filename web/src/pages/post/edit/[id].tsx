import React from "react";
import {createUrqlClient} from "../../../utils/createUrqlClient";
import {withUrqlClient} from "next-urql";
import {Layout} from "../../../components/Layout";
import {Form, Formik} from "formik";
import {InputField} from "../../../components/InputField";
import {Box, Button} from "@chakra-ui/core";
import {Text} from "@chakra-ui/core";
import {usePostQuery, useUpdatePostMutation} from "../../../generated/graphql";
import {useGetIntId} from "../../../utils/useGetIntId";
import {useRouter} from "next/router";

const EditPost = ({}) => {
    const router = useRouter();
    const intId = useGetIntId();
    const [{data, fetching}] = usePostQuery({
        pause: intId === -1,
        variables: {
            id: intId,
        }
    })
    const [, updatePost] = useUpdatePostMutation();

    if (fetching) {
        return (
            <Layout>
                <Text>Loading...</Text>
            </Layout>
        )
    }

    if (!data?.post) {
        return (
            <Layout>
                <Text>Could not find post</Text>
            </Layout>
        )
    }

    return (
        <Layout variant="small">
            <Formik
                initialValues={{ title: data.post.title, text: data.post.text }}
                onSubmit={async (values) => {
                    await updatePost({id: intId, ...values});
                    await router.back();
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
                            Update Post
                        </Button>
                    </Form>
                )}
            </Formik>
        </Layout>
    );
}

export default withUrqlClient(createUrqlClient)(EditPost)