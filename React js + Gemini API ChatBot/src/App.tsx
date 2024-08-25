// import { useState } from "react";
// import "./App.css";
// import axios from "axios";
// import ReactMarkdown from "react-markdown";

// function App() {
//   const [question, setQuestion] = useState("");
//   const [answer, setAnswer] = useState("");
//   const [generatingAnswer, setGeneratingAnswer] = useState(false);

//   async function generateAnswer(e: React.FormEvent<HTMLFormElement>) {
//     setGeneratingAnswer(true);
//     e.preventDefault();
//     setAnswer("Loading your answer... \n It might take upto 10 seconds");
//     try {
//       const response = await axios({
//         url: `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${
//           import.meta.env.VITE_API_GENERATIVE_LANGUAGE_CLIENT // Get API key from the .env file
//         }`,
//         method: "post",
//         data: {
//           contents: [{ parts: [{ text: question }] }],
//         },
//       });

//       setAnswer(
//         response["data"]["candidates"][0]["content"]["parts"][0]["text"]
//       );
//     } catch (error) {
//       console.log(error);
//       setAnswer("Sorry - Something went wrong. Please try again!");
//     }

//     setGeneratingAnswer(false);
//   }

//   return (
//     <>
//       <div className="bg-gradient-to-r from-blue-50 to-blue-100 h-screen p-3 flex flex-col justify-center items-center">
//         <form onSubmit={generateAnswer} className="">
//           <textarea
//             required
//             className=""
//             value={question}
//             onChange={(e) => setQuestion(e.target.value)}
//             placeholder="  Ask anything"
//           ></textarea>
//           <button
//             type="submit"
//             className={`bg-blue-500 text-white p-3 rounded-md hover:bg-blue-600 transition-all duration-300 ${
//               generatingAnswer ? "opacity-50 cursor-not-allowed" : ""
//             }`}
//             disabled={generatingAnswer}
//           >
//             Send
//           </button>
//         </form>
//         <div className="">
//           <p className="p-4">{answer}</p>
//         </div>
//       </div>
//     </>
//   );
// }

// export default App;

// import { useState, useRef, useEffect } from "react";
// import "./App.css";
// import axios from "axios";
// import "bootstrap/dist/css/bootstrap.min.css"; // Import Bootstrap CSS
// import { FaArrowDown } from "react-icons/fa"; // Import Font Awesome down arrow icon
// import logo from "./assets/Logo1.png";

// type Message = {
//   type: "question" | "answer";
//   text: string;
// };

// function App() {
//   const [question, setQuestion] = useState("");
//   const [conversation, setConversation] = useState<Message[]>([]);
//   const [generatingAnswer, setGeneratingAnswer] = useState(false);
//   const [showScrollButton, setShowScrollButton] = useState(false);
//   const textareaRef = useRef<HTMLTextAreaElement>(null);
//   const conversationRef = useRef<HTMLDivElement>(null);

//   useEffect(() => {
//     if (textareaRef.current) {
//       const textareaLineHeight = 24;
//       const minRows = 2; // Minimum number of rows in textarea
//       const maxRows = 5; // Maximum number of rows in textarea

//       const previousRows = textareaRef.current.rows;
//       textareaRef.current.rows = minRows; // Reset number of rows in textarea

//       const currentRows = Math.floor(
//         textareaRef.current.scrollHeight / textareaLineHeight
//       );

//       if (currentRows === previousRows) {
//         textareaRef.current.rows = currentRows;
//       }

//       if (currentRows >= maxRows) {
//         textareaRef.current.rows = maxRows;
//         textareaRef.current.style.overflowY = "auto";
//       } else {
//         textareaRef.current.rows = currentRows;
//         textareaRef.current.style.overflowY = "hidden";
//       }
//     }
//   }, [question]);

//   useEffect(() => {
//     const handleScroll = () => {
//       if (conversationRef.current) {
//         const { scrollTop, scrollHeight, clientHeight } =
//           conversationRef.current;
//         setShowScrollButton(scrollTop + clientHeight < scrollHeight - 100);
//       }
//     };

