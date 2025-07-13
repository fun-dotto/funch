import { NextRequest, NextResponse } from "next/server";
import { ImageService } from "../../../services/ImageService";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const menuId = formData.get("menuId") as string;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "File is required" },
        { status: 400 }
      );
    }

    if (!menuId) {
      return NextResponse.json(
        { success: false, error: "Menu ID is required" },
        { status: 400 }
      );
    }

    const imageService = new ImageService();
    const imageUrl = await imageService.uploadMenuImage(menuId, file);

    return NextResponse.json({
      success: true,
      data: { imageUrl },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Image Upload API Error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Internal Server Error",
        message: error instanceof Error ? error.message : "Failed to upload image",
      },
      { status: 500 }
    );
  }
}