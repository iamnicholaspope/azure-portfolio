import {
    app,
    HttpRequest,
    HttpResponseInit,
    InvocationContext
} from "@azure/functions";

export async function status(
    request: HttpRequest,
    context: InvocationContext
): Promise<HttpResponseInit> {
    context.log(`Status endpoint called: ${request.url}`);

    return {
        status: 200,
        jsonBody: {
            service: "Azure Cloud Portfolio API",
            status: "online",
            environment: "development",
            timestamp: new Date().toISOString()
        }
    };
}

app.http("status", {
    methods: ["GET"],
    authLevel: "anonymous",
    handler: status
});
