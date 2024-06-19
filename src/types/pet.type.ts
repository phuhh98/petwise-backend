export interface Pet {
  user_id: string;
  name: string;
  bio?: string;
  avatar?: string;
  profile?: PetProfileNS.PetProfile;
}

export interface PetId {
  id: string;
}

export namespace PetProfileNS {
  export interface PetProfile {
    type: string;
    breed: string;
    description: string;
    appearance: PetAppearance;
    temperament: PetTemperament;
    health: PetHealth;
    grooming: PetGrooming;
    exercise: PetExercise;
  }

  export interface PetAppearance {
    size: string;
    coat: PetCoating;
    head: PetHead;
    body: PetBody;
    legs: string;
  }

  export interface PetBody {
    build: string;
    tail: string;
  }

  export interface PetHead {
    ears: string;
    eyes: string;
    nose: string;
    shape: string;
  }

  export interface PetCoating {
    colors: string;
    type: string;
  }

  export interface PetTemperament {
    barkingTendency: string;
    energyLevel: string;
    personality: string;
    trainability: string;
  }

  export interface PetHealth {
    commonHealthIssues: string;
    lifespan: string;
  }

  export interface PetGrooming {
    bathing: string;
    frequency: string;
  }

  export interface PetExercise {
    needs: string;
    suitableFor: string;
  }
}
