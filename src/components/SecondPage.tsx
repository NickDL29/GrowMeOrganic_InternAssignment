import React, { useEffect, useState } from "react";
import Typography from "@mui/material/Typography";
import { useNavigate } from "react-router-dom";
import { DataGrid, GridColDef, GridRowsProp } from "@mui/x-data-grid";
import axios from "axios";
import Post from "./Post";
import { List, ListItem, ListItemText, Collapse, Checkbox, Button, Box } from "@mui/material";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";

interface Department {
  department: string;
  sub_departments: string[];
}

interface SubDepartmentsState {
  [subDept: string]: boolean;
}

const SecondPage: React.FC = () => {
  const navigate = useNavigate();

  // Check if user details exist in local storage
  useEffect(() => {
    const userDetails = localStorage.getItem("userDetails");
    if (!userDetails) {
      alert("Please enter your details before accessing this page.");
      navigate("/");
    }
  }, [navigate]);

  const [posts, setPosts] = useState<GridRowsProp>([]);
  const [expandedDepartments, setExpandedDepartments] = useState<Record<string, boolean>>({});

  const [departmentsState, setDepartmentsState] = useState<Record<string, boolean | SubDepartmentsState>>({});

  // Fetch data from the API
  useEffect(() => {
    axios
      .get<Post[]>("https://jsonplaceholder.typicode.com/posts")
      .then((response) => {
        const formattedPosts = response.data.map((post) => ({
          id: post.id,
          userId: post.userId,
          title: post.title,
          body: post.body,
        }));
        setPosts(formattedPosts);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  }, []);

  const columns: GridColDef[] = [
    { field: "id", headerName: "ID", width: 100 },
    { field: "userId", headerName: "User-ID", width: 100 },
    { field: "title", headerName: "Title", width: 400 },
    { field: "body", headerName: "Body", width: 600 },
  ];

  const handleExpandDepartment = (department: string) => {
    setExpandedDepartments((prevExpanded) => ({
      ...prevExpanded,
      [department]: !prevExpanded[department],
    }));
  };

  const handleDepartmentCheckboxChange = (department: string, checked: boolean) => {
    // Set the state for the main department checkbox
    setDepartmentsState((prevState) => ({
      ...prevState,
      [department]: checked,
    }));

    // If checked, set all sub-departments to true
    if (checked) {
      const subDepartments = departments.find((dept) => dept.department === department)?.sub_departments;
      if (subDepartments) {
        const subDeptState: SubDepartmentsState = subDepartments.reduce(
          (acc, subDept) => ({ ...acc, [subDept]: true }),
          {}
        );
        setDepartmentsState((prevState) => ({
          ...prevState,
          [department]: subDeptState,
        }));
      }
    }
  };

  const handleSubDepartmentCheckboxChange = (
    department: string,
    subDept: string,
    checked: boolean
  ) => {
    setDepartmentsState((prevState) => ({
      ...prevState,
      [department]: {
        ...(prevState[department] as SubDepartmentsState),
        [subDept]: checked,
      },
    }));
  };

  const isDepartmentChecked = (department: string) => {
    const subDepts = departments.find((dept) => dept.department === department)?.sub_departments;
    if (!subDepts) return false;

    const allSubDeptsChecked = subDepts.every(
      (subDept) => (departmentsState[department] as SubDepartmentsState)?.[subDept] === true
    );
    const someSubDeptsChecked = subDepts.some(
      (subDept) => (departmentsState[department] as SubDepartmentsState)?.[subDept] === true
    );

    return allSubDeptsChecked ? true : someSubDeptsChecked ? "indeterminate" : false;
  };

  const isSubDepartmentChecked = (department: string, subDept: string) => {
    return (departmentsState[department] as SubDepartmentsState)?.[subDept] || false;
  };

  const departments: Department[] = [
    {
      department: "customer_service",
      sub_departments: ["support", "customer_success"],
    },
    {
      department: "design",
      sub_departments: ["graphic_design", "product_design", "web_design"],
    },
  ];

  const navigateBack = (event: React.FormEvent) => {
    event.preventDefault();
    navigate("/");
  };

  return (
    <>
      <Box mt={4} width="100%" display="flex" alignItems="center">
        <Typography variant="h2" gutterBottom marginRight={2}>
          Second Page
        </Typography>
        <Button onClick={navigateBack} variant="contained" color="primary">
          Go Back
        </Button>
      </Box>
      <Typography variant="h3" gutterBottom>
        Table:
      </Typography>
      <div style={{ height: "500px", width: "100%" }}>
        <DataGrid rows={posts} columns={columns} />
      </div>

      <br />

      <Typography variant="h3" gutterBottom>
        Department List:
      </Typography>

      <List>
        {departments.map((dept) => {
          const departmentChecked = isDepartmentChecked(dept.department);
          const expanded = expandedDepartments[dept.department];

          return (
            <React.Fragment key={dept.department}>
              <ListItem button onClick={() => handleExpandDepartment(dept.department)}>
                <Checkbox
                  checked={departmentChecked === true}
                  indeterminate={departmentChecked === "indeterminate"}
                  onChange={(event) =>
                    handleDepartmentCheckboxChange(dept.department, event.target.checked)
                  }
                />
                <ListItemText primary={`${dept.department} (${dept.sub_departments.length})`} />
                {expanded ? <ExpandLess /> : <ExpandMore />}
              </ListItem>

              <Collapse in={expanded} timeout="auto">
                <List component="div" disablePadding>
                  {dept.sub_departments.map((subDept) => (
                    <ListItem key={subDept} button sx={{ marginLeft: 4 }}>
                      <Checkbox
                        checked={isSubDepartmentChecked(dept.department, subDept)}
                        onChange={(event) =>
                          handleSubDepartmentCheckboxChange(
                            dept.department,
                            subDept,
                            event.target.checked
                          )
                        }
                      />
                      <ListItemText primary={subDept} />
                    </ListItem>
                  ))}
                </List>
              </Collapse>
            </React.Fragment>
          );
        })}
      </List>
    </>
  );
};

export default SecondPage;
