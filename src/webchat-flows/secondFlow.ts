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
import { thirdFlow } from "./thirdFlow";

export function secondFlow() {
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
      question: "How do I install software in Linux?",
      answer:
        " In Linux, you can typically install software using package managers like APT (Debian/Ubuntu), YUM/DNF (CentOS/Fedora), or Pacman (Arch Linux). You can use commands like apt-get, yum, or pacman to search for and install software packages. Additionally, some software can be downloaded and installed manually from source code.",
      src: {
        tiny: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c9/Microsoft_Office_Teams_%282018%E2%80%93present%29.svg/1200px-Microsoft_Office_Teams_%282018%E2%80%93present%29.svg.png",
      },
    },
    {
      id: "3",
      question: "What is the root user in Linux?",
      answer:
        "The root user is the superuser in Linux, also known as the system administrator. Root has the highest level of access and can perform any operation on the system. It's important to use root privileges judiciously to prevent accidental damage.",
      src: {
        tiny: "https://media.licdn.com/dms/image/C4D0BAQHR3-muCN3-4A/company-logo_200_200/0/1611699233211?e=2147483647&v=beta&t=9ih0eEQjXVMMb5gA76KKXUV3T-VJkTN812f769UiBr4",
      },
    },
    {
      id: "4",
      question: "How can I update my Linux system?",
      answer:
        "You can update your Linux system by using the package manager of your distribution. For example, on Ubuntu, you can use sudo apt update to refresh package lists and sudo apt upgrade to install updates. On CentOS/Fedora, you can use sudo dnf update, and on Arch Linux, you can use sudo pacman -Syu.",
      src: {
        tiny: "https://media.licdn.com/dms/image/C4D0BAQHR3-muCN3-4A/company-logo_200_200/0/1611699233211?e=2147483647&v=beta&t=9ih0eEQjXVMMb5gA76KKXUV3T-VJkTN812f769UiBr4",
      },
    },
    {
      id: "5",
      question: "How do I create a new user in Linux?",
      answer:
        "You can create a new user in Linux using the useradd command, followed by passwd to set the user's password. For example: sudo useradd username and sudo passwd username.",
      src: {
        tiny: "https://storage.googleapis.com/gweb-uniblog-publish-prod/images/Google_Docs.width-500.format-webp.webp",
      },
    },
    {
      id: "6",
      question: "What is the terminal in Linux, and how do I use it?",
      answer:
        "The terminal, also known as the command line or shell, is a text-based interface for interacting with your Linux system. You can use it to run commands, manage files, configure settings, and more. Common terminal commands include ls (list files), cd (change directory), mkdir (create directory), and sudo (execute commands with superuser privileges).",
      src: {
        tiny: "https://play-lh.googleusercontent.com/0oO5sAneb9lJP6l8c6DH4aj6f85qNpplQVHmPmbbBxAukDnlO7DarDW0b-kEIHa8SQ",
      },
    },
  ];
  const secondFlow = new flow.WebchatFlow("partner_welcome", "greeting");
  secondFlow
    .text([["We will send your question to our providers"]])
    .setVariable("data", JSON.stringify(providers))
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
            .quickReply("What is your opnion for our Providers", [
              new FlowButton("1", "Useful", "1", firstFlow()),
              new FlowButton("2", "Not Useful", "2", thirdFlow()),
            ])
        ),
      ],
    });

  return secondFlow;
}
