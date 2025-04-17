const mongoose = require('mongoose');

const DoctorsSchema = mongoose.Schema(
    {
        doctor_email: {
            type: String,
            required: true
        },
        hospital_id: {
            type: mongoose.Schema.Types.ObjectId,
            required: true
        }
    },
    {
        timestamps: true,
        versionKey: false
    },
    {
        collection: 'doctors'
    }
);

const Doctors = mongoose.model('doctors', DoctorsSchema);

module.exports = Doctors;
