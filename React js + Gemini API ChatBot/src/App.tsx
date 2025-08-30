import {useState, useRef, useEffect} from "react";
import "./App.css";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import { FaArrowDown } from "react-icons/fa";
import logo from './assets/Logo1.png';
import { marked, Tokens } from "marked";
import DOMPurify from 'dompurify';

type Message = {
  type: "question" | "answer";
  content: string | JSX.Element;
};

// Define the Code token type that matches what marked expects
interface CodeToken extends Tokens.Code {
  text: string;
  lang?: string;
  escaped?: boolean;
}

function App() {
  // State variables to handle states of the chatbot
  const [question, setQuestion] = useState("");
  const [conversation, setConversation] = useState<Message[]>([]);
  const [generatingAnswer, setGeneratingAnswer] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const conversationRef = useRef<HTMLDivElement>(null);

  const botName = "NeurA";

  // Configure marked options
  marked.setOptions({
    breaks: true,
    gfm: true,
  });

  // To handle dynamic resizing of the textarea
  useEffect(() => {
    if (textareaRef.current) {
      const textareaLineHeight = 24;
      const minRows = 3;
      const maxRows = 12;

      const previousRows = textareaRef.current.rows;
      textareaRef.current.rows = minRows;

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

  // To handle scroll events and show/hide the scroll button
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

  // Function to copy code to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      console.log('Code copied to clipboard');
    }).catch(err => {
      console.error('Failed to copy: ', err);
    });
  };

  // Custom renderer for marked
  const renderer = new marked.Renderer();

  // Fix the code method signature to match the expected type
  renderer.code = ({ text, lang, escaped }: CodeToken) => {
    const language = lang || 'text';
    const codeContent = escaped ? text : escapeHtml(text);

    return `
      <div class="code-block-container mb-4 mt-4">
        <div class="code-header d-flex justify-content-between align-items-center" >
          <span class="code-language">${language}</span>
          <button class="btn btn-sm btn-outline-light copy-btn" data-code="${codeContent.replace(/"/g, '&quot;')}" title="Copy code">
            Copy
          </button>
        </div>
        <pre class="language-${language}"><code class="language-${language}">${codeContent}</code></pre>
      </div>
    `;
  };

  // Helper function to escape HTML
  function escapeHtml(html: string): string {
    return html
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
  }

  // Function to parse markdown with custom code blocks
  function parseAnswerText(answerText: string): JSX.Element {
    const rawHtml = marked.parse(answerText, { renderer }) as string;
    const cleanHtml = DOMPurify.sanitize(rawHtml);

    return <div dangerouslySetInnerHTML={{ __html: cleanHtml }} />;
  }

  // Function to generate answer
  async function generateAnswer(e: React.FormEvent) {
    setGeneratingAnswer(true);
    e.preventDefault();

    // Check if the question is about the bot's name
    if (question.toLowerCase().includes("your name")) {
      setConversation((prev) => [
        ...prev,
        { type: "question", content: question },
        {
          type: "answer",
          content: `My name is ${botName}. I am a large language model, and I am not a person. I am a computer program that can generate text, translate languages, write different kinds of creative content, and answer your questions in an informative way.`,
        },
      ]);
      setGeneratingAnswer(false);
      setQuestion("");
      return;
    }

    // Add the question to the conversation immediately when send is clicked or enter is pressed
    setConversation((prev) => [...prev, { type: "question", content: question }]);
    setQuestion("");

    try {
      // // Fetch Deepseek R1 API with API key

      // const response = await axios({
      //   url: "https://openrouter.ai/api/v1/chat/completions",
      //   method: "post",
      //   headers: {
      //     "Authorization": `Bearer ${import.meta.env.VITE_OPENROUTER_API_KEY}`,
      //     "HTTP-Referer": window.location.origin,
      //     "X-Title": "NeurA Chatbot",
      //     "Content-Type": "application/json"
      //   },
      //   data: {
      //     model: "deepseek/deepseek-r1-0528:free",
      //     messages: [
      //       {
      //         role: "user",
      //         content: question
      //       }
      //     ]
      //   },
      // });

      // const newAnswer = response?.data?.choices[0]?.message?.content;

      //Fetch Gemeni API with API key
      const response = await axios({
        url: `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${
          import.meta.env.VITE_API_GENERATIVE_LANGUAGE_CLIENT 
        }`,
        method: "post",
        data: {
          contents: [{ parts: [{ text: question }] }],
        },
      });
      const newAnswer = response?.data?.candidates[0]?.content?.parts[0]?.text;
      const parsedAnswer = parseAnswerText(newAnswer);

      setConversation((prev) => [
        ...prev,
        { type: "answer", content: parsedAnswer },
      ]);
    } catch (error) {
      console.log(error);
      setConversation((prev) => [
        ...prev,
        { type: "question", content: question },
        {
          type: "answer",
          content: "Sorry, Something went wrong. Please try again!",
        },
      ]);
    }
    setGeneratingAnswer(false);
  }

  // Scroll to bottom after generating answer
  useEffect(() => {
    scrollToBottom();
  }, [conversation]);

  // Handle copy button clicks
  useEffect(() => {
    const handleCopyClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const copyButton = target.closest('.copy-btn');

      if (copyButton) {
        const code = copyButton.getAttribute('data-code');
        if (code) {
          // Unescape HTML entities before copying
          const decodedCode = code
              .replace(/&amp;/g, '&')
              .replace(/&lt;/g, '<')
              .replace(/&gt;/g, '>')
              .replace(/&quot;/g, '"')
              .replace(/&#039;/g, "'");

          copyToClipboard(decodedCode);

          const originalText = copyButton.innerHTML;
          copyButton.innerHTML = '<i class="fas fa-check"></i> Copied!';
          setTimeout(() => {
            copyButton.innerHTML = originalText;
          }, 2000);
        }
      }
    };

    document.addEventListener('click', handleCopyClick);

    return () => {
      document.removeEventListener('click', handleCopyClick);
    };
  }, []);

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
                  style={{ maxHeight: "70vh", overflowY: "auto" }}
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
                                  : "bg-transparent text-white col-auto  mb-3"
                          }`}
                      >
                        <div className="ms-2 me-2 justify-content-center align-items-center flex-grow-1">
                          {msg.content}
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
          <div className=" container-fluid input-group w-auto m-auto ms-lg-4 me-lg-4 ">
          <textarea
              ref={textareaRef}
              required
              className="m-auto h-auto type p-2 ps-4 pe-4 text-dark"
              id="form"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything..."
              rows={1}
              style={{ overflowY: "hidden" }}
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