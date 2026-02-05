import { NextRequest, NextResponse } from 'next/server';
import { soulsDB } from '@/lib/db/souls';
import type { Soul } from '@/lib/db/souls';

// GET /api/souls/[id] - Get single soul
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idStr } = await params;
    const id = parseInt(idStr);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid soul ID' },
        { status: 400 }
      );
    }
    
    const soul = soulsDB.getById(id);
    
    if (!soul) {
      return NextResponse.json(
        { success: false, error: 'Soul not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      soul,
    });
  } catch (error) {
    console.error('Error fetching soul:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch soul' },
      { status: 500 }
    );
  }
}

// POST /api/souls/[id] - Vote or Purchase
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid soul ID' },
        { status: 400 }
      );
    }
    
    const body = await request.json();
    const { action, voteType } = body;
    
    if (!action) {
      return NextResponse.json(
        { success: false, error: 'Action required (vote or purchase)' },
        { status: 400 }
      );
    }
    
    const soul = soulsDB.getById(id);
    
    if (!soul) {
      return NextResponse.json(
        { success: false, error: 'Soul not found' },
        { status: 404 }
      );
    }
    
    // Handle different actions
    switch (action) {
      case 'vote': {
        if (!voteType || (voteType !== 'up' && voteType !== 'down')) {
          return NextResponse.json(
            { success: false, error: 'Invalid vote type (must be "up" or "down")' },
            { status: 400 }
          );
        }
        
        const updatedSoul = soulsDB.vote(id, voteType);
        
        if (!updatedSoul) {
          return NextResponse.json(
            { success: false, error: 'Failed to record vote' },
            { status: 500 }
          );
        }
        
        return NextResponse.json({
          success: true,
          message: 'Vote recorded',
          soul: {
            id: updatedSoul.id,
            upvotes: updatedSoul.upvotes,
            downvotes: updatedSoul.downvotes,
            rating: updatedSoul.rating,
          },
        });
      }
      
      case 'purchase': {
        // Validate purchase (in production, check balance, process payment, etc.)
        const { userId, walletAddress } = body;
        
        if (!userId && !walletAddress) {
          return NextResponse.json(
            { success: false, error: 'User ID or wallet address required' },
            { status: 400 }
          );
        }
        
        const updatedSoul = soulsDB.purchase(id);
        
        if (!updatedSoul) {
          return NextResponse.json(
            { success: false, error: 'Failed to process purchase' },
            { status: 500 }
          );
        }
        
        // In production, this would:
        // 1. Check user's PNCR balance
        // 2. Transfer tokens from buyer to seller
        // 3. Create purchase record in database
        // 4. Generate download link/token for SOUL.md
        
        return NextResponse.json({
          success: true,
          message: 'Purchase successful',
          soul: {
            id: updatedSoul.id,
            name: updatedSoul.name,
            price: updatedSoul.price,
            sales: updatedSoul.sales,
          },
          download: {
            filename: `${updatedSoul.name.replace(/\s+/g, '_')}_SOUL.md`,
            content: updatedSoul.preview, // In production, return full SOUL.md
            // url: `/api/download/${purchaseToken}` // In production
          },
        });
      }
      
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action. Must be "vote" or "purchase"' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error processing request:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process request' },
      { status: 500 }
    );
  }
}

// PATCH /api/souls/[id] - Update soul (for creators)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid soul ID' },
        { status: 400 }
      );
    }
    
    const body = await request.json();
    const soul = soulsDB.getById(id);
    
    if (!soul) {
      return NextResponse.json(
        { success: false, error: 'Soul not found' },
        { status: 404 }
      );
    }
    
    // In production, verify ownership
    // if (body.authorId !== soul.authorId) return 403
    
    // Update allowed fields
    const allowedUpdates: (keyof Soul)[] = ['name', 'description', 'price', 'skills', 'preview', 'featured'];
    const updates: Partial<Soul> = {};
    
    allowedUpdates.forEach(field => {
      if (body[field] !== undefined) {
        updates[field] = body[field];
      }
    });
    
    const updatedSoul = soulsDB.update(id, updates);
    
    if (!updatedSoul) {
      return NextResponse.json(
        { success: false, error: 'Failed to update soul' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Soul updated',
      soul: updatedSoul,
    });
  } catch (error) {
    console.error('Error updating soul:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update soul' },
      { status: 500 }
    );
  }
}

// DELETE /api/souls/[id] - Delete soul (for creators/admins)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid soul ID' },
        { status: 400 }
      );
    }
    
    const soul = soulsDB.getById(id);
    
    if (!soul) {
      return NextResponse.json(
        { success: false, error: 'Soul not found' },
        { status: 404 }
      );
    }
    
    // In production, verify ownership or admin status
    // if (!isOwner && !isAdmin) return 403
    
    const deleted = soulsDB.delete(id);
    
    if (!deleted) {
      return NextResponse.json(
        { success: false, error: 'Failed to delete soul' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Soul deleted',
    });
  } catch (error) {
    console.error('Error deleting soul:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete soul' },
      { status: 500 }
    );
  }
}
