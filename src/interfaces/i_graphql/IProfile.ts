export interface IPersonalDetailsInput {
  firstName: string;
  lastName: string;
  phoneNumber: string;
}

export interface IAddressInput {
  province: string;
  addressLabel: string;
  pinCode: string;
  locality: string;
  city: string;
  landMark: string;
  addressType: "STORE" | "PERMANENT" | "TEMPORARY";
}

export interface IStoreDetailsInput {
  storeName: string;
  storeType: string;
  description: string;
}

export interface DocumentationInput {
  panNumber: string;
}

export interface ProfileSetupInput {
  personalDetails: IPersonalDetailsInput;
  temporaryAddress: IAddressInput;
  permanentAddress: IAddressInput;
  storeDetails: IStoreDetailsInput;
  storeAddress: IAddressInput;
  documentation: DocumentationInput;
}
