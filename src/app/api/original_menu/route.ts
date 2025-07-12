import { NextRequest, NextResponse } from "next/server";
import { MenuService } from "../../../services/MenuService";
import { FirebaseMenuRepository } from "../../../repositories/firebase/FirebaseMenuRepository";

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

    const newMenu = await menuService.createOriginalMenu({
      title,
      category,
      price,
      image: "",
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