//     if (conversationRef.current) {
//       conversationRef.current.addEventListener("scroll", handleScroll);
//     }

//     return () => {
//       if (conversationRef.current) {
//         conversationRef.current.removeEventListener("scroll", handleScroll);
//       }
//     };
//   }, []);

//   const scrollToBottom = () => {
//     if (conversationRef.current) {
//       conversationRef.current.scrollTop = conversationRef.current.scrollHeight;
//     }
//   };

//   async function generateAnswer(e: React.FormEvent<HTMLFormElement>) {
//     setGeneratingAnswer(true);
//     e.preventDefault();

//     try {
//       //Fetch Gemeni API with API key
//       const response = await axios({
//         url: `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${
//           import.meta.env.VITE_API_GENERATIVE_LANGUAGE_CLIENT // Get API key from the .env file
//         }`,
//         method: "post",
//         data: {
//           contents: [{ parts: [{ text: question }] }],
//         },
//       });

//       const newAnswer = response.data.candidates[0].content.parts[0].text;
//       setConversation((prev) => [
//         ...prev,
//         { type: "question", text: question },
//         { type: "answer", text: newAnswer },
//       ]);
//     } catch (error) {
//       console.log(error);
//       setConversation((prev) => [
//         ...prev,
//         { type: "question", text: question },
//         {
//           type: "answer",
//           text: "Sorry - Something went wrong. Please try again!",
//         },
//       ]);
//     }
//     scrollToBottom(); // Scroll to bottom after generating answer
//     setGeneratingAnswer(false);
//     setQuestion(""); // Clear the input field

//   }

//   return (
//     <div className="maindiv">
//       <div
//         className="conversation w-auto m-auto ms-lg-5 me-lg-5 mb-2 mt-2"
//         ref={conversationRef}
//         style={{ maxHeight: "70vh", overflowY: "auto" }} // Set max height and enable scrolling
//       >
//         {conversation.map((msg, index) => (
//           <div
//             key={index}
//             className={`d-flex ${
//               msg.type === "question"
//                 ? "justify-content-end"
//                 : "justify-content-start"
//             }`}
//           >
//             <div
//               className={`message p-2 rounded mb-2 ${
//                 msg.type === "question"
//                   ? "bg-dark text-white col-10 mb-3"
//                   : "bg-dark text-white col-10 mb-3 d-flex align-items-center"
//               }`}
//               style={{ maxWidth: "100%", wordWrap: "break-word" }}
//             >
//               {msg.type === "answer" && (
//                 <img src={logo} alt="Logo" className="logo me-2" />
//               )}
//               <div className="ms-2 me-2 justify-content-center align-items-center">
//                 {msg.text}
//               </div>
//             </div>
//           </div>
//         ))}
//       </div>
//       {showScrollButton && (
//         <button
//           className="scroll-button btn btn-primary"
//           onClick={scrollToBottom}
//         >
//           <FaArrowDown />
//         </button>
//       )}
//       <form onSubmit={generateAnswer} className="p-3">
//         <div className="typearea input-group w-auto bg-black m-auto ms-lg-4 me-lg-4">
//           <textarea
//             ref={textareaRef}
//             required
//             className="form-control h-auto type "
//             value={question}
//             onChange={(e) => setQuestion(e.target.value)}
//             placeholder="Ask anything..."
//             rows={2} // Set initial height to 2 rows
//             style={{ overflowY: "hidden" }} // Initially hide overflow
//           ></textarea>
//         </div>
//         <div className=" button mt-2 d-flex justify-content-center ms-auto me-0">
//           <button
//             type="submit"
//             className={`submitbtn ms-auto me-lg-4 ${
//               generatingAnswer ? "disabled" : ""
//             }`}
//             disabled={generatingAnswer}
//           >
//             {generatingAnswer ? "Generating..." : "Send"}
//           </button>
//         </div>
//       </form>
//     </div>
//   );
// }

