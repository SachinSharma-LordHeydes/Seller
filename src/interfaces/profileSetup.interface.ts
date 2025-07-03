export interface PersonalDetails {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  avatar: string;
}

export interface AddressDetails {
  province: string;
  addressLabel: string;
  pinCode: string;
  locality: string;
  city: string;
  landMark: string;
  addressType: "STORE" | "PERMANENT" | "TEMPORARY";
}

export interface StoreDetails {
  storeName: string;
  storeType: string;
  description: string;
}

export interface DocumentationDetails {
  panNumber: string;
}

export interface ProfileFormData {
  personalDetails: PersonalDetails;
  temporaryAddress: AddressDetails;
  permanentAddress: AddressDetails;
  storeDetails: StoreDetails;
  storeAddress: AddressDetails;
  documentation: DocumentationDetails;
  
}
