import {
  WebchatFlow,
  FlowButton,
  Triggers,
  Card,
  UrlButton,
  IExecuteParam,
} from "automation-sdk";
import flow from "automation-sdk";
import { firstFlow } from "./firstFlow";
import { secondFlow } from "./secondFlow";

export function webchatGreet() {
  const elasticsearchData = [
    {
      id: "1",
      question: "What are types Linux?",
      answer:
        "There are two major types of Linux distributions available, namely, Commercial Linux distributions and Open-Source distributions.",
      src: {
        tiny: "https://logowik.com/content/uploads/images/elasticsearch6390.jpg",
      },
    },
    {
      id: "2",
      question: "What is Linux?",
      answer:
        "Linux is a family of open-source Unix-like operating systems based on the Linux kernel, an operating system kernel first released on September 17, 1991, by Linus Torvalds. Linux is typically packaged in a Linux distribution.",
      src: {
        tiny: "https://logowik.com/content/uploads/images/elasticsearch6390.jpg",
      },
    },
    {
      id: "3",
      question: "What is the difference between UNIX and LINUX?",
      answer:
        "UNIX is a proprietary operating system, whereas LINUX is an open-source operating system. UNIX is a multiuser system, whereas LINUX is a multiuser system. UNIX is a command-based operating system, whereas LINUX is a command-based operating system.",
      src: {
        tiny: "https://logowik.com/content/uploads/images/elasticsearch6390.jpg",
      },
    },
  ];

  const rate = [
    {
      id: "1",
      question: "Useful answer",
      answer: "Thanks for your feedback",
    },
    {
      id: "2",
      question: "Not useful answer",
      answer: "wait, we will send your question to our providers",
    },
  ];

  const greetingFlow = new flow.WebchatFlow("partner_welcome", "greeting");
  greetingFlow
    .on(Triggers.INTENT, "GREETINGS")
    .translate("PROFILE_GREETING", "en", "Hello partner")
    .translate("PROFILE_GREETING", "ar", "مرحبا الشريك")
    .translate("PROFILE_GREETING", "nl", "Hallo partner")
    .randomText([
      ["Hello Partner", 1],
      ["Welcome Commander", 1],
      ["Greeting Developer", 1],
    ])

    .userInput({
      question: "Can you send your email?",
      contextParam: "userEmail",
      validation: {
        regex: "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+.[a-zA-Z]{2,}$",
        errorMessage: "Email is not valid, please enter a valid email address ",
      },
    })
    .text([
      [
        "We will send you a verification code to this email {{{params.userEmail}}}",
        1,
      ],
    ])
    .userInput({
      question: "How can I help you?",
      contextParam: "userQuestion",
    })

    .text([
      ["Thank you for your question {{{params.userQuestion}}}"],
      ["We will send your question to Elastic Search"],
    ])
    .setVariable("data", JSON.stringify(elasticsearchData)) // Store question data in a context variable
    .dynamicCarousel("{{{params.data}}}", {
      id: "{{id}}",
      title: "{{question}}",
      subTitle: "{{answer}}",
      mediaURL: "{{{src.tiny}}}",
      buttons: [
        new FlowButton(
          "f{{id}}",
          "Show More",
          { id: "{{id}}", question: "{{question}}", answer: "{{answer}}" },
          new WebchatFlow("b1", "sdk")
            .text([["Show More to {{payload.question}}"]])
            .text([[" {{payload.answer}}"]])
            .quickReply("What is your opnion for Elastic Search", [
              new FlowButton("1", "Useful", "1", firstFlow()),
              new FlowButton("2", "Not Useful", "2", secondFlow()),
            ])
        ),
      ],
    });

  return greetingFlow;
}
