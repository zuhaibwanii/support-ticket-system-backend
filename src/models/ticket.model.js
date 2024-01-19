import mongoose, { Schema } from "mongoose";


const ticketSchema = new Schema(
    {

        topic: {
            type: String,
            required: true,
            trim: true,
        },
        description: {
            type: String,
            required: true,
            trim: true,
        },
        severity: {
            type: String,
            required: true,
            trim: true,
        },
        type: {
            type: String,
            required: true,
            trim: true,
        },
        assignedTo: {
            type:  mongoose.Schema.Types.ObjectId,// Support Agent ID
            ref: 'Agent',
            default: null
        },
        status: {
            type: String,// New, Assigned, Resolved
            required: true,
            enum: ["New", "Assigned", "Resolved"],
            default: 'New'
        },

        resolvedOn: {
            type: Date,
            default: null
        },
        dateCreated: {
            type: Date,
            default: new Date()
        },
    },
    {
        timestamps: true
    }
)



export const Ticket = mongoose.model("Ticket", ticketSchema)