const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
    property: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Property',
        required: true,
    },
    username: {
        type: String,
    },
    documentPath: {
        type: String,
        required: true,
    },
});

const Document = mongoose.model('Document', documentSchema);

module.exports = Document;
