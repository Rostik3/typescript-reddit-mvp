import {dedupExchange, fetchExchange, stringifyVariables} from "@urql/core";
import {cacheExchange, Resolver, Cache} from "@urql/exchange-graphcache";
import {
    DeletePostMutationVariables,
    LoginMutation,
    LogoutMutation,
    MeDocument,
    MeQuery,
    RegisterMutation,
    VoteMutationVariables
} from "../generated/graphql";
import {betterUpdateQuery} from "./betterUpdateQuery";
import { pipe, tap } from 'wonka';
import { Exchange } from 'urql';
import Router from 'next/router';
import gql from "graphql-tag";
import {isServer} from "./isServer";

export const errorExchange: Exchange = ({forward}) => (ops$) => {
    return pipe(
        forward(ops$),
        tap(async ({error}) => {
            if (error?.message.includes("not authenticated")) {
                await Router.replace("/login");
            }
        })
    );
};

export const cursorPagination = (): Resolver => {

    return (_parent, fieldArgs, cache, info) => {
        const {parentKey: entityKey, fieldName} = info;
        const allFields = cache.inspectFields(entityKey);
        const fieldInfos = allFields.filter(info => info.fieldName === fieldName);
        const size = fieldInfos.length;
        if (size === 0) {
            return undefined;
        }
        const fieldKey = `${fieldName}(${stringifyVariables(fieldArgs)})`;
        const isItInTheCache = cache.resolve(
            cache.resolveFieldByKey(entityKey, fieldKey) as string,
            "posts"
        );
        info.partial = !isItInTheCache;
        let hasMore = true;
        const results: string[] = [];
        fieldInfos.forEach(fi => {
            const key = cache.resolveFieldByKey(entityKey, fi.fieldKey) as string;
            const data = cache.resolve(key, 'posts') as string[];
            const _hasMore = cache.resolve(key, 'hasMore');
            if (!_hasMore) {
                hasMore = _hasMore as boolean;
            }
            results.push(...data);
        })

        return {
            __typename: "PaginatedPosts",
            hasMore,
            posts: results
        };
    };
};

function invalidateAllPosts(cache: Cache) {
    const allFields = cache.inspectFields('Query');
    const fieldInfos = allFields.filter(info => info.fieldName === 'posts');
    fieldInfos.forEach((fi) => {
        cache.invalidate("Query", "posts", fi.arguments || {});
    });
}

export const createUrqlClient = (ssrExchange: any, ctx: any) => {
    let cookie = "";
    if (isServer()) {
        cookie = ctx?.req?.headers?.cookie;
    }
    return {
        url: process.env.NEXT_PUBLIC_API_URL as string,
        fetchOptions: {
            credentials: 'include' as const,
            headers: cookie ? { cookie } : undefined,
        },
        exchanges: [dedupExchange, cacheExchange({
            keys: {
                PaginatedPosts: () => null,
            },
            resolvers: {
                Query: {
                    posts: cursorPagination(),
                },
            },
            updates: {
                Mutation: {
                    deletePost: (_result, args, cache, info) => {
                        cache.invalidate({
                            __typename: "Post",
                            id: (args as DeletePostMutationVariables).id
                        });
                    },
                    vote: (_result, args, cache, info) => {
                        const {postId, value} = args as VoteMutationVariables;

                        const data = cache.readFragment(
                            gql`
                                fragment _ on Post {
                                    id
                                    points
                                    voteStatus
                                }
                            `,
                            {id: postId} as any
                        );
                        if (data) {
                            if (data.voteStatus === args.value) {
                                return;
                            }
                            const newPoints = (data.points as number) + (!data.voteStatus ? 1 : 2) * value;
                            cache.writeFragment(
                                gql`
                                    fragment __ on Post {
                                        points
                                        voteStatus
                                    }
                                `,
                                {id: postId, points: newPoints, voteStatus: value} as any
                            );
                        }
                    },
                    createPost: (_result, args, cache, info) => {
                        invalidateAllPosts(cache);
                    },
                    logout: (_result, args, cache, info) => {
                        betterUpdateQuery<LogoutMutation, MeQuery>(
                            cache,
                            {query: MeDocument},
                            _result,
                            () => ({me: null})
                        );
                    },
                    login: (_result, args, cache, info) => {
                        betterUpdateQuery<LoginMutation, MeQuery>(cache,
                            {query: MeDocument},
                            _result,
                            (result, query) => {
                                if (result.login.errors) {
                                    return query
                                } else {
                                    return {
                                        me: result.login.user
                                    }
                                }
                            }
                        )
                        invalidateAllPosts(cache);
                    },
                    register: (_result, args, cache, info) => {
                        betterUpdateQuery<RegisterMutation, MeQuery>(cache,
                            {query: MeDocument},
                            _result,
                            (result, query) => {
                                if (result.register.errors) {
                                    return query
                                } else {
                                    return {
                                        me: result.register.user
                                    }
                                }
                            }
                        )
                    }
                }
            }
        }), errorExchange, ssrExchange, fetchExchange]
    };
};