// export default App;

// import { useState, useRef, useEffect } from "react";
// import "./App.css";
// import axios from "axios";
// import "bootstrap/dist/css/bootstrap.min.css"; // Import Bootstrap CSS
// import { FaArrowDown } from "react-icons/fa"; // Import Font Awesome down arrow icon
// import logo from "./assets/Logo1.png";

// type Message = {
//   type: "question" | "answer";
//   text: string;
// };

// function App() {
//   const [question, setQuestion] = useState("");
//   const [conversation, setConversation] = useState<Message[]>([]);
//   const [generatingAnswer, setGeneratingAnswer] = useState(false);
//   const [showScrollButton, setShowScrollButton] = useState(false);
//   const textareaRef = useRef<HTMLTextAreaElement>(null);
//   const conversationRef = useRef<HTMLDivElement>(null);
//   const [messages, setMessages] = useState([]); //state variable to keep track of the chat messages

//   useEffect(() => {
//     if (textareaRef.current) {
//       const textareaLineHeight = 24;
//       const minRows = 1; // Minimum number of rows in textarea
//       const maxRows = 5; // Maximum number of rows in textarea

//       const previousRows = textareaRef.current.rows;
//       textareaRef.current.rows = minRows; // Reset number of rows in textarea

//       const currentRows = Math.floor(
//         textareaRef.current.scrollHeight / textareaLineHeight
//       );

//       if (currentRows === previousRows) {
//         textareaRef.current.rows = currentRows;
//       }

//       if (currentRows >= maxRows) {
//         textareaRef.current.rows = maxRows;
//         textareaRef.current.style.overflowY = "auto";
//       } else {
//         textareaRef.current.rows = currentRows;
//         textareaRef.current.style.overflowY = "hidden";
//       }
//     }
//   }, [question]);

//   useEffect(() => {
//     const handleScroll = () => {
//       if (conversationRef.current) {
//         const { scrollTop, scrollHeight, clientHeight } =
//           conversationRef.current;
//         setShowScrollButton(scrollTop + clientHeight < scrollHeight - 100);
//       }
//     };

//     if (conversationRef.current) {
//       conversationRef.current.addEventListener("scroll", handleScroll);
//     }

//     return () => {
//       if (conversationRef.current) {
//         conversationRef.current.removeEventListener("scroll", handleScroll);
//       }
//     };
//   }, []);

//   const scrollToBottom = () => {
//     if (conversationRef.current) {
//       conversationRef.current.scrollTop = conversationRef.current.scrollHeight;
//     }
//   };

//   async function generateAnswer(e: React.FormEvent<HTMLFormElement>) {
//     setGeneratingAnswer(true);
//     e.preventDefault();

//     try {
//       //Fetch Gemeni API with API key
//       const response = await axios({
//         url: `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${
//           import.meta.env.VITE_API_GENERATIVE_LANGUAGE_CLIENT // Get API key from the .env file
//         }`,
//         method: "post",
//         data: {
//           contents: [{ parts: [{ text: question }] }],
//         },
//       });

//       const newAnswer = response.data.candidates[0].content.parts[0].text;
//       setConversation((prev) => [
//         ...prev,
//         { type: "question", text: question },
//         { type: "answer", text: newAnswer },
//       ]);
//     } catch (error) {
//       console.log(error);
//       setConversation((prev) => [
//         ...prev,
//         { type: "question", text: question },
//         {
//           type: "answer",
//           text: "Sorry - Something went wrong. Please try again!",
//         },
//       ]);
//     }
//     scrollToBottom(); // Scroll to bottom after generating answer
//     setGeneratingAnswer(false);
//     setQuestion(""); // Clear the input field
//   }

//   return (
//     <div className="maindiv">

