import Head from "next/head";
import {
  TextField,
  Box,
  Container,
  Typography,
  Button,
  Autocomplete,
  Divider,
  Grid,
} from "@mui/material";
import BasicTable from "@components/postTable";
import ReactMarkdown from "react-markdown";
import { fetchEventSource } from "@microsoft/fetch-event-source";
import { useState } from "react";

const CreatePost = `
mutation CreatePost($content: RichTextAST!, $date: Date!, $tag: Tag, $slug: String!, $title: String!) {
  createPost(data: {slug: $slug, date: $date, tag: $tag, content: $content, title: $title, author: {connect: {id: "clmqrgj3lc16e0b2oy1tmdmuh"}}, visitedCount: {create: {viewed: 0}}}) {
    id
    stage  
    visitedCount {
      id
      viewed
    }
  }
}`;

const enumList = `
query enumList($name: String){
  __type(name: $name) {
    enumValues {
      name
      description
    }
  }
}`;

const enumType = ["Stage", "Tag"];

// payload example
const title = "testing generator";
const slug = "testting-app-with-author-visited1s";
const date = new Date().toISOString();
const contentPayload = {
  children: [
    {
      type: "paragraph",
      children: [
        {
          text: "Hygraph boasts an impressive collection of ",
        },
        {
          href: "https://hygraph.com/docs/api-reference/schema/field-types",
          type: "link",
          children: [
            {
              text: "Field Types",
            },
          ],
        },
        {
          text: " that you can use when content modelling. These field types range from the core GraphQL scalar types, to custom ",
        },
        {
          href: "https://hygraph.com/docs/api-reference/schema/field-types#asset",
          type: "link",
          children: [
            {
              text: "Asset",
            },
          ],
        },
        {
          text: ", ",
        },
        {
          href: "https://hygraph.com/docs/api-reference/schema/field-types#location",
          type: "link",
          children: [
            {
              text: "Location",
            },
          ],
        },
        {
          text: ", ",
        },
        {
          href: "https://hygraph.com/docs/api-reference/schema/field-types#json",
          type: "link",
          children: [
            {
              text: "JSON",
            },
          ],
        },
        {
          text: ", and, ",
        },
        {
          href: "https://hygraph.com/docs/api-reference/schema/field-types#rich-text",
          type: "link",
          children: [
            {
              text: "RichText",
            },
          ],
        },
        {
          text: " scalars.",
        },
      ],
    },
    {
      type: "paragraph",
      children: [
        {
          text: "",
        },
      ],
    },
    {
      type: "paragraph",
      children: [
        {
          text: "In this post we'll look at the Rich Text field. We'll take a peak at how you can query, and mutate Rich Text using the Content API.",
        },
      ],
    },
    {
      type: "paragraph",
      children: [
        {
          text: "",
        },
      ],
    },
    {
      src: "https://media.graphassets.com/N3JOKsXrT9ezCU4Ba6LI",
      type: "image",
      title: "Screenshot 2021-03-24 at 13.00.14.png",
      width: 2408,
      handle: "N3JOKsXrT9ezCU4Ba6LI",
      height: 1684,
      children: [
        {
          text: "",
        },
      ],
      mimeType: "image/png",
    },
    {
      type: "paragraph",
      children: [
        {
          text: "",
        },
      ],
    },
  ],
};

const publishPost = `
mutation PublishPost($id: ID) {
  publishPost(where: {id: $id}) {
    title
    stage
  }
}`;

const publishVisitedCount = `
mutation PublishVisitedCount($id: ID) {
  publishVisitedCount(where: {id: $id}) {
    id
  }
}
`;

async function createPost() {
  const data = await fetch(process.env.HYGRAPH_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/jsonxd",
      // Authorization: "Bearer " + process.env.HYGRAPH_TOKEN,
    },
    body: JSON.stringify({
      query: CreatePost,
      variables: {
        title: title,
        slug: slug,
        date: date, // today ISO8601 formatted
        tag: "Food",
        content: contentPayload,
      },
    }),
  })
    .then(async (res) => {
      const { data } = await res.json();
      await fetch(process.env.HYGRAPH_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Authorization: "Bearer " + process.env.HYGRAPH_TOKEN,
        },
        body: JSON.stringify({
          query: publishPost,
          variables: {
            id: data.createPost.id,
          },
        }),
      });

      console.log(data.createPost);
      await fetch(process.env.HYGRAPH_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Authorization: "Bearer " + process.env.HYGRAPH_TOKEN,
        },
        body: JSON.stringify({
          query: publishVisitedCount,
          variables: {
            id: data.createPost.visitedCount.id,
          },
        }),
      });
    })
    .catch((err) => console.log(err));
  return data;
}

