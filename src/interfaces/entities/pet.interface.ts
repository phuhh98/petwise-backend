export interface IPet {
  id: string;
  user_id: string;
  name: string;
  bio?: string;
  avatar?: IUploadedFile;
  profile?: PetProfileNS.IPetProfile;
}

export interface IUploadedFile {
  file_name: string;
  file_id: string;
  public_url: string;
}

export namespace PetProfileNS {
  export interface IPetProfile {
    type: string;
    breed: string;
    description: string;
    appearance: IPetAppearance;
    temperament: IPetTemperament;
    health: IPetHealth;
    grooming: IPetGrooming;
    exercise: IPetExercise;
  }

  export interface IPetAppearance {
    size: string;
    coat: IPetCoating;
    head: IPetHead;
    body: IPetBody;
    legs: string;
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
