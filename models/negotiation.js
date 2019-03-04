const BaseModel = require("./base")
const assert = require("assert")

class Negotiation extends BaseModel {
  static get idColumn() {
    return ["commission_id", "artist_id", "is_artist"]
  }

  static get jsonSchema() {
    return {
      type: "object",
      properties: {
        artistId: { type: "string" },
        isArtist: { type: "boolean" },
        accepted: { type: "boolean", default: false },
        finalized: { type: "boolean", default: false },
        price: { type: "string", pattern: "^\\d+$" },
        priceUnit: { type: "string", enum: ["USD"], default: "USD" },
        deadline: { type: "string", format: "date" }, // ISO format
        numUpdates: { type: "integer", minimum: 0, maximum: 5, default: 0 },
        copyright: {
          type: "string",
          enum: ["artist owns the right", "buyer owns the right"]
        },
        updatedAt: { type: "string" }
      },
      required: ["artistId", "isArtist", "price", "deadline", "copyright"],
      additionalProperties: false
    }
  }

  static get relationMappings() {
    return {
      chats: {
        relation: BaseModel.HasManyRelation,
        modelClass: "chat",
        join: {
          from: [
            "negotiations.commission_id",
            "negotiations.artist_id",
            "negotiations.is_artist"
          ],
          to: ["chats.commission_id", "chats.artist_id", "chats.dummy_field"]
        }
      }
    }
  }

  static get autoFields() {
    return ["isArtist", "accepted", "finalized", "updatedAt"]
  }

  processInput(opt) {
    if (this.price) {
      this.price -= 0
      assert(this.price >= process.env.MIN_PRICE, 400)
    }
    this.updatedAt = `${+new Date()}/${this.id || opt.old.id}`
  }

  $beforeInsert(queryContext) {
    super.$beforeInsert(queryContext)
    this.processInput()
  }

  $beforeUpdate(opt, queryContext) {
    super.$beforeUpdate(opt, queryContext)
    this.processInput(opt)
  }
}

module.exports = Negotiation
