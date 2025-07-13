import { NextResponse } from "next/server";
import { MenuService } from "../../../services/MenuService";
import { FirebaseMenuRepository } from "../../../repositories/firebase/MenuRepository";

export async function GET() {
  try {
    const menuRepository = new FirebaseMenuRepository();
    const menuService = new MenuService(menuRepository);

    const months = await menuService.getAllMonthlyMenuMonths();

    return NextResponse.json({
      success: true,
      data: months,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Monthly Menu Months API Error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Internal Server Error",
        message: "Failed to fetch monthly menu months",
      },
      { status: 500 }
    );
  }
}