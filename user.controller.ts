import { NextFunction, Request, Response } from "express";
import { randomUUID, createHash } from "node:crypto";

import jwt from "jsonwebtoken";

import fs from "fs";
import { join } from "path";

const filePath = join(__dirname, "../../db.json");

interface User {
  id?: string;
  name: string;
  password: string;
  role: string;
}

const secretKey = "minha_chave_secreta";
const secretePepper = "valor_secreto_do_pepper";

class UserController {
  getUsers(): User[] {
    const data = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(data);
  }

  saveUser(users: User[]): void {
    fs.writeFileSync(filePath, JSON.stringify(users, null, "\t"));
  }

  hashString(value: string): string {
    const hash = createHash("sha256");
    hash.update(value + secretePepper);

    return hash.digest("hex");
  }

  handleLogin(req: Request): boolean | string {
    const { name, password } = req.body;
    const data = this.getUsers();

    const hashedPassword = this.hashString(password);

    const user = data.find(
      (u: User) => u.name === name && u.password === hashedPassword
    );

    if (user) {
      const token = jwt.sign({ userId: user.id }, secretKey, {
        expiresIn: "5m",
      });

      return token;
    } else {
      return false;
    }
  }

  verifyToken(req: Request, res: Response, next: NextFunction) {
    const token = req.headers.authorization;

    if (!token) {
      return res.status(403).json({ message: "Token não fornecido!" });
    }

    jwt.verify(token.split(" ")[1], secretKey, (err, decoded) => {
      if (err) {
        if (err.name == "TokenExpiredError") {
          return res.status(401).json({ message: "Token expirado!" });
        }

        return res.status(401).json({ message: "Token inválido!" });
      }

      next();
    });
  }

  createUser(req: Request): boolean {
    try {
      const users = this.getUsers();
      const { name, password, role } = <User>req.body;

      const uuid = randomUUID();
      const hashedPassword = this.hashString(password);

      users.push({
        name,
        password: hashedPassword,
        role,
        id: uuid,
      });

      this.saveUser(users);

      return true;
    } catch (error) {
      return false;
    }
  }

  updateUser(req: Request): boolean {
    try {
      const users = this.getUsers();

      if (req.body.password) {
        req.body.password = this.hashString(req.body.password);
      }

      this.saveUser(
        users.map((user) => {
          if (user.id == req.params.uuid) {
            return {
              ...user,
              ...req.body,
            };
          }

          return user;
        })
      );

      return true;
    } catch (error) {
      return false;
    }
  }

  removeUser(req: Request): boolean {
    try {
      const users = this.getUsers();
      this.saveUser(users.filter((user) => user.id !== req.params.uuid));

      return true;
    } catch (error) {
      return false;
    }
  }
}

export default new UserController();
