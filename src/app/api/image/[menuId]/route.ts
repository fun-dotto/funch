import { NextRequest, NextResponse } from "next/server";
import { ImageService } from "../../../../services/ImageService";

export async function GET(
  request: NextRequest,
  { params }: { params: { menuId: string } }
) {
  try {
    const { menuId } = params;
    const imageService = new ImageService();

    const imageUrl = await imageService.getMenuImageUrlById(menuId);

    if (!imageUrl) {
      return NextResponse.json(
        { success: false, error: "Image not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { imageUrl },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Image Get API Error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Internal Server Error",
        message: "Failed to get image URL",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { menuId: string } }
) {
  try {
    const { menuId } = params;
    const imageService = new ImageService();

    await imageService.deleteMenuImage(menuId);

    return NextResponse.json({
      success: true,
      message: "Image deleted successfully",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Image Delete API Error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Internal Server Error",
        message:
          error instanceof Error ? error.message : "Failed to delete image",
      },
      { status: 500 }
    );
  }
}
