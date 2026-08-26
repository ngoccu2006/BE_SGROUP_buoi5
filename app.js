const express = require("express");

const userRouter = require("./routes/users.route");
const  errorHandler = require("./middlewares/errorHandler");
const app = express();

app.use(express.json());

app.use("/users", userRouter);

app.use(errorHandler);
const PORT = 3000;

app.listen(PORT, () =>{
  console.log(`Server running at http://localhost:${PORT}`);
})