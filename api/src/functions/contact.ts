import {
    app,
    HttpRequest,
    HttpResponseInit,
    InvocationContext
} from "@azure/functions";

import { CosmosClient } from "@azure/cosmos";

const cosmosClient = new CosmosClient({
    endpoint: process.env.COSMOS_ENDPOINT!,
    key: process.env.COSMOS_KEY!
});

const database = cosmosClient.database("PortfolioDB");
const container = database.container("ContactSubmissions");



type ContactRequest = {
    name?: string;
    email?: string;
    message?: string;
};

export async function contact(
    request: HttpRequest,
    context: InvocationContext
): Promise<HttpResponseInit> {

    context.log("Contact API request received", {
        method: request.method,
        url: request.url
    });

    let body: ContactRequest;

    try {
        body = await request.json() as ContactRequest;

        context.log("Contact JSON parsed successfully");
    } catch {
        context.warn("Contact request rejected: invalid JSON");

        return {
            status: 400,
            jsonBody: {
                success: false,
                error: "Invalid JSON body"
            }
        };
    }

    const name = body.name?.trim();
    const email = body.email?.trim();
    const message = body.message?.trim();

    if (!name || !email || !message) {
        context.warn("Contact validation failed: missing required field");

        return {
            status: 400,
            jsonBody: {
                success: false,
                error: "Name, email, and message are required"
            }
        };
    }

    if (name.length > 100) {
        context.warn("Contact validation failed: name too long");

        return {
            status: 400,
            jsonBody: {
                success: false,
                error: "Name is too long"
            }
        };
    }

    if (email.length > 254) {
        context.warn("Contact validation failed: email too long");

        return {
            status: 400,
            jsonBody: {
                success: false,
                error: "Email address is too long"
            }
        };
    }

    if (message.length > 5000) {
        context.warn("Contact validation failed: message too long");

        return {
            status: 400,
            jsonBody: {
                success: false,
                error: "Message is too long"
            }
        };
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email)) {
        context.warn("Contact validation failed: invalid email format");

        return {
            status: 400,
            jsonBody: {
                success: false,
                error: "A valid email address is required"
            }
        };
    }

    context.log("Contact validation passed", {
        messageLength: message.length
    });

    const submission = {
        id: crypto.randomUUID(),
        name,
        email,
        message,
        createdAt: new Date().toISOString()
    };

    try {
        context.log("Cosmos DB write started", {
            submissionId: submission.id
        });

        await container.items.create(submission);

        context.log("Cosmos DB write completed", {
            submissionId: submission.id
        });

        context.log("Contact API completed successfully", {
            submissionId: submission.id
        });

        return {
            status: 201,
            jsonBody: {
                success: true,
                message: "Contact submission saved successfully",
                id: submission.id
            }
        };
    } catch (error) {
        context.error("Contact submission failed", error);

        return {
            status: 500,
            jsonBody: {
                success: false,
                error: "Unable to save contact submission"
            }
        };
    }
}

app.http("contact", {
    methods: ["POST"],
    authLevel: "anonymous",
    handler: contact
});
