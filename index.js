const express = require("express");
// gql is also available from @urql/core package
// const { gql, GraphQLClient } = require("graphql-request");
const { GraphQLClient } = require("graphql-request");
const { gql, Client, cacheExchange, fetchExchange } = require("@urql/core");

const app = (module.exports = express());

const api = "https://countries.trevorblades.com/";

app.get("/", async (req, res) => {
  res.status(200).json({ success: "true", message: "Hello" });
});

app.get("/v1/continents", async (req, res) => {
  const graphQLClient = new GraphQLClient(api);
  const query = gql`
    query {
      continents {
        code
        countries {
          name
          code
        }
        name
      }
    }
  `;
  // const query = gql`
  //   query {
  //     continents {
  //       code
  //       name
  //     }
  //   }
  // `;

  try {
    const results = await graphQLClient.request(query);
    res.json({ results, error: null });
  } catch (error) {
    res.status(error.response.status || 500).json({
      results: null,
      errorMessage: error.message || "Something went wrong",
      error,
    });
  }
});

app.get("/v2/continents", async (req, res) => {
  const query = gql`
    query {
      continents {
        code
        countries {
          name
          code
        }
        name
      }
    }
  `;

  const client = new Client({
    url: api,
    exchanges: [fetchExchange],
    // fetchOptions: () => {
    //   return {
    //     headers: { authorization: `API KEY ${API_KEY}`}
    //   }
    // }
  });

  try {
    const results = await client.query(query).toPromise();
    res.json({
      continents: results?.data?.continents || [],
      query,
      error: null,
    });
  } catch (error) {
    res.status(error.response.status || 500).json({
      results: null,
      errorMessage: error.message || "Something went wrong",
      error,
    });
  }
});

/* istanbul ignore next */
if (!module.parent) {
  app.listen(3000);
  console.log("Express started on port 3000");
}
