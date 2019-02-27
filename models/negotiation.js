const BaseModel = require("./base")

class Negotiation extends BaseModel {
  static get idColumn() {
    return ["commission_id", "artist_id", "user_type"]
  }

  static get jsonSchema() {
    return {
      type: "object",
      properties: {
        artistId: { type: "string" },
        userType: { type: "string", enum: ["artist", "buyer"] },
        accepted: { type: "boolean", default: false },
        price: { type: "integer", minimum: 5 },
        priceUnit: { type: "string", enum: ["USD"], default: "USD" },
        deadline: { type: "string", format: "date" }, // ISO format
        numUpdates: { type: "integer", minimum: 0, maximum: 5 },
        copyright: {
          type: "string",
          enum: ["artist owns the right", "buyer owns the right"]
        },
        width: { type: "number", exclusiveMinimum: 0 },
        height: { type: "number", exclusiveMinimum: 0 },
        sizeUnit: { type: "string", enum: ["px", "in", "cm"], default: "px" }
      },
      required: ["artistId", "userType", "price", "deadline", "copyright"],
      additionalProperties: false
    }
  }

  static get autoFields() {
    return ["userType", "accepted"]
  }
}

module.exports = Negotiation