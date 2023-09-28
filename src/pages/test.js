import React, { useState } from "react";

export default function App() {
  const [process, setProcess] = useState({});
  const [message, setMessage] = useState({});
  const [listening, setListening] = useState(false);

  const statusMessage = {
    subscribed: "Subscribed",
    unsubscribed: "Unsubscribed",
  };

  const subscribe = async () => {
    const status = listening;
    if (!status) {
      const events = new EventSource("/api/generate-blog");
      events.onmessage = (event) => {
        if (event.data === "Done") return events.close();
        console.log(event.data);
        const dass = JSON.parse(event.data);
        console.log(dass.choices[0].delta.content, "data");

        // switch (parsedData.type) {
        //   case "init-connection":
        //     setProcess(parsedData.processId);
        //     break;
        //   case "message":
        //     setMessage(parsedData.message);
        //     break;
        // }
      };
    } else {
      setProcess({});
      setMessage({});
      //   await axios.delete(`http://localhost:8000/closes/${process}`);
    }
    setListening(!listening);
  };

  return (
    <div>
      <p>{listening ? statusMessage.subscribed : statusMessage.unsubscribed}</p>
      <p>{JSON.stringify(process)}</p>
      <button onClick={subscribe}>
        {listening ? statusMessage.unsubscribed : statusMessage.subscribed}
      </button>
      <br />
      <p>{JSON.stringify(message)}</p>
    </div>
  );
}
