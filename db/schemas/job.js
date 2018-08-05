const mongoose = require('mongoose')

let Job_Schma = new mongoose.Schema({
    primary: {
        type: Object,
        required: true
    },
    company: {
        type: Object,
        required: true
    },
    updateAt: {
        type: Date,
        required: true
    },
    dataFromName: {
        type: String,
        required: true
    },
    datafrom: {
        type: Number,
        required: true
    },
    uniqueVal: {
        type: String,
        required: true,
        dropDups: true
    }
})

exports = module.exports = Job_Schma