const queue = require("../lib/queue")
const taskName = "checkCommissionUpdate"

exports.add = async (data, opts) => queue.add(taskName, data, opts)

queue.process(taskName, async (job, data) => {
  // TODO
})
