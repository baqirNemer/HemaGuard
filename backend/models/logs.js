const mongoose = require('mongoose');


const logSchema = mongoose.Schema(
    {
        _id: mongoose.Schema.Types.ObjectId,
        patient_email: {
            type: String,
            required: true
        },
        doctor_id: {
            type: mongoose.Schema.Types.ObjectId,
            required: true
        },
        category_id: {
            type: mongoose.Schema.Types.ObjectId,
            required: true
        },
        description: {
            type: String,
            required: true
        },
    },
    {
        timestamps: true,
        versionKey: false
    },
    {
    }
);

const Log = mongoose.model('logs', logSchema);

module.exports = Log;
