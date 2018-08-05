require('./connent')
const mongoose = require('mongoose')

const Job_Schema = require('./schemas/job')
const Job = mongoose.model('Job', Job_Schema)

exports.Job = Job