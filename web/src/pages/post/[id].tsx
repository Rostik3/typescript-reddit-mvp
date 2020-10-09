import React from "react";
import {createUrqlClient} from "../../utils/createUrqlClient";
import {withUrqlClient} from "next-urql";
import {Layout} from "../../components/Layout";
import {Heading, Text} from "@chakra-ui/core";
import {useGetPostFromUrl} from "../../utils/useGetPostFromUrl";
import {EditDeletePostButtons} from "../../components/EditDeletePostButtons";

const Post = ({}) => {
    const [{ data, error, fetching }] = useGetPostFromUrl();

    if (error) {
        return (
            <Layout>
            <Text>{error.message}</Text>
            </Layout>
        )
    }

    if (fetching) {
        return (
            <Layout>
                <Text>loading...</Text>
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
        <Layout>
            <Heading mb={4}>
                {data.post.title}
            </Heading>
            <Text mb={4}>{data.post.text}</Text>
            <EditDeletePostButtons id={data.post.id} creatorId={data.post.creator.id} />
        </Layout>
    );
}

export default withUrqlClient(createUrqlClient, {ssr: true})(Post)