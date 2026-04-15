type GeocodingInput = {
  address: string;
  zipCode: string;
  city: string;
};

type GeocodingResult = {
  latitude: number;
  longitude: number;
};

type NominatimResult = {
  lat: string;
  lon: string;
};

const DEFAULT_NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";
const DEFAULT_USER_AGENT = "MDS-MDP-back/1.0";

export class GeocodingError extends Error {}

const getNominatimUrl = () =>
  process.env.GEOCODING_NOMINATIM_URL?.trim() || DEFAULT_NOMINATIM_URL;

const getUserAgent = () => process.env.GEOCODING_USER_AGENT?.trim() || DEFAULT_USER_AGENT;

const getEmail = () => process.env.GEOCODING_EMAIL?.trim() || null;

const buildAddressQuery = ({ address, zipCode, city }: GeocodingInput) =>
  `${address.trim()}, ${zipCode.trim()} ${city.trim()}, France`;

const parseCoordinates = (result: NominatimResult): GeocodingResult => {
  const latitude = Number.parseFloat(result.lat);
  const longitude = Number.parseFloat(result.lon);

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    throw new GeocodingError("Geocoding provider returned invalid coordinates.");
  }

  return { latitude, longitude };
};

export const geocodingService = {
  async geocodeAddress(input: GeocodingInput): Promise<GeocodingResult> {
    const query = new URLSearchParams({
      q: buildAddressQuery(input),
      format: "jsonv2",
      limit: "1",
      addressdetails: "0",
    });

    const email = getEmail();
    if (email) {
      query.set("email", email);
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    let response: Response;
    try {
      response = await fetch(`${getNominatimUrl()}?${query.toString()}`, {
        method: "GET",
        headers: {
          "User-Agent": getUserAgent(),
          Accept: "application/json",
        },
        signal: controller.signal,
      });
    } catch (error) {
      throw new GeocodingError(
        error instanceof Error
          ? `Geocoding request failed: ${error.message}`
          : "Geocoding request failed.",
      );
    } finally {
      clearTimeout(timeout);
    }

    if (!response.ok) {
      throw new GeocodingError(`Geocoding provider responded with status ${response.status}.`);
    }

    const payload = (await response.json()) as NominatimResult[];
    const first = payload[0];

    if (!first) {
      throw new GeocodingError("No geocoding result found for this address.");
    }

    return parseCoordinates(first);
  },
};
