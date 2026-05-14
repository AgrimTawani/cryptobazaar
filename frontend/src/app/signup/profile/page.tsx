"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { createThirdwebClient } from "thirdweb";
import { ConnectButton } from "thirdweb/react";
import { inAppWallet, createWallet } from "thirdweb/wallets";

// Initialize thirdweb client
// You will need to add your actual client ID in production
const client = createThirdwebClient({
  clientId: process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID || "placeholder_client_id",
});

const wallets = [
  inAppWallet({
    auth: {
      options: ["google"],
    },
  }),
  createWallet("io.metamask"),
];

export default function ProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [isGenderOpen, setIsGenderOpen] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    username: "",
    age: "",
    gender: "",
    country: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate saving profile
    setTimeout(() => {
      setLoading(false);
      // Move to KYC step
      router.push("/signup/kyc");
    }, 1500);
  };

  return (
    <motion.div 
      className="signup-card"
      style={{ maxWidth: '600px' }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="signup-step">Step 01</div>
      <h1 className="signup-title">Create Profile</h1>
      {/* Thirdweb Wallet Connect & Google Auth */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '200px' }}>
          <ConnectButton 
            client={client} 
            wallets={[inAppWallet({ auth: { options: ["google"] } })]} 
            connectButton={{ 
              label: "Sign in with Google",
              style: { width: '100%', background: '#ffffff', color: '#000', border: '1px solid #ccc', borderRadius: '8px', padding: '14px', fontFamily: 'var(--condensed)', fontSize: '1.4rem', letterSpacing: '1px' }
            }}
          />
        </div>
        <div style={{ flex: 1, minWidth: '200px' }}>
          <ConnectButton 
            client={client} 
            wallets={[createWallet("io.metamask")]} 
            connectButton={{ 
              label: "Connect Metamask",
              style: { width: '100%', background: '#F6851B', color: '#fff', border: '1px solid #F6851B', borderRadius: '8px', padding: '14px', fontFamily: 'var(--condensed)', fontSize: '1.4rem', letterSpacing: '1px' }
            }}
          />
        </div>
      </div>

      <hr style={{ border: 'none', borderTop: '1px solid #e5e5e5', marginBottom: '24px' }} />

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px', fontFamily: 'var(--condensed)' }}>
        
        <div style={{ display: 'flex', gap: '16px' }}>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', fontSize: '1.4rem', letterSpacing: '1px', marginBottom: '4px' }}>First Name</label>
            <input required name="firstName" value={formData.firstName} onChange={handleChange} type="text" style={{ width: '100%', padding: '12px', fontSize: '1.2rem', fontFamily: 'var(--condensed)', borderRadius: '6px', border: '1px solid #ccc' }} />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', fontSize: '1.4rem', letterSpacing: '1px', marginBottom: '4px' }}>Last Name</label>
            <input required name="lastName" value={formData.lastName} onChange={handleChange} type="text" style={{ width: '100%', padding: '12px', fontSize: '1.2rem', fontFamily: 'var(--condensed)', borderRadius: '6px', border: '1px solid #ccc' }} />
          </div>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '1.4rem', letterSpacing: '1px', marginBottom: '4px' }}>Username</label>
          <input required name="username" value={formData.username} onChange={handleChange} type="text" style={{ width: '100%', padding: '12px', fontSize: '1.2rem', fontFamily: 'var(--condensed)', borderRadius: '6px', border: '1px solid #ccc' }} />
        </div>

        <div style={{ display: 'flex', gap: '16px' }}>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', fontSize: '1.4rem', letterSpacing: '1px', marginBottom: '4px' }}>Age</label>
            <input required name="age" value={formData.age} onChange={handleChange} type="number" min="18" style={{ width: '100%', padding: '12px', fontSize: '1.2rem', fontFamily: 'var(--condensed)', borderRadius: '6px', border: '1px solid #ccc' }} />
          </div>
          <div style={{ flex: 1, position: 'relative' }}>
            <label style={{ display: 'block', fontSize: '1.4rem', letterSpacing: '1px', marginBottom: '4px' }}>Gender</label>
            <div 
              onClick={() => setIsGenderOpen(!isGenderOpen)}
              style={{ 
                width: '100%', padding: '12px', fontSize: '1.2rem', fontFamily: 'var(--condensed)', 
                borderRadius: '6px', border: '1px solid #ccc', background: 'white', cursor: 'pointer',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center'
              }}
            >
              <span style={{ color: formData.gender ? 'inherit' : '#999' }}>{formData.gender || "Select..."}</span>
              <span style={{ transform: isGenderOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>▼</span>
            </div>
            
            {isGenderOpen && (
              <ul style={{ 
                position: 'absolute', top: '100%', left: 0, width: '100%', 
                background: 'white', border: '1px solid #ccc', borderRadius: '6px', 
                marginTop: '4px', padding: 0, margin: '4px 0 0 0', listStyle: 'none', 
                zIndex: 10, overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
              }}>
                {['Male', 'Female', 'Other'].map(option => (
                  <li 
                    key={option}
                    onClick={() => {
                      setFormData({ ...formData, gender: option });
                      setIsGenderOpen(false);
                    }}
                    style={{ 
                      padding: '12px', fontSize: '1.2rem', fontFamily: 'var(--condensed)', 
                      cursor: 'pointer', borderBottom: '1px solid #eee'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#f5f5f5'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
                  >
                    {option}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '1.4rem', letterSpacing: '1px', marginBottom: '4px' }}>Country of Residency</label>
          <input required name="country" value={formData.country} onChange={handleChange} type="text" style={{ width: '100%', padding: '12px', fontSize: '1.2rem', fontFamily: 'var(--condensed)', borderRadius: '6px', border: '1px solid #ccc' }} />
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="btn-kyc"
          style={{ width: '100%', marginTop: '8px' }}
        >
          {loading ? "Saving Profile..." : "Continue to Verification \u2192"}
        </button>
      </form>
    </motion.div>
  );
}
