//models
import { Agent } from "../models/agent.model.js"

//utils
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js";
import isEmpty from "../utils/isEmpty.js";

const createAgent = async (req, res) => {
    try {
        let { name, email, phone } = req.body;

        if ([name, email, phone].some(field => isEmpty(field))) {
            return res.status(400).json(new ApiError(400, "All fields are required"));
        }

        const existingAgentPhone = await Agent.findOne({ phone });
        if (existingAgentPhone) return res.status(409).json(new ApiResponse(409, null, `Agent with phone ${phone} already exists`));

        const existingAgentEmail = await Agent.findOne({ email });
        if (existingAgentEmail) return res.status(409).json(new ApiResponse(409, null, `Agent with  ${email} already exists`));

        const newAgent = await Agent.create({
            name,
            email,
            phone
        });

        if (!newAgent) return res.status(500).json(new ApiResponse(500, null, "Something went wrong while creating agent"));

        return res.status(201).json(new ApiResponse(201, newAgent, "Agent created successfully"))
    } catch (error) {
        return res.status(500).json(new ApiError(500, "Internal server error", error?.errors || error));
    }
}

const getAgents = async (req, res) => {
    try {
        const { startIndex = 0, limit = 10 } = req.query;
        // console.log('req.query = ', req.query);
        let agents = await Agent.aggregate([
            { $sort: { createdAt: -1 } },
            { $skip: parseInt(startIndex) },
            { $limit: parseInt(limit) },
            {
                $lookup: {
                    from: 'tickets',
                    localField: '_id',
                    foreignField: 'assignedTo',
                    as: 'assignedTickets'
                }
            },
            {
                $addFields: {
                    assignedTicketsCount: { $size: '$assignedTickets' } 
                }
            },
            {
                $project: {
                    assignedTickets: 0 
                }
            }

        ])
       
        let totalCount = await Agent.countDocuments();
        let pagination = {
            limit: parseInt(limit),
            startIndex: parseInt(startIndex),
            totalCount
        }

        return res.status(200).json(new ApiResponse(200, { data: agents, pagination }, "Success"));

    } catch (error) {
        return res.status(500).json(new ApiError(500, "Internal server error", error?.errors || error));
    }
}




export {
    createAgent,
    getAgents
}