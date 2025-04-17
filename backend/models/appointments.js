const mongoose = require('mongoose');

const appointmentSchema = mongoose.Schema(
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
        description: {
            type: String,
            required: true
        },
        date: {
            type: Date,
            required: true
        }
    },
    {
        timestamps: true,
        versionKey: false,
        collection: 'appointments'
    }
);

const Appointment = mongoose.model('appointments', appointmentSchema);

module.exports = Appointment;
