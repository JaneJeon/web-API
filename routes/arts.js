const { Router } = require("express")
const upload = require("../config/multer")
const { Art } = require("../models")
const assert = require("http-assert")

module.exports = Router()
  .get("/", async (req, res) => {
    // FOR NOW, the results are not personalized
    const arts = await Art.paginate(req.query.after)

    res.send(arts)
  })
  .get("/:artId", async (req, res) => {
    const art = await Art.findById(req.params.artId)

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
