export interface ArticleSection {
  id: string;
  title: string;
  content: string;
}

export interface Article {
  id: string;
  title: string;
  shortDesc: string;
  sections: ArticleSection[];
}

export interface ArticleCategory {
  id: string;
  title: string;
  articles: Article[];
}

export const ARTICLES_CATEGORIES: ArticleCategory[] = [
  {
    id: "getting-started",
    title: "1. Getting Started",
    articles: [
      {
        id: "what-is-p2p",
        title: "1.1 What Is P2P Crypto Trading?",
        shortDesc: "Learn how peer-to-peer crypto trading works, why it differs from centralized exchanges, and how CryptoBazaar connects buyers and sellers directly.",
        sections: [
          {
            id: "definition",
            title: "What Is Peer-to-Peer Trading?",
            content: "Peer-to-peer (P2P) crypto trading is a method of buying and selling digital assets directly between two individuals, without relying on a centralized exchange to hold your funds or execute your trades. Instead of depositing money into an exchange wallet and trading against an order book, P2P trading connects you with another person who wants to buy or sell at a mutually agreed price.\n\nOn CryptoBazaar, this means a buyer in India can purchase USDT directly from a seller by transferring INR through a bank transfer, UPI, or other supported payment method. The entire transaction is facilitated by the platform, but the actual exchange of value happens between the two parties."
          },
          {
            id: "how-differs",
            title: "How P2P Differs from Centralized Exchanges",
            content: "On a centralized exchange, you deposit funds into the platform's custody, and the exchange matches your orders automatically. You have limited control over pricing and must trust the platform with your assets.\n\nP2P trading gives you more control. You choose who you trade with, negotiate the price, and select your preferred payment method. CryptoBazaar acts as a facilitator by providing escrow protection, identity verification, and dispute resolution, but your funds are never pooled into a shared order book.\n\nThis model is particularly valuable in markets like India where direct fiat-to-crypto on-ramps through centralized exchanges can be limited or expensive."
          },
          {
            id: "why-popular",
            title: "Why P2P Trading Is Popular in India",
            content: "P2P trading has gained significant traction in India for several reasons. Banking restrictions and regulatory uncertainty around centralized exchanges have made direct peer-to-peer transactions a reliable alternative. Traders can use familiar payment methods like UPI, IMPS, and NEFT to complete transactions in INR.\n\nAdditionally, P2P platforms often offer more competitive rates because sellers set their own prices based on market conditions. This creates a marketplace where buyers can find better deals than what centralized exchanges typically offer.\n\nFor sellers, P2P trading provides an opportunity to earn a margin by offering liquidity to the market. The combination of flexibility, competitive pricing, and accessibility makes P2P the preferred choice for a growing number of Indian crypto users."
          },
          {
            id: "supported-assets",
            title: "What Can You Trade on CryptoBazaar?",
            content: "CryptoBazaar focuses on stablecoin trading, specifically USDT (Tether) and USDC (USD Coin). These are digital assets pegged to the US dollar, meaning their value remains stable at approximately 1 USD per token.\n\nBy focusing on stablecoins rather than volatile cryptocurrencies like Bitcoin or Ethereum, CryptoBazaar provides a predictable and low-risk trading experience. Stablecoins are widely used for cross-border payments, freelance income, remittances, and as a store of value against INR depreciation.\n\nThe platform supports multiple blockchain networks including Polygon, BNB Chain, and Tron (TRC20), giving traders flexibility in how they send and receive their assets."
          }
        ]
      },
      {
        id: "how-platform-works",
        title: "1.2 How Our P2P Platform Works",
        shortDesc: "A complete walkthrough of how CryptoBazaar facilitates secure peer-to-peer stablecoin trades between buyers and sellers in India.",
        sections: [
          {
            id: "overview",
            title: "Platform Overview",
            content: "CryptoBazaar is a peer-to-peer trading platform designed specifically for stablecoin transactions in India. The platform connects buyers who want to purchase USDT or USDC using INR with sellers who hold these assets and want to convert them to Indian Rupees.\n\nEvery trade on CryptoBazaar is protected by an escrow system, verified through KYC (Know Your Customer) checks, and supported by a dispute resolution process. This ensures that both parties in a transaction are protected throughout the trading process."
          },
          {
            id: "account-setup",
            title: "Creating an Account and KYC",
            content: "To start trading on CryptoBazaar, you need to create an account and complete identity verification. The registration process requires a valid email address and phone number. Once registered, you must complete KYC verification by submitting a government-issued ID (Aadhaar, PAN, or Passport) and a selfie for facial verification.\n\nKYC verification is mandatory for all users. This protects the community by ensuring that every trader is a verified individual, reducing the risk of fraud, identity theft, and money laundering. Most KYC verifications are processed within minutes."
          },
          {
            id: "trade-flow",
            title: "How a Trade Works",
            content: "The trading process on CryptoBazaar follows a structured flow designed to protect both parties.\n\nFirst, a seller creates a listing specifying the amount of USDT or USDC they want to sell, their asking price in INR, and their accepted payment methods. Buyers browse these listings and select one that matches their requirements.\n\nWhen a buyer initiates a trade, the seller's crypto is automatically locked in escrow. The buyer then completes the INR payment using the specified method (UPI, bank transfer, etc.) and marks the payment as complete on the platform.\n\nThe seller verifies that the payment has been received in their bank account. Once confirmed, the seller releases the crypto from escrow, and it is transferred to the buyer's wallet. The trade is now complete."
          },
          {
            id: "escrow-explained",
            title: "Escrow Protection",
            content: "Escrow is the cornerstone of safe P2P trading. When a trade is initiated, the seller's crypto assets are locked in a secure escrow managed by CryptoBazaar. Neither the buyer nor the seller can access these funds during the trade.\n\nThe crypto is only released when the seller confirms receipt of payment and manually releases the escrow. If a dispute arises, the funds remain locked until CryptoBazaar's support team reviews the case and makes a decision.\n\nThis system ensures that buyers are protected from sellers who might take payment without delivering crypto, and sellers are protected from releasing crypto before receiving confirmed payment."
          },
          {
            id: "fees",
            title: "Trading Fees",
            content: "CryptoBazaar charges a small fee on completed trades. The fee structure is transparent and displayed before you confirm any transaction. There are no hidden charges, deposit fees, or withdrawal fees imposed by the platform.\n\nNetwork fees for blockchain transactions (gas fees) are separate from platform fees and vary depending on the blockchain network you choose. Polygon typically offers the lowest network fees, while Tron and BNB Chain also provide cost-effective alternatives."
          }
        ]
      },
      {
        id: "create-first-trade",
        title: "1.3 How to Create Your First Trade",
        shortDesc: "Step-by-step instructions for setting up and completing your first peer-to-peer trade on CryptoBazaar.",
        sections: [
          {
            id: "before-you-start",
            title: "Before You Start",
            content: "Before creating your first trade, make sure you have completed the following steps. Your CryptoBazaar account must be registered and verified through KYC. You need a linked bank account or UPI ID for INR payments. If you are selling, you need USDT or USDC in a compatible wallet.\n\nTake a few minutes to familiarize yourself with the platform interface. Review the current market rates, check available listings, and understand the payment methods supported by different sellers."
          },
          {
            id: "buying-steps",
            title: "Creating a Buy Order",
            content: "To buy USDT or USDC, navigate to the marketplace and browse available sell listings. Each listing shows the seller's price per token, available quantity, accepted payment methods, and their completion rate.\n\nSelect a listing that matches your requirements and enter the amount you want to purchase (in INR or in USDT/USDC). Review the trade details including the exchange rate, platform fee, and the total amount you will pay.\n\nOnce you confirm the trade, the seller's crypto is locked in escrow. You will see the seller's payment details on screen. Complete the payment using the specified method within the time limit, then click the \"I Have Paid\" button to notify the seller.\n\nWait for the seller to verify your payment and release the crypto. Once released, the USDT or USDC will appear in your CryptoBazaar wallet."
          },
          {
            id: "selling-steps",
            title: "Creating a Sell Order",
            content: "To sell USDT or USDC, go to the \"Create Listing\" section. Specify the amount of crypto you want to sell, set your price in INR per token, and select the payment methods you accept.\n\nYou can set a fixed price or use a margin-based price that automatically adjusts based on market rates. Choose the payment methods you are comfortable with, such as UPI, IMPS, or NEFT.\n\nOnce your listing is live, buyers can initiate trades against it. When a buyer starts a trade, your crypto is locked in escrow. After the buyer marks the payment as complete, check your bank account to verify the funds have arrived. Only release the escrow after you have confirmed the payment in your bank account, not based on screenshots or messages."
          },
          {
            id: "tips",
            title: "Tips for Your First Trade",
            content: "Start with a small amount to get comfortable with the process. A trade of 500 to 1000 INR is a good starting point.\n\nAlways verify payments in your actual bank account or UPI app before releasing escrow. Never rely on screenshots sent by the other party.\n\nStay within the platform for all communication. Do not move conversations to WhatsApp, Telegram, or any other messaging service.\n\nComplete trades within the specified time limit. If you need more time, communicate with your trading partner through the platform's chat feature.\n\nIf anything seems suspicious or if the other party is pressuring you to act quickly, do not hesitate to raise a dispute. CryptoBazaar's support team is available to help."
          }
        ]
      },
      {
        id: "buy-usdt-india",
        title: "1.4 How to Buy USDT in India",
        shortDesc: "A detailed guide on purchasing USDT through CryptoBazaar using Indian Rupees via UPI, bank transfer, and other payment methods.",
        sections: [
          {
            id: "prerequisites",
            title: "What You Need Before Buying",
            content: "To buy USDT on CryptoBazaar, you need a verified account with completed KYC. You also need a funded bank account or active UPI ID linked to your registered name. The name on your payment method must match your KYC-verified identity on CryptoBazaar.\n\nIf you plan to withdraw USDT to an external wallet after purchase, ensure you have a compatible wallet address ready. CryptoBazaar supports withdrawals on Polygon, BNB Chain, and Tron networks."
          },
          {
            id: "choosing-seller",
            title: "Choosing the Right Seller",
            content: "Not all sellers are the same. When browsing listings, pay attention to several key indicators. Check the seller's completion rate, which shows what percentage of their trades are completed successfully. A rate above 95% is generally a good sign.\n\nLook at the seller's total number of completed trades. Experienced sellers with hundreds of completed trades are typically more reliable. Review the seller's response time and read any feedback left by previous buyers.\n\nCompare prices across multiple listings. While the cheapest option might be tempting, a slightly higher price from a highly-rated seller often provides a smoother and safer experience."
          },
          {
            id: "completing-payment",
            title: "Completing Your Payment",
            content: "Once you initiate a trade, you will see the seller's payment details. Transfer the exact amount specified using the payment method agreed upon. Do not round up or round down the amount, as this can cause verification issues.\n\nMake sure the payment is sent from your own bank account or UPI ID that matches your CryptoBazaar account name. Third-party payments (sending from someone else's account) are strictly prohibited and will result in the trade being cancelled.\n\nAfter completing the payment, click the \"I Have Paid\" button immediately. This notifies the seller and starts the verification process. Keep your payment receipt or transaction reference number handy in case it is needed for verification."
          },
          {
            id: "receiving-usdt",
            title: "Receiving Your USDT",
            content: "After the seller verifies your payment and releases the escrow, the USDT will be credited to your CryptoBazaar wallet. You can then choose to keep it in your platform wallet for future trades, or withdraw it to an external wallet.\n\nWhen withdrawing, select the blockchain network carefully. Polygon offers the lowest fees, while Tron (TRC20) is widely supported across exchanges and wallets. Always double-check the wallet address and network before confirming a withdrawal.\n\nThe entire buying process, from initiating a trade to receiving USDT, typically takes between 5 to 30 minutes depending on the payment method used and the seller's response time."
          }
        ]
      },
      {
        id: "sell-usdt-india",
        title: "1.5 How to Sell USDT in India",
        shortDesc: "Learn how to sell USDT for INR safely on CryptoBazaar, including listing creation, payment verification, and escrow release.",
        sections: [
          {
            id: "creating-listing",
            title: "Creating a Sell Listing",
            content: "To sell USDT on CryptoBazaar, navigate to the sell section and create a new listing. You will need to specify the amount of USDT you want to sell, your price in INR per USDT, and the payment methods you accept.\n\nSet a competitive price by checking the current market rate and existing listings. You can price your USDT at, above, or below market rate depending on how quickly you want to sell. A price slightly below market rate will attract buyers faster.\n\nChoose payment methods that you can verify quickly. UPI payments are typically the fastest to confirm, while NEFT transfers may take longer to reflect in your account."
          },
          {
            id: "verifying-payment",
            title: "Verifying Buyer Payments",
            content: "When a buyer initiates a trade against your listing, your USDT is locked in escrow. The buyer will complete their INR payment and mark it as paid on the platform.\n\nThis is the most critical step in the selling process. You must verify the payment directly in your bank account or UPI app. Log into your banking application and confirm that the exact amount has been credited. Check that the sender's name matches the buyer's name shown on CryptoBazaar.\n\nNever release escrow based on payment screenshots, SMS notifications, or messages from the buyer. These can be fabricated. The only reliable confirmation is seeing the credit in your actual bank account."
          },
          {
            id: "releasing-escrow",
            title: "Releasing Escrow Safely",
            content: "Once you have confirmed the payment in your bank account, return to CryptoBazaar and release the escrow. The USDT will be transferred to the buyer's wallet immediately.\n\nBefore releasing, verify these three things: the correct amount has been received, the payment is from the buyer's own account (name matches), and the funds are fully settled (not pending).\n\nIf any of these conditions are not met, do not release the escrow. Instead, communicate with the buyer through the platform chat. If the issue cannot be resolved, raise a dispute and CryptoBazaar's support team will investigate."
          },
          {
            id: "best-practices",
            title: "Best Practices for Sellers",
            content: "Respond to trade requests promptly. Buyers appreciate fast service, and quick response times improve your seller rating.\n\nKeep your listing updated. If you have sold all your available USDT, deactivate your listing to avoid unnecessary trade requests.\n\nFor large trades, consider breaking them into smaller transactions until you have established trust with a buyer. This reduces risk for both parties.\n\nMaintain a consistent online presence during your active trading hours. If you create a listing, be available to respond to trades within the specified time window.\n\nAlways keep records of your transactions for your own accounting and tax compliance purposes."
          }
        ]
      },
      {
        id: "understanding-escrow",
        title: "1.6 Understanding Escrow Protection",
        shortDesc: "How CryptoBazaar's escrow system works to protect both buyers and sellers during every trade.",
        sections: [
          {
            id: "what-is-escrow",
            title: "What Is Escrow?",
            content: "Escrow is a financial arrangement where a trusted third party holds assets on behalf of two transacting parties until the terms of the transaction are fulfilled. In the context of P2P crypto trading, escrow means that the seller's cryptocurrency is locked and held by CryptoBazaar during the trade.\n\nThis prevents situations where a seller could take payment without delivering crypto, or where a buyer could receive crypto without making payment. The escrow acts as a guarantee that both sides will fulfill their obligations."
          },
          {
            id: "how-it-works",
            title: "How Escrow Works on CryptoBazaar",
            content: "When a buyer initiates a trade, the seller's USDT or USDC is automatically locked in escrow. This happens instantly and the seller cannot access or move these funds while the trade is active.\n\nThe escrow holds the crypto until one of three things happens: the seller manually releases the funds after confirming payment, the trade is cancelled by mutual agreement, or CryptoBazaar's support team makes a decision following a dispute.\n\nNo single party can unilaterally access the escrowed funds. This creates a secure environment where both the buyer and seller can transact with confidence."
          },
          {
            id: "buyer-protection",
            title: "How Escrow Protects Buyers",
            content: "As a buyer, escrow ensures that the USDT you are purchasing actually exists and is reserved for your trade. When you see that the escrow is locked, you can proceed with your INR payment knowing that the crypto is set aside for you.\n\nIf the seller fails to release the escrow after you have made payment, you can raise a dispute. CryptoBazaar will review the evidence (payment confirmation, bank statements) and release the funds to you if your payment is verified."
          },
          {
            id: "seller-protection",
            title: "How Escrow Protects Sellers",
            content: "As a seller, escrow protects you by ensuring that your crypto is only released when you explicitly confirm payment receipt. You have full control over when to release the escrow.\n\nIf a buyer claims to have paid but you do not see the funds in your bank account, you are under no obligation to release. You can raise a dispute, and CryptoBazaar will investigate before any funds are moved.\n\nThe escrow system also protects you from chargebacks. Once you release the crypto, the transaction is final on the blockchain. However, if a buyer attempts a chargeback on their bank payment after receiving crypto, CryptoBazaar's dispute process and the evidence trail will support your case."
          }
        ]
      },
      {
        id: "understanding-disputes",
        title: "1.7 Understanding Trade Disputes",
        shortDesc: "What happens when a trade does not go as planned, and how CryptoBazaar's dispute resolution process works.",
        sections: [
          {
            id: "when-disputes-occur",
            title: "When Do Disputes Occur?",
            content: "Disputes can arise in several situations during a P2P trade. The most common scenarios include: the buyer claims to have paid but the seller does not see the payment, the seller is not releasing escrow despite receiving payment, there is a mismatch in the payment amount, or either party suspects fraudulent activity.\n\nDisputes are a normal part of P2P trading and do not necessarily indicate wrongdoing. Sometimes payment delays or banking issues can cause temporary confusion. CryptoBazaar's dispute process is designed to resolve these situations fairly."
          },
          {
            id: "how-to-raise",
            title: "How to Raise a Dispute",
            content: "If you encounter an issue during a trade, first try to resolve it by communicating with the other party through the platform's chat. Many issues can be resolved through simple communication.\n\nIf direct communication does not resolve the problem, click the \"Raise Dispute\" button on the trade page. You will be asked to provide details about the issue and upload supporting evidence such as payment screenshots, bank statements, or transaction reference numbers.\n\nProvide as much evidence as possible when raising a dispute. Clear, timestamped proof significantly speeds up the resolution process."
          },
          {
            id: "resolution-process",
            title: "How Disputes Are Resolved",
            content: "Once a dispute is raised, CryptoBazaar's support team reviews the case. Both parties are asked to submit evidence supporting their position. The team examines payment confirmations, bank transaction records, chat history, and any other relevant documentation.\n\nThe resolution process typically takes 24 to 48 hours, though complex cases may take longer. During this time, the escrowed funds remain locked and neither party can access them.\n\nAfter reviewing all evidence, CryptoBazaar makes a decision. The escrowed crypto is either released to the buyer (if payment is confirmed) or returned to the seller (if payment cannot be verified). Both parties are notified of the decision with a detailed explanation."
          },
          {
            id: "preventing-disputes",
            title: "How to Avoid Disputes",
            content: "Most disputes can be prevented by following a few simple practices. Always verify payments in your actual bank account before releasing escrow. Never rely on screenshots or messages as proof of payment.\n\nCommunicate clearly and promptly with your trading partner through the platform. If you need more time to complete a payment or verify a transaction, let the other party know.\n\nTrade with verified users who have good completion rates and positive feedback. Start with smaller trades when dealing with a new trading partner.\n\nKeep records of all your transactions including payment receipts, bank statements, and platform chat logs. This documentation is invaluable if a dispute ever arises."
          }
        ]
      }
    ]
  },
  {
    id: "stablecoin-basics",
    title: "2. Stablecoin Basics",
    articles: [
      {
        id: "what-is-usdt",
        title: "2.1 What Is USDT?",
        shortDesc: "Everything you need to know about Tether (USDT), the most widely traded stablecoin in the cryptocurrency market.",
        sections: [
          {
            id: "overview",
            title: "Overview of USDT",
            content: "USDT, also known as Tether, is a stablecoin pegged to the US dollar. Each USDT token is designed to maintain a value of exactly 1 US dollar. It is the largest stablecoin by market capitalization and the most widely traded cryptocurrency in the world by daily volume.\n\nTether was launched in 2014 by Tether Limited and has since become the backbone of crypto trading globally. On CryptoBazaar, USDT is one of the two primary assets available for peer-to-peer trading against Indian Rupees."
          },
          {
            id: "how-it-works",
            title: "How USDT Maintains Its Peg",
            content: "USDT maintains its 1:1 peg to the US dollar through a reserve-backed model. Tether Limited claims that every USDT in circulation is backed by an equivalent value of reserves, which include cash, cash equivalents, US Treasury bills, and other financial instruments.\n\nWhen demand for USDT increases, Tether mints new tokens and adds equivalent reserves. When USDT is redeemed, the tokens are burned and reserves are reduced. This minting and burning mechanism helps maintain the peg.\n\nIn practice, USDT occasionally trades slightly above or below 1 USD on open markets, but arbitrage traders quickly bring the price back to parity by exploiting the difference."
          },
          {
            id: "networks",
            title: "USDT on Different Networks",
            content: "USDT exists on multiple blockchain networks simultaneously. The same USDT token can be held on Ethereum, Tron, Polygon, BNB Chain, Solana, and several other networks. The value is identical regardless of the network, but transaction fees and speeds vary significantly.\n\nOn CryptoBazaar, USDT is supported on Polygon, BNB Chain, and Tron (TRC20). Polygon offers the lowest transaction fees, while Tron is the most widely used network for USDT transfers globally. BNB Chain provides a balance of low fees and broad compatibility."
          },
          {
            id: "use-cases",
            title: "Common Use Cases",
            content: "USDT serves several important functions in the cryptocurrency ecosystem. It is used as a trading pair on exchanges, allowing traders to move in and out of volatile cryptocurrencies without converting back to fiat currency.\n\nIn India, USDT is commonly used for cross-border payments by freelancers who receive international payments. It is also used as a store of value during periods of INR depreciation, for remittances to and from other countries, and as a medium of exchange in peer-to-peer transactions on platforms like CryptoBazaar."
          }
        ]
      },
      {
        id: "what-is-usdc",
        title: "2.2 What Is USDC?",
        shortDesc: "A comprehensive guide to USD Coin (USDC), the fully regulated stablecoin backed by US dollar reserves.",
        sections: [
          {
            id: "overview",
            title: "Overview of USDC",
            content: "USDC (USD Coin) is a stablecoin pegged to the US dollar, issued by Circle in partnership with Coinbase through the Centre Consortium. Like USDT, each USDC token is designed to maintain a value of 1 US dollar.\n\nUSDC was launched in 2018 and has positioned itself as the most transparent and regulated stablecoin in the market. It is the second-largest stablecoin by market capitalization and is available for trading on CryptoBazaar."
          },
          {
            id: "backing",
            title: "Backing and Reserves",
            content: "USDC distinguishes itself through its approach to reserves and transparency. Circle maintains USDC reserves in cash and short-dated US Treasury bonds held at regulated financial institutions. The reserves are audited monthly by independent accounting firms, and the attestation reports are published publicly.\n\nThis level of transparency provides users with greater confidence that every USDC token is fully backed by liquid, dollar-denominated assets. Unlike some other stablecoins, USDC reserves do not include commercial paper, corporate bonds, or other potentially illiquid instruments."
          },
          {
            id: "regulatory",
            title: "Regulatory Position",
            content: "Circle, the issuer of USDC, is a registered Money Services Business with the US Financial Crimes Enforcement Network (FinCEN). The company operates under state money transmission licenses across the United States and holds an Electronic Money Institution license in the European Union.\n\nThis regulatory framework means USDC is subject to compliance requirements including anti-money laundering (AML) and know-your-customer (KYC) regulations. For traders, this regulatory oversight provides an additional layer of legitimacy and security."
          },
          {
            id: "on-cryptobazaar",
            title: "USDC on CryptoBazaar",
            content: "CryptoBazaar supports USDC trading alongside USDT, giving traders the option to choose the stablecoin that best fits their needs. USDC is available on the same networks as USDT, including Polygon, BNB Chain, and Tron.\n\nSome traders prefer USDC for its stronger regulatory compliance and transparent reserve attestations. Others prefer it when interacting with DeFi protocols and platforms that favour USDC as their primary stablecoin."
          }
        ]
      },
      {
        id: "usdt-vs-usdc",
        title: "2.3 USDT vs USDC: Which Should You Use?",
        shortDesc: "A side-by-side comparison of USDT and USDC to help you choose the right stablecoin for your trading needs.",
        sections: [
          {
            id: "key-differences",
            title: "Key Differences",
            content: "While both USDT and USDC are US dollar-pegged stablecoins, they differ in several important ways. USDT has a larger market capitalization and higher trading volume, making it more liquid. USDC offers stronger transparency with regular public audits of its reserves.\n\nUSDT is available on more blockchain networks and is accepted by virtually every cryptocurrency exchange and platform. USDC, while slightly less ubiquitous, is growing rapidly and is preferred by institutional players and regulated platforms.\n\nIn terms of stability, both tokens maintain their peg effectively, though USDC has historically shown slightly tighter adherence to the 1 USD mark due to its fully transparent reserve structure."
          },
          {
            id: "liquidity",
            title: "Liquidity and Availability",
            content: "USDT dominates in terms of global liquidity. It accounts for the majority of all stablecoin trading volume and is the most commonly used stablecoin on peer-to-peer platforms worldwide. If you are primarily interested in easy buying and selling, USDT typically offers more listings and tighter spreads.\n\nUSDC has strong liquidity in the DeFi ecosystem and is widely used in lending, borrowing, and yield-generating protocols. If you plan to use your stablecoins beyond P2P trading, USDC's integration with DeFi platforms may be advantageous."
          },
          {
            id: "which-to-choose",
            title: "Which Should You Choose?",
            content: "For most traders on CryptoBazaar, USDT is the practical choice due to its higher liquidity, more available trading pairs, and wider acceptance across the crypto ecosystem. If you are buying or selling stablecoins for everyday use, USDT will provide the most straightforward experience.\n\nChoose USDC if transparency and regulatory compliance are your top priorities, if you plan to use your stablecoins in DeFi protocols that prefer USDC, or if you are holding large amounts and want the assurance of publicly audited reserves.\n\nBoth stablecoins are fully supported on CryptoBazaar with the same trading features, escrow protection, and dispute resolution. Your choice should be based on your specific use case rather than a fundamental quality difference."
          }
        ]
      },
      {
        id: "why-stablecoins-popular",
        title: "2.4 Why Stablecoins Are Popular",
        shortDesc: "Understanding the growing adoption of stablecoins in India and why they have become essential for cross-border transactions.",
        sections: [
          {
            id: "volatility-protection",
            title: "Protection Against Volatility",
            content: "Unlike Bitcoin, Ethereum, and other cryptocurrencies that can fluctuate by 10% or more in a single day, stablecoins maintain a consistent value tied to the US dollar. This stability makes them practical for everyday transactions and as a reliable store of value.\n\nFor Indian users, stablecoins also provide indirect exposure to the US dollar, which can serve as a hedge during periods when the Indian Rupee is depreciating against the dollar. Holding stablecoins allows you to preserve purchasing power without the complexity of opening a foreign currency account."
          },
          {
            id: "cross-border",
            title: "Cross-Border Transfers",
            content: "Traditional international wire transfers through banks can take 2 to 5 business days and charge fees of 3% to 7% of the transaction amount. Stablecoin transfers settle in minutes, regardless of the amount, and cost a fraction of traditional banking fees.\n\nThis has made stablecoins particularly popular among freelancers who receive payments from international clients, families sending remittances, and businesses making cross-border payments. A freelancer in India can receive USDT from a client in the United States and convert it to INR through CryptoBazaar within the same day."
          },
          {
            id: "freelance-merchant",
            title: "Freelance and Merchant Use",
            content: "India's freelance economy has grown significantly, with millions of professionals providing services to international clients. Stablecoins offer these freelancers a faster, cheaper, and more accessible way to receive payments compared to traditional wire transfers or payment platforms that charge high conversion fees.\n\nMerchants and small businesses that deal with international suppliers or customers also benefit from stablecoin settlements. The near-instant finality and low cost of stablecoin transactions make them an efficient alternative to traditional banking channels."
          },
          {
            id: "accessibility",
            title: "Accessibility and Inclusion",
            content: "Stablecoins are accessible to anyone with a smartphone and internet connection. There are no minimum balance requirements, no credit checks, and no need for a traditional bank account to hold or transfer stablecoins.\n\nThis accessibility is particularly valuable in regions where banking infrastructure is limited or where individuals face barriers to opening traditional financial accounts. Stablecoins democratize access to dollar-denominated assets and international payment capabilities."
          }
        ]
      },
      {
        id: "how-stablecoins-maintain-value",
        title: "2.5 How Stablecoins Maintain Their Value",
        shortDesc: "The technical and financial mechanisms that keep stablecoins like USDT and USDC pegged to the US dollar.",
        sections: [
          {
            id: "reserve-backing",
            title: "Reserve-Backed Model",
            content: "USDT and USDC use a reserve-backed model to maintain their dollar peg. For every token in circulation, the issuer holds equivalent reserves in traditional financial assets. These reserves typically include US dollar cash deposits, US Treasury bills, and other highly liquid instruments.\n\nThis means that if every holder of USDT or USDC simultaneously wanted to redeem their tokens for US dollars, the issuer should have sufficient reserves to fulfill all redemptions. The integrity of this system depends on the quality and liquidity of the reserve assets."
          },
          {
            id: "minting-burning",
            title: "Minting and Redemption",
            content: "When there is demand for new stablecoins, authorized entities can deposit US dollars with the issuer and receive newly minted tokens in return. When tokens are redeemed, they are sent back to the issuer, burned (permanently destroyed), and the equivalent US dollars are returned to the redeemer.\n\nThis create-and-destroy mechanism is what fundamentally ties the token's value to the US dollar. If USDT trades above 1 USD on the open market, arbitrageurs can mint new USDT at 1 USD and sell it at the higher price, bringing the price back down. If it trades below 1 USD, they can buy cheap tokens and redeem them for 1 USD each."
          },
          {
            id: "market-arbitrage",
            title: "Market Arbitrage",
            content: "Even without direct minting and redemption, market forces help maintain the peg. Thousands of traders around the world continuously watch stablecoin prices. When a stablecoin deviates from 1 USD, arbitrage opportunities arise.\n\nIf USDT drops to 0.99 USD, traders buy large quantities at the discount, increasing demand and pushing the price back up. If it rises to 1.01 USD, traders sell their holdings, increasing supply and bringing the price back down. This constant market activity keeps the peg tight."
          },
          {
            id: "transparency",
            title: "Transparency and Auditing",
            content: "The credibility of a stablecoin's peg depends heavily on the transparency of its reserves. USDC publishes monthly attestation reports from independent accounting firms verifying that reserves match or exceed the total supply of USDC tokens.\n\nUSDT publishes quarterly reserve reports, though these have historically received more scrutiny regarding the composition and quality of reserve assets. As a trader, understanding these transparency practices helps you make informed decisions about which stablecoin to hold."
          }
        ]
      },
      {
        id: "benefits-risks-stablecoins",
        title: "2.6 Benefits and Risks of Stablecoins",
        shortDesc: "A balanced analysis of the advantages and potential risks of using stablecoins for trading and payments.",
        sections: [
          {
            id: "benefits",
            title: "Key Benefits",
            content: "Stablecoins offer several significant advantages over both traditional currencies and volatile cryptocurrencies. Price stability makes them suitable for everyday transactions without the risk of value fluctuations. Fast settlement times, often under a minute, far exceed the speed of traditional banking transfers.\n\nLow transaction costs make stablecoins economical for transfers of any size. Sending 100 INR worth of USDT costs the same in network fees as sending 100,000 INR worth. Stablecoins operate 24/7 without banking hours or holiday restrictions. They also provide global accessibility without the need for currency conversion."
          },
          {
            id: "risks",
            title: "Potential Risks",
            content: "Despite their advantages, stablecoins carry certain risks that users should understand. Reserve risk exists if the issuer's reserves are insufficient or illiquid to cover all outstanding tokens. While this risk has decreased as transparency has improved, it remains a consideration.\n\nRegulatory risk is significant, particularly in India where the regulatory framework for crypto assets is still evolving. Changes in government policy could affect the availability or legality of stablecoin transactions.\n\nSmart contract risk exists because stablecoins are built on blockchain technology. A vulnerability in the token's smart contract could theoretically be exploited, though major stablecoins undergo extensive security audits.\n\nCounterparty risk exists because stablecoins depend on their issuing companies. If Tether Limited or Circle were to face financial difficulties, it could impact the value of their respective tokens."
          },
          {
            id: "risk-mitigation",
            title: "How to Mitigate Risks",
            content: "Several practices can help mitigate stablecoin risks. Diversify your stablecoin holdings between USDT and USDC rather than concentrating in a single token. Do not hold more in stablecoins than you can afford to lose, especially given regulatory uncertainty.\n\nConvert stablecoins to INR regularly if you are using them primarily as a transfer mechanism rather than a store of value. This limits your exposure to any single risk event.\n\nStay informed about regulatory developments in India regarding cryptocurrency and stablecoins. CryptoBazaar's platform is designed to comply with applicable regulations and will communicate any changes that affect users.\n\nUse reputable platforms like CryptoBazaar for your transactions, as they provide escrow protection and dispute resolution that reduces counterparty risk in individual trades."
          }
        ]
      }
    ]
  },
  {
    id: "networks-transfers",
    title: "3. Networks & Transfers",
    articles: [
      {
        id: "tron-vs-polygon-vs-bnb",
        title: "3.1 Tron vs Polygon vs BNB Chain",
        shortDesc: "A comparison of the three blockchain networks supported on CryptoBazaar for USDT and USDC transfers.",
        sections: [
          {
            id: "overview",
            title: "Overview of Each Network",
            content: "CryptoBazaar supports three blockchain networks for stablecoin transfers: Tron (TRC20), Polygon, and BNB Chain (BEP20). Each network has its own characteristics in terms of speed, cost, and compatibility.\n\nTron is one of the most popular networks for USDT transfers globally. It was one of the first blockchains to support large-scale USDT adoption and remains the dominant network for peer-to-peer stablecoin transactions.\n\nPolygon is a Layer 2 scaling solution built on Ethereum. It offers extremely low fees and fast confirmation times, making it ideal for cost-conscious traders.\n\nBNB Chain, developed by Binance, is a high-performance blockchain that offers a middle ground between Tron and Polygon in terms of fees and compatibility."
          },
          {
            id: "speed-fees",
            title: "Transaction Speed and Fees",
            content: "Transaction speed and fees are the primary factors that differentiate these networks for everyday use.\n\nPolygon transactions typically confirm within 2 to 5 seconds and cost less than 0.01 USD in gas fees. This makes it the most economical option for frequent or small-value transfers.\n\nTron transactions confirm within 3 to 5 seconds and cost approximately 1 to 3 USD in bandwidth or energy fees. While more expensive than Polygon, Tron fees are still significantly lower than Ethereum.\n\nBNB Chain transactions confirm within 3 to 5 seconds and cost approximately 0.10 to 0.30 USD in gas fees. It offers a good balance of low cost and wide exchange compatibility."
          },
          {
            id: "compatibility",
            title: "Wallet and Exchange Compatibility",
            content: "Tron has the widest compatibility for USDT transfers. Nearly every cryptocurrency exchange and wallet supports TRC20 USDT. If you are transferring USDT to or from another exchange, Tron is usually the safest choice in terms of compatibility.\n\nBNB Chain (BEP20) is supported by most major exchanges, particularly those in the Binance ecosystem. However, some smaller exchanges or wallets may not support BEP20 tokens.\n\nPolygon support has grown rapidly but is not yet as universal as Tron or BNB Chain. Before sending USDT on Polygon, verify that the receiving wallet or exchange supports Polygon-based tokens."
          },
          {
            id: "recommendation",
            title: "Which Network Should You Choose?",
            content: "Choose Polygon if you want the lowest possible fees and are transferring between wallets that support Polygon. It is the best option for frequent traders and small transactions.\n\nChoose Tron if you need maximum compatibility and are transferring to or from external exchanges. TRC20 is the most universally accepted network for USDT.\n\nChoose BNB Chain if you are already operating within the Binance ecosystem or need a balance of low fees and good compatibility.\n\nRegardless of which network you choose, always verify that both the sending and receiving addresses support the same network before initiating a transfer."
          }
        ]
      },
      {
        id: "send-usdt-tron",
        title: "3.2 How to Send USDT on Tron",
        shortDesc: "Step-by-step guide for sending USDT using the Tron (TRC20) network, including wallet setup and common mistakes to avoid.",
        sections: [
          {
            id: "wallet-setup",
            title: "Wallet Setup",
            content: "To send USDT on Tron, you need a wallet that supports the TRC20 token standard. Popular options include TronLink, Trust Wallet, and MetaMask (with Tron network configured). Most cryptocurrency exchanges also support TRC20 deposits and withdrawals.\n\nWhen setting up your wallet, make sure you select the Tron network specifically. A wallet address on Tron starts with the letter T and is 34 characters long. Never send TRC20 USDT to an address on a different network."
          },
          {
            id: "sending-process",
            title: "Sending USDT on TRC20",
            content: "To send USDT on Tron, open your wallet and select the USDT token on the Tron network. Enter the recipient's TRC20 wallet address and the amount you want to send.\n\nBefore confirming, double-check the wallet address character by character. Tron addresses are case-sensitive and a single incorrect character will result in your funds being sent to the wrong address or lost permanently.\n\nYou will need a small amount of TRX (Tron's native token) in your wallet to pay for transaction fees. Without sufficient TRX for bandwidth and energy, your transaction will fail. Typically, having 10 to 20 TRX in your wallet is sufficient for several transactions."
          },
          {
            id: "common-mistakes",
            title: "Common Mistakes to Avoid",
            content: "The most frequent mistake is sending USDT to an address on the wrong network. For example, sending TRC20 USDT to an Ethereum address will result in permanent loss of funds.\n\nAnother common error is not having enough TRX for transaction fees. If your wallet contains only USDT and no TRX, you will not be able to initiate the transfer.\n\nAvoid copying wallet addresses from unverified sources. Always copy addresses directly from the receiving wallet or platform. Some malware can replace copied wallet addresses with the attacker's address.\n\nDo not send test transactions of very small amounts on Tron, as the minimum fee structure means the fee could be disproportionate to the amount sent."
          },
          {
            id: "verification",
            title: "Transfer Verification",
            content: "After sending USDT on Tron, you can verify the transaction on Tronscan, the official Tron blockchain explorer. Enter the transaction hash (TXID) provided by your wallet to view the transaction status, confirmation count, and recipient details.\n\nMost TRC20 USDT transfers confirm within one to two minutes. If your transaction is not confirmed after 5 minutes, check the transaction status on Tronscan. A pending transaction usually indicates network congestion or insufficient fees.\n\nOnce confirmed, notify the recipient that the transfer is complete. On CryptoBazaar, the platform automatically detects incoming transfers on supported networks."
          }
        ]
      },
      {
        id: "send-usdt-polygon",
        title: "3.3 How to Send USDT on Polygon",
        shortDesc: "How to transfer USDT using the Polygon network with minimal fees and fast confirmation times.",
        sections: [
          {
            id: "supported-wallets",
            title: "Supported Wallets",
            content: "Polygon is supported by most modern cryptocurrency wallets. MetaMask is the most popular choice and supports Polygon natively. Trust Wallet, Coinbase Wallet, and Rabby also support the Polygon network.\n\nTo use Polygon in MetaMask, you may need to add the Polygon network manually. The network details are: Network Name is Polygon Mainnet, RPC URL is https://polygon-rpc.com, Chain ID is 137, Currency Symbol is MATIC, and Block Explorer is https://polygonscan.com.\n\nMake sure your wallet is connected to the Polygon network before initiating any transfers."
          },
          {
            id: "gas-fees",
            title: "Gas Fees on Polygon",
            content: "Polygon uses POL (formerly MATIC) as its native token for gas fees. The gas fees on Polygon are extremely low, typically costing less than 0.01 USD per transaction. This makes Polygon the most economical network for USDT transfers on CryptoBazaar.\n\nYou need a small amount of POL in your wallet to pay for gas. Even 0.1 POL is usually sufficient for multiple transactions. You can acquire POL from exchanges or use bridge services to transfer MATIC from Ethereum to Polygon."
          },
          {
            id: "transfer-process",
            title: "Sending USDT on Polygon",
            content: "To send USDT on Polygon, ensure your wallet is connected to the Polygon Mainnet. Select USDT from your token list and enter the recipient's Polygon wallet address. Polygon addresses look identical to Ethereum addresses, starting with 0x followed by 40 hexadecimal characters.\n\nEnter the amount and review the gas fee estimate. Confirm the transaction and wait for it to be processed. Polygon transactions typically confirm within a few seconds.\n\nAfter sending, you can track the transaction on Polygonscan using the transaction hash. The recipient should see the USDT in their wallet almost immediately after confirmation."
          },
          {
            id: "security-tips",
            title: "Security Tips",
            content: "Always verify that you are connected to the correct network (Polygon Mainnet, Chain ID 137) before sending tokens. Connecting to a test network or a different chain will result in failed or lost transactions.\n\nBe cautious of fake tokens on Polygon. Only interact with the official USDT contract address on Polygon. CryptoBazaar uses verified contract addresses to ensure you are sending and receiving genuine USDT.\n\nKeep your wallet software updated to the latest version to benefit from security patches and improvements. Never share your wallet seed phrase or private keys with anyone."
          }
        ]
      },
      {
        id: "send-usdt-bnb",
        title: "3.4 How to Send USDT on BNB Chain",
        shortDesc: "A complete guide to transferring USDT on BNB Chain (BEP20) including setup, fees, and best practices.",
        sections: [
          {
            id: "overview",
            title: "BNB Chain Overview",
            content: "BNB Chain (formerly Binance Smart Chain) is a blockchain developed by Binance. It uses the BEP20 token standard, which is compatible with Ethereum's ERC20 standard. This means wallets and tools designed for Ethereum can often be used with BNB Chain with minimal configuration.\n\nBNB Chain is widely supported by exchanges and wallets, particularly those in the Binance ecosystem. It offers fast transaction speeds and moderate fees, making it a popular choice for USDT transfers."
          },
          {
            id: "setup",
            title: "Wallet Setup for BNB Chain",
            content: "Most wallets that support Ethereum also support BNB Chain. In MetaMask, add the BNB Chain network with these details: Network Name is BNB Smart Chain, RPC URL is https://bsc-dataseed.binance.org, Chain ID is 56, Currency Symbol is BNB, and Block Explorer is https://bscscan.com.\n\nTrust Wallet supports BNB Chain natively. Select the BNB Smart Chain network when adding USDT to your wallet. Ensure you are using the BEP20 version of USDT, not the BEP2 version."
          },
          {
            id: "sending",
            title: "Sending USDT on BEP20",
            content: "To send USDT on BNB Chain, connect your wallet to the BNB Smart Chain network. Select USDT (BEP20) from your token list and enter the recipient's address. BNB Chain addresses use the same format as Ethereum addresses (0x prefix).\n\nYou need BNB in your wallet to pay for gas fees. A typical USDT transfer on BNB Chain costs approximately 0.10 to 0.30 USD worth of BNB. Having 0.005 BNB is usually sufficient for several transactions.\n\nConfirm the transaction and wait for processing. BNB Chain transactions typically confirm within 3 to 5 seconds. Verify the transaction on BscScan using the transaction hash."
          },
          {
            id: "best-practices",
            title: "Best Practices",
            content: "Before sending large amounts, verify the recipient's address by sending a small test transaction first. This is especially important when transferring to a new address for the first time.\n\nAlways confirm that the receiving platform or wallet supports BEP20 tokens. While BNB Chain support is widespread, some platforms only accept USDT on specific networks.\n\nKeep a small reserve of BNB in your wallet at all times to ensure you can always pay for gas fees when needed. Running out of BNB means you cannot send any tokens until you acquire more."
          }
        ]
      },
      {
        id: "choose-right-network",
        title: "3.5 Choosing the Right Network",
        shortDesc: "How to select the best blockchain network for your USDT transfer based on cost, speed, and compatibility.",
        sections: [
          {
            id: "factors",
            title: "Key Factors to Consider",
            content: "When choosing a network for your USDT transfer, three factors matter most: cost, speed, and compatibility. Cost refers to the gas or network fees you will pay. Speed determines how quickly your transfer will be confirmed. Compatibility ensures that both the sending and receiving platforms support the same network.\n\nFor trades on CryptoBazaar, all three supported networks (Polygon, Tron, BNB Chain) offer fast confirmation times. The primary differentiators are cost and compatibility with your external wallets or exchanges."
          },
          {
            id: "use-cases",
            title: "Best Network for Each Use Case",
            content: "For frequent small trades on CryptoBazaar, Polygon is the best choice due to its near-zero gas fees. If you trade multiple times per day, the fee savings add up significantly over time.\n\nFor transferring USDT to or from external exchanges, Tron (TRC20) is usually the safest option because it has the widest exchange support. Most exchanges charge lower withdrawal fees for TRC20 compared to other networks.\n\nFor users already in the Binance ecosystem, BNB Chain provides seamless integration with Binance and related platforms.\n\nFor large-value transfers where the fee is negligible relative to the amount, any network will work. In this case, choose the network that provides the best compatibility with your other wallets and platforms."
          },
          {
            id: "verification-checklist",
            title: "Pre-Transfer Checklist",
            content: "Before every transfer, verify the following: the sending wallet is connected to the correct network, the receiving address supports the network you are using, you have sufficient native tokens (POL, TRX, or BNB) for gas fees, and the recipient address is correct.\n\nWhen in doubt, start with a small test transaction before sending the full amount. The cost of a test transaction is far less than the potential loss from sending to the wrong network or address.\n\nCryptoBazaar displays the network clearly during the deposit and withdrawal process. Always match the network shown on the platform with the network selected in your wallet."
          }
        ]
      },
      {
        id: "avoiding-wrong-network",
        title: "3.6 Avoiding Wrong-Network Transfers",
        shortDesc: "How to prevent the costly mistake of sending USDT to an incompatible network, and what to do if it happens.",
        sections: [
          {
            id: "understanding",
            title: "Understanding Network Compatibility",
            content: "Each blockchain network operates independently, even though wallet addresses may look similar. A Polygon address and a BNB Chain address can be identical in format (both start with 0x), but they exist on completely different blockchains.\n\nSending USDT on the wrong network is one of the most common and costly mistakes in cryptocurrency. If you send USDT on Polygon to an address that only supports BNB Chain, the tokens may be inaccessible or permanently lost.\n\nTron addresses are visually distinct (starting with T), which makes it easier to distinguish them from Polygon and BNB Chain addresses. However, Polygon and BNB Chain addresses look identical, making it crucial to verify the network before sending."
          },
          {
            id: "common-mistakes",
            title: "Common Mistakes",
            content: "The most frequent mistake is selecting the wrong network in your wallet while the address is correct. For example, entering a valid address but having your wallet set to Polygon when the recipient expects BNB Chain.\n\nAnother common error is copying the wrong deposit address from an exchange. Many exchanges display different deposit addresses or the same address for different networks. Always ensure you copy the address for the specific network you intend to use.\n\nSome users confuse network names. ERC20 refers to Ethereum (not Polygon), TRC20 refers to Tron, BEP20 refers to BNB Chain, and Polygon is sometimes listed as MATIC. Understanding these naming conventions prevents confusion."
          },
          {
            id: "recovery",
            title: "Recovery Possibilities",
            content: "Recovery depends on where the tokens were sent. If you sent tokens to your own wallet on the wrong network, recovery is usually possible. You can add the correct network to your wallet and access the tokens using the same private key or seed phrase.\n\nIf you sent tokens to an exchange on the wrong network, contact the exchange's support team. Many major exchanges can recover cross-chain deposits, though they may charge a recovery fee and the process can take days or weeks.\n\nIf you sent tokens to another person's wallet on the wrong network, you will need their cooperation to recover the funds. They would need to access the same address on the network where the tokens were actually sent.\n\nIn some cases, particularly with smaller exchanges or unsupported networks, recovery may not be possible and the funds may be permanently lost."
          },
          {
            id: "prevention",
            title: "Prevention Checklist",
            content: "Follow this checklist before every transfer to avoid wrong-network mistakes. First, confirm the network on the receiving end. What network does the recipient expect? Second, verify your wallet is set to the same network. Check the network selector in your wallet app.\n\nThird, compare the first and last four characters of the address after pasting. This catches clipboard-replacement malware. Fourth, for first-time transfers to a new address, send a small test amount before the full transfer.\n\nFifth, read any warnings displayed by your wallet or the platform. CryptoBazaar shows network confirmation prompts specifically to prevent wrong-network transfers. Never rush through these confirmation screens."
          }
        ]
      },
      {
        id: "understanding-network-fees",
        title: "3.7 Understanding Network Fees",
        shortDesc: "How blockchain network fees work, what they cost on each network, and how to minimize your transaction costs.",
        sections: [
          {
            id: "what-are-fees",
            title: "What Are Network Fees?",
            content: "Network fees, also called gas fees, are payments made to blockchain validators for processing and confirming your transactions. Every transaction on a blockchain requires computational resources, and fees compensate the network participants who provide those resources.\n\nNetwork fees are separate from CryptoBazaar's trading fees. When you withdraw USDT from the platform or deposit from an external wallet, you pay the network fee to the blockchain, not to CryptoBazaar."
          },
          {
            id: "fee-comparison",
            title: "Fee Comparison Across Networks",
            content: "Polygon has the lowest fees among CryptoBazaar's supported networks. A typical USDT transfer costs less than 0.01 USD, making it ideal for frequent transactions and small amounts.\n\nBNB Chain fees are moderate, typically ranging from 0.10 to 0.30 USD per transaction. This is affordable for most use cases and offers a good balance of cost and compatibility.\n\nTron fees are slightly higher, usually between 1 and 3 USD per transaction, depending on network congestion and whether you have staked TRX for bandwidth and energy. However, Tron remains significantly cheaper than Ethereum.\n\nFor context, the same USDT transfer on Ethereum would cost 5 to 50 USD depending on network congestion, which is why CryptoBazaar does not currently support Ethereum for USDT transfers."
          },
          {
            id: "reducing-fees",
            title: "How to Minimize Fees",
            content: "Choose Polygon for the lowest fees on CryptoBazaar. If you make multiple trades per day, the fee savings compared to Tron can be substantial over a month.\n\nBatch your transactions when possible. Instead of making five small withdrawals, consolidate them into one larger withdrawal to pay the network fee only once.\n\nOn Tron, staking TRX for bandwidth and energy can reduce or eliminate transaction fees. If you frequently use the Tron network, staking is worth considering.\n\nAvoid transacting during peak network congestion times when gas fees spike. While this is less of a concern on Polygon and BNB Chain, Tron fees can fluctuate during high-demand periods."
          },
          {
            id: "fee-tokens",
            title: "Gas Token Requirements",
            content: "Each network requires its own native token to pay for gas fees. You cannot pay Polygon gas fees with BNB, or Tron fees with POL. Make sure you always have a small balance of the correct gas token in your wallet.\n\nFor Polygon, keep a small amount of POL (formerly MATIC) in your wallet. Even 0.5 POL is sufficient for dozens of transactions.\n\nFor BNB Chain, maintain at least 0.005 BNB in your wallet. This covers several transactions.\n\nFor Tron, keep 10 to 20 TRX available for transaction fees, or stake TRX for bandwidth and energy to reduce ongoing costs.\n\nIf you run out of gas tokens, you will not be able to send any transactions on that network until you acquire more."
          }
        ]
      }
    ]
  },
  {
    id: "security-scam-prevention",
    title: "4. Security & Scam Prevention",
    articles: [
      {
        id: "common-p2p-scams",
        title: "4.1 Common P2P Crypto Scams in India",
        shortDesc: "An overview of the most prevalent scams targeting P2P crypto traders in India and how to recognize them.",
        sections: [
          {
            id: "fake-payment",
            title: "Fake Payment Screenshot Scam",
            content: "The fake payment screenshot scam is one of the most common threats in P2P trading. A buyer initiates a trade, then sends a fabricated screenshot of a payment confirmation without actually making the payment. The goal is to pressure the seller into releasing escrow based on the screenshot alone.\n\nThese screenshots can be convincingly realistic, mimicking the exact interface of banking apps and UPI platforms. Some scammers even use image editing tools to alter real transaction screenshots with different amounts or dates.\n\nThe defence is simple: never release escrow based on screenshots. Always verify payments directly in your bank account or UPI app. If the money is not reflected in your actual account, the payment has not been made."
          },
          {
            id: "utr-manipulation",
            title: "UTR Manipulation Scam",
            content: "In this scam, a buyer provides a fake or recycled UTR (Unique Transaction Reference) number as proof of payment. They may use a UTR from a previous legitimate transaction or simply fabricate one.\n\nScammers rely on the fact that some sellers check UTR numbers superficially without cross-referencing them with their actual bank statements. A matching UTR format can create a false sense of security.\n\nTo protect yourself, never rely on UTR numbers alone. Check your bank account for the actual credit. If a buyer provides a UTR but the funds have not arrived in your account, do not release escrow. Raise a dispute if the buyer insists the payment was made."
          },
          {
            id: "third-party",
            title: "Third-Party Payment Scam",
            content: "In a third-party payment scam, the buyer arranges for someone else to send the payment. The payment arrives in the seller's account, but from a name that does not match the buyer's KYC-verified identity on CryptoBazaar.\n\nThis is dangerous because the actual account holder (the third party) may later file a fraud complaint with their bank, claiming unauthorized transactions. This can result in the seller's bank account being frozen or the payment being reversed, even after the crypto has been released.\n\nCryptoBazaar prohibits third-party payments. If you receive a payment from a name that does not match the buyer shown on the platform, do not release escrow. Raise a dispute immediately."
          },
          {
            id: "chargeback",
            title: "Chargeback Scams",
            content: "A chargeback scam occurs when a buyer makes a legitimate payment, receives the crypto, and then contacts their bank to reverse the payment. The buyer claims the transaction was unauthorized or fraudulent, and the bank reverses the funds from the seller's account.\n\nThis is particularly risky with certain payment methods that allow easy reversals. UPI transactions are generally final, but bank transfers through NEFT or RTGS can sometimes be disputed.\n\nTo minimize chargeback risk, prefer UPI payments which are harder to reverse. Keep all records of the trade including chat logs, payment confirmations, and the trade details from CryptoBazaar. If a chargeback is attempted, these records serve as evidence that the transaction was legitimate."
          },
          {
            id: "impersonation",
            title: "Identity Impersonation and Social Engineering",
            content: "Some scammers create accounts impersonating well-known traders or CryptoBazaar staff. They may contact you through WhatsApp, Telegram, or other messaging platforms claiming to be from CryptoBazaar's support team.\n\nThese imposters may ask you to release escrow early, share your account credentials, or send crypto to a specific address outside the platform. They often create urgency by claiming your account will be suspended or your funds will be lost if you do not comply immediately.\n\nCryptoBazaar will never ask you to release escrow outside the normal trade process. Official support communication happens only through the platform. Never share your account credentials, and never move trade communications off the platform."
          },
          {
            id: "staying-protected",
            title: "How to Stay Protected",
            content: "Follow these practices to protect yourself from P2P scams. Always verify payments in your actual bank account before releasing escrow. Never trust screenshots, messages, or external communications as proof of payment.\n\nTrade only with KYC-verified users on the platform. Check their trade history, completion rate, and feedback before initiating a trade. Be wary of new accounts with no trading history offering unusually attractive rates.\n\nKeep all communication within the CryptoBazaar platform. Any request to move communication to WhatsApp, Telegram, or email is a red flag.\n\nDo not rush. Legitimate traders understand that payment verification takes time. Anyone pressuring you to release escrow immediately is likely attempting a scam.\n\nReport suspicious activity to CryptoBazaar immediately. Early reporting helps protect not just you but the entire trading community."
          }
        ]
      },
      {
        id: "fake-payment-screenshot",
        title: "4.2 Fake Payment Screenshot Scams",
        shortDesc: "A deep dive into how fake payment screenshot scams work and exactly how to identify and avoid them.",
        sections: [
          {
            id: "how-it-works",
            title: "How This Scam Works",
            content: "The scammer initiates a buy trade on the platform, which locks the seller's crypto in escrow. Instead of making the actual payment, the scammer creates a fake screenshot that resembles a successful UPI or bank transfer confirmation.\n\nThe scammer then sends this screenshot through the platform chat and marks the payment as completed. They may add urgency by saying they need the USDT quickly for an important transaction or that the payment might take a few minutes to reflect.\n\nThe goal is to convince the seller to release escrow based on the visual proof before verifying the actual bank credit. Once the seller releases escrow, the crypto is transferred to the scammer's wallet irreversibly."
          },
          {
            id: "how-to-identify",
            title: "How to Identify Fake Screenshots",
            content: "While fake screenshots can be sophisticated, there are often telltale signs. Look for inconsistencies in font sizes, alignment, or spacing compared to genuine payment confirmations. Differences in colour gradients or image quality can also indicate manipulation.\n\nCheck whether the date, time, and transaction amount on the screenshot match the trade details. Scammers sometimes reuse old screenshots or screenshots from different transactions.\n\nHowever, do not rely on visual analysis alone. Even a perfect-looking screenshot means nothing if the money has not arrived in your bank account. The only reliable verification is checking your actual bank balance."
          },
          {
            id: "protection",
            title: "How to Protect Yourself",
            content: "The protection against fake payment screenshots is straightforward: always check your bank account directly. Open your banking app or log into your net banking portal and verify that the payment has been credited.\n\nWait for the payment to fully settle before releasing escrow. Some payment methods show pending transactions that may not actually complete. Only release escrow when the funds are fully available in your account.\n\nIf the buyer sends a screenshot but the payment is not in your account after a reasonable time (10 to 15 minutes for UPI, longer for bank transfers), communicate through the platform chat. If the situation is not resolved, raise a dispute.\n\nNever let urgency or social pressure override your verification process. A legitimate buyer will understand the need to verify payments."
          }
        ]
      },
      {
        id: "third-party-payment-risks",
        title: "4.3 Third-Party Payment Risks",
        shortDesc: "Why receiving payments from accounts that do not match the buyer's identity puts your funds and bank account at risk.",
        sections: [
          {
            id: "what-are-they",
            title: "What Are Third-Party Payments?",
            content: "A third-party payment occurs when the INR payment for a trade comes from a bank account or UPI ID that belongs to someone other than the buyer on CryptoBazaar. For example, a buyer named Rahul initiates a trade, but the payment arrives from an account in the name of Priya.\n\nThis may seem harmless, but it creates serious risks for the seller. The actual account holder (Priya) may not have authorized the payment, or the buyer may be using stolen credentials or a compromised account to send funds."
          },
          {
            id: "why-risky",
            title: "Why Scammers Use Third-Party Payments",
            content: "Scammers use third-party payments for several reasons. They may have access to compromised bank accounts and use those to make payments. When the actual account holder discovers the unauthorized transaction, they file a complaint with the bank.\n\nThe bank investigation leads back to the seller's account, which received the funds. The seller's bank account can be frozen for investigation, and the payment can be reversed. Meanwhile, the scammer has already received the crypto and moved it to an untraceable wallet.\n\nThird-party payments also help scammers distance themselves from the money trail. If the funds are traced, they lead to the third party's account rather than the scammer's."
          },
          {
            id: "platform-policy",
            title: "CryptoBazaar's Policy on Third-Party Payments",
            content: "CryptoBazaar strictly prohibits third-party payments. All payments must come from accounts that match the buyer's KYC-verified identity on the platform. This policy exists to protect both buyers and sellers.\n\nIf you receive a payment from an account that does not match the buyer's name, do not release escrow. Report the discrepancy through the platform and raise a dispute. CryptoBazaar's support team will investigate and take appropriate action.\n\nBuyers who repeatedly attempt third-party payments may have their accounts suspended or permanently banned from the platform."
          },
          {
            id: "safer-alternatives",
            title: "Safer Alternatives",
            content: "If a buyer cannot make a payment from their own verified account, they should not proceed with the trade. There is no legitimate reason for a third party to send payment on behalf of a buyer in a P2P crypto transaction.\n\nBuyers should ensure their CryptoBazaar account name matches the name on their bank account and UPI ID before initiating trades. If there is a name mismatch due to a legitimate reason (such as a name change), the buyer should update their KYC details before trading.\n\nSellers should verify every payment by checking the sender's name in their bank statement against the buyer's name shown on CryptoBazaar. This simple step can prevent most third-party payment-related problems."
          }
        ]
      },
      {
        id: "chargeback-reversal-scams",
        title: "4.4 Chargeback and Reversal Scams",
        shortDesc: "How payment reversals and chargebacks are exploited in P2P trading and how to protect yourself.",
        sections: [
          {
            id: "how-chargebacks-work",
            title: "How Chargebacks Work",
            content: "A chargeback is when a buyer contacts their bank after making a payment and requests that the transaction be reversed. The buyer typically claims that the transaction was unauthorized, that they did not receive the product or service, or that the amount was incorrect.\n\nIn the context of P2P crypto trading, a scammer makes a genuine payment to the seller, receives the crypto from escrow, and then files a chargeback with their bank. If the bank reverses the payment, the seller loses both the crypto and the INR."
          },
          {
            id: "vulnerable-methods",
            title: "Which Payment Methods Are Most Vulnerable?",
            content: "UPI transactions are generally the safest because they are designed to be instant and final. Reversals on UPI are rare and require significant evidence of fraud.\n\nBank transfers through NEFT and RTGS are slightly more susceptible to disputes, though reversals are still uncommon for completed transactions. However, if the payment was made from a compromised account, the bank may freeze or reverse the transaction during investigation.\n\nCredit card payments (where supported) are the most vulnerable to chargebacks, which is why most P2P platforms do not accept them.\n\nOn CryptoBazaar, UPI is the recommended payment method due to its finality and speed."
          },
          {
            id: "prevention",
            title: "How to Prevent Chargeback Losses",
            content: "Verify the sender's name matches the buyer's identity on CryptoBazaar. Third-party payments are the primary vector for chargeback scams because the account holder can legitimately claim the transaction was unauthorized.\n\nKeep records of every trade. Save the CryptoBazaar trade details, chat logs, payment confirmations, and bank statements. These records are essential evidence if a chargeback is initiated.\n\nPrefer UPI for payments as they provide the strongest finality. If a buyer insists on a specific payment method that allows easy reversals, consider declining the trade.\n\nTrade with established users who have a strong track record. New accounts attempting large trades should be treated with caution."
          }
        ]
      },
      {
        id: "fake-support-scams",
        title: "4.5 Fake Customer Support Scams",
        shortDesc: "How scammers impersonate CryptoBazaar support staff and how to verify genuine support communications.",
        sections: [
          {
            id: "how-they-operate",
            title: "How Fake Support Scams Work",
            content: "Scammers create social media accounts, Telegram channels, or WhatsApp numbers that mimic CryptoBazaar's official branding. They use the platform's logo, colour scheme, and similar usernames to appear legitimate.\n\nThese fake support agents may contact you proactively, claiming there is an issue with your account, a pending trade, or a security concern. They may also respond to support queries you post on public forums or social media.\n\nThe scammer's goal is typically to obtain your account credentials, convince you to send crypto to a specific address, or manipulate you into releasing escrow in an ongoing trade."
          },
          {
            id: "red-flags",
            title: "How to Identify Fake Support",
            content: "CryptoBazaar support will never contact you through WhatsApp, Telegram, Instagram direct messages, or any channel outside the platform. All official support communication happens through the CryptoBazaar platform or official email addresses.\n\nCryptoBazaar support will never ask for your password, seed phrase, private keys, or OTP codes. If someone claiming to be support asks for any of these, they are a scammer.\n\nBe suspicious of unsolicited contact. Legitimate support teams respond to your requests; they rarely initiate contact without a prior support ticket or inquiry from you.\n\nCheck for grammatical errors, unusual urgency, or requests that do not match normal support procedures. Scammers often create artificial urgency to prevent you from thinking critically."
          },
          {
            id: "what-to-do",
            title: "What to Do If You Encounter Fake Support",
            content: "Do not share any personal information, account credentials, or cryptocurrency. End the conversation immediately.\n\nReport the fake account to CryptoBazaar through the platform's official support channel. Include screenshots of the conversation and any details about the scammer's account (username, phone number, profile link).\n\nIf you have already shared account credentials with a suspected scammer, change your password immediately and enable two-factor authentication. Contact CryptoBazaar's legitimate support team to secure your account.\n\nReport the fake account to the platform where you encountered it (Telegram, WhatsApp, Instagram) so it can be taken down and prevent others from being targeted."
          }
        ]
      },
      {
        id: "10-red-flags",
        title: "4.6 10 Red Flags Before Releasing Crypto",
        shortDesc: "Warning signs every seller should check before releasing crypto from escrow to avoid losing funds.",
        sections: [
          {
            id: "payment-issues",
            title: "Payment-Related Red Flags",
            content: "The first red flag is that the payment is not reflecting in your bank account. If the buyer claims to have paid but you do not see the credit, do not release. Wait and verify.\n\nThe second red flag is a mismatched sender name. If the payment comes from someone other than the buyer shown on CryptoBazaar, this indicates a third-party payment and should not be accepted.\n\nThe third red flag is receiving split payments. If the buyer sends the amount in multiple smaller transactions instead of one payment, this could indicate the use of multiple compromised accounts.\n\nThe fourth red flag is suspicious payment references. If the payment note or reference contains unusual text like crypto-related keywords, this could trigger banking scrutiny on your account."
          },
          {
            id: "behaviour-issues",
            title: "Behavioural Red Flags",
            content: "The fifth red flag is requests to communicate outside the platform. If the buyer asks you to move the conversation to WhatsApp, Telegram, or any other service, decline. Platform communication provides an evidence trail.\n\nThe sixth red flag is urgent pressure tactics. Phrases like \"release now, I need it urgently\" or \"I will lose money if you do not release immediately\" are manipulation techniques. Take your time to verify.\n\nThe seventh red flag is the buyer claiming the payment will arrive later but asking you to release now based on a screenshot or promise. Never release escrow for a payment that has not been received.\n\nThe eighth red flag is unusual trading patterns, such as a new account with no history attempting a large trade."
          },
          {
            id: "account-issues",
            title: "Account and Technical Red Flags",
            content: "The ninth red flag is a new account with no verified trades attempting large transactions. While everyone starts with zero trades, exercise additional caution with unestablished accounts.\n\nThe tenth red flag is the buyer providing conflicting information. If the payment details they share do not match what you see in your bank account (different amount, different time, different reference), something is wrong.\n\nWhen in doubt, do not release. Raising a dispute is always safer than releasing crypto based on uncertain information. CryptoBazaar's dispute process is designed to protect both parties, and legitimate buyers will not be penalized for disputes caused by verification delays."
          }
        ]
      },
      {
        id: "security-checklist",
        title: "4.7 Security Checklist for Every Trade",
        shortDesc: "A step-by-step security checklist to follow before, during, and after every P2P trade.",
        sections: [
          {
            id: "before-trade",
            title: "Before Starting a Trade",
            content: "Check the trading partner's profile. Review their completion rate, number of trades, and feedback from other users. A completion rate below 90% warrants caution.\n\nVerify that your own account has two-factor authentication enabled. This protects your account from unauthorized access.\n\nConfirm that you are on the official CryptoBazaar platform and not a phishing site. Check the URL in your browser's address bar before logging in or initiating trades.\n\nEnsure your bank account or UPI app is accessible. You will need it to verify incoming payments (as a seller) or make outgoing payments (as a buyer)."
          },
          {
            id: "during-trade",
            title: "During an Active Trade",
            content: "Keep all communication within the CryptoBazaar platform. Do not share personal contact information or move to external messaging apps.\n\nAs a buyer, make the payment from your own KYC-verified account only. Send the exact amount specified in the trade.\n\nAs a seller, verify payments directly in your bank account. Do not rely on screenshots, SMS notifications, or verbal confirmations. Check that the sender's name matches the buyer's identity on the platform.\n\nDo not share your wallet seed phrase, private keys, or account password with anyone during a trade. No legitimate reason exists for your trading partner to need this information."
          },
          {
            id: "after-trade",
            title: "After Completing a Trade",
            content: "Leave honest feedback for your trading partner. This helps build a trustworthy trading community.\n\nKeep records of the trade for your personal reference, including payment confirmations and trade details. These records are valuable for dispute resolution and tax documentation.\n\nIf you notice anything suspicious about the trade after completion, report it to CryptoBazaar support. Even if the trade is complete, reporting helps identify patterns and protect other users.\n\nRegularly review your account security settings. Update your password periodically and verify that your two-factor authentication is functioning correctly."
          }
        ]
      },
      {
        id: "protect-account",
        title: "4.8 How to Protect Your Account",
        shortDesc: "Essential security measures to keep your CryptoBazaar account safe from unauthorized access and fraud.",
        sections: [
          {
            id: "strong-credentials",
            title: "Strong Passwords and 2FA",
            content: "Use a strong, unique password for your CryptoBazaar account. Your password should be at least 12 characters long and include a mix of uppercase letters, lowercase letters, numbers, and special characters. Do not reuse passwords from other websites or services.\n\nEnable two-factor authentication (2FA) on your account. This adds a second layer of security by requiring a code from your authenticator app in addition to your password when logging in. Even if your password is compromised, 2FA prevents unauthorized access.\n\nUse an authenticator app like Google Authenticator or Authy rather than SMS-based 2FA when available. SMS can be intercepted through SIM swap attacks."
          },
          {
            id: "phishing-prevention",
            title: "Avoiding Phishing Attacks",
            content: "Phishing attacks attempt to trick you into entering your credentials on a fake website that looks like CryptoBazaar. Always verify the URL in your browser before entering any login information.\n\nDo not click on links sent through email, SMS, or messaging apps that claim to be from CryptoBazaar. Instead, navigate directly to the platform by typing the URL in your browser.\n\nBe suspicious of emails claiming that your account has been suspended or that urgent action is required. These are common phishing tactics designed to create panic and bypass your critical thinking.\n\nIf you receive a suspicious email or message, report it to CryptoBazaar support rather than interacting with it."
          },
          {
            id: "device-security",
            title: "Device and Network Security",
            content: "Keep your devices updated with the latest operating system and security patches. Vulnerabilities in outdated software can be exploited to access your accounts.\n\nAvoid accessing CryptoBazaar or your banking apps on public Wi-Fi networks. If you must use public Wi-Fi, use a VPN to encrypt your connection.\n\nInstall reputable antivirus software and keep it updated. Some malware can log your keystrokes, replace wallet addresses in your clipboard, or access your browser's saved passwords.\n\nLock your phone and computer with strong PINs or biometric authentication. If your device is lost or stolen, this prevents immediate access to your accounts."
          },
          {
            id: "monitoring",
            title: "Regular Account Monitoring",
            content: "Review your trade history and account activity regularly. If you notice any trades or login attempts that you did not authorize, change your password immediately and contact CryptoBazaar support.\n\nSet up login notifications if available. These alert you whenever your account is accessed from a new device or location.\n\nPeriodically review the devices and sessions connected to your account. Revoke access for any devices or sessions you do not recognize.\n\nIf you suspect your account has been compromised, contact CryptoBazaar support immediately. Quick response can prevent unauthorized trades and protect your funds."
          }
        ]
      }
    ]
  },
  {
    id: "trading-best-practices",
    title: "5. Trading Best Practices",
    articles: [
      {
        id: "choose-reliable-traders",
        title: "5.1 How to Choose Reliable Traders",
        shortDesc: "Key indicators to evaluate before trading with someone on CryptoBazaar to ensure a safe experience.",
        sections: [
          {
            id: "profile-indicators",
            title: "Profile Indicators to Check",
            content: "Before initiating a trade with any user on CryptoBazaar, review their trading profile carefully. The completion rate is the most important metric. It shows what percentage of initiated trades the user has successfully completed. A completion rate above 95% indicates a reliable trader.\n\nThe total number of completed trades provides context for the completion rate. A 100% completion rate with 5 trades is less meaningful than a 97% rate with 500 trades. Look for traders with a substantial trading history.\n\nThe average response time indicates how quickly a trader typically responds during active trades. Fast responders make the trading process smoother and reduce the time your funds are in transit."
          },
          {
            id: "feedback",
            title: "Reading Feedback and Reviews",
            content: "CryptoBazaar allows traders to leave feedback after completed trades. Read through recent feedback to understand other users' experiences. Look for consistent patterns rather than isolated comments.\n\nPositive feedback about quick responses, accurate payments, and smooth releases is a strong indicator of reliability. Negative feedback about delayed responses, disputed trades, or communication issues should be taken seriously.\n\nBe cautious of traders with no feedback or very recent account creation dates. While new traders are not inherently risky, they lack the track record that provides confidence in a transaction."
          },
          {
            id: "pricing",
            title: "Understanding Pricing",
            content: "Compare a trader's prices against the current market rate. Prices slightly above or below market rate are normal and reflect the trader's margin or urgency to complete trades.\n\nBe cautious of prices that are significantly better than the market rate. An unusually cheap listing could indicate a scammer trying to attract victims with attractive pricing. If a deal seems too good to be true, it probably is.\n\nEstablished traders with competitive but reasonable pricing are generally the safest choice, even if their prices are not the absolute cheapest available."
          }
        ]
      },
      {
        id: "understanding-trade-ratings",
        title: "5.2 Understanding Trade Ratings",
        shortDesc: "How the trader rating system works on CryptoBazaar and what the numbers mean for your trading decisions.",
        sections: [
          {
            id: "how-ratings-work",
            title: "How Ratings Work",
            content: "CryptoBazaar uses a rating system based on completed trades to help users identify trustworthy trading partners. After each successful trade, both the buyer and seller can rate their experience.\n\nRatings are aggregated to produce a trader's overall score. This score reflects the consistency and quality of their trading behaviour over time. A high rating with many completed trades indicates a consistently reliable trader."
          },
          {
            id: "what-affects-ratings",
            title: "What Affects Your Rating",
            content: "Several factors influence your trading rating. Completing trades promptly and without disputes positively impacts your score. Responding quickly during active trades and communicating clearly through the platform chat also contribute to positive ratings.\n\nCancelling trades frequently, particularly after the other party has already taken action, negatively affects your rating. Having disputes raised against you, especially those resolved in the other party's favour, can significantly lower your score.\n\nNon-completion of trades, failing to make payment as a buyer, or failing to release escrow as a seller despite confirmed payment all harm your rating."
          },
          {
            id: "improving-rating",
            title: "Building a Strong Trading Reputation",
            content: "Start with small trades to build your initial reputation. Complete them promptly and professionally. As your rating and trade count grow, you can move to larger transactions.\n\nBe responsive during active trades. Quick communication reduces anxiety for your trading partner and leads to positive feedback.\n\nIf an issue arises during a trade, communicate openly through the platform. Many potential disputes can be avoided through clear, honest communication.\n\nConsistency is key. Even one problematic trade can significantly impact a rating built on a small number of trades. Maintain the same level of diligence for every transaction."
          }
        ]
      },
      {
        id: "best-practices-buyers",
        title: "5.3 Best Practices for Buyers",
        shortDesc: "Essential habits and practices for buyers to ensure safe and efficient USDT purchases on CryptoBazaar.",
        sections: [
          {
            id: "before-buying",
            title: "Before Initiating a Purchase",
            content: "Verify that your payment method is ready and funded before starting a trade. Having insufficient funds or an inactive UPI ID during a trade wastes both your time and the seller's time.\n\nCompare listings from multiple sellers before choosing. Consider not just the price but also the seller's rating, completion rate, and accepted payment methods.\n\nEnsure your bank account or UPI ID name matches your CryptoBazaar account name. Mismatched names can cause trade cancellations and payment disputes."
          },
          {
            id: "during-trade",
            title: "During the Trade",
            content: "Make the payment promptly after initiating the trade. The seller's USDT is locked in escrow during this time, and delays can cause frustration and potential cancellations.\n\nSend the exact amount specified in the trade details. Do not round up or round down. Even a difference of one rupee can cause verification confusion.\n\nAfter making the payment, click the confirmation button immediately. Do not wait for the seller to ask about the payment status.\n\nKeep your payment receipt accessible. If the seller questions the payment, you may need to provide the transaction reference number or UTR."
          },
          {
            id: "after-buying",
            title: "After Receiving USDT",
            content: "Verify that the correct amount of USDT has been credited to your CryptoBazaar wallet. If the amount does not match, contact support immediately.\n\nIf you plan to withdraw the USDT to an external wallet, double-check the wallet address and network before initiating the withdrawal.\n\nLeave honest feedback for the seller. Your feedback helps other buyers make informed decisions and rewards sellers who provide good service."
          }
        ]
      },
      {
        id: "best-practices-sellers",
        title: "5.4 Best Practices for Sellers",
        shortDesc: "How to sell USDT effectively and safely on CryptoBazaar while building a strong seller reputation.",
        sections: [
          {
            id: "listing-management",
            title: "Managing Your Listings",
            content: "Keep your listings accurate and up to date. If you have sold all available USDT, deactivate your listing rather than letting it remain active. Inactive listings that still receive trade requests create a poor experience for buyers.\n\nSet competitive but sustainable prices. Research the current market rate and existing listings before setting your price. A price that is too high will not attract buyers, while a price that is too low may not be worth your time.\n\nSpecify payment methods you can verify quickly. If you do not check NEFT payments frequently, do not include NEFT as an accepted method."
          },
          {
            id: "payment-verification",
            title: "Payment Verification Process",
            content: "Develop a consistent verification process for every trade. When a buyer marks payment as completed, immediately open your banking app and check for the credit.\n\nVerify three things before releasing escrow: the correct amount has been received, the sender's name matches the buyer's name on CryptoBazaar, and the payment is fully settled (not pending).\n\nDo not release escrow based on screenshots, SMS notifications, or any form of proof other than seeing the actual credit in your bank account. This single habit prevents the majority of P2P trading scams."
          },
          {
            id: "scaling",
            title: "Scaling Your Trading Volume",
            content: "As you build experience and a positive reputation, you can gradually increase your trading volume. Start with smaller listings and increase the amounts as you become comfortable with the process.\n\nMaintain adequate USDT liquidity to fulfill your active listings. Having insufficient balance when a buyer initiates a trade leads to cancellations and hurts your completion rate.\n\nConsider your availability when setting listing amounts. If you cannot respond to trades within a reasonable time, reduce your listing amounts or deactivate listings during periods when you are unavailable."
          }
        ]
      },
      {
        id: "trade-large-volumes-safely",
        title: "5.5 How to Trade Large Volumes Safely",
        shortDesc: "Risk management strategies and best practices for traders handling large amounts of USDT.",
        sections: [
          {
            id: "preparation",
            title: "Preparing for Large Trades",
            content: "Large trades require additional preparation and caution. Before engaging in high-value transactions, ensure you have a strong trading history on the platform and that your trading partner does as well.\n\nVerify that your bank account can handle the transaction amount without triggering alerts or holds. Some banks flag large transactions for manual review, which can cause delays.\n\nConsider breaking very large trades into multiple smaller transactions. This reduces the risk exposure for each individual trade and makes payment verification simpler."
          },
          {
            id: "risk-management",
            title: "Risk Mitigation Strategies",
            content: "Never trade more than you can afford to lose in a single transaction. Even with escrow protection and dispute resolution, there is always some residual risk in any financial transaction.\n\nTrade with established, highly-rated users for large amounts. The additional cost of a slightly less competitive rate from a trusted trader is worth the reduced risk on a large transaction.\n\nUse UPI for large INR payments when possible, as it provides faster confirmation and stronger finality than bank transfers. For amounts exceeding UPI limits, IMPS is the next best option.\n\nKeep detailed records of all large transactions including screenshots of the trade, payment confirmations, and any communication with the trading partner."
          },
          {
            id: "record-keeping",
            title: "Documentation and Record Keeping",
            content: "Maintain a personal log of all significant trades including the date, amount, counterparty, exchange rate, and any notes about the transaction. This documentation is important for personal accounting, tax reporting, and potential dispute resolution.\n\nSave payment confirmations from your bank for at least 6 months. In the unlikely event that a chargeback or dispute is filed months after a trade, these records serve as your primary evidence.\n\nConsider using a spreadsheet or accounting tool to track your trading activity. This helps you monitor your performance, identify patterns, and maintain accurate records for tax purposes."
          }
        ]
      },
      {
        id: "managing-trading-risks",
        title: "5.6 Managing Trading Risks",
        shortDesc: "A comprehensive guide to understanding and managing the various risks involved in P2P cryptocurrency trading.",
        sections: [
          {
            id: "types-of-risk",
            title: "Types of Trading Risks",
            content: "P2P trading involves several types of risk that traders should understand. Counterparty risk is the possibility that the other party in a trade does not fulfill their obligations. CryptoBazaar's escrow system significantly mitigates this risk but does not eliminate it entirely.\n\nPayment risk includes the possibility of payment failures, delays, or reversals. Using reliable payment methods and verifying payments carefully reduces this risk.\n\nMarket risk exists because the INR/USD exchange rate can fluctuate during the time it takes to complete a trade. For most trades completed within minutes, this risk is minimal, but for delayed trades it can be significant."
          },
          {
            id: "mitigation",
            title: "How to Manage Risks",
            content: "Diversify your trading activity. Do not put all your capital into a single trade or trade exclusively with one partner. Spreading your trades across multiple partners and amounts reduces the impact of any single problem.\n\nSet personal trading limits based on your risk tolerance. Decide the maximum amount you are willing to trade in a single transaction and stick to it.\n\nStay informed about common scams and new fraud techniques. The threat landscape evolves, and awareness is your first line of defence.\n\nUse all available platform features including escrow, dispute resolution, and feedback systems. These exist to protect you and are most effective when used consistently."
          },
          {
            id: "when-not-to-trade",
            title: "Knowing When Not to Trade",
            content: "Sometimes the best trading decision is not to trade. If something about a potential trade feels wrong, trust your instincts and decline.\n\nDo not trade when you are distracted, rushed, or unable to properly verify payments. Trading requires your full attention, particularly during the payment verification stage.\n\nAvoid trading during banking system outages or maintenance windows when payment verification may be delayed or impossible.\n\nIf you encounter a trading partner who exhibits suspicious behaviour, even if they have a decent profile, do not proceed. Report the behaviour to CryptoBazaar and find a different trading partner."
          }
        ]
      },
      {
        id: "common-mistakes-new-traders",
        title: "5.7 Common Mistakes New Traders Make",
        shortDesc: "The most frequent errors made by new P2P traders and how to avoid them from the start.",
        sections: [
          {
            id: "verification-mistakes",
            title: "Payment Verification Mistakes",
            content: "The most costly mistake new traders make is releasing escrow without properly verifying payment. New sellers may trust payment screenshots or get pressured by buyers to release quickly. Always verify payments directly in your bank account, regardless of what the buyer sends or says.\n\nAnother common error is accepting payments from mismatched names. New traders may not realize the significance of name matching and accept third-party payments, exposing themselves to chargeback risks."
          },
          {
            id: "trading-mistakes",
            title: "Trading Behaviour Mistakes",
            content: "Starting with trades that are too large is a frequent mistake. New traders eager to maximize their first transactions take on amounts they are not comfortable managing. Start small, learn the process, and scale up gradually.\n\nMoving communication off the platform is another critical error. When a trading partner asks to continue the conversation on WhatsApp or Telegram, new traders may comply, losing the protection of CryptoBazaar's communication records.\n\nIgnoring feedback and ratings when choosing a trading partner is common among new users. Taking a few seconds to review a trader's profile can prevent many problems."
          },
          {
            id: "security-mistakes",
            title: "Security Mistakes",
            content: "Using weak passwords or reusing passwords from other services is a fundamental security mistake. Your CryptoBazaar account holds financial value and should be protected with a strong, unique password and two-factor authentication.\n\nSharing account credentials or personal information with other traders is never appropriate. No legitimate trade requires you to share your password, seed phrase, or banking login details.\n\nFailing to keep records is a mistake that becomes apparent only when a problem arises. From your first trade, save transaction details and payment confirmations. This documentation is essential for dispute resolution and personal accounting."
          }
        ]
      }
    ]
  },
  {
    id: "payments-banking",
    title: "6. Payments & Banking",
    articles: [
      {
        id: "supported-payment-methods",
        title: "6.1 Supported Payment Methods",
        shortDesc: "All payment methods available on CryptoBazaar for INR transactions and when to use each one.",
        sections: [
          {
            id: "upi",
            title: "UPI (Unified Payments Interface)",
            content: "UPI is the most popular and recommended payment method on CryptoBazaar. It enables instant bank-to-bank transfers using a UPI ID or by scanning a QR code. Transactions settle within seconds and are generally irreversible, making UPI the safest option for P2P trading.\n\nUPI supports transaction limits that vary by bank, typically ranging from 1 lakh to 2 lakh INR per transaction. For amounts within these limits, UPI provides the fastest and most convenient trading experience.\n\nPopular UPI apps include Google Pay, PhonePe, Paytm, and direct bank UPI apps. Any UPI-enabled bank account can be used for CryptoBazaar trades."
          },
          {
            id: "imps",
            title: "IMPS (Immediate Payment Service)",
            content: "IMPS allows instant fund transfers up to 5 lakh INR per transaction. Unlike NEFT, IMPS is available 24/7 including holidays. Transfers typically reflect within minutes.\n\nIMPS is a good choice for amounts that exceed UPI transaction limits but still require instant settlement. You will need the recipient's bank account number and IFSC code to initiate an IMPS transfer.\n\nAs with all payment methods, ensure the transfer is made from your own verified bank account. Third-party IMPS transfers are not accepted on CryptoBazaar."
          },
          {
            id: "neft-rtgs",
            title: "NEFT and RTGS",
            content: "NEFT (National Electronic Funds Transfer) processes transactions in batches throughout the day. While NEFT is now available 24/7, there can be slight delays in processing depending on your bank and the time of transaction.\n\nRTGS (Real Time Gross Settlement) is designed for large-value transactions, typically 2 lakh INR and above. RTGS settles in real-time during banking hours.\n\nBoth NEFT and RTGS are reliable but slower than UPI or IMPS. If you choose these methods, communicate the expected settlement time to your trading partner to avoid unnecessary disputes."
          },
          {
            id: "choosing-method",
            title: "Choosing the Right Payment Method",
            content: "For trades up to 1 lakh INR, UPI is the best choice. It provides instant confirmation, is easy to verify, and offers strong finality.\n\nFor trades between 1 lakh and 5 lakh INR, consider IMPS for instant settlement or UPI if your bank supports higher limits.\n\nFor trades above 5 lakh INR, RTGS provides real-time settlement during banking hours. NEFT is an alternative for any amount but may have processing delays.\n\nRegardless of the payment method, always verify the payment in your bank account before releasing escrow. The method only affects speed and limits, not the fundamental verification process."
          }
        ]
      },
      {
        id: "upi-safety",
        title: "6.2 UPI Safety for P2P Trading",
        shortDesc: "How to use UPI safely for P2P crypto trades and protect yourself from UPI-related fraud.",
        sections: [
          {
            id: "upi-basics",
            title: "UPI Safety Fundamentals",
            content: "UPI is designed to be a safe payment method, but users must follow best practices to avoid falling victim to fraud. Never share your UPI PIN with anyone. Your UPI PIN is equivalent to your bank password and should never be disclosed under any circumstances.\n\nBe aware that receiving money through UPI does not require you to enter your PIN or approve a transaction. If someone asks you to enter your PIN or scan a QR code to receive money, it is a scam. Entering your PIN or scanning a QR code authorizes a payment, not a receipt."
          },
          {
            id: "verification",
            title: "Verifying UPI Payments",
            content: "When you receive a UPI payment, verify it by checking your bank account balance or transaction history in your banking app. Do not rely on UPI payment notification screenshots from the sender.\n\nCross-reference the payment amount, sender's name, and transaction time with the trade details on CryptoBazaar. All three should match before you release escrow.\n\nIf a payment appears as pending in your UPI app, wait for it to fully settle before taking any action. Pending UPI transactions can fail or be reversed."
          },
          {
            id: "common-upi-scams",
            title: "Common UPI Scams to Avoid",
            content: "The collect request scam involves a buyer sending you a UPI collect request instead of a direct payment. If you approve the collect request, money is debited from your account rather than credited to it. Never approve unsolicited collect requests.\n\nThe fake UPI screenshot scam involves sending manipulated images of UPI payment confirmations. Always verify in your actual bank app.\n\nThe QR code scam involves asking you to scan a QR code to receive payment. Scanning and entering your PIN on a QR code initiates a payment from your account. Never scan QR codes to receive payments."
          }
        ]
      },
      {
        id: "bank-transfer-best-practices",
        title: "6.3 Bank Transfer Best Practices",
        shortDesc: "How to make and receive bank transfers safely for P2P trading with practical verification tips.",
        sections: [
          {
            id: "making-transfers",
            title: "Making Bank Transfers",
            content: "When making a bank transfer as a buyer, double-check the recipient's account number and IFSC code before confirming. A single digit error can send funds to the wrong account, making recovery difficult.\n\nAlways transfer from your own verified bank account. The name on the bank account must match your CryptoBazaar KYC name. Transfers from joint accounts may be acceptable if your name appears on the account.\n\nInclude appropriate payment references as requested by the seller or the platform. Avoid including crypto-related terms in the payment reference as this may trigger banking compliance reviews."
          },
          {
            id: "receiving-transfers",
            title: "Receiving and Verifying Bank Transfers",
            content: "When receiving a bank transfer as a seller, wait for the funds to fully settle in your account before releasing escrow. IMPS transfers typically settle within minutes, while NEFT may take up to 2 hours during non-peak times.\n\nVerify the sender's name against the buyer's CryptoBazaar profile. If the names do not match, do not release escrow regardless of the amount received.\n\nCheck your bank statement or transaction history for the exact amount. Ensure it matches the trade amount exactly. If the buyer sent a different amount, communicate through the platform before taking action."
          },
          {
            id: "troubleshooting",
            title: "Troubleshooting Transfer Issues",
            content: "If a bank transfer is delayed, check with your bank for the transaction status. NEFT and RTGS may experience delays during maintenance windows or high-volume periods.\n\nIf you sent funds to the wrong account, contact your bank immediately. Most banks have processes for recalling misdirected transfers, though recovery is not guaranteed.\n\nFor failed transactions where the amount was debited but not credited, contact your bank's customer service. In most cases, failed IMPS and NEFT transactions are automatically reversed within 24 to 48 hours."
          }
        ]
      },
      {
        id: "understanding-payment-verification",
        title: "6.4 Understanding Payment Verification",
        shortDesc: "Why payment verification is the most critical step in P2P trading and how to do it properly.",
        sections: [
          {
            id: "why-it-matters",
            title: "Why Verification Is Critical",
            content: "Payment verification is the single most important step in the P2P trading process. The majority of successful scams on P2P platforms exploit failures in payment verification. A seller who consistently verifies payments properly is virtually immune to common P2P scams.\n\nVerification means confirming that the correct amount of money has been credited to your actual bank account from the correct sender. No other form of evidence, including screenshots, SMS notifications, or verbal assurances, constitutes proper verification."
          },
          {
            id: "how-to-verify",
            title: "How to Verify Properly",
            content: "Open your banking application or log into your net banking portal. Check your account balance and recent transaction history. Look for a credit matching the exact trade amount.\n\nVerify the sender's name in the transaction details. It must match the buyer's name as displayed on CryptoBazaar. If the name does not match, the payment may be from a third party.\n\nConfirm that the transaction status is complete, not pending. Pending transactions can be cancelled or fail. Only a fully settled transaction should be considered verified.\n\nFor UPI payments, verification is typically instant. For IMPS, check within 5 to 10 minutes. For NEFT, allow up to 2 hours during business days."
          },
          {
            id: "what-not-to-trust",
            title: "What Not to Trust",
            content: "Do not trust payment screenshots sent by the buyer. These are easily fabricated using photo editing tools or mock payment apps.\n\nDo not trust SMS notifications that appear to come from your bank. SMS messages can be spoofed to appear as if they come from your bank's short code.\n\nDo not trust the buyer's verbal or written assurances that the payment has been made. The only verification that matters is the credit in your actual bank account.\n\nDo not trust UTR numbers provided by the buyer as standalone proof. While UTR numbers are useful reference points, they must be cross-referenced with your actual bank statement."
          }
        ]
      },
      {
        id: "delayed-payment",
        title: "6.5 What to Do If a Payment Is Delayed",
        shortDesc: "Steps to take when a payment does not arrive as expected during an active P2P trade.",
        sections: [
          {
            id: "common-causes",
            title: "Common Causes of Delays",
            content: "Payment delays can occur for several legitimate reasons. Bank maintenance windows, particularly on weekends and holidays, can slow down NEFT and RTGS transactions. High transaction volumes during end-of-month salary periods can cause temporary delays.\n\nUPI transactions can occasionally fail silently, where the amount is debited from the sender but not credited to the receiver. These typically auto-reverse within 24 hours.\n\nSome banks have daily processing cut-off times after which NEFT transactions are queued for the next batch. Check your bank's specific processing schedule."
          },
          {
            id: "what-to-do",
            title: "Steps to Take",
            content: "If a payment has not arrived within the expected timeframe, communicate with your trading partner through the CryptoBazaar platform. Ask them to verify that the payment was successfully debited from their account and to share the transaction reference number.\n\nCheck with your bank if there are any holds or delays on incoming transfers. Sometimes banks hold large incoming transfers for manual review.\n\nIf the delay extends beyond a reasonable period (30 minutes for UPI, 2 hours for IMPS, half a day for NEFT), raise a dispute on the platform. CryptoBazaar's support team can help investigate and mediate.\n\nDo not release escrow based on promises that the payment will arrive later. Only release after the funds are confirmed in your account."
          }
        ]
      },
      {
        id: "why-name-matching-matters",
        title: "6.6 Why Name Matching Matters",
        shortDesc: "The importance of verifying that payment sender names match buyer identities and what to do when they do not.",
        sections: [
          {
            id: "importance",
            title: "Why Name Matching Is Essential",
            content: "Name matching is a fundamental security measure in P2P trading. When a payment arrives from a name that matches the buyer's KYC-verified identity on CryptoBazaar, it provides strong assurance that the payment is legitimate and authorized.\n\nA mismatched name indicates a third-party payment, which is the most common vector for fraud and chargeback scams on P2P platforms. The actual account holder may not have authorized the transaction and can file a fraud complaint with their bank."
          },
          {
            id: "how-to-check",
            title: "How to Check Name Matching",
            content: "When you receive a payment, check the sender's name in your bank transaction details. Compare it exactly with the buyer's name displayed on the CryptoBazaar trade page.\n\nMinor variations may occur due to how different banks display names. For example, middle names may be abbreviated, or initials may be used differently. Use your judgment for minor formatting differences, but the core name must match.\n\nIf the name is completely different (a different person altogether), do not release escrow under any circumstances. This is a clear third-party payment."
          },
          {
            id: "what-to-do",
            title: "When Names Do Not Match",
            content: "If the payment sender's name does not match the buyer's name, inform the buyer through the platform chat and explain that you cannot release escrow for third-party payments.\n\nIf the buyer has a legitimate explanation (such as a recently changed name), ask them to update their KYC on the platform first and then reinitiate the trade.\n\nIf the buyer insists on proceeding despite the name mismatch, raise a dispute. CryptoBazaar's support team will review the situation and make a determination.\n\nNever accept a name mismatch based on verbal explanations alone. The platform's rules exist to protect you, and following them consistently is your best defence against fraud."
          }
        ]
      }
    ]
  },
  {
    id: "compliance-verification",
    title: "7. Compliance & Verification",
    articles: [
      {
        id: "why-kyc-important",
        title: "7.1 Why KYC Is Important",
        shortDesc: "Understanding why identity verification is essential for safe P2P trading and how it protects the community.",
        sections: [
          {
            id: "what-is-kyc",
            title: "What Is KYC?",
            content: "KYC stands for Know Your Customer. It is a standard verification process used by financial institutions and trading platforms to confirm the identity of their users. On CryptoBazaar, KYC involves submitting identity documents and completing biometric verification to prove you are who you claim to be.\n\nKYC is not unique to cryptocurrency platforms. Banks, investment platforms, insurance companies, and other financial services all require KYC verification. It is a fundamental component of the global financial system's approach to preventing fraud and financial crime."
          },
          {
            id: "why-required",
            title: "Why CryptoBazaar Requires KYC",
            content: "KYC verification serves multiple critical purposes on CryptoBazaar. It prevents fraudsters from creating multiple accounts to scam users. It ensures that payment names match verified identities, making third-party payment scams detectable. It provides accountability, as every user on the platform has a verified identity tied to their account.\n\nKYC also enables CryptoBazaar to comply with applicable regulations. As the regulatory landscape for cryptocurrency evolves in India, having a verified user base allows the platform to adapt to new requirements.\n\nFor traders, KYC provides peace of mind. When you trade with a KYC-verified user, you know their identity has been independently confirmed, reducing the risk of fraud."
          },
          {
            id: "user-protection",
            title: "How KYC Protects You",
            content: "KYC verification protects you in several ways. If a dispute arises, CryptoBazaar can identify both parties and investigate the issue effectively. Without verified identities, dispute resolution would be nearly impossible.\n\nKYC also deters bad actors. When potential scammers know that their real identity is linked to their account, they are significantly less likely to attempt fraud. The risk of being identified and reported to authorities acts as a powerful deterrent.\n\nIf you are the victim of a scam, KYC verification means the platform has verified information about the other party that can be shared with law enforcement if necessary."
          }
        ]
      },
      {
        id: "how-identity-verification-works",
        title: "7.2 How Identity Verification Works",
        shortDesc: "A step-by-step explanation of CryptoBazaar's identity verification process and what documents are accepted.",
        sections: [
          {
            id: "process",
            title: "The Verification Process",
            content: "CryptoBazaar's identity verification process is designed to be thorough but straightforward. The process involves three main steps: document submission, biometric verification, and review.\n\nDuring document submission, you upload a clear photo or scan of a government-issued identity document. Accepted documents include Aadhaar card, PAN card, passport, and voter ID. The document must be current and clearly legible.\n\nBiometric verification involves taking a live selfie that is compared against the photo on your identity document. This step confirms that you are the person shown on the document and not someone using stolen or fabricated documents."
          },
          {
            id: "requirements",
            title: "Document Requirements",
            content: "Your identity document must meet certain quality requirements. The document should be clearly photographed with all four corners visible. Text and photos must be legible without blurring or glare.\n\nThe name on your identity document must match the name you registered with on CryptoBazaar. This is important because your verified name is also matched against payment sender names during trades.\n\nEnsure your document is valid and not expired. Expired documents are not accepted for verification purposes. If your document is approaching expiration, consider renewing it before starting the verification process."
          },
          {
            id: "timeline",
            title: "Verification Timeline",
            content: "Most verification requests are processed within a few hours during business days. However, complex cases or high verification volumes may extend the timeline.\n\nIf your verification is rejected, you will receive a notification explaining the reason. Common rejection reasons include blurry document photos, expired documents, or mismatched information. You can resubmit with corrected documents.\n\nOnce verified, your KYC status is permanent unless you need to update your information due to a name change or document expiration."
          }
        ]
      },
      {
        id: "anti-fraud-measures",
        title: "7.3 Anti-Fraud Measures Explained",
        shortDesc: "The systems and processes CryptoBazaar uses to detect and prevent fraudulent activity on the platform.",
        sections: [
          {
            id: "automated-detection",
            title: "Automated Fraud Detection",
            content: "CryptoBazaar employs automated systems that monitor trading activity for patterns associated with fraud. These systems analyse factors such as trading frequency, amounts, counterparty patterns, and account behaviour to identify potential risks.\n\nSuspicious patterns trigger alerts for manual review by the security team. This might include sudden changes in trading volume, trades with multiple newly created accounts, or patterns consistent with known scam techniques.\n\nThe automated system operates in real-time, providing immediate protection without disrupting legitimate trading activity."
          },
          {
            id: "escrow-protection",
            title: "Escrow as a Fraud Prevention Tool",
            content: "The escrow system is CryptoBazaar's primary fraud prevention mechanism. By holding crypto in escrow during a trade, neither party can lose both the crypto and the payment simultaneously.\n\nEscrow ensures that the seller's crypto is locked until payment is confirmed, and the buyer's payment is verified before crypto is released. This eliminates the possibility of either party absconding with both assets.\n\nThe escrow system is automated and trustless. Neither CryptoBazaar staff nor any third party can release escrow without the proper conditions being met."
          },
          {
            id: "community-reporting",
            title: "Community-Based Protection",
            content: "CryptoBazaar's user community plays an important role in fraud prevention. The feedback and rating system allows traders to share their experiences, helping others identify trustworthy partners.\n\nUser reports of suspicious activity are investigated promptly. When multiple users report similar issues with an account, the security team takes immediate action including account suspension and investigation.\n\nBlocked and banned accounts are permanently removed from the platform. Information about confirmed fraud cases may be shared with law enforcement to support prosecution of financial crimes."
          }
        ]
      },
      {
        id: "why-monitor-suspicious",
        title: "7.4 Why We Monitor Suspicious Activity",
        shortDesc: "How and why CryptoBazaar monitors platform activity to maintain a safe trading environment.",
        sections: [
          {
            id: "what-we-monitor",
            title: "What Is Monitored",
            content: "CryptoBazaar monitors several aspects of platform activity to maintain a safe trading environment. This includes unusual trading patterns such as rapid-fire trades, consistently abandoned trades, or trades that are always disputed.\n\nAccount behaviour patterns are also monitored, including login locations, device changes, and profile modifications. These help detect compromised accounts and unauthorized access.\n\nPayment-related patterns are tracked as well, such as frequent use of different payment methods, consistent third-party payment attempts, or payments that are regularly reversed or disputed."
          },
          {
            id: "why-it-matters",
            title: "Why Monitoring Protects Everyone",
            content: "Platform monitoring protects all users, not just those directly targeted by fraud. When a scammer is identified and removed from the platform, every potential victim is protected.\n\nMonitoring also helps CryptoBazaar identify emerging scam techniques early. As fraudsters develop new methods, pattern detection helps the platform respond before significant damage occurs.\n\nThe data from monitoring activities helps CryptoBazaar improve its security measures continuously. Each detected fraud attempt provides insights that strengthen the platform's defences for all users."
          },
          {
            id: "user-impact",
            title: "Impact on Legitimate Users",
            content: "CryptoBazaar's monitoring systems are designed to operate transparently without impacting legitimate trading activity. The vast majority of users will never notice these systems working in the background.\n\nIn rare cases, a legitimate account may be flagged for review due to unusual but genuine activity. If this happens, cooperate with the verification request. These reviews are resolved quickly once the account holder confirms their identity and activity.\n\nMonitoring is not surveillance. CryptoBazaar does not monitor private communications or personal data beyond what is necessary for fraud prevention and regulatory compliance."
          }
        ]
      },
      {
        id: "platform-rules",
        title: "7.5 Understanding Platform Rules",
        shortDesc: "The key rules and policies that all CryptoBazaar users must follow for a safe trading experience.",
        sections: [
          {
            id: "core-rules",
            title: "Core Platform Rules",
            content: "CryptoBazaar's platform rules are designed to create a fair and safe trading environment. The most important rules include: all users must complete KYC verification before trading, payments must come from accounts matching the user's verified identity, and all trade communication must happen through the platform.\n\nUsers must not engage in market manipulation, price fixing, or coordinated trading schemes. Each user may maintain only one account on the platform. Creating multiple accounts to circumvent restrictions or manipulate the system is prohibited."
          },
          {
            id: "consequences",
            title: "Consequences of Violations",
            content: "Violations of platform rules result in consequences proportional to the severity of the offence. Minor first-time violations may result in a warning. Repeated violations lead to temporary account suspension.\n\nSerious violations such as confirmed fraud, identity theft, or money laundering result in permanent account bans. In cases of criminal activity, CryptoBazaar cooperates with law enforcement and shares relevant information as required by law.\n\nUsers who are permanently banned cannot create new accounts. The platform maintains records to prevent banned users from returning under new identities."
          },
          {
            id: "reporting",
            title: "How to Report Violations",
            content: "If you observe another user violating platform rules, report them through CryptoBazaar's reporting system. Provide specific details about the violation, including trade IDs, screenshots, and any other relevant evidence.\n\nReports are reviewed by the security team and investigated thoroughly. You will receive a notification about the outcome of your report once the investigation is complete.\n\nReporting violations helps maintain the integrity of the platform for all users. Even if a violation did not directly affect you, reporting it can prevent harm to other community members."
          }
        ]
      }
    ]
  },
  {
    id: "disputes-support",
    title: "8. Disputes & Support",
    articles: [
      {
        id: "how-disputes-resolved",
        title: "8.1 How Disputes Are Resolved",
        shortDesc: "The complete dispute resolution process on CryptoBazaar from filing to final decision.",
        sections: [
          {
            id: "when-disputes-occur",
            title: "When Disputes Occur",
            content: "Disputes can be raised during an active trade when either party believes the trade cannot be completed normally. Common scenarios include the buyer claiming to have paid but the seller not seeing the payment, the seller refusing to release escrow despite confirmed payment, disagreements about the payment amount, or suspected fraudulent activity.\n\nEither party can raise a dispute by clicking the Raise Dispute button on the active trade page. Once a dispute is raised, the escrowed crypto is locked until the dispute is resolved. Neither party can cancel the trade or release escrow during an active dispute."
          },
          {
            id: "process",
            title: "The Resolution Process",
            content: "Once a dispute is raised, both parties are notified and asked to submit evidence supporting their position. CryptoBazaar's support team reviews the evidence from both sides, including payment confirmations, bank statements, chat logs, and any other relevant documentation.\n\nThe support team may request additional information from either party during the investigation. Cooperate promptly with any requests for information, as delays can extend the resolution timeline.\n\nAfter reviewing all evidence, the team makes a decision. The escrowed crypto is either released to the buyer (if payment is confirmed) or returned to the seller (if payment cannot be verified). Both parties receive a detailed explanation of the decision."
          },
          {
            id: "timelines",
            title: "Resolution Timelines",
            content: "Most disputes are resolved within 24 to 48 hours. Simple cases where evidence clearly supports one party may be resolved faster. Complex cases involving ambiguous evidence, banking delays, or multiple parties may take longer.\n\nDuring the resolution period, both parties should remain available and responsive to requests for additional information. Unresponsive parties may have the dispute resolved against them due to insufficient evidence.\n\nThe decision made by CryptoBazaar's support team is final for the purpose of the trade. If either party believes the decision was made in error, they can appeal through the support system with new evidence."
          }
        ]
      },
      {
        id: "evidence-required",
        title: "8.2 Evidence Required for Disputes",
        shortDesc: "What evidence to collect and submit when filing a dispute to maximize your chances of a favourable resolution.",
        sections: [
          {
            id: "essential-evidence",
            title: "Essential Evidence",
            content: "The most important evidence in a P2P trading dispute is the bank transaction record. This should be a screenshot or export from your banking app or net banking portal showing the transaction details including the amount, date, time, sender name, receiver name, and transaction reference number.\n\nFor buyers, this proves that payment was made to the correct account for the correct amount. For sellers, checking their bank statement confirms whether a payment was actually received.\n\nPlatform chat logs are automatically available to the support team, but you can highlight specific messages that are relevant to the dispute."
          },
          {
            id: "supporting-evidence",
            title: "Supporting Evidence",
            content: "Additional evidence that strengthens your case includes full bank statements showing the transaction in context (not just a single transaction screenshot), UTR or transaction reference numbers that can be independently verified, and screenshots of any error messages or issues encountered during the trade.\n\nIf the dispute involves a payment amount discrepancy, provide evidence showing the exact amount that was sent or received.\n\nIf the dispute involves a suspected scam, document any suspicious behaviour such as requests to communicate outside the platform, pressure tactics, or conflicting information from the other party."
          },
          {
            id: "tips",
            title: "Tips for Strong Evidence",
            content: "Submit evidence as soon as possible after raising the dispute. Fresh evidence is more compelling and easier to verify than evidence collected days later.\n\nEnsure screenshots are clear and complete. Partial screenshots or blurry images may not be accepted as sufficient evidence.\n\nDo not alter or edit any evidence. Submitting manipulated evidence is a serious violation and can result in the dispute being resolved against you and potential account suspension.\n\nProvide context for your evidence. A brief explanation of what each piece of evidence shows helps the support team understand your case quickly."
          }
        ]
      },
      {
        id: "during-investigation",
        title: "8.3 What Happens During an Investigation",
        shortDesc: "Understanding the investigation process and what to expect when a dispute is being reviewed.",
        sections: [
          {
            id: "initial-review",
            title: "Initial Review",
            content: "When a dispute is raised, CryptoBazaar's support team first reviews the trade details and the initial evidence submitted by both parties. The team verifies the trade parameters including the agreed amount, payment method, and the identities of both parties.\n\nDuring the initial review, the team may contact both parties for clarification or additional evidence. Respond to these requests promptly, as delays can extend the investigation timeline."
          },
          {
            id: "investigation",
            title: "The Investigation Process",
            content: "The investigation involves cross-referencing the evidence from both parties. The team verifies payment claims against bank records, checks for consistency in the information provided, and reviews the platform chat history for relevant context.\n\nIn some cases, the team may need to verify information with banking institutions or payment processors. This is particularly relevant for disputes involving payment reversals or alleged unauthorized transactions.\n\nThe investigation is conducted impartially. The team's goal is to determine the facts of the case based on evidence, not to favour either party."
          },
          {
            id: "during-investigation",
            title: "What to Do During the Investigation",
            content: "While the investigation is in progress, do not attempt to resolve the trade outside the dispute process. Do not make additional payments, and do not communicate with the other party about the dispute through channels outside the platform.\n\nBe patient but responsive. The support team is working through disputes in the order they are received, and complex cases may require additional time.\n\nIf you have new information or evidence that becomes available during the investigation, submit it through the dispute interface. New evidence can be important for resolving the case accurately."
          }
        ]
      },
      {
        id: "report-suspicious",
        title: "8.4 How to Report Suspicious Activity",
        shortDesc: "Steps to report suspicious users, messages, or behaviour on CryptoBazaar to protect yourself and others.",
        sections: [
          {
            id: "what-to-report",
            title: "What Should Be Reported",
            content: "Report any activity that appears fraudulent, deceptive, or in violation of platform rules. This includes users who send fake payment screenshots, request communication outside the platform, pressure you to release escrow without proper verification, or attempt to use third-party payments.\n\nAlso report users who impersonate CryptoBazaar staff, create multiple accounts, post misleading trade listings, or engage in any behaviour that seems designed to defraud other users.\n\nIf you receive suspicious messages through any channel claiming to be from CryptoBazaar (social media, WhatsApp, Telegram), report these as potential phishing or impersonation attempts."
          },
          {
            id: "how-to-report",
            title: "How to File a Report",
            content: "To report suspicious activity on CryptoBazaar, use the Report button available on the user's profile or within the trade interface. Provide a clear description of the suspicious activity and attach any supporting evidence.\n\nInclude specific details such as the trade ID (if applicable), the exact behaviour that concerned you, and when it occurred. The more specific your report, the more effectively the security team can investigate.\n\nIf the suspicious activity involves an active trade, you can raise a dispute simultaneously to protect your funds while the report is investigated."
          },
          {
            id: "what-happens-next",
            title: "What Happens After Reporting",
            content: "After you submit a report, CryptoBazaar's security team reviews the information and investigates the reported account. Depending on the severity of the findings, actions may include issuing a warning, temporarily suspending the account, or permanently banning the user.\n\nYou will receive a notification about the outcome of your report. However, specific details about actions taken against other accounts may not be shared for privacy reasons.\n\nYour identity as the reporter is kept confidential. The reported user will not be informed of who filed the report."
          }
        ]
      },
      {
        id: "contact-support",
        title: "8.5 How to Contact Support",
        shortDesc: "All the ways to reach CryptoBazaar's support team and tips for getting the fastest resolution.",
        sections: [
          {
            id: "support-channels",
            title: "Available Support Channels",
            content: "CryptoBazaar provides support through multiple channels. The primary support channel is the in-platform support chat, which is available directly from your dashboard. This is the fastest way to reach the support team for trade-related issues.\n\nEmail support is available for non-urgent inquiries and account-related issues. Support emails are typically responded to within 24 hours during business days.\n\nFor urgent issues during active trades, the in-platform support chat provides the quickest response times."
          },
          {
            id: "getting-fast-help",
            title: "Tips for Getting Fast Help",
            content: "When contacting support, provide as much relevant information as possible upfront. Include your account email, the trade ID (if applicable), a clear description of the issue, and any supporting evidence.\n\nBe specific about what happened and what you need. Instead of saying there is a problem with your trade, explain exactly what went wrong, when it happened, and what you have already tried.\n\nAvoid sending multiple messages about the same issue. Each new message can reset your position in the support queue. If you need to add information, reply to your existing support conversation rather than starting a new one."
          },
          {
            id: "response-times",
            title: "Expected Response Times",
            content: "In-platform support chat responses are typically provided within minutes during business hours. During high-volume periods, response times may be longer.\n\nEmail support responses are provided within 24 hours on business days. Complex issues may require additional investigation time beyond the initial response.\n\nDispute-related support receives priority attention since these involve active trades with locked funds. If you are in an active dispute, use the dispute interface for the fastest response."
          }
        ]
      }
    ]
  },
  {
    id: "advanced-use-cases",
    title: "9. Advanced Use Cases",
    articles: [
      {
        id: "usdt-international-payments",
        title: "9.1 Using USDT for International Payments",
        shortDesc: "How to use USDT as an alternative to traditional banking for sending and receiving international payments.",
        sections: [
          {
            id: "why-usdt",
            title: "Why USDT for International Payments",
            content: "Traditional international wire transfers are slow, expensive, and often complicated. They typically involve correspondent banks, currency conversion fees, and processing times of 2 to 5 business days. USDT offers a faster and more cost-effective alternative.\n\nWith USDT, international transfers can be completed in minutes regardless of the amount. The sender converts their local currency to USDT, transfers it to the recipient's wallet, and the recipient converts it to their local currency. The entire process can be completed within hours rather than days.\n\nThis is particularly valuable for time-sensitive payments where waiting for a wire transfer to clear is not practical."
          },
          {
            id: "process",
            title: "How It Works",
            content: "To send an international payment using USDT, the sender first acquires USDT through a P2P platform like CryptoBazaar by paying in INR. The USDT is then sent to the recipient's crypto wallet address on the chosen network.\n\nThe recipient, located in another country, can then convert the USDT to their local currency through a local P2P platform or cryptocurrency exchange. The entire transaction settles in the time it takes to complete two P2P trades plus the blockchain transfer.\n\nFor regular international payments, such as monthly payments to a supplier or recurring freelancer payments, USDT provides a predictable and efficient transfer mechanism."
          },
          {
            id: "considerations",
            title: "Important Considerations",
            content: "While USDT offers significant advantages for international transfers, users should be aware of regulatory considerations in both the sending and receiving countries. Cryptocurrency regulations vary by jurisdiction, and it is your responsibility to ensure compliance with local laws.\n\nExchange rate fluctuations between INR and USD can affect the final amount received. While USDT maintains its dollar peg, the INR/USD rate may change between the time you buy USDT and the time the recipient converts it.\n\nKeep records of all international transfers for tax and regulatory compliance purposes. Many countries require reporting of foreign currency transactions above certain thresholds."
          }
        ]
      },
      {
        id: "stablecoins-freelancers",
        title: "9.2 Stablecoins for Freelancers",
        shortDesc: "How Indian freelancers can use USDT and USDC to receive international payments faster and cheaper.",
        sections: [
          {
            id: "receiving-payments",
            title: "Receiving International Payments",
            content: "Indian freelancers working with international clients often face challenges with traditional payment methods. Wire transfers are expensive, PayPal charges high fees and has unfavourable exchange rates, and platforms like Wise, while better, still involve intermediaries and processing delays.\n\nStablecoins offer freelancers a direct payment method. A client can send USDT or USDC directly to the freelancer's wallet address. The transfer is typically completed within minutes and costs a fraction of traditional payment methods.\n\nThe freelancer then converts the received stablecoins to INR through CryptoBazaar's P2P platform. The entire process from receiving payment to having INR in the bank account can be completed within a few hours."
          },
          {
            id: "benefits",
            title: "Benefits Over Traditional Methods",
            content: "The cost savings are significant. Traditional methods charge 3% to 7% in combined fees (transfer fees, currency conversion, intermediary charges). Stablecoin transfers cost less than 1 USD in network fees, plus CryptoBazaar's competitive trading spread.\n\nSpeed is another major advantage. Instead of waiting 3 to 5 business days for a wire transfer to clear, freelancers can receive and convert payments within the same day.\n\nStablecoins are also accessible 24/7, unlike banks that operate during business hours and may delay transfers over weekends and holidays. A freelancer can receive and convert a payment at any time."
          },
          {
            id: "best-practices",
            title: "Best Practices for Freelancers",
            content: "Set up a reliable crypto wallet and familiarize yourself with the transfer process before invoicing clients in USDT. Having a smooth system in place demonstrates professionalism.\n\nAsk clients to send payments on Polygon for the lowest fees, or on Tron for the widest compatibility. Provide clear instructions to clients who may be unfamiliar with crypto transfers.\n\nConvert received stablecoins to INR regularly rather than holding large balances. This minimizes your exposure to regulatory and market risks.\n\nMaintain detailed records of all payments received, including the client name, invoice number, USDT amount, conversion rate, and INR received. This documentation is essential for tax compliance."
          }
        ]
      },
      {
        id: "stablecoins-businesses",
        title: "9.3 Stablecoins for Businesses",
        shortDesc: "How small and medium businesses can leverage stablecoins for efficient international trade and payments.",
        sections: [
          {
            id: "business-use-cases",
            title: "Business Applications",
            content: "Small and medium businesses engaged in international trade can benefit significantly from stablecoin adoption. Common use cases include paying international suppliers, receiving payments from overseas customers, and settling cross-border invoices.\n\nFor businesses importing goods, stablecoins can streamline the payment process. Instead of navigating complex wire transfer procedures and waiting for multi-day settlement, businesses can send USDT directly to a supplier who accepts cryptocurrency.\n\nService-based businesses that provide digital services to international clients can invoice in USDT, reducing payment friction and speeding up cash flow."
          },
          {
            id: "cost-analysis",
            title: "Cost Comparison",
            content: "For a business making regular international payments, the cost savings from using stablecoins can be substantial. Consider a business that makes 10 international payments per month of 1,000 USD each.\n\nUsing traditional wire transfers at 30 USD per transfer plus 2% conversion fees, the monthly cost would be approximately 500 USD. Using stablecoins with network fees under 1 USD per transfer and CryptoBazaar's competitive rates, the monthly cost drops significantly.\n\nOver a year, these savings compound into meaningful amounts that can be reinvested in the business."
          },
          {
            id: "implementation",
            title: "Getting Started",
            content: "Businesses interested in using stablecoins should start with a small pilot program. Identify one or two international payment flows where stablecoins could replace traditional methods.\n\nSet up business accounts on CryptoBazaar and complete KYC verification. Ensure that your business's accounting system can track cryptocurrency transactions alongside traditional payments.\n\nCommunicate with your trading partners about accepting stablecoin payments. Many international businesses, particularly in the technology and e-commerce sectors, are already comfortable with crypto payments.\n\nConsult with a tax advisor about the implications of using stablecoins for business transactions. Proper tax treatment is essential for business compliance."
          }
        ]
      },
      {
        id: "cross-border-usdt",
        title: "9.4 Cross-Border Payments with USDT",
        shortDesc: "A practical guide to using USDT for cross-border money transfers as an alternative to traditional remittance services.",
        sections: [
          {
            id: "traditional-challenges",
            title: "Traditional Remittance Challenges",
            content: "Sending money internationally through traditional channels involves multiple intermediaries, each taking a cut. Banks, correspondent banks, and currency exchange services all add fees. The total cost can range from 3% to 10% of the transfer amount.\n\nProcessing times are another challenge. International wire transfers typically take 2 to 5 business days. During this time, neither the sender nor the recipient has access to the funds.\n\nAccessibility is also an issue. Not everyone has access to international wire transfer services, and many developing countries have limited banking infrastructure for receiving international payments."
          },
          {
            id: "usdt-advantage",
            title: "The USDT Advantage",
            content: "USDT transfers settle in minutes, regardless of the sending and receiving countries. A transfer from India to the Philippines, Nigeria, or any other country takes the same amount of time as a transfer within the same city.\n\nCosts are dramatically lower. A USDT transfer on Polygon costs less than 0.01 USD in network fees. Even on Tron, the most expensive of CryptoBazaar's supported networks, fees are only 1 to 3 USD regardless of the amount.\n\nUSDT is accessible to anyone with a smartphone and internet connection. The recipient does not need a bank account to receive USDT, making it particularly valuable for remittances to areas with limited banking access."
          },
          {
            id: "practical-guide",
            title: "How to Send Cross-Border Payments",
            content: "To send a cross-border payment, buy USDT on CryptoBazaar using INR. Send the USDT to the recipient's wallet address on your chosen network. The recipient can then convert the USDT to their local currency through a local P2P platform or exchange.\n\nBefore initiating the transfer, confirm with the recipient that they have a wallet capable of receiving USDT on the network you plan to use. Send the wallet address through a secure channel and verify it before sending.\n\nFor regular remittances, establish a routine. Set up the same wallets and networks for each transfer to minimize the risk of errors. Consider using Polygon for the lowest fees if both sides support it."
          }
        ]
      },
      {
        id: "high-volume-operation",
        title: "9.5 Managing a High-Volume Trading Operation",
        shortDesc: "Strategies and best practices for traders conducting frequent, large-value P2P trades on CryptoBazaar.",
        sections: [
          {
            id: "liquidity",
            title: "Liquidity Management",
            content: "High-volume traders need to maintain adequate liquidity in both USDT and INR to fulfill trades consistently. Running out of either means missed opportunities and potential cancellations that harm your trading reputation.\n\nDiversify your liquidity across multiple bank accounts if possible. This reduces the risk of a single bank account freeze affecting your entire operation.\n\nMonitor your available balance throughout the day and adjust your listings accordingly. If your USDT balance is running low, reduce your sell listings. If your INR balance is limited, scale back your buy orders."
          },
          {
            id: "operational-efficiency",
            title: "Operational Efficiency",
            content: "Develop standard operating procedures for every aspect of your trading operation. From payment verification to escrow release, having a consistent process reduces errors and speeds up trade completion.\n\nSet specific trading hours and communicate them through your listings. Being available and responsive during your stated trading hours builds trust and encourages repeat business.\n\nTrack your performance metrics including trade completion rate, average completion time, and feedback scores. Identifying trends in these metrics helps you optimize your operation."
          },
          {
            id: "risk-controls",
            title: "Risk Controls",
            content: "Implement strict risk controls as your trading volume grows. Set maximum trade sizes based on your risk tolerance and available liquidity. Review and adjust these limits regularly.\n\nMaintain detailed records of every trade for dispute resolution, tax compliance, and operational analysis. Use accounting software or spreadsheets to track your trading activity systematically.\n\nStay current with platform policies and regulatory developments. Changes in regulations or platform rules can impact high-volume trading operations more significantly than casual traders.\n\nConsider working with a financial advisor or accountant who understands cryptocurrency transactions. Proper financial management becomes increasingly important as trading volumes grow."
          }
        ]
      }
    ]
  },
  {
    id: "market-education",
    title: "10. Market Education",
    articles: [
      {
        id: "what-is-blockchain",
        title: "10.1 What Is Blockchain?",
        shortDesc: "A beginner-friendly explanation of blockchain technology and why it matters for cryptocurrency transactions.",
        sections: [
          {
            id: "basics",
            title: "Blockchain Basics",
            content: "A blockchain is a distributed digital ledger that records transactions across many computers in a way that makes it virtually impossible to alter or hack. Instead of storing data in a single location, blockchain distributes identical copies of the data across a network of computers called nodes.\n\nEach block in the chain contains a set of transactions. When a new block is created, it includes a cryptographic reference to the previous block, creating an unbreakable chain. This structure ensures that once a transaction is recorded, it cannot be modified without altering every subsequent block, which would require controlling more than half of the network.\n\nBlockchain technology was introduced in 2008 as the underlying technology for Bitcoin, but it has since been adopted for many other applications including stablecoins like USDT and USDC."
          },
          {
            id: "relevance",
            title: "Why Blockchain Matters for P2P Trading",
            content: "When you trade USDT or USDC on CryptoBazaar, the transfer of stablecoins happens on a blockchain. Understanding the basics of blockchain helps you understand why crypto transfers work the way they do.\n\nBlockchain provides transparency. Every transaction is publicly recorded and can be verified by anyone using a block explorer. When you send USDT, the transaction is visible on the blockchain within seconds.\n\nBlockchain provides security. Once a transaction is confirmed on the blockchain, it cannot be reversed or altered. This is why releasing crypto from escrow is final. There is no chargeback mechanism for blockchain transactions.\n\nBlockchain operates 24/7 without any downtime. Unlike banks that have business hours and maintenance windows, blockchain networks process transactions continuously."
          },
          {
            id: "different-blockchains",
            title: "Different Blockchains",
            content: "Multiple blockchains exist, each with different characteristics. CryptoBazaar supports three blockchains for stablecoin transfers: Tron, Polygon, and BNB Chain.\n\nEach blockchain operates independently with its own network of validators, its own native cryptocurrency for fees (TRX, POL, BNB), and its own transaction processing speed. The same USDT token exists on multiple blockchains simultaneously, and while the value is identical, the tokens on different chains cannot be directly interchanged without using a bridge.\n\nThis is why selecting the correct network is essential when transferring stablecoins. Sending USDT on Polygon to a Tron address will result in lost funds because these are separate, incompatible networks."
          }
        ]
      },
      {
        id: "what-is-crypto-wallet",
        title: "10.2 What Is a Crypto Wallet?",
        shortDesc: "Understanding crypto wallets, how they work, and why you need one for P2P trading.",
        sections: [
          {
            id: "what-is-wallet",
            title: "What Is a Crypto Wallet?",
            content: "A crypto wallet is a tool that allows you to store, send, and receive cryptocurrency. Despite the name, a wallet does not actually store your crypto. Your tokens exist on the blockchain. The wallet stores the private keys that give you access to your tokens on the blockchain.\n\nThink of it like your bank account. Your money exists in the bank's system, and your banking app gives you access to it. Similarly, your crypto exists on the blockchain, and your wallet gives you access to it through your private keys.\n\nWallets can be software applications (on your phone or computer) or hardware devices (physical devices designed specifically for storing private keys securely)."
          },
          {
            id: "types",
            title: "Types of Wallets",
            content: "Software wallets (also called hot wallets) are applications installed on your phone or computer. Examples include MetaMask, Trust Wallet, and TronLink. These are convenient for frequent trading because they are always accessible.\n\nHardware wallets (also called cold wallets) are physical devices like Ledger and Trezor. They store your private keys offline, making them much more resistant to hacking. Hardware wallets are recommended for storing large amounts of cryptocurrency that you do not need to access frequently.\n\nExchange wallets are wallets provided by cryptocurrency exchanges and platforms. When you hold USDT on CryptoBazaar, it is in the platform's custodial wallet. These are convenient but involve trusting the platform with your keys."
          },
          {
            id: "security",
            title: "Wallet Security",
            content: "Your wallet's security depends primarily on protecting your private key and seed phrase. The seed phrase (also called a recovery phrase) is a series of 12 or 24 words generated when you create a new wallet. This phrase can be used to recover your wallet on any device.\n\nNever share your seed phrase or private keys with anyone. Anyone who has your seed phrase has complete access to your wallet and can take all your funds. CryptoBazaar will never ask for your seed phrase.\n\nStore your seed phrase in a secure physical location, not digitally. Writing it on paper and keeping it in a safe place is more secure than storing it in a file on your computer or phone, which could be compromised by malware."
          }
        ]
      },
      {
        id: "custodial-vs-non-custodial",
        title: "10.3 Custodial vs Non-Custodial Wallets",
        shortDesc: "The key differences between custodial and non-custodial wallets and which type is right for your needs.",
        sections: [
          {
            id: "custodial",
            title: "Custodial Wallets",
            content: "A custodial wallet is one where a third party (such as an exchange or platform) holds your private keys on your behalf. When you hold USDT on CryptoBazaar or any cryptocurrency exchange, you are using a custodial wallet.\n\nThe advantage of custodial wallets is convenience. You do not need to manage private keys or seed phrases. If you forget your password, you can recover access through the platform's account recovery process.\n\nThe disadvantage is that you are trusting the platform with your funds. If the platform is hacked, goes bankrupt, or freezes your account, you may lose access to your crypto. The popular phrase in crypto is: not your keys, not your coins."
          },
          {
            id: "non-custodial",
            title: "Non-Custodial Wallets",
            content: "A non-custodial wallet gives you full control over your private keys. Examples include MetaMask, Trust Wallet, and hardware wallets. You and only you have access to your funds.\n\nThe advantage is complete ownership and control. No third party can freeze, seize, or access your funds. You are the sole controller of your crypto assets.\n\nThe disadvantage is full responsibility. If you lose your seed phrase or private keys, there is no customer support to help you recover your wallet. Lost keys mean permanently lost funds. You are also responsible for protecting your wallet from malware and phishing attacks."
          },
          {
            id: "which-to-use",
            title: "Which Should You Use?",
            content: "For active P2P trading on CryptoBazaar, the platform's custodial wallet is convenient and practical. Keep the USDT you plan to trade in your CryptoBazaar account for easy access.\n\nFor long-term storage or amounts you are not actively trading, transfer your USDT to a non-custodial wallet. This gives you full control over your assets.\n\nMany traders use both. They keep a trading balance on CryptoBazaar and move larger holdings to a personal wallet for safekeeping. This balances convenience with security.\n\nIf you use a non-custodial wallet, always verify you are sending to the correct network before withdrawing from CryptoBazaar."
          }
        ]
      },
      {
        id: "understanding-tx-hashes",
        title: "10.4 Understanding Transaction Hashes",
        shortDesc: "What transaction hashes are, how to read them, and how to use them to verify crypto transfers.",
        sections: [
          {
            id: "what-is-tx-hash",
            title: "What Is a Transaction Hash?",
            content: "A transaction hash (also called a transaction ID or TXID) is a unique identifier assigned to every transaction on a blockchain. It is a long string of letters and numbers that serves as a receipt for your transaction.\n\nEvery blockchain transaction, whether it is sending USDT, paying gas fees, or interacting with a smart contract, generates a unique transaction hash. No two transactions can have the same hash.\n\nOn Tron, transaction hashes look like a long string of alphanumeric characters. On Polygon and BNB Chain, they start with 0x followed by a 64-character hexadecimal string."
          },
          {
            id: "how-to-use",
            title: "How to Use Transaction Hashes",
            content: "Transaction hashes are your proof that a blockchain transaction occurred. After sending USDT, your wallet provides the transaction hash. You can share this hash with the recipient so they can verify the transfer independently.\n\nTo look up a transaction, copy the hash and paste it into the appropriate block explorer. For Tron, use Tronscan. For Polygon, use Polygonscan. For BNB Chain, use BscScan.\n\nThe block explorer shows the complete transaction details including the sender address, recipient address, amount transferred, network fee paid, timestamp, and confirmation status."
          },
          {
            id: "verification",
            title: "Verifying Transactions",
            content: "When verifying a transaction using its hash, check several details. Confirm that the recipient address matches the intended destination. Verify that the amount matches what was supposed to be sent. Check the status to ensure the transaction is confirmed, not pending or failed.\n\nIf someone provides you with a transaction hash as proof of payment, verify it on the block explorer yourself. Do not trust screenshots of block explorer pages, as these can be fabricated.\n\nKeep transaction hashes for all significant transfers as part of your personal records. They serve as permanent, verifiable proof that a transaction occurred."
          }
        ]
      },
      {
        id: "how-crypto-tx-work",
        title: "10.5 How Crypto Transactions Work",
        shortDesc: "A step-by-step explanation of what happens when you send or receive cryptocurrency.",
        sections: [
          {
            id: "initiation",
            title: "Transaction Initiation",
            content: "When you send USDT to another wallet, your wallet creates a transaction containing the recipient's address, the amount to send, and a digital signature created using your private key. This signature proves that you authorized the transaction without revealing your private key.\n\nThe transaction is then broadcast to the blockchain network. Nodes (computers running the blockchain software) receive the transaction and verify that it is valid. They check that your signature is correct, that you have sufficient balance, and that the transaction follows the network's rules."
          },
          {
            id: "confirmation",
            title: "Transaction Confirmation",
            content: "After validation, the transaction is included in a new block by a validator (or miner, depending on the blockchain's consensus mechanism). The block is added to the chain, and the transaction is considered confirmed.\n\nDifferent blockchains have different confirmation requirements. On Polygon, transactions are typically confirmed within a few seconds. On Tron, confirmation takes one to two minutes. On BNB Chain, blocks are produced every three seconds.\n\nOnce confirmed, the sender's balance is reduced and the recipient's balance is increased. This update is reflected across all nodes in the network simultaneously."
          },
          {
            id: "finality",
            title: "Transaction Finality",
            content: "Finality refers to the point at which a transaction is considered permanent and irreversible. Once a blockchain transaction reaches finality, it cannot be undone by anyone, including the sender, the recipient, or the network operators.\n\nThis is fundamentally different from traditional banking where transactions can be reversed through chargebacks, disputes, or bank interventions. On the blockchain, a confirmed transaction is permanent.\n\nFor P2P trading, this means that once escrow is released and the USDT is sent to the buyer, the transaction cannot be reversed. This is why payment verification before releasing escrow is so critical."
          }
        ]
      },
      {
        id: "beginners-guide",
        title: "10.6 Beginner's Guide to Digital Assets",
        shortDesc: "A comprehensive introduction to digital assets for newcomers to the cryptocurrency space.",
        sections: [
          {
            id: "what-are-digital-assets",
            title: "What Are Digital Assets?",
            content: "Digital assets are any assets that exist in a digital format and have value. In the cryptocurrency context, digital assets include cryptocurrencies like Bitcoin and Ethereum, stablecoins like USDT and USDC, and other tokens that exist on blockchain networks.\n\nUnlike traditional currencies which exist as physical bills and coins (in addition to digital bank records), cryptocurrencies exist only in digital form on blockchain networks. They can be owned, transferred, and traded without any physical representation.\n\nStablecoins, which are the primary focus of CryptoBazaar, are a subset of digital assets designed to maintain a stable value tied to a real-world currency like the US dollar."
          },
          {
            id: "getting-started",
            title: "Getting Started with Digital Assets",
            content: "If you are new to digital assets, start by understanding the basics. Learn about blockchain technology, how wallets work, and the difference between various types of cryptocurrencies. The articles in this knowledge base provide detailed explanations of all these topics.\n\nCreate an account on CryptoBazaar and complete the KYC verification process. This gives you access to the platform's P2P trading features with full security protections.\n\nStart with a small amount. Make your first USDT purchase for a modest amount to familiarize yourself with the trading process. Once you are comfortable with the mechanics, you can increase your trading amounts."
          },
          {
            id: "key-principles",
            title: "Key Principles for Beginners",
            content: "Security first. Protect your accounts with strong passwords and two-factor authentication. Never share your credentials or private keys with anyone.\n\nVerify before trusting. Whether it is verifying a payment before releasing escrow or verifying a wallet address before sending crypto, always double-check critical information.\n\nStart small and learn. Do not invest more than you can afford to lose, especially while you are still learning. Build your knowledge and confidence through experience with small transactions.\n\nStay informed. The cryptocurrency space evolves rapidly. Follow reputable sources for news and updates, and stay current with CryptoBazaar's platform updates and security recommendations.\n\nKeep records. From your very first transaction, maintain records of all your trading activity. This habit will serve you well for dispute resolution, tax compliance, and personal financial management."
          }
        ]
      }
    ]
  },
  {
    id: "terms-of-use",
    title: "11. Terms of Use",
    articles: [
      {
        id: "terms-important-notice",
        title: "11.0 Important Notice",
        shortDesc: "Critical information about the Member Protection Fund and how to interpret these Terms of Use.",
        sections: [
          {
            id: "important-notice",
            title: "Important Notice",
            content: "The Member Protection Fund described in Section 8 is a contractual service remedy for CryptoBazaar's screening failures - it is not an insurance product and is not regulated as such. Disbursements require proof that the freeze was caused by a failure in our vetting process (Section 8.4(e)), not merely that a freeze occurred. Payouts are discretionary and subject to fund availability. Please read Section 8 carefully.\n\nThese Terms of Use constitute the core legal contract between you and CryptoBazaar. By using the Platform, you agree to be bound by every provision contained in these Terms. If any section is unclear, contact legal@cryptobazaar.co.in before proceeding."
          }
        ]
      },
      {
        id: "terms-agreement",
        title: "11.1 Agreement to Terms",
        shortDesc: "By accessing or using CryptoBazaar, you agree to be bound by these Terms of Use.",
        sections: [
          {
            id: "binding-agreement",
            title: "Binding Agreement",
            content: "By accessing or using CryptoBazaar (\"the Platform\", \"we\", \"us\", \"our\"), you agree to be bound by these Terms of Use (\"Terms\"). If you do not agree, you must not use the Platform.\n\nThese Terms form a legally binding agreement between you and CryptoBazaar. By completing registration, you confirm that you have read, understood, and accepted these Terms in full."
          },
          {
            id: "updates",
            title: "Updates to These Terms",
            content: "We reserve the right to update these Terms at any time. Continued use of the Platform after changes are published constitutes acceptance of the revised Terms. We will notify active members of material changes via email or an in-app notice."
          }
        ]
      },
      {
        id: "terms-definitions",
        title: "11.2 Definitions",
        shortDesc: "Key terms and their meanings as used throughout these Terms of Use.",
        sections: [
          {
            id: "member-definitions",
            title: "Member and Trade Definitions",
            content: "**Verified Member** - A user who has successfully completed all three layers of verification: KYC, Enhanced Due Diligence (bank statement review), and the AI-scored questionnaire.\n\n**Trade** - A peer-to-peer transaction between a Verified Member seller and a Verified Member buyer, facilitated by the Platform's escrow smart contract.\n\n**Escrow Contract** - A self-executing smart contract deployed on a public blockchain that holds the seller's crypto until the trade is confirmed or resolved.\n\n**Membership Plan** - A monthly subscription (Starter, Trader, or Pro) that grants trading access and defines monthly volume limits."
          },
          {
            id: "technical-definitions",
            title: "Technical and Fund Definitions",
            content: "**Member Protection Fund (\"the Fund\")** - A voluntary, discretionary benefit pool funded by 0.75% of every completed trade, held in a separate on-chain contract. Not an insurance product.\n\n**UTR** - Unique Transaction Reference number issued by NPCI for every UPI, IMPS, or NEFT payment.\n\n**DID** - Decentralised Identifier created via Hyperledger Identus on behalf of each Verified Member to hold their verifiable credentials."
          }
        ]
      },
      {
        id: "terms-eligibility",
        title: "11.3 Eligibility",
        shortDesc: "Requirements you must meet to use CryptoBazaar.",
        sections: [
          {
            id: "eligibility-criteria",
            title: "Eligibility Criteria",
            content: "You may use CryptoBazaar only if all of the following are true:\n\n(a) You are a resident of India.\n\n(b) You are 18 years of age or older and have the legal capacity to enter into binding contracts.\n\n(c) You are not a politically exposed person (PEP) as defined under PMLA 2002, or if you are, you have disclosed this during verification.\n\n(d) You are not subject to any sanction, restriction, or prohibition under Indian law or any applicable international framework.\n\n(e) You are trading on your own behalf and not as an agent, nominee, or representative of any other person or entity.\n\n(f) Your use of the Platform does not violate any law or regulation applicable to you."
          },
          {
            id: "ongoing-eligibility",
            title: "Ongoing Eligibility",
            content: "Verification of eligibility is ongoing. If your circumstances change such that you no longer meet these criteria, you must immediately cease trading and notify us at support@cryptobazaar.co.in."
          }
        ]
      },
      {
        id: "terms-registration",
        title: "11.4 Account Registration and Verification",
        shortDesc: "How accounts are created and the three-layer verification process required before trading.",
        sections: [
          {
            id: "registration",
            title: "4.1 Registration",
            content: "You must sign in via Google OAuth to create an account. You are responsible for all activity under your account. You must not share your account credentials or access with any other person."
          },
          {
            id: "three-layer-verification",
            title: "4.2 Three-Layer Verification",
            content: "Before trading, you must complete:\n\n**Layer 1 (KYC):** Identity verification via Didit using Aadhaar, PAN, and a liveness check.\n\n**Layer 2 (EDD):** Upload of 6 months of bank statements, analysed by our ML system for red flags.\n\n**Layer 3 (AI Questionnaire):** A 10-question online interview scored by AI.\n\nAll three layers must pass for Verified Member status to be granted."
          },
          {
            id: "wallet-binding",
            title: "4.3 Wallet Binding",
            content: "You must connect a cryptocurrency wallet. This wallet address is permanently bound to your account. If you change your wallet, all verification credentials are invalidated and you must restart the full verification process. This policy exists because wallet history is a key component of risk assessment."
          },
          {
            id: "credential-validity",
            title: "4.4 Credential Validity",
            content: "Verification credentials expire after 6 months. You must renew all three layers to continue trading. Failure to renew results in trading access being suspended until renewal is complete."
          },
          {
            id: "accuracy",
            title: "4.5 Accuracy of Information",
            content: "You represent that all information provided during registration and verification is true, accurate, and complete. Providing false, misleading, or fraudulent information is a serious breach of these Terms and may result in permanent suspension and reporting to relevant authorities."
          }
        ]
      },
      {
        id: "terms-membership",
        title: "11.5 Membership Plans",
        shortDesc: "Available membership tiers, pricing, volume caps, and refund policies.",
        sections: [
          {
            id: "plan-tiers",
            title: "5.1 Plan Tiers",
            content: "Access to trading requires an active Membership Plan:\n\n**Starter:** Rs. 200/month, Rs. 5,00,000 monthly trade cap\n\n**Trader:** Rs. 500/month, Rs. 20,00,000 monthly trade cap\n\n**Pro:** Rs. 1,000/month, no trade cap"
          },
          {
            id: "payment",
            title: "5.2 Payment",
            content: "Membership fees are currently collected via UPI transfer to our registered business account. Payment instructions are provided after verification is complete. Plans are month-to-month. No automatic renewals occur without your explicit confirmation and payment."
          },
          {
            id: "cap-enforcement",
            title: "5.3 Cap Enforcement",
            content: "Your cumulative INR trade volume within a billing month is tracked. When you approach your cap, you will be notified. If you reach it, new trades are blocked until the next billing cycle or you upgrade your plan."
          },
          {
            id: "refunds",
            title: "5.4 Refunds",
            content: "Membership fees are non-refundable once a billing period has begun, unless we are unable to provide access to the Platform for more than 72 consecutive hours due to a fault on our side. Any refund requests must be submitted to support@cryptobazaar.co.in within 7 days of the fee being paid."
          },
          {
            id: "mpf-eligibility",
            title: "5.5 Member Protection Fund Eligibility",
            content: "An active Membership Plan at the time of a trade is a prerequisite for eligibility to request a disbursement from the Member Protection Fund. A lapsed subscription at the time of the relevant trade disqualifies a claim."
          }
        ]
      },
      {
        id: "terms-trade-rules",
        title: "11.6 Trade Rules and Escrow",
        shortDesc: "How trades work, escrow mechanics, payment and confirmation windows, and platform role.",
        sections: [
          {
            id: "pre-trade-checks",
            title: "6.1 Pre-Trade Checks",
            content: "Before any trade begins, the Platform verifies:\n\n(a) Both parties are Verified Members with valid, unexpired credentials.\n\n(b) Both parties have active Membership Plans.\n\n(c) Both wallet addresses pass Nominis on-chain screening (checked against known mixers, hacked wallets, darknet markets, and sanctioned addresses).\n\nIf any check fails, the trade is blocked. The reason is shown to the affected party."
          },
          {
            id: "escrow-mechanics",
            title: "6.2 Escrow Mechanics",
            content: "When a trade is initiated:\n\n(a) A smart contract is deployed on the relevant blockchain.\n\n(b) The seller deposits crypto into the escrow contract.\n\n(c) From this point, neither party can cancel the trade without going through the Platform's resolution process.\n\n(d) The buyer sends INR directly to the seller's bank account via UPI, IMPS, or NEFT."
          },
          {
            id: "payment-window",
            title: "6.3 Payment Window",
            content: "The buyer has 30 minutes from trade initiation to submit payment and enter the UTR number. If this window expires without payment being marked, the trade is cancelled automatically and the crypto is returned to the seller."
          },
          {
            id: "confirmation-window",
            title: "6.4 Confirmation Window",
            content: "Once the buyer marks \"I have paid\", the seller has 15 minutes to:\n\n(a) Confirm receipt - the smart contract releases crypto to the buyer, and 0.75% is sent to the Member Protection Fund contract; or\n\n(b) Raise a dispute - the trade enters dispute resolution.\n\nIf the seller does not respond within 15 minutes, the trade automatically escalates to dispute resolution."
          },
          {
            id: "irreversibility",
            title: "6.5 Irreversibility",
            content: "Once the buyer has marked payment, the seller cannot cancel the trade. This is a deliberate design choice to protect buyers against the most common P2P fraud - a seller cancelling after receiving funds."
          },
          {
            id: "platform-role",
            title: "6.6 Platform Role",
            content: "CryptoBazaar is a technology facilitator. We do not process, hold, or control INR payments between parties. We do not hold custody of crypto at any point during a trade. The smart contract operates independently on the public blockchain."
          }
        ]
      },
      {
        id: "terms-dispute-resolution",
        title: "11.7 Dispute Resolution",
        shortDesc: "How disputes are triggered, investigated, and resolved, including evidence requirements and finality.",
        sections: [
          {
            id: "when-dispute-arises",
            title: "7.1 When a Dispute Arises",
            content: "A dispute is triggered when:\n\n(a) The seller raises a dispute after the buyer marks payment.\n\n(b) The seller fails to respond within the 15-minute confirmation window.\n\n(c) Either party raises a formal complaint within 24 hours of a trade expiring."
          },
          {
            id: "evidence-submission",
            title: "7.2 Evidence Submission",
            content: "Both parties are given 24 hours to submit evidence:\n\n- Bank statements covering the date of the trade (PDF).\n- Any additional context.\n\nScreenshots are accepted as supplementary context only. Bank statements are the primary evidence."
          },
          {
            id: "tampering-detection",
            title: "7.3 Tampering Detection",
            content: "All submitted PDFs are run through Perfios/Authbridge for:\n\n- PDF metadata validation.\n- Digital signature verification.\n- Anomaly detection (font inconsistencies, image layers over text, known manipulation patterns).\n\nSubmitting a tampered or forged document results in immediate ruling against that party, permanent suspension, and may result in a criminal complaint being filed. All users are Aadhaar-linked and fully identified."
          },
          {
            id: "cross-reference",
            title: "7.4 Cross-Reference Analysis",
            content: "A genuine payment appears on both parties' bank statements. The Platform's compliance team cross-references the buyer's debit against the seller's credit. The UTR provides an additional reference point. The outcome is almost always unambiguous from bank data alone."
          },
          {
            id: "ruling-execution",
            title: "7.5 Ruling and Execution",
            content: "The compliance team issues a ruling:\n\n**Payment confirmed:** crypto released to buyer via smart contract.\n\n**Payment not confirmed:** crypto returned to seller via smart contract.\n\nThe losing party's account is flagged. A second dispute loss within 12 months results in permanent suspension."
          },
          {
            id: "finality",
            title: "7.6 Finality",
            content: "Dispute rulings are final. If you believe a ruling was made in error, you may appeal in writing to disputes@cryptobazaar.co.in within 7 days. Appeals are reviewed by a senior compliance officer. The appeal decision is final."
          }
        ]
      },
      {
        id: "terms-member-protection-fund",
        title: "11.8 Member Protection Fund",
        shortDesc: "The Fund's nature, construction, eligibility criteria, disbursement tiers, anti-abuse rules, and limitations.",
        sections: [
          {
            id: "nature-of-fund",
            title: "8.1 Nature of the Fund",
            content: "The Member Protection Fund (\"the Fund\") is a voluntary, discretionary benefit available to eligible Verified Members.\n\n**THE FUND IS NOT AN INSURANCE PRODUCT. IT IS NOT REGULATED AS ONE. IT DOES NOT CONSTITUTE A FINANCIAL GUARANTEE, POLICY, OR CONTRACT OF INDEMNITY. PAYOUTS FROM THE FUND ARE NOT GUARANTEED.**"
          },
          {
            id: "fund-construction",
            title: "8.2 Fund Construction",
            content: "0.75% of the value of every completed trade is automatically transferred from the escrow contract to the Fund contract at settlement. The Fund is held on-chain. CryptoBazaar cannot spend it without multisig approval from a minimum of 3 of 5 designated signatories."
          },
          {
            id: "nature-of-disbursements",
            title: "8.3 Nature of Disbursements",
            content: "Disbursements from the Fund are a contractual service remedy under the Indian Contract Act, 1872 (Sections 73-74) for CryptoBazaar's failure to deliver the service it promised - namely, that every counterparty on the Platform has been adequately screened. A disbursement is compensation for our screening failure, not a payment for an external risk event. The Fund does not operate as an insurance pool."
          },
          {
            id: "eligibility-criteria",
            title: "8.4 Eligibility to Request a Disbursement",
            content: "All five conditions must be satisfied:\n\n(a) You had an active Membership Plan at the time of the trade that caused the freeze.\n\n(b) You had valid (unexpired) EDD and KYC credentials at the time of the trade.\n\n(c) The trade was executed through CryptoBazaar's escrow smart contract - on-chain verifiable.\n\n(d) The bank freeze is directly and demonstrably attributable to that specific CryptoBazaar trade, evidenced by a police notice or official bank freeze letter citing the transaction.\n\n(e) The freeze is attributable to a failure in CryptoBazaar's vetting process - specifically, that the counterparty to your trade was admitted to the Platform despite posing an identifiable risk that our screening should have caught. Freezes resulting from events unrelated to our screening failure are not eligible."
          },
          {
            id: "disbursement-tiers",
            title: "8.5 Disbursement Tiers",
            content: "Subject to fund availability and approval:\n\n**Emergency:** Up to Rs. 10,000 within 24 hours. Requires: freeze notice + FIR/complaint number.\n\n**Standard:** Up to Rs. 1,00,000 within 7 days. Requires: above + proof of legal representation.\n\n**Full:** Up to Rs. 5,00,000 within 30 days. Requires: above + account unfrozen or NOC issued.\n\nDisbursement amounts are subject to the Fund's available balance at the time of approval. If the Fund cannot cover the full approved amount, a partial disbursement may be made."
          },
          {
            id: "anti-abuse",
            title: "8.6 Anti-Abuse Rules",
            content: "Maximum 2 disbursement requests per member per 12-month period.\n\nA 90-day waiting period applies from the date of becoming a Verified Member before a first request may be submitted. This prevents \"join-and-claim\" abuse.\n\nAll requests are cross-checked against on-chain trade records. No on-chain trade record means no disbursement.\n\nFraudulent disbursement requests (fabricated freeze notices, false information) result in permanent suspension and may result in criminal complaint."
          },
          {
            id: "scope-limitations",
            title: "8.7 Scope Limitations",
            content: "The Fund does not cover:\n\n- Losses from cryptocurrency price movements.\n- Bank freezes caused by transactions unrelated to CryptoBazaar.\n- Bank freezes where CryptoBazaar's vetting process functioned correctly and the risk was undetectable by reasonable screening methods.\n- Losses from your own negligence (e.g., sharing private keys, trading outside the Platform).\n- Tax liabilities arising from your trading activity.\n- Events of force majeure."
          },
          {
            id: "no-fiduciary",
            title: "8.8 No Fiduciary Duty",
            content: "CryptoBazaar's administration of the Fund does not create a fiduciary duty, trust relationship, or any other special duty of care beyond what is expressly set out in these Terms."
          }
        ]
      },
      {
        id: "terms-prohibited-activities",
        title: "11.9 Prohibited Activities",
        shortDesc: "Activities that are strictly prohibited on CryptoBazaar and their consequences.",
        sections: [
          {
            id: "prohibited-list",
            title: "Prohibited Activities",
            content: "You must not use CryptoBazaar for any of the following:\n\n(a) Money laundering or any activity that violates the Prevention of Money Laundering Act (PMLA) 2002 or any successor legislation.\n\n(b) Tax evasion or concealment of taxable income or assets.\n\n(c) Financing of terrorism or any activities prohibited under the Unlawful Activities (Prevention) Act.\n\n(d) Trading on behalf of sanctioned individuals, entities, or jurisdictions.\n\n(e) Using another person's identity, bank account, or wallet without their knowledge and consent.\n\n(f) Manipulating trade outcomes - including submitting false UTRs, fabricating bank statements, or coordinating with a counterparty to deceive the Platform.\n\n(g) Circumventing verification checks through technical means or third-party services.\n\n(h) Posting listings for assets other than those supported by the Platform.\n\n(i) Any other activity that is illegal under Indian law or any law applicable to you."
          },
          {
            id: "consequences",
            title: "Consequences of Violation",
            content: "Violation of any of the above results in immediate suspension, forfeiture of any funds held in active escrow contracts to the relevant authorities, and reporting to law enforcement where required."
          }
        ]
      },
      {
        id: "terms-intellectual-property",
        title: "11.10 Intellectual Property",
        shortDesc: "Ownership of platform content and your data rights.",
        sections: [
          {
            id: "ip-rights",
            title: "Intellectual Property Rights",
            content: "All content, design, code, trade marks, and intellectual property on CryptoBazaar are owned by or licensed to us. You may not copy, reproduce, distribute, or create derivative works from any part of the Platform without our prior written consent.\n\nYou retain ownership of any data you provide (e.g., bank statements, trade history). By providing this data, you grant us a limited licence to process it for the purposes described in our Privacy Policy."
          }
        ]
      },
      {
        id: "terms-privacy",
        title: "11.11 Privacy and Data",
        shortDesc: "How CryptoBazaar collects, processes, and protects your personal data.",
        sections: [
          {
            id: "data-practices",
            title: "Data Collection and Processing",
            content: "We collect and process only the data necessary to operate the Platform. Key principles:\n\n**KYC data** (Aadhaar, PAN, biometric liveness) is processed via Didit and is never stored on CryptoBazaar servers. Only the resulting cryptographic credential is stored, on your DID.\n\n**Bank statement PDFs** are processed in-flight for ML scoring and discarded. We do not retain your statement.\n\n**We store:** your Google account identifier, wallet address, DID, onboarding status, trade history (on-chain), and subscription status.\n\n**We do not sell your data to third parties.**\n\nA full Privacy Policy is available at cryptobazaar.co.in/privacy. By using the Platform you consent to the data practices described therein."
          }
        ]
      },
      {
        id: "terms-disclaimers",
        title: "11.12 Disclaimers and Liability",
        shortDesc: "Platform warranties, liability limitations, and important disclaimers about risks.",
        sections: [
          {
            id: "as-is",
            title: "12.1 Platform Provided \"As-Is\"",
            content: "CryptoBazaar is provided without warranties of any kind, express or implied. We do not warrant that the Platform will be uninterrupted, error-free, or free from security vulnerabilities."
          },
          {
            id: "no-advice",
            title: "12.2 No Investment Advice",
            content: "Nothing on the Platform constitutes financial, investment, legal, or tax advice. Cryptocurrency prices are volatile. You trade at your own risk."
          },
          {
            id: "smart-contract-risk",
            title: "12.3 Smart Contract Risk",
            content: "While our escrow contracts are audited, blockchain software may contain bugs. We are not liable for losses caused by smart contract vulnerabilities that are not attributable to gross negligence on our part."
          },
          {
            id: "liability-cap",
            title: "12.4 Liability Cap",
            content: "To the maximum extent permitted by applicable law, our total liability to you for any claim arising from or related to these Terms or the Platform is limited to the membership fees paid by you in the 12 months preceding the event giving rise to the claim."
          },
          {
            id: "consequential-losses",
            title: "12.5 Consequential Losses",
            content: "We are not liable for any indirect, incidental, special, or consequential losses, including loss of profit, loss of data, or loss of opportunity, even if we have been advised of the possibility of such losses."
          }
        ]
      },
      {
        id: "terms-termination",
        title: "11.13 Termination",
        shortDesc: "How accounts can be closed by you or by CryptoBazaar, and the effects of termination.",
        sections: [
          {
            id: "by-you",
            title: "13.1 By You",
            content: "You may close your account at any time by contacting support@cryptobazaar.co.in. Outstanding active trades must be completed or resolved before closure. Membership fees for the current period are non-refundable."
          },
          {
            id: "by-us",
            title: "13.2 By Us",
            content: "We may suspend or permanently terminate your access if:\n\n(a) You breach any of these Terms.\n\n(b) Your verification credentials expire and are not renewed.\n\n(c) We are required to do so by applicable law or regulatory authority.\n\n(d) Your continued use presents a legal or reputational risk to the Platform.\n\nWhere termination is for breach, we are not required to give advance notice."
          },
          {
            id: "effect",
            title: "13.3 Effect of Termination",
            content: "On termination, your right to use the Platform ceases immediately. Any pending disbursement requests from the Fund that were submitted before termination will continue to be processed. Your on-chain trade history is immutable and remains on the blockchain regardless of account status."
          }
        ]
      },
      {
        id: "terms-governing-law",
        title: "11.14 Governing Law and Disputes",
        shortDesc: "Applicable law, arbitration procedures, and how legal disputes between you and CryptoBazaar are handled.",
        sections: [
          {
            id: "governing-law",
            title: "Governing Law",
            content: "These Terms are governed by and construed in accordance with the laws of India, without regard to its conflict of law principles."
          },
          {
            id: "arbitration",
            title: "Arbitration",
            content: "Any dispute, controversy, or claim arising from or relating to these Terms or the Platform shall first be attempted to be resolved through good-faith negotiation. If negotiation fails within 30 days, the matter shall be submitted to binding arbitration in accordance with the Arbitration and Conciliation Act, 1996. The seat of arbitration shall be India. Arbitration proceedings shall be conducted in English.\n\nNothing in this clause prevents either party from seeking urgent injunctive relief from a competent court."
          }
        ]
      },
      {
        id: "terms-contact",
        title: "11.15 Contact and Notices",
        shortDesc: "How to reach CryptoBazaar for support, disputes, and legal matters.",
        sections: [
          {
            id: "contact-details",
            title: "Contact Information",
            content: "For general support: support@cryptobazaar.co.in\n\nFor dispute appeals: disputes@cryptobazaar.co.in\n\nFor legal notices: legal@cryptobazaar.co.in\n\nNotices to us must be sent in writing to the legal email above. Notices to you will be sent to the email address linked to your Google account."
          }
        ]
      }
    ]
  },
  {
    id: "privacy-policy",
    title: "12. Privacy Policy",
    articles: [
      {
        id: "privacy-data-minimization",
        title: "12.1 Data Minimization Principles",
        shortDesc: "How CryptoBazaar's zero-custody architecture keeps your sensitive data safe by not storing it at all.",
        sections: [
          {
            id: "data-minimization",
            title: "Data Minimization Principles",
            content: "We believe that the safest way to store sensitive data is not to store it at all.\n\nUnlike traditional exchanges that maintain massive central databases of user identity files and bank transactions, CryptoBazaar uses a zero-custody data architecture. We only store the absolute bare minimum needed to verify eligibility, route trades, and settle disputes."
          }
        ]
      },
      {
        id: "privacy-identity-verification",
        title: "12.2 Identity Verification (Layer 1)",
        shortDesc: "How your Aadhaar, PAN, and biometric data is processed without ever touching CryptoBazaar servers.",
        sections: [
          {
            id: "identity-verification",
            title: "Identity Verification (Layer 1)",
            content: "Your identity verification (Aadhaar, PAN, and liveness face-match) is processed directly by Didit, our authorized identity verification partner.\n\nCryptoBazaar servers never see or store your raw Aadhaar card number, PAN card scan, or selfie biometric data. Didit verifies your documents, issues a cryptographic credential, and we bind this credential to your Decentralized Identifier (DID) stored locally in your browser and on-chain. We only know if you are verified or not."
          }
        ]
      },
      {
        id: "privacy-bank-statements",
        title: "12.3 Bank Statements (Layer 2)",
        shortDesc: "How your bank statements are processed in-memory for risk scoring and permanently deleted immediately after.",
        sections: [
          {
            id: "bank-statements",
            title: "Bank Statements (Layer 2)",
            content: "During the onboarding phase, you are required to upload 6 months of bank statement PDFs.\n\nThis data is processed in-memory by our Machine Learning parser to calculate your risk scoring and flag suspicious transaction patterns (like money-mule activity or shell accounts). Immediately after scoring, the PDF files are permanently deleted from our servers. We never write your statement documents to disk, and no human at CryptoBazaar reads them unless a dispute occurs."
          }
        ]
      },
      {
        id: "privacy-information-security",
        title: "12.4 Information Security",
        shortDesc: "The encryption and access control measures CryptoBazaar uses to protect your metadata.",
        sections: [
          {
            id: "security-measures",
            title: "Information Security",
            content: "We implement state-of-the-art security measures to protect your metadata:\n\n- All data in transit is encrypted using TLS 1.3.\n- All stored metadata (such as Google identifiers and wallet addresses) is encrypted at rest using AES-256.\n- Database access is restricted to essential microservices using IAM roles and private VPC routing."
          }
        ]
      }
    ]
  }
];

// ── HELPERS ──

/** Look up an article by its ID (used as URL slug). Returns the article and its parent category. */
export function getArticleBySlug(slug: string): { article: Article; category: ArticleCategory } | null {
  for (const category of ARTICLES_CATEGORIES) {
    const article = category.articles.find((a) => a.id === slug);
    if (article) return { article, category };
  }
  return null;
}

/** Return every article slug — used by generateStaticParams. */
export function getAllArticleSlugs(): string[] {
  return ARTICLES_CATEGORIES.flatMap((cat) => cat.articles.map((a) => a.id));
}

/** Find previous and next articles across all categories for navigation. */
export function getAdjacentArticles(slug: string): { prev: Article | null; next: Article | null } {
  const allArticles = ARTICLES_CATEGORIES.flatMap((cat) => cat.articles);
  const idx = allArticles.findIndex((a) => a.id === slug);
  if (idx === -1) return { prev: null, next: null };
  return {
    prev: idx > 0 ? allArticles[idx - 1] : null,
    next: idx < allArticles.length - 1 ? allArticles[idx + 1] : null,
  };
}
