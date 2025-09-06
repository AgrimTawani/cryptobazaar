import { NextRequest, NextResponse } from 'next/server';

// Mock escrow storage - in production, use a database
const escrows: any[] = []; // eslint-disable-line @typescript-eslint/no-explicit-any

export async function POST(request: NextRequest) {
  try {
    const { action, escrowData } = await request.json();

    switch (action) {
      case 'create':
        return await createEscrow(escrowData);
      case 'confirm':
        return await confirmEscrow(escrowData);
      case 'release':
        return await releaseEscrow(escrowData);
      case 'dispute':
        return await disputeEscrow(escrowData);
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Escrow API error:', error);
    return NextResponse.json(
      { error: 'Escrow operation failed' },
      { status: 500 }
    );
  }
}

async function createEscrow(data: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
  const { buyer, seller, amount, assetType, paymentMethod } = data;

  // Create escrow ID
  const escrowId = `escrow_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  // Initialize escrow state
  const escrow = {
    id: escrowId,
    buyer,
    seller,
    amount,
    assetType, // 'crypto' or 'fiat'
    paymentMethod, // 'razorpay' for fiat
    status: 'pending',
    createdAt: new Date().toISOString(),
    buyerConfirmed: false,
    sellerConfirmed: false,
    locked: false,
  };

  escrows.push(escrow);

  return NextResponse.json({ escrowId, status: 'created' });
}

async function confirmEscrow(data: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
  const { escrowId, userType } = data;

  const escrow = escrows.find(e => e.id === escrowId);
  if (!escrow) {
    return NextResponse.json({ error: 'Escrow not found' }, { status: 404 });
  }

  if (userType === 'buyer') {
    escrow.buyerConfirmed = true;
  } else if (userType === 'seller') {
    escrow.sellerConfirmed = true;
  }

  // If both parties confirmed, lock the assets
  if (escrow.buyerConfirmed && escrow.sellerConfirmed) {
    escrow.status = 'locked';
    escrow.locked = true;
    // Here you would call Nitrolite to lock assets in state channel
  }

  return NextResponse.json({ status: escrow.status });
}

async function releaseEscrow(data: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
  const { escrowId } = data;

  const escrow = escrows.find(e => e.id === escrowId);
  if (!escrow) {
    return NextResponse.json({ error: 'Escrow not found' }, { status: 404 });
  }

  if (!escrow.locked) {
    return NextResponse.json({ error: 'Escrow not locked' }, { status: 400 });
  }

  // Release funds to seller
  escrow.status = 'completed';
  // Here you would call Nitrolite to release assets

  return NextResponse.json({ status: 'completed' });
}

async function disputeEscrow(data: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
  const { escrowId, reason } = data;

  const escrow = escrows.find(e => e.id === escrowId);
  if (!escrow) {
    return NextResponse.json({ error: 'Escrow not found' }, { status: 404 });
  }

  escrow.status = 'disputed';
  escrow.disputeReason = reason;

  return NextResponse.json({ status: 'disputed' });
}
