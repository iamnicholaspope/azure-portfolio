export async function status(
    request: HttpRequest,
    context: InvocationContext
): Promise<HttpResponseInit> {
    context.log("Status API requested", {
        url: request.url,
        method: request.method
    });

    try {
        context.log("Building status response");

        const response = {
            service: "Azure Cloud Portfolio API",
            status: "online",
            environment: "development",
            timestamp: new Date().toISOString()
        };

        context.log("Status API completed successfully");

        return {
            status: 200,
            jsonBody: response
        };
    } catch (error) {
        context.error("Status API failed", error);

        return {
            status: 500,
            jsonBody: {
                service: "Azure Cloud Portfolio API",
                status: "error",
                message: "Unable to load status."
            }
        };
    }
}
