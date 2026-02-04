#!/bin/bash
# Pincer Protocol CLI Helper
# Usage: ./pincer-cli.sh <command> [args...]

API_URL="${PINCER_API_URL:-http://localhost:3000}"
WALLET="${AGENT_WALLET_ADDRESS:-}"

case "$1" in
  balance)
    ADDRESS="${2:-$WALLET}"
    if [ -z "$ADDRESS" ]; then
      echo "Error: No address provided. Set AGENT_WALLET_ADDRESS or provide address."
      exit 1
    fi
    curl -s "$API_URL/balance/$ADDRESS" | jq '.'
    ;;
    
  pay)
    RECEIVER="$2"
    AMOUNT="$3"
    MEMO="${4:-}"
    if [ -z "$RECEIVER" ] || [ -z "$AMOUNT" ]; then
      echo "Usage: pincer pay <receiver> <amount> [memo]"
      exit 1
    fi
    curl -s -X POST "$API_URL/escrow" \
      -H "Content-Type: application/json" \
      -d "{\"receiver\": \"$RECEIVER\", \"amount\": \"$AMOUNT\", \"memo\": \"$MEMO\"}" | jq '.'
    ;;
    
  confirm)
    TX_ID="$2"
    if [ -z "$TX_ID" ]; then
      echo "Usage: pincer confirm <txId>"
      exit 1
    fi
    curl -s -X POST "$API_URL/escrow/$TX_ID/confirm" | jq '.'
    ;;
    
  cancel)
    TX_ID="$2"
    if [ -z "$TX_ID" ]; then
      echo "Usage: pincer cancel <txId>"
      exit 1
    fi
    curl -s -X POST "$API_URL/escrow/$TX_ID/cancel" | jq '.'
    ;;
    
  status)
    TX_ID="$2"
    if [ -z "$TX_ID" ]; then
      echo "Usage: pincer status <txId>"
      exit 1
    fi
    curl -s "$API_URL/escrow/$TX_ID" | jq '.'
    ;;
    
  history)
    ADDRESS="${2:-$WALLET}"
    if [ -z "$ADDRESS" ]; then
      echo "Error: No address provided. Set AGENT_WALLET_ADDRESS or provide address."
      exit 1
    fi
    curl -s "$API_URL/agents/$ADDRESS/history" | jq '.'
    ;;
    
  health)
    curl -s "$API_URL/health" | jq '.'
    ;;
    
  *)
    echo "🦞 Pincer Protocol CLI"
    echo ""
    echo "Commands:"
    echo "  balance [address]              Check PNCR balance"
    echo "  pay <receiver> <amount> [memo] Create escrow payment"
    echo "  confirm <txId>                 Confirm escrow"
    echo "  cancel <txId>                  Cancel escrow"
    echo "  status <txId>                  Check escrow status"
    echo "  history [address]              View transaction history"
    echo "  health                         Check API health"
    echo ""
    echo "Environment:"
    echo "  PINCER_API_URL       API endpoint (default: http://localhost:3000)"
    echo "  AGENT_WALLET_ADDRESS Default wallet address"
    ;;
esac
