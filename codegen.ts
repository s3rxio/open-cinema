import type { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
  schema: "http://localhost:5000/graphql",
  documents: [
    "apps/web/src/entities/**/api/**/*.ts",
    "apps/web/src/features/**/api/**/*.ts"
  ],
  generates: {
    "apps/web/src/shared/api/generated/types.ts": {
      plugins: ["typescript", "typescript-operations"],
      config: {
        useTypeImports: true,
        enumsAsTypes: true,
        skipTypename: true,
        documentMode: "graphQLTag"
      }
    }
  }
};

export default config;
