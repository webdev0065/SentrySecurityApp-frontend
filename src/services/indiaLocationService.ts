const INDIA_LOCATION_API = 'https://aniket-thapa.github.io/india-pincode-api';

export type IndiaLocationOption = { name: string; slug: string };

type StatePayload = IndiaLocationOption[];
type DistrictPayload = { districts: IndiaLocationOption[] };
type OfficePayload = { offices: Array<{ officeName: string }> };

const cache = new Map<string, IndiaLocationOption[]>();

const formatName = (value: string) =>
  value.toLowerCase().replace(/\b\w/g, character => character.toUpperCase());

const request = async <T>(path: string): Promise<T> => {
  const response = await fetch(`${INDIA_LOCATION_API}${path}`);
  if (!response.ok) throw new Error('India location service is unavailable.');
  return response.json() as Promise<T>;
};

export const indiaLocationService = {
  async getStates(): Promise<IndiaLocationOption[]> {
    const key = 'states';
    if (cache.has(key)) return cache.get(key)!;
    const states = await request<StatePayload>('/states.json');
    const options = states.map(state => ({
      ...state,
      name: formatName(state.name),
    }));
    cache.set(key, options);
    return options;
  },
  async getDistricts(stateSlug: string): Promise<IndiaLocationOption[]> {
    const key = `districts:${stateSlug}`;
    if (cache.has(key)) return cache.get(key)!;
    const response = await request<DistrictPayload>(
      `/states/${stateSlug}.json`,
    );
    const options = response.districts.map(district => ({
      ...district,
      name: formatName(district.name),
    }));
    cache.set(key, options);
    return options;
  },
  async getCities(
    stateSlug: string,
    districtSlug: string,
  ): Promise<IndiaLocationOption[]> {
    const key = `cities:${stateSlug}:${districtSlug}`;
    if (cache.has(key)) return cache.get(key)!;
    const response = await request<OfficePayload>(
      `/districts/${stateSlug}/${districtSlug}.json`,
    );
    const options = Array.from(
      new Set(
        response.offices.map(office =>
          office.officeName.replace(/\s+(BO|SO|HO)$/i, '').trim(),
        ),
      ),
    )
      .filter(Boolean)
      .sort((left, right) => left.localeCompare(right))
      .map(name => ({ name, slug: name.toLowerCase() }));
    cache.set(key, options);
    return options;
  },
};
