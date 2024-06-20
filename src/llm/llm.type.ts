import { IDataWithError } from 'src/types/common.type';
import { IPetDiary, PetProfileNS } from 'src/types/pet.type';

export interface IGeolocationRes {
  ISO_A3: string;
  lat: number;
  lng: number;
  place_name: string;
}

export interface ITravelAssisstantReponse {
  location: IGeolocationRes;
  answer: string;
}

export interface ITravelAssisstantQuery {
  question: string;
}

export interface IPetProfileBuilderRes
  extends PetProfileNS.IPetProfile,
    IDataWithError {
  error: string;
}

export interface IPetDiaryBuilderReponse extends IPetDiary, IDataWithError {
  error: string;
}
