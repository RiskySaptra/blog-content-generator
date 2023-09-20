import Head from "next/head";
import {
  TextField,
  Box,
  Container,
  Typography,
  Button,
  ButtonGroup,
  Autocomplete,
} from "@mui/material";
import PostList from "@components/components/postList";
import BasicTable from "@components/components/postTable";

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
            <Typography textAlign="center" variant="h2" gutterBottom>
              Hygraph Article Generator !!
            </Typography>
          </Box>
          <Box
            display="flex"
            marginTop={10}
            flexDirection="column"
            justifyContent="center"
            gap={5}
          >
            <Box display="flex" flexDirection="row" gap={2}>
              <GenerateArticleForm />
              <Box
                display="flex"
                flexDirection="column"
                boxShadow={2}
                borderRadius={2}
                padding={3}
                gap={2}
                width={1}
              >
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Empty Space (use for preview)
                  </Typography>
                </Box>
              </Box>
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
      width={1}
    >
      <Typography variant="h6" gutterBottom>
        Generate Article By Topic
      </Typography>
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
      <Button variant="contained" onClick={createPost}>
        Generate
      </Button>
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
      <Typography variant="h6" gutterBottom>
        Article List
      </Typography>
      <Box display="flex" gap={2} width={1}>
        <TextField size="small" id="search" label="Search" variant="outlined" />
        <Autocomplete
          fullWidth={true}
          size="small"
          disablePortal
          options={["Draft", "Published"]}
          sx={{ width: 300 }}
          renderInput={(params) => (
            <TextField size="small" {...params} label="Stage" />
          )}
        />
        <Autocomplete
          fullWidth={true}
          size="small"
          disablePortal
          options={["All", "Draft", "Published"]}
          sx={{ width: 300 }}
          renderInput={(params) => (
            <TextField size="small" {...params} label="Tag" />
          )}
        />
        <Button size="small" variant="contained" color="warning">
          Clear Filter
        </Button>
        <Button size="small" variant="contained">
          Set Filter
        </Button>
      </Box>
      {/* <PostList /> */}
      <BasicTable />
      <ButtonGroup
        size="small"
        variant="contained"
        color="warning"
        fullWidth={true}
      >
        <Button color="info">Set To Publish</Button>
        <Button color="warning">Set To Draft</Button>
        <Button color="error">Delete</Button>
      </ButtonGroup>
    </Box>
  );
};
