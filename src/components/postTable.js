import { useEffect, useState } from "react";

import { styled } from "@mui/material/styles";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell, { tableCellClasses } from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import TablePagination from "@mui/material/TablePagination";
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
        <Table>
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
      <TablePaginationCustom />
    </>
  );
}

function TablePaginationCustom() {
  const [page, setPage] = useState(2);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <TablePagination
      component="div"
      count={100}
      page={page}
      onPageChange={handleChangePage}
      rowsPerPage={rowsPerPage}
      onRowsPerPageChange={handleChangeRowsPerPage}
    />
  );
}