//       <div
//         className="conversation container-fluid w-auto m-auto ms-lg-5 me-lg-5 mb-2 mt-2"
//         ref={conversationRef}
//         style={{ maxHeight: "70vh", overflowY: "auto" }} // Set max height and enable scrolling
//       >
//         {conversation.map((msg, index) => (
//           <div
//             key={index}
//             className={`d-flex ${
//               msg.type === "question"
//                 ? "justify-content-end"
//                 : "justify-content-start"
//             }`}
//           >
//             {msg.type === "answer" && (
//               <img src={logo} alt="Logo" className="logo me-2" />
//             )}
//             <div
//               className={`message p-2 rounded mb-2 ${
//                 msg.type === "question"
//                   ? "bg-dark text-white col-auto mb-3 me-2 "
//                   : "bg-dark text-white col-auto mb-3"
//               }`}
//               // style={{ maxWidth: "100%", wordWrap: "break-word" }}
//             >
//               <div className="ms-2 me-2 justify-content-center align-items-center flex-grow-1">
//                 {msg.text}
//               </div>
//             </div>
//           </div>
//         ))}

//         {showScrollButton && (
//           <button
//             className="scroll-button btn btn-secondary"
//             onClick={scrollToBottom}
//           >
//             <FaArrowDown />
//           </button>
//         )}
//       </div>
//       <form onSubmit={generateAnswer} className="p-3">
//         <div className="typearea container-fluid input-group w-auto m-auto ms-lg-4 me-lg-4 ">
//           <textarea
//             ref={textareaRef}
//             required
//             className="form-control  h-auto type p-2 ps-4 pe-4 "
//             id="form"
//             value={question}
//             onChange={(e) => setQuestion(e.target.value)}
//             placeholder="Ask anything..."
//             rows={1} // Set initial height to 1 rows
//             style={{ overflowY: "hidden" }} // Initially hide overflow
//           ></textarea>
//         </div>
//         <div className=" button container-fluid mt-2 d-flex justify-content-center ms-auto me-0 ">
//           <button
//             type="submit"
//             className={`submitbtn ms-auto me-lg-4 ${
//               generatingAnswer ? "disabled" : ""
//             }`}
//             disabled={generatingAnswer}
//           >
//             {generatingAnswer ? "Generating..." : "Send"}
//           </button>
//         </div>
//       </form>
//     </div>
//   );
// }

// export default App;

import { useState, useRef, useEffect } from "react";
import "./App.css";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css"; // Import Bootstrap CSS
import { FaArrowDown } from "react-icons/fa"; // Import Font Awesome down arrow icon
import logo from "./assets/Logo1.png";

type Message = {
  type: "question" | "answer";
  text: string;
};

