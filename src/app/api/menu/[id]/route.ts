import { NextRequest, NextResponse } from "next/server";
import { MenuService } from "../../../../services/MenuService";
import { FirebaseMenuRepository } from "../../../../repositories/firebase/MenuRepository";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const menuId = parseInt(id);

    if (isNaN(menuId)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid ID",
          message: "Menu ID must be a number",
        },
        { status: 400 }
      );
    }

    const menuRepository = new FirebaseMenuRepository();
    const menuService = new MenuService(menuRepository);

    const menu = await menuService.getMenuById(menuId);

    if (!menu) {
      return NextResponse.json(
        {
          success: false,
          error: "Not Found",
          message: `Menu with ID ${menuId} not found`,
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: menu,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Menu by ID API Error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Internal Server Error",
        message:
          error instanceof Error
            ? error.message
            : "Failed to fetch menu",
      },
      { status: 500 }
    );
  }
}