import { WebchatFlow, FlowButton, Card } from "automation-sdk";

export function createElasticsearchFlow(elasticsearchData: any) {
  const elasticSearchFlow = new WebchatFlow("elasticsearch_flow", "elasticsearch");

  // Iterate over each entry in elasticsearchData and create a card for each answer
  for (const entry of elasticsearchData) {
    const card = new Card(
      entry.id,  // Use the ID as the card's ID
      entry.question,  // Use the question as the card's title
      entry.answer,  // Use the answer as the card's subtitle
      entry.src.tiny,  // Use the tiny image URL as mediaURL
      [
        new FlowButton(
          `button_${entry.id}`,  // Use a unique ID for the button
          "View Details",
          { id: entry.id },
          new WebchatFlow("details_flow", "details_category")
            .text([[`Details for: ${entry.question}`, 1]])
            .text([[entry.answer]])  // Display the answer when the button is clicked
        ),
        // You can add more buttons as needed
      ]
    );

  }

  return elasticSearchFlow;
}
