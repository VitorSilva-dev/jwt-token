import { NextFunction, Request, Response, Router } from "express";
import userController from "../controllers/user.controller";

const usersRoute = Router();

usersRoute.get(
  "/login",
  async (req: Request, res: Response, next: NextFunction) => {
    const verifyUser = await userController.handleLogin(req);

    if (verifyUser) {
      res.status(200).json({ message: "Logado!", token: verifyUser });
    } else {
      res.status(401).json({ message: "Credenciais inválidas!" });
    }
  }
);

usersRoute.get(
  "/users",
  userController.verifyToken,
  (req: Request, res: Response, next: NextFunction) => {
    res.json({
      message: "Conteúdo protegido acessado com sucesso!",
      content: userController.getUsers(),
    });
  }
);

usersRoute.post(
  "/users",
  userController.verifyToken,
  async (req: Request, res: Response, next: NextFunction) => {
    const verifyCreate = await userController.createUser(req);

    if (verifyCreate) {
      res.status(201).json({
        message: "Usuário criado com sucesso!",
      });
    } else {
      res.status(400).json({
        message: "Ocorreu um erro ao criar o usuário!",
      });
    }
  }
);

usersRoute.put(
  "/users/:uuid?",
  userController.verifyToken,
  async (req: Request, res: Response, next: NextFunction) => {
    const verifyCreate = await userController.updateUser(req);

    if (verifyCreate) {
      res.status(201).json({
        message: "Usuário atualizado com sucesso!",
      });
    } else {
      res.status(400).json({
        message: "Ocorreu um erro ao atualizar o usuário!",
      });
    }
  }
);

usersRoute.delete(
  "/users/:uuid?",
  userController.verifyToken,
  async (req: Request, res: Response, next: NextFunction) => {
    const verifyCreate = await userController.removeUser(req);

    if (verifyCreate) {
      res.status(201).json({
        message: "Usuário deletado com sucesso!",
      });
    } else {
      res.status(400).json({
        message: "Ocorreu um erro ao deletar o usuário!",
      });
    }
  }
);

export default usersRoute;
