import inquirer from "inquirer";
import { Generator } from "./Generator";

type fileType = {
  facebook: string,
  webchat: string
}

const flowTypes: fileType = {
  facebook: "facebook",
  webchat: "webchat"
};

inquirer
  .prompt([
    {
      type: "list",
      name: "flowType",
      message: "Which flow type you want to create?",
      choices: [flowTypes.facebook, flowTypes.webchat],
    },
    {
      type: "input",
      name: "flowName",
      message: "Enter the flow name: ",
    },
    {
      type: "input",
      name: "flowCategory",
      message: "Enter the flow category: ",
      default: "auto_generated_flow"
    },
    {
      type: "input",
      name: "flowVersion",
      message: "Enter the flow version: ",
      default: "1.0"
    },
  ])
  .then(function (answer) {
    Generator.generateFlow(answer.flowName, answer.flowType, answer.flowCategory, answer.flowVersion);
    console.log("Flow generated sucessfully!!");
  });
