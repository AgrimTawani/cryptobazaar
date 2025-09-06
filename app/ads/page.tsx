'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
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
  };
}

interface Token {
  id: string;
  name: string;
  symbol: string;
  contract_address: string;
}

export default function AdsPage() {
  const [ads, setAds] = useState<TransactionAd[]>([]);
  const [tokens, setTokens] = useState<Token[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  // Form state
  const [selectedToken, setSelectedToken] = useState('');
  const [amount, setAmount] = useState('');
  const [pricePerToken, setPricePerToken] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('razorpay');
  const [description, setDescription] = useState('');

  const checkUser = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/auth');
      return;
    }
    setUser(user);
  }, [router]);

  const fetchAds = useCallback(async () => {
    const { data, error } = await supabase
      .from('transaction_ads')
      .select(`
        *,
        profiles:seller_id (username, full_name),
        tokens:token_id (name, symbol)
      `)
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching ads:', error);
    } else {
      setAds(data || []);
    }
    setLoading(false);
  }, []);

  const fetchTokens = useCallback(async () => {
    const { data, error } = await supabase
      .from('tokens')
      .select('*')
      .eq('is_active', true);

    if (error) {
      console.error('Error fetching tokens:', error);
    } else {
      setTokens(data || []);
    }
  }, []);

  const createAd = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) return;

    const totalPrice = parseFloat(amount) * parseFloat(pricePerToken);

    const { error } = await supabase
      .from('transaction_ads')
      .insert({
        seller_id: user.id,
        token_id: selectedToken,
        amount: parseFloat(amount),
        price_per_token: parseFloat(pricePerToken),
        total_price: totalPrice,
        payment_method: paymentMethod,
        description,
      });

    if (error) {
      console.error('Error creating ad:', error);
      alert('Error creating ad');
    } else {
      alert('Ad created successfully!');
      setShowCreateForm(false);
      fetchAds();
      // Reset form
      setSelectedToken('');
      setAmount('');
      setPricePerToken('');
      setDescription('');
    }
  };

  const buyAd = (ad: TransactionAd) => {
    // Navigate to escrow page with ad details
    router.push(`/?adId=${ad.id}`);
  };

  useEffect(() => {
    checkUser();
    fetchAds();
    fetchTokens();
  }, [checkUser, fetchAds, fetchTokens]);

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Transaction Ads</h1>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            {showCreateForm ? 'Cancel' : 'Create Ad'}
          </button>
        </div>

        {showCreateForm && (
          <div className="bg-white p-6 rounded-lg shadow mb-8">
            <h2 className="text-xl font-semibold mb-4">Create New Ad</h2>
            <form onSubmit={createAd} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Token</label>
                  <select
                    value={selectedToken}
                    onChange={(e) => setSelectedToken(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  >
                    <option value="">Select Token</option>
                    {tokens.map((token) => (
                      <option key={token.id} value={token.id}>
                        {token.name} ({token.symbol})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Amount</label>
                  <input
                    type="number"
                    step="0.000001"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Price per Token (INR)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={pricePerToken}
                    onChange={(e) => setPricePerToken(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Payment Method</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="razorpay">Razorpay (INR)</option>
                    <option value="crypto">Crypto</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                  rows={3}
                />
              </div>

              <div className="text-right">
                <button
                  type="submit"
                  className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                >
                  Create Ad
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ads.map((ad) => (
            <div key={ad.id} className="bg-white p-6 rounded-lg shadow">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold">
                    {ad.tokens?.symbol} - {ad.amount}
                  </h3>
                  <p className="text-gray-600">by {ad.profiles?.username || 'Anonymous'}</p>
                </div>
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">
                  {ad.payment_method}
                </span>
              </div>

              <div className="space-y-2 mb-4">
                <p><strong>Price per token:</strong> ₹{ad.price_per_token}</p>
                <p><strong>Total:</strong> ₹{ad.total_price}</p>
                <p><strong>Token:</strong> {ad.tokens?.name}</p>
              </div>

              {ad.description && (
                <p className="text-gray-600 text-sm mb-4">{ad.description}</p>
              )}

              <button
                onClick={() => buyAd(ad)}
                className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
              >
                Buy Now
              </button>
            </div>
          ))}
        </div>

        {ads.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No active ads found.</p>
          </div>
        )}
      </div>
    </div>
  );
}
