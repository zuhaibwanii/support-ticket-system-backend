import mongoose, { Schema } from "mongoose";


const agentSchema = new Schema(
    {
        active: {
            type: Boolean,
            default: true
        },
        name: {
            type: String,
            required: true,
            trim: true,
            index: true
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },
        phone: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            minLength: 10,
            maxLength: 10,
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



export const Agent = mongoose.model("Agent", agentSchema)
