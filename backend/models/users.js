const mongoose = require('mongoose');

const userSchema = mongoose.Schema(
    {
        id: {
            type: Number,
            required: true
        },
        pass: {
            type: String,
            required: true
        },
        f_name: {
            type: String,
            required: true
        },
        l_name: {
            type: String,
            required: true
        },
        location_id: {
            type: mongoose.Schema.Types.ObjectId,
            required: true
        },
        email: {
            type: String,
            required: true
        },
        phone: {
            type: String,
            required: true
        },
        dob: {
            type: Date,
            required: true
        },
        blood_type: {
            type: String,
            required: true
        },
        role_name: {
            type: String,
            required: true,
            default: 'patient'
        },
        image: {
            type: String,
            required: false,
            default: 'https://i.ibb.co/chBcjyv/default-profile-picture-male-icon.png'
        }
    },
    {
        timestamps: true,
        versionKey: false,
        collection: 'users'
    },
);

const User = mongoose.model('user', userSchema);
module.exports = User;
