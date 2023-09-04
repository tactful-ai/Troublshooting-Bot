import {
  readFileSync,
  writeFileSync,
  existsSync,
  mkdirSync,
  promises as fs,
} from "fs";
import path from "path";

export class FileWriter {
  ensureDirectoryExistence(directoryPath: string) {
    if (!existsSync(directoryPath)) {
      mkdirSync(directoryPath);
    }
  }

  ensureFileExistence(directoryPath: string): void {
    if (existsSync(directoryPath)) {
      throw new Error("File already exists!!");
    }
  }

  syncWriteFile(dir: string, filename: string, data: any) {
    filename = `${filename}.ts`
    let filePath = path.join(dir, filename);
    this.ensureDirectoryExistence(dir);
    try {
      this.ensureFileExistence(filePath);
    } catch (err: any) {
      console.log(err.message);
      return;
    }

    writeFileSync(path.join(dir, filename), data, {
      flag: "a+",
    });
    return true;
  }

  appendFlow(flowName: string, flowType?:string) {
    let flowsIndexPath = path.resolve(`./src/${flowType}-flows/index.ts`);
    fs.appendFile(flowsIndexPath, `\nexport * from "./${flowName}";`);

    let flowManagerPath = path.resolve("./src/FlowCoordinator.ts");
    let flowManagerContent = readFileSync(flowManagerPath, "utf-8");
    flowManagerContent =
      `import { ${flowName} } from "./${flowType}-flows/${flowName}"; \n` +
      flowManagerContent;
    let stepFlowText = "setupFlows() {";
    let indexOfSetupFlows = flowManagerContent.indexOf(stepFlowText);
    flowManagerContent =
      flowManagerContent.slice(0, indexOfSetupFlows + stepFlowText.length) +
      `\n\t\tthis.flowManager.setupNewFlow(${flowName}());` +
      flowManagerContent.slice(indexOfSetupFlows + stepFlowText.length);
    writeFileSync(flowManagerPath, flowManagerContent, { flag: "w" });
  }
}