export default function Home() {
  const [result, setResult] = useState("");
  const fetchData = async () => {
    const ctrl = new AbortController();
    await fetchEventSource(`https://api.openai.com/v1/chat/completions`, {
      method: "POST",
      body: JSON.stringify({
        model: "gpt-3.5-turbo-16k",
        messages: [
          {
            role: "system",
            content: "write me article about",
          },
          {
            role: "user",
            content: "all golang framework",
          },
          {
            role: "system",
            content: "add pros and cons for each framework",
          },
          {
            role: "user",
            content: "add diagram",
          },
          // {
          //   role: "user",
          //   content: "add as a title learning series",
          // },
          // {
          //   role: "user",
          //   content: "in bahasa indonesia",
          // },
          {
            role: "user",
            content: "response with markdown",
          },
        ],
        temperature: 0,
        stream: true,
      }),
      headers: {
        Accept: "text/event-stream",
        "Content-Type": "application/json",
        Authorization:
          "Bearer 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",
      },
      signal: ctrl.signal,
      onopen(res) {
        if (res.ok && res.status === 200) {
          console.log("Connection made ", res);
        } else if (
          res.status >= 400 &&
          res.status < 500 &&
          res.status !== 429
        ) {
          console.log("Client side error ", res);
        }
      },
      onmessage(event) {
        if (event.data != "[DONE]") {
          let payload = JSON.parse(event.data);
          let text = payload.choices[0].delta.content;
          if (text != "\n") {
            console.log(payload);
            if (payload.choices[0].finish_reason === "stop") {
              ctrl.abort();
            } else {
              setResult((prev) => prev + text);
            }
          }
        } else {
          ctrl.abort();
        }
      },
      onclose() {
        console.log("Connection closed by the server");
      },
      onerror(err) {
        console.log("There was an error from server", err);
        if (err instanceof FatalError) {
          throw err; // rethrow to stop the operation
        } else {
          // do nothing to automatically retry. You can also
          // return a specific retry interval here.
        }
      },
    });
  };
  return (
    <>
      <Head>
        <title>Blog Content Generator</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        <Container fixed>
          <Box width={1} justifyContent="center" alignItems="center">
            <Typography textAlign="center" variant="h4" gutterBottom>
              Hygraph Article Generator !!
            </Typography>
            <Divider />
          </Box>
          <Box
            display="flex"
            marginTop={3}
            flexDirection="column"
            justifyContent="center"
            gap={2}
          >
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <GenerateArticleForm />
              </Grid>
              <Grid item xs={12} md={6}>
                <Box
                  display="flex"
                  flexDirection="column"
                  boxShadow={2}
                  borderRadius={2}
                  padding={3}
                  minHeight={200}
                >
                  {/* <Box>
                    <Button
                      size="small"
                      variant="contained"
                      color="success"
                      onClick={fetchData}
                    >
                      Generate
                    </Button>
                    <ReactMarkdown>{result}</ReactMarkdown>
                  </Box> */}
                </Box>
              </Grid>
            </Grid>
            <Box
              display="flex"
              flexDirection="column"
              boxShadow={2}
              borderRadius={2}
              padding={3}
            >
              <Button
                size="small"
                variant="contained"
                color="success"
                onClick={fetchData}
              >
                Generate
              </Button>
              <ReactMarkdown
                components={{
                  p: ({ children }) => (
                    <Typography sx={{ mt: 1 }}>{children}</Typography>
                  ),
                  del: ({ children }) => (
                    <Typography sx={{ mt: 1, textDecoration: "line-through" }}>
                      {children}
                    </Typography>
                  ),
                  em: ({ children }) => (
                    <Typography sx={{ mt: 1, fontStyle: "italic" }}>
                      {children}
                    </Typography>
                  ),
                  strong: ({ children }) => (
                    <Typography
                      variant={"strong"}
                      sx={{ mt: 1, fontWeight: "bold" }}
                    >
                      {children}
                    </Typography>
                  ),
                  b: ({ children }) => (
                    <Typography sx={{ mt: 1, fontWeight: "bold" }}>
                      {children}
                    </Typography>
                  ),
                  h1: ({ children }) => (
                    <Typography
                      gutterBottom
                      sx={{ mt: 2, fontSize: 35 }}
                      variant={"h1"}
                    >
                      {children}
                    </Typography>
                  ),
                  h2: ({ children }) => (
                    <Typography
                      gutterBottom
                      sx={{ mt: 2, fontSize: 35 }}
                      variant={"h2"}
                    >
                      {children}
                    </Typography>
                  ),
                  h3: ({ children }) => (
                    <Typography gutterBottom sx={{ mt: 2 }} variant={"h3"}>
                      {children}
                    </Typography>
                  ),
                  h4: ({ children }) => (
                    <Typography gutterBottom sx={{ mt: 2 }} variant={"h4"}>
                      {children}
                    </Typography>
                  ),
                  h5: ({ children }) => (
                    <Typography gutterBottom sx={{ mt: 2 }} variant={"h5"}>
                      {children}
                    </Typography>
                  ),
                  h6: ({ children }) => (
                    <Typography gutterBottom sx={{ mt: 2 }} variant={"h6"}>
                      {children}
                    </Typography>
                  ),
                }}
              >
                {result}
              </ReactMarkdown>
            </Box>
            <ArticleList />
          </Box>
        </Container>
      </main>
    </>
  );
}

