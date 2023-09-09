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
import { createElasticsearchFlow } from "./elasticSearch";

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
  const providers = [
    {
      id: "1",
      question: "What is a Linux distribution (Linux distro)?",
      answer:
        "A Linux distribution is a complete operating system built around the Linux kernel. It includes various software packages, libraries, and utilities to provide a functional and user-friendly environment. Examples of Linux distributions include Ubuntu, Fedora, Debian, and CentOS.",
      src: {
        tiny: "https://yt3.googleusercontent.com/ytc/AOPolaTCsMhpgrJldSw0eABzVJ9JEc1pYyTST4CJ7JzN1Q=s900-c-k-c0x00ffffff-no-rj",
      },
    },
    {
      id: "2",
      question: "What is the root user in Linux?",
      answer:
        "The root user is the superuser in Linux, also known as the system administrator. Root has the highest level of access and can perform any operation on the system. It's important to use root privileges judiciously to prevent accidental damage.",
      src: {
        tiny: "https://media.licdn.com/dms/image/C4D0BAQHR3-muCN3-4A/company-logo_200_200/0/1611699233211?e=2147483647&v=beta&t=9ih0eEQjXVMMb5gA76KKXUV3T-VJkTN812f769UiBr4",
      },
    },
    {
      id: "3",
      question: "How do I create a new user in Linux?",
      answer:
        "You can create a new user in Linux using the useradd command, followed by passwd to set the user's password. For example: sudo useradd username and sudo passwd username.",
      src: {
        tiny: "https://storage.googleapis.com/gweb-uniblog-publish-prod/images/Google_Docs.width-500.format-webp.webp",
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
            .setVariable("rate", JSON.stringify(rate))
            .dynamicQuickReply(
              "Rate your answer from Elastic Search: ",
              "{{{params.rate}}}",
              {
                id: "{{id}}",
                title: "{{question}}",
                payload: {
                  id: "{{id}}",
                  question: "{{question}}",
                  answer: "{{answer}}",
                },
                flow: new WebchatFlow("colorCode", "examples_category").text([
                  ["{{payload.question}} answer: {{payload.answer}}"],
                ]),
              }
            )
        ),
      ],
    })
    // .dynamicQuickReply(
    //   "Rate your answer from Elastic Search 2: ",
    //   "{{{params.rate}}}",
    //   {
    //     id: "{{id}}",
    //     title: "{{question}}",
    //     payload: {
    //       id: "{{id}}",
    //       question: "{{question}}",
    //       answer: "{{answer}}",
    //     },
    //     flow: new WebchatFlow("colorCode", "examples_category").text([
    //       ["{{payload.question}} answer: {{payload.answer}}"],
    //     ]),
    //   }
    // )
    //if notuseful
    .text([["we will send your question to our providers"]])
    .setVariable("data", JSON.stringify(providers)) // Store question data in a context variable
    .dynamicCarousel("{{{params.data}}}", {
      id: "{{id}}",
      title: "{{question}}",
      subTitle: "{{answer}}",
      mediaURL: "{{{src.tiny}}}",
      buttons: [
        new FlowButton(
          "f{{id}}",
          "Show More",
          {
            id: "{{id}}",
            question: "{{question}}",
            answer: "{{answer}}",
          },
          new WebchatFlow("b1", "sdk")
            .text([["Show More to {{payload.question}}"]])
            .text([[" {{payload.answer}}"]])
            .setVariable("rate", JSON.stringify(rate))
            .dynamicQuickReply(
              "Rate your answer from our providers: ",
              "{{{params.rate}}}",
              {
                id: "{{id}}",
                title: "{{question}}",
                payload: {
                  id: "{{id}}",
                  question: "{{question}}",
                  answer: "{{answer}}",
                },
                flow: new WebchatFlow("colorCode", "examples_category").text([
                  ["{{payload.question}} answer: {{payload.answer}}"],
                ]),
              }
            )
        ),
      ],
    })
    // .quickReply("What is your opinon", [
    //   new flow.FlowButton("1", "Useful", {}, firstFlow()),
    //   new flow.FlowButton("2", "Not Useful", {}, secondFlow()),
    // ]);

    .text([["End of Conversation"]]);
  // .text([["end of the flow "]])
  // .action(async ($: IExecuteParam) => {
  //   console.log("webchat get queue params ==> ", {
  //     profileId: $.tactfulMessage.profileId,
  //     channelId: $.tactfulMessage.channelInfo?.id,
  //   });
  //   const livechatCommands = await $.livechat.getCommands();
  //   const queue = await livechatCommands.queueCommand(
  //     {
  //       profileId: $.tactfulMessage.profileId,
  //       channelId: $.tactfulMessage.channelInfo?.id,
  //     },
  //     "getChannelQueue"
  //   );
  //   console.log("retrieved queue ==>", queue);
  //   $.context.params[`${$.tactfulMessage.conversationId}_queue`] = queue;
  // })

  // .text([["end of the flow 2"]]);
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
