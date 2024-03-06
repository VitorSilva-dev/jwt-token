import express from "express";
import usersRoute from "./routes/user.routes";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(usersRoute);

app.listen(5000, () => {
  console.log("Aplicação executando na porta 5000!");
});
