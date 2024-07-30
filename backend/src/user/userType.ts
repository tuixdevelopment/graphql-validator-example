import { Field, Int, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class User {
    @Field(type => Int)
    id: number;

    @Field(type => String)
    firstName: string;

    @Field(type => String)
    lastName: string;

    @Field(type => String, { nullable: true, deprecationReason: "Field deprecated, please use firstName and lastName instead" })
    name?: string;
}