const sanitize = (data) => {
  if (data.includes("[DONE]")) return "Done";
  var sanitized = "[" + data.replace(/\}\s*\{/g, "},{") + "]";
  const picked = JSON.parse(sanitized);
  if (picked[1]) {
    return JSON.stringify(picked[1]);
  }
  return JSON.stringify(picked[0]);
};

const longRunning = async (notify) => {
  const response = await fetchData();
  const reader = response.body.getReader();
  const decoder = new TextDecoder("utf-8");

  return new ReadableStream({
    start(controller) {
      return pump();
      function pump() {
        return reader.read().then(({ done, value }) => {
          // When no more data needs to be consumed, close the stream

          if (done) {
            notify.complete(value);
            controller.close();
            return;
          }

          const parsed = decoder.decode(value).replace(/data: /g, "");
          notify.log(parsed);

          // Enqueue the next data chunk into our target stream
          controller.enqueue(value);
          return pump();
        });
      }
    },
  });
};

export default async function longRunningResponse(req, res) {
  let responseStream = new TransformStream();
  const writer = responseStream.writable.getWriter();
  const encoder = new TextEncoder();
  let closed = false;

  //   Invoke long running process
  longRunning({
    log: (msg) => {
      writer.write(encoder.encode("data: " + sanitize(msg) + "\n\n"));
    },
    complete: (msg) => {
      writer.close();
    },
    error: (err) => {
      writer.write(encoder.encode("data: " + err?.message + "\n\n"));
      if (!closed) {
        writer.close();
        closed = true;
      }
    },
    close: () => {
      if (!closed) {
        writer.close();
        closed = true;
      }
    },
  });

  // Return response connected to readable
  return new Response(responseStream.readable, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Content-Type": "text/event-stream; charset=utf-8",
      Connection: "keep-alive",
      "Cache-Control": "no-cache, no-transform",
      "X-Accel-Buffering": "no",
      "Content-Encoding": "none",
    },
  });
}

export const config = {
  runtime: "edge",
};

const fetchData = async () => {
  //   const ctrl = new AbortController();
  return fetch(`https://api.openai.com/v1/chat/completions`, {
    method: "POST",
    body: JSON.stringify({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "user",
          content: "write some long article",
        },
      ],
      temperature: 0,
      stream: true,
    }),
    headers: {
      Accept: "text/event-stream",
      "Content-Type": "application/json",
      Authorization: "Bearer " + process.env.OPEN_API,
    },
  });
};
