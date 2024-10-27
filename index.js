import express from "express";
import { config } from "dotenv";

import { globaleResponse } from "./src/Middlewares/index.js";
import db_connection from "./DB/connection.js";
import * as router from "./src/Modules/index.js";
import {disableCouponsCron } from "./src/Utils/index.js";
import { gracefulShutdown } from "node-schedule";

config();

const app = express();
const port = process.env.PORT || 5000;

app.use(express.json());

app.use("/categories", router.categoryRouter);
app.use("/sub-categories", router.subCategoryRouter);
app.use("/brands", router.brandRouter);
app.use("/products", router.productRouter);
app.use("/users", router.userRouter);
app.use("/addresses", router.addressRouter);
app.use("/carts", router.cartRouter);
app.use("/coupons", router.couponRouter);
app.use("/orders", router.orderRouter);
app.use("/reviews", router.reviewRouter);

app.use("*", (req, res,next) => 
  res.status(404).json({massage:"Route Not Found"})
);

app.use(globaleResponse);

db_connection();

disableCouponsCron();
gracefulShutdown()

app.get("/", (req, res) => res.send("Hello World!"));
app.listen(port, () => console.log(`Example app listening on port ${port}!`));
