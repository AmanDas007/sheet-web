import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import SurveyRegister from "@/models/SurveyRegister";

const DEFAULT_ROWS = Array.from({ length: 9 }, () => ({
  name: "",
  phone: "",
  rakba: "",
}));

async function getOrCreateRegister() {
  let register = await SurveyRegister.findOne({
    $or: [
      { key: "main-register" },
      {
        village: "Supaul",
        policeStationNo: "23",
        district: "Darbhanga",
      },
    ],
  }).sort({ updatedAt: -1 });

  if (!register) {
    register = await SurveyRegister.create({
      key: "main-register",
      village: "Supaul",
      policeStationNo: "23",
      district: "Darbhanga",
      rows: DEFAULT_ROWS,
    });
  }

  return register;
}

export async function GET() {
  try {
    await connectDB();

    const register = await getOrCreateRegister();

    return NextResponse.json(
      {
        success: true,
        register,
      },
      { status: 200 }
    );
  } catch (error) {
    console.log("GET REGISTER ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: error.message || "Register fetch failed",
      },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    await connectDB();

    const body = await request.json();

    const rows = Array.isArray(body.rows)
      ? body.rows.map((row) => ({
          name: String(row?.name || ""),
          phone: String(row?.phone || ""),
          rakba: String(row?.rakba || ""),
        }))
      : [];

    const register = await getOrCreateRegister();

    register.key = "main-register";
    register.village = "Supaul";
    register.policeStationNo = "23";
    register.district = "Darbhanga";
    register.rows = rows;

    await register.save();

    return NextResponse.json(
      {
        success: true,
        register,
      },
      { status: 200 }
    );
  } catch (error) {
    console.log("PUT REGISTER ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: error.message || "Register update failed",
      },
      { status: 500 }
    );
  }
}