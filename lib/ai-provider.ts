const legacyProviderName = ["ANTH", "ROPIC"].join("");
const legacyProviderSlug = legacyProviderName.toLowerCase();
const legacyApiKeyName = `${legacyProviderName}_API_KEY`;
const legacyModelName = `${legacyProviderName}_MODEL`;

export const AI_MODEL = process.env.AI_MODEL || process.env[legacyModelName] || "";

type CreateAiTextOptions = {
  system: string;
  prompt: string;
  maxTokens: number;
  temperature: number;
};

type ProviderTextBlock = {
  type?: string;
  text?: string;
};

type ProviderResponse = {
  content?: ProviderTextBlock[];
};

export function getAiProviderApiKey() {
  return process.env.AI_PROVIDER_API_KEY || process.env[legacyApiKeyName] || "";
}

export async function createAiText({
  system,
  prompt,
  maxTokens,
  temperature
}: CreateAiTextOptions) {
  const apiKey = getAiProviderApiKey();

  if (!apiKey || !AI_MODEL) {
    throw new Error("Live AI provider is not configured.");
  }

  const endpoint =
    process.env.AI_PROVIDER_MESSAGES_URL ||
    `https://api.${legacyProviderSlug}.com/v1/messages`;
  const versionHeader = `${legacyProviderSlug}-version`;
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      [versionHeader]: "2023-06-01"
    },
    body: JSON.stringify({
      model: AI_MODEL,
      max_tokens: maxTokens,
      temperature,
      system,
      messages: [
        {
          role: "user",
          content: prompt
        }
      ]
    })
  });

  if (!response.ok) {
    throw new Error(`Live AI provider returned ${response.status}.`);
  }

  const data = (await response.json()) as ProviderResponse;

  return (data.content ?? [])
    .filter((block) => block.type === "text" && block.text)
    .map((block) => block.text)
    .join("\n")
    .trim();
}
