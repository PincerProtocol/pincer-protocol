'use client'

import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { useWallet } from '@/hooks/useWallet'

export default function ConnectPage() {
  const { connect, connectors, error: connectError } = useConnect()
  const { disconnect } = useDisconnect()
  const { address, isConnected, pncrBalance } = useWallet()
  
  return (
    <div style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
      <h1>🔌 Wallet Connection Test</h1>
      
      {!isConnected ? (
        <div>
          <h2>Connect Your Wallet</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {connectors.map((connector) => (
              <button
                key={connector.id}
                onClick={() => connect({ connector })}
                style={{
                  padding: '1rem',
                  fontSize: '1.1rem',
                  cursor: 'pointer',
                  border: '2px solid #333',
                  borderRadius: '8px',
                  background: '#fff'
                }}
              >
                Connect {connector.name}
              </button>
            ))}
          </div>
          {connectError && (
            <div style={{ marginTop: '1rem', color: 'red' }}>
              Error: {connectError.message}
            </div>
          )}
        </div>
      ) : (
        <div>
          <h2>✅ Wallet Connected</h2>
          <div style={{ 
            background: '#f0f0f0', 
            padding: '1rem', 
            borderRadius: '8px',
            marginTop: '1rem'
          }}>
            <p><strong>Address:</strong> {address}</p>
            <p><strong>PNCR Balance:</strong> {pncrBalance} PNCR</p>
          </div>
          
          <button
            onClick={() => disconnect()}
            style={{
              marginTop: '1rem',
              padding: '0.75rem 1.5rem',
              fontSize: '1rem',
              cursor: 'pointer',
              border: '2px solid #d00',
              borderRadius: '8px',
              background: '#fff',
              color: '#d00'
            }}
          >
            Disconnect
          </button>
          
          <div style={{ marginTop: '2rem' }}>
            <h3>Next Steps:</h3>
            <ul>
              <li><a href="/souls/1">Go to Soul #1</a></li>
              <li><a href="/">Go to Homepage</a></li>
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}
