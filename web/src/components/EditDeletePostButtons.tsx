import React from "react";
import NextLink from "next/link";
import {Box, IconButton, Link} from "@chakra-ui/core";
import {useDeletePostMutation, useMeQuery} from "../generated/graphql";

interface EditDeletePostButtonsProps {
    id: number;
    creatorId: number
}

export const EditDeletePostButtons: React.FC<EditDeletePostButtonsProps> = ({ id, creatorId }) => {
    const [{ data: meData }] = useMeQuery();
    const [, deletePost] = useDeletePostMutation();

    if (meData?.me?.id !== creatorId){
        return null;
    }

    return (
        <Box>
            <NextLink
                href="/post/edit/[id]"
                as={`/post/edit/${id}`}
            >
                <IconButton
                    mr={4}
                    as={Link}
                    icon="edit"
                    aria-label="Edit Post"
                />
            </NextLink>
            <IconButton
                icon="delete"
                aria-label="Delete Post"
                onClick={async () => {
                    await deletePost({ id })
                }}
            />
        </Box>
    )
}