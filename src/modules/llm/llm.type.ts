import { IDataWithError } from 'src/interfaces/entities/common.interface';
import { PetProfileNS } from 'src/interfaces/entities/pet.interface';
import { PetDiaryNS } from 'src/interfaces/entities/pet-diary.interface';

export interface IGeolocationRes {
  ISO_A3: string;
  lat: number;
  lng: number;
  place_name: string;
}

export interface ITravelAssisstantReponse {
  answer: string;
  location: IGeolocationRes;
}

export interface ITravelAssisstantQuery {
  question: string;
}

export interface IPetProfileBuilderRes
  extends PetProfileNS.IPetProfile,
    IDataWithError {
  error: string;
}

export interface IPetDiaryBuilderReponse
  extends PetDiaryNS.IPetDiaryGenaratedAnalysis,
    IDataWithError {
  error: string;
}
