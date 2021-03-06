const { Router } = require("express")
const { Commission, Review } = require("../models")
const assert = require("http-assert")
const { ensureIsVerified, ensureHasPayment } = require("../lib/middlewares")

module.exports = Router()
  // commission board
  .get("/", async (req, res) => {
    // TODO: FOR NOW, the results are not personalized
    const commissions = await Commission.query()
      .selectWithAvatars()
      .where("is_private", false)
      .where("status", "open")
      .paginate(req.query.after)

    res.send(commissions)
  })
  .get("/:commissionId", async (req, res) => {
    const commission = await Commission.query()
      .selectWithAvatars()
      .findById(req.params.commissionId)

    res.send(commission)
  })
  .use(ensureIsVerified)
  .get("/:commissionId/transactions", async (req, res) => {
    const commission = await Commission.query().findById(
      req.params.commissionId
    )

    // check that you're either the artist or the buyer
    // (and, of course, the artist field could be empty)
    commission.ensureIsArtistOrBuyer(req.user)

    const transactions = await commission
      .$relatedQuery("transactions")
      .selectWithAvatars()
      .paginate(req.query.after)

    res.send(transactions)
  })
  .post("/", ensureHasPayment, async (req, res) => {
    Commission.filterPost(req.body)

    const commission = await req.user
      .$relatedQuery("commissionsAsBuyer")
      .insert(req.body)

    res.status(201).send(commission)
  })
  // add a review about the other party
  .post("/:commissionId/reviews", async (req, res) => {
    Review.filterPost(req.body)

    const commission = await Commission.query().findById(
      req.params.commissionId
    )

    commission.ensureIsArtistOrBuyer(req.user)
    assert(
      commission.status == "completed" || commission.status == "cancelled",
      405
    )

    req.body.revieweeId =
      req.user.id == commission.buyerId
        ? commission.artistId
        : commission.buyerId
    req.body.reviewerId = req.user.id

    const review = commission.$relatedQuery("reviews").insert(req.body)

    res.status(201).send(review)
  })
  // change commission details, only available to the buyer
  .patch("/:commissionId", async (req, res) => {
    Commission.filterPatch(req.body)

    let commission = await req.user
      .$relatedQuery("commissionsAsBuyer")
      .findById(req.params.commissionId)
    commission = await commission.$query().patch(req.body)

    res.send(commission)
  })
  // change commission status, only available to the artist
  // accept is set from notifications
  .patch("/:commissionId/reject", async (req, res) => {
    let commission = await req.user
      .$relatedQuery("commissionsAsArtist")
      .findById(req.params.commissionId)

    assert(commission.status == "open", 405)

    commission = await commission.$query().patch({ status: "reject" })

    res.send(commission)
  })
  .patch("/:commissionId/cancel", async (req, res) => {
    let commission = await Commission.query().findById(req.params.commissionId)

    commission.ensureIsArtistOrBuyer(req.user)
    assert(
      commission.status == "accepted" || commission.status == "in progress",
      405
    )

    commission = await commission.$query().patch({ status: "cancelled" })

    res.send(commission)
  })
  .delete("/:commissionId", async (req, res) => {
    const commission = await req.user
      .$relatedQuery("commissionsAsBuyer")
      .findById(req.params.commissionId)
    await commission.$query().patch({ deleted: true })

    res.sendStatus(204)
  })
