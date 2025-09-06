'use client';

import { useState, useEffect, useCallback } from 'react';
import { createWalletClient, custom, http, createPublicClient, Address, WalletClient } from 'viem';
import { mainnet } from 'viem/chains';
import { NitroliteClient } from '@erc7824/nitrolite';
import { supabase } from '@/lib/supabase';
import { useRouter, useSearchParams } from 'next/navigation';
import type { User } from '@supabase/auth-helpers-nextjs';

interface TransactionAd {
  id: string;
  seller_id: string;
  token_id: string;
  amount: number;
  price_per_token: number;
  total_price: number;
  payment_method: string;
  status: string;
  description: string;
  profiles: {
    username: string;
    full_name: string;
  };
  tokens: {
    name: string;
    symbol: string;
    contract_address: string;
  };
}

interface EscrowTransaction {
  id: string;
  ad_id: string;
  buyer_id: string;
  seller_id: string;
  token_id: string;
  amount: number;
  price_per_token: number;
  total_price: number;
  payment_method: string;
  status: string;
  razorpay_order_id?: string;
  razorpay_payment_id?: string;
  channel_id?: string;
  buyer_confirmed: boolean;
  seller_confirmed: boolean;
}

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [walletClient, setWalletClient] = useState<WalletClient | null>(null);
  const [account, setAccount] = useState<Address | null>(null);
  const [nitroliteClient, setNitroliteClient] = useState<NitroliteClient | null>(null);
  const [connected, setConnected] = useState(false);
  const [currentAd, setCurrentAd] = useState<TransactionAd | null>(null);
  const [escrowTransaction, setEscrowTransaction] = useState<EscrowTransaction | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const searchParams = useSearchParams();
  const adId = searchParams.get('adId');

  const checkUser = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/auth');
      return;
    }
    setUser(user);
    setLoading(false);
  }, [router]);

  const fetchAd = useCallback(async (id: string) => {
    const { data, error } = await supabase
      .from('transaction_ads')
      .select(`
        *,
        profiles:seller_id (username, full_name),
        tokens:token_id (name, symbol, contract_address)
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching ad:', error);
    } else {
      setCurrentAd(data);
    }
  }, []);

  // Connect wallet
  const connectWallet = async () => {
    if (typeof window !== 'undefined' && (window as any).ethereum) { // eslint-disable-line @typescript-eslint/no-explicit-any
      const tempClient = createWalletClient({
        chain: mainnet,
        transport: custom((window as any).ethereum), // eslint-disable-line @typescript-eslint/no-explicit-any
      });
      const accounts = await tempClient.requestAddresses();
      const clientWithAccount = createWalletClient({
        chain: mainnet,
        transport: custom((window as any).ethereum), // eslint-disable-line @typescript-eslint/no-explicit-any
        account: accounts[0],
      });
      setWalletClient(clientWithAccount);
      setAccount(accounts[0]);
    } else {
      alert('Please install MetaMask or a Web3 wallet');
    }
  };

  // Initialize Nitrolite client
  useEffect(() => {
    if (walletClient && account) {
      const publicClient = createPublicClient({
        chain: mainnet,
        transport: http(),
      });

      const client = new NitroliteClient({
        publicClient,
        walletClient: walletClient as any, // eslint-disable-line @typescript-eslint/no-explicit-any
        stateSigner: walletClient as any, // eslint-disable-line @typescript-eslint/no-explicit-any
        chainId: mainnet.id,
        challengeDuration: BigInt(86400),
        addresses: {
          custody: '0x...', // TODO: Replace with actual Yellow custody address
          adjudicator: '0x...',
          guestAddress: '0x...',
        },
      });

      setNitroliteClient(client);
      setConnected(true);
    }
  }, [walletClient, account]);

  const createEscrowTransaction = async () => {
    if (!user || !currentAd) return;

    // Create escrow transaction in database
    const { data, error } = await supabase
      .from('escrow_transactions')
      .insert({
        ad_id: currentAd.id,
        buyer_id: user.id,
        seller_id: currentAd.seller_id,
        token_id: currentAd.token_id,
        amount: currentAd.amount,
        price_per_token: currentAd.price_per_token,
        total_price: currentAd.total_price,
        payment_method: currentAd.payment_method,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating escrow transaction:', error);
      alert('Error creating transaction');
      return;
    }

    setEscrowTransaction(data);

    // If payment method is Razorpay, create order
    if (currentAd.payment_method === 'razorpay') {
      await createRazorpayOrder(data);
    } else {
      // For crypto payments, proceed with blockchain escrow
      await createBlockchainEscrow(data);
    }
  };

  const createRazorpayOrder = async (transaction: EscrowTransaction) => {
    const orderResponse = await fetch('/api/razorpay-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: transaction.total_price,
        escrowId: transaction.id
      })
    });
    const order = await orderResponse.json();

    // Initialize Razorpay
    const options = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      amount: order.amount,
      currency: order.currency,
      order_id: order.orderId,
      name: 'Yellow P2P',
      description: `Buy ${transaction.amount} tokens`,
      handler: async (response: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
        await handlePaymentSuccess(response, transaction);
      }
    };

    const rzp = new (window as any).Razorpay(options); // eslint-disable-line @typescript-eslint/no-explicit-any
    rzp.open();
  };

  const handlePaymentSuccess = async (response: any, transaction: EscrowTransaction) => { // eslint-disable-line @typescript-eslint/no-explicit-any
    // Update transaction with payment details
    await supabase
      .from('escrow_transactions')
      .update({
        razorpay_payment_id: response.razorpay_payment_id,
        status: 'locked'
      })
      .eq('id', transaction.id);

    // Create blockchain escrow
    await createBlockchainEscrow({ ...transaction, razorpay_payment_id: response.razorpay_payment_id });
  };

  const createBlockchainEscrow = async (transaction: EscrowTransaction) => {
    if (!nitroliteClient || !account) return;

    try {
      // Create channel for escrow
      const { channelId } = await nitroliteClient.createChannel({
        initialAllocationAmounts: [BigInt(Math.floor(transaction.amount * 10**18)), BigInt(0)],
        stateData: '0x',
      } as any); // eslint-disable-line @typescript-eslint/no-explicit-any

      // Update transaction with channel ID
      await supabase
        .from('escrow_transactions')
        .update({
          channel_id: channelId,
          status: 'locked'
        })
        .eq('id', transaction.id);

      alert('Escrow created! Tokens are locked. Waiting for seller confirmation.');
    } catch (error) {
      console.error('Error creating blockchain escrow:', error);
    }
  };

  const confirmTransaction = async (userType: 'buyer' | 'seller') => {
    if (!escrowTransaction || !user) return;

    const updateData: {
      buyer_confirmed?: boolean;
      seller_confirmed?: boolean;
      status?: string;
    } = userType === 'buyer'
      ? { buyer_confirmed: true }
      : { seller_confirmed: true };

    // Check if both parties have confirmed
    const newBuyerConfirmed = userType === 'buyer' ? true : escrowTransaction.buyer_confirmed;
    const newSellerConfirmed = userType === 'seller' ? true : escrowTransaction.seller_confirmed;

    if (newBuyerConfirmed && newSellerConfirmed) {
      updateData.status = 'completed';
    }

    const { error } = await supabase
      .from('escrow_transactions')
      .update(updateData)
      .eq('id', escrowTransaction.id);

    if (error) {
      console.error('Error confirming transaction:', error);
    } else {
      // Refresh transaction data
      const { data } = await supabase
        .from('escrow_transactions')
        .select('*')
        .eq('id', escrowTransaction.id)
        .single();

      setEscrowTransaction(data);
      alert('Transaction confirmed!');
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    router.push('/auth');
  };

  useEffect(() => {
    checkUser();
    if (adId) {
      fetchAd(adId);
    }
  }, [adId, checkUser, fetchAd]);

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">Yellow P2P Escrow</h1>
          <div className="flex gap-4">
            <button
              onClick={() => router.push('/ads')}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              View Ads
            </button>
            <button
              onClick={logout}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              Logout
            </button>
          </div>
        </div>

        {!connected ? (
          <div className="text-center">
            <button
              onClick={connectWallet}
              className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600"
            >
              Connect Wallet
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-2xl font-semibold mb-4">Wallet Connected</h2>
              <p>Address: {account}</p>
            </div>

            {currentAd && !escrowTransaction && (
              <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-2xl font-semibold mb-4">Purchase Details</h2>
                <div className="space-y-2 mb-4">
                  <p><strong>Seller:</strong> {currentAd.profiles?.username}</p>
                  <p><strong>Token:</strong> {currentAd.tokens?.name} ({currentAd.tokens?.symbol})</p>
                  <p><strong>Amount:</strong> {currentAd.amount}</p>
                  <p><strong>Price per token:</strong> ₹{currentAd.price_per_token}</p>
                  <p><strong>Total:</strong> ₹{currentAd.total_price}</p>
                  <p><strong>Payment Method:</strong> {currentAd.payment_method}</p>
                </div>
                <button
                  onClick={createEscrowTransaction}
                  className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                >
                  Proceed with Purchase
                </button>
              </div>
            )}

            {escrowTransaction && (
              <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-2xl font-semibold mb-4">Escrow Transaction</h2>
                <div className="space-y-2 mb-4">
                  <p><strong>Status:</strong> {escrowTransaction.status}</p>
                  <p><strong>Amount:</strong> {escrowTransaction.amount}</p>
                  <p><strong>Total Price:</strong> ₹{escrowTransaction.total_price}</p>
                  <p><strong>Buyer Confirmed:</strong> {escrowTransaction.buyer_confirmed ? 'Yes' : 'No'}</p>
                  <p><strong>Seller Confirmed:</strong> {escrowTransaction.seller_confirmed ? 'Yes' : 'No'}</p>
                </div>

                <div className="flex gap-4">
                  {user?.id === escrowTransaction.buyer_id && !escrowTransaction.buyer_confirmed && (
                    <button
                      onClick={() => confirmTransaction('buyer')}
                      className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                    >
                      Confirm as Buyer
                    </button>
                  )}

                  {user?.id === escrowTransaction.seller_id && !escrowTransaction.seller_confirmed && (
                    <button
                      onClick={() => confirmTransaction('seller')}
                      className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                    >
                      Confirm as Seller
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
