import type { GamePass, DeveloperProduct } from "../types";

const BASE = "/api/roblox";

// ── Helpers ──────────────────────────────────────────────────────────────

async function robloxFetch(
  apiKey: string,
  path: string,
  init?: RequestInit
): Promise<Response> {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      "x-api-key": apiKey,
      ...(init?.headers ?? {}),
    },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Roblox API ${res.status}: ${text}`);
  }
  return res;
}

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

// ── Icons ────────────────────────────────────────────────────────────────

interface IconResponse {
  data: { imageUrl?: string; languageCode?: string }[];
}

async function fetchGamePassIconUrl(
  apiKey: string,
  gamePassId: string
): Promise<string | undefined> {
  try {
    const res = await robloxFetch(
      apiKey,
      `/legacy-game-internationalization/v1/game-passes/${gamePassId}/icons`
    );
    const data: IconResponse = await res.json();
    return data.data?.[0]?.imageUrl ?? undefined;
  } catch {
    return undefined;
  }
}

async function fetchDevProductIconUrl(
  apiKey: string,
  devProductId: string
): Promise<string | undefined> {
  try {
    const res = await robloxFetch(
      apiKey,
      `/legacy-game-internationalization/v1/developer-products/${devProductId}/icons`
    );
    const data: IconResponse = await res.json();
    return data.data?.[0]?.imageUrl ?? undefined;
  } catch {
    return undefined;
  }
}

// ── Game Passes ──────────────────────────────────────────────────────────

interface ListGamePassesResponse {
  gamePasses: RawGamePass[];
  nextPageToken?: string;
}

interface RawGamePass {
  gamePassId: number;
  productId: number;
  name: string;
  description: string;
  isForSale: boolean;
  iconImageAssetId?: number;
  priceInformation?: {
    defaultPriceInRobux?: number;
    enabledFeatures?: string[];
  };
}

function hasRegionalPricing(features?: string[]): boolean {
  return features?.includes("RegionalPricing") ?? false;
}

export async function listGamePasses(
  apiKey: string,
  universeId: string
): Promise<GamePass[]> {
  const all: GamePass[] = [];
  let pageToken: string | undefined;

  do {
    const params = new URLSearchParams({ pageSize: "50" });
    if (pageToken) params.set("pageToken", pageToken);

    const res = await robloxFetch(
      apiKey,
      `/game-passes/v1/universes/${universeId}/game-passes/creator?${params}`
    );
    const data: ListGamePassesResponse = await res.json();

    for (const gp of data.gamePasses ?? []) {
      all.push({
        id: String(gp.gamePassId),
        name: gp.name,
        description: gp.description ?? "",
        price: gp.priceInformation?.defaultPriceInRobux ?? 0,
        isForSale: gp.isForSale ?? false,
        isRegionalPricingEnabled: hasRegionalPricing(gp.priceInformation?.enabledFeatures),
        iconUrl: undefined,
      });
    }

    pageToken = data.nextPageToken;
    if (pageToken) await delay(250);
  } while (pageToken);

  // Fetch icon URLs in parallel (batches of 5 to respect rate limits)
  for (let i = 0; i < all.length; i += 5) {
    const batch = all.slice(i, i + 5);
    const urls = await Promise.all(
      batch.map((gp) => fetchGamePassIconUrl(apiKey, gp.id))
    );
    urls.forEach((url, j) => {
      all[i + j].iconUrl = url;
    });
    if (i + 5 < all.length) await delay(250);
  }

  return all;
}

export async function createGamePass(
  apiKey: string,
  universeId: string,
  data: {
    name: string;
    description: string;
    price: number;
    isRegionalPricingEnabled: boolean;
    imageFile: File | null;
  }
): Promise<{ id: string; name: string; price: number }> {
  const form = new FormData();
  form.append("name", data.name);
  form.append("description", data.description);
  form.append("price", String(data.price));
  form.append("isForSale", "true");
  form.append("isRegionalPricingEnabled", String(data.isRegionalPricingEnabled));
  if (data.imageFile) {
    form.append("imageFile", data.imageFile);
  }

  const res = await robloxFetch(
    apiKey,
    `/game-passes/v1/universes/${universeId}/game-passes`,
    { method: "POST", body: form }
  );
  const body: RawGamePass = await res.json();
  return {
    id: String(body.gamePassId),
    name: body.name,
    price: body.priceInformation?.defaultPriceInRobux ?? data.price,
  };
}

export async function updateGamePass(
  apiKey: string,
  universeId: string,
  passId: string,
  data: {
    name?: string;
    description?: string;
    price?: number;
    isForSale?: boolean;
    isRegionalPricingEnabled?: boolean;
    imageFile?: File | null;
  }
): Promise<void> {
  const form = new FormData();
  if (data.name !== undefined) form.append("name", data.name);
  if (data.description !== undefined) form.append("description", data.description);
  if (data.price !== undefined) form.append("price", String(data.price));
  if (data.isForSale !== undefined) form.append("isForSale", String(data.isForSale));
  if (data.isRegionalPricingEnabled !== undefined)
    form.append("isRegionalPricingEnabled", String(data.isRegionalPricingEnabled));
  if (data.imageFile) form.append("imageFile", data.imageFile);

  await robloxFetch(
    apiKey,
    `/game-passes/v1/universes/${universeId}/game-passes/${passId}`,
    { method: "PATCH", body: form }
  );
}

// ── Developer Products ───────────────────────────────────────────────────

interface ListDevProductsResponse {
  developerProducts: RawDevProduct[];
  nextPageToken?: string;
}

interface RawDevProduct {
  developerProductId: number;
  productId: number;
  name: string;
  description: string;
  isForSale: boolean;
  iconImageAssetId?: number;
  priceInformation?: {
    defaultPriceInRobux?: number;
    enabledFeatures?: string[];
  };
}

export async function listDeveloperProducts(
  apiKey: string,
  universeId: string
): Promise<DeveloperProduct[]> {
  const all: DeveloperProduct[] = [];
  let pageToken: string | undefined;

  do {
    const params = new URLSearchParams({ pageSize: "50" });
    if (pageToken) params.set("pageToken", pageToken);

    const res = await robloxFetch(
      apiKey,
      `/developer-products/v2/universes/${universeId}/developer-products/creator?${params}`
    );
    const data: ListDevProductsResponse = await res.json();

    for (const dp of data.developerProducts ?? []) {
      all.push({
        id: String(dp.developerProductId),
        name: dp.name,
        description: dp.description ?? "",
        price: dp.priceInformation?.defaultPriceInRobux ?? 0,
        isForSale: dp.isForSale ?? false,
        isRegionalPricingEnabled: hasRegionalPricing(dp.priceInformation?.enabledFeatures),
        iconUrl: undefined,
      });
    }

    pageToken = data.nextPageToken;
    if (pageToken) await delay(150);
  } while (pageToken);

  // Fetch icon URLs in parallel (batches of 5 to respect rate limits)
  for (let i = 0; i < all.length; i += 5) {
    const batch = all.slice(i, i + 5);
    const urls = await Promise.all(
      batch.map((dp) => fetchDevProductIconUrl(apiKey, dp.id))
    );
    urls.forEach((url, j) => {
      all[i + j].iconUrl = url;
    });
    if (i + 5 < all.length) await delay(200);
  }

  return all;
}

export async function createDeveloperProduct(
  apiKey: string,
  universeId: string,
  data: {
    name: string;
    description: string;
    price: number;
    isRegionalPricingEnabled: boolean;
    imageFile: File | null;
  }
): Promise<{ id: string; name: string; price: number }> {
  const form = new FormData();
  form.append("name", data.name);
  form.append("description", data.description);
  form.append("price", String(data.price));
  form.append("isForSale", "true");
  form.append("isRegionalPricingEnabled", String(data.isRegionalPricingEnabled));
  if (data.imageFile) {
    form.append("imageFile", data.imageFile);
  }

  const res = await robloxFetch(
    apiKey,
    `/developer-products/v2/universes/${universeId}/developer-products`,
    { method: "POST", body: form }
  );
  const body: RawDevProduct = await res.json();
  return {
    id: String(body.developerProductId),
    name: body.name,
    price: body.priceInformation?.defaultPriceInRobux ?? data.price,
  };
}

export async function updateDeveloperProduct(
  apiKey: string,
  universeId: string,
  productId: string,
  data: {
    name?: string;
    description?: string;
    price?: number;
    isForSale?: boolean;
    isRegionalPricingEnabled?: boolean;
    imageFile?: File | null;
  }
): Promise<void> {
  const form = new FormData();
  if (data.name !== undefined) form.append("name", data.name);
  if (data.description !== undefined) form.append("description", data.description);
  if (data.price !== undefined) form.append("price", String(data.price));
  if (data.isForSale !== undefined) form.append("isForSale", String(data.isForSale));
  if (data.isRegionalPricingEnabled !== undefined)
    form.append("isRegionalPricingEnabled", String(data.isRegionalPricingEnabled));
  if (data.imageFile) form.append("imageFile", data.imageFile);

  await robloxFetch(
    apiKey,
    `/developer-products/v2/universes/${universeId}/developer-products/${productId}`,
    { method: "PATCH", body: form }
  );
}
