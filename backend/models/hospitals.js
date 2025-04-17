const mongoose = require('mongoose');

const hospitalSchema = mongoose.Schema(
    {
        _id: mongoose.Schema.Types.ObjectId,
        
        location_id: {
            type: mongoose.Schema.Types.ObjectId,
            required: true
        },
        name: {
            type: String,
            required: true
        },
        phone: {
            type: String,
            required: true
        },
        image: {
            type: String,
            required: false
        },
        description: {
            type: String,
            required: false
        },
    },
    {
        timestamps: true,
        versionKey: false
    },
    {
        collection: 'hospitals'
    }
);


const Hospital = mongoose.model('hospitals', hospitalSchema);

module.exports = Hospital;
