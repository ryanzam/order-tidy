import { requireSession } from "@/lib/auth";
import { subscribe } from "@/lib/events";
export const runtime = "nodejs";

export async function GET() {
    try {
        const s = await requireSession();
        const encoder = new TextEncoder();
        let unsubscribe = () => {};
        const stream = new ReadableStream({
            start(controller) {
                const send = (data: unknown) =>
                    controller.enqueue(
                        encoder.encode(`data: ${JSON.stringify(data)}\n\n`),
                    );
                send({ type: "connected" });
                unsubscribe = subscribe(s.tenantId, send);
            },
            cancel() {
                unsubscribe();
            },
        });
        return new Response(stream, {
            headers: {
                "Content-Type": "text/event-stream",
                "Cache-Control": "no-cache, no-transform",
                Connection: "keep-alive",
            },
        });
    } catch {
        return new Response("Unauthorized", { status: 401 });
    }
}
