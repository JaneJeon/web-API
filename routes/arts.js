const { Router } = require("express")
const upload = require("../config/multer")
const { Art } = require("../models")
const assert = require("http-assert")
const POSTGRES_MAX_INT = 2147483647

module.exports = Router()
  .get("/", async (req, res) => {
    // FOR NOW, we're using id as the bookmark
    // FOR NOW, the results are not personalized
    const arts = await Art.query()
      .where("id", "<", req.body.after || POSTGRES_MAX_INT)
      .orderBy("id", "desc")
      .limit(process.env.PAGE_SIZE)

    res.send(arts)
  })
  .get("/:artId", async (req, res) => {
    const art = await Art.query().findById(req.params.artId)

    res.send(art)
  })
  .use((req, res, next) => next(assert(req.user && req.user.verified, 401)))
  .post(
    "/",
    upload.array("picture", process.env.MAX_PICTURE_ATTACHMENTS),
    async (req, res) => {
      const { title, description, price, medium } = req.body
      const pictures = req.files.map(file => file.path)
      const art = await req.user
        .$relatedQuery("arts")
        .insert({ title, description, price, medium, pictures })

      res.status(201).send(art)
    }
  )