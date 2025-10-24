"use client";
import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { Save, User, Bell, Shield, CreditCard } from "lucide-react";

export default function SettingsPage() {
  const { user } = useUser();
  const [bankAccount, setBankAccount] = useState("");
  const [ifscCode, setIfscCode] = useState("");
  const [notifications, setNotifications] = useState(true);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Profile Section */}
      <div className="p-6 rounded-xl border border-neutral-800 bg-gradient-to-br from-neutral-950 to-neutral-900">
        <div className="flex items-center gap-3 mb-6">
          <User className="w-5 h-5 text-yellow-400" />
          <h2 className="text-xl font-bold text-white">Profile Information</h2>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="text-sm text-neutral-400 mb-2 block">Full Name</label>
            <input
              type="text"
              value={user?.fullName || ""}
              disabled
              className="w-full px-4 py-3 rounded-lg bg-neutral-900 border border-neutral-800 text-white disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>
          
          <div>
            <label className="text-sm text-neutral-400 mb-2 block">Email</label>
            <input
              type="email"
              value={user?.primaryEmailAddress?.emailAddress || ""}
              disabled
              className="w-full px-4 py-3 rounded-lg bg-neutral-900 border border-neutral-800 text-white disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>
        </div>
      </div>

      {/* Bank Details Section */}
      <div className="p-6 rounded-xl border border-neutral-800 bg-gradient-to-br from-neutral-950 to-neutral-900">
        <div className="flex items-center gap-3 mb-6">
          <CreditCard className="w-5 h-5 text-yellow-400" />
          <h2 className="text-xl font-bold text-white">Bank Details</h2>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="text-sm text-neutral-400 mb-2 block">Account Number</label>
            <input
              type="text"
              value={bankAccount}
              onChange={(e) => setBankAccount(e.target.value)}
              placeholder="Enter your bank account number"
              className="w-full px-4 py-3 rounded-lg bg-neutral-900 border border-neutral-800 text-white placeholder-neutral-600 focus:outline-none focus:border-yellow-500/50 transition-colors"
            />
          </div>
          
          <div>
            <label className="text-sm text-neutral-400 mb-2 block">IFSC Code</label>
            <input
              type="text"
              value={ifscCode}
              onChange={(e) => setIfscCode(e.target.value)}
              placeholder="Enter your bank IFSC code"
              className="w-full px-4 py-3 rounded-lg bg-neutral-900 border border-neutral-800 text-white placeholder-neutral-600 focus:outline-none focus:border-yellow-500/50 transition-colors"
            />
          </div>

          <button className="flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-500 hover:to-orange-500 text-white font-medium transition-all">
            <Save className="w-4 h-4" />
            Save Bank Details
          </button>
        </div>
      </div>

      {/* Notifications Section */}
      <div className="p-6 rounded-xl border border-neutral-800 bg-gradient-to-br from-neutral-950 to-neutral-900">
        <div className="flex items-center gap-3 mb-6">
          <Bell className="w-5 h-5 text-yellow-400" />
          <h2 className="text-xl font-bold text-white">Notifications</h2>
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-white">Email Notifications</p>
            <p className="text-xs text-neutral-500 mt-1">Receive updates about your trades</p>
          </div>
          <button
            onClick={() => setNotifications(!notifications)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              notifications ? "bg-gradient-to-r from-yellow-600 to-orange-600" : "bg-neutral-700"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                notifications ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>
      </div>

      {/* Security Section */}
      <div className="p-6 rounded-xl border border-neutral-800 bg-gradient-to-br from-neutral-950 to-neutral-900">
        <div className="flex items-center gap-3 mb-6">
          <Shield className="w-5 h-5 text-yellow-400" />
          <h2 className="text-xl font-bold text-white">Security</h2>
        </div>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between py-3 border-b border-neutral-800">
            <div>
              <p className="text-sm font-medium text-white">Two-Factor Authentication</p>
              <p className="text-xs text-neutral-500 mt-1">Add an extra layer of security</p>
            </div>
            <button className="text-sm text-yellow-400 hover:text-yellow-300 transition-colors">
              Enable
            </button>
          </div>
          
          <div className="flex items-center justify-between py-3">
            <div>
              <p className="text-sm font-medium text-white">KYC Verification</p>
              <p className="text-xs text-neutral-500 mt-1">Verify your identity</p>
            </div>
            <span className="px-3 py-1 text-xs bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 rounded-full">
              Pending
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
