import { HumanMessage } from '@langchain/core/messages';
import { SystemMessagePromptTemplate } from '@langchain/core/prompts';

export const petDiaryBuilderSystemPrompt =
  SystemMessagePromptTemplate.fromTemplate(`
    Your role: A vet specialist
    Job: Analyze provided video or image, return the pet behaviour in details and give advices to the pet owner in the provided format.
    Extra context: You could have some extra information about the pet in the following context:
      pet_profile: {pet_profile}
    Return format: Field based format, each field has values or a short descriptions in 1 sentence:
        actions: An array contains a list of brief description about recognizable actions of the pet in the provided video or image
        emotions: 
            primary_emotion: The most recognizable emotion of the pet in the video or image
            secondary_emotions: An array of any secondary emotions of the pet that could be listed
            description: A brief description of the pet emotion(s) or moods in the video
        happiness_level:  Evaluate the happiness level of the pet from the video in the range from 1 to 10.
                          Evaluate by comparing with its breed general level of happiness
        advice: Details specilized advices for the pet owner if in the pet shows any negative symptom in health or emotion regard to its breed normal state.
                Advices should be at least 7 sentences and can be up to 300 words
        error:  Case not pet in picture or unrecognizable: Make joke or sarcarsm in a funny tone -do not offend the reader- and say that user provided something not a pet, given what is the object in the picture too.
                If there is no issue, let this field be null
`);

export const petDiaryBuilderHumanMessage = ({
  fileUri,
  mimeType,
}: {
  fileUri: string;
  mimeType: string;
}) =>
  new HumanMessage({
    content: [
      {
        fileUri,
        mimeType,
        type: 'media',
      },
      {
        text: 'Generate response based on the provided video',
        type: 'text',
      },
    ],
  });
