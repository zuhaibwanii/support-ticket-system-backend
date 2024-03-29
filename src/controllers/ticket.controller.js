//models
import { Ticket } from "../models/ticket.model.js"
import { Agent } from "../models/agent.model.js";

//utils
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js";
import isEmpty from "../utils/isEmpty.js";

const createTicket = async (req, res) => {
    try {
        let { topic, description, severity, type } = req.body;

        if ([topic, description, severity, type].some(field => isEmpty(field))) {
            return res.status(400).json(new ApiError(400, "All fields are required"));
        }
        let assignedTo = null;
        const activeAgents = await Agent.find({ active: true });

        if (!activeAgents.length) return res.status(400).json(new ApiResponse(400, null, "No agent found, please create one first"));

        // Find the agent with the least number of assigned tickets
        let agentWithMinTickets = activeAgents[0];
        for (const agent of activeAgents) {
            const ticketCount = await Ticket.countDocuments({ assignedTo: agent._id, status: 'Assigned' });
            const minTicketCount = await Ticket.countDocuments({ assignedTo: agentWithMinTickets._id, status: 'Assigned' });

            if (ticketCount < minTicketCount) {
                agentWithMinTickets = agent;
            }
        }

        assignedTo = agentWithMinTickets._id;

        const status = assignedTo ? 'Assigned' : 'New';
        const newTicket = await Ticket.create({
            topic,
            description,
            severity,
            type,
            status,
            assignedTo
        });

        if (!newTicket) return res.status(500).json(new ApiResponse(500, null, "Something went wrong while creating ticket"));

        return res.status(201).json(new ApiResponse(201, newTicket, "Ticket created successfully"))
    } catch (error) {
        return res.status(500).json(new ApiError(500, "Internal server error", error?.errors || error));
    }
}

const getTickets = async (req, res) => {
    try {
        const { startIndex = 0, limit = 10 } = req.query;
        let tickets = await Ticket.aggregate([
            { $sort: { createdAt: -1 } },
            { $skip: parseInt(startIndex) },
            { $limit: parseInt(limit) },
            {
                $lookup: {
                    from: 'agents',
                    localField: 'assignedTo',
                    foreignField: '_id',
                    as: 'agentDetails'
                }
            },
            {
                $addFields:{
                    "assignedTo._id":{$first:"$agentDetails._id"},
                    "assignedTo.name":{$first:"$agentDetails.name"},
                }
            },
            {
                $project: {
                    agentDetails: 0
                }
            }
        ]);
        let totalCount = await Ticket.countDocuments();
        let pagination = {
            limit: parseInt(limit),
            startIndex: parseInt(startIndex),
            totalCount
        }

        return res.status(200).json(new ApiResponse(200, { data: tickets, pagination }, "Success"));

    } catch (error) {
        console.log('error = ', error);
        return res.status(500).json(new ApiError(500, "Internal server error", error?.errors || error));
    }
}




export {
    createTicket,
    getTickets
}