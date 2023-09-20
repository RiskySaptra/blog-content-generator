import { useEffect, useState } from "react";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import Checkbox from "@mui/material/Checkbox";
import { Stack } from "@mui/material";

const AllPosts = `
  query AllPosts($tag: Tag) {
    posts(where: {tag: $tag}) {
      id
      excerpt
      slug
      title
      date
    }
  }
`;

async function allPosts() {
  const data = await fetch(process.env.HYGRAPH_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + process.env.HYGRAPH_TOKEN,
    },
    body: JSON.stringify({
      query: AllPosts,
      variables: {
        // tag: "Food",
      },
    }),
  })
    .then((res) => res.json())
    .catch((err) => console.log(err));
  return data;
}

export default function PostList() {
  const [checked, setChecked] = useState([1]);
  const [data, setData] = useState([]);

  useEffect(() => {
    allPosts().then((res) => setData(res.data.posts));
  }, []);

  const handleToggle = (value) => () => {
    const currentIndex = checked.indexOf(value);
    const newChecked = [...checked];

    if (currentIndex === -1) {
      newChecked.push(value);
    } else {
      newChecked.splice(currentIndex, 1);
    }

    setChecked(newChecked);
  };

  return (
    <List dense sx={{ width: "100%", bgcolor: "background.paper" }}>
      {data.map((value) => {
        return (
          <ListItem
            divider
            key={value.id}
            secondaryAction={
              <Checkbox
                edge="end"
                onChange={handleToggle(value)}
                checked={false}
              />
            }
            disablePadding
          >
            <ListItemButton>
              <Stack>
                <ListItemText primary={`Title: ${value.title}`} />
                <ListItemText primary={`Slug: ${value.slug}`} />
              </Stack>
            </ListItemButton>
          </ListItem>
        );
      })}
    </List>
  );
}
