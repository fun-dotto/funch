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

export async function POST(request: NextRequest) {
  try {
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

    const newMenu = await menuService.createOriginalMenu({
      title: name, // name → title (内部型に変換)
      category: category_id, // category_id → category (内部型に変換)
      price: prices, // prices → price (内部型に変換)
    });

    return NextResponse.json({
      success: true,
      data: newMenu,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Create Original Menu API Error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Internal Server Error",
        message:
          error instanceof Error
            ? error.message
            : "Failed to create original menu",
      },
      { status: 500 }
    );
  }
}
