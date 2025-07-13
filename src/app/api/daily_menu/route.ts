import { NextResponse } from "next/server";
import { MenuService } from "../../../services/MenuService";
import { FirebaseMenuRepository } from "../../../repositories/firebase/MenuRepository";

export async function GET() {
  try {
    const menuRepository = new FirebaseMenuRepository();
    const menuService = new MenuService(menuRepository);

    const dates = await menuService.getAllDailyMenuDates();

    return NextResponse.json({
      success: true,
      data: dates,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Daily Menu Dates API Error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Internal Server Error",
        message: "Failed to fetch daily menu dates",
      },
      { status: 500 }
    );
  }
}