type BanSearchResponse = {
  features?: Array<{
    properties?: {
      label?: string;
      name?: string;
      city?: string;
      postcode?: string;
    };
  }>;
};

type SiretLookupResult = {
  name: string;
  address: string;
  zipCode: string;
  city: string;
  source: "inpi" | "sirene";
};

export class LocationServiceError extends Error {}

const DEFAULT_BAN_BASE_URL = "https://api-adresse.data.gouv.fr";
const DEFAULT_RECHERCHE_ENTREPRISES_URL = "https://recherche-entreprises.api.gouv.fr/search";

const getBanBaseUrl = () =>
  process.env.BAN_API_BASE_URL?.trim() || DEFAULT_BAN_BASE_URL;

const getInpiBaseUrl = () => process.env.INPI_API_BASE_URL?.trim() || null;
const getInpiToken = () => process.env.INPI_API_TOKEN?.trim() || null;

const getRechercheEntreprisesUrl = () =>
  process.env.RECHERCHE_ENTREPRISES_API_URL?.trim() || DEFAULT_RECHERCHE_ENTREPRISES_URL;

const ensureString = (value: unknown) => (typeof value === "string" ? value.trim() : "");

const buildAddressLabel = (name: string, postcode: string, city: string) =>
  [name, `${postcode} ${city}`.trim()].filter(Boolean).join(", ");

const extractGarageFromInpiPayload = (payload: unknown): Omit<SiretLookupResult, "source"> | null => {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  const record = payload as Record<string, unknown>;
  const company = (record.company ?? record.etablissement ?? record.result) as
    | Record<string, unknown>
    | undefined;
  const source = company ?? record;

  const name = ensureString(
    source.raisonSociale ??
      source.nom_raison_sociale ??
      source.denomination ??
      source.nomComplet ??
      source.nom,
  );
  const address = ensureString(
    source.adresseLigne1 ??
      source.adresse ??
      source.adresse_complete ??
      source.address ??
      source.adresseEtablissement,
  );
  const zipCode = ensureString(source.codePostal ?? source.postalCode ?? source.code_postal);
  const city = ensureString(source.ville ?? source.city ?? source.commune);

  if (!name || !address || !zipCode || !city) {
    return null;
  }

  return { name, address, zipCode, city };
};

const extractGarageFromRecherchePayload = (
  payload: unknown,
): Omit<SiretLookupResult, "source"> | null => {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  const root = payload as Record<string, unknown>;
  const results = Array.isArray(root.results) ? (root.results as Record<string, unknown>[]) : [];
  const first = results[0];
  if (!first) {
    return null;
  }

  const seat = (first.siege as Record<string, unknown> | undefined) ?? {};
  const name = ensureString(first.nom_complet ?? first.nom_raison_sociale ?? first.denomination);
  const address = ensureString(
    seat.adresse ??
      seat.adresse_complete ??
      seat.adresse_ligne_1 ??
      first.adresse ??
      first.adresse_complete,
  );
  const zipCode = ensureString(seat.code_postal ?? first.code_postal);
  const city = ensureString(seat.libelle_commune ?? first.libelle_commune);

  if (!name || !address || !zipCode || !city) {
    return null;
  }

  return { name, address, zipCode, city };
};

async function fetchJson(url: string, init?: RequestInit) {
  const response = await fetch(url, init);
  if (!response.ok) {
    throw new LocationServiceError(`Provider responded with status ${response.status}.`);
  }
  return response.json();
}

export const locationService = {
  async getAddressSuggestions(query: string) {
    const params = new URLSearchParams({ q: query, limit: "5" });
    const payload = (await fetchJson(
      `${getBanBaseUrl()}/search/?${params.toString()}`,
    )) as BanSearchResponse;
    const features = Array.isArray(payload.features) ? payload.features : [];

    return features
      .map((feature) => {
        const properties = feature.properties ?? {};
        const address = ensureString(properties.name);
        const zipCode = ensureString(properties.postcode);
        const city = ensureString(properties.city);
        const label = ensureString(properties.label) || buildAddressLabel(address, zipCode, city);

        if (!address || !zipCode || !city) {
          return null;
        }

        return {
          label,
          address,
          zipCode,
          city,
        };
      })
      .filter(
        (entry): entry is { label: string; address: string; zipCode: string; city: string } =>
          entry !== null,
      );
  },

  async getCitiesByPostalCode(postalCode: string) {
    const params = new URLSearchParams({
      postcode: postalCode,
      type: "municipality",
      limit: "20",
    });
    const payload = (await fetchJson(
      `${getBanBaseUrl()}/search/?${params.toString()}`,
    )) as BanSearchResponse;
    const features = Array.isArray(payload.features) ? payload.features : [];
    const cities = features
      .map((feature) => ensureString(feature.properties?.city))
      .filter(Boolean);

    return [...new Set(cities)].sort((a, b) => a.localeCompare(b));
  },

  async lookupGarageBySiret(siret: string): Promise<SiretLookupResult> {
    const inpiBaseUrl = getInpiBaseUrl();
    const inpiToken = getInpiToken();

    if (inpiBaseUrl && inpiToken) {
      try {
        const inpiPayload = await fetchJson(`${inpiBaseUrl}/companies/${siret}`, {
          headers: {
            Authorization: `Bearer ${inpiToken}`,
            Accept: "application/json",
          },
        });
        const extracted = extractGarageFromInpiPayload(inpiPayload);
        if (extracted) {
          return { ...extracted, source: "inpi" };
        }
      } catch {
        // Fallback handled below.
      }
    }

    const params = new URLSearchParams({
      query: siret,
      page: "1",
      per_page: "1",
    });
    const sirenePayload = await fetchJson(
      `${getRechercheEntreprisesUrl()}?${params.toString()}`,
    );
    const extracted = extractGarageFromRecherchePayload(sirenePayload);

    if (!extracted) {
      throw new LocationServiceError("Aucune information trouvée pour ce SIRET.");
    }

    return { ...extracted, source: "sirene" };
  },
};
