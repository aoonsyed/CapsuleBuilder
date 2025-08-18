import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  brand2: "",
  sharedPreference: "",
  brandPreference: {
    fit: false,
    price: false,
    aesthetic: false,
    material: false,
    brand_ethics: false,
  },
  idea : "",
  localBrand : "",
   productType: "",
  keyFeatures: "",
  targetPrice: "",
  quantity: "",
  materialPreference: "",
  materialPreferenceOptions: {
    yes: false,
    no: false,
  },
  manufacturingPreference: {
    usa: false,
    international: false,
  },
  materialError: false,
};

const formSlice = createSlice({
  name: "form",
  initialState,
  reducers: {
    setIdea: (state,action)=>{
        state.idea = action.payload;
    },
    setBrand: (state,action)=>{
        state.localBrand = action.payload;
    },
    setBrand2: (state, action) => {
      state.brand2 = action.payload;
    },
    setSharedPreference: (state, action) => {
      state.sharedPreference = action.payload;
    },
    toggleBrandPreference: (state, action) => {
      const key = action.payload;
      state.brandPreference[key] = !state.brandPreference[key];
    },
     setProductType: (state, action) => {
      state.productType = action.payload;
    },
    setKeyFeatures: (state, action) => {
      state.keyFeatures = action.payload;
    },
    setTargetPrice: (state, action) => {
      state.targetPrice = action.payload;
    },
    setQuantity: (state, action) => {
      state.quantity = action.payload;
    },
    setMaterialPreference: (state, action) => {
      state.materialPreference = action.payload;
    },
    toggleManufacturingPreference: (state, action) => {
      const key = action.payload;
      state.manufacturingPreference[key] = !state.manufacturingPreference[key];
    },
    toggleMaterialPreferenceOption: (state, action) => {
  const { option } = action.payload;
  state.materialPreferenceOptions = {
    yes: option === "yes",
    no: option === "no",
  };
},

     setMaterialError: (state, action) => {
      state.materialError = action.payload;
    },
    clearForm: () => initialState,
  },
});

export const {
  setIdea,
  setBrand,
  setBrand2,
  setSharedPreference,
  toggleBrandPreference,
  setProductType,
  setKeyFeatures,
  setTargetPrice,
  setQuantity,
  setMaterialPreference,
  toggleManufacturingPreference,
  toggleMaterialPreferenceOption,
  setMaterialError,
  clearForm,
} = formSlice.actions;

export default formSlice.reducer;
