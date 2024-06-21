export namespace PetDiaryNS {
  export interface IPetEmotion {
    description: string;
    primary_emotion: string;
    secondary_emotions: string[];
  }

  export interface IPetDiaryGenaratedAnalysis {
    actions: string[];
    advice: string;
    emotions: IPetEmotion;
  }
}
