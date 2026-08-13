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

    context.log("Contact API called");

    let body: ContactRequest;

    try {
        body = await request.json() as ContactRequest;
    } catch {
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
        return {
            status: 400,
            jsonBody: {
                success: false,
                error: "Name, email, and message are required"
            }
        };
    }

    if (!email.includes("@")) {
        return {
            status: 400,
            jsonBody: {
                success: false,
                error: "A valid email address is required"
            }
        };
    }

    const submission = {
        id: crypto.randomUUID(),
        name,
        email,
        message,
        createdAt: new Date().toISOString()
    };

    await container.items.create(submission);

    context.log(`Contact submission received from ${email}`);

    return {
        status: 201,
        jsonBody: {
            success: true,
            message: "Contact submission received",
            data: {
                name,
                email,
                message
            }
        }
    };
}

app.http("contact", {
    methods: ["POST"],
    authLevel: "anonymous",
    handler: contact
});
