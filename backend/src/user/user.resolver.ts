import { Args, Int, Query, Resolver } from "@nestjs/graphql";
import { User } from "./userType";

@Resolver(User)
export class UserResolver {
    @Query(() => User, { deprecationReason: 'query deprecated, use getUserV2 instead' })
    getUser(@Args('id', { type: () => Int }) id: number) {
        return {
            id,
            firstName: 'John',
            lastName: 'Wick',
            name: 'John Wick'
        };
    }

    @Query(() => User)
    getUserV2(@Args('id', { type: () => Int }) id: number) {
        return {
            id,
            firstName: 'John',
            lastName: 'Wick',
            name: 'John Wick'
        };
    }
}