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
  const secondFlow = new flow.WebchatFlow("partner_welcome", "greeting");
  secondFlow
    .text([["We will send your question to our providers"]])
    .userInput({
      question: "How can I help you?",
      contextParam: "userQuestion",
    })
    .api(
      "http://localhost:3000/question",
      "POST",
      {},
      { question: "{{params.userQuestion}}" }
    )
    .dynamicCarousel("{{{api.response.json.results}}}", {
      id: "{{id}}",
      mediaURL: "{{{image_url}}}",
      title: "{{{title}}}",
      subTitle: "{{{short_description}}}",
      buttons: [
        new FlowButton(
          "{{id}}",
          "Show More",
          {
            id: "{{id}}",
            title: "{{title}}",
            short_description: "{{short_description}}",
          },
          new WebchatFlow("b1", "sdk")
            .text([["Show More to {{payload.title}}"]])
            .text([[" {{payload.short_description}}"]])
            .quickReply("What is your opnion for Providers", [
              new FlowButton("1", "Useful", "1", firstFlow()),
              new FlowButton("2", "Not Useful", "2", thirdFlow()),
            ])
        ),
      ],
    });

  return secondFlow;
}
