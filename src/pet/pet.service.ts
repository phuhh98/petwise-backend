import { Inject, Injectable } from '@nestjs/common';
import { FirestoreService } from 'src/common/services/firebase/firestore.service';
import { CreatePetDto, UpdatePetDto } from './pet.dto';
import { Pet, PetId } from 'src/types/pet.type';
import { ProviderTokens } from 'src/common/constants/provider-token.constant';

@Injectable()
export class PetService {
  @Inject(ProviderTokens['FIRESTORE'])
  private readonly fireStoreService: FirestoreService;
  private readonly collectionName = 'pet';

  private petCollectionSingleton: ReturnType<
    typeof this.fireStoreService.getFirestoreCollection
  >;

  get collection() {
    if (!this.petCollectionSingleton) {
      this.petCollectionSingleton =
        this.fireStoreService.getFirestoreCollection(this.collectionName);
    }
    return this.petCollectionSingleton;
  }

  /**
   * create a new record for pet
   * @param createPetDto
   * @returns Pet & PetId or null
   */
  async createPet(createPetDto: CreatePetDto): Promise<(Pet & PetId) | Error> {
    const docRef = await this.collection.add(createPetDto);
    const createdPetData = (await docRef.get()).data();
    if (createdPetData) {
      return {
        ...(createdPetData as Pet),
        pet_id: docRef.id,
      };
    }

    return new Error(`Error durinng create pet`);
  }

  /**
   * Get pet data from firestore
   * @param pet_id
   * @returns Pet & PetId or null
   */
  async getPet(pet_id: string): Promise<(Pet & PetId) | Error> {
    const docRef = this.collection.doc(pet_id);
    const petData = (await docRef.get()).data();
    if (!!petData) {
      return { ...(petData as Pet), pet_id: docRef.id };
    }
    return new Error(`Can not find pet with pet_id ${pet_id}`);
  }

  async deletePet(pet_id: string): Promise<true> {
    const docRef = this.collection.doc(pet_id);
    await docRef.delete();
    return true;
  }

  /**
   * Return a list of pets of user_id
   * @param user_id
   * @returns (Pet & PetId)[]
   */

  async listPets(user_id: string): Promise<(Pet & PetId)[]> {
    const querySnapshot = await this.collection
      .where('user_id', '==', user_id)
      .get();

    if (!querySnapshot.size) {
      return [];
    }

    const pets = querySnapshot.docs.map((doc) => ({
      ...(doc.data() as Pet),
      pet_id: doc.id,
    }));

    return pets;
  }

  async updatePet(
    pet_id: string,
    updatePetDto: UpdatePetDto,
  ): Promise<(Pet & PetId) | Error> {
    const docRef = this.collection.doc(pet_id);

    await docRef.update({ ...updatePetDto });

    const updatedData = (await docRef.get()).data();
    if (updatedData) {
      return {
        ...(updatedData as Pet),
        pet_id: docRef.id,
      };
    }

    return new Error(`Error during update pet_id ${pet_id}`);
  }
}
