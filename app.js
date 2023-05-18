const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

const databasePath = path.join(__dirname, "todoApplication.db");

const app = express();
app.use(express.json());

let database = null;

const initializeDbAndServer = async () => {
  try {
    database = await open({
      filename: databasePath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () =>
      console.log("Server Running at http://localhost:3000/")
    );
  } catch (error) {
    console.log(`DB Error: '${error.message}'`);
    process.exit(1);
  }
};

initializeDbAndServer();

const hasStatusAndPriorityProperties = (requestQuery) => {
  return (
    requestQuery.status !== undefined && requestQuery.priority !== undefined
  );
};

const hasCategoryAndPriorityProperties = (requestQuery) => {
  return (
    requestQuery.category !== undefined && requestQuery.priority !== undefined
  );
};

const hasCategoryAndStatusProperties = (requestQuery) => {
  return (
    requestQuery.category !== undefined && requestQuery.status !== undefined
  );
};

const hasPriorityProperty = (requestQuery) => {
  return requestQuery.priority !== undefined;
};

const hasStatusProperty = (requestQuery) => {
  return requestQuery.status !== undefined;
};

const hasCategoryProperty = (requestQuery) => {
  return requestQuery.category !== undefined;
};

const hasDueDateProperty = (requestQuery) => {
  return requestQuery.dueDate !== undefined;
};

app.get("/todos/", async (request, response) => {
  const { search_q = "", status, priority, category } = request.query;
  let data = null;
  let getTodosQuery = "";

  switch (true) {
    case hasStatusAndPriorityProperties(request.query):
      getTodosQuery = ` 
            SELECT 
              * 
            FROM 
             todo 
            WHERE 
             todo LIKE '%${search_q}%'AND
             status = '${status}' AND 
             priority = '${priority}';`;
      break;

    case hasCategoryAndPriorityProperties(request.query):
      getTodosQuery = ` 
            SELECT 
              * 
            FROM 
              todo
            WHERE 
              todo LIKE '%${search_q}%' AND 
              category = '${category} AND 
              priority = '${priority};`;
      break;

    case hasCategoryAndStatusProperties(request.query):
      getTodosQuery = `
            SELECT 
              * 
            FROM 
             todo 
            WHERE 
             todo LIKE '%${search_q}%' AND 
             category = '${category}' AND 
             status = '${status}';`;
      break;

    case hasStatusProperty(request.query):
      getTodosQuery = `
            SELECT 
              * 
            FROM 
              todo 
            WHERE 
              todo LIKE '%${search_q}%' AND 
              status = '${status}';`;
      break;

    case hasPriorityProperty(request.query):
      getTodosQuery = `
            SELECT 
              *
            FROM 
             todo
            WHERE 
             todo LIKE '%${search_q}%' AND 
             priority = '${priority}';`;
      break;

    case hasCategoryProperty(request.query):
      getTodosQuery = `
            SELECT 
              * 
            FROM 
             todo
            WHERE 
             todo LIKE '%${search_q}%' AND 
             category = '${category}';`;
      break;

    default:
      getTodosQuery = `
            SELECT 
              * 
            FROM 
             todo 
            WHERE 
              todo LIKE  '%${search_q}%';`;
  }

  data = await database.get(getTodosQuery);
  response.send(data);
});

app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.body;
  const getTodoQuery = `
    SELECT 
      * 
    FROM 
     todo 
    WHERE 
     id = '${todoId}';`;

  const todo = await database.get(getTodoQuery);
  response.send(todo);
});

app.post("/todos/", async (request, response) => {
  const { id, todo, priority, status, category, dueDate } = request.body;
  const createTodoQuery = `
    INSERT INTO 
    todo (id, todo, priority, status, category, due_Date)
    VALUES('${id}','${todo}','${priority}','${status}','${category}','${dueDate}');`;

  await database.run(createTodoQuery);
  response.send("Todo Successfully Added");
});

app.get("/agenda/", async (request, response) => {
  const { date } = request.query;
  const getTodoQuery = `
    SELECT 
      * 
    FROM 
      todo 
    WHERE 
     due_date LIKE "2021-12-12" ;`;

  const TodoQuery = await database.get(getTodoQuery);
  response.send(TodoQuery);
});

app.put("/todos/:todoId/", async (request, response) => {
  const { search_q = "", status, priority, category, dueDate } = request.query;
  const { todoId } = request.params;
  let data = null;
  let updateTodoQuery = "";

  switch (true) {
    case hasStatusProperty(request.query):
      updateTodoQuery = `
            UPDATE 
             todo 
            SET 
             status = '${status}'
            WHERE 
             id = '${todoId}';`;
      break;
    case hasPriorityProperty(request.query):
      updateTodoQuery = `
            UPDATE 
             todo 
            SET 
             priority = '${priority}'
            WHERE 
             id = '${todoId}';`;
      break;
    case hasCategoryProperty(request.query):
      updateTodoQuery = `
            UPDATE 
             todo 
            SET 
             category = '${category}'
            WHERE 
             id = '${todoId}';`;
      break;
    case hasDueDateProperty(request.query):
      updateTodoQuery = `
            UPDATE 
             todo 
            SET 
             due_date = '${dueDate}'
            WHERE 
             id = '${todoId}';`;
      break;
    default:
      updateTodoQuery = `
            UPDATE 
             todo 
            SET 
             todo = '${search_q}'
            WHERE 
             id = '${todoId}';`;
  }
  data = await database.run(updateTodoQuery);
  response.send(`${request.query} Updated`);
});

app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const deleteTodoQuery = `
    DELETE 
     FROM 
      todo 
    WHERE 
     id = '${todoId}';`;

  await database.run(deleteTodoQuery);
  response.send("Todo Deleted");
});

module.exports = app;
