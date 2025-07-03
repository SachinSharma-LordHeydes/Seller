import type { ProfileFormData } from "@/interfaces/profileSetup.interface";
import { makeVar } from "@apollo/client";

export const initialProfileForm: ProfileFormData = {
  personalDetails: { firstName: "", lastName: "", phoneNumber: "", avatar: "" },
  temporaryAddress: {
    province: "",
    addressLabel: "",
    pinCode: "",
    locality: "",
    city: "",
    landMark: "",
    addressType: "TEMPORARY",
  },
  permanentAddress: {
    province: "",
    addressLabel: "",
    pinCode: "",
    locality: "",
    city: "",
    landMark: "",
    addressType: "PERMANENT",
  },
  storeDetails: { storeName: "", storeType: "", description: "" },
  storeAddress: {
    province: "",
    addressLabel: "",
    pinCode: "",
    locality: "",
    city: "",
    landMark: "",
    addressType: "STORE",
  },
  documentation: { panNumber: "" },
};
export const profileFormVar = makeVar<ProfileFormData>(initialProfileForm);
