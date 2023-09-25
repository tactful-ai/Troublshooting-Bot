import {
  WebchatFlow,
  FlowButton,
  Triggers,
  Card,
  UrlButton,
  IExecuteParam,
} from "automation-sdk";
import flow from "automation-sdk";
export function thirdFlow() {
  const thirdFlow = new flow.WebchatFlow("partner_welcome", "greeting");

  thirdFlow
    .text([["one of our team will contact you soon"]])
    .api(
      "http://localhost:3000/userData",
      "POST",
      {},
      { email: "{{params.userEmail}}", question: "{{params.userQuestion}}" }
    );

  return thirdFlow;
}
