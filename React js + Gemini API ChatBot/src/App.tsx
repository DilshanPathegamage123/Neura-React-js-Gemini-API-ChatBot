import { useState, useRef, useEffect } from "react";
import "./App.css";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import { FaArrowDown } from "react-icons/fa"; // Import Font Awesome down arrow icon
import logo from "./assets/Logo1.png";

type Message = {
  type: "question" | "answer";
  text: string | JSX.Element[];
};

function App() {
  const [question, setQuestion] = useState("");
  const [conversation, setConversation] = useState<Message[]>([]);
  const [generatingAnswer, setGeneratingAnswer] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const conversationRef = useRef<HTMLDivElement>(null);

  const botName = "NeurA"; // Define the bot's name

  // To handle dynamic resizing of the textarea
  useEffect(() => {
    if (textareaRef.current) {
      const textareaLineHeight = 24;
      const minRows = 1; // Minimum number of rows in textarea
      const maxRows = 3; // Maximum number of rows in textarea

      const previousRows = textareaRef.current.rows; // Get current number of rows in textarea
      textareaRef.current.rows = minRows; // Reset number of rows in textarea

      // Calculate the current number of rows based on scroll height
      const currentRows = Math.floor(
        textareaRef.current.scrollHeight / textareaLineHeight
      );

      if (currentRows === previousRows) {
        textareaRef.current.rows = currentRows;
      }

      // Adjust textarea rows and overflow behavior based on the number of rows
      if (currentRows >= maxRows) {
        textareaRef.current.rows = maxRows;
        textareaRef.current.style.overflowY = "auto";
      } else {
        textareaRef.current.rows = currentRows;
        textareaRef.current.style.overflowY = "hidden";
      }
    }
  }, [question]);

  //To handle scroll events and show/hide the scroll button

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

  // Function to scroll down when the button is clicked
  const scrollToBottom = () => {
    if (conversationRef.current) {
      conversationRef.current.scrollTop = conversationRef.current.scrollHeight;
    }
  };

  // Function to organize the answer in proprer format
  function parseAnswerText(answerText: string) {
    const lines = answerText.split("\n"); // Split answer into lines
    const elements: JSX.Element[] = []; // Array to hold JSX elements
    let insideCodeBlock = false; // Flag to check if inside code block
    let codeBlockLines: string[] = []; // Array to hold lines of code block

    for (let line of lines) {
      if (line.startsWith("```")) {
        if (insideCodeBlock) {
          // End of code block
          elements.push(
            <pre className="code-block">
              <code>{codeBlockLines.join("\n")}</code>
            </pre>
          );
          insideCodeBlock = false;
          codeBlockLines = [];
        } else {
          // Start of code block
          insideCodeBlock = true;
        }
      } else if (insideCodeBlock) {
        codeBlockLines.push(line);
      } else if (line.startsWith("## ")) {
        elements.push(<h2>{line.substring(3)}</h2>);
      } else if (line.startsWith("**")) {
        const endIndex = line.indexOf("**", 2);
        if (endIndex !== -1) {
          elements.push(<strong>{line.substring(2, endIndex)}</strong>);
          elements.push(<span>{line.substring(endIndex + 2)}</span>);
        } else {
          elements.push(<span>{line}</span>);
        }
      } else if (line.startsWith("* ")) {
        elements.push(<li>{line.substring(2)}</li>);
      } else if (line.includes("`")) {
        const parts = line.split(/(`.*?`)/);
        parts.forEach((part, index) => {
          if (part.startsWith("`") && part.endsWith("`")) {
            elements.push(<code key={index}>{part.slice(1, -1)}</code>);
          } else {
            elements.push(<span key={index}>{part}</span>);
          }
        });
      } else {
        elements.push(<p>{line}</p>);
      }
    }

    return elements;
  }

  // Function to generate answer by fetch gemeni API
  async function generateAnswer(e: React.FormEvent) {
    setGeneratingAnswer(true);
    e.preventDefault();

    // Check if the question is about the bot's name
    if (question.toLowerCase().includes("your name")) {
      setConversation((prev) => [
        ...prev,
        { type: "question", text: question },
        {
          type: "answer",
          text: `My name is ${botName}. I am a large language model, and I am not a person. I am a computer program that can generate text, translate languages, write different kinds of creative content, and answer your questions in an informative way.`,
        },
      ]);
      setGeneratingAnswer(false);
      setQuestion("");
      return;
    }

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
      const parsedAnswer = parseAnswerText(newAnswer);

      setConversation((prev) => [
        ...prev,
        { type: "answer", text: parsedAnswer },
      ]);
    } catch (error) {
      console.log(error);
      setConversation((prev) => [
        ...prev,
        { type: "question", text: question },
        {
          type: "answer",
          text: "Sorry, Something went wrong. Please try again!",
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
        <h1 className="chat-title ">NeurA</h1>
      </div>
      {conversation.length === 0 ? (
        // Display the logo centered when there are no messages
        <div className="logo1-container">
          <img src={logo} alt="Logo" className="logo1" />
        </div>
      ) : (
        <>
          <div
            className="conversation container-fluid w-auto m-auto ms-lg-5 me-lg-5 mb-2 mt-2 p-5"
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
                      ? "bg-dark text-white col-auto  mb-3 me-2 "
                      : "bg-dark text-white col-auto  mb-3"
                  }`}
                  // style={{ maxWidth: "100%", wordWrap: "break-word" }}
                >
                  <div className="ms-2 me-2 justify-content-center align-items-center flex-grow-1">
                    {Array.isArray(msg.text) ? msg.text : msg.text}
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
            className="m-auto h-auto type p-2 ps-4 pe-4 "
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
