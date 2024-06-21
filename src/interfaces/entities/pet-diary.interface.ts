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
  analysis: PetDiaryNS.IPetDiaryGenaratedAnalysis;
  id: string;
  image: IUploadedFile;
  pet_id: string;
  /**
   * Reference to pet's id
   */
  user_id: string;
}
