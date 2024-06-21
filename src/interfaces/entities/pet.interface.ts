export interface IPet {
  avatar?: IUploadedFile;
  bio?: string;
  id: string;
  name: string;
  profile?: PetProfileNS.IPetProfile;
  user_id: string;
}

export interface IUploadedFile {
  file_id: string;
  file_name: string;
  public_url: string;
}

export namespace PetProfileNS {
  export interface IPetProfile {
    appearance: IPetAppearance;
    breed: string;
    description: string;
    exercise: IPetExercise;
    grooming: IPetGrooming;
    health: IPetHealth;
    temperament: IPetTemperament;
    type: string;
  }

  export interface IPetAppearance {
    body: IPetBody;
    coat: IPetCoating;
    head: IPetHead;
    legs: string;
    size: string;
  }

  export interface IPetBody {
    build: string;
    tail: string;
  }

  export interface IPetHead {
    ears: string;
    eyes: string;
    nose: string;
    shape: string;
  }

  export interface IPetCoating {
    colors: string;
    type: string;
  }

  export interface IPetTemperament {
    barkingTendency: string;
    energyLevel: string;
    personality: string;
    trainability: string;
  }

  export interface IPetHealth {
    commonHealthIssues: string;
    lifespan: string;
  }

  export interface IPetGrooming {
    bathing: string;
    frequency: string;
  }

  export interface IPetExercise {
    needs: string;
    suitableFor: string;
  }
}
