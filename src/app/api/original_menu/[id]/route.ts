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

    const originalMenu = await menuService.getOriginalMenuById(id);

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

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, category_id, prices } = body;

    if (!name || !category_id || !prices?.medium) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields",
          message: "name, category_id, and prices.medium are required",
        },
        { status: 400 }
      );
    }

    const menuRepository = new FirebaseMenuRepository();
    const menuService = new MenuService(menuRepository);

    const updatedMenu = await menuService.updateOriginalMenu(id, {
      title: name, // name → title (内部型に変換)
      category: category_id, // category_id → category (内部型に変換)
      price: prices, // prices → price (内部型に変換)
    });

    return NextResponse.json({
      success: true,
      data: updatedMenu,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Update Original Menu API Error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Internal Server Error",
        message:
          error instanceof Error
            ? error.message
            : "Failed to update original menu",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const menuRepository = new FirebaseMenuRepository();
    const menuService = new MenuService(menuRepository);

    await menuService.deleteOriginalMenu(id);

    return NextResponse.json({
      success: true,
      message: "Original menu deleted successfully",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Delete Original Menu API Error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Internal Server Error",
        message:
          error instanceof Error
            ? error.message
            : "Failed to delete original menu",
      },
      { status: 500 }
    );
  }
}
