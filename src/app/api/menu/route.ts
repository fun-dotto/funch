import { NextResponse } from "next/server";
import { MenuService } from "../../../services/MenuService";
import { FirebaseMenuRepository } from "../../../repositories/firebase/FirebaseMenuRepository";

export async function GET() {
  try {
    const menuRepository = new FirebaseMenuRepository();
    const menuService = new MenuService(menuRepository);

    const formattedMenus = await menuService.getFormattedMenus();

    return NextResponse.json({
      success: true,
      data: formattedMenus,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Menu API Error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Internal Server Error",
        message: "Failed to fetch menu data",
      },
      { status: 500 }
    );
  }
}
