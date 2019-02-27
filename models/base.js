const { Model } = require("objection")
const { DbErrors } = require("objection-db-errors")
const { default: visibility } = require("objection-visibility")
const { plural } = require("pluralize")

class BaseModel extends visibility(DbErrors(Model)) {
  static get tableName() {
    return plural(this.name.toLowerCase())
  }

  static get modelPaths() {
    return [__dirname]
  }

  static get isSoftDelete() {
    return this.namedFilters && this.namedFilters.hasOwnProperty("deleted")
  }

  static async findById(id) {
    let q = this.query().findById(id)
    if (this.isSoftDelete) q = q.whereNotDeleted()
    return q.throwIfNotFound()
  }

  static async paginate(after) {
    let q = this.query()
      .skipUndefined()
      .where("id", "<", after)
    if (this.isSoftDelete) q = q.whereNotDeleted()
    return q.orderBy("id", "desc").limit(process.env.PAGE_SIZE)
  }

  async paginate(ref, after) {
    let q = this.$relatedQuery(ref)
      .skipUndefined()
      .where("id", "<", after)
    if (this.constructor.isSoftDelete) q = q.whereNotDeleted()
    return q.orderBy("id", "desc").limit(process.env.PAGE_SIZE)
  }
}

module.exports = BaseModel
