const mongoose = require('mongoose');


const categorySchema = mongoose.Schema(
    {
        _id: mongoose.Schema.Types.ObjectId,
        cname: {
            type: String,
            required: true
        }
    },
    {
        timestamps: true,
        versionKey: false
    },
    {
        collection: 'categories'
    }
);

const Category = mongoose.model('categories', categorySchema);

module.exports = Category;
