import { NextRequest, NextResponse } from "next/server";
import { MenuService } from "../../../../services/MenuService";
import { FirebaseMenuRepository } from "../../../../repositories/firebase/MenuRepository";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const menuRepository = new FirebaseMenuRepository();
    const menuService = new MenuService(menuRepository);

    const originalMenus = await menuService.getOriginalMenus();
    const originalMenu = originalMenus.find(menu => menu.id === id);

    if (!originalMenu) {
      return NextResponse.json(
        {
          success: false,
          error: "Not Found",
          message: `Original menu with ID ${id} not found`,
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: originalMenu,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Get Original Menu API Error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Internal Server Error",
        message:
          error instanceof Error
            ? error.message
            : "Failed to fetch original menu",
      },
      { status: 500 }
    );
  }
}

// PUT method removed - now handled by direct Firestore operations

// DELETE method removed - now handled by direct Firestore operations
