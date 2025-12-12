const mongoose = require("mongoose");
const { Schema } = mongoose;

const supportSchema = new Schema(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        email: {
            type: String,
            required: true,
        },
        content: {
            type: String,
            required: true,
        },
        attachments: [
            {
                type: String, // URL to the file
            },
        ],
        status: {
            type: String,
            enum: ["open", "closed", "pending"],
            default: "open",
        },
        isRead: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("SupportMessage", supportSchema);
