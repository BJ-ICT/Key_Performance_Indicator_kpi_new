import mongoose from "mongoose";

const emailRecipientSchema = new mongoose.Schema({
    email: { type: String, required: true },
});

// module.exports = mongoose.model('EmailRecipient', emailRecipientSchema);

const emailRecipient = mongoose.model("EmailRecipient",emailRecipientSchema);

export default emailRecipient;