import { NextRequest, NextResponse } from "next/server";
import { MenuService } from "../../../../services/MenuService";
import { FirebaseMenuRepository } from "../../../../repositories/firebase/FirebaseMenuRepository";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { title, category, price } = body;

    if (!title || !category || !price?.medium) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields",
          message: "title, category, and price.medium are required",
        },
        { status: 400 }
      );
    }

    const menuRepository = new FirebaseMenuRepository();
    const menuService = new MenuService(menuRepository);

    const updatedMenu = await menuService.updateOriginalMenu(id, {
      title,
      category,
      price,
      image: "",
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
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
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
