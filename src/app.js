const express = require("express");
const cors = require("cors"); 
const userRouter = require("./modules/users/users.route");
const  errorHandler = require("./middlewares/errorHandler");
const app = express();
const setupSwagger = require("./config/swagger");

app.use(cors()); 
app.use(express.json());

// Kích hoạt cổng giao diện tài liệu API tự động
setupSwagger(app); 

app.use("/users", userRouter);

app.use(errorHandler);
const PORT = 3000;

app.listen(PORT, () =>{
  console.log(`Server running at http://localhost:${PORT}`);
})