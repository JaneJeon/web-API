const tableName = "negotiations"

exports.up = knex =>
  knex.schema.createTable(tableName, table => {
    table
      .integer("commission_id")
      .references("commissions.id")
      .notNullable()
    table
      .text("artist_id")
      .references("users.id")
      .notNullable()
    table.text("user_type").notNullable()
    table.boolean("accepted").notNullable()
    table.boolean("finalized").notNullable()

    table.integer("price").notNullable()
    table.text("price_unit").notNullable()
    table.date("deadline").notNullable()
    table.integer("num_updates")
    table.text("copyright").notNullable()

    table.float("width")
    table.float("height")
    table.text("size_unit")

    table.timestamps(true, true)

    table.primary(["commission_id", "artist_id", "user_type"])
  })

exports.down = knex => knex.schema.dropTable(tableName)
