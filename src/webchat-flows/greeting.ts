import { WebchatFlow, FlowButton, Triggers, Card, UrlButton } from "automation-sdk";
import { createElasticsearchFlow } from "./elasticSearch";

export function webchatGreet() {
  const elasticsearchData = [
    {
      id: "1",
      question: "What are types Linux?",
      answer:"There are two major types of Linux distributions available, namely, Commercial Linux distributions and Open-Source distributions.",
      src: {
        tiny: "https://logowik.com/content/uploads/images/elasticsearch6390.jpg",
      },
    },
    {
      id: "2",
      question: "What is Linux?",
      answer: "Linux is a family of open-source Unix-like operating systems based on the Linux kernel, an operating system kernel first released on September 17, 1991, by Linus Torvalds. Linux is typically packaged in a Linux distribution.",
      src: {
        tiny: "https://logowik.com/content/uploads/images/elasticsearch6390.jpg",
      },
    },  
    {
      id: "3",
      question: "What is the difference between UNIX and LINUX?",
      answer:  "UNIX is a proprietary operating system, whereas LINUX is an open-source operating system. UNIX is a multiuser system, whereas LINUX is a multiuser system. UNIX is a command-based operating system, whereas LINUX is a command-based operating system.",
      src: {
        tiny: "https://logowik.com/content/uploads/images/elasticsearch6390.jpg",
      },
    },
  ];
  const rate = [
  {
      id: "1",
      question: "Useful answer",
      answer:"Thanks for your feedback",      
  },
  {
    id: "2",
    question: "Not useful answer",
    answer:"wait, we will send your question to our providers",
  }, 
];



  const greetingFlow = new WebchatFlow("partner_welcome", "greeting");
  greetingFlow
    .on(Triggers.INTENT, "GREETINGS")
    .translate("PROFILE_GREETING", "en", "Hello partner")
    .translate("PROFILE_GREETING", "ar", "مرحبا الشريك")
    .translate("PROFILE_GREETING", "nl", "Hallo partner")
    .text([["Hello partner", 1]])
    .userInput({
      question: "How can I help you?",
      contextParam: "userQuestion",
    })
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
          { id: "{{id}}", question: "{{question}}" , answer: "{{answer}}" },
          new WebchatFlow("b1", "sdk")
            .text([['Show More to {{payload.question}}']])
            .text([['Show More to {{payload.answer}}']])
        ),
      ]
    })
    .setVariable("rate", JSON.stringify(rate))
    .dynamicQuickReply("Rate your answer from Elastic Search: ", "{{{params.rate}}}",
        {
            id: "{{id}}",
            title: "{{question}}",
            payload: {id: "{{id}}",question: '{{question}}', answer: "{{answer}}"},
            flow: new WebchatFlow("colorCode", "examples_category")
                    .text([['{{payload.question}} answer: {{payload.answer}}']])
        }
    )

  return greetingFlow;
}



// Call Slack API
// Response of the Slack API
// .api(
//   "http://localhost:3000/slack/question",
//   "POST",
//   { "Content-Type":"application/json"},
//   { "question": "what is linux" }
//   // { "question": "{{params.userQuestion}}" }
// )
// .action(($: IExecuteParam) => {
//   console.log(`RESPONEEEEEEEEEE =====>>>>>${$.context.api.response}`);
// })

//############## BASTAWESY FLOW #############################
// Message find in elastic search 
// best case retunr answer from elastic 
// show data in Dynammic carsouel
//  show the Qhuick reply after show the answer (useful , not useful)
//  in case if useful (rate the answer) 
//  in case if not useful (save question in ealstic then send to slack and providers) 

  //.fire(Triggers.INTENT, "MAIN_MENU");