import { NextRequest, NextResponse } from "next/server";
import { MenuService } from "../../../services/MenuService";
import { FirebaseMenuRepository } from "../../../repositories/firebase/MenuRepository";

export async function GET() {
  try {
    const menuRepository = new FirebaseMenuRepository();
    const menuService = new MenuService(menuRepository);

    const formattedOriginalMenus =
      await menuService.getFormattedOriginalMenus();

    return NextResponse.json({
      success: true,
      data: formattedOriginalMenus,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Original Menu API Error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Internal Server Error",
        message: "Failed to fetch original menu data",
      },
      { status: 500 }
    );
  }
}

// POST method removed - now handled by direct Firestore operations
