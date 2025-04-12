import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import ContactGroup from "@/models/ContactGroup";

// GET all contact groups for the current user
export async function GET(request) {
  try {
    const userId = request.headers.get("x-user-id");
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized", success: false },
        { status: 401 }
      );
    }

    await connectDB();
    const groups = await ContactGroup.find({ user: userId }).sort({
      createdAt: -1,
    });

    return NextResponse.json({ groups, success: true });
  } catch (error) {
    console.error("Error fetching contact groups:", error);
    return NextResponse.json(
      { error: "Failed to fetch contact groups", success: false },
      { status: 500 }
    );
  }
}

// POST create a new contact group
export async function POST(request) {
  try {
    const userId = request.headers.get("x-user-id");
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized", success: false },
        { status: 401 }
      );
    }

    const { name, emails } = await request.json();

    if (!name || !emails || !Array.isArray(emails)) {
      return NextResponse.json(
        { error: "Name and emails array are required", success: false },
        { status: 400 }
      );
    }

    await connectDB();

    // Check if group name already exists for this user
    const existingGroup = await ContactGroup.findOne({
      user: userId,
      name,
    });

    if (existingGroup) {
      return NextResponse.json(
        { error: "A group with this name already exists", success: false },
        { status: 400 }
      );
    }

    const group = await ContactGroup.create({
      user: userId,
      name,
      emails,
    });

    return NextResponse.json({ group, success: true });
  } catch (error) {
    console.error("Error creating contact group:", error);
    return NextResponse.json(
      { error: "Failed to create contact group", success: false },
      { status: 500 }
    );
  }
}

// PUT update a contact group
export async function PUT(request) {
  try {
    const userId = request.headers.get("x-user-id");
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized", success: false },
        { status: 401 }
      );
    }

    const { id, name, emails } = await request.json();

    if (!id || !name || !emails || !Array.isArray(emails)) {
      return NextResponse.json(
        { error: "ID, name, and emails array are required", success: false },
        { status: 400 }
      );
    }

    await connectDB();

    // Check if group exists and belongs to user
    const group = await ContactGroup.findOne({
      _id: id,
      user: userId,
    });

    if (!group) {
      return NextResponse.json(
        { error: "Contact group not found", success: false },
        { status: 404 }
      );
    }

    // Check if new name conflicts with existing group
    if (name !== group.name) {
      const existingGroup = await ContactGroup.findOne({
        user: userId,
        name,
      });

      if (existingGroup) {
        return NextResponse.json(
          { error: "A group with this name already exists" },
          { status: 400 }
        );
      }
    }

    // Update the group
    group.name = name;
    group.emails = emails;
    await group.save();

    return NextResponse.json({ group, success: true });
  } catch (error) {
    console.error("Error updating contact group:", error);
    return NextResponse.json(
      { error: "Failed to update contact group", success: false },
      { status: 500 }
    );
  }
}

// DELETE a contact group
export async function DELETE(request) {
  try {
    const userId = request.headers.get("x-user-id");
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized", success: false },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Group ID is required" },
        { status: 400 }
      );
    }

    await connectDB();

    const group = await ContactGroup.findOneAndDelete({
      _id: id,
      user: userId,
    });

    if (!group) {
      return NextResponse.json(
        { error: "Contact group not found", success: false },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Contact group deleted successfully",
      success: true,
    });
  } catch (error) {
    console.error("Error deleting contact group:", error);
    return NextResponse.json(
      { error: "Failed to delete contact group", success: false },
      { status: 500 }
    );
  }
}
