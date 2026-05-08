import mongoose from "mongoose";

const rowSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      default: "",
    },
    phone: {
      type: String,
      default: "",
    },
    rakba: {
      type: String,
      default: "",
    },
  },
  { _id: false }
);

const surveyRegisterSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      default: "main-register",
    },
    village: {
      type: String,
      default: "Supaul",
    },
    policeStationNo: {
      type: String,
      default: "23",
    },
    district: {
      type: String,
      default: "Darbhanga",
    },
    rows: {
      type: [rowSchema],
      default: () =>
        Array.from({ length: 9 }, () => ({
          name: "",
          phone: "",
          rakba: "",
        })),
    },
  },
  { timestamps: true }
);

const SurveyRegister =
  mongoose.models.SurveyRegister ||
  mongoose.model("SurveyRegister", surveyRegisterSchema);

export default SurveyRegister;