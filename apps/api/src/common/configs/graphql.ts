import { ApolloDriver, ApolloDriverConfig } from "@nestjs/apollo";
import { registerAs } from "@nestjs/config";
import { ApolloServerPluginLandingPageLocalDefault } from "@apollo/server/plugin/landingPage/default";
import path from "path";

const GQL_CONFIG_KEY = "graphql";

const gqlConfig = registerAs(
  GQL_CONFIG_KEY,
  (): GraphQLConfig => ({
    driver: ApolloDriver,
    autoSchemaFile: path.join(__dirname, "schema.gql"),
    sortSchema: true,
    playground: false,
    plugins: [ApolloServerPluginLandingPageLocalDefault()],
    debug: process.env.NODE_ENV !== "production"
  })
);

export type GraphQLConfig = ApolloDriverConfig;
export default gqlConfig;