const GenerateArticleForm = () => {
  return (
    <Box
      display="flex"
      flexDirection="column"
      boxShadow={2}
      borderRadius={2}
      padding={3}
      gap={2}
      minHeight={200}
    >
      <Box>
        <Typography variant="h6" gutterBottom>
          Generate Article By Topic
        </Typography>
        <Divider />
      </Box>

      <Box display="flex" flexDirection="row" gap={2}>
        <Box display="flex" flexDirection="column" gap={2} width={1}>
          <TextField size="small" id="topic" label="Topic" variant="outlined" />
          <Autocomplete
            size="small"
            disablePortal
            options={["All", "Draft", "Published"]}
            renderInput={(params) => <TextField {...params} label="Author" />}
          />
        </Box>
        <Box display="flex" flexDirection="column" gap={2} width={1}>
          <TextField size="small" id="title" label="Title" variant="outlined" />
          <Autocomplete
            size="small"
            disablePortal
            options={["All", "Draft", "Published"]}
            renderInput={(params) => <TextField {...params} label="Tag" />}
          />
        </Box>
      </Box>
      <Box display="flex" gap={1}>
        {/* <Button
          size="small"
          variant="contained"
          color="success"
          onClick={fetchData}
        >
          Generate
        </Button> */}
        <Button
          size="small"
          variant="contained"
          color="info"
          onClick={createPost}
        >
          Reset Field
        </Button>
      </Box>
    </Box>
  );
};

const ArticleList = () => {
  return (
    <Box
      display="flex"
      flexDirection="column"
      boxShadow={2}
      borderRadius={2}
      padding={3}
      gap={2}
    >
      <Box>
        <Typography variant="h6" gutterBottom>
          Article List
        </Typography>
        <Divider />
      </Box>

      <Box display="flex" flexDirection="row" flexWrap="wrap" gap={2}>
        <TextField
          sx={{ minWidth: 294 }}
          size="small"
          id="search"
          label="Search"
          variant="outlined"
        />
        <Autocomplete
          sx={{ minWidth: 294 }}
          size="small"
          disablePortal
          options={["Draft", "Published"]}
          renderInput={(params) => (
            <TextField size="small" {...params} label="Stage" />
          )}
        />
        <Autocomplete
          sx={{ minWidth: 294 }}
          size="small"
          disablePortal
          options={["All", "Draft", "Published"]}
          renderInput={(params) => (
            <TextField size="small" {...params} label="Tag" />
          )}
        />
        <Box display="flex" gap={1}>
          <Button size="small" variant="contained">
            Set Filter
          </Button>
          <Button size="small" variant="contained" color="warning">
            Clear Filter
          </Button>
        </Box>
      </Box>
      <BasicTable />
    </Box>
  );
};
