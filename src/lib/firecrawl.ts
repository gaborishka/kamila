import FirecrawlApp from "@mendable/firecrawl-js";

let _firecrawl: FirecrawlApp | null = null;

function getFirecrawl() {
  if (!_firecrawl) {
    _firecrawl = new FirecrawlApp({
      apiKey: process.env.FIRECRAWL_API_KEY!,
    });
  }
  return _firecrawl;
}

export async function extractTosData(companyUrl: string) {
  const result = await getFirecrawl().scrape(`${companyUrl}/terms`, {
    formats: [
      {
        type: "json" as const,
        prompt:
          "Extract as structured data: return window in days, conditions for full refund, exceptions that void refund, escalation process, regulatory body for complaints, customer rights mentioned, refund process steps, required documents",
      },
    ],
  });
  return result.json ?? null;
}

export async function searchRedditTips(companyName: string) {
  const result = await getFirecrawl().search(
    `${companyName} refund success site:reddit.com`,
    {
      limit: 5,
      scrapeOptions: { formats: ["markdown"], onlyMainContent: true },
    }
  );
  return result.web ?? [];
}

export async function searchConsumerRights(
  companyName: string,
  country: string = "EU"
) {
  const result = await getFirecrawl().search(
    `consumer rights refund ${companyName} ${country}`,
    {
      limit: 3,
      scrapeOptions: { formats: ["markdown"], onlyMainContent: true },
    }
  );
  return result.web ?? [];
}

export async function searchWeb(query: string) {
  const result = await getFirecrawl().search(query, {
    limit: 5,
    scrapeOptions: { formats: ["markdown"], onlyMainContent: true },
  });
  return result.web ?? [];
}
