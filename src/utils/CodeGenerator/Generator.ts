import { FileWriter } from "./FileWriter";
import { flowTemplate } from "./templates/flow";

const fileWriter = new FileWriter();

export class Generator {
  static generateFlow(flowName: string, flowType: string, category:string, version:string) {
    const template = flowTemplate(flowName, flowType, category, version);
    const fileDirectory = `./src/${flowType}-flows/`;
    const isFileCreated = fileWriter.syncWriteFile(
      fileDirectory,
      flowName,
      template
    );
    if (isFileCreated) fileWriter.appendFlow(flowName, flowType);
  }
}
