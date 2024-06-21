import { IUploadedFile } from './pet.interface';

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

export interface IDiary {
  id: string;
  /**
   * Reference to pet's id
   */
  user_id: string;
  pet_id: string;
  image: IUploadedFile;
  analysis: PetDiaryNS.IPetDiaryGenaratedAnalysis;
}
