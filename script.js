
const inquirer = require("inquirer");
const mysql = require("mysql2/promise");

const connection = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

async function viewDepartments() {
  const [rows] = await connection.query("SELECT * FROM departments");
  console.table(rows);
  return start();
}

async function viewRoles() {
  const [rows] = await connection.query(`
    SELECT roles.id, roles.title, roles.salary, departments.name AS department
    FROM roles
    JOIN departments ON roles.department_id = departments.id
  `);
  console.table(rows);
  return start();
}

async function viewEmployees() {
  const [rows] = await connection.query(`
    SELECT employees.id, employees.first_name, employees.last_name, roles.title, departments.name AS department, roles.salary, CONCAT(manager.first_name, " ", manager.last_name) AS manager
    FROM employees
    JOIN roles ON employees.role_id = roles.id
    JOIN departments ON roles.department_id = departments.id
    LEFT JOIN employees AS manager ON employees.manager_id = manager.id
  `);
  console.table(rows);
  return start();
}

async function addDepartment() {
  const { name } = await inquirer.prompt({
    type: "input",
    name: "name",
    message: "What is the name of the department?",
  });

  await connection.query("INSERT INTO departments SET ?", { name });
  console.log(`Department ${name} added successfully!`);
  return start();
}

async function addRole() {
  const [departments] = await connection.query("SELECT * FROM departments");

  const { title, salary, departmentId } = await inquirer.prompt([
    {
      type: "input",
      name: "title",
      message: "What is the title of the role?",
    },
    {
      type: "input",
      name: "salary",
      message: "What is the salary of the role?",
    },
    {
      type: "list",
      name: "departmentId",
      message: "Which department does the role belong to?",
      choices: departments.map((department) => ({
        name: department.name,
        value: department.id,
      })),
    },
  ]);

  await connection.query("INSERT INTO roles SET ?", {
    title,
    salary,
    department_id: departmentId,
  });
  console.log(`Role ${title} added successfully!`);
  return start();
}

async function addEmployee() {
  const [roles] = await connection.query("SELECT * FROM roles");

  const { firstName, lastName, roleId, managerId } = await inquirer.prompt([
    {
      type: "input",
      name: "firstName",
      message: "What is the employee's first name?",
    },
    {
      type: "input",
      name: "lastName",
      message: "What is the employee's last name?",
    },
    {
      type: "list",
      name: "roleId",
      message: "What is the employee's role?",
      choices: roles.map((role) => ({ name: role.title, value: role.id })),
    },
    {
      type: "input",
      name: "managerId",
      message: "What is the employee's manager ID?",
    },
  ]);

 await connection.query("INSERT INTO employees SET ?", {
    first_name: firstName,
    last_name: lastName,
    role_id: roleId,
    manager_id: managerId
    
  });
  console.log(`Role ${title} added successfully!`);
  return start();
}