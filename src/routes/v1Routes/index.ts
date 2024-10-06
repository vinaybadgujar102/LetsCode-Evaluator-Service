import express from "express";
import { pingCheck } from "../../controllers/pingController";

const v1Router = express.Router();

// @ts-expect-error i dont know why this error is coming
v1Router.get("/ping", pingCheck);

export default v1Router;
