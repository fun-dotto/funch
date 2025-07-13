import { NextRequest, NextResponse } from "next/server";
import { MenuService } from "../../../../../services/MenuService";
import { FirebaseMenuRepository } from "../../../../../repositories/firebase/MenuRepository";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ date: string }> }
) {
  try {
    const { date } = await params;

    // 日付フォーマットのバリデーション（YYYY-MM-DD -> YYYYMMDD）
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid Date Format",
          message: "Date must be in YYYY-MM-DD format",
        },
        { status: 400 }
      );
    }

    // YYYY-MM-DD から YYYYMMDD に変換
    const formattedDate = date.replace(/-/g, "");

    const menuRepository = new FirebaseMenuRepository();
    const menuService = new MenuService(menuRepository);

    const menuItems = await menuService.getDailyMenuItemsByDate(formattedDate);

    if (!menuItems) {
      return NextResponse.json(
        {
          success: false,
          error: "Not Found",
          message: `Daily menu for date ${date} not found`,
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: menuItems,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Daily Menu Items by Date API Error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Internal Server Error",
        message:
          error instanceof Error
            ? error.message
            : "Failed to fetch daily menu items",
      },
      { status: 500 }
    );
  }
}