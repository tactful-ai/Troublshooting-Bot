const flowTypes: {[key: string]: string} = {
    "facebook": "FacebookFlow",
    "whatsapp": "WhatsappFlow",
    "webchat": "WebchatFlow"
}

export const flowTemplate = (flowName: string, flowType: string, category: string, version: string) =>{
    flowType = flowType ?? "Facebook";

    return `// auto-generated flow template
import { ${flowTypes[flowType]} } from 'automation-sdk';

export function ${flowName}(){
    const ${flowName} = new ${flowTypes[flowType]}("${flowName}", "${category}", "${version}");
    
    // This is a sample flow as a reference
    ${flowName}.text(["hello world", 1])
    
    return ${flowName};
}
`;
};