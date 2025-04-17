const mongoose = require('mongoose');

const locationSchema = mongoose.Schema(
    {
        _id: mongoose.Schema.Types.ObjectId,
        city: {
            type: String,
            required: true
        },
        street : {
            type: String,
            required: true
        },
        address1 : { 
            type: String,
            required: true
        },
        address2 : {
            type: String,
            required: false
        },

    },
    {
        timestamps: true,
        versionKey: false
    },
    {
        collection: 'locations'
    }

);

const Locaton = mongoose.model('locations', locationSchema);
module.exports = Locaton;
