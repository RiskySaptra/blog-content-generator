import { useEffect, useState } from "react";

import { styled } from "@mui/material/styles";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell, { tableCellClasses } from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import Pagination from "@mui/material/Pagination";
import PaginationItem from "@mui/material/PaginationItem";
import Stack from "@mui/material/Stack";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: theme.palette.common.black,
    color: theme.palette.common.white,
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  "&:nth-of-type(odd)": {
    backgroundColor: theme.palette.action.hover,
  },
  // hide last border
  "&:last-child td, &:last-child th": {
    border: 0,
  },
}));

const tag = "";

const AllPosts = `
  query AllPosts(${tag && "$tag: Tag"}) {
    posts(${tag && "where: {tag: $tag}"}) {
        id
        title
        tag
        date
        stage
        slug
        author {
          name
          picture {
            id
            url
          }
        }
        visitedCount {
          viewed
        }
      }
  }
`;

async function allPosts() {
  const data = await fetch(process.env.HYGRAPH_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      // Authorization: "Bearer " + process.env.HYGRAPH_TOKEN,
    },
    body: JSON.stringify({
      query: AllPosts,
      variables: {
        tag,
      },
    }),
  })
    .then((res) => res.json())
    .catch((err) => console.log(err));
  return data;
}

export default function CustomizedTables() {
  const [data, setData] = useState([]);

  useEffect(() => {
    allPosts().then((res) => setData(res.data.posts));
  }, []);

  return (
    <>
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 700 }} aria-label="customized table">
          <TableHead>
            <TableRow>
              <StyledTableCell>Title</StyledTableCell>
              <StyledTableCell>Slug</StyledTableCell>
              <StyledTableCell>Tag</StyledTableCell>
              <StyledTableCell>Stages</StyledTableCell>
              <StyledTableCell>Author</StyledTableCell>
              <StyledTableCell>Visited</StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((row) => (
              <StyledTableRow key={row.id}>
                <StyledTableCell>{row.title}</StyledTableCell>
                <StyledTableCell>{row.slug}</StyledTableCell>
                <StyledTableCell>{row.tag}</StyledTableCell>
                <StyledTableCell>{row.stage}</StyledTableCell>
                <StyledTableCell>{row.author?.name}</StyledTableCell>
                <StyledTableCell>{row.visitedCount?.viewed}</StyledTableCell>
              </StyledTableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      {/* <TablePagination /> */}
    </>
  );
}

function TablePagination() {
  return (
    <Stack spacing={2}>
      <Pagination
        // rowsPerPage={10}
        count={10}
        renderItem={(item) => (
          <PaginationItem
            slots={{ previous: ArrowBackIcon, next: ArrowForwardIcon }}
            {...item}
          />
        )}
      />
    </Stack>
  );
}
