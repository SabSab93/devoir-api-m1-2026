import cors from "cors";
import express from "express";
import "dotenv/config";

const app = express();

app.use(cors());
app.use(express.json());

const apiRouter = express.Router();

apiRouter.get("/",(req,res) => {
    res.json({message: "hello world"})
})

app.use("/api", apiRouter);

const PORT= process.env.PORT || 3000;

app.listen(PORT, ()=> {
    console.log(`app listen port : ${PORT}`)
})