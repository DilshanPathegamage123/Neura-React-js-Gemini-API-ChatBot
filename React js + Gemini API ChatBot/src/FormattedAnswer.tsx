// import React from "react";
// import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
// import { coy } from "react-syntax-highlighter/dist/esm/styles/prism";
// import "./App.css";

// type FormattedAnswerProps = {
//   text: string;
// };

// const FormattedAnswer: React.FC<FormattedAnswerProps> = ({ text }) => {
//   const parseAnswerText = (answerText: string) => {
//     const lines = answerText.split("\n");
//     const elements = [];
//     let keyIndex = 0;

//     while (lines.length > 0) {
//       let line = lines.shift() || "";
//       if (line.startsWith("```javascript")) {
//         const codeLines = [];
//         while (lines.length > 0 && !lines[0].startsWith("```")) {
//           codeLines.push(lines.shift());
//         }
//         lines.shift(); // Remove the closing ```
//         elements.push(
//           <SyntaxHighlighter key={keyIndex++} language="javascript" style={coy}>
//             {codeLines.join("\n")}
//           </SyntaxHighlighter>
//         );
//       } else if (line.startsWith("**")) {
//         const endIndex = line.indexOf("**", 2);
//         if (endIndex !== -1) {
//           elements.push(
//             <strong key={keyIndex++}>{line.substring(2, endIndex)}</strong>
//           );
//           elements.push(
//             <span key={keyIndex++}>{line.substring(endIndex + 2)}</span>
//           );
//         } else {
//           elements.push(<span key={keyIndex++}>{line}</span>);
//         }
//       } else if (line.startsWith("* ")) {
//         elements.push(<li key={keyIndex++}>{line.substring(2)}</li>);
//       } else {
//         elements.push(<p key={keyIndex++}>{line}</p>);
//       }
//     }

//     return elements;
//   };

//   return <div className="formatted-answer">{parseAnswerText(text)}</div>;
// };

// export default FormattedAnswer;
