const cors = require("cors");
const express = require("express");
const helmet = require("helmet");
const monk = require("monk");
const morgan = require("morgan");
const yup = require("yup");
const { nanoid } = require("nanoid");
require("dotenv").config();

const app = express();

const db = monk("mongodb+srv://competitivewithamit:@mitH@ritw@l@cluster0.b6bxr.mongodb.net/url?retryWrites=true&w=majority");
const urls = db.get("urls");
urls.createIndex("name");

app.use(helmet());
app.use(morgan("tiny"));
app.use(cors());
app.use(express.json());

app.get("/:id", async (req, res) => {
  try {
    const { id: slug } = req.params;
    const exisiting = await urls.findOne({ slug });
    if (!exisiting) {
      return res.status(400).json({
        message: "not Found in database",
      });
    }
    return res.status(200).json({ exisiting });
  } catch (error) {
    console.log(error);
    return res.status(400).json({
      message: "In-valid information",
    });
  }
});

const schema = yup.object().shape({
  slug: yup
    .string()
    .trim()
    .matches(/[\w\-]/),
  url: yup.string().trim().url().required(),
});

app.post("/url", async (req, res, next) => {
  let { slug, url } = req.body;
  console.log(req.body);
  try {
    if (!slug) {
      slug = nanoid(5);
    } else {
      const exisiting = await urls.findOne({ slug });
      if (exisiting) {
        console.log("already exist");
        return res.status(400).json({
          message: "already exist",
        });
      }
    }
    await schema.validate({
      slug,
      url,
    });
    slug = slug.toLowerCase();
    const newUrl = {
      slug,
      url,
    };
    const created = await urls.insert(newUrl);
    return res.status(200).json({
      slug,
      url,
    });
  } catch (error) {
    console.log(error);
    return res.status(400).json({
      message: "In-valid information",
    });
  }
});
const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`lising at http://localhost:${port}`);
});
