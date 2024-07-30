const { loadSchema } = require("@graphql-tools/load");
const { UrlLoader } = require("@graphql-tools/url-loader");
const { validate } = require("@graphql-inspector/core");
const fs = require("fs").promises;
const path = require("path");
const gql = require("graphql-tag");

const GRAPHQL_ENDPOINT = "http://localhost:3000/graphql";
const DEFINITIONS_FILE_PATH = path.join(
  __dirname,
  "./graphql-definitions.txt"
  
);

async function loadSchemaFromEndpoint(endpoint) {
  return loadSchema(endpoint, {
    loaders: [new UrlLoader()],
  });
}

async function readDefinitionsFromFile(filePath) {
  return fs.readFile(filePath, "utf-8");
}

function extractQueriesFromDefinitions(data) {
  const regex = /(query|mutation)\s+[a-zA-Z0-9_]+\s*\([^)]*\)\s*\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}/gm;
  const sources = [];

  for (const match of data.matchAll(regex)) {
    const query = match[0];
    const parsedQuery = gql`${query}`;
    const queryName = parsedQuery.definitions[0].name?.value;
    sources.push({ ...parsedQuery.loc.source, name: queryName });
  }

  return sources;
}

function logAndExit(response) {
  const deprecatedFields = response
    .filter((item) => item.deprecated.length > 0)
    .map((item) => {
      item.deprecated.forEach((itemDeprecated) => {
        console.log(
          `Deprecated fields on: ${item.source.name || ""}`,
          itemDeprecated.message
        );
      });
      return item.deprecated;
    })
    .flat();

  process.exit(deprecatedFields.length > 0 ? 1 : 0);
}

async function main() {
  try {
    const schema = await loadSchemaFromEndpoint(GRAPHQL_ENDPOINT);
    const definitionsData = await readDefinitionsFromFile(DEFINITIONS_FILE_PATH);
    const sources = extractQueriesFromDefinitions(definitionsData);
    const response = validate(schema, sources, {
      strictDeprecated: true,
    });

    logAndExit(response);
  } catch (error) {
    console.error("An error occurred:", error);
    process.exit(1);
  }
}

main();