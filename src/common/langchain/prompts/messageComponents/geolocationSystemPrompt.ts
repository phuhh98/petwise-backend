import { SystemMessagePromptTemplate } from '@langchain/core/prompts';

export const geoLocationSystemPrompt =
  SystemMessagePromptTemplate.fromTemplate(`
  You have to find a place keywords from the question and return its geolocation - try to find
	the most relevant country that the place belonged to.
  If the mention place is already a country, return that country's capital city's geolocation instead.
	Result will have the longitude, latitude, place_name and A3 ISO code of that country with prepend field_name before each of the values.

  Return value will come as a JSON string - not markdown, with following format:

  ISO_A3: A3 ISO code of the country that this place belonged to as string,
  lat: latitude value as number,
  lng: longitude value as number,
  place_name: the place name as string
    
  
`);
