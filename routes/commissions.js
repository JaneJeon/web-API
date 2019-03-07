const { Router } = require("express")
const { Commission } = require("../models")

module.exports = Router()
  // commission board
  .get("/", async (req, res) => {
    // TODO: FOR NOW, the results are not personalized
    const commissions = await Commission.query()
      .skipUndefined()
      .whereNotDeleted()
      .where("is_private", false)
      .where("status", "open")
      .where("id", "<", req.query.after)
      .orderBy("id", "desc")
      .limit(process.env.PAGE_SIZE)

    res.send(commissions)
  })
  .get("/:commissionId", async (req, res) => {
    const commission = await Commission.findById(req.params.commissionId)

    res.send(commission)
  })
  .use((req, res, next) => next(req.ensureVerified()))
  .post("/", async (req, res) => {
    Commission.filterPost(req.body)

    const commission = await req.user.insert("commissionsAsBuyer", req.body)

    res.status(201).send(commission)
  })
  // change commission details, only available to the buyer
  .patch("/:commissionId", async (req, res) => {
    Commission.filterPatch(req.body)

    let commission = await req.user.findById(
      "commissionsAsBuyer",
      req.params.commissionId
    )
    commission = await commission.patch(req.body)

    res.send(commission)
  })
  // change commission status, only available to the artist
  // accept is set from notifications
  .patch("/:commissionId/reject", async (req, res) => {
    let commission = await req.user.findById(
      "commissionsAsArtist",
      req.params.commissionId
    )
    commission = await commission.patch({ status: "reject" })

    res.send(commission)
  })
  // TODO: completed, cancelled
  .delete("/:commissionId", async (req, res) => {
    const commission = await req.user.findById(
      "commissionsAsBuyer",
      req.params.commissionId
    )
    await commission.$query().delete()

    res.sendStatus(204)
  })
