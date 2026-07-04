import { Hono } from "hono";
import { listPackagesHandler } from "./packages.controller.js";

export const packagesRouter = new Hono();

packagesRouter.get("/", listPackagesHandler);