function App() {
  const [question, setQuestion] = useState("");
  const [conversation, setConversation] = useState<Message[]>([]);
  const [generatingAnswer, setGeneratingAnswer] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const conversationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      const textareaLineHeight = 24;
      const minRows = 1; // Minimum number of rows in textarea
      const maxRows = 3; // Maximum number of rows in textarea

      const previousRows = textareaRef.current.rows;
      textareaRef.current.rows = minRows; // Reset number of rows in textarea

      const currentRows = Math.floor(
        textareaRef.current.scrollHeight / textareaLineHeight
      );

      if (currentRows === previousRows) {
        textareaRef.current.rows = currentRows;
      }

      if (currentRows >= maxRows) {
        textareaRef.current.rows = maxRows;
        textareaRef.current.style.overflowY = "auto";
      } else {
        textareaRef.current.rows = currentRows;
        textareaRef.current.style.overflowY = "hidden";
      }
    }
  }, [question]);

  useEffect(() => {
    const handleScroll = () => {
      if (conversationRef.current) {
        const { scrollTop, scrollHeight, clientHeight } =
          conversationRef.current;
        setShowScrollButton(scrollTop + clientHeight < scrollHeight - 100);
      }
    };

    if (conversationRef.current) {
      conversationRef.current.addEventListener("scroll", handleScroll);
    }

    return () => {
      if (conversationRef.current) {
        conversationRef.current.removeEventListener("scroll", handleScroll);
      }
    };
  }, []);

  const scrollToBottom = () => {
    if (conversationRef.current) {
      conversationRef.current.scrollTop = conversationRef.current.scrollHeight;
    }
  };

  async function generateAnswer(e: React.FormEvent) {
    setGeneratingAnswer(true);
    e.preventDefault();

    // Add the question to the conversation immediately when send is clicked or enter is pressed
    setConversation((prev) => [...prev, { type: "question", text: question }]);
    setQuestion(""); // Clear the input field

    try {
      //Fetch Gemeni API with API key
      const response = await axios({
        url: `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${
          import.meta.env.VITE_API_GENERATIVE_LANGUAGE_CLIENT // Get API key from the .env file
        }`,
        method: "post",
        data: {
          contents: [{ parts: [{ text: question }] }],
        },
      });

      const newAnswer = response.data.candidates[0].content.parts[0].text;
      setConversation((prev) => [...prev, { type: "answer", text: newAnswer }]);
    } catch (error) {
      console.log(error);
      setConversation((prev) => [
        ...prev,
        { type: "question", text: question },
        {
          type: "answer",
          text: "Sorry - Something went wrong. Please try again!",
        },
      ]);
    }
    setGeneratingAnswer(false);
  }

  // Scroll to bottom after generating answer
  useEffect(() => {
    scrollToBottom();
  }, [conversation]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      generateAnswer(e as unknown as React.FormEvent);
    }
  };

  return (
    <div className="maindiv">
      <div className=" row chat-header ">
        <h1 className="chat-title ">DChat</h1>
      </div>
      {conversation.length === 0 ? (
        // Display the logo centered when there are no messages
        <div className="logo1-container">
          <img src={logo} alt="Logo" className="logo1" />
        </div>
      ) : (
        <>
          <div
            className="conversation container-fluid w-auto m-auto ms-lg-5 me-lg-5 mb-2 mt-2"
            ref={conversationRef}
            style={{ maxHeight: "70vh", overflowY: "auto" }} // Set max height and enable scrolling
          >
            {conversation.map((msg, index) => (
              <div
                key={index}
                className={`d-flex ${
                  msg.type === "question"
                    ? "justify-content-end"
                    : "justify-content-start"
                }`}
              >
                {msg.type === "answer" && (
                  <img src={logo} alt="Logo" className="logo me-2" />
                )}
                <div
                  className={`message p-2 rounded mb-2 ${
                    msg.type === "question"
                      ? "bg-dark text-white col-auto mb-3 me-2 "
                      : "bg-dark text-white col-auto mb-3"
                  }`}
                  // style={{ maxWidth: "100%", wordWrap: "break-word" }}
                >
                  <div className="ms-2 me-2 justify-content-center align-items-center flex-grow-1">
                    {msg.text}
                  </div>
                </div>
              </div>
            ))}

            {showScrollButton && (
              <button
                className="scroll-button btn btn-secondary"
                onClick={scrollToBottom}
              >
                <FaArrowDown />
              </button>
            )}
          </div>
        </>
      )}
      <form onSubmit={generateAnswer} className="p-3">
        <div className="typearea container-fluid input-group w-auto m-auto ms-lg-4 me-lg-4 ">
          <textarea
            ref={textareaRef}
            required
            className="form-control  h-auto type p-2 ps-4 pe-4 "
            id="form"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything..."
            rows={1} // Set initial height to 1 rows
            style={{ overflowY: "hidden" }} // Initially hide overflow
          ></textarea>
        </div>
        <div className=" button container-fluid mt-2 d-flex justify-content-center ms-auto me-0 ">
          <button
            type="submit"
            className={`submitbtn ms-auto me-lg-4 ${
              generatingAnswer ? "disabled" : ""
            }`}
            disabled={generatingAnswer}
            onClick={scrollToBottom}
          >
            {generatingAnswer ? "Generating Answer..." : "Send"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default App;
