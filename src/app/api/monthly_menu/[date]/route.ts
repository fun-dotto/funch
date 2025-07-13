import { NextRequest, NextResponse } from "next/server";
import { MenuService } from "../../../../services/MenuService";
import { FirebaseMenuRepository } from "../../../../repositories/firebase/MenuRepository";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ date: string }> }
) {
  try {
    const { date } = await params;

    // 日付フォーマットのバリデーション（YYYY-MM）
    const dateRegex = /^\d{4}-\d{2}$/;
    if (!dateRegex.test(date)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid Date Format",
          message: "Date must be in YYYY-MM format",
        },
        { status: 400 }
      );
    }

    const menuRepository = new FirebaseMenuRepository();
    const menuService = new MenuService(menuRepository);

    const monthlyMenu = await menuService.getMonthlyMenuByMonth(date);

    if (!monthlyMenu) {
      return NextResponse.json(
        {
          success: false,
          error: "Not Found",
          message: `Monthly menu for ${date} not found`,
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: monthlyMenu,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Monthly Menu by Date API Error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Internal Server Error",
        message:
          error instanceof Error
            ? error.message
            : "Failed to fetch monthly menu",
      },
      { status: 500 }
    );
  }
}