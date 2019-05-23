const { Router } = require("express")
const { Negotiation } = require("../models")

module.exports = Router()
  .use("/tokens", require("./tokens"))
  .use("/users", require("./users"))
  .use("/arts", require("./arts"))
  .use("/commissions", require("./commissions"))
  .use("/commissions/:commissionId/negotiations", require("./negotiations"))
  .use("/commissions")
  // .use(
  //   "/commissions/:commissionId/negotiations/:artistId/chats",
  //   require("./chats")
  // )
  // TODO: put all this in negotiations
  .get("/negotiations", async (req, res) => {
    const negotiations = await Negotiation.query()
      .selectWithAvatars()
      .where("artist_id", req.user.id)
      .where("is_artist", true)
      .where("finalized", false)
      .paginate(req.query.after, "commission_id")

    res.send(negotiations)
  })
  .use("/stripe", require("./stripe"))
  .use("/reviews", require("./reviews"))
  .use("/commissions/:commissionId/updates", require("./updates"))
  .use("/transactions", require("./transactions"))
  .use("/reports", require("./reports"))